/*
  # Update trip_category enum with missing values

  1. Enum Updates
    - Add missing values to trip_category enum: 'culture', 'wildlife', 'festival', 'bollywood'
    - These values are used in the frontend constants but missing from the database enum

  2. Changes
    - Adds 'culture' value to trip_category enum
    - Adds 'wildlife' value to trip_category enum  
    - Adds 'festival' value to trip_category enum
    - Adds 'bollywood' value to trip_category enum

  3. Notes
    - Uses IF NOT EXISTS equivalent for enum values by checking information_schema
    - Ensures safe execution even if values already exist
*/

-- Add missing enum values to trip_category
DO $$
BEGIN
    -- Add 'culture' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'culture' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'trip_category')
    ) THEN
        ALTER TYPE trip_category ADD VALUE 'culture';
    END IF;

    -- Add 'wildlife' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'wildlife' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'trip_category')
    ) THEN
        ALTER TYPE trip_category ADD VALUE 'wildlife';
    END IF;

    -- Add 'festival' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'festival' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'trip_category')
    ) THEN
        ALTER TYPE trip_category ADD VALUE 'festival';
    END IF;

    -- Add 'bollywood' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'bollywood' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'trip_category')
    ) THEN
        ALTER TYPE trip_category ADD VALUE 'bollywood';
    END IF;
END $$;