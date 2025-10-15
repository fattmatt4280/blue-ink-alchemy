-- Add voice_name column to tts_settings table
ALTER TABLE public.tts_settings 
ADD COLUMN voice_name text DEFAULT null;

COMMENT ON COLUMN public.tts_settings.voice_name IS 'Preferred voice name for Web Speech API (e.g., "Google US English Male")';