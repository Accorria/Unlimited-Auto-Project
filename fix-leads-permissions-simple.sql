-- Simple fix for leads table permissions
-- This only adds the missing service role permissions

-- Grant service role access to leads table
GRANT ALL ON public.leads TO service_role;
GRANT ALL ON public.lead_status_history TO service_role;

-- Create service role policy for leads if it doesn't exist
CREATE POLICY IF NOT EXISTS "Service role can access all leads" ON public.leads
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Create service role policy for lead status history if it doesn't exist  
CREATE POLICY IF NOT EXISTS "Service role can access all lead status history" ON public.lead_status_history
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);
