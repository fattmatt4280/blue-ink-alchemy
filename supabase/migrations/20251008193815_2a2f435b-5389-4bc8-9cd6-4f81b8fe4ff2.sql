-- Phase 1 Security: Create tables for contact submissions, audit logging, AI response tracking, and rate limit violations

-- Contact submissions table
CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'responded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ
);

-- Admin audit log table (immutable)
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES public.profiles(id),
  action_type TEXT NOT NULL CHECK (action_type IN ('create', 'update', 'delete', 'export', 'generate')),
  resource_type TEXT NOT NULL,
  resource_id UUID,
  action_details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI response logs for integrity checking
CREATE TABLE public.ai_response_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  healing_progress_id UUID REFERENCES public.healing_progress(id),
  request_hash TEXT NOT NULL,
  response_hash TEXT NOT NULL,
  model_used TEXT NOT NULL,
  response_time_ms INTEGER,
  healing_stage TEXT,
  risk_level TEXT,
  anomaly_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rate limit violations tracking
CREATE TABLE public.rate_limit_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  action_type TEXT NOT NULL,
  violation_count INTEGER NOT NULL DEFAULT 1,
  first_violation_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_violation_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  blocked_until TIMESTAMPTZ
);

-- Enable RLS on all tables
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_response_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_violations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contact_submissions
CREATE POLICY "Anyone can submit contact forms"
  ON public.contact_submissions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view contact submissions"
  ON public.contact_submissions
  FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update contact submissions"
  ON public.contact_submissions
  FOR UPDATE
  USING (is_admin());

-- RLS Policies for admin_audit_log (immutable - no UPDATE or DELETE)
CREATE POLICY "Service can insert audit logs"
  ON public.admin_audit_log
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_log
  FOR SELECT
  USING (is_admin());

-- RLS Policies for ai_response_logs
CREATE POLICY "Service can insert AI logs"
  ON public.ai_response_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own AI logs"
  ON public.ai_response_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all AI logs"
  ON public.ai_response_logs
  FOR SELECT
  USING (is_admin());

-- RLS Policies for rate_limit_violations
CREATE POLICY "Service can manage rate limit violations"
  ON public.rate_limit_violations
  FOR ALL
  USING (true);

CREATE POLICY "Admins can view rate limit violations"
  ON public.rate_limit_violations
  FOR SELECT
  USING (is_admin());

-- Create indexes for performance
CREATE INDEX idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);
CREATE INDEX idx_admin_audit_log_admin_user ON public.admin_audit_log(admin_user_id);
CREATE INDEX idx_admin_audit_log_created_at ON public.admin_audit_log(created_at DESC);
CREATE INDEX idx_ai_response_logs_user ON public.ai_response_logs(user_id);
CREATE INDEX idx_ai_response_logs_healing_progress ON public.ai_response_logs(healing_progress_id);
CREATE INDEX idx_rate_limit_violations_identifier ON public.rate_limit_violations(identifier);
CREATE INDEX idx_rate_limit_violations_action ON public.rate_limit_violations(action_type);