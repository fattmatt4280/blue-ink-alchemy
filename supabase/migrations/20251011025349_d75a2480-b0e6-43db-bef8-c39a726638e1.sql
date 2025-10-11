-- Fix abandoned_carts RLS policies - Remove overly permissive service policy
DROP POLICY IF EXISTS "Service can manage abandoned carts" ON public.abandoned_carts;
DROP POLICY IF EXISTS "Users can view their own abandoned carts" ON public.abandoned_carts;

-- Create granular policies for abandoned_carts
CREATE POLICY "Users can view their own abandoned carts"
ON public.abandoned_carts
FOR SELECT
USING (auth.email() = email OR is_admin());

CREATE POLICY "Service can insert abandoned carts"
ON public.abandoned_carts
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service can update abandoned carts"
ON public.abandoned_carts
FOR UPDATE
USING (true);

-- Fix healaid_activation_codes RLS policies - Remove code enumeration vulnerability
DROP POLICY IF EXISTS "Users can view codes during activation" ON public.healaid_activation_codes;

-- Only allow users to see their own activated codes or admins to see all
CREATE POLICY "Users can view their own activated codes"
ON public.healaid_activation_codes
FOR SELECT
USING (activated_by = auth.uid() OR is_admin());