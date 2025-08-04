-- Enable realtime for analytics tables
ALTER TABLE public.website_metrics REPLICA IDENTITY FULL;
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.conversion_funnel REPLICA IDENTITY FULL;
ALTER TABLE public.analytics_events REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.website_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversion_funnel;
ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics_events;