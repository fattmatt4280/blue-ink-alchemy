-- Phase 4 Step 1: MFA Enforcement & Brute Force Protection

-- Add MFA enforcement tracking to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS mfa_enforced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS failed_mfa_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS mfa_locked_until TIMESTAMP WITH TIME ZONE;

-- Create login_attempts table for brute force protection
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time ON public.login_attempts(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time ON public.login_attempts(ip_address, created_at DESC);

-- Enable RLS on login_attempts
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Admins can view all login attempts
CREATE POLICY "Admins can view all login attempts"
ON public.login_attempts
FOR SELECT
USING (is_admin());

-- Service can insert login attempts
CREATE POLICY "Service can insert login attempts"
ON public.login_attempts
FOR INSERT
WITH CHECK (true);

-- Function to check if account is locked due to failed attempts
CREATE OR REPLACE FUNCTION public.is_account_locked(check_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  failed_count INTEGER;
  last_attempt TIMESTAMPTZ;
BEGIN
  -- Check MFA lockout first
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE email = check_email 
    AND mfa_locked_until IS NOT NULL 
    AND mfa_locked_until > now()
  ) THEN
    RETURN TRUE;
  END IF;

  -- Check failed login attempts in last 15 minutes
  SELECT COUNT(*), MAX(created_at)
  INTO failed_count, last_attempt
  FROM login_attempts
  WHERE email = check_email
    AND success = FALSE
    AND created_at > now() - interval '15 minutes';
  
  -- Lock if 5+ failed attempts in 15 minutes
  RETURN failed_count >= 5;
END;
$$;

-- Function to log login attempt
CREATE OR REPLACE FUNCTION public.log_login_attempt(
  attempt_email TEXT,
  attempt_ip TEXT,
  attempt_user_agent TEXT,
  attempt_success BOOLEAN,
  attempt_failure_reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO login_attempts (email, ip_address, user_agent, success, failure_reason)
  VALUES (attempt_email, attempt_ip, attempt_user_agent, attempt_success, attempt_failure_reason);
END;
$$;