-- Update Blue Dream Budder product pricing

-- Update Baby Blue Dream Budder: $7.00 → $6.99
UPDATE products 
SET price = 6.99,
    updated_at = now()
WHERE stripe_price_id = 'price_1SAfUmDiBqghYX9i6ktenoL4';

-- Update Blue Dream Budder 1oz: $15.00 → $14.99
UPDATE products 
SET price = 14.99,
    updated_at = now()
WHERE stripe_price_id = 'price_1SAfUmDiBqghYX9i5iIFa6Y0';

-- Update Blue Dream Budder 2oz: $25.00 → $24.99
UPDATE products 
SET price = 24.99,
    updated_at = now()
WHERE stripe_price_id = 'price_1SAfUmDiBqghYX9iy9FUNBfp';