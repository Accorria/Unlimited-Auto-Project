-- =========================================
-- CLEANUP SPECIFIC SOLD VEHICLES
-- =========================================
-- Removes all photos EXCEPT the main photo for these specific sold vehicles
-- Main photo priority: is_primary=true > angle='FDS' > oldest photo
-- =========================================

-- Vehicle IDs to clean up (from your list)
WITH target_vehicles AS (
    SELECT id FROM vehicles WHERE id IN (
        '284f6d1a-97c9-4d74-ba37-3eff803eb30b', -- 2018 Chrysler 300 (16 photos)
        'ce21d114-2d61-4e39-9ead-42648b2b0335', -- 2021 Chrysler Voyager (12 photos)
        'fa45bf79-0e71-4978-8f18-eaa46c765ed1', -- 2020 Nissan Rogue (16 photos)
        '581d9ba2-f4d8-4c0c-a9aa-1b7d6e8326ef', -- 2017 Subaru Crosstrek (14 photos)
        'e785d21d-a6fb-498a-9cbc-9738fce6356a', -- 2016 Chevrolet Silverado 1500 (9 photos)
        '01b632a4-69da-43a7-b9e5-e955651401d8', -- 2018 Chevrolet Cruze (16 photos)
        '491b88d4-3329-4671-a937-53561cdb04fe', -- 2018 Jeep Wrangler (13 photos)
        '810738d2-0315-46f7-968e-7207e90cfb38', -- 2005 Mini Cooper S (13 photos)
        '35fdc4db-faef-41da-9983-75dcf8d290f1', -- 2019 Ford EcoSport (12 photos)
        '7ec15064-7549-4884-8694-8484d475ae3e', -- 2017 Lincoln MKC (12 photos)
        'a971c0e0-5120-4327-9504-aec9ee6d2f0e', -- 2019 Chevrolet Malibu (13 photos)
        'cd8c2121-7ccb-4e3b-8e71-cf2565f31e7a', -- 2020 Chevrolet Malibu (12 photos)
        'a837b100-af71-47a3-b086-ddfc76b5055d', -- 2014 GMC Sierra (12 photos)
        '600e9934-9dc3-4f93-b43b-31b0b6e9f9a0', -- 2018 Dodge Grand Caravan (16 photos)
        '22def4c8-6937-4e43-95e4-91a305224e49', -- 2014 Dodge Charger (11 photos)
        'f442c586-b97a-4a27-b26a-53fd2a075452', -- 2017 Ford Edge (13 photos)
        '6c0f0c09-9629-4f99-b0a5-2008052f546f', -- 2018 Nissan Sentra (12 photos)
        'ae2c40bf-cae3-4b5d-8d6b-2277762c1e6e', -- 2019 Chevrolet Equinox (12 photos)
        '0e284577-1d7c-46c0-afc8-9376d21c3f8b'  -- 2017 Chevrolet Malibu (14 photos)
    )
)

-- =========================================
-- STEP 1: PREVIEW - See what will be deleted
-- =========================================
SELECT 
    v.id as vehicle_id,
    v.year,
    v.make,
    v.model,
    vp.id as photo_id,
    vp.file_path,
    vp.angle,
    vp.is_primary,
    vp.created_at,
    'WILL BE DELETED' as action
FROM vehicles v
JOIN vehicle_photos vp ON vp.vehicle_id = v.id
WHERE v.id IN (SELECT id FROM target_vehicles)
AND vp.id NOT IN (
    -- Keep the main photo for each vehicle
    SELECT DISTINCT ON (vehicle_id) id
    FROM vehicle_photos
    WHERE vehicle_id IN (SELECT id FROM target_vehicles)
    ORDER BY vehicle_id,
        CASE WHEN is_primary = true THEN 1 ELSE 2 END,  -- Primary photo first
        CASE WHEN angle = 'FDS' THEN 1 ELSE 2 END,     -- FDS angle second
        created_at ASC                                   -- Oldest photo third
)
ORDER BY v.year, v.make, v.model, vp.created_at;

-- =========================================
-- STEP 2: DELETE EXCESS PHOTOS (KEEP MAIN PHOTO)
-- =========================================
-- UNCOMMENT AND RUN THIS AFTER REVIEWING STEP 1

/*
DELETE FROM vehicle_photos
WHERE vehicle_id IN (
    SELECT id FROM vehicles WHERE id IN (
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
)
AND id NOT IN (
    -- Keep the main photo for each vehicle
    SELECT DISTINCT ON (vehicle_id) id
    FROM vehicle_photos
    WHERE vehicle_id IN (
        SELECT id FROM vehicles WHERE id IN (
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
    )
    ORDER BY vehicle_id,
        CASE WHEN is_primary = true THEN 1 ELSE 2 END,
        CASE WHEN angle = 'FDS' THEN 1 ELSE 2 END,
        created_at ASC
);
*/

-- =========================================
-- STEP 3: GET FILE PATHS TO DELETE FROM STORAGE
-- =========================================
-- Run this AFTER Step 2 to get the file paths
-- Then delete these files from Supabase Storage dashboard

SELECT 
    vp.file_path,
    vp.public_url,
    v.year,
    v.make,
    v.model
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
AND vp.id NOT IN (
    -- Keep the main photo for each vehicle
    SELECT DISTINCT ON (vehicle_id) id
    FROM vehicle_photos
    WHERE vehicle_id IN (
        SELECT id FROM vehicles WHERE id IN (
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
    )
    ORDER BY vehicle_id,
        CASE WHEN is_primary = true THEN 1 ELSE 2 END,
        CASE WHEN angle = 'FDS' THEN 1 ELSE 2 END,
        created_at ASC
)
ORDER BY v.year, v.make, v.model;

-- =========================================
-- STEP 4: VERIFY - Should show 1 photo per vehicle
-- =========================================
SELECT 
    v.id,
    v.year,
    v.make,
    v.model,
    COUNT(vp.id) as remaining_photos,
    STRING_AGG(vp.angle, ', ') as photo_angles
FROM vehicles v
LEFT JOIN vehicle_photos vp ON vp.vehicle_id = v.id
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
GROUP BY v.id, v.year, v.make, v.model
ORDER BY v.year, v.make, v.model;

-- =========================================
-- NOTES:
-- =========================================
-- 1. Run Step 1 first to preview what will be deleted
-- 2. Uncomment and run Step 2 to delete from database
-- 3. Run Step 3 to get file paths for manual deletion from Storage
-- 4. Run Step 4 to verify each vehicle has exactly 1 photo
-- 5. Then manually delete files from Supabase Storage dashboard
-- =========================================
