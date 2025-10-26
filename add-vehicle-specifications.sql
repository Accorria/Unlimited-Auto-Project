-- Add missing vehicle specification fields to the vehicles table
-- This will fix the grayed out specifications on the public vehicle detail pages

ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS engine TEXT,
ADD COLUMN IF NOT EXISTS transmission TEXT,
ADD COLUMN IF NOT EXISTS drivetrain TEXT,
ADD COLUMN IF NOT EXISTS mpg TEXT,
ADD COLUMN IF NOT EXISTS body_style TEXT,
ADD COLUMN IF NOT EXISTS doors INTEGER,
ADD COLUMN IF NOT EXISTS passengers INTEGER,
ADD COLUMN IF NOT EXISTS fuel_type TEXT,
ADD COLUMN IF NOT EXISTS exterior_color TEXT,
ADD COLUMN IF NOT EXISTS interior_color TEXT;

-- Update existing vehicles with default values if needed
UPDATE public.vehicles 
SET 
  engine = COALESCE(engine, 'Not Specified'),
  transmission = COALESCE(transmission, 'Not Specified'),
  drivetrain = COALESCE(drivetrain, 'Not Specified'),
  mpg = COALESCE(mpg, 'Not Specified'),
  body_style = COALESCE(body_style, 'Not Specified'),
  doors = COALESCE(doors, 4),
  passengers = COALESCE(passengers, 5),
  fuel_type = COALESCE(fuel_type, 'Gas'),
  exterior_color = COALESCE(exterior_color, 'Not Specified'),
  interior_color = COALESCE(interior_color, 'Not Specified')
WHERE engine IS NULL OR transmission IS NULL OR drivetrain IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.vehicles.engine IS 'Engine type and size (e.g., 2.0L 4-Cylinder)';
COMMENT ON COLUMN public.vehicles.transmission IS 'Transmission type (Automatic, Manual, CVT)';
COMMENT ON COLUMN public.vehicles.drivetrain IS 'Drivetrain type (FWD, RWD, AWD, 4WD)';
COMMENT ON COLUMN public.vehicles.mpg IS 'Fuel economy (e.g., 25/30 MPG)';
COMMENT ON COLUMN public.vehicles.body_style IS 'Body style (Sedan, SUV, Hatchback, etc.)';
COMMENT ON COLUMN public.vehicles.doors IS 'Number of doors';
COMMENT ON COLUMN public.vehicles.passengers IS 'Passenger capacity';
COMMENT ON COLUMN public.vehicles.fuel_type IS 'Fuel type (Gas, Diesel, Hybrid, Electric)';
COMMENT ON COLUMN public.vehicles.exterior_color IS 'Exterior color';
COMMENT ON COLUMN public.vehicles.interior_color IS 'Interior color';
