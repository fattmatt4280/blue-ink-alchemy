-- Create table to log all Stripe webhook events
CREATE TABLE public.stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  status TEXT DEFAULT 'received',
  payload JSONB,
  error_message TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Create table for webhook health checks
CREATE TABLE public.webhook_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  orders_without_webhook INTEGER DEFAULT 0,
  last_webhook_received TIMESTAMPTZ,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_health_checks ENABLE ROW LEVEL SECURITY;

-- RLS policies for stripe_webhook_events
CREATE POLICY "Admins can view webhook events"
ON public.stripe_webhook_events FOR SELECT
USING (is_admin());

CREATE POLICY "Service can manage webhook events"
ON public.stripe_webhook_events FOR ALL
USING (true);

-- RLS policies for webhook_health_checks
CREATE POLICY "Admins can view health checks"
ON public.webhook_health_checks FOR SELECT
USING (is_admin());

CREATE POLICY "Service can manage health checks"
ON public.webhook_health_checks FOR ALL
USING (true);

-- Index for faster lookups
CREATE INDEX idx_webhook_events_created_at ON public.stripe_webhook_events(created_at DESC);
CREATE INDEX idx_webhook_events_event_type ON public.stripe_webhook_events(event_type);
CREATE INDEX idx_webhook_events_status ON public.stripe_webhook_events(status);