-- =========================================
-- FIX ALL RLS SECURITY ISSUES
-- =========================================
-- This script enables RLS and adds service role policies
-- to resolve all Security Advisor warnings
--
-- Run this in Supabase SQL Editor
-- =========================================

-- =========================================
-- 1. GRANT PERMISSIONS TO SERVICE ROLE
-- =========================================

GRANT ALL ON public.dealers TO service_role;
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.vehicles TO service_role;
GRANT ALL ON public.vehicle_photos TO service_role;
GRANT ALL ON public.leads TO service_role;
GRANT ALL ON public.lead_status_history TO service_role;
GRANT ALL ON public.appointments TO service_role;
GRANT ALL ON public.messages TO service_role;
GRANT ALL ON public.documents TO service_role;
GRANT ALL ON public.activity_logs TO service_role;

-- =========================================
-- 2. CREATE SERVICE ROLE POLICIES
-- =========================================

-- Dealers: Service role full access
DROP POLICY IF EXISTS "Service role can access all dealers" ON public.dealers;
CREATE POLICY "Service role can access all dealers" ON public.dealers
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Users: Service role full access
DROP POLICY IF EXISTS "Service role can access all users" ON public.users;
CREATE POLICY "Service role can access all users" ON public.users
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Vehicles: Service role full access
DROP POLICY IF EXISTS "Service role can access all vehicles" ON public.vehicles;
CREATE POLICY "Service role can access all vehicles" ON public.vehicles
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Vehicle Photos: Service role full access
DROP POLICY IF EXISTS "Service role can access all vehicle photos" ON public.vehicle_photos;
CREATE POLICY "Service role can access all vehicle photos" ON public.vehicle_photos
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Leads: Service role full access
DROP POLICY IF EXISTS "Service role can access all leads" ON public.leads;
CREATE POLICY "Service role can access all leads" ON public.leads
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Lead Status History: Service role full access
DROP POLICY IF EXISTS "Service role can access all lead status history" ON public.lead_status_history;
CREATE POLICY "Service role can access all lead status history" ON public.lead_status_history
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Appointments: Service role full access
DROP POLICY IF EXISTS "Service role can access all appointments" ON public.appointments;
CREATE POLICY "Service role can access all appointments" ON public.appointments
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Messages: Service role full access
DROP POLICY IF EXISTS "Service role can access all messages" ON public.messages;
CREATE POLICY "Service role can access all messages" ON public.messages
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Documents: Service role full access
DROP POLICY IF EXISTS "Service role can access all documents" ON public.documents;
CREATE POLICY "Service role can access all documents" ON public.documents
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Activity Logs: Service role full access
DROP POLICY IF EXISTS "Service role can access all activity logs" ON public.activity_logs;
CREATE POLICY "Service role can access all activity logs" ON public.activity_logs
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- =========================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =========================================

ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- =========================================
-- 4. VERIFICATION QUERIES
-- =========================================

-- Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'dealers', 'users', 'vehicles', 'vehicle_photos', 
    'leads', 'lead_status_history', 'appointments', 
    'messages', 'documents', 'activity_logs'
)
ORDER BY tablename;

-- Check service role policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    roles
FROM pg_policies 
WHERE schemaname = 'public' 
AND policyname LIKE '%Service role%'
ORDER BY tablename, policyname;

-- =========================================
-- NOTES:
-- =========================================
-- 1. Service role policies allow full access (USING true, WITH CHECK true)
-- 2. User-based policies (from working-dealership-schema.sql) remain active
-- 3. Service role bypasses RLS anyway, but policies ensure consistency
-- 4. After running this, Security Advisor should show 0 errors
-- 5. Test lead creation to verify everything still works
-- =========================================
