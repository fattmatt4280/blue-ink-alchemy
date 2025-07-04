
-- First, let's make sure the newsletter_signups table exists and has the right structure
CREATE TABLE IF NOT EXISTS public.newsletter_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS on the table
ALTER TABLE public.newsletter_signups ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to insert (since this is a public newsletter signup)
DROP POLICY IF EXISTS "Anyone can sign up for newsletter" ON public.newsletter_signups;
CREATE POLICY "Anyone can sign up for newsletter" 
  ON public.newsletter_signups 
  FOR INSERT 
  WITH CHECK (true);

-- Create a policy that allows anyone to select (for checking duplicates)
DROP POLICY IF EXISTS "Anyone can view newsletter signups" ON public.newsletter_signups;
CREATE POLICY "Anyone can view newsletter signups" 
  ON public.newsletter_signups 
  FOR SELECT 
  USING (true);
