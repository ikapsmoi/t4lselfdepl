CREATE OR REPLACE FUNCTION public.is_travel4life_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles AS admin_profile
    WHERE admin_profile.id = auth.uid()
      AND admin_profile.role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_travel4life_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_travel4life_admin() TO authenticated;

DROP POLICY IF EXISTS "Admins can read all trips" ON public.trips;
CREATE POLICY "Admins can read all trips"
  ON public.trips
  FOR SELECT
  TO authenticated
  USING (public.is_travel4life_admin());

DROP POLICY IF EXISTS "Admins can update all trips" ON public.trips;
CREATE POLICY "Admins can update all trips"
  ON public.trips
  FOR UPDATE
  TO authenticated
  USING (public.is_travel4life_admin())
  WITH CHECK (public.is_travel4life_admin());
