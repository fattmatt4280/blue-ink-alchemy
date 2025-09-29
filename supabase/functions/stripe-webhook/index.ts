
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

    // For now, we'll process without webhook signature verification
    // In production, you should verify the webhook signature
    let event;
    try {
      event = JSON.parse(body);
      logStep("Event parsed successfully", { 
        type: event.type, 
        id: event.id,
        created: event.created 
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logStep("ERROR: Invalid JSON", { error: errorMessage });
      return new Response("Invalid JSON", { status: 400 });
    }

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
