-- Update all Stripe Price IDs for Blue Dream Budder products
UPDATE public.products 
SET stripe_price_id = 'price_1SAfUmDiBqghYX9i6ktenoL4'
WHERE name ILIKE '%baby%blue%dream%budder%';

UPDATE public.products 
SET stripe_price_id = 'price_1SAfUmDiBqghYX9i5iIFa6Y0'
WHERE name ILIKE '%1%oz%' AND name ILIKE '%blue%dream%budder%' AND name NOT ILIKE '%baby%';

UPDATE public.products 
SET stripe_price_id = 'price_1SAfUmDiBqghYX9iy9FUNBfp'
WHERE name ILIKE '%2%oz%' AND name ILIKE '%blue%dream%budder%';

UPDATE public.products 
SET stripe_price_id = 'price_1SCjfkDiBqghYX9ie1r4xNQu'
WHERE name ILIKE '%8%oz%' AND name ILIKE '%blue%dream%budder%';