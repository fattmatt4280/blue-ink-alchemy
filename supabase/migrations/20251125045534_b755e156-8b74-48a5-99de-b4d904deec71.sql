-- Add RLS policy for admins to delete abandoned carts
CREATE POLICY "Admins can delete abandoned carts"
ON abandoned_carts
FOR DELETE
TO authenticated
USING (is_admin());