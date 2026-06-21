/*
  # Increase trip_name column length in creator_applications table

  1. Changes
    - Alter `trip_name` column in `creator_applications` table to allow longer values (VARCHAR(255))
    
  2. Reason
    - Current limit of 20 characters is too restrictive for trip names
    - Trip names like "Tomorrowland Winter 2026 - France" (33 chars) are being rejected
*/

ALTER TABLE creator_applications 
ALTER COLUMN trip_name TYPE VARCHAR(255);