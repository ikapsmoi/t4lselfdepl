-- Function to auto-complete trips with past end dates
CREATE OR REPLACE FUNCTION auto_complete_past_trips()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE trips
  SET status = 'completed'
  WHERE end_date < CURRENT_DATE
    AND status = 'active';
END;
$$;

-- Create a trigger function that runs on SELECT to auto-archive
-- Since we can't trigger on SELECT, we use a view approach instead

-- Create a view that only shows non-expired active trips
CREATE OR REPLACE VIEW active_trips AS
SELECT *
FROM trips
WHERE status = 'active'
  AND end_date >= CURRENT_DATE;

-- Also create a trigger on INSERT/UPDATE to prevent reactivating past trips
CREATE OR REPLACE FUNCTION prevent_reactivate_past_trip()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'active' AND NEW.end_date < CURRENT_DATE THEN
    NEW.status := 'completed';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_reactivate_past_trip ON trips;
CREATE TRIGGER trg_prevent_reactivate_past_trip
  BEFORE INSERT OR UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION prevent_reactivate_past_trip();

-- Run the cleanup now for any existing past trips
SELECT auto_complete_past_trips();