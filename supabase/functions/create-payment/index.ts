
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
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const body = await req.json();
    const { items, shippingInfo, totals } = body;

    logStep("Request data", { itemCount: items?.length, total: totals?.total });

    if (!items || items.length === 0) {
      throw new Error("No items in cart");
    }

    if (!shippingInfo?.email) {
      throw new Error("Email is required");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: shippingInfo.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    }

    // Create line items for Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: item.image_url ? [item.image_url] : [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

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

    logStep("Stripe session created", { sessionId: session.id });

    // Create order record
    await supabaseClient.from("orders").insert({
      email: shippingInfo.email,
      stripe_session_id: session.id,
      amount: totals.total,
      shipping_info: shippingInfo,
      status: 'pending',
      is_guest: true,
      currency: 'usd'
    });

    logStep("Order record created");

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
