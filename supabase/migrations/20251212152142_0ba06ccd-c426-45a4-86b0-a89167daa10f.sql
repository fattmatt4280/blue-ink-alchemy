-- Add RLS policy to allow admins to view all orders
CREATE POLICY "admins_can_view_all_orders" ON public.orders
  FOR SELECT TO authenticated
  USING (is_admin());