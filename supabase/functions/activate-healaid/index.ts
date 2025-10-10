import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, email } = await req.json();

    if (!code || !email) {
      return new Response(
        JSON.stringify({ error: 'Code and email are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    // Check if code exists and is not redeemed
    const { data: activationCode, error: codeError } = await supabase
      .from('healaid_activation_codes')
      .select('*')
      .eq('code', code)
      .single();

    if (codeError || !activationCode) {
      return new Response(
        JSON.stringify({ error: 'Invalid activation code' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (activationCode.redeemed) {
      return new Response(
        JSON.stringify({ error: 'This code has already been used' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if code has expired (must be activated within 90 days)
    const now = new Date();
    const codeExpiration = new Date(activationCode.code_expiration_date);
    
    if (now > codeExpiration) {
      return new Response(
        JSON.stringify({ 
          error: 'This activation code has expired. Codes must be activated within 90 days of purchase.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has EVER used a free trial (LIFETIME limit, not just 30 days)
    if (activationCode.tier === 'free_trial' && userId) {
      const { data: existingTrials } = await supabase
        .from('healaid_activation_codes')
        .select('id')
        .eq('activated_by', userId)
        .eq('tier', 'free_trial')
        .eq('redeemed', true);

      if (existingTrials && existingTrials.length > 0) {
        return new Response(
          JSON.stringify({ 
            error: 'You have already used your one-time free trial. Please upgrade to a paid plan to continue.',
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Calculate subscription duration based on tier
    const tierHours = {
      'free_trial': 24,          // 1 day (24 hours)
      'basic_weekly': 168,       // 7 days
      'basic_monthly': 720,      // 30 days
      'pro_monthly': 720,        // 30 days
      'shop_monthly': 720,       // 30 days
    };

    const hours = tierHours[activationCode.tier] || 24; // Default to 24 hours (1 day)
    
    const activationDate = new Date();
    const expirationDate = new Date(activationDate);
    expirationDate.setHours(expirationDate.getHours() + hours);

    // Update activation code
    const { error: updateError } = await supabase
      .from('healaid_activation_codes')
      .update({
        redeemed: true,
        email,
        activated_by: userId,
        activation_date: activationDate.toISOString(),
        expiration_date: expirationDate.toISOString(),
      })
      .eq('code', code);

    if (updateError) {
      console.error('Error updating activation code:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to activate code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create or update subscription
    if (userId) {
      const { data: existingSub } = await supabase
        .from('healaid_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existingSub) {
        await supabase
          .from('healaid_subscriptions')
          .update({
            activation_code: code,
            start_date: activationDate.toISOString(),
            expiration_date: expirationDate.toISOString(),
            tier: 'free_trial',
            is_active: true,
          })
          .eq('user_id', userId);
      } else {
        await supabase
          .from('healaid_subscriptions')
          .insert({
            user_id: userId,
            email,
            activation_code: code,
            start_date: activationDate.toISOString(),
            expiration_date: expirationDate.toISOString(),
            tier: 'free_trial',
          });
      }
    }

    // Create friendly tier names for response
    const tierNames = {
      'free_trial': '1-day free trial',
      'basic_weekly': 'Basic Weekly',
      'basic_monthly': 'Basic Monthly',
      'pro_monthly': 'Pro Monthly',
      'shop_monthly': 'Shop/Artist Monthly',
    };

    const tierName = tierNames[activationCode.tier] || 'subscription';

    return new Response(
      JSON.stringify({
        success: true,
        message: `Heal-AId ${tierName} activated successfully!`,
        tier: activationCode.tier,
        expiration_date: expirationDate.toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in activate-healaid:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});