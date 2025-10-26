-- Add display_order column to vehicles table for reordering
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Update existing vehicles with their current order
UPDATE public.vehicles 
SET display_order = subquery.row_number
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as row_number
  FROM public.vehicles
) AS subquery
WHERE public.vehicles.id = subquery.id;

-- Add comment for documentation
COMMENT ON COLUMN public.vehicles.display_order IS 'Display order for vehicle listing (lower numbers appear first)';
