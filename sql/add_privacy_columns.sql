-- Add privacy columns for anonymous gifting and hiding totals
ALTER TABLE public.media 
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS is_gift_total_hidden BOOLEAN DEFAULT FALSE;
