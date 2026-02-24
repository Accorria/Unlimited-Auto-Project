-- =========================================
-- COMPLETE FIX: STORAGE + SECURITY
-- =========================================
-- This script fixes BOTH issues:
-- 1. Storage quota exceeded (1.134 GB / 1.019 GB)
-- 2. RLS Security issues (9 errors, 6 warnings)
--
-- Run this in Supabase SQL Editor
-- =========================================

-- =========================================
-- PART 1: FIX RLS SECURITY ISSUES
-- =========================================

-- 1.1 Grant permissions to service role
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

-- 1.2 Create service role policies
DROP POLICY IF EXISTS "Service role can access all dealers" ON public.dealers;
CREATE POLICY "Service role can access all dealers" ON public.dealers
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can access all users" ON public.users;
CREATE POLICY "Service role can access all users" ON public.users
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can access all vehicles" ON public.vehicles;
CREATE POLICY "Service role can access all vehicles" ON public.vehicles
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can access all vehicle photos" ON public.vehicle_photos;
CREATE POLICY "Service role can access all vehicle photos" ON public.vehicle_photos
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can access all leads" ON public.leads;
CREATE POLICY "Service role can access all leads" ON public.leads
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can access all lead status history" ON public.lead_status_history;
CREATE POLICY "Service role can access all lead status history" ON public.lead_status_history
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can access all appointments" ON public.appointments;
CREATE POLICY "Service role can access all appointments" ON public.appointments
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can access all messages" ON public.messages;
CREATE POLICY "Service role can access all messages" ON public.messages
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can access all documents" ON public.documents;
CREATE POLICY "Service role can access all documents" ON public.documents
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can access all activity logs" ON public.activity_logs;
CREATE POLICY "Service role can access all activity logs" ON public.activity_logs
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- 1.3 Enable Row Level Security
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
-- PART 2: STORAGE CLEANUP HELPERS
-- =========================================

-- 2.1 Find vehicles with too many photos (>20)
-- Run this first to see what needs cleanup
SELECT 
    v.id,
    v.year,
    v.make,
    v.model,
    v.status,
    COUNT(vp.id) as photo_count
FROM vehicles v
LEFT JOIN vehicle_photos vp ON vp.vehicle_id = v.id
GROUP BY v.id, v.year, v.make, v.model, v.status
HAVING COUNT(vp.id) > 20
ORDER BY photo_count DESC;

-- 2.2 Find sold/inactive vehicles with photos
SELECT 
    v.id,
    v.year,
    v.make,
    v.model,
    v.status,
    COUNT(vp.id) as photo_count,
    COUNT(vp.id) * 1.5 as estimated_mb
FROM vehicles v
LEFT JOIN vehicle_photos vp ON vp.vehicle_id = v.id
WHERE v.status IN ('sold', 'inactive', 'removed')
GROUP BY v.id, v.year, v.make, v.model, v.status
HAVING COUNT(vp.id) > 0
ORDER BY photo_count DESC;

-- 2.3 Current storage estimate
SELECT 
    COUNT(*) as total_photos,
    COUNT(*) * 1.5 as estimated_mb,
    COUNT(DISTINCT vehicle_id) as vehicles_with_photos
FROM vehicle_photos;

-- =========================================
-- PART 3: CLEANUP ACTIONS (REVIEW BEFORE RUNNING)
-- =========================================

-- 3.1 Delete photos from sold/inactive vehicles
-- UNCOMMENT AND MODIFY AFTER REVIEWING PART 2.2
/*
DELETE FROM vehicle_photos
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE status IN ('sold', 'inactive', 'removed')
);
*/

-- 3.2 Limit photos to 20 per vehicle (delete oldest excess)
-- UNCOMMENT AFTER REVIEWING PART 2.1
/*
DELETE FROM vehicle_photos
WHERE id IN (
    SELECT vp.id
    FROM vehicle_photos vp
    JOIN (
        SELECT vehicle_id, COUNT(*) as photo_count
        FROM vehicle_photos
        GROUP BY vehicle_id
        HAVING COUNT(*) > 20
    ) excess ON excess.vehicle_id = vp.vehicle_id
    WHERE vp.id NOT IN (
        SELECT id FROM vehicle_photos
        WHERE vehicle_id = excess.vehicle_id
        ORDER BY created_at ASC
        LIMIT 20
    )
);
*/

-- =========================================
-- VERIFICATION
-- =========================================

-- Check RLS is enabled
SELECT 
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
    tablename,
    policyname
FROM pg_policies 
WHERE schemaname = 'public' 
AND policyname LIKE '%Service role%'
ORDER BY tablename;

-- Check storage after cleanup
SELECT 
    COUNT(*) as total_photos,
    COUNT(*) * 1.5 as estimated_mb
FROM vehicle_photos;
