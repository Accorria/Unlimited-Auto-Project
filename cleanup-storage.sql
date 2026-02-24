-- =========================================
-- STORAGE CLEANUP SCRIPT
-- =========================================
-- This script helps identify and clean up unused photos
-- to reduce storage usage below the 1GB Free Plan limit
--
-- Current usage: 1.134 GB / 1.019 GB (111% - OVER LIMIT)
-- Target: Get below 1GB
-- =========================================

-- =========================================
-- STEP 1: FIND ORPHANED PHOTOS
-- =========================================
-- Photos in storage that don't have database records

-- First, let's see how many photos we have in the database
SELECT 
    'Database Photos' as source,
    COUNT(*) as count,
    COUNT(*) * 1.5 as estimated_mb -- Assume 1.5MB average per photo
FROM vehicle_photos;

-- Find vehicles with photos
SELECT 
    'Vehicles with Photos' as source,
    COUNT(DISTINCT vehicle_id) as vehicles_with_photos,
    COUNT(*) as total_photos
FROM vehicle_photos;

-- =========================================
-- STEP 2: FIND DUPLICATE PHOTOS
-- =========================================
-- Photos that might be duplicates

SELECT 
    file_path,
    COUNT(*) as duplicate_count,
    STRING_AGG(DISTINCT vehicle_id::text, ', ') as vehicle_ids
FROM vehicle_photos
GROUP BY file_path
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- =========================================
-- STEP 3: FIND VEHICLES WITH TOO MANY PHOTOS
-- =========================================
-- Vehicles exceeding the 20 photo limit

SELECT 
    vehicle_id,
    COUNT(*) as photo_count,
    STRING_AGG(id::text, ', ') as photo_ids
FROM vehicle_photos
GROUP BY vehicle_id
HAVING COUNT(*) > 20
ORDER BY photo_count DESC;

-- =========================================
-- STEP 4: FIND SOLD/INACTIVE VEHICLES WITH PHOTOS
-- =========================================
-- These can be deleted to free up space

SELECT 
    v.id as vehicle_id,
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

-- =========================================
-- STEP 5: ESTIMATE STORAGE SAVINGS
-- =========================================
-- Calculate potential storage savings

WITH sold_vehicle_photos AS (
    SELECT COUNT(*) as photo_count
    FROM vehicle_photos vp
    JOIN vehicles v ON v.id = vp.vehicle_id
    WHERE v.status IN ('sold', 'inactive', 'removed')
),
duplicate_photos AS (
    SELECT COUNT(*) - COUNT(DISTINCT file_path) as duplicate_count
    FROM vehicle_photos
),
excess_photos AS (
    SELECT COUNT(*) as excess_count
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
)
SELECT 
    'Potential Storage Savings' as metric,
    (sold_vehicle_photos.photo_count + duplicate_photos.duplicate_count + excess_photos.excess_count) * 1.5 as estimated_mb_saved,
    (sold_vehicle_photos.photo_count + duplicate_photos.duplicate_count + excess_photos.excess_count) as photos_to_delete
FROM sold_vehicle_photos, duplicate_photos, excess_photos;

-- =========================================
-- STEP 6: MANUAL CLEANUP COMMANDS
-- =========================================
-- Run these AFTER reviewing the results above

-- Option A: Delete photos from sold/inactive vehicles
-- (Uncomment and modify vehicle IDs after reviewing Step 4)
/*
DELETE FROM vehicle_photos
WHERE vehicle_id IN (
    SELECT id FROM vehicles 
    WHERE status IN ('sold', 'inactive', 'removed')
    -- Add specific vehicle IDs here if you want to be selective
);
*/

-- Option B: Delete duplicate photos (keep oldest)
-- (Uncomment after reviewing Step 2)
/*
DELETE FROM vehicle_photos
WHERE id IN (
    SELECT id FROM (
        SELECT id, 
               ROW_NUMBER() OVER (PARTITION BY file_path ORDER BY created_at ASC) as rn
        FROM vehicle_photos
    ) ranked
    WHERE rn > 1
);
*/

-- Option C: Limit photos to 20 per vehicle (delete oldest excess)
-- (Uncomment after reviewing Step 3)
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
-- STEP 7: VERIFY STORAGE AFTER CLEANUP
-- =========================================

SELECT 
    'After Cleanup' as status,
    COUNT(*) as total_photos,
    COUNT(*) * 1.5 as estimated_mb,
    COUNT(DISTINCT vehicle_id) as vehicles_with_photos
FROM vehicle_photos;

-- =========================================
-- NOTES:
-- =========================================
-- 1. Review all queries BEFORE running DELETE statements
-- 2. Backup your database before cleanup
-- 3. Photos deleted from database will need manual deletion from storage bucket
-- 4. Use Supabase Dashboard → Storage → vehicle-images to delete files
-- 5. Target: Get below 1GB (currently 1.134 GB)
-- 6. Each photo averages ~1.5MB, so deleting ~100 photos saves ~150MB
-- =========================================
