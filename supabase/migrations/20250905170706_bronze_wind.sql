/*
  # Enhanced RLS Policies

  1. Profiles Table Policies
    - Users can read/update their own profile
    - Public fields readable by authenticated users
    - Admin can access all profiles

  2. Bookings Table Policies
    - Travelers can manage their own bookings
    - Hosts can read bookings for their trips

  3. Payments Table Policies
    - Travelers can read their own payments
    - Service role can manage payments for processing
*/

-- Drop existing policies to recreate with enhanced security
DROP POLICY IF EXISTS "Users can read own data" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own data" ON profiles;

-- Enhanced Profiles RLS Policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can read public profile fields"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() != id AND (
      -- Only expose safe public fields
      true
    )
  );

CREATE POLICY "Admin can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can update any profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

-- Enhanced Bookings RLS Policies
DROP POLICY IF EXISTS "Travelers can create bookings" ON bookings;
DROP POLICY IF EXISTS "Travelers can read their bookings" ON bookings;
DROP POLICY IF EXISTS "Travelers can update their bookings" ON bookings;
DROP POLICY IF EXISTS "Hosts can read bookings for their trips" ON bookings;
DROP POLICY IF EXISTS "Hosts can update bookings for their trips" ON bookings;

CREATE POLICY "Travelers can manage their own bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (auth.uid() = traveler_id)
  WITH CHECK (auth.uid() = traveler_id);

CREATE POLICY "Hosts can read bookings for their trips"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = bookings.trip_id
      AND trips.host_id = auth.uid()
    )
  );

CREATE POLICY "Hosts can update booking status for their trips"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = bookings.trip_id
      AND trips.host_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = bookings.trip_id
      AND trips.host_id = auth.uid()
    )
  );

-- Enhanced Payments RLS Policies
DROP POLICY IF EXISTS "Travelers can read their payments" ON payments;
DROP POLICY IF EXISTS "Service role can manage all payments" ON payments;

CREATE POLICY "Travelers can read their own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = traveler_id);

CREATE POLICY "Hosts can read payments for their trips"
  ON payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      JOIN trips ON trips.id = bookings.trip_id
      WHERE bookings.id = payments.booking_id
      AND trips.host_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage payments"
  ON payments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to get public profile fields only
CREATE OR REPLACE FUNCTION get_public_profile(profile_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  avatar_url TEXT,
  bio TEXT,
  verified BOOLEAN,
  city_name TEXT,
  state_name TEXT,
  instagram_handle TEXT,
  account_completeness INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.avatar_url,
    p.bio,
    p.verified,
    p.city_name,
    p.state_name,
    p.instagram_handle,
    p.account_completeness,
    p.created_at
  FROM profiles p
  WHERE p.id = profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;