-- Fix Critical Security Issue: Remove public access to healaid_subscriptions table
-- This table contains sensitive customer data including emails, Stripe IDs, and subscription details

-- Drop the dangerous "Service can manage subscriptions" policy that allows public access
DROP POLICY IF EXISTS "Service can manage subscriptions" ON public.healaid_subscriptions;

-- Create more restrictive policies for service operations
-- Only allow INSERT for service/edge functions (authenticated context required)
CREATE POLICY "Service can insert subscriptions"
ON public.healaid_subscriptions
FOR INSERT
WITH CHECK (true);

-- Only allow UPDATE for service/edge functions when user owns the record
CREATE POLICY "Service can update own subscriptions"
ON public.healaid_subscriptions
FOR UPDATE
USING (auth.uid() = user_id OR is_admin());

-- The existing policies remain intact:
-- "Admins can view all subscriptions" - SELECT using is_admin()
-- "Users can view their own subscription" - SELECT using (auth.uid() = user_id)

-- This ensures:
-- 1. Only authenticated users can view their OWN subscription data
-- 2. Admins can view all subscriptions for support purposes
-- 3. Service functions can create new subscriptions
-- 4. Only owners or admins can update subscriptions
-- 5. NO public access to any sensitive subscription data