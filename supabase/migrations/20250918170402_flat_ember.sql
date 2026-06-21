/*
  # Add Referral System

  1. New Tables
    - `referral_events`
      - `id` (uuid, primary key)
      - `referrer_id` (uuid, foreign key to profiles)
      - `referred_id` (uuid, foreign key to profiles)
      - `referred_booking_id` (uuid, foreign key to bookings)
      - `discount_percentage` (numeric)
      - `created_at` (timestamp)

  2. Modified Tables
    - `profiles` table: Add referral_code, referred_by, pending_referral_discount_percentage
    - `bookings` table: Add referral_discount_applied_percentage

  3. Security
    - Enable RLS on `referral_events` table
    - Add policies for users to read their own referral data
    - Add trigger for automatic referral discount calculation

  4. Functions
    - Create trigger function for handling referral discounts on new bookings
*/

-- Add columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'referral_code'
  ) THEN
    ALTER TABLE profiles ADD COLUMN referral_code text UNIQUE DEFAULT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'referred_by'
  ) THEN
    ALTER TABLE profiles ADD COLUMN referred_by uuid REFERENCES profiles(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'pending_referral_discount_percentage'
  ) THEN
    ALTER TABLE profiles ADD COLUMN pending_referral_discount_percentage numeric(5,2) DEFAULT 0.0;
  END IF;
END $$;

-- Add column to bookings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'referral_discount_applied_percentage'
  ) THEN
    ALTER TABLE bookings ADD COLUMN referral_discount_applied_percentage numeric(5,2) DEFAULT 0.0;
  END IF;
END $$;

-- Create referral_events table
CREATE TABLE IF NOT EXISTS referral_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  discount_percentage numeric(5,2) NOT NULL DEFAULT 2.0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on referral_events
ALTER TABLE referral_events ENABLE ROW LEVEL SECURITY;

-- Create policies for referral_events
CREATE POLICY "Users can read their own referral events"
  ON referral_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Service role can manage referral events"
  ON referral_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_referral_events_referrer_id ON referral_events(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_referred_id ON referral_events(referred_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_created_at ON referral_events(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);

-- Create trigger function for handling referral discounts
CREATE OR REPLACE FUNCTION handle_new_booking_referral_discount()
RETURNS TRIGGER AS $$
DECLARE
  referrer_profile_id uuid;
  friend_discount_percentage numeric(5,2) := 2.0;
  referrer_discount_percentage numeric(5,2) := 4.0;
BEGIN
  -- Check if the traveler was referred by someone
  SELECT referred_by INTO referrer_profile_id
  FROM profiles
  WHERE id = NEW.traveler_id;

  -- If this traveler was referred by someone
  IF referrer_profile_id IS NOT NULL THEN
    -- Apply 2% discount to the friend's booking
    UPDATE bookings
    SET referral_discount_applied_percentage = friend_discount_percentage
    WHERE id = NEW.id;

    -- Add 4% to the referrer's pending discount
    UPDATE profiles
    SET pending_referral_discount_percentage = pending_referral_discount_percentage + referrer_discount_percentage
    WHERE id = referrer_profile_id;

    -- Log the referral event
    INSERT INTO referral_events (referrer_id, referred_id, referred_booking_id, discount_percentage)
    VALUES (referrer_profile_id, NEW.traveler_id, NEW.id, friend_discount_percentage);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new bookings
DROP TRIGGER IF EXISTS trigger_handle_referral_discount ON bookings;
CREATE TRIGGER trigger_handle_referral_discount
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_booking_referral_discount();

-- Update existing profiles to have referral_code as email if not set
UPDATE profiles 
SET referral_code = email 
WHERE referral_code IS NULL;