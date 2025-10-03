-- Roll back the previous policy that exposed emails
DROP POLICY IF EXISTS "Public can view approved reviews only" ON customer_reviews;

-- Create a security definer function that safely returns approved reviews without exposing emails
CREATE OR REPLACE FUNCTION public.get_approved_reviews()
RETURNS TABLE (
  id uuid,
  name text,
  rating integer,
  title text,
  content text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    name,
    rating,
    title,
    content,
    created_at
  FROM customer_reviews
  WHERE approved = true
  ORDER BY created_at DESC
  LIMIT 100;
$$;

-- Grant execute permission to public (anon users)
GRANT EXECUTE ON FUNCTION public.get_approved_reviews() TO anon, authenticated;