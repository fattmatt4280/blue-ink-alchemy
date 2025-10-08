-- Fix Critical Security Issue: Remove public email exposure from customer_reviews

-- Drop the dangerous public SELECT policy that exposes customer emails
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.customer_reviews;

-- The get_approved_reviews() function already exists and safely excludes emails
-- Admin policies remain intact for moderation purposes
-- No further changes needed - public access should use get_approved_reviews() function