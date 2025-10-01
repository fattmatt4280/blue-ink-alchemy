-- Create table for storing custom AI instructions/prompts
CREATE TABLE IF NOT EXISTS public.ai_custom_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  instruction_text TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  priority INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_custom_instructions ENABLE ROW LEVEL SECURITY;

-- Only admins can manage AI instructions
CREATE POLICY "Admins can manage AI instructions"
  ON public.ai_custom_instructions
  FOR ALL
  USING (is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_ai_instructions_updated_at
  BEFORE UPDATE ON public.ai_custom_instructions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_expert_updated_at();