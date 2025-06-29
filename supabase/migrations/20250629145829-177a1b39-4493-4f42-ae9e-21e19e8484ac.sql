
-- Create a storage bucket for uploaded images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-images', 'site-images', true);

-- Create storage policies to allow admins to upload and manage images
CREATE POLICY "Admins can upload images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'site-images' AND 
  public.is_admin()
);

CREATE POLICY "Admins can view all images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'site-images' AND public.is_admin());

CREATE POLICY "Admins can update images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'site-images' AND public.is_admin());

CREATE POLICY "Admins can delete images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'site-images' AND public.is_admin());

-- Allow public access to view images (for displaying on the site)
CREATE POLICY "Public can view images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'site-images');

-- Add image content to site_content table
INSERT INTO public.site_content (key, value, type) VALUES
  ('hero_image', 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop&crop=center', 'image')
ON CONFLICT (key) DO NOTHING;
