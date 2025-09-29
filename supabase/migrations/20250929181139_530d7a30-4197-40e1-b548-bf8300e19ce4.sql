-- Fix the stripe_price_id for Baby Blue Dream Budder
UPDATE public.products 
SET stripe_price_id = 'price_1SCjfTDiBqghYX9iKLLPwQNt'
WHERE name = 'Baby Blue Dream Budder';