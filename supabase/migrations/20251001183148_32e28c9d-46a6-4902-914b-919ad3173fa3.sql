-- Remove public SELECT access from customer_reviews table
DROP POLICY IF EXISTS "Public can view approved reviews basic info only" ON public.customer_reviews;

-- Create a secure view that only exposes non-sensitive review data
CREATE OR REPLACE VIEW public.approved_customer_reviews AS
SELECT 
  id,
  name,
  rating,
  title,
  content,
  created_at
FROM public.customer_reviews
WHERE approved = true
ORDER BY created_at DESC;

-- Grant SELECT access on the view to anon and authenticated users
GRANT SELECT ON public.approved_customer_reviews TO anon, authenticated;

-- Keep admin access intact on the main table
-- (The existing "Admins can view all review data" policy remains unchanged)