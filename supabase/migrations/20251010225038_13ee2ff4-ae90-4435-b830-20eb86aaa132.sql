-- Add new columns to healaid_subscriptions for usage tracking and Stripe integration
ALTER TABLE public.healaid_subscriptions
ADD COLUMN IF NOT EXISTS analyses_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_uploads_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_upload_date DATE,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Create table for tracking daily usage per user
CREATE TABLE IF NOT EXISTS public.healaid_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.healaid_subscriptions(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  analyses_count INTEGER DEFAULT 0,
  uploads_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable RLS on usage tracking table
ALTER TABLE public.healaid_usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policies for usage tracking
CREATE POLICY "Users can view own usage"
  ON public.healaid_usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can manage usage"
  ON public.healaid_usage_tracking FOR ALL
  USING (true);

-- Add comment for documentation
COMMENT ON TABLE public.healaid_usage_tracking IS 'Tracks daily upload and analysis counts per user for tier-based limits';