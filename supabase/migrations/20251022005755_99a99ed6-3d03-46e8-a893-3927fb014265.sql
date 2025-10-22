-- Add tattoo_title column to healing_progress table
ALTER TABLE healing_progress 
ADD COLUMN IF NOT EXISTS tattoo_title TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_healing_progress_tattoo_title ON healing_progress(tattoo_title);

-- Update existing records with a default title based on created_at
UPDATE healing_progress 
SET tattoo_title = 'Tattoo ' || TO_CHAR(created_at, 'MM-DD-YYYY')
WHERE tattoo_title IS NULL;