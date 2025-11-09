-- Fix appointments table permissions for service role
-- This script grants the service role permission to access the appointments table

-- Grant all permissions on appointments table to service role
GRANT ALL ON public.appointments TO service_role;

-- Ensure RLS policies allow service role access
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists, then create new one
DROP POLICY IF EXISTS "Service role can access all appointments" ON public.appointments;

-- Create policy to allow service role full access
CREATE POLICY "Service role can access all appointments" ON public.appointments
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Also ensure the appointments table exists with all required columns
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'test_drive',
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'scheduled',
  location TEXT,
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

