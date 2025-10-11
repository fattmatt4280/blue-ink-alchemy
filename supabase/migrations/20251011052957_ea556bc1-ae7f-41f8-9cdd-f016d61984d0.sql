-- Add duration_days to activation codes for flexible durations
ALTER TABLE public.healaid_activation_codes
ADD COLUMN IF NOT EXISTS duration_days integer NOT NULL DEFAULT 1;

-- Optional: ensure no negative durations (enforced via sensible defaults)
-- We avoid CHECK constraints that rely on now(), so we keep it simple here.
