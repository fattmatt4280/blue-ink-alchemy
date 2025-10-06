import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface EligibilityResult {
  eligible: boolean;
  previouslyUsed: boolean;
}

export const useFreeTrialEligibility = (emailOverride?: string) => {
  const { user } = useAuth();
  const [isEligible, setIsEligible] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cachedEmail, setCachedEmail] = useState<string | null>(null);

  const checkEligibility = async (email?: string): Promise<EligibilityResult> => {
    const emailToCheck = email || emailOverride || user?.email;

    if (!emailToCheck) {
      // No email available, assume eligible (optimistic)
      return { eligible: true, previouslyUsed: false };
    }

    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        'check-free-trial-eligibility',
        {
          body: { email: emailToCheck }
        }
      );

      if (functionError) {
        throw functionError;
      }

      return {
        eligible: data.eligible,
        previouslyUsed: data.previouslyUsed
      };
    } catch (err: any) {
      console.error('Error checking free trial eligibility:', err);
      throw err;
    }
  };

  useEffect(() => {
    const fetchEligibility = async () => {
      const emailToUse = emailOverride || user?.email;

      // If no email, assume eligible
      if (!emailToUse) {
        setIsEligible(true);
        setLoading(false);
        return;
      }

      // If we already checked this email, use cached result
      if (cachedEmail === emailToUse) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await checkEligibility(emailToUse);
        setIsEligible(result.eligible);
        setCachedEmail(emailToUse);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching eligibility:', err);
        setError(err.message || 'Failed to check eligibility');
        setIsEligible(true); // Fail open
      } finally {
        setLoading(false);
      }
    };

    fetchEligibility();
  }, [emailOverride, user?.email]);

  return {
    isEligible,
    loading,
    error,
    checkEligibility
  };
};
