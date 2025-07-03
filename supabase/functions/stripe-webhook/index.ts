
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log(`[STRIPE-WEBHOOK] Request started: ${req.method} ${req.url}`);

  if (req.method === "OPTIONS") {
    console.log("[STRIPE-WEBHOOK] OPTIONS request handled");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeKey) {
      console.error("[STRIPE-WEBHOOK] Missing STRIPE_SECRET_KEY");
      return new Response("Missing Stripe configuration", { status: 500 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.error("[STRIPE-WEBHOOK] Missing stripe signature");
      return new Response("Missing signature", { status: 400 });
    }

    // For now, we'll process without webhook signature verification
    // In production, you should verify the webhook signature
    let event;
    try {
      event = JSON.parse(body);
      console.log("[STRIPE-WEBHOOK] Event type:", event.type);
    } catch (err) {
      console.error("[STRIPE-WEBHOOK] Invalid JSON:", err);
      return new Response("Invalid JSON", { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log("[STRIPE-WEBHOOK] Checkout session completed:", session.id);
        
        if (supabaseUrl && supabaseServiceKey) {
          try {
            const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, { 
              auth: { persistSession: false } 
            });

            // Update the order status to 'paid'
            const { error: updateError } = await supabaseClient
              .from("orders")
              .update({ 
                status: 'paid',
                updated_at: new Date().toISOString()
              })
              .eq('stripe_session_id', session.id);

            if (updateError) {
              console.error("[STRIPE-WEBHOOK] Failed to update order:", updateError);
            } else {
              console.log("[STRIPE-WEBHOOK] Order updated successfully");
            }
          } catch (dbError) {
            console.error("[STRIPE-WEBHOOK] Database error:", dbError);
          }
        }
        break;
      
      case 'payment_intent.succeeded':
        console.log("[STRIPE-WEBHOOK] Payment succeeded:", event.data.object.id);
        break;
      
      default:
        console.log("[STRIPE-WEBHOOK] Unhandled event type:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("[STRIPE-WEBHOOK] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
