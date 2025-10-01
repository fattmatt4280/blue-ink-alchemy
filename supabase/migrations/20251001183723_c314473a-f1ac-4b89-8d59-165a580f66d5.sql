-- Add search_path security to database functions that are missing it
-- This prevents privilege escalation through search path manipulation

-- Update blog post trigger function
CREATE OR REPLACE FUNCTION public.update_blog_post_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update expert knowledge trigger function
CREATE OR REPLACE FUNCTION public.update_expert_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;