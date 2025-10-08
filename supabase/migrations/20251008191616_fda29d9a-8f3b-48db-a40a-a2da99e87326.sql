-- Update Heal-AId product images to use Supabase Storage
UPDATE products 
SET image_url = 'https://vozstxchkgpxzetwdzow.supabase.co/storage/v1/object/public/product-images/products/healaid-shield-logo.jpeg'
WHERE name LIKE '%Heal-AId%';