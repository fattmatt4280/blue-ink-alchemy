
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
    // Check environment variables first
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log("[CREATE-PAYMENT] Environment check:", { 
      hasStripeKey: !!stripeKey, 
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      stripeKeyPrefix: stripeKey ? stripeKey.substring(0, 7) : 'none'
    });

    if (!stripeKey) {
      console.error("[CREATE-PAYMENT] Missing STRIPE_SECRET_KEY");
      return new Response(JSON.stringify({ error: "Stripe configuration missing" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Parse request body with timeout
    console.log("[CREATE-PAYMENT] Parsing request body...");
    const body = await Promise.race([
      req.json(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 10000))
    ]);
    
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

    // Initialize Stripe with timeout
    console.log("[CREATE-PAYMENT] Initializing Stripe...");
    const stripe = new Stripe(stripeKey, { 
      apiVersion: "2023-10-16",
      timeout: 15000 // 15 second timeout
    });
    console.log("[CREATE-PAYMENT] Stripe initialized");

    // Create or find customer with better error handling
    console.log("[CREATE-PAYMENT] Looking for existing customer...");
    let customerId;
    
    try {
      const customers = await stripe.customers.list({ 
        email: shippingInfo.email, 
        limit: 1 
      });
      
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        console.log("[CREATE-PAYMENT] Found existing customer:", customerId);
      } else {
        console.log("[CREATE-PAYMENT] Creating new customer...");
        const customer = await stripe.customers.create({
          email: shippingInfo.email,
          name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          address: {
            line1: shippingInfo.address,
            city: shippingInfo.city,
            postal_code: shippingInfo.zipCode,
            country: 'US',
          },
        });
        customerId = customer.id;
        console.log("[CREATE-PAYMENT] Created new customer:", customerId);
      }
    } catch (customerError) {
      console.error("[CREATE-PAYMENT] Customer creation/lookup failed:", customerError);
      return new Response(JSON.stringify({ error: "Failed to process customer information" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Create line items with validation
    console.log("[CREATE-PAYMENT] Creating line items...");
    const lineItems = items.map((item, index) => {
      const unitAmount = Math.round((item.price || 0) * 100);
      console.log(`[CREATE-PAYMENT] Item ${index}: ${item.name} - $${item.price} (${unitAmount} cents)`);
      
      if (unitAmount <= 0) {
        throw new Error(`Invalid price for item: ${item.name}`);
      }
      
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

    // Create checkout session with comprehensive error handling
    const origin = req.headers.get("origin") || "https://eddfac78-1921-4963-ae88-c91f314935b4.lovableproject.com";
    
    console.log("[CREATE-PAYMENT] Creating Stripe session...");
    console.log("[CREATE-PAYMENT] Session config:", {
      customer: customerId,
      lineItemsCount: lineItems.length,
      mode: "payment",
      origin
    });

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: lineItems,
        mode: "payment",
        success_url: `${origin}/checkout?success=true`,
        cancel_url: `${origin}/checkout?cancelled=true`,
        shipping_address_collection: {
          allowed_countries: ['US'],
        },
        payment_method_types: ['card'],
        expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes from now
      });
      
      console.log(`[CREATE-PAYMENT] Stripe session created successfully: ${session.id}`);
    } catch (sessionError) {
      console.error("[CREATE-PAYMENT] Session creation failed:", {
        error: sessionError.message,
        type: sessionError.type,
        code: sessionError.code,
        param: sessionError.param
      });
      
      return new Response(JSON.stringify({ 
        error: "Failed to create checkout session", 
        details: sessionError.message 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Try to create order record (but don't fail if it doesn't work)
    if (supabaseUrl && supabaseServiceKey) {
      try {
        console.log("[CREATE-PAYMENT] Attempting to create order record...");
        const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, { 
          auth: { persistSession: false } 
        });

        const totalAmount = items.reduce((sum, item) => {
          return sum + ((item.price || 0) * (item.quantity || 1));
        }, 0) + 9.99;

        const { error: orderError } = await supabaseClient.from("orders").insert({
          email: shippingInfo.email,
          stripe_session_id: session.id,
          amount: Math.round(totalAmount * 100),
          shipping_info: shippingInfo,
          status: 'pending',
          is_guest: true,
          currency: 'usd'
        });

        if (orderError) {
          console.warn("[CREATE-PAYMENT] Order creation failed (continuing anyway):", orderError.message);
        } else {
          console.log("[CREATE-PAYMENT] Order record created successfully");
        }
      } catch (orderError) {
        console.warn("[CREATE-PAYMENT] Order creation failed (continuing anyway):", orderError.message);
      }
    }

    // Return success response
    console.log("[CREATE-PAYMENT] Success - returning checkout URL:", session.url);
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("[CREATE-PAYMENT] Critical error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return new Response(JSON.stringify({ 
      error: "Payment processing failed", 
      details: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
