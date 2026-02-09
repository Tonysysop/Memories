-- Migration to add payment tracking columns for gifting integration with Flutterwave

-- 1. Add payment tracking columns to the media table
ALTER TABLE public.media 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' 
    CHECK (payment_status IN ('pending', 'successful', 'failed')),
ADD COLUMN IF NOT EXISTS payment_reference TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS flw_transaction_id TEXT;

-- 2. Create index on payment_reference for fast lookups (critical for Webhooks/Edge Functions)
CREATE INDEX IF NOT EXISTS idx_media_payment_reference ON public.media(payment_reference);

-- 3. Comments for clarity
COMMENT ON COLUMN public.media.payment_status IS 'Tracks the status of the Flutterwave payment transaction';
COMMENT ON COLUMN public.media.payment_reference IS 'Unique reference (tx_ref) sent to Flutterwave to identify this specific gift';
COMMENT ON COLUMN public.media.flw_transaction_id IS 'Transaction ID returned by Flutterwave upon successful payment';
