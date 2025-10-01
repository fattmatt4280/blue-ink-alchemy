-- Create healing-photos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('healing-photos', 'healing-photos', false);

-- Allow authenticated users to upload their own healing photos
CREATE POLICY "Users can upload their own healing photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'healing-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own healing photos
CREATE POLICY "Users can view their own healing photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'healing-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own healing photos
CREATE POLICY "Users can update their own healing photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'healing-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own healing photos
CREATE POLICY "Users can delete their own healing photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'healing-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow admins full access to healing photos
CREATE POLICY "Admins can manage all healing photos"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'healing-photos' 
  AND is_admin()
);