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

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per hour per IP

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  record.count++;
  return true;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting by IP
  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                   req.headers.get('x-real-ip') || 
                   'unknown';
  
  if (!checkRateLimit(clientIP)) {
    console.warn(`Rate limit exceeded for IP: ${clientIP}`);
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
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

    // Insert activation code - NOT redeemed yet, user must activate it
    // Duration is 3 days for free trial
    const durationDays = 3;

    const { data: activationCode, error: insertError } = await supabase
      .from('healaid_activation_codes')
      .insert({
        code,
        email,
        tier: 'free_trial',
        duration_days: durationDays,
        redeemed: false, // Code is NOT redeemed until user activates it
        code_expiration_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting activation code:', insertError);
      throw insertError;
    }

    console.log(`Activation code created: ${code}`);

    // Don't create subscription yet - it will be created when user activates the code
    console.log(`Activation code ${code} created for ${email} - awaiting activation`);

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
        message: 'Check your email for your activation code!',
        code: code
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
