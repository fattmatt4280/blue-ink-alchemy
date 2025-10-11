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

    // Normalize the code: trim whitespace and convert to uppercase for case-insensitive matching
    const normalizedCode = String(code).trim().toUpperCase();
    console.log('Activating code:', normalizedCode);

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

    // Check if code exists and is not redeemed (case-insensitive lookup)
    const { data: activationCode, error: codeError } = await supabase
      .from('healaid_activation_codes')
      .select('*')
      .ilike('code', normalizedCode)
      .maybeSingle();

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

    // Check if user has EVER used a free trial (lifetime restriction)
    if (userId && activationCode.tier === 'free_trial') {
      const { data: existingTrialEver } = await supabase
        .from('healaid_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('tier', 'free_trial')
        .limit(1);

      if (existingTrialEver && existingTrialEver.length > 0) {
        return new Response(
          JSON.stringify({ error: 'You have already used your free trial. Please upgrade to continue using Heal-Aid.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Calculate subscription duration based on code's configured duration_days
    const durationDays = Number(activationCode.duration_days ?? 1);
    const effectiveDays = Number.isFinite(durationDays) && durationDays > 0 ? durationDays : 1;
    const hours = effectiveDays * 24;

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
      .eq('id', activationCode.id);

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
        .maybeSingle();

      if (existingSub) {
        await supabase
          .from('healaid_subscriptions')
          .update({
            activation_code: normalizedCode,
            start_date: activationDate.toISOString(),
            expiration_date: expirationDate.toISOString(),
            tier: activationCode.tier,
            is_active: true,
          })
          .eq('user_id', userId);
      } else {
        await supabase
          .from('healaid_subscriptions')
          .insert({
            user_id: userId,
            email,
            activation_code: normalizedCode,
            start_date: activationDate.toISOString(),
            expiration_date: expirationDate.toISOString(),
            tier: activationCode.tier,
          });
      }
    }

    // Create friendly tier names for response
    const baseNames: Record<string, string> = {
      'free_trial': 'Free Trial',
      'basic': 'Basic',
      'pro': 'Pro',
    };
    const baseName = baseNames[activationCode.tier] || 'Plan';
    const tierName = `${effectiveDays}-Day ${baseName}`;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Heal-Aid ${tierName} activated successfully!`,
        tier: activationCode.tier,
        duration_days: effectiveDays,
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