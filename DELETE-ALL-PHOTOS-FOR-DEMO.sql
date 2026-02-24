-- =========================================
-- DELETE ALL PHOTOS FROM DATABASE
-- =========================================
-- Use this if you're keeping the project for demo only
-- and want to clear all photo references from the database
-- 
-- NOTE: Files will remain in Storage but won't be accessible
-- through the app since database records are deleted
-- =========================================

-- =========================================
-- OPTION 1: Delete ALL photos (Demo Mode)
-- =========================================
-- This removes all photo records from the database
-- The UI will show placeholder images instead

DELETE FROM vehicle_photos;

-- =========================================
-- OPTION 2: Keep only main photos (if you want some images)
-- =========================================
-- Uncomment this if you want to keep 1 photo per vehicle
-- (keeps the main/FDS photo for each vehicle)

/*
DELETE FROM vehicle_photos
WHERE id NOT IN (
    -- Keep the main photo for each vehicle
    SELECT DISTINCT ON (vehicle_id) id
    FROM vehicle_photos
    ORDER BY vehicle_id,
        CASE WHEN is_primary = true THEN 1 ELSE 2 END,
        CASE WHEN angle = 'FDS' THEN 1 ELSE 2 END,
        created_at ASC
);
*/

-- =========================================
-- VERIFY DELETION
-- =========================================
-- Run this after deletion to confirm

SELECT 
    COUNT(*) as remaining_photos
FROM vehicle_photos;

-- Should return 0 if Option 1 was used
-- Should return number of vehicles if Option 2 was used

-- =========================================
-- NOTES:
-- =========================================
-- 1. This only deletes database records, not Storage files
-- 2. Storage files will remain but won't be accessible
-- 3. Your frontend should handle missing photos gracefully
-- 4. To delete Storage files, you'll need to:
--    - Upgrade plan to access Storage UI, OR
--    - Use Supabase CLI, OR
--    - Wait for quota to reset
-- =========================================
