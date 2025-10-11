import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StartFreeTrialRequest {
  email: string;
  userId?: string;
}

const generateUniqueCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
    if ((i + 1) % 4 === 0 && i < 11) code += '-';
  }
  return code;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, userId }: StartFreeTrialRequest = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting free trial for email: ${email}`);

    // Check eligibility - has this email already used a free trial?
    const { data: existingCodes } = await supabase
      .from('healaid_activation_codes')
      .select('*')
      .eq('email', email)
      .eq('tier', 'free_trial')
      .eq('redeemed', true);

    if (existingCodes && existingCodes.length > 0) {
      console.log(`Email ${email} has already used free trial`);
      return new Response(
        JSON.stringify({ error: 'You have already used your free trial. Please upgrade to continue using HealAid.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for active subscription
    const { data: activeSubscriptions } = await supabase
      .from('healaid_subscriptions')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .gt('expiration_date', new Date().toISOString());

    if (activeSubscriptions && activeSubscriptions.length > 0) {
      console.log(`Email ${email} already has an active subscription`);
      return new Response(
        JSON.stringify({ error: 'You already have an active subscription' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique activation code
    let code = generateUniqueCode();
    let codeExists = true;
    let attempts = 0;

    while (codeExists && attempts < 5) {
      const { data } = await supabase
        .from('healaid_activation_codes')
        .select('id')
        .eq('code', code)
        .single();

      if (!data) {
        codeExists = false;
      } else {
        code = generateUniqueCode();
        attempts++;
      }
    }

    if (codeExists) {
      throw new Error('Failed to generate unique code');
    }

    // Insert activation code
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 24);

    const { data: activationCode, error: insertError } = await supabase
      .from('healaid_activation_codes')
      .insert({
        code,
        email,
        tier: 'free_trial',
        redeemed: true,
        activated_by: userId || null,
        activation_date: new Date().toISOString(),
        expiration_date: expirationDate.toISOString(),
        code_expiration_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting activation code:', insertError);
      throw insertError;
    }

    console.log(`Activation code created: ${code}`);

    // Create subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('healaid_subscriptions')
      .insert({
        user_id: userId || null,
        email,
        tier: 'free_trial',
        activation_code: code,
        start_date: new Date().toISOString(),
        expiration_date: expirationDate.toISOString(),
        is_active: true
      })
      .select()
      .single();

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError);
      throw subscriptionError;
    }

    console.log(`Subscription created for ${email}`);

    // Send activation email
    try {
      const { error: emailError } = await supabase.functions.invoke('send-activation-code-email', {
        body: { 
          email, 
          code,
          tier: 'free_trial'
        }
      });

      if (emailError) {
        console.error('Error sending email:', emailError);
      } else {
        console.log(`Activation email sent to ${email}`);
      }
    } catch (emailErr) {
      console.error('Failed to send email:', emailErr);
      // Don't fail the whole operation if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Free trial activated! Check your email for confirmation.',
        subscription: {
          id: subscription.id,
          tier: subscription.tier,
          expiration_date: subscription.expiration_date
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in start-free-trial:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to start free trial' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
