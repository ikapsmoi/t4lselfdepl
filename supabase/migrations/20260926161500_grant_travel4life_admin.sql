DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE email = 'info@travel4life.net'
  ) THEN
    RAISE EXCEPTION 'Cannot grant admin role: info@travel4life.net has no profile.';
  END IF;

  UPDATE public.profiles
  SET role = 'admin'
  WHERE email = 'info@travel4life.net';
END;
$$;

CREATE OR REPLACE FUNCTION public.protect_profile_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
    AND auth.uid() IS NOT NULL
    AND COALESCE(auth.role(), 'authenticated') <> 'service_role'
    AND NOT EXISTS (
      SELECT 1
      FROM public.profiles AS actor
      WHERE actor.id = auth.uid()
        AND actor.role = 'admin'
    )
  THEN
    RAISE EXCEPTION 'Only administrators can change profile roles.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_role_changes ON public.profiles;

CREATE TRIGGER protect_profile_role_changes
  BEFORE UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_role_changes();