-- Make healing-photos bucket public for read access
-- This allows images to be displayed and accessed by AI analysis
-- Write/update/delete operations remain protected by RLS policies
UPDATE storage.buckets 
SET public = true 
WHERE id = 'healing-photos';