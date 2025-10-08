-- Phase 1: Fix missing subscription for dreamtattoocompany@gmail.com
INSERT INTO public.healyn_subscriptions (
  user_id,
  email,
  activation_code,
  tier,
  start_date,
  expiration_date,
  is_active
) VALUES (
  'aaea93cb-bf44-451d-aeab-6b891fa5b11a',
  'dreamtattoocompany@gmail.com',
  'HLN-2N9KEH',
  'free_trial',
  '2025-10-08 13:38:39.417+00',
  '2025-10-11 13:38:39.417+00',
  true
);

-- Phase 2: Rename tables from healyn to healaid
ALTER TABLE public.healyn_activation_codes RENAME TO healaid_activation_codes;
ALTER TABLE public.healyn_subscriptions RENAME TO healaid_subscriptions;
ALTER TABLE public.healyn_upgrade_history RENAME TO healaid_upgrade_history;

-- Rename functions
ALTER FUNCTION public.has_active_healyn_subscription(uuid) RENAME TO has_active_healaid_subscription;
ALTER FUNCTION public.update_healyn_updated_at() RENAME TO update_healaid_updated_at;

-- Drop old trigger and create new one with updated name
DROP TRIGGER IF EXISTS update_healyn_subscriptions_updated_at ON public.healaid_subscriptions;
CREATE TRIGGER update_healaid_subscriptions_updated_at
  BEFORE UPDATE ON public.healaid_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_healaid_updated_at();

-- Update function body to reference new table name
CREATE OR REPLACE FUNCTION public.has_active_healaid_subscription(user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.healaid_subscriptions
    WHERE user_id = user_id_param
    AND is_active = true
    AND expiration_date > now()
  );
END;
$$;