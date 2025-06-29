
-- Create a table for products
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  price decimal(10,2) NOT NULL,
  original_price decimal(10,2),
  image_url text,
  description text,
  size text,
  popular boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can manage products" 
  ON public.products 
  FOR ALL 
  USING (public.is_admin());

-- Create policy for public read access (for the main site)
CREATE POLICY "Public can view products" 
  ON public.products 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- Insert initial product data
INSERT INTO public.products (name, price, original_price, image_url, description, size, popular) VALUES
('Blue Dream Budder 1oz', 29.99, 34.99, 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300&h=300&fit=crop&crop=center', 'Perfect for touch-ups and travel', '1oz (30ml)', false),
('Blue Dream Budder 2oz', 49.99, 59.99, 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300&h=300&fit=crop&crop=center', 'Ideal for new tattoos', '2oz (60ml)', true),
('Blue Dream Budder 4oz', 79.99, 94.99, 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300&h=300&fit=crop&crop=center', 'Best value for regular use', '4oz (120ml)', false),
('Blue Dream Budder 8oz', 129.99, 159.99, 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300&h=300&fit=crop&crop=center', 'Professional size for artists', '8oz (240ml)', false);

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- Create storage policies for product images
CREATE POLICY "Public can view product images" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins can update product images" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins can delete product images" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'product-images' AND public.is_admin());
