-- Fix price_change_log trigger to work with service role client
-- The trigger function needs SECURITY DEFINER to bypass RLS when inserting logs

-- Drop and recreate the function with SECURITY DEFINER
-- SECURITY DEFINER allows the function to run with the privileges of the function owner,
-- bypassing RLS policies when inserting into price_change_log
CREATE OR REPLACE FUNCTION log_price_change()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.price IS DISTINCT FROM NEW.price THEN
    INSERT INTO public.price_change_log (
      vehicle_id,
      dealer_id,
      old_price,
      new_price,
      changed_by,
      notes
    ) VALUES (
      NEW.id,
      NEW.dealer_id,
      OLD.price,
      NEW.price,
      (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1),
      'Price updated from ' || COALESCE(OLD.price::TEXT, 'NULL') || ' to ' || NEW.price::TEXT
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

