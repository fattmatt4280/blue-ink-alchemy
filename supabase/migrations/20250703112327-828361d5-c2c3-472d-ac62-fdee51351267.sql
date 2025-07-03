
-- Update popular products: set Baby Budder and 8oz as popular, remove from 2oz
UPDATE public.products 
SET popular = false 
WHERE name = 'Blue Dream Budder 2oz';

UPDATE public.products 
SET popular = true 
WHERE name IN ('Blue Dream Budder Baby', 'Blue Dream Budder 8oz');
