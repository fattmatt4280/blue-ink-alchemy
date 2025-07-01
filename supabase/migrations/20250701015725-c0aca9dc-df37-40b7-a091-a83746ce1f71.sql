
-- Add display_order column to products table
ALTER TABLE products ADD COLUMN display_order INTEGER;

-- Update existing products with display_order based on creation date
UPDATE products 
SET display_order = row_number 
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_number 
  FROM products
) as numbered_products 
WHERE products.id = numbered_products.id;

-- Set display_order as NOT NULL after updating existing records
ALTER TABLE products ALTER COLUMN display_order SET NOT NULL;

-- Set default value for new products
ALTER TABLE products ALTER COLUMN display_order SET DEFAULT 1;
