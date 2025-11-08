-- Add timelapse_url column to healing_progress table for storing generated time-lapse videos
ALTER TABLE healing_progress ADD COLUMN timelapse_url TEXT;

-- Add index for better query performance
CREATE INDEX idx_healing_progress_timelapse ON healing_progress(timelapse_url) WHERE timelapse_url IS NOT NULL;