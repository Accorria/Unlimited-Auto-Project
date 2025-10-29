-- Create tracking_events table for funnel analytics
CREATE TABLE IF NOT EXISTS tracking_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('phone_click', 'email_click', 'form_submit', 'page_view', 'vehicle_interest')),
  source TEXT NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  vehicle_name TEXT,
  session_id TEXT NOT NULL,
  user_agent TEXT,
  ip_address INET,
  referer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tracking_events_dealer_id ON tracking_events(dealer_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_event_type ON tracking_events(event_type);
CREATE INDEX IF NOT EXISTS idx_tracking_events_session_id ON tracking_events(session_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_created_at ON tracking_events(created_at);
CREATE INDEX IF NOT EXISTS idx_tracking_events_vehicle_id ON tracking_events(vehicle_id);

-- Enable RLS
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access
CREATE POLICY "Service role can manage tracking events" ON tracking_events
  FOR ALL USING (auth.role() = 'service_role');

-- Create policy for dealer access (read only)
CREATE POLICY "Dealers can view their tracking events" ON tracking_events
  FOR SELECT USING (dealer_id IN (
    SELECT id FROM dealers WHERE id = auth.uid()
  ));
