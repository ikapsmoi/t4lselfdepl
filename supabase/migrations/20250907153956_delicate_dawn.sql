/*
  # Add creator_followers column to profiles table

  1. New Columns
    - `creator_followers` (integer, default 0) - Stores follower count for creators

  2. Changes
    - Add creator_followers column to profiles table with default value 0
    - This column will be used to display follower counts for verified creators
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'creator_followers'
  ) THEN
    ALTER TABLE profiles ADD COLUMN creator_followers integer DEFAULT 0;
  END IF;
END $$;

-- Create index for performance when querying top creators
CREATE INDEX IF NOT EXISTS idx_profiles_creator_followers 
ON profiles (creator_followers DESC) 
WHERE creator_verified = true;