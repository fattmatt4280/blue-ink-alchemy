
-- Create function to increment daily metrics
CREATE OR REPLACE FUNCTION increment_daily_metric(
  metric_date DATE,
  metric_name TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO website_metrics (date, metric_type, value)
  VALUES (metric_date, metric_name, 1)
  ON CONFLICT (date, metric_type)
  DO UPDATE SET 
    value = website_metrics.value + 1,
    created_at = now();
END;
$$ LANGUAGE plpgsql;

-- Create function to get analytics summary
CREATE OR REPLACE FUNCTION get_analytics_summary(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '7 days',
  end_date DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
  total_visits BIGINT,
  unique_visitors BIGINT,
  page_views BIGINT,
  total_events BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN wm.metric_type = 'visits' THEN wm.value END), 0)::BIGINT as total_visits,
    COALESCE(SUM(CASE WHEN wm.metric_type = 'unique_visitors' THEN wm.value END), 0)::BIGINT as unique_visitors,
    COALESCE(SUM(CASE WHEN wm.metric_type = 'page_views' THEN wm.value END), 0)::BIGINT as page_views,
    COALESCE(COUNT(ae.id), 0)::BIGINT as total_events
  FROM website_metrics wm
  FULL OUTER JOIN analytics_events ae ON DATE(ae.created_at) BETWEEN start_date AND end_date
  WHERE wm.date BETWEEN start_date AND end_date
     OR ae.created_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;
