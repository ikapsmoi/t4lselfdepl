/*
  # Add currency column to trips table

  1. Changes
    - Add `currency` column to `trips` table with default value 'USD'
    - Set NOT NULL constraint with default to ensure data consistency

  2. Notes
    - All existing trips will automatically get 'USD' as default currency
    - New trips can specify their preferred currency
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trips' AND column_name = 'currency'
  ) THEN
    ALTER TABLE trips ADD COLUMN currency text DEFAULT 'USD' NOT NULL;
  END IF;
END $$;