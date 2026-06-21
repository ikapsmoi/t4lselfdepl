/*
  # Enable user profile insertion during signup

  1. Security Changes
    - Drop existing restrictive INSERT policy if it exists
    - Create new INSERT policy allowing authenticated users to insert their own profile
    - Ensure RLS is enabled on users table
    - Verify other policies remain intact

  2. Policy Details
    - Target: authenticated users only
    - Condition: auth.uid() = id (users can only insert their own profile)
    - Operation: INSERT only
*/

-- Ensure RLS is enabled on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing INSERT policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Enable insert for authenticated users own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON users;

-- Create new INSERT policy that allows authenticated users to insert their own profile
CREATE POLICY "Allow authenticated users to insert their own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure existing policies for SELECT and UPDATE remain intact
-- (These should already exist based on the schema, but we'll recreate them to be safe)

-- Drop and recreate SELECT policy
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Drop and recreate UPDATE policy  
DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);