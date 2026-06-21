/*
  # Create Bookings Table

  1. New Tables
    - `bookings`
      - `id` (uuid, primary key)
      - `trip_id` (uuid, foreign key to trips)
      - `traveler_id` (uuid, foreign key to users)
      - `host_id` (uuid, foreign key to users)
      - `booking_date` (timestamp)
      - `status` (enum)
      - `payment_id` (uuid, foreign key to payments)
      - `installment_plan` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `bookings` table
    - Add policies for travelers and hosts
*/

-- Create enum for booking status
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled');

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  traveler_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  host_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_date timestamptz DEFAULT now(),
  status booking_status DEFAULT 'pending',
  payment_id uuid,
  installment_plan jsonb DEFAULT '{"enabled": false, "remainingAmount": 0, "dueDates": []}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Travelers can read their bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = traveler_id);

CREATE POLICY "Hosts can read bookings for their trips"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = host_id);

CREATE POLICY "Travelers can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = traveler_id);

CREATE POLICY "Travelers can update their bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = traveler_id);

CREATE POLICY "Hosts can update bookings for their trips"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_id);

-- Create indexes
CREATE INDEX idx_bookings_trip_id ON bookings(trip_id);
CREATE INDEX idx_bookings_traveler_id ON bookings(traveler_id);
CREATE INDEX idx_bookings_host_id ON bookings(host_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_booking_date ON bookings(booking_date);

-- Create unique constraint to prevent duplicate bookings
CREATE UNIQUE INDEX idx_unique_booking_per_trip_traveler 
  ON bookings(trip_id, traveler_id) 
  WHERE status != 'cancelled';

-- Create updated_at trigger
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();