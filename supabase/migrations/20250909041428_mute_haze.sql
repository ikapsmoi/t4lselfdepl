/*
  # Add images column to trips table

  1. Schema Changes
    - Add `images` column to `trips` table to store array of image URLs
    - Set default value to empty array
    - Allow hosts to update their own trip images

  2. Security
    - Existing RLS policies on trips table will handle access control
    - Hosts can only update their own trips (host_id = auth.uid())
*/

-- Add images column to trips table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trips' AND column_name = 'images'
  ) THEN
    ALTER TABLE trips ADD COLUMN images text[] DEFAULT '{}';
  END IF;
END $$;