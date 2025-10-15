-- Create TTS settings table
CREATE TABLE public.tts_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  rate numeric(3,2) DEFAULT 0.92 NOT NULL,
  pitch numeric(3,2) DEFAULT 1.00 NOT NULL,
  volume numeric(3,2) DEFAULT 1.00 NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.tts_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read TTS settings
CREATE POLICY "Anyone can read TTS settings"
  ON public.tts_settings FOR SELECT
  USING (true);

-- Only admins can update TTS settings
CREATE POLICY "Only admins can update TTS settings"
  ON public.tts_settings FOR UPDATE
  USING (is_admin());

-- Only admins can insert TTS settings
CREATE POLICY "Only admins can insert TTS settings"
  ON public.tts_settings FOR INSERT
  WITH CHECK (is_admin());

-- Insert default settings
INSERT INTO public.tts_settings (rate, pitch, volume)
VALUES (0.92, 1.00, 1.00);