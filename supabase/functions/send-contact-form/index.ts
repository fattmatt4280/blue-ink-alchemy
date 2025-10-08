import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RateLimitRecord {
  count: number;
  resetAt: number;
  violations: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

const checkRateLimit = (
  identifier: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; remainingAttempts: number } => {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (record && now > record.resetAt) {
    rateLimitStore.delete(identifier);
  }

  const currentRecord = rateLimitStore.get(identifier);

  if (!currentRecord) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs, violations: 0 });
    return { allowed: true, remainingAttempts: maxAttempts - 1 };
  }

  if (currentRecord.count >= maxAttempts) {
    currentRecord.violations++;
    return { allowed: false, remainingAttempts: 0 };
  }

  currentRecord.count++;
  return { allowed: true, remainingAttempts: maxAttempts - currentRecord.count };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { name, email, subject, message } = await req.json();

    // Server-side rate limiting (3 submissions per hour per email)
    const rateLimitKey = `contact_form:${email}`;
    const ipAddress = req.headers.get('x-forwarded-for') || 'unknown';
    const ipRateLimitKey = `contact_form:${ipAddress}`;

    const emailRateLimit = checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000);
    const ipRateLimit = checkRateLimit(ipRateLimitKey, 10, 60 * 60 * 1000);

    if (!emailRateLimit.allowed) {
      // Log rate limit violation
      await supabaseClient.from('rate_limit_violations').insert({
        identifier: email,
        action_type: 'contact_form',
        violation_count: 1,
      });

      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!ipRateLimit.allowed) {
      await supabaseClient.from('rate_limit_violations').insert({
        identifier: ipAddress,
        action_type: 'contact_form_ip',
        violation_count: 1,
      });

      return new Response(
        JSON.stringify({ error: 'Too many requests from this location.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email domain (block disposable email services)
    const disposableDomains = ['tempmail.com', 'guerrillamail.com', 'mailinator.com', '10minutemail.com'];
    const emailDomain = email.split('@')[1]?.toLowerCase();
    
    if (disposableDomains.includes(emailDomain)) {
      return new Response(
        JSON.stringify({ error: 'Please use a permanent email address.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate inputs
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'All fields are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (name.length > 100 || subject.length > 200 || message.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Input exceeds maximum length' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert contact submission
    const { error: insertError } = await supabaseClient
      .from('contact_submissions')
      .insert({
        name,
        email,
        subject,
        message,
        ip_address: ipAddress,
        user_agent: req.headers.get('user-agent') || 'unknown',
        status: 'pending',
      });

    if (insertError) {
      console.error('Error inserting contact submission:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to submit contact form' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Contact form submitted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
