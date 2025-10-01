-- Create healing_progress table for tattoo healing tracking
CREATE TABLE IF NOT EXISTS public.healing_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  photo_url TEXT NOT NULL,
  analysis_result JSONB NOT NULL,
  healing_stage TEXT NOT NULL,
  recommendations TEXT[] NOT NULL DEFAULT '{}',
  progress_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.healing_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own healing progress
CREATE POLICY "Users can view their own healing progress"
ON public.healing_progress
FOR SELECT
USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Policy: Anyone can insert healing progress (for guest uploads)
CREATE POLICY "Anyone can insert healing progress"
ON public.healing_progress
FOR INSERT
WITH CHECK (true);

-- Policy: Users can update their own healing progress
CREATE POLICY "Users can update their own healing progress"
ON public.healing_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Admins can view all healing progress
CREATE POLICY "Admins can view all healing progress"
ON public.healing_progress
FOR SELECT
USING (is_admin());

-- Create index for faster queries
CREATE INDEX idx_healing_progress_user_id ON public.healing_progress(user_id);
CREATE INDEX idx_healing_progress_created_at ON public.healing_progress(created_at DESC);