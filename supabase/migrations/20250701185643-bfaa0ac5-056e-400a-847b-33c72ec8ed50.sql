
-- Create analytics tables to store tracking data
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'page_view', 'product_view', 'add_to_cart', 'checkout_start', 'purchase', 'tiktok_event'
  event_data JSONB NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  page_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create website metrics table for aggregated data
CREATE TABLE public.website_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  metric_type TEXT NOT NULL, -- 'visits', 'page_views', 'unique_visitors', 'bounce_rate'
  value INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(date, metric_type)
);

-- Create conversion funnel table
CREATE TABLE public.conversion_funnel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  step_name TEXT NOT NULL, -- 'visits', 'product_views', 'add_to_cart', 'checkout', 'purchase'
  count INTEGER NOT NULL DEFAULT 0,
  conversion_rate DECIMAL(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(date, step_name)
);

-- Create demographics table
CREATE TABLE public.user_demographics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  age_group TEXT,
  gender TEXT,
  region TEXT,
  source TEXT, -- 'tiktok', 'organic', 'stripe'
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_funnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_demographics ENABLE ROW LEVEL SECURITY;

-- Create policies (admin only access)
CREATE POLICY "admins_can_view_analytics" ON public.analytics_events
  FOR SELECT USING (is_admin());

CREATE POLICY "admins_can_manage_analytics" ON public.analytics_events
  FOR ALL USING (is_admin());

CREATE POLICY "admins_can_view_metrics" ON public.website_metrics
  FOR SELECT USING (is_admin());

CREATE POLICY "admins_can_manage_metrics" ON public.website_metrics
  FOR ALL USING (is_admin());

CREATE POLICY "admins_can_view_funnel" ON public.conversion_funnel
  FOR SELECT USING (is_admin());

CREATE POLICY "admins_can_manage_funnel" ON public.conversion_funnel
  FOR ALL USING (is_admin());

CREATE POLICY "admins_can_view_demographics" ON public.user_demographics
  FOR SELECT USING (is_admin());

CREATE POLICY "admins_can_manage_demographics" ON public.user_demographics
  FOR ALL USING (is_admin());

-- Create indexes for better performance
CREATE INDEX idx_analytics_events_type_date ON public.analytics_events(event_type, created_at);
CREATE INDEX idx_analytics_events_session ON public.analytics_events(session_id);
CREATE INDEX idx_website_metrics_date ON public.website_metrics(date);
CREATE INDEX idx_conversion_funnel_date ON public.conversion_funnel(date);
CREATE INDEX idx_demographics_date ON public.user_demographics(date);
