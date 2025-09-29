-- Update the incorrect stripe_price_id values to use proper price IDs instead of product IDs
UPDATE public.products 
SET stripe_price_id = 'price_1SCjfTDiBqghYX9iKLLPwQNt' 
WHERE name = 'Baby Blue Dream Budder';

UPDATE public.products 
SET stripe_price_id = 'price_1SCjfgDiBqghYX9ivJYNckJi' 
WHERE name = 'Blue Dream Budder 1oz';

UPDATE public.products 
SET stripe_price_id = 'price_1SCjfiDiBqghYX9i7nLYWOcU' 
WHERE name = 'Blue Dream Budder 2oz';