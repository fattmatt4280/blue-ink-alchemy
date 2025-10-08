-- Switch Heal-AId products to use local public folder images
UPDATE products 
SET image_url = '/images/healaid-shield-logo.jpeg'
WHERE name LIKE '%Heal-AId%';