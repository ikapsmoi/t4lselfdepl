/*
  # Analytics Events Tracking

  1. New Tables
    - `analytics_events`
      - `id` (uuid, primary key)
      - `event_name` (text, the type of event)
      - `user_id` (uuid, nullable, links to profiles)
      - `session_id` (text, tracks user sessions)
      - `timestamp` (timestamptz, when event occurred)
      - `metadata` (jsonb, additional event data)
      - `ip_address` (inet, user's IP)
      - `user_agent` (text, browser info)

  2. Security
    - Enable RLS on `analytics_events` table
    - Allow inserts for all users (authenticated and anonymous)
    - Allow selects only for admin users and service role
    - Add indexes for performance

  3. Functions
    - Create function to generate session IDs
    - Create trigger to auto-populate timestamps
*/

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow inserts for all users"
  ON analytics_events
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow selects for admin users"
  ON analytics_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Allow all operations for service role"
  ON analytics_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_timestamp ON analytics_events(event_name, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_event ON analytics_events(user_id, event_name, timestamp DESC);