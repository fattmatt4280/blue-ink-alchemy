import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'HLN-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { count = 1, email, tier = 'free_trial' } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin
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

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || roleData.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate codes
    const codes = [];
    for (let i = 0; i < count; i++) {
      let code = generateCode();
      
      // Ensure uniqueness
      let { data: existing } = await supabase
        .from('healaid_activation_codes')
        .select('code')
        .eq('code', code)
        .single();

      while (existing) {
        code = generateCode();
        const result = await supabase
          .from('healaid_activation_codes')
          .select('code')
          .eq('code', code)
          .single();
        existing = result.data;
      }

      // Set code expiration to 90 days from now
      const codeExpirationDate = new Date();
      codeExpirationDate.setDate(codeExpirationDate.getDate() + 90);

      codes.push({
        code,
        email: email || null,
        tier: tier,
        code_expiration_date: codeExpirationDate.toISOString(),
      });
    }

    // Insert codes
    const { data, error: insertError } = await supabase
      .from('healaid_activation_codes')
      .insert(codes)
      .select();

    if (insertError) {
      console.error('Error inserting codes:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate codes' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: codes.length,
        codes: data.map(c => c.code),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-activation-codes:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});