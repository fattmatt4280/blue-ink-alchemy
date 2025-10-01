-- Update handle_new_user function to only grant admin to specific email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  -- Only make matt@dreamtattoocompany.com an admin
  IF NEW.email = 'matt@dreamtattoocompany.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Clean up existing roles: Remove admin role from everyone except matt@dreamtattoocompany.com
DELETE FROM public.user_roles
WHERE role = 'admin'
AND user_id NOT IN (
  SELECT id FROM auth.users WHERE email = 'matt@dreamtattoocompany.com'
);

-- Ensure all users without roles get a 'user' role
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'user'::user_role
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.user_id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;