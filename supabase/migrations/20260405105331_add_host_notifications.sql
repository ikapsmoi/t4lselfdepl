/*
  # Add Host Email Notifications

  1. Overview
    - Automatically notify hosts when they receive new bookings
    - Automatically notify hosts when they receive new inquiries
    - Uses Supabase Edge Functions to send professional HTML emails

  2. Changes
    - Create trigger function to notify host on new booking
    - Create trigger function to notify host on new inquiry (message)
    - Set up database triggers to fire on INSERT
    - Edge Functions handle actual email delivery

  3. Implementation Notes
    - Triggers fire after successful INSERT to ensure data integrity
    - Edge Functions are called asynchronously via pg_net
    - Email includes booking/inquiry details and dashboard links
    - Notifications are non-blocking to prevent booking failures
*/

-- Create function to notify host about new bookings
CREATE OR REPLACE FUNCTION notify_host_on_booking()
RETURNS TRIGGER AS $$
DECLARE
  trip_record RECORD;
  host_profile RECORD;
  traveler_profile RECORD;
  function_url TEXT;
BEGIN
  -- Get trip details
  SELECT * INTO trip_record
  FROM trips
  WHERE id = NEW.trip_id;

  -- Get host profile with email
  SELECT * INTO host_profile
  FROM profiles
  WHERE id = NEW.host_id;

  -- Get traveler profile
  SELECT * INTO traveler_profile
  FROM profiles
  WHERE id = NEW.traveler_id;

  -- Construct Edge Function URL
  function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/notify-host-booking';

  -- Call Edge Function asynchronously using pg_net extension
  PERFORM
    net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'booking_id', NEW.id,
        'trip_id', trip_record.id,
        'trip_title', trip_record.title,
        'traveler_name', traveler_profile.name,
        'traveler_email', traveler_profile.email,
        'host_email', host_profile.email,
        'host_name', host_profile.name,
        'travelers_count', NEW.travelers_count,
        'total_amount', NEW.total_amount,
        'deposit_amount', NEW.deposit_amount,
        'currency', COALESCE(trip_record.currency, 'USD'),
        'booking_date', NEW.created_at
      )
    );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the booking
  RAISE WARNING 'Failed to send booking notification: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for booking notifications
DROP TRIGGER IF EXISTS trigger_notify_host_on_booking ON bookings;
CREATE TRIGGER trigger_notify_host_on_booking
  AFTER INSERT ON bookings
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed' OR NEW.status = 'pending')
  EXECUTE FUNCTION notify_host_on_booking();

-- Create function to notify host about new inquiries
CREATE OR REPLACE FUNCTION notify_host_on_inquiry()
RETURNS TRIGGER AS $$
DECLARE
  trip_record RECORD;
  host_profile RECORD;
  sender_profile RECORD;
  function_url TEXT;
BEGIN
  -- Only process messages that are trip inquiries (have trip_id)
  IF NEW.trip_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get trip details
  SELECT * INTO trip_record
  FROM trips
  WHERE id = NEW.trip_id;

  -- Get host profile (recipient of the message)
  SELECT * INTO host_profile
  FROM profiles
  WHERE id = NEW.receiver_id;

  -- Get sender profile
  SELECT * INTO sender_profile
  FROM profiles
  WHERE id = NEW.sender_id;

  -- Construct Edge Function URL
  function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/notify-host-inquiry';

  -- Call Edge Function asynchronously
  PERFORM
    net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'inquiry_id', NEW.id,
        'trip_id', trip_record.id,
        'trip_title', trip_record.title,
        'traveler_name', sender_profile.name,
        'traveler_email', sender_profile.email,
        'traveler_mobile', sender_profile.mobile,
        'host_email', host_profile.email,
        'host_name', host_profile.name,
        'message', NEW.content,
        'inquiry_date', NEW.created_at
      )
    );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the message creation
  RAISE WARNING 'Failed to send inquiry notification: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for inquiry notifications
DROP TRIGGER IF EXISTS trigger_notify_host_on_inquiry ON messages;
CREATE TRIGGER trigger_notify_host_on_inquiry
  AFTER INSERT ON messages
  FOR EACH ROW
  WHEN (NEW.trip_id IS NOT NULL)
  EXECUTE FUNCTION notify_host_on_inquiry();

-- Add comment for documentation
COMMENT ON FUNCTION notify_host_on_booking() IS 'Automatically sends email notification to host when a new booking is created';
COMMENT ON FUNCTION notify_host_on_inquiry() IS 'Automatically sends email notification to host when they receive a trip inquiry';