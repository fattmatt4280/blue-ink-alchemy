
-- Update popular products: set Baby Budder as popular and 8oz as most popular
UPDATE public.products 
SET popular = true 
WHERE name = 'Blue Dream Budder Baby';

-- Add a new column for most_popular to distinguish from regular popular
ALTER TABLE public.products 
ADD COLUMN most_popular boolean DEFAULT false;

-- Set 8oz as most popular
UPDATE public.products 
SET most_popular = true 
WHERE name = 'Blue Dream Budder 8oz';

-- Make sure 2oz is not popular
UPDATE public.products 
SET popular = false 
WHERE name = 'Blue Dream Budder 2oz';
