
-- First, let's make sure the product-images bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;

-- Create storage policies for product images with proper admin check
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
