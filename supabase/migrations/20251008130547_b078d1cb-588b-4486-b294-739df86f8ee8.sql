-- Update HealAid product images to use the new shield logo
UPDATE products 
SET image_url = '/src/assets/healaid-shield-logo.jpeg',
    updated_at = now()
WHERE id IN (
  'fa8c7591-9773-4c6d-8923-52abc49cf5ca',
  '8c6b1a2e-95ed-40c6-8999-0d37a885363e',
  '4abbe889-f6f3-4071-8f7c-ab263dbdc0d9'
);