
-- Create a table for customer-submitted reviews that need approval
CREATE TABLE public.customer_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.customer_reviews ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert reviews (for submission)
CREATE POLICY "Anyone can submit reviews" 
  ON public.customer_reviews 
  FOR INSERT 
  WITH CHECK (true);

-- Only allow reading approved reviews publicly
CREATE POLICY "Anyone can view approved reviews" 
  ON public.customer_reviews 
  FOR SELECT 
  USING (approved = true);

-- Create an index for better performance
CREATE INDEX idx_customer_reviews_approved ON public.customer_reviews(approved);
CREATE INDEX idx_customer_reviews_created_at ON public.customer_reviews(created_at DESC);
