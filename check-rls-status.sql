-- Check RLS status on all tables
-- Run this in Supabase SQL editor

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
