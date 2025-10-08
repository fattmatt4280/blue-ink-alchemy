-- Phase 3 Security: Add MFA, PII Logging, and AI Model Security

-- Add MFA columns to profiles
ALTER TABLE public.profiles
ADD COLUMN mfa_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN mfa_secret TEXT,
ADD COLUMN backup_codes JSONB DEFAULT '[]'::jsonb;

-- Create MFA sessions table
CREATE TABLE public.mfa_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.mfa_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own MFA sessions"
ON public.mfa_sessions
FOR ALL
USING (auth.uid() = user_id);

-- Create PII access log table
CREATE TABLE public.pii_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  accessed_user_id UUID NOT NULL,
  pii_type TEXT NOT NULL CHECK (pii_type IN ('email', 'phone', 'address', 'full_profile', 'healing_photos')),
  access_reason TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.pii_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all PII access logs"
ON public.pii_access_log
FOR SELECT
USING (is_admin());

CREATE POLICY "Service can insert PII access logs"
ON public.pii_access_log
FOR INSERT
WITH CHECK (true);

-- Add AI model security columns to ai_response_logs
ALTER TABLE public.ai_response_logs
ADD COLUMN model_version TEXT,
ADD COLUMN response_signature TEXT,
ADD COLUMN fallback_used BOOLEAN DEFAULT FALSE,
ADD COLUMN baseline_deviation_score NUMERIC;

-- Create indexes for performance
CREATE INDEX idx_profiles_mfa ON public.profiles(id) WHERE mfa_enabled = TRUE;
CREATE INDEX idx_pii_access_admin ON public.pii_access_log(admin_user_id, created_at DESC);
CREATE INDEX idx_pii_access_user ON public.pii_access_log(accessed_user_id, created_at DESC);
CREATE INDEX idx_ai_logs_model_version ON public.ai_response_logs(model_version, created_at DESC);
CREATE INDEX idx_mfa_sessions_user ON public.mfa_sessions(user_id, expires_at DESC);