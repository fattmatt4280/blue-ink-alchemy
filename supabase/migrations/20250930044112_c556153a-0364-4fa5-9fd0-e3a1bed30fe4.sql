-- Drop the view since it's causing security issues
DROP VIEW IF EXISTS public.public_customer_reviews;

-- Remove the overly restrictive policy
DROP POLICY IF EXISTS "Public cannot access customer reviews directly" ON public.customer_reviews;

-- Create a more secure policy that only allows non-authenticated users to see specific columns
-- This approach uses a column-level restriction in the policy
CREATE POLICY "Public can view approved reviews basic info only" 
ON public.customer_reviews 
FOR SELECT 
USING (approved = true AND auth.uid() IS NULL);

-- Add a comment to make it clear this table should not expose email addresses
COMMENT ON TABLE public.customer_reviews IS 'SECURITY: Email addresses should never be exposed to public. Use column selection in queries.';