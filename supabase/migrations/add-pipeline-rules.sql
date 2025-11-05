-- =========================================
-- PIPELINE RULES - Auto Status Updates
-- =========================================
-- This migration adds triggers to automatically update lead status
-- based on appointment and sale events
-- =========================================

-- =========================================
-- 1. FUNCTION: Auto-set status when appointment scheduled
-- =========================================

CREATE OR REPLACE FUNCTION auto_set_lead_status_on_appointment()
RETURNS TRIGGER AS $$
BEGIN
  -- When appointment is created for a lead, set lead status to 'set' (appointment)
  IF NEW.lead_id IS NOT NULL AND NEW.status = 'scheduled' THEN
    UPDATE public.leads
    SET 
      status = 'set',
      status_updated_at = NOW(),
      next_action_due_at = NEW.start_at
    WHERE id = NEW.lead_id
    AND status = 'new';
    
    -- Log status change
    INSERT INTO public.lead_status_history (
      lead_id,
      from_status,
      to_status,
      changed_by,
      notes
    ) VALUES (
      NEW.lead_id,
      'new',
      'set',
      (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1),
      'Auto-set when appointment scheduled'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for appointment creation
DROP TRIGGER IF EXISTS trigger_auto_set_on_appointment ON public.appointments;
CREATE TRIGGER trigger_auto_set_on_appointment
AFTER INSERT ON public.appointments
FOR EACH ROW
WHEN (NEW.lead_id IS NOT NULL AND NEW.status = 'scheduled')
EXECUTE FUNCTION auto_set_lead_status_on_appointment();

-- =========================================
-- 2. FUNCTION: Auto-set status when appointment marked attended
-- =========================================

CREATE OR REPLACE FUNCTION auto_show_lead_status_on_attended()
RETURNS TRIGGER AS $$
BEGIN
  -- When appointment status changes to 'completed' or 'in_progress', set lead to 'show'
  IF NEW.lead_id IS NOT NULL 
     AND OLD.status != NEW.status 
     AND NEW.status IN ('completed', 'in_progress') 
     AND OLD.status NOT IN ('completed', 'in_progress') THEN
    
    UPDATE public.leads
    SET 
      status = 'show',
      status_updated_at = NOW()
    WHERE id = NEW.lead_id
    AND status IN ('new', 'set');
    
    -- Log status change
    INSERT INTO public.lead_status_history (
      lead_id,
      from_status,
      to_status,
      changed_by,
      notes
    ) VALUES (
      NEW.lead_id,
      (SELECT status FROM public.leads WHERE id = NEW.lead_id),
      'show',
      (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1),
      'Auto-set when appointment marked attended'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for appointment status update
DROP TRIGGER IF EXISTS trigger_auto_show_on_attended ON public.appointments;
CREATE TRIGGER trigger_auto_show_on_attended
AFTER UPDATE OF status ON public.appointments
FOR EACH ROW
WHEN (NEW.lead_id IS NOT NULL AND NEW.status IN ('completed', 'in_progress'))
EXECUTE FUNCTION auto_show_lead_status_on_attended();

-- =========================================
-- 3. FUNCTION: Auto-close when sale recorded
-- =========================================

CREATE OR REPLACE FUNCTION auto_close_lead_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  -- When lead has close_date set, update status to 'close'
  IF NEW.close_date IS NOT NULL AND (OLD.close_date IS NULL OR OLD.close_date IS DISTINCT FROM NEW.close_date) THEN
    UPDATE public.leads
    SET 
      status = 'close',
      status_updated_at = NOW()
    WHERE id = NEW.id
    AND status != 'close';
    
    -- Log status change
    INSERT INTO public.lead_status_history (
      lead_id,
      from_status,
      to_status,
      changed_by,
      notes
    ) VALUES (
      NEW.id,
      OLD.status,
      'close',
      (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1),
      'Auto-closed when sale recorded'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for lead close_date update
DROP TRIGGER IF EXISTS trigger_auto_close_on_sale ON public.leads;
CREATE TRIGGER trigger_auto_close_on_sale
AFTER UPDATE OF close_date ON public.leads
FOR EACH ROW
WHEN (NEW.close_date IS NOT NULL AND (OLD.close_date IS NULL OR OLD.close_date IS DISTINCT FROM NEW.close_date))
EXECUTE FUNCTION auto_close_lead_on_sale();

-- =========================================
-- 4. FUNCTION: Auto-set first_response_at when lead is contacted
-- =========================================

CREATE OR REPLACE FUNCTION auto_set_first_response()
RETURNS TRIGGER AS $$
BEGIN
  -- Set first_response_at when status changes from 'new' to anything else
  IF OLD.status = 'new' AND NEW.status != 'new' AND NEW.first_response_at IS NULL THEN
    NEW.first_response_at := NOW();
    NEW.response_time_minutes := EXTRACT(EPOCH FROM (NOW() - NEW.created_at)) / 60;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for lead status update
DROP TRIGGER IF EXISTS trigger_auto_set_first_response ON public.leads;
CREATE TRIGGER trigger_auto_set_first_response
BEFORE UPDATE OF status ON public.leads
FOR EACH ROW
WHEN (OLD.status = 'new' AND NEW.status != 'new')
EXECUTE FUNCTION auto_set_first_response();

-- =========================================
-- COMPLETE!
-- =========================================

