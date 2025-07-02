
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  logStep("Function started");

  if (req.method === "OPTIONS") {
    logStep("OPTIONS request handled");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check environment variables first
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not found");
      return new Response(JSON.stringify({ error: "Stripe configuration missing" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      logStep("ERROR: Supabase configuration missing");
      return new Response(JSON.stringify({ error: "Database configuration missing" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    logStep("Environment variables verified");

    // Parse request body
    let body;
    try {
      const rawBody = await req.text();
      logStep("Raw request body received", { length: rawBody.length });
      body = JSON.parse(rawBody);
      logStep("Request body parsed successfully", { 
        hasItems: !!body.items, 
        itemCount: body.items?.length,
        hasShippingInfo: !!body.shippingInfo
      });
    } catch (parseError) {
      logStep("ERROR: Failed to parse request body", { error: parseError.message });
      return new Response(JSON.stringify({ error: "Invalid request format" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { items, shippingInfo } = body;

    // Validate required data
    if (!items || !Array.isArray(items) || items.length === 0) {
      logStep("ERROR: Invalid items data", { items });
      return new Response(JSON.stringify({ error: "Cart is empty or invalid" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!shippingInfo?.email || !shippingInfo?.firstName || !shippingInfo?.lastName) {
      logStep("ERROR: Missing shipping information", { shippingInfo });
      return new Response(JSON.stringify({ error: "Shipping information incomplete" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Data validation passed");

    // Initialize Stripe
    let stripe;
    try {
      stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
      logStep("Stripe initialized successfully");
    } catch (stripeError) {
      logStep("ERROR: Failed to initialize Stripe", { error: stripeError.message });
      return new Response(JSON.stringify({ error: "Payment system initialization failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Create line items
    let lineItems;
    try {
      lineItems = items.map((item) => {
        const unitAmount = Math.round((item.price || 0) * 100);
        logStep("Processing item", { 
          itemId: item.id,
          itemName: item.name, 
          itemPrice: item.price,
          unitAmount,
          itemQuantity: item.quantity
        });
        
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

      logStep("Line items created", { count: lineItems.length });
    } catch (itemError) {
      logStep("ERROR: Failed to create line items", { error: itemError.message });
      return new Response(JSON.stringify({ error: "Failed to process cart items" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Create checkout session
    let session;
    try {
      const origin = req.headers.get("origin") || "https://eddfac78-1921-4963-ae88-c91f314935b4.lovableproject.com";
      
      const sessionData = {
        customer_email: shippingInfo.email,
        line_items: lineItems,
        mode: "payment" as const,
        success_url: `${origin}/checkout?success=true`,
        cancel_url: `${origin}/checkout?cancelled=true`,
        automatic_tax: {
          enabled: true,
        },
        shipping_address_collection: {
          allowed_countries: ['US'] as const,
        },
        customer_creation: 'always' as const,
        metadata: {
          order_type: 'cart_checkout',
        }
      };

      logStep("Creating Stripe session", { origin, email: shippingInfo.email });
      session = await stripe.checkout.sessions.create(sessionData);
      logStep("Stripe session created", { sessionId: session.id, url: session.url });
    } catch (stripeError) {
      logStep("ERROR: Failed to create Stripe session", { 
        error: stripeError.message,
        code: stripeError.code,
        type: stripeError.type
      });
      return new Response(JSON.stringify({ error: "Failed to create payment session" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Create order record (optional - don't fail if this doesn't work)
    try {
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
        logStep("WARNING: Failed to create order record", { error: orderError });
      } else {
        logStep("Order record created successfully");
      }
    } catch (orderError) {
      logStep("WARNING: Order creation failed but continuing", { error: orderError.message });
    }

    // Return success response
    const response = { url: session.url };
    logStep("Function completed successfully", response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logStep("CRITICAL ERROR in create-payment function", { 
      message: errorMessage, 
      stack: errorStack,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    
    return new Response(JSON.stringify({ 
      error: "Payment processing failed", 
      details: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
