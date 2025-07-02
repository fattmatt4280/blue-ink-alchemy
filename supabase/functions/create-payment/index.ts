
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

  // Use service role key to bypass RLS for guest checkouts
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Check Stripe key first
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not found");
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    
    // Log the key format (first 10 chars) for debugging
    logStep("Stripe key found", { 
      keyStart: stripeKey.substring(0, 10),
      keyLength: stripeKey.length,
      isTestKey: stripeKey.startsWith('sk_test_'),
      isLiveKey: stripeKey.startsWith('sk_live_')
    });

    // Parse request body
    let body;
    try {
      body = await req.json();
      logStep("Request body parsed successfully", { 
        hasItems: !!body.items, 
        itemCount: body.items?.length,
        hasShippingInfo: !!body.shippingInfo
      });
    } catch (parseError) {
      logStep("ERROR: Failed to parse request body", { error: parseError.message });
      throw new Error("Invalid JSON in request body");
    }

    const { items, shippingInfo } = body;

    // Validate items
    if (!items || items.length === 0) {
      logStep("ERROR: No items in request");
      throw new Error("No items in cart");
    }

    // Validate shipping info
    if (!shippingInfo?.email) {
      logStep("ERROR: No email in shipping info");
      throw new Error("Email is required");
    }

    if (!shippingInfo?.firstName || !shippingInfo?.lastName || !shippingInfo?.address || !shippingInfo?.city || !shippingInfo?.zipCode) {
      logStep("ERROR: Missing required shipping info", { shippingInfo });
      throw new Error("All shipping information is required");
    }

    logStep("Validation passed", { 
      email: shippingInfo.email, 
      itemCount: items.length
    });

    // Initialize Stripe with explicit error handling
    let stripe;
    try {
      stripe = new Stripe(stripeKey, { 
        apiVersion: "2023-10-16",
        // Add explicit configuration to help with debugging
        typescript: true,
      });
      logStep("Stripe initialized successfully");
    } catch (stripeInitError) {
      logStep("ERROR initializing Stripe", { 
        error: stripeInitError.message,
        keyFormat: stripeKey.substring(0, 10) + "..."
      });
      throw new Error(`Failed to initialize Stripe: ${stripeInitError.message}`);
    }

    // Test Stripe connection by checking if key works
    logStep("Testing Stripe connection");
    try {
      // Try a simple API call to verify the key works
      await stripe.products.list({ limit: 1 });
      logStep("Stripe connection test successful");
    } catch (stripeTestError) {
      logStep("ERROR: Stripe connection test failed", { 
        error: stripeTestError.message,
        type: stripeTestError.type,
        code: stripeTestError.code
      });
      throw new Error(`Stripe API error: ${stripeTestError.message}`);
    }

    // Check if customer exists
    logStep("Checking for existing customer", { email: shippingInfo.email });
    let customerId;
    try {
      const customers = await stripe.customers.list({ email: shippingInfo.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Existing customer found", { customerId });
      } else {
        logStep("No existing customer found");
      }
    } catch (stripeError) {
      logStep("ERROR: Failed to check existing customers", { error: stripeError.message });
      // Continue without existing customer
    }

    // Create line items directly from cart items
    const lineItems = items.map((item: any) => {
      logStep("Processing item", { 
        itemId: item.id,
        itemName: item.name, 
        itemPrice: item.price,
        itemQuantity: item.quantity
      });
      
      const unitAmount = Math.round(item.price * 100); // Convert to cents
      
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: item.image_url ? [item.image_url] : [],
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    });

    // Add shipping as a line item
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Shipping",
        },
        unit_amount: Math.round(9.99 * 100), // $9.99 shipping
      },
      quantity: 1,
    });

    logStep("Line items created", { count: lineItems.length });

    // Create checkout session
    logStep("Creating Stripe checkout session");
    let session;
    try {
      const sessionData = {
        customer: customerId,
        customer_email: customerId ? undefined : shippingInfo.email,
        line_items: lineItems,
        mode: "payment",
        success_url: `${req.headers.get("origin")}/checkout?success=true`,
        cancel_url: `${req.headers.get("origin")}/checkout?cancelled=true`,
        automatic_tax: {
          enabled: true,
        },
        shipping_address_collection: {
          allowed_countries: ['US'],
        },
        customer_creation: customerId ? undefined : 'always',
        metadata: {
          order_type: 'cart_checkout',
        }
      };

      logStep("Session data prepared", { 
        hasCustomer: !!customerId,
        email: shippingInfo.email,
        lineItemCount: lineItems.length
      });

      session = await stripe.checkout.sessions.create(sessionData);
      logStep("Stripe session created successfully", { sessionId: session.id });
    } catch (stripeSessionError) {
      logStep("ERROR creating Stripe session", { 
        error: stripeSessionError.message,
        type: stripeSessionError.type,
        code: stripeSessionError.code,
        param: stripeSessionError.param
      });
      throw new Error(`Failed to create Stripe session: ${stripeSessionError.message}`);
    }

    // Create order record
    logStep("Creating order record in database");
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity);
    }, 0) + 9.99;

    try {
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
        logStep("ERROR creating order record", { error: orderError });
        // Don't throw here - the Stripe session is already created
        console.warn("Failed to create order record, but continuing with checkout");
      } else {
        logStep("Order record created successfully");
      }
    } catch (orderCreationError) {
      logStep("ERROR in order creation", { error: orderCreationError.message });
      // Don't throw here - the Stripe session is already created
    }

    logStep("Function completed successfully", { sessionUrl: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-payment function", { 
      message: errorMessage, 
      stack: error instanceof Error ? error.stack : undefined 
    });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
