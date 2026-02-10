-- Migration to create a dedicated gifts table for Flutterwave integration

-- 1. Create the gifts table
CREATE TABLE IF NOT EXISTS public.gifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    guest_name TEXT, -- To store the name of a guest who isn't signed in
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'NGN',
    message TEXT,
    payment_ref TEXT UNIQUE NOT NULL, -- Flutterwave tx_ref
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'successful', 'failed')),
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add RLS Policies
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

-- Allow public to insert (for guests making gifts)
CREATE POLICY "Allow public to insert gifts" ON public.gifts
    FOR INSERT WITH CHECK (true);

-- Allow event hosts to view gifts for their events
CREATE POLICY "Allow event hosts to view gifts" ON public.gifts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE id = gifts.event_id AND user_id = auth.uid()
        )
    );

-- Allow guests to view their own gift if they have a reference? 
-- For now, let's allow public to view gifts for an event to show in feed
CREATE POLICY "Allow public to view gifts for events" ON public.gifts
    FOR SELECT USING (true);

-- 3. Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_gifts_payment_ref ON public.gifts(payment_ref);
CREATE INDEX IF NOT EXISTS idx_gifts_event_id ON public.gifts(event_id);

-- 4. Function and trigger for updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gifts_updated_at
    BEFORE UPDATE ON public.gifts
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- 5. Comment for clarity
COMMENT ON TABLE public.gifts IS 'Stores financial gifts integrated with Flutterwave';
