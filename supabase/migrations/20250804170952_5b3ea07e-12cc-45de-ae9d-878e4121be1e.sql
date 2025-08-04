-- Add DELETE policy for orders table to allow admins to delete orders
CREATE POLICY "admins_can_delete_orders" ON public.orders
FOR DELETE
USING (is_admin());

-- Also add DELETE policy for admin management of other related tables if needed
CREATE POLICY "admins_can_delete_order_history" ON public.order_status_history
FOR DELETE
USING (is_admin());

CREATE POLICY "admins_can_delete_shipping_addresses" ON public.shipping_addresses
FOR DELETE
USING (is_admin());

CREATE POLICY "admins_can_delete_shipments" ON public.shipments
FOR DELETE
USING (is_admin());

CREATE POLICY "admins_can_delete_shipping_rates" ON public.shipping_rates
FOR DELETE
USING (is_admin());