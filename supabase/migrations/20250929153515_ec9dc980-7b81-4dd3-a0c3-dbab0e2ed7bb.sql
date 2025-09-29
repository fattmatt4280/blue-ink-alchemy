-- Enable real-time updates for customer_reviews table
ALTER TABLE public.customer_reviews REPLICA IDENTITY FULL;

-- Add customer_reviews table to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_reviews;