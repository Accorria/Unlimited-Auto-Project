-- Add all Ford EcoSport models and trims to the database
-- EcoSport was available in the US from 2018-2022
-- Trims: S, SE, SES, Titanium

-- Insert all Ford EcoSport models and trims
INSERT INTO public.vehicles (
  dealer_id, 
  year, 
  make, 
  model, 
  model_code, 
  trim,
  status,
  description,
  body_style,
  engine,
  transmission,
  drivetrain,
  fuel_type,
  doors,
  passengers
)
SELECT 
  d.id,
  year_val,
  'Ford',
  'EcoSport',
  CASE trim_val
    WHEN 'S' THEN 'ES-S'
    WHEN 'SE' THEN 'ES-SE'
    WHEN 'SES' THEN 'ES-SES'
    WHEN 'Titanium' THEN 'ES-TI'
  END,
  trim_val,
  'available',
  'Great value, perfect for families, financing available',
  'SUV',
  CASE 
    WHEN trim_val IN ('S', 'SE', 'Titanium') THEN '1.0L EcoBoost I3'
    WHEN trim_val = 'SES' THEN '2.0L Ti-VCT I4'
  END,
  '6-Speed Automatic',
  CASE 
    WHEN trim_val = 'SES' THEN 'Intelligent 4WD'
    ELSE 'Front-Wheel Drive'
  END,
  'Gas',
  4,
  5
FROM public.dealers d
CROSS JOIN (
  VALUES 
    (2018), (2019), (2020), (2021), (2022)
) AS years(year_val)
CROSS JOIN (
  VALUES 
    ('S'), ('SE'), ('SES'), ('Titanium')
) AS trims(trim_val)
WHERE d.slug = 'unlimited-auto'
ON CONFLICT (year, model_code, dealer_id) DO NOTHING;

-- Verify the insertions
SELECT 
  year,
  make,
  model,
  trim,
  COUNT(*) as count
FROM public.vehicles
WHERE make = 'Ford' AND model = 'EcoSport'
GROUP BY year, make, model, trim
ORDER BY year DESC, trim;

