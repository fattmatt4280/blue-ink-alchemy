
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
    // Initialize Supabase client first
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Check environment variables and trim whitespace
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")?.trim();
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log("[CREATE-PAYMENT] Environment check:", { 
      hasStripeKey: !!stripeKey, 
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      stripeKeyPrefix: stripeKey ? stripeKey.substring(0, 7) : 'none',
      isLiveKey: stripeKey ? stripeKey.startsWith('sk_live_') : false,
      isTestKey: stripeKey ? stripeKey.startsWith('sk_test_') : false
    });

    if (!stripeKey) {
      console.error("[CREATE-PAYMENT] Missing STRIPE_SECRET_KEY");
      return new Response(JSON.stringify({ error: "Stripe configuration missing" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (!stripeKey.startsWith('sk_live_') && !stripeKey.startsWith('sk_test_')) {
      console.error("[CREATE-PAYMENT] Invalid STRIPE_SECRET_KEY format");
      return new Response(JSON.stringify({ error: "Invalid Stripe key configuration" }), {
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

    const { items, shippingInfo, shippingRate } = body;

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

    // Validate shipping rate is provided
    if (!shippingRate || !shippingRate.amount) {
      console.error("[CREATE-PAYMENT] Missing or invalid shipping rate");
      return new Response(JSON.stringify({ error: "Shipping rate is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Create line items with validation
    console.log("[CREATE-PAYMENT] Creating line items...");
    const lineItems = [];
    
    for (const item of items) {
      console.log(`[CREATE-PAYMENT] Fetching product details for: ${item.name}`);
      
      // Fetch product from database to get stripe_price_id
      const { data: product, error: productError } = await supabaseClient
        .from('products')
        .select('stripe_price_id')
        .eq('id', item.id)
        .single();

      if (productError || !product?.stripe_price_id) {
        console.error(`[CREATE-PAYMENT] Product not found or missing stripe_price_id: ${item.name}`);
        throw new Error(`Product ${item.name} is not configured for payments`);
      }

      console.log(`[CREATE-PAYMENT] Using Stripe Price ID: ${product.stripe_price_id}`);
      
      lineItems.push({
        price: product.stripe_price_id,
        quantity: item.quantity || 1,
      });
    }

    // Add shipping as a line item using the selected rate
    const shippingAmount = Math.round(parseFloat(shippingRate.amount) * 100);
    console.log(`[CREATE-PAYMENT] Adding shipping: ${shippingRate.carrier} ${shippingRate.service_level} - $${shippingRate.amount} (${shippingAmount} cents)`);
    
    lineItems.push({
      price_data: {
        currency: shippingRate.currency?.toLowerCase() || "usd",
        product_data: {
          name: `Shipping - ${shippingRate.carrier} ${shippingRate.service_level}`,
          description: shippingRate.estimated_days ? `Estimated delivery: ${shippingRate.estimated_days} days` : undefined,
        },
        unit_amount: shippingAmount,
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
      const error = sessionError as any;
      console.error("[CREATE-PAYMENT] Session creation failed:", {
        error: error?.message,
        type: error?.type,
        code: error?.code,
        param: error?.param,
        isLiveMode: stripeKey.startsWith('sk_live_'),
        customerExists: !!customerId
      });
      
      // Provide more specific error messages
      let errorMessage = "Failed to create checkout session";
      
      // Detect test/live mode mismatch
      if (error?.message?.includes('similar object exists in live mode') || 
          error?.message?.includes('similar object exists in test mode')) {
        errorMessage = "Payment configuration error: Price ID mode doesn't match API key mode. Please contact support.";
        console.error("[CREATE-PAYMENT] MODE MISMATCH: Stripe key mode doesn't match price IDs");
      } else if (error?.code === 'resource_missing' && error?.param?.includes('price')) {
        errorMessage = "Product pricing not found. Please contact support.";
        console.error("[CREATE-PAYMENT] Price ID not found in Stripe");
      } else if (error?.code === 'rate_limit') {
        errorMessage = "Too many requests. Please try again in a moment.";
      } else if (error?.code === 'invalid_request_error') {
        errorMessage = "Invalid payment configuration. Please contact support.";
      } else if (error?.message?.includes('price')) {
        errorMessage = "Product pricing configuration error. Please contact support.";
      }
      
      return new Response(JSON.stringify({ 
        error: errorMessage, 
        details: error?.message,
        code: error?.code
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Create order record
    try {
      console.log("[CREATE-PAYMENT] Attempting to create order record...");

      const totalAmount = items.reduce((sum, item) => {
        return sum + ((item.price || 0) * (item.quantity || 1));
      }, 0) + parseFloat(shippingRate.amount);

      const { error: orderError } = await supabaseClient.from("orders").insert({
        email: shippingInfo.email,
        stripe_session_id: session.id,
        amount: Math.round(totalAmount * 100),
        shipping_info: { ...shippingInfo, shippingRate },
        status: 'pending',
        is_guest: true,
        currency: shippingRate.currency?.toLowerCase() || 'usd'
      });

      if (orderError) {
        const err = orderError as any;
        console.warn("[CREATE-PAYMENT] Order creation failed (continuing anyway):", err?.message);
      } else {
        console.log("[CREATE-PAYMENT] Order record created successfully");
      }
    } catch (orderError) {
      const err = orderError as any;
      console.warn("[CREATE-PAYMENT] Order creation failed (continuing anyway):", err?.message);
    }

    // Return success response
    console.log("[CREATE-PAYMENT] Success - returning checkout URL:", session.url);
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const err = error as any;
    console.error("[CREATE-PAYMENT] Critical error:", {
      message: err?.message,
      stack: err?.stack,
      name: err?.name
    });
    
    return new Response(JSON.stringify({ 
      error: "Payment processing failed", 
      details: err?.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
