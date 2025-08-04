-- Create automations table for workflow definitions
CREATE TABLE public.automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL, -- 'order_created', 'order_updated', 'order_paid', etc.
  trigger_conditions JSONB, -- conditions that must be met for trigger
  workflow_steps JSONB NOT NULL, -- array of workflow steps/actions
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create automation executions table for tracking runs
CREATE TABLE public.automation_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  automation_id UUID NOT NULL REFERENCES public.automations(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id),
  trigger_data JSONB NOT NULL, -- the data that triggered the automation
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  current_step INTEGER DEFAULT 0,
  execution_logs JSONB DEFAULT '[]'::jsonb, -- logs from each step
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_executions ENABLE ROW LEVEL SECURITY;

-- RLS policies for automations
CREATE POLICY "Admins can manage automations" 
ON public.automations 
FOR ALL 
USING (is_admin());

CREATE POLICY "Users can view automations they created" 
ON public.automations 
FOR SELECT 
USING (created_by = auth.uid() OR is_admin());

-- RLS policies for automation executions
CREATE POLICY "Admins can manage automation executions" 
ON public.automation_executions 
FOR ALL 
USING (is_admin());

CREATE POLICY "Users can view executions for their automations" 
ON public.automation_executions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.automations 
    WHERE automations.id = automation_executions.automation_id 
    AND (automations.created_by = auth.uid() OR is_admin())
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_automation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_automations_updated_at
BEFORE UPDATE ON public.automations
FOR EACH ROW
EXECUTE FUNCTION public.update_automation_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_automations_trigger_type ON public.automations(trigger_type);
CREATE INDEX idx_automations_is_active ON public.automations(is_active);
CREATE INDEX idx_automation_executions_automation_id ON public.automation_executions(automation_id);
CREATE INDEX idx_automation_executions_status ON public.automation_executions(status);
CREATE INDEX idx_automation_executions_order_id ON public.automation_executions(order_id);