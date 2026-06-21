/*
  # Add profile fields for enhanced user management

  1. New Columns
    - `instagram_id` (text) - User's Instagram handle
    - `city_id` (text) - Unique identifier for selected city
    - `city_name` (text) - Display name of the city
    - `state_name` (text) - State/province name

  2. Indexes
    - Index on `city_id` for efficient location-based queries

  3. Security
    - Maintains existing RLS policies
*/

-- Add new columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'instagram_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN instagram_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'city_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN city_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'city_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN city_name TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'state_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN state_name TEXT;
  END IF;
END $$;

-- Create index for efficient city-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_city_id ON profiles(city_id);
CREATE INDEX IF NOT EXISTS idx_profiles_city_name ON profiles(city_name);
CREATE INDEX IF NOT EXISTS idx_profiles_state_name ON profiles(state_name);

-- Create audit table for authentication events
CREATE TABLE IF NOT EXISTS auth_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event_type text NOT NULL,
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE auth_audit ENABLE ROW LEVEL SECURITY;

-- Create policy for audit table (only service role can access)
CREATE POLICY "Service role can manage audit logs"
  ON auth_audit
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create index for audit queries
CREATE INDEX IF NOT EXISTS idx_auth_audit_user_id ON auth_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_event_type ON auth_audit(event_type);
CREATE INDEX IF NOT EXISTS idx_auth_audit_created_at ON auth_audit(created_at);

-- Create rate limiting table for failed login attempts
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- email or IP
  attempt_count integer DEFAULT 1,
  first_attempt timestamptz DEFAULT now(),
  last_attempt timestamptz DEFAULT now(),
  locked_until timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policy for rate limits (only service role can access)
CREATE POLICY "Service role can manage rate limits"
  ON rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create unique index for rate limiting
CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_locked_until ON rate_limits(locked_until);