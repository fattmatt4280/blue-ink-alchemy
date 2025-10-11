-- Update Heal-AId product pricing and logos
-- Basic Weekly: $0.99 → $1.99
UPDATE products 
SET price = 1.99, 
    image_url = '/assets/healaid-shield-logo.jpeg',
    updated_at = now()
WHERE stripe_price_id = 'price_1SGrFSDiBqghYX9irfq6njZE';

-- Basic Monthly: $2.99 → $3.99
UPDATE products 
SET price = 3.99,
    image_url = '/assets/healaid-shield-logo.jpeg',
    updated_at = now()
WHERE stripe_price_id = 'price_1SGrKsDiBqghYX9i23HgSW8Y';

-- Pro Weekly: $1.99 → $2.99
UPDATE products 
SET price = 2.99,
    image_url = '/assets/healaid-shield-logo.jpeg',
    updated_at = now()
WHERE stripe_price_id = 'price_1SGrOkDiBqghYX9is1wTdLvS';

-- Pro Monthly: $4.99 (set image_url)
UPDATE products 
SET image_url = '/assets/healaid-shield-logo.jpeg',
    updated_at = now()
WHERE stripe_price_id = 'price_1SGrQhDiBqghYX9iJG7w6iFa';

-- Shop/Artist: $24.99 → $49.99
UPDATE products 
SET price = 49.99,
    image_url = '/assets/healaid-shield-logo.jpeg',
    updated_at = now()
WHERE stripe_price_id = 'price_1SGrcoDiBqghYX9iyO1XH8tq';