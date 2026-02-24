-- =========================================
-- GET DELETED PHOTO FILE PATHS
-- =========================================
-- Run this BEFORE running the cleanup script
-- to get a list of file paths that will be deleted
-- Then use these paths to delete files from Storage
-- =========================================

-- Get file paths that WILL BE DELETED (excess photos from sold vehicles)
-- This shows all photos EXCEPT the main one for each sold vehicle

SELECT 
    vp.id as photo_id,
    vp.file_path,
    vp.public_url,
    v.id as vehicle_id,
    v.year,
    v.make,
    v.model,
    v.status,
    vp.angle,
    vp.is_primary,
    vp.created_at
FROM vehicle_photos vp
JOIN vehicles v ON v.id = vp.vehicle_id
WHERE v.status IN ('sold', 'inactive', 'removed')
AND vp.id NOT IN (
    -- Keep the main photo for each sold vehicle
    SELECT DISTINCT ON (vehicle_id) id
    FROM vehicle_photos
    WHERE vehicle_id IN (
        SELECT id FROM vehicles 
        WHERE status IN ('sold', 'inactive', 'removed')
    )
    ORDER BY vehicle_id,
        CASE WHEN is_primary = true THEN 1 ELSE 2 END,  -- Primary photo first
        CASE WHEN angle = 'FDS' THEN 1 ELSE 2 END,     -- FDS angle second
        created_at ASC                                   -- Oldest photo third
)
ORDER BY v.year, v.make, v.model, vp.created_at;

-- =========================================
-- EXPORT THIS LIST
-- =========================================
-- 1. Run this query
-- 2. Click "Export" button (CSV or JSON)
-- 3. Save the file_path column
-- 4. Use these paths to find files in Storage dashboard
-- =========================================
