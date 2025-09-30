-- Drop the existing policy that allows public access to all fields
DROP POLICY IF EXISTS "Public can view approved reviews without emails" ON public.customer_reviews;

-- Create a new policy that completely blocks public access to the customer_reviews table
-- Only authenticated users (admins) and the service should have access
CREATE POLICY "Public cannot access customer reviews directly" 
ON public.customer_reviews 
FOR SELECT 
USING (false);

-- Create a view that excludes email addresses for public consumption
CREATE OR REPLACE VIEW public.public_customer_reviews AS
SELECT 
  id,
  name,
  rating,
  title,
  content,
  created_at
FROM public.customer_reviews
WHERE approved = true;

-- Enable RLS on the view
ALTER VIEW public.public_customer_reviews SET (security_barrier = true);

-- Grant SELECT access to anonymous users on the view
GRANT SELECT ON public.public_customer_reviews TO anon;
GRANT SELECT ON public.public_customer_reviews TO authenticated;