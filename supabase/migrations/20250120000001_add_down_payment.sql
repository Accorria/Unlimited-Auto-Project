-- Add down_payment column if it doesn't exist
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS down_payment INTEGER DEFAULT 999;

-- Update existing vehicles with default down payment
UPDATE public.vehicles 
SET down_payment = 999 
WHERE down_payment IS NULL;
