-- Migration script to add wedding-specific columns for event creation wizard
ALTER TABLE events
ADD COLUMN IF NOT EXISTS groom_first_name TEXT,
ADD COLUMN IF NOT EXISTS groom_last_name TEXT,
ADD COLUMN IF NOT EXISTS bride_first_name TEXT,
ADD COLUMN IF NOT EXISTS bride_last_name TEXT,
ADD COLUMN IF NOT EXISTS religious_rite_venue TEXT,
ADD COLUMN IF NOT EXISTS religious_rite_start_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS religious_rite_end_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reception_venue TEXT,
ADD COLUMN IF NOT EXISTS reception_start_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reception_end_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_location_public BOOLEAN DEFAULT TRUE;
