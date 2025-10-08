-- Update Heal-AId product image paths to use public folder
UPDATE products 
SET image_url = '/images/healaid-shield-logo.jpeg'
WHERE image_url LIKE '%healaid-shield-logo%' OR image_url LIKE '%src/assets/healaid%';