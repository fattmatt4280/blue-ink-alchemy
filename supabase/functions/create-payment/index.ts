
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log(`[CREATE-PAYMENT] Request started: ${req.method} ${req.url}`);

  if (req.method === "OPTIONS") {
    console.log("[CREATE-PAYMENT] OPTIONS request handled");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check environment variables
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log("[CREATE-PAYMENT] Environment check:", { 
      hasStripeKey: !!stripeKey, 
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey
    });

    if (!stripeKey) {
      console.error("[CREATE-PAYMENT] Missing STRIPE_SECRET_KEY");
      return new Response(JSON.stringify({ error: "Stripe configuration missing" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Parse request body
    const body = await req.json();
    console.log("[CREATE-PAYMENT] Request body parsed:", { 
      hasItems: !!body.items, 
      itemCount: body.items?.length,
      hasShippingInfo: !!body.shippingInfo
    });

    const { items, shippingInfo } = body;

    // Validate required data
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error("[CREATE-PAYMENT] Invalid items:", items);
      return new Response(JSON.stringify({ error: "Cart is empty" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!shippingInfo?.email) {
      console.error("[CREATE-PAYMENT] Missing email in shipping info");
      return new Response(JSON.stringify({ error: "Email is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    console.log("[CREATE-PAYMENT] Stripe initialized");

    // Create line items
    const lineItems = items.map((item) => {
      const unitAmount = Math.round((item.price || 0) * 100);
      console.log(`[CREATE-PAYMENT] Processing item: ${item.name} - $${item.price}`);
      
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name || "Product",
            images: item.image_url ? [item.image_url] : [],
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity || 1,
      };
    });

    // Add shipping
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Shipping",
        },
        unit_amount: 999, // $9.99 shipping
      },
      quantity: 1,
    });

    console.log(`[CREATE-PAYMENT] Created ${lineItems.length} line items`);

    // Create checkout session
    const origin = req.headers.get("origin") || "https://eddfac78-1921-4963-ae88-c91f314935b4.lovableproject.com";
    
    console.log("[CREATE-PAYMENT] Creating Stripe session...");
    const session = await stripe.checkout.sessions.create({
      customer_email: shippingInfo.email,
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/checkout?success=true`,
      cancel_url: `${origin}/checkout?cancelled=true`,
      automatic_tax: {
        enabled: true,
      },
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      customer_creation: 'always',
    });

    console.log(`[CREATE-PAYMENT] Stripe session created: ${session.id}`);

    // Try to create order record (but don't fail if it doesn't work)
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, { 
          auth: { persistSession: false } 
        });

        const totalAmount = items.reduce((sum, item) => {
          return sum + ((item.price || 0) * (item.quantity || 1));
        }, 0) + 9.99;

        await supabaseClient.from("orders").insert({
          email: shippingInfo.email,
          stripe_session_id: session.id,
          amount: Math.round(totalAmount * 100),
          shipping_info: shippingInfo,
          status: 'pending',
          is_guest: true,
          currency: 'usd'
        });

        console.log("[CREATE-PAYMENT] Order record created");
      } catch (orderError) {
        console.warn("[CREATE-PAYMENT] Order creation failed (continuing anyway):", orderError.message);
      }
    }

    // Return success response
    console.log("[CREATE-PAYMENT] Success - returning checkout URL");
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("[CREATE-PAYMENT] Critical error:", error.message, error.stack);
    
    return new Response(JSON.stringify({ 
      error: "Payment processing failed", 
      details: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
