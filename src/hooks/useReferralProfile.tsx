import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ReferralProfile {
  user_id: string;
  referral_code: string;
  total_referrals: number;
  current_tier: 'sprout' | 'leaf' | 'bloom' | 'harvest' | 'moonflower';
  store_credit_balance: number;
  permanent_discount_percent: number;
  free_shipping_until: string | null;
  free_budder_claimed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_email: string;
  referred_user_id: string | null;
  referral_code: string;
  status: 'pending' | 'converted' | 'credited';
  order_id: string | null;
  credit_amount: number;
  discount_given: number;
  created_at: string;
  converted_at: string | null;
}

export const TIER_THRESHOLDS = {
  sprout: 0,
  leaf: 3,
  bloom: 7,
  harvest: 15,
  moonflower: 25,
} as const;

export const TIER_INFO = {
  sprout: {
    name: 'Sprout',
    icon: '🌱',
    reward: '$5 per referral',
    description: "You're planted! Time to grow your network.",
  },
  leaf: {
    name: 'Leaf',
    icon: '🌿',
    reward: '$7.50 per referral (1.5x)',
    description: 'Your first leaves! Earn more from every share.',
  },
  bloom: {
    name: 'Bloom',
    icon: '🌸',
    reward: '5% off all orders (permanent)',
    description: "You're blooming! Enjoy a lifetime perk.",
  },
  harvest: {
    name: 'Harvest',
    icon: '🌻',
    reward: 'Free shipping for 6 months',
    description: 'Your harvest is here! Enjoy the top-tier perk.',
  },
  moonflower: {
    name: 'Moonflower',
    icon: '🌙',
    reward: '1 Free 8oz Budder (one-time)',
    description: 'Legend status unlocked. Claim your free 8oz Budder!',
  },
} as const;

function generateReferralCode(firstName: string | null, lastName: string | null, email: string): string {
  const base = firstName || lastName || email.split('@')[0];
  const cleanBase = base.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 6);
  const randomNum = Math.floor(Math.random() * 100);
  return `${cleanBase}${randomNum}`;
}

export function useReferralProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ReferralProfile | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setReferrals([]);
      setLoading(false);
      return;
    }

    async function fetchOrCreateProfile() {
      setLoading(true);
      setError(null);

      try {
        // First, try to fetch existing profile
        const { data: existingProfile, error: fetchError } = await supabase
          .from('referral_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (existingProfile) {
          setProfile(existingProfile as ReferralProfile);
        } else {
          // Create new referral profile
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('id', user.id)
            .single();

          const referralCode = generateReferralCode(
            userProfile?.first_name,
            userProfile?.last_name,
            user.email || ''
          );

          const { data: newProfile, error: insertError } = await supabase
            .from('referral_profiles')
            .insert({
              user_id: user.id,
              referral_code: referralCode,
            })
            .select()
            .single();

          if (insertError) throw insertError;
          setProfile(newProfile as ReferralProfile);
        }

        // Fetch referrals
        const { data: referralsData, error: referralsError } = await supabase
          .from('referrals')
          .select('*')
          .eq('referrer_id', user.id)
          .order('created_at', { ascending: false });

        if (referralsError) throw referralsError;
        setReferrals((referralsData || []) as Referral[]);
      } catch (err) {
        console.error('Error fetching referral profile:', err);
        setError('Failed to load referral profile');
      } finally {
        setLoading(false);
      }
    }

    fetchOrCreateProfile();
  }, [user]);

  const getNextTier = (currentTier: string): string | null => {
    const tiers = ['sprout', 'leaf', 'bloom', 'harvest', 'moonflower'];
    const currentIndex = tiers.indexOf(currentTier);
    if (currentIndex < tiers.length - 1) {
      return tiers[currentIndex + 1];
    }
    return null;
  };

  const getReferralsToNextTier = (totalReferrals: number, currentTier: string): number => {
    const nextTier = getNextTier(currentTier);
    if (!nextTier) return 0;
    return TIER_THRESHOLDS[nextTier as keyof typeof TIER_THRESHOLDS] - totalReferrals;
  };

  return {
    profile,
    referrals,
    loading,
    error,
    getNextTier,
    getReferralsToNextTier,
    TIER_THRESHOLDS,
    TIER_INFO,
  };
}
