-- =========================================
-- CLEANUP SOLD VEHICLES - KEEP MAIN PHOTO ONLY
-- =========================================
-- This script deletes all photos from sold vehicles EXCEPT the main photo
-- Main photo is determined by: is_primary=true OR angle='FDS' OR first photo (oldest)
--
-- SAFE TO RUN: Keeps main photo so sold inventory can still be viewed
-- =========================================

-- =========================================
-- STEP 1: PREVIEW WHAT WILL BE DELETED
-- =========================================
-- Run this first to see what photos will be deleted

SELECT 
    v.id as vehicle_id,
    v.year,
    v.make,
    v.model,
    v.status,
    COUNT(vp.id) as total_photos,
    COUNT(CASE WHEN vp.is_primary = true THEN 1 END) as primary_photos,
    COUNT(CASE WHEN vp.angle = 'FDS' THEN 1 END) as fds_photos,
    COUNT(CASE WHEN vp.is_primary = true OR vp.angle = 'FDS' THEN NULL ELSE 1 END) as photos_to_delete
FROM vehicles v
LEFT JOIN vehicle_photos vp ON vp.vehicle_id = v.id
WHERE v.status IN ('sold', 'inactive', 'removed')
GROUP BY v.id, v.year, v.make, v.model, v.status
HAVING COUNT(vp.id) > 1  -- Only vehicles with more than 1 photo
ORDER BY photos_to_delete DESC;

-- =========================================
-- STEP 2: DELETE EXCESS PHOTOS (KEEP MAIN PHOTO)
-- =========================================
-- This keeps ONE photo per sold vehicle:
-- Priority: is_primary=true > angle='FDS' > oldest photo

DELETE FROM vehicle_photos
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE status IN ('sold', 'inactive', 'removed')
)
AND id NOT IN (
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
);

-- =========================================
-- STEP 3: VERIFY RESULTS
-- =========================================
-- Check that sold vehicles now have only 1 photo each

SELECT 
    v.id as vehicle_id,
    v.year,
    v.make,
    v.model,
    v.status,
    COUNT(vp.id) as remaining_photos,
    STRING_AGG(vp.angle, ', ') as photo_angles
FROM vehicles v
LEFT JOIN vehicle_photos vp ON vp.vehicle_id = v.id
WHERE v.status IN ('sold', 'inactive', 'removed')
GROUP BY v.id, v.year, v.make, v.model, v.status
ORDER BY remaining_photos DESC;

-- =========================================
-- STEP 4: CALCULATE STORAGE SAVED
-- =========================================

SELECT 
    'Before Cleanup' as status,
    COUNT(*) as total_photos,
    COUNT(*) * 1.5 as estimated_mb
FROM vehicle_photos vp
JOIN vehicles v ON v.id = vp.vehicle_id
WHERE v.status IN ('sold', 'inactive', 'removed')

UNION ALL

SELECT 
    'After Cleanup (Expected)' as status,
    COUNT(DISTINCT vehicle_id) as total_photos,  -- Should be 1 per vehicle
    COUNT(DISTINCT vehicle_id) * 1.5 as estimated_mb
FROM vehicle_photos vp
JOIN vehicles v ON v.id = vp.vehicle_id
WHERE v.status IN ('sold', 'inactive', 'removed');

-- =========================================
-- NOTES:
-- =========================================
-- 1. This keeps the MAIN photo for each sold vehicle
-- 2. Main photo priority: is_primary > FDS angle > oldest photo
-- 3. Sold vehicles will still show on site with their main photo
-- 4. After running, manually delete files from Storage → vehicle-images
-- 5. Estimated savings: ~1.5MB per deleted photo
-- =========================================
