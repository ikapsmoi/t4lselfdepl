/*
  # Add discount tracking for exit-intent signups

  1. New Columns
    - `profiles.discount_eligible_first_booking` (boolean) - Tracks if user is eligible for first booking discount
    - `profiles.discount_used_at` (timestamp) - Tracks when discount was used
    - `profiles.signup_source` (text) - Tracks where user signed up from

  2. Security
    - No RLS changes needed as existing policies cover new columns

  3. Analytics Enhancement
    - Supports tracking discount effectiveness
*/

-- Add discount tracking columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'discount_eligible_first_booking'
  ) THEN
    ALTER TABLE profiles ADD COLUMN discount_eligible_first_booking boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'discount_used_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN discount_used_at timestamptz DEFAULT null;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'signup_source'
  ) THEN
    ALTER TABLE profiles ADD COLUMN signup_source text DEFAULT 'direct';
  END IF;
END $$;

-- Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_discount_eligible 
ON profiles (discount_eligible_first_booking) 
WHERE discount_eligible_first_booking = true;

-- Create index for signup source analytics
CREATE INDEX IF NOT EXISTS idx_profiles_signup_source 
ON profiles (signup_source);