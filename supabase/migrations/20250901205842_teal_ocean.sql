/*
  # Create Trips Table

  1. New Tables
    - `trips`
      - `id` (uuid, primary key)
      - `host_id` (uuid, foreign key to users)
      - `title` (text)
      - `category` (enum)
      - `location` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `itinerary` (jsonb)
      - `price_per_person` (decimal)
      - `group_size` (integer)
      - `nomadic_badge` (boolean)
      - `status` (enum)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `trips` table
    - Add policies for public read and host management
*/

-- Create enums
CREATE TYPE trip_category AS ENUM ('adventure', 'spiritual', 'food', 'wellness', 'luxury', 'budget', 'women-only');
CREATE TYPE trip_status AS ENUM ('active', 'cancelled', 'completed');

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  category trip_category NOT NULL,
  location text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  itinerary jsonb DEFAULT '[]',
  price_per_person decimal(10,2) NOT NULL,
  group_size integer NOT NULL DEFAULT 1,
  nomadic_badge boolean DEFAULT false,
  status trip_status DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read active trips"
  ON trips
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "Hosts can manage their trips"
  ON trips
  FOR ALL
  TO authenticated
  USING (auth.uid() = host_id);

-- Create indexes
CREATE INDEX idx_trips_host_id ON trips(host_id);
CREATE INDEX idx_trips_category ON trips(category);
CREATE INDEX idx_trips_location ON trips(location);
CREATE INDEX idx_trips_start_date ON trips(start_date);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_created_at ON trips(created_at);

-- Create updated_at trigger
CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();