-- Create a function to fetch event details with host email
CREATE OR REPLACE FUNCTION get_event_with_host_email(event_slug TEXT)
RETURNS TABLE (
  id UUID,
  title TEXT,
  event_type TEXT,
  custom_type TEXT,
  cover_image TEXT,
  event_date DATE,
  user_id UUID,
  is_uploads_enabled BOOLEAN,
  is_messages_enabled BOOLEAN,
  is_gifting_enabled BOOLEAN,
  is_locked BOOLEAN,
  is_live_feed_enabled BOOLEAN,
  groom_first_name TEXT,
  groom_last_name TEXT,
  bride_first_name TEXT,
  bride_last_name TEXT,
  religious_rite_venue TEXT,
  religious_rite_start_time TIME,
  religious_rite_end_time TIME,
  reception_venue TEXT,
  reception_start_time TIME,
  reception_end_time TIME,
  created_at TIMESTAMPTZ,
  host_email VARCHAR(255)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.title,
    e.event_type::TEXT,
    e.custom_type,
    e.cover_image,
    e.event_date,
    e.user_id,
    e.is_uploads_enabled,
    e.is_messages_enabled,
    e.is_gifting_enabled,
    e.is_locked,
    e.is_live_feed_enabled,
    e.groom_first_name,
    e.groom_last_name,
    e.bride_first_name,
    e.bride_last_name,
    e.religious_rite_venue,
    e.religious_rite_start_time,
    e.religious_rite_end_time,
    e.reception_venue,
    e.reception_start_time,
    e.reception_end_time,
    e.created_at,
    u.email::VARCHAR(255) as host_email
  FROM
    public.events e
  JOIN
    auth.users u ON e.user_id = u.id
  WHERE
    e.slug = event_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
