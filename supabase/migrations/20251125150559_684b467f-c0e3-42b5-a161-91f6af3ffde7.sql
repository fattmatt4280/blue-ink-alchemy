-- Insert Heal-AId 3-Day Free Trial product if it doesn't exist
INSERT INTO products (name, price, description, display_order, original_price, image_url)
SELECT 
  'Heal-AId 3-Day Free Trial',
  0,
  '3-day access to Heal-AId healing tracking with your budder purchase',
  99,
  0,
  '/images/healaid-shield-logo.jpeg'
WHERE NOT EXISTS (
  SELECT 1 FROM products 
  WHERE name ILIKE '%3-day%free%trial%' OR name ILIKE '%heal-aid%3-day%'
);