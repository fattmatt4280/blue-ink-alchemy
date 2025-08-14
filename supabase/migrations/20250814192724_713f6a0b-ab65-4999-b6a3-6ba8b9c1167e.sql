-- Remove the public SELECT policy that exposes email addresses
DROP POLICY IF EXISTS "Anyone can view newsletter signups" ON public.newsletter_signups;

-- Add admin-only SELECT policy to protect customer email addresses
CREATE POLICY "Only admins can view newsletter signups" 
ON public.newsletter_signups 
FOR SELECT 
USING (is_admin());