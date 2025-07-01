
-- Add stripe_price_id column to products table
ALTER TABLE public.products 
ADD COLUMN stripe_price_id TEXT;

-- Add a comment to explain the column
COMMENT ON COLUMN public.products.stripe_price_id IS 'Stripe Price ID for this product - if set, will be used instead of custom pricing';
