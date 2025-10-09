-- Fix Critical Security Issue: Restrict access to contact_submissions table
-- This table contains sensitive customer data including names, emails, and messages

-- Ensure RLS is enabled
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Drop any overly permissive policies that might exist
DROP POLICY IF EXISTS "Public can view contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can view contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Service can view contact submissions" ON public.contact_submissions;

-- Recreate the correct policies to ensure they're properly configured
DROP POLICY IF EXISTS "Admins can view contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can update contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can submit contact forms" ON public.contact_submissions;

-- Policy 1: Only admins can view contact submissions
CREATE POLICY "Admins can view contact submissions"
ON public.contact_submissions
FOR SELECT
USING (is_admin());

-- Policy 2: Only admins can update contact submissions (mark as reviewed, etc.)
CREATE POLICY "Admins can update contact submissions"
ON public.contact_submissions
FOR UPDATE
USING (is_admin());

-- Policy 3: Anyone can submit contact forms (public form submission)
CREATE POLICY "Anyone can submit contact forms"
ON public.contact_submissions
FOR INSERT
WITH CHECK (true);

-- This ensures:
-- 1. Public users can submit contact forms (INSERT)
-- 2. Only admins can view all submissions (SELECT)
-- 3. Only admins can update submissions (UPDATE)
-- 4. NO public access to sensitive customer contact data