-- Add symptom tracking columns to healing_progress table
ALTER TABLE healing_progress 
ADD COLUMN IF NOT EXISTS hot_to_touch boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS fever_symptoms boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sensitive_to_touch boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_tenderness boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS visible_rashes boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS rash_description text;