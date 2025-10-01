-- Create expert assessments table to store refined assessments by tattoo artist
CREATE TABLE IF NOT EXISTS public.expert_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  healing_progress_id UUID REFERENCES public.healing_progress(id) ON DELETE CASCADE,
  expert_user_id UUID REFERENCES auth.users(id),
  
  -- Expert's corrected assessment
  healing_stage TEXT NOT NULL,
  progress_score INTEGER CHECK (progress_score >= 0 AND progress_score <= 100),
  recommendations TEXT[] NOT NULL DEFAULT '{}',
  risk_assessment TEXT,
  product_recommendations TEXT[] DEFAULT '{}',
  
  -- Expert reasoning and notes
  expert_notes TEXT,
  key_indicators TEXT[] DEFAULT '{}',
  common_mistakes_corrected TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one expert assessment per healing progress entry
  UNIQUE(healing_progress_id)
);

-- Create AI assessment ratings table to track accuracy
CREATE TABLE IF NOT EXISTS public.ai_assessment_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  healing_progress_id UUID REFERENCES public.healing_progress(id) ON DELETE CASCADE,
  expert_user_id UUID REFERENCES auth.users(id),
  
  -- Rating components (1-5 stars)
  healing_stage_accuracy INTEGER CHECK (healing_stage_accuracy >= 1 AND healing_stage_accuracy <= 5),
  progress_score_accuracy INTEGER CHECK (progress_score_accuracy >= 1 AND progress_score_accuracy <= 5),
  recommendations_accuracy INTEGER CHECK (recommendations_accuracy >= 1 AND recommendations_accuracy <= 5),
  overall_accuracy INTEGER CHECK (overall_accuracy >= 1 AND overall_accuracy <= 5),
  
  -- Feedback
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(healing_progress_id, expert_user_id)
);

-- Create expert knowledge base for curated conditions and solutions
CREATE TABLE IF NOT EXISTS public.expert_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Condition details
  condition_name TEXT NOT NULL,
  condition_description TEXT NOT NULL,
  healing_stage TEXT NOT NULL,
  
  -- Visual indicators
  visual_indicators TEXT[] NOT NULL DEFAULT '{}',
  common_causes TEXT[] DEFAULT '{}',
  
  -- Solutions
  recommended_actions TEXT[] NOT NULL DEFAULT '{}',
  product_recommendations TEXT[] DEFAULT '{}',
  timeline_expectations TEXT,
  
  -- Risk level
  severity_level TEXT CHECK (severity_level IN ('normal', 'monitor', 'concerning', 'urgent')),
  
  -- Usage tracking
  times_referenced INTEGER DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(condition_name)
);

-- Enable RLS
ALTER TABLE public.expert_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_assessment_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_knowledge_base ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Only admins can access
CREATE POLICY "Admins can manage expert assessments"
ON public.expert_assessments
FOR ALL
USING (is_admin());

CREATE POLICY "Admins can manage AI ratings"
ON public.ai_assessment_ratings
FOR ALL
USING (is_admin());

CREATE POLICY "Admins can manage knowledge base"
ON public.expert_knowledge_base
FOR ALL
USING (is_admin());

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_expert_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_expert_assessments_updated_at
  BEFORE UPDATE ON public.expert_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_expert_updated_at();

CREATE TRIGGER update_knowledge_base_updated_at
  BEFORE UPDATE ON public.expert_knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION public.update_expert_updated_at();