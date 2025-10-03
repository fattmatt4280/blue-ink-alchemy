-- Fix critical security vulnerability in subscribers table
-- Remove the dangerous "USING (true)" policy that allows any user to update any subscription

DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- Create a secure policy that only allows users to update their own subscriptions
CREATE POLICY "update_own_subscription" ON public.subscribers
FOR UPDATE
USING (
  auth.uid() = user_id OR auth.email() = email
);