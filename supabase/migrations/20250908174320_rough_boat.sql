/*
  # Create trip_addons table and update payment_gateway enum

  1. New Tables
    - `trip_addons`
      - `id` (uuid, primary key)
      - `trip_id` (uuid, foreign key to trips.id)
      - `name` (text, not null)
      - `duration` (text)
      - `price` (numeric(10,2), not null)
      - `description` (text)
      - `inclusions` (text array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Enum Updates
    - Add 'BankTransfer' to payment_gateway enum

  3. Security
    - Enable RLS on `trip_addons` table
    - Add policies for hosts to manage their trip add-ons
    - Add policies for authenticated users to read add-ons
*/

-- Add BankTransfer to payment_gateway enum
ALTER TYPE payment_gateway ADD VALUE IF NOT EXISTS 'BankTransfer';

-- Create trip_addons table
CREATE TABLE IF NOT EXISTS trip_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  name text NOT NULL,
  duration text,
  price numeric(10,2) NOT NULL,
  description text,
  inclusions text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE trip_addons ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Hosts can manage their trip add-ons"
  ON trip_addons
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = trip_addons.trip_id 
      AND trips.host_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = trip_addons.trip_id 
      AND trips.host_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can read trip add-ons"
  ON trip_addons
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trip_addons_trip_id ON trip_addons(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_addons_created_at ON trip_addons(created_at);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_trip_addons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trip_addons_updated_at
  BEFORE UPDATE ON trip_addons
  FOR EACH ROW
  EXECUTE FUNCTION update_trip_addons_updated_at();