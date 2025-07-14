
-- Allow public insert for analytics events (since we want to track all visitors, not just authenticated users)
DROP POLICY IF EXISTS "admins_can_manage_analytics" ON public.analytics_events;

-- Create a policy that allows anyone to insert analytics events
CREATE POLICY "allow_public_analytics_insert" ON public.analytics_events
  FOR INSERT WITH CHECK (true);

-- Keep the admin-only select policy
CREATE POLICY "admins_can_view_analytics" ON public.analytics_events
  FOR SELECT USING (is_admin());

-- Allow public insert for website metrics aggregation
CREATE POLICY "allow_public_metrics_insert" ON public.website_metrics
  FOR INSERT WITH CHECK (true);

-- Allow public insert for conversion funnel data
CREATE POLICY "allow_public_funnel_insert" ON public.conversion_funnel
  FOR INSERT WITH CHECK (true);

-- Allow public insert for demographics data  
CREATE POLICY "allow_public_demographics_insert" ON public.user_demographics
  FOR INSERT WITH CHECK (true);
