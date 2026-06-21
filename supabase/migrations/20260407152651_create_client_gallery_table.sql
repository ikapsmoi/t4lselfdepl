/*
  # Create Client Gallery Table

  1. New Tables
    - `client_gallery`
      - `id` (uuid, primary key) - Unique identifier
      - `image_url` (text) - URL to the client image
      - `client_name` (text, nullable) - Name of the client
      - `location` (text, nullable) - Location of the photo
      - `trip_title` (text, nullable) - Associated trip title
      - `display_order` (integer) - Order for display in gallery
      - `active` (boolean) - Whether image is active/visible
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `client_gallery` table
    - Add policy for public read access to active images
    - Add policy for authenticated admins to manage gallery

  3. Indexes
    - Index on `active` and `display_order` for efficient querying
*/

CREATE TABLE IF NOT EXISTS client_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  client_name text,
  location text,
  trip_title text,
  display_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE client_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active gallery images"
  ON client_gallery
  FOR SELECT
  USING (active = true);

CREATE POLICY "Authenticated users can view all gallery images"
  ON client_gallery
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert gallery images"
  ON client_gallery
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'host'
    )
  );

CREATE POLICY "Only admins can update gallery images"
  ON client_gallery
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'host'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'host'
    )
  );

CREATE POLICY "Only admins can delete gallery images"
  ON client_gallery
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'host'
    )
  );

CREATE INDEX IF NOT EXISTS idx_client_gallery_active_order 
  ON client_gallery(active, display_order);

CREATE INDEX IF NOT EXISTS idx_client_gallery_created_at 
  ON client_gallery(created_at DESC);