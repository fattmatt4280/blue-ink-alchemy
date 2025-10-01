-- Recreate the view with SECURITY INVOKER to avoid the linter warning
-- This ensures the view respects the calling user's permissions
CREATE OR REPLACE VIEW public.approved_customer_reviews 
WITH (security_invoker = true) AS
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