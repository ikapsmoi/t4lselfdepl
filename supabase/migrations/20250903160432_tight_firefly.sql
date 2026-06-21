/*
  # Create saved_trips and host_details tables

  1. New Tables
    - `saved_trips`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles.id)
      - `trip_id` (uuid, foreign key to trips.id)
      - `created_at` (timestamp)
    - `host_details`
      - `id` (uuid, primary key, foreign key to profiles.id)
      - `instagram` (text)
      - `youtube` (text)
      - `tiktok` (text)
      - `facebook` (text)
      - `mobile` (text)
      - `address` (text)
      - `bank_details` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own data
*/

-- Create saved_trips table
CREATE TABLE IF NOT EXISTS saved_trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, trip_id)
);

-- Create host_details table
CREATE TABLE IF NOT EXISTS host_details (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  instagram text,
  youtube text,
  tiktok text,
  facebook text,
  mobile text,
  address text,
  bank_details text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE saved_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_details ENABLE ROW LEVEL SECURITY;

-- Policies for saved_trips
CREATE POLICY "Users can manage their saved trips"
  ON saved_trips
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for host_details
CREATE POLICY "Hosts can manage their details"
  ON host_details
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_trips_user_id ON saved_trips(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_trips_trip_id ON saved_trips(trip_id);
CREATE INDEX IF NOT EXISTS idx_saved_trips_created_at ON saved_trips(created_at);

-- Add trigger for host_details updated_at
CREATE OR REPLACE FUNCTION update_host_details_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_host_details_updated_at
  BEFORE UPDATE ON host_details
  FOR EACH ROW
  EXECUTE FUNCTION update_host_details_updated_at();