-- Create affiliate_products table
CREATE TABLE public.affiliate_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text NOT NULL,
  category text NOT NULL,
  amazon_asin text NOT NULL UNIQUE,
  affiliate_link text NOT NULL,
  recommended_for text[] DEFAULT '{}',
  description text,
  active boolean DEFAULT true,
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.affiliate_products ENABLE ROW LEVEL SECURITY;

-- Public can view active products
CREATE POLICY "Anyone can view active affiliate products"
  ON public.affiliate_products FOR SELECT
  USING (active = true);

-- Admins can manage all products
CREATE POLICY "Admins can manage affiliate products"
  ON public.affiliate_products FOR ALL
  USING (is_admin());

-- Add Amazon Associate Tag to site_content
INSERT INTO public.site_content (key, value, type)
VALUES ('amazon_associate_tag', '', 'text')
ON CONFLICT (key) DO NOTHING;

-- Create updated_at trigger
CREATE TRIGGER update_affiliate_products_updated_at
  BEFORE UPDATE ON public.affiliate_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_blog_post_updated_at();