
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Enhanced logging function
const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${timestamp} ${step}${detailsStr}`);
};

serve(async (req) => {
  logStep("Request started", { method: req.method, url: req.url });

  if (req.method === "OPTIONS") {
    logStep("OPTIONS request handled");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    logStep("Environment variables check", { 
      hasStripeKey: !!stripeKey, 
      hasSupabaseUrl: !!supabaseUrl, 
      hasServiceKey: !!supabaseServiceKey 
    });

    if (!stripeKey) {
      logStep("ERROR: Missing STRIPE_SECRET_KEY");
      return new Response("Missing Stripe configuration", { status: 500 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    logStep("Request details", { 
      bodyLength: body.length, 
      hasSignature: !!signature,
      headers: Object.fromEntries(req.headers.entries())
    });

    if (!signature) {
      logStep("ERROR: Missing stripe signature");
      return new Response("Missing signature", { status: 400 });
    }

    // Verify webhook signature for security
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!webhookSecret) {
      logStep("ERROR: Missing STRIPE_WEBHOOK_SECRET");
      return new Response("Webhook secret not configured", { 
        status: 500,
        headers: corsHeaders 
      });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook signature verified successfully", { 
        type: event.type, 
        id: event.id,
        created: event.created 
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logStep("ERROR: Webhook signature verification failed", { error: errorMessage });
      return new Response("Invalid signature", { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Helper function to generate activation codes
    const generateActivationCode = (): string => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = 'HLN-';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    // Heal-AId product price IDs
    const HEALYN_PRICE_IDS = {
      'price_1SF1DzDiBqghYX9iIMBbMSvu': 'free_trial',  // 3-day free
      'price_1SF1FqDiBqghYX9ixP0Ah8Dq': '7_day',       // 7-day $0.99
      'price_1SFEBWDiBqghYX9iLOPkqaBn': '30_day',      // 30-day $3.99
    };

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        logStep("Processing checkout session", { 
          sessionId: session.id, 
          paymentStatus: session.payment_status,
          customerEmail: session.customer_email,
          amountTotal: session.amount_total
        });
        
        if (supabaseUrl && supabaseServiceKey) {
          try {
            const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, { 
              auth: { persistSession: false } 
            });

            // First, find the order by session ID
            const { data: existingOrder, error: findError } = await supabaseClient
              .from("orders")
              .select("*")
              .eq('stripe_session_id', session.id)
              .single();

            if (findError) {
              logStep("ERROR: Order not found", { 
                sessionId: session.id, 
                error: findError.message 
              });
            } else {
              logStep("Found existing order", { 
                orderId: existingOrder.id, 
                currentStatus: existingOrder.status 
              });

              // Update the order status to 'paid'
              const { data: updatedOrder, error: updateError } = await supabaseClient
                .from("orders")
                .update({ 
                  status: 'paid',
                  updated_at: new Date().toISOString()
                })
                .eq('stripe_session_id', session.id)
                .select();

              if (updateError) {
                logStep("ERROR: Failed to update order", { 
                  sessionId: session.id, 
                  error: updateError.message 
                });
              } else {
                logStep("Order updated successfully", { 
                  orderId: existingOrder.id, 
                  newStatus: 'paid',
                  updatedOrder: updatedOrder?.[0] 
                });

                // Check for Heal-AId subscription products
                const stripeInstance = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
                const sessionDetails = await stripeInstance.checkout.sessions.retrieve(session.id, {
                  expand: ['line_items']
                });

                let healynTier: string | null = null;
                
                if (sessionDetails.line_items?.data) {
                  for (const item of sessionDetails.line_items.data) {
                    const priceId = item.price?.id;
                    if (priceId && HEALYN_PRICE_IDS[priceId]) {
                      healynTier = HEALYN_PRICE_IDS[priceId];
                      logStep("Heal-AId product detected", { priceId, tier: healynTier });
                      break;
                    }
                  }
                }

                // Generate activation code if Heal-AId product purchased
                if (healynTier) {
                  try {
                    let activationCode = generateActivationCode();
                    
                    // Ensure uniqueness
                    let { data: existingCode } = await supabaseClient
                      .from('healyn_activation_codes')
                      .select('code')
                      .eq('code', activationCode)
                      .single();

                    while (existingCode) {
                      activationCode = generateActivationCode();
                      const result = await supabaseClient
                        .from('healyn_activation_codes')
                        .select('code')
                        .eq('code', activationCode)
                        .single();
                      existingCode = result.data;
                    }

                    // Set code expiration to 90 days from now
                    const codeExpirationDate = new Date();
                    codeExpirationDate.setDate(codeExpirationDate.getDate() + 90);

                    // Insert activation code
                    const { error: codeInsertError } = await supabaseClient
                      .from('healyn_activation_codes')
                      .insert({
                        code: activationCode,
                        email: session.customer_email,
                        tier: healynTier,
                        code_expiration_date: codeExpirationDate.toISOString(),
                        redeemed: false,
                      });

                    if (codeInsertError) {
                      logStep("ERROR: Failed to create activation code", { error: codeInsertError.message });
                    } else {
                      logStep("Activation code created", { code: activationCode, tier: healynTier });

                      // Send activation code email
                      setTimeout(async () => {
                        try {
                          await fetch(`${supabaseUrl}/functions/v1/send-activation-code-email`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${supabaseServiceKey}`,
                            },
                            body: JSON.stringify({
                              email: session.customer_email,
                              code: activationCode,
                              tier: healynTier,
                              customerName: session.customer_details?.name,
                            }),
                          });
                          logStep("Activation code email sent", { code: activationCode });
                        } catch (emailError) {
                          const errorMessage = emailError instanceof Error ? emailError.message : String(emailError);
                          logStep("ERROR: Activation code email failed", { error: errorMessage });
                        }
                      }, 500);
                    }
                  } catch (codeError) {
                    const errorMessage = codeError instanceof Error ? codeError.message : String(codeError);
                    logStep("ERROR: Activation code generation failed", { error: errorMessage });
                  }
                }

                // Trigger automated post-sale workflow
                logStep("Triggering post-sale automation", { orderId: existingOrder.id });
                
                // Generate and send invoice
                setTimeout(async () => {
                  try {
                    await fetch(`${supabaseUrl}/functions/v1/generate-invoice`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${supabaseServiceKey}`,
                      },
                      body: JSON.stringify({ orderId: existingOrder.id }),
                    });
                    logStep("Invoice generation triggered", { orderId: existingOrder.id });
                  } catch (invoiceError) {
                    const errorMessage = invoiceError instanceof Error ? invoiceError.message : String(invoiceError);
                    logStep("ERROR: Invoice generation failed", { 
                      orderId: existingOrder.id, 
                      error: errorMessage
                    });
                  }
                }, 1000);

                // Send admin notification
                setTimeout(async () => {
                  try {
                    await fetch(`${supabaseUrl}/functions/v1/send-admin-notification`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${supabaseServiceKey}`,
                      },
                      body: JSON.stringify({ orderId: existingOrder.id }),
                    });
                    logStep("Admin notification sent", { orderId: existingOrder.id });
                  } catch (adminError) {
                    const errorMessage = adminError instanceof Error ? adminError.message : String(adminError);
                    logStep("ERROR: Admin notification failed", { 
                      orderId: existingOrder.id, 
                      error: errorMessage
                    });
                  }
                }, 1500);

                // Send order confirmation
                setTimeout(async () => {
                  try {
                    await fetch(`${supabaseUrl}/functions/v1/send-order-notifications`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${supabaseServiceKey}`,
                      },
                      body: JSON.stringify({ 
                        orderId: existingOrder.id,
                        notificationType: 'order_confirmation'
                      }),
                    });
                    logStep("Order confirmation sent", { orderId: existingOrder.id });
                  } catch (notificationError) {
                    const errorMessage = notificationError instanceof Error ? notificationError.message : String(notificationError);
                    logStep("ERROR: Order confirmation failed", { 
                      orderId: existingOrder.id, 
                      error: errorMessage
                    });
                  }
                }, 2000);

                // Auto-create shipping label if shipping info exists
                if (existingOrder.shipping_info) {
                  setTimeout(async () => {
                    try {
                      await fetch(`${supabaseUrl}/functions/v1/order-automation-workflow`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${supabaseServiceKey}`,
                        },
                        body: JSON.stringify({ 
                          orderId: existingOrder.id,
                          triggerStep: 'shipping'
                        }),
                      });
                      logStep("Shipping automation triggered", { orderId: existingOrder.id });
                    } catch (shippingError) {
                      const errorMessage = shippingError instanceof Error ? shippingError.message : String(shippingError);
                      logStep("ERROR: Shipping automation failed", { 
                        orderId: existingOrder.id, 
                        error: errorMessage
                      });
                    }
                  }, 3000);
                }
              }
            }
        } catch (dbError) {
            const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
            logStep("ERROR: Database error", { error: errorMessage });
          }
        } else {
          logStep("ERROR: Missing Supabase configuration", { 
            hasUrl: !!supabaseUrl, 
            hasServiceKey: !!supabaseServiceKey 
          });
        }
        break;
      
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        logStep("Payment intent succeeded", { 
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency
        });
        break;
      
      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[STRIPE-WEBHOOK] Error:", error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
