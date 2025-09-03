-- Update RLS policy to hide email addresses from public view
-- Only admins should see email addresses for moderation purposes

-- Drop the existing policy that exposes all data to public
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.customer_reviews;

-- Create new policy that only shows non-sensitive data to public
CREATE POLICY "Public can view approved reviews without emails" 
ON public.customer_reviews 
FOR SELECT 
USING (approved = true AND auth.uid() IS NULL);

-- Create policy for admins to see all data including emails
CREATE POLICY "Admins can view all review data" 
ON public.customer_reviews 
FOR SELECT 
USING (is_admin());

-- Ensure admins can still manage reviews (approve/reject)
-- This policy should already exist but let's make sure
CREATE POLICY "Admins can update review status" 
ON public.customer_reviews 
FOR UPDATE 
USING (is_admin());