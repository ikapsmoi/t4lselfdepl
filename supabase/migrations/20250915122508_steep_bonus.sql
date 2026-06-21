/*
  # Add creator profile fields

  1. New Columns
    - `total_earnings_inr` (numeric) - Total earnings in INR for creators
    - `travel_moto` (text) - Creator's travel motto/tagline
    - `creator_description` (text) - Detailed creator description

  2. Updates
    - Add new columns to profiles table with appropriate defaults
    - Populate sample data for existing creators
*/

-- Add new columns to profiles table
DO $$
BEGIN
  -- Add total_earnings_inr column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'total_earnings_inr'
  ) THEN
    ALTER TABLE profiles ADD COLUMN total_earnings_inr numeric(10,2) DEFAULT 0;
  END IF;

  -- Add travel_moto column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'travel_moto'
  ) THEN
    ALTER TABLE profiles ADD COLUMN travel_moto text;
  END IF;

  -- Add creator_description column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'creator_description'
  ) THEN
    ALTER TABLE profiles ADD COLUMN creator_description text;
  END IF;
END $$;

-- Update existing creator profiles with sample data
UPDATE profiles 
SET 
  total_earnings_inr = FLOOR(RANDOM() * 40000 + 10000)::numeric(10,2),
  travel_moto = CASE 
    WHEN name ILIKE '%priya%' THEN 'Life is a journey, not a destination ✨'
    WHEN name ILIKE '%arjun%' THEN 'Find yourself in the mountains 🏔️'
    WHEN name ILIKE '%ravi%' THEN 'Taste the world, one dish at a time 🍛'
    ELSE 'Adventure awaits around every corner 🌍'
  END,
  creator_description = CASE 
    WHEN name ILIKE '%priya%' THEN 'Bollywood enthusiast and cultural explorer. I create immersive experiences that blend entertainment with authentic Indian culture. Join me for behind-the-scenes adventures in Mumbai''s film industry!'
    WHEN name ILIKE '%arjun%' THEN 'Yoga instructor and spiritual guide. I lead transformative journeys through India''s sacred sites, combining ancient wisdom with modern wellness practices. Find your inner peace in the Himalayas.'
    WHEN name ILIKE '%ravi%' THEN 'Celebrity chef and culinary artist. I take food lovers on gastronomic adventures across India, from street food tours to royal kitchen experiences. Taste the real flavors of India!'
    ELSE 'Passionate traveler and cultural ambassador. I create authentic experiences that showcase the true spirit of adventure and local culture.'
  END
WHERE creator_verified = true OR role = 'host';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_total_earnings ON profiles(total_earnings_inr DESC) WHERE creator_verified = true;