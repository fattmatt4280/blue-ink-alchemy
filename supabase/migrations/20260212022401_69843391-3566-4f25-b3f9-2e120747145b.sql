
-- Drop the broad ALL policy that lacks WITH CHECK
DROP POLICY IF EXISTS "Only admins can modify site content" ON public.site_content;

-- Add explicit INSERT policy with WITH CHECK
CREATE POLICY "Admins can insert site content"
ON public.site_content
FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- Add explicit UPDATE policy with both USING and WITH CHECK
CREATE POLICY "Admins can update site content"
ON public.site_content
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Add explicit DELETE policy for completeness
CREATE POLICY "Admins can delete site content"
ON public.site_content
FOR DELETE
TO authenticated
USING (is_admin());
