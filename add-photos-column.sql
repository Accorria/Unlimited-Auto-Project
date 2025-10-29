-- Add photos column to vehicles table
ALTER TABLE vehicles 
ADD COLUMN photos TEXT[] DEFAULT '{}';

-- Add some placeholder photos for existing vehicles
UPDATE vehicles 
SET photos = ARRAY[
  'https://images.unsplash.com/photo-1558618044-c7c36b0c0b0e?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1558618044-c7c36b0c0b0e?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1558618044-c7c36b0c0b0e?w=800&h=600&fit=crop'
]
WHERE id = 'fb0ca214-f894-4c12-8f49-953a904dfe13'; -- Subaru Crosstrek

UPDATE vehicles 
SET photos = ARRAY[
  'https://images.unsplash.com/photo-1558618044-c7c36b0c0b0e?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1558618044-c7c36b0c0b0e?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1558618044-c7c36b0c0b0e?w=800&h=600&fit=crop'
]
WHERE id = '28c0da1d-7633-4b14-a594-bf9778a4507b'; -- Mini Cooper S

UPDATE vehicles 
SET photos = ARRAY[
  'https://images.unsplash.com/photo-1558618044-c7c36b0c0b0e?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1558618044-c7c36b0c0b0e?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1558618044-c7c36b0c0b0e?w=800&h=600&fit=crop'
]
WHERE id = '4bef0ecd-9845-483a-a45d-a05c607e0547'; -- Chrysler Voyager

UPDATE vehicles 
SET photos = ARRAY[
  'https://images.unsplash.com/photo-1558618044-c7c36b0c0b0e?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1558618044-c7c36b0c0b0e?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1558618044-c7c36b0c0b0e?w=800&h=600&fit=crop'
]
WHERE id = '2aca0713-e280-4d8f-9a04-db85d803a23d'; -- Chevrolet Silverado
