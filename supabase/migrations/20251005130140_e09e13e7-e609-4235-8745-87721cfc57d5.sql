-- Create table for storing healing Q&A interactions for context
CREATE TABLE public.healing_qa_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  healing_progress_id UUID REFERENCES public.healing_progress(id),
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  question_category TEXT,
  analysis_context JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.healing_qa_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own Q&A interactions"
  ON public.healing_qa_interactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Q&A interactions"
  ON public.healing_qa_interactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all Q&A interactions"
  ON public.healing_qa_interactions
  FOR SELECT
  USING (is_admin());

-- Create index for faster queries
CREATE INDEX idx_healing_qa_user_id ON public.healing_qa_interactions(user_id);
CREATE INDEX idx_healing_qa_healing_progress_id ON public.healing_qa_interactions(healing_progress_id);