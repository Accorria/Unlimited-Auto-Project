-- Fix leads table permissions for service role
-- This script grants the service role permission to access the leads table

-- Grant all permissions on leads table to service role
GRANT ALL ON public.leads TO service_role;

-- Grant all permissions on lead_status_history table to service role  
GRANT ALL ON public.lead_status_history TO service_role;

-- Ensure RLS policies allow service role access
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access
CREATE POLICY IF NOT EXISTS "Service role can access all leads" ON public.leads
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Create policy to allow service role full access to lead status history
CREATE POLICY IF NOT EXISTS "Service role can access all lead status history" ON public.lead_status_history
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Also ensure the leads table exists with all required columns
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Contact information
  name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  message TEXT,
  
  -- Financial information
  income TEXT,
  net_monthly_income NUMERIC,
  employer TEXT,
  months_on_job INTEGER,
  dl_state TEXT,
  down_payment INTEGER,
  down_payment_ratio DECIMAL(3,2),
  credit_score INTEGER,
  
  -- Attribution tracking
  source TEXT,
  agent TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  gclid TEXT,
  
  -- Lead management
  status TEXT DEFAULT 'new',
  notes TEXT,
  consent BOOLEAN DEFAULT FALSE,
  
  -- Follow-up tracking
  follow_up_date DATE,
  follow_up_notes TEXT,
  last_contact_date TIMESTAMPTZ,
  
  -- Deal closing
  close_date DATE,
  close_amount NUMERIC,
  commission_amount NUMERIC,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create lead status history table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.lead_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
