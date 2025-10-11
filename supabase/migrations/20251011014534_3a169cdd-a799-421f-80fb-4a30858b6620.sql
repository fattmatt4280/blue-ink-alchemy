-- Insert the 5 new Heal-AId subscription plans into products table
-- These will appear on the homepage product grid alongside physical products
-- Only insert if they don't already exist (check by name)

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Heal-AId Basic Weekly') THEN
    INSERT INTO products (name, price, description, stripe_price_id, display_order)
    VALUES ('Heal-AId Basic Weekly', 0.99, '2 uploads/day • AI summary • 7-day history', 'price_1SGrFSDiBqghYX9irfq6njZE', 5);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Heal-AId Basic Monthly') THEN
    INSERT INTO products (name, price, description, stripe_price_id, display_order)
    VALUES ('Heal-AId Basic Monthly', 2.99, '2 uploads/day • AI summary • 30-day history', 'price_1SGrKsDiBqghYX9i23HgSW8Y', 6);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Heal-AId Pro Weekly') THEN
    INSERT INTO products (name, price, description, stripe_price_id, display_order)
    VALUES ('Heal-AId Pro Weekly', 1.99, 'Unlimited analyses • Downloadable reports • Medical docs', 'price_1SGrOkDiBqghYX9is1wTdLvS', 7);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Heal-AId Pro Monthly') THEN
    INSERT INTO products (name, price, description, stripe_price_id, display_order)
    VALUES ('Heal-AId Pro Monthly', 4.99, 'All Pro features • Custom planner • Priority support', 'price_1SGrQhDiBqghYX9iJG7w6iFa', 8);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Heal-AId Shop / Artist') THEN
    INSERT INTO products (name, price, description, stripe_price_id, display_order)
    VALUES ('Heal-AId Shop / Artist', 24.99, 'Client management • Bulk QR • Studio branding • Analytics', 'price_1SGrcoDiBqghYX9iyO1XH8tq', 9);
  END IF;
END $$;