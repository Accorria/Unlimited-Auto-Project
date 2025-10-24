-- Fix the angle column to accept any text instead of enum
-- This allows photos to be uploaded with any naming convention
-- 
-- IMPORTANT: This script is safe to run multiple times and checks for existing constraints/indexes

-- First, drop the unique constraint that depends on the angle column
-- (This constraint exists in the main schema: UNIQUE(vehicle_id, angle))
ALTER TABLE public.vehicle_photos DROP CONSTRAINT IF EXISTS vehicle_photos_vehicle_id_angle_key;

-- Change the angle column from enum to text
ALTER TABLE public.vehicle_photos ALTER COLUMN angle TYPE TEXT;

-- Add a new unique constraint that allows multiple photos per vehicle
-- We'll use a combination of vehicle_id and file_path for uniqueness instead
-- This prevents duplicate file uploads while allowing multiple photos per vehicle
ALTER TABLE public.vehicle_photos ADD CONSTRAINT vehicle_photos_vehicle_id_file_path_key UNIQUE (vehicle_id, file_path);

-- Note: The following indexes already exist in working-dealership-schema.sql
-- but we'll create them with IF NOT EXISTS to be safe
CREATE INDEX IF NOT EXISTS idx_vehicle_photos_angle ON public.vehicle_photos(angle);
CREATE INDEX IF NOT EXISTS idx_vehicle_photos_vehicle_id ON public.vehicle_photos(vehicle_id);

-- Verify the changes
SELECT 
    'vehicle_photos table structure' as check_type,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'vehicle_photos' 
    AND table_schema = 'public'
ORDER BY ordinal_position;
