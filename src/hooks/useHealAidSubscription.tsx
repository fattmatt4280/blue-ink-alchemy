import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionStatus {
  isActive: boolean;
  expirationDate: string | null;
  daysRemaining: number;
  tier: string | null;
  loading: boolean;
}

export const useHealAidSubscription = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    isActive: false,
    expirationDate: null,
    daysRemaining: 0,
    tier: null,
    loading: true,
  });

  useEffect(() => {
    if (!user) {
      setStatus({
        isActive: false,
        expirationDate: null,
        daysRemaining: 0,
        tier: null,
        loading: false,
      });
      return;
    }

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('healaid_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching subscription:', error);
          setStatus({
            isActive: false,
            expirationDate: null,
            daysRemaining: 0,
            tier: null,
            loading: false,
          });
          return;
        }

        if (!data) {
          setStatus({
            isActive: false,
            expirationDate: null,
            daysRemaining: 0,
            tier: null,
            loading: false,
          });
          return;
        }

        const now = new Date();
        const expiry = new Date(data.expiration_date);
        const diffTime = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        setStatus({
          isActive: data.is_active && diffDays > 0,
          expirationDate: data.expiration_date,
          daysRemaining: Math.max(0, diffDays),
          tier: data.tier,
          loading: false,
        });
      } catch (err) {
        console.error('Error in useHealAidSubscription:', err);
        setStatus({
          isActive: false,
          expirationDate: null,
          daysRemaining: 0,
          tier: null,
          loading: false,
        });
      }
    };

    fetchSubscription();

    // Set up real-time subscription updates
    const channel = supabase
      .channel('healaid-subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'healaid_subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchSubscription();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return status;
};
