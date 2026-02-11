
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
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")?.trim();

    if (!stripeKey || (!stripeKey.startsWith('sk_live_') && !stripeKey.startsWith('sk_test_'))) {
      console.error("[CREATE-PAYMENT] Invalid or missing STRIPE_SECRET_KEY");
      return new Response(JSON.stringify({ error: "Stripe configuration missing" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const body = await Promise.race([
      req.json(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 10000))
    ]);

    const { items, shippingInfo, shippingRate, promoType } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "Cart is empty" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!shippingInfo?.email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      timeout: 15000
    });

    // === FREE BUDDER PROMO FLOW ===
    if (promoType === 'free-budder') {
      console.log("[CREATE-PAYMENT] Free budder promo detected for:", shippingInfo.email);

      // 1-per-customer check
      const { data: existingOrders } = await supabaseClient
        .from('orders')
        .select('id')
        .eq('email', shippingInfo.email.toLowerCase())
        .or('status.eq.paid,status.eq.pending')
        .limit(100);

      const hasClaimed = existingOrders?.some((order: any) => {
        // We'll check shipping_info for the promo flag
        return false; // We'll do a more specific check below
      });

      // More specific check using shipping_info metadata
      const { data: promoOrders } = await supabaseClient
        .from('orders')
        .select('id, shipping_info')
        .eq('email', shippingInfo.email.toLowerCase())
        .in('status', ['paid', 'pending']);

      const alreadyClaimed = promoOrders?.some((order: any) => {
        return order.shipping_info?.promoType === 'free-budder';
      });

      if (alreadyClaimed) {
        console.log("[CREATE-PAYMENT] Customer already claimed free budder:", shippingInfo.email);
        return new Response(JSON.stringify({ error: "You've already claimed your free budder! Limit 1 per customer." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      // Create/find customer
      let customerId;
      try {
        const customers = await stripe.customers.list({ email: shippingInfo.email, limit: 1 });
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
        } else {
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
        }
      } catch (e) {
        console.error("[CREATE-PAYMENT] Customer error:", e);
        return new Response(JSON.stringify({ error: "Failed to process customer" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      const origin = req.headers.get("origin") || "https://eddfac78-1921-4963-ae88-c91f314935b4.lovableproject.com";

      // Single line item: $10.20 for "Free Budder + Shipping"
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: "Baby Blue Dream Budder (10g) — FREE + Shipping",
              description: "Free product promotion. Shipping & handling only.",
            },
            unit_amount: 1020, // $10.20
          },
          quantity: 1,
        }],
        mode: "payment",
        success_url: `${origin}/checkout?success=true`,
        cancel_url: `${origin}/checkout?cancelled=true`,
        shipping_address_collection: { allowed_countries: ['US'] },
        payment_method_types: ['card'],
        expires_at: Math.floor(Date.now() / 1000) + (30 * 60),
      });

      // Create order record with promo metadata
      await supabaseClient.from("orders").insert({
        email: shippingInfo.email,
        stripe_session_id: session.id,
        amount: 1020,
        shipping_info: { ...shippingInfo, shippingRate, promoType: 'free-budder' },
        status: 'pending',
        is_guest: true,
        currency: 'usd'
      });

      // Track analytics
      await supabaseClient.from('analytics_events').insert({
        event_type: 'free_budder_claimed',
        event_data: {
          email: shippingInfo.email,
          stripe_session_id: session.id
        }
      });

      console.log("[CREATE-PAYMENT] Free budder session created:", session.id);
      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // === STANDARD PAYMENT FLOW ===
    if (!shippingRate || !shippingRate.amount) {
      return new Response(JSON.stringify({ error: "Shipping rate is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    let customerId;
    try {
      const customers = await stripe.customers.list({ email: shippingInfo.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
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
      }
    } catch (customerError) {
      console.error("[CREATE-PAYMENT] Customer creation/lookup failed:", customerError);
      return new Response(JSON.stringify({ error: "Failed to process customer information" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const lineItems = [];
    for (const item of items) {
      const { data: product, error: productError } = await supabaseClient
        .from('products')
        .select('stripe_price_id')
        .eq('id', item.id)
        .single();

      if (productError || !product?.stripe_price_id) {
        throw new Error(`Product ${item.name} is not configured for payments`);
      }

      lineItems.push({
        price: product.stripe_price_id,
        quantity: item.quantity || 1,
      });
    }

    const shippingAmount = Math.round(parseFloat(shippingRate.amount) * 100);
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

    const origin = req.headers.get("origin") || "https://eddfac78-1921-4963-ae88-c91f314935b4.lovableproject.com";

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: lineItems,
        mode: "payment",
        success_url: `${origin}/checkout?success=true`,
        cancel_url: `${origin}/checkout?cancelled=true`,
        shipping_address_collection: { allowed_countries: ['US'] },
        payment_method_types: ['card'],
        expires_at: Math.floor(Date.now() / 1000) + (30 * 60),
      });
    } catch (sessionError) {
      const error = sessionError as any;
      console.error("[CREATE-PAYMENT] Session creation failed:", error?.message);
      let errorMessage = "Failed to create checkout session";
      if (error?.message?.includes('similar object exists in live mode') || error?.message?.includes('similar object exists in test mode')) {
        errorMessage = "Payment configuration error: Price ID mode doesn't match API key mode.";
      } else if (error?.code === 'resource_missing') {
        errorMessage = "Product pricing not found.";
      }
      return new Response(JSON.stringify({ error: errorMessage, details: error?.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Create order record
    try {
      const totalAmount = items.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 1)), 0) + parseFloat(shippingRate.amount);
      await supabaseClient.from("orders").insert({
        email: shippingInfo.email,
        stripe_session_id: session.id,
        amount: Math.round(totalAmount * 100),
        shipping_info: { ...shippingInfo, shippingRate },
        status: 'pending',
        is_guest: true,
        currency: shippingRate.currency?.toLowerCase() || 'usd'
      });
    } catch (orderError) {
      console.warn("[CREATE-PAYMENT] Order creation failed (continuing):", (orderError as any)?.message);
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const err = error as any;
    console.error("[CREATE-PAYMENT] Critical error:", err?.message);
    return new Response(JSON.stringify({ error: "Payment processing failed", details: err?.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
