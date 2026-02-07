-- Add is_gifting_enabled to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS is_gifting_enabled BOOLEAN DEFAULT FALSE;

-- Add gift-related columns to media table
ALTER TABLE public.media 
ADD COLUMN IF NOT EXISTS gift_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS gift_message TEXT;

-- Optional: Update file_type check constraint if it exists
-- ALTER TABLE public.media DROP CONSTRAINT IF EXISTS media_file_type_check;
-- ALTER TABLE public.media ADD CONSTRAINT media_file_type_check CHECK (file_type IN ('photo', 'video', 'gift'));
