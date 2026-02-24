-- =========================================
-- GET FILE PATHS OF DELETED PHOTOS
-- =========================================
-- Run this to get the file paths of photos that were deleted
-- These are the files you need to delete from Supabase Storage
-- =========================================

-- Note: Since we already deleted from database, we need to reconstruct
-- what files were deleted. We'll get all files from Storage that don't
-- match current database records.

-- However, a simpler approach: Get the CURRENT photos (which we're keeping)
-- Then in Storage, delete everything else from these vehicle folders

-- =========================================
-- OPTION 1: Get current photos (KEEP THESE)
-- =========================================
SELECT 
    vp.file_path,
    vp.public_url,
    v.id as vehicle_id,
    v.year,
    v.make,
    v.model,
    vp.angle,
    'KEEP THIS FILE' as action
FROM vehicle_photos vp
JOIN vehicles v ON v.id = vp.vehicle_id
WHERE v.id IN (
    '284f6d1a-97c9-4d74-ba37-3eff803eb30b',
    'ce21d114-2d61-4e39-9ead-42648b2b0335',
    'fa45bf79-0e71-4978-8f18-eaa46c765ed1',
    '581d9ba2-f4d8-4c0c-a9aa-1b7d6e8326ef',
    'e785d21d-a6fb-498a-9cbc-9738fce6356a',
    '01b632a4-69da-43a7-b9e5-e955651401d8',
    '491b88d4-3329-4671-a937-53561cdb04fe',
    '810738d2-0315-46f7-968e-7207e90cfb38',
    '35fdc4db-faef-41da-9983-75dcf8d290f1',
    '7ec15064-7549-4884-8694-8484d475ae3e',
    'a971c0e0-5120-4327-9504-aec9ee6d2f0e',
    'cd8c2121-7ccb-4e3b-8e71-cf2565f31e7a',
    'a837b100-af71-47a3-b086-ddfc76b5055d',
    '600e9934-9dc3-4f93-b43b-31b0b6e9f9a0',
    '22def4c8-6937-4e43-95e4-91a305224e49',
    'f442c586-b97a-4a27-b26a-53fd2a075452',
    '6c0f0c09-9629-4f99-b0a5-2008052f546f',
    'ae2c40bf-cae3-4b5d-8d6b-2277762c1e6e',
    '0e284577-1d7c-46c0-afc8-9376d21c3f8b'
)
ORDER BY v.year, v.make, v.model;

-- =========================================
-- INSTRUCTIONS FOR STORAGE CLEANUP:
-- =========================================
-- 1. Export the above query results (CSV or copy file_path column)
-- 2. Go to Supabase Dashboard → Storage → vehicle-images
-- 3. For each vehicle, find files that are NOT in the "KEEP" list above
-- 4. Delete all files EXCEPT the ones listed above
-- 
-- OR simpler approach:
-- - Look for files with timestamps matching these vehicles
-- - Delete all files EXCEPT the FDS angle photos
-- - The FDS photos are the ones we kept (main photos)
-- =========================================

-- =========================================
-- OPTION 2: Estimate what was deleted
-- =========================================
-- Before cleanup: ~220 photos total
-- After cleanup: 19 photos (1 per vehicle)
-- Deleted: ~201 photos
-- 
-- In Storage, you should see many files with timestamps.
-- For these 19 vehicles, delete all files EXCEPT:
-- - Files matching the file_path from Option 1 query above
-- - Or files that are clearly the main/FDS photo
-- =========================================
