/*
  # Authentication Audit Table

  1. New Table
    - `auth_audit` - Track all authentication events for security monitoring

  2. Columns
    - `id` (uuid, primary key)
    - `user_id` (uuid, nullable) - Links to auth.users when available
    - `email` (text) - Email address involved in the event
    - `event_type` (enum) - Type of authentication event
    - `ip_address` (inet) - Client IP address
    - `user_agent` (text) - Client user agent
    - `success` (boolean) - Whether the event was successful
    - `error_message` (text, nullable) - Error details if failed
    - `metadata` (jsonb) - Additional event-specific data
    - `created_at` (timestamptz) - When the event occurred

  3. Security
    - Enable RLS with admin-only access
    - Indexes for efficient querying and rate limiting
*/

-- Create event type enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'auth_event_type') THEN
    CREATE TYPE auth_event_type AS ENUM (
      'signup_attempt',
      'signup_success',
      'login_attempt', 
      'login_success',
      'login_failed',
      'password_reset_request',
      'password_reset_success',
      'email_verification_sent',
      'email_verified',
      'account_locked',
      'profile_updated'
    );
  END IF;
END $$;

-- Create audit table
CREATE TABLE IF NOT EXISTS auth_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  event_type auth_event_type NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE auth_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin only access
CREATE POLICY "Admin can read all audit logs"
  ON auth_audit
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Service role can insert audit logs"
  ON auth_audit
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Indexes for performance and rate limiting
CREATE INDEX IF NOT EXISTS idx_auth_audit_email_created ON auth_audit(email, created_at);
CREATE INDEX IF NOT EXISTS idx_auth_audit_user_id ON auth_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_event_type ON auth_audit(event_type);
CREATE INDEX IF NOT EXISTS idx_auth_audit_ip_created ON auth_audit(ip_address, created_at);
CREATE INDEX IF NOT EXISTS idx_auth_audit_created_at ON auth_audit(created_at);

-- Function to check rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_email TEXT,
  p_event_type auth_event_type,
  p_time_window INTERVAL DEFAULT '15 minutes',
  p_max_attempts INTEGER DEFAULT 5
)
RETURNS BOOLEAN AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO attempt_count
  FROM auth_audit
  WHERE email = p_email
    AND event_type = p_event_type
    AND created_at > (now() - p_time_window);
    
  RETURN attempt_count < p_max_attempts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;