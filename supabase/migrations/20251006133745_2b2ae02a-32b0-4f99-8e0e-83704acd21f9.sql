-- Add code_expiration_date column and update tier enum for healyn_activation_codes

-- Add code_expiration_date column (90 days from code generation)
ALTER TABLE healyn_activation_codes 
ADD COLUMN IF NOT EXISTS code_expiration_date TIMESTAMP WITH TIME ZONE;

-- Update existing codes to have a code_expiration_date (90 days from created_at)
UPDATE healyn_activation_codes 
SET code_expiration_date = created_at + INTERVAL '90 days'
WHERE code_expiration_date IS NULL;

-- Make code_expiration_date NOT NULL after setting defaults
ALTER TABLE healyn_activation_codes 
ALTER COLUMN code_expiration_date SET DEFAULT (now() + INTERVAL '90 days');

-- Update tier column to support new values
COMMENT ON COLUMN healyn_activation_codes.tier IS 'Subscription tier: free_trial (72hrs), 7_day (168hrs), 30_day (720hrs)';

-- Create index for faster code lookups
CREATE INDEX IF NOT EXISTS idx_healyn_codes_unredeemed 
ON healyn_activation_codes(code) 
WHERE redeemed = false;