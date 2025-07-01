
-- Create a table for newsletter signups
CREATE TABLE public.newsletter_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  active BOOLEAN NOT NULL DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE public.newsletter_signups ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert newsletter signups
CREATE POLICY "Anyone can subscribe to newsletter" 
  ON public.newsletter_signups 
  FOR INSERT 
  WITH CHECK (true);

-- Create an index for better performance
CREATE INDEX idx_newsletter_signups_email ON public.newsletter_signups(email);
CREATE INDEX idx_newsletter_signups_subscribed_at ON public.newsletter_signups(subscribed_at DESC);
