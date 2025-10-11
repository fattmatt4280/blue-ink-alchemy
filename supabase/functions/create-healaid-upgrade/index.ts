import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TIER_PRICES = {
  'basic_weekly': { 
    amount: 99, 
    label: 'Basic Weekly', 
    interval: 'week',
    features: '2 uploads/day, AI summary, 7-day history',
    stripe_price_id: 'price_1SGrFSDiBqghYX9irfq6njZE'
  },
  'basic_monthly': { 
    amount: 299, 
    label: 'Basic Monthly', 
    interval: 'month',
    features: '2 uploads/day, AI summary, 30-day history',
    stripe_price_id: 'price_1SGrKsDiBqghYX9i23HgSW8Y'
  },
  'pro_weekly': { 
    amount: 199, 
    label: 'Pro Weekly', 
    interval: 'week',
    features: 'Unlimited analyses, downloadable reports, medical docs',
    stripe_price_id: 'price_1SGrOkDiBqghYX9is1wTdLvS'
  },
  'pro_monthly': { 
    amount: 499, 
    label: 'Pro Monthly', 
    interval: 'month',
    features: 'All Pro features + custom planner + priority support',
    stripe_price_id: 'price_1SGrQhDiBqghYX9iJG7w6iFa'
  },
  'shop_monthly': { 
    amount: 2499, 
    label: 'Shop / Artist', 
    interval: 'month',
    features: 'Client management, bulk QR, studio branding, analytics',
    stripe_price_id: 'price_1SGrcoDiBqghYX9iyO1XH8tq'
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tier } = await req.json();

    if (!tier || !TIER_PRICES[tier]) {
      return new Response(
        JSON.stringify({ error: 'Invalid tier selected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's subscription
    const { data: subscription, error: subError } = await supabase
      .from('healaid_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (subError || !subscription) {
      return new Response(
        JSON.stringify({ error: 'No active Heal-Aid subscription found. Please activate first.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: 'Stripe is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    const tierInfo = TIER_PRICES[tier];
    
    // Create or get Stripe customer
    let customerId = subscription.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;

      await supabase
        .from('healaid_subscriptions')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id);
    }

    // Create Stripe checkout session
    const sessionParams: any = {
      customer: customerId,
      payment_method_types: ['card'],
      billing_address_collection: 'auto', // Only for card verification
      line_items: [
        {
          price: tierInfo.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: 'subscription', // All paid tiers are subscriptions
      success_url: `${req.headers.get('origin')}/dashboard?upgrade=success`,
      cancel_url: `${req.headers.get('origin')}/dashboard?upgrade=cancelled`,
      allow_promotion_codes: true, // Allow discount codes
      customer_update: {
        address: 'auto', // Update billing address if needed
        shipping: 'never', // Never collect shipping for digital service
      },
      metadata: {
        user_id: user.id,
        tier,
        subscription_id: subscription.id,
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-healaid-upgrade:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
