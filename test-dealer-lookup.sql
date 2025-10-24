-- Test script to verify dealer data exists
-- Run this in Supabase SQL editor to check if the dealer exists

-- Check if the dealer exists
SELECT id, slug, name, is_active 
FROM public.dealers 
WHERE slug = 'unlimited-auto';

-- Check if there are any vehicles for this dealer
SELECT COUNT(*) as vehicle_count
FROM public.vehicles v
JOIN public.dealers d ON v.dealer_id = d.id
WHERE d.slug = 'unlimited-auto';

-- Check if there are any vehicle photos
SELECT COUNT(*) as photo_count
FROM public.vehicle_photos vp
JOIN public.vehicles v ON vp.vehicle_id = v.id
JOIN public.dealers d ON v.dealer_id = d.id
WHERE d.slug = 'unlimited-auto';
