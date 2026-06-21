/*
  # Add top_rated column to trips table

  1. New Columns
    - `top_rated` (boolean, default false) - Allows manual selection of trips for "Top Rated Adventures" section

  2. Changes
    - Add top_rated column to trips table with default value false
    - Add index for performance when filtering top rated trips

  3. Notes
    - This allows hosts to manually mark their trips as "top rated" instead of relying only on rating scores
    - Provides more control over which trips appear in the featured "Top Rated Adventures" section
*/

-- Add top_rated column to trips table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trips' AND column_name = 'top_rated'
  ) THEN
    ALTER TABLE trips ADD COLUMN top_rated boolean DEFAULT false;
  END IF;
END $$;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_trips_top_rated ON trips(top_rated) WHERE top_rated = true;