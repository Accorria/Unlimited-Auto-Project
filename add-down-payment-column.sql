-- Add down_payment column to vehicles table
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS down_payment INTEGER DEFAULT 999;

-- Add other missing specification columns
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
ADD COLUMN IF NOT EXISTS interior_color TEXT,
ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'Good';
