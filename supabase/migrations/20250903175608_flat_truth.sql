/*
  # Fix trips table foreign key constraint

  1. Changes
    - Drop existing foreign key constraint `trips_host_id_fkey` that references `users` table
    - Add new foreign key constraint that references `profiles` table instead
    - This aligns with the authentication system that uses `profiles` table for user data

  2. Security
    - Maintains existing RLS policies on trips table
    - Ensures data integrity with proper foreign key relationships

  3. Notes
    - This fixes the error where trip creation fails due to host_id not existing in users table
    - The host_id should reference profiles.id since that's where authenticated user data is stored
*/

-- Drop the existing foreign key constraint that references users table
ALTER TABLE IF EXISTS trips 
DROP CONSTRAINT IF EXISTS trips_host_id_fkey;

-- Add new foreign key constraint that references profiles table
ALTER TABLE trips 
ADD CONSTRAINT trips_host_id_fkey 
FOREIGN KEY (host_id) REFERENCES profiles(id) ON DELETE CASCADE;