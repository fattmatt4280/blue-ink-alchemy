-- Add photo_urls column to healing_progress table for multiple image support
ALTER TABLE healing_progress 
ADD COLUMN photo_urls TEXT[] DEFAULT '{}';

-- Update existing records to include the current photo_url in the array
UPDATE healing_progress 
SET photo_urls = ARRAY[photo_url] 
WHERE photo_url IS NOT NULL AND (photo_urls IS NULL OR array_length(photo_urls, 1) IS NULL);