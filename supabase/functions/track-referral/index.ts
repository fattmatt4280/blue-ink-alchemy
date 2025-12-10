import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TIER_THRESHOLDS = {
  sprout: 0,
  leaf: 3,
  bloom: 7,
  harvest: 15,
  moonflower: 25,
};

function calculateTier(totalReferrals: number): string {
  if (totalReferrals >= TIER_THRESHOLDS.moonflower) return 'moonflower';
  if (totalReferrals >= TIER_THRESHOLDS.harvest) return 'harvest';
  if (totalReferrals >= TIER_THRESHOLDS.bloom) return 'bloom';
  if (totalReferrals >= TIER_THRESHOLDS.leaf) return 'leaf';
  return 'sprout';
}

function getCreditAmount(tier: string): number {
  // Leaf tier and above get 1.5x credit ($7.50 instead of $5)
  return tier === 'sprout' ? 5 : 7.5;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, ...data } = await req.json();
    console.log(`Processing action: ${action}`, data);

    switch (action) {
      case 'validate_code': {
        // Validate a referral code exists and get referrer info
        const { referral_code } = data;
        
        const { data: profile, error } = await supabase
          .from('referral_profiles')
          .select('user_id, referral_code')
          .eq('referral_code', referral_code.toUpperCase())
          .single();

        if (error || !profile) {
          return new Response(
            JSON.stringify({ valid: false, error: 'Invalid referral code' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ valid: true, referrer_id: profile.user_id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'record_referral': {
        // Record a new referral when someone uses a referral link
        const { referral_code, referred_email } = data;

        // Get referrer
        const { data: referrerProfile, error: referrerError } = await supabase
          .from('referral_profiles')
          .select('user_id')
          .eq('referral_code', referral_code.toUpperCase())
          .single();

        if (referrerError || !referrerProfile) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid referral code' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        // Check if this email was already referred
        const { data: existingReferral } = await supabase
          .from('referrals')
          .select('id')
          .eq('referred_email', referred_email.toLowerCase())
          .single();

        if (existingReferral) {
          return new Response(
            JSON.stringify({ success: false, error: 'Email already referred' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        // Create referral record
        const { data: referral, error: insertError } = await supabase
          .from('referrals')
          .insert({
            referrer_id: referrerProfile.user_id,
            referred_email: referred_email.toLowerCase(),
            referral_code: referral_code.toUpperCase(),
            status: 'pending',
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating referral:', insertError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to create referral' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }

        return new Response(
          JSON.stringify({ success: true, referral_id: referral.id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'convert_referral': {
        // Called when a referred user makes their first purchase
        const { referred_email, order_id, discount_amount } = data;

        // Find the pending referral
        const { data: referral, error: referralError } = await supabase
          .from('referrals')
          .select('*, referral_profiles!inner(current_tier)')
          .eq('referred_email', referred_email.toLowerCase())
          .eq('status', 'pending')
          .single();

        if (referralError || !referral) {
          console.log('No pending referral found for:', referred_email);
          return new Response(
            JSON.stringify({ success: false, error: 'No pending referral found' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get referrer's current tier to calculate credit
        const { data: referrerProfile } = await supabase
          .from('referral_profiles')
          .select('current_tier, total_referrals, store_credit_balance')
          .eq('user_id', referral.referrer_id)
          .single();

        const creditAmount = getCreditAmount(referrerProfile?.current_tier || 'sprout');
        const newTotalReferrals = (referrerProfile?.total_referrals || 0) + 1;
        const newTier = calculateTier(newTotalReferrals);
        const newCreditBalance = (referrerProfile?.store_credit_balance || 0) + creditAmount;

        // Update referral to converted
        await supabase
          .from('referrals')
          .update({
            status: 'credited',
            order_id,
            credit_amount: creditAmount,
            discount_given: discount_amount,
            converted_at: new Date().toISOString(),
          })
          .eq('id', referral.id);

        // Update referrer's profile
        const updateData: Record<string, any> = {
          total_referrals: newTotalReferrals,
          current_tier: newTier,
          store_credit_balance: newCreditBalance,
        };

        // Apply tier-specific benefits
        if (newTier === 'bloom' && referrerProfile?.current_tier !== 'bloom') {
          updateData.permanent_discount_percent = 5;
        }
        if (newTier === 'harvest' && referrerProfile?.current_tier !== 'harvest') {
          const sixMonthsFromNow = new Date();
          sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
          updateData.free_shipping_until = sixMonthsFromNow.toISOString();
        }

        await supabase
          .from('referral_profiles')
          .update(updateData)
          .eq('user_id', referral.referrer_id);

        console.log(`Referral converted: ${referred_email}, credit: $${creditAmount}, new tier: ${newTier}`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            credit_amount: creditAmount,
            new_tier: newTier,
            total_referrals: newTotalReferrals,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'claim_free_budder': {
        // Claim the one-time free budder for Moonflower tier
        const { user_id } = data;

        const { data: profile, error } = await supabase
          .from('referral_profiles')
          .select('*')
          .eq('user_id', user_id)
          .single();

        if (error || !profile) {
          return new Response(
            JSON.stringify({ success: false, error: 'Profile not found' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
          );
        }

        if (profile.current_tier !== 'moonflower') {
          return new Response(
            JSON.stringify({ success: false, error: 'Not eligible - must be Moonflower tier' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        if (profile.free_budder_claimed) {
          return new Response(
            JSON.stringify({ success: false, error: 'Free budder already claimed' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        await supabase
          .from('referral_profiles')
          .update({ free_budder_claimed: true })
          .eq('user_id', user_id);

        return new Response(
          JSON.stringify({ success: true, message: 'Free budder claimed!' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in track-referral function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
