/*
  # Create creator applications table

  1. New Tables
    - `creator_applications`
      - `id` (uuid, primary key)
      - `instagram_handle` (text, optional)
      - `tiktok_handle` (text, optional)
      - `youtube_channel` (text, optional)
      - `email` (text, required)
      - `status` (text, default 'pending')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `creator_applications` table
    - Add policy for authenticated users to insert applications
    - Add policy for service role to manage applications
*/

CREATE TABLE IF NOT EXISTS creator_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instagram_handle text,
  tiktok_handle text,
  youtube_channel text,
  email text NOT NULL,
  status text DEFAULT 'pending'::text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE creator_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to insert creator applications"
  ON creator_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Service role can manage creator applications"
  ON creator_applications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_creator_applications_email ON creator_applications(email);
CREATE INDEX IF NOT EXISTS idx_creator_applications_status ON creator_applications(status);
CREATE INDEX IF NOT EXISTS idx_creator_applications_created_at ON creator_applications(created_at);