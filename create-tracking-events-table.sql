-- Create tracking_events table
CREATE TABLE IF NOT EXISTS public.tracking_events (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id uuid REFERENCES public.dealers(id) ON DELETE CASCADE,
    event_type text NOT NULL,
    url text,
    referrer text,
    user_agent text,
    details jsonb,
    timestamp timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY IF NOT EXISTS "Allow authenticated access to tracking_events" 
ON public.tracking_events
FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "Allow anon insert for tracking_events" 
ON public.tracking_events
FOR INSERT TO anon WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_tracking_events_dealer_id ON public.tracking_events(dealer_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_event_type ON public.tracking_events(event_type);
CREATE INDEX IF NOT EXISTS idx_tracking_events_created_at ON public.tracking_events(created_at);
