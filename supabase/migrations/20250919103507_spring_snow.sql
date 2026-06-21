/*
  # Add group_discount column to trips table

  1. Schema Changes
    - Add `group_discount` column to `trips` table
      - `group_discount` (numeric, default 0.0) - Percentage discount for group bookings

  2. Notes
    - This column is required by the CreateTripModal component
    - Default value of 0.0 ensures existing trips are not affected
    - Uses numeric type for precise decimal calculations
*/

-- Add group_discount column to trips table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trips' AND column_name = 'group_discount'
  ) THEN
    ALTER TABLE trips ADD COLUMN group_discount numeric(5,2) DEFAULT 0.0;
  END IF;
END $$;