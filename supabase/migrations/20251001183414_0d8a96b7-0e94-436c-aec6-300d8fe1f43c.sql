-- Remove the dangerous anonymous access from healing_progress SELECT policy
DROP POLICY IF EXISTS "Users can view their own healing progress" ON public.healing_progress;

-- Create a secure policy that only allows authenticated users to view their own data
CREATE POLICY "Authenticated users can view their own healing progress" 
ON public.healing_progress 
FOR SELECT 
USING (auth.uid() = user_id);

-- Update the INSERT policy to require authentication as well
-- This prevents anonymous medical data submission which creates orphaned records
DROP POLICY IF EXISTS "Anyone can insert healing progress" ON public.healing_progress;

CREATE POLICY "Authenticated users can insert their own healing progress" 
ON public.healing_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);