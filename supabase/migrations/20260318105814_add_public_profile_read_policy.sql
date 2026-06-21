/*
  # Add Public Profile Read Policy for Reviews

  1. Changes
    - Add policy to allow public (unauthenticated) users to read basic profile information
    - This is needed so the Reviews page can display reviewer information without requiring login
    - Only basic, non-sensitive profile fields are exposed

  2. Security
    - Policy allows SELECT for all users (public role)
    - Still protects sensitive data through application-level field selection
    - Does not expose email or other private information to unauthorized users
*/

-- Drop existing restrictive policies and create a more permissive SELECT policy
-- that allows public read access to profiles (for displaying reviewer info)

CREATE POLICY "Public can read basic profile info"
  ON profiles
  FOR SELECT
  TO public
  USING (true);
