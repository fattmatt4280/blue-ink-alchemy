-- Add Heal-AId subscription products to the products table
INSERT INTO public.products (
  name,
  description,
  price,
  stripe_price_id,
  display_order,
  popular,
  most_popular
) VALUES 
(
  'Heal-AId 3-Day Free Trial',
  'Get free access to Heal-AId AI-powered tattoo healing analysis for 3 days. Automatically included with every order!',
  0.00,
  'price_1SF1DzDiBqghYX9iIMBbMSvu',
  100,
  false,
  false
),
(
  'Heal-AId 7-Day Upgrade',
  'Upgrade your Heal-AId trial to 7 days of AI-powered healing guidance and photo analysis.',
  0.99,
  'price_1SF1FqDiBqghYX9ixP0Ah8Dq',
  101,
  true,
  false
),
(
  'Heal-AId 30-Day Upgrade',
  'Get the full Heal-AId experience with 30 days of expert AI analysis and personalized healing recommendations.',
  3.99,
  'price_1SFEBWDiBqghYX9iLOPkqaBn',
  102,
  false,
  true
);