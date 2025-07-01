
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not found");
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    logStep("Stripe key found");

    const body = await req.json();
    logStep("Request body received", { 
      hasItems: !!body.items, 
      itemCount: body.items?.length,
      hasShippingInfo: !!body.shippingInfo,
      hasTotals: !!body.totals
    });

    const { items, shippingInfo, totals } = body;

    if (!items || items.length === 0) {
      logStep("ERROR: No items in request");
      throw new Error("No items in cart");
    }

    if (!shippingInfo?.email) {
      logStep("ERROR: No email in shipping info");
      throw new Error("Email is required");
    }

    if (!shippingInfo?.firstName || !shippingInfo?.lastName || !shippingInfo?.address || !shippingInfo?.city || !shippingInfo?.zipCode) {
      logStep("ERROR: Missing required shipping info");
      throw new Error("All shipping information is required");
    }

    logStep("Validation passed", { 
      email: shippingInfo.email, 
      itemCount: items.length,
      totalAmount: totals?.total 
    });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists
    logStep("Checking for existing customer", { email: shippingInfo.email });
    const customers = await stripe.customers.list({ email: shippingInfo.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("No existing customer found");
    }

    // Create line items for Stripe
    const lineItems = items.map((item: any) => {
      logStep("Processing item", { name: item.name, price: item.price, quantity: item.quantity });
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: item.image_url ? [item.image_url] : [],
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
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
    const session = await stripe.checkout.sessions.create({
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
    });

    logStep("Stripe session created successfully", { sessionId: session.id, url: session.url });

    // Create order record
    logStep("Creating order record in database");
    const { data: orderData, error: orderError } = await supabaseClient.from("orders").insert({
      email: shippingInfo.email,
      stripe_session_id: session.id,
      amount: totals?.total ? Math.round(totals.total * 100) : Math.round((items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) + 9.99) * 100),
      shipping_info: shippingInfo,
      status: 'pending',
      is_guest: true,
      currency: 'usd'
    });

    if (orderError) {
      logStep("ERROR creating order record", { error: orderError });
      throw new Error(`Failed to create order record: ${orderError.message}`);
    }

    logStep("Order record created successfully");

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-payment function", { message: errorMessage, stack: error instanceof Error ? error.stack : undefined });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
