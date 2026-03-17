
-- Referrals: users can view their own
CREATE POLICY "Users can view own referrals" ON public.referrals
  FOR SELECT TO authenticated
  USING ((referrer_id = auth.uid()) OR (referred_user_id = auth.uid()));

-- Shipments: admin only
CREATE POLICY "Admins can manage shipments" ON public.shipments
  FOR ALL TO authenticated
  USING (is_admin());

-- Order status history: admin can manage
CREATE POLICY "Admins can manage order history" ON public.order_status_history
  FOR ALL TO authenticated
  USING (is_admin());
