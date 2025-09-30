-- Drop the problematic view
DROP VIEW IF EXISTS public.public_customer_reviews;

-- Recreate the view without security definer (using security invoker by default)
CREATE VIEW public.public_customer_reviews AS
SELECT 
  id,
  name,
  rating,
  title,
  content,
  created_at
FROM public.customer_reviews
WHERE approved = true;

-- Grant SELECT access to anonymous users on the view
GRANT SELECT ON public.public_customer_reviews TO anon;
GRANT SELECT ON public.public_customer_reviews TO authenticated;