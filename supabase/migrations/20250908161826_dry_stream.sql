/*
  # Add phone column to profiles table

  1. Changes
    - Add `phone` column to `profiles` table for storing user phone numbers
  
  2. Security
    - Column allows NULL values for optional phone numbers
    - No additional RLS policies needed as existing policies cover all columns
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone TEXT;
  END IF;
END $$;