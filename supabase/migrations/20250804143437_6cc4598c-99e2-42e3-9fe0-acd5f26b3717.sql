-- Create the missing increment_daily_metric function that AnalyticsTracker is calling
CREATE OR REPLACE FUNCTION public.increment_daily_metric(
  metric_date DATE,
  metric_name TEXT
) RETURNS void AS $$
BEGIN
  INSERT INTO public.website_metrics (date, metric_type, value, created_at)
  VALUES (metric_date, metric_name, 1, now())
  ON CONFLICT (date, metric_type) 
  DO UPDATE SET 
    value = website_metrics.value + 1,
    created_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix RLS policies for analytics_events to allow service inserts
DROP POLICY IF EXISTS "service_can_insert_analytics" ON public.analytics_events;
CREATE POLICY "service_can_insert_analytics" ON public.analytics_events
FOR INSERT
WITH CHECK (true);

-- Add unique constraint for website_metrics to prevent duplicates
ALTER TABLE public.website_metrics 
ADD CONSTRAINT unique_date_metric_type 
UNIQUE (date, metric_type);

-- Create order status history table for better tracking
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  changed_by TEXT,
  notes TEXT
);

-- Enable RLS on order status history
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Create policies for order status history
CREATE POLICY "users_can_view_own_order_history" ON public.order_status_history
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE orders.id = order_status_history.order_id 
  AND (orders.user_id = auth.uid() OR orders.email = auth.email())
));

CREATE POLICY "service_can_manage_order_history" ON public.order_status_history
FOR ALL
USING (true);

-- Create trigger to automatically track order status changes
CREATE OR REPLACE FUNCTION public.track_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.order_status_history (order_id, old_status, new_status, changed_by, notes)
    VALUES (NEW.id, OLD.status, NEW.status, 'system', 'Status updated automatically');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_status_change_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.track_order_status_change();