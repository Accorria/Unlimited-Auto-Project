-- =========================================
-- LEAD OPS FEATURES - Comprehensive Update
-- =========================================
-- This migration adds all lead operations features:
-- 1. Lead SLAs (first_response_at, response_time_minutes, next_action_due_at, priority)
-- 2. Lead tasks table
-- 3. Price change log table
-- 4. Tracking events table
-- 5. Reply macros table
-- 6. Accorria hooks columns
-- =========================================

-- =========================================
-- 1. LEAD SLA COLUMNS
-- =========================================

-- Add SLA columns to leads table
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS first_response_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS response_time_minutes INTEGER,
ADD COLUMN IF NOT EXISTS next_action_due_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

-- Add index for priority filtering
CREATE INDEX IF NOT EXISTS idx_leads_priority ON public.leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_next_action_due_at ON public.leads(next_action_due_at);
CREATE INDEX IF NOT EXISTS idx_leads_first_response_at ON public.leads(first_response_at);

-- =========================================
-- 2. LEAD TASKS TABLE
-- =========================================

-- Check if leads table exists before creating lead_tasks
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leads') THEN
    CREATE TABLE IF NOT EXISTS public.lead_tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
      dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_at TIMESTAMPTZ,
  owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done', 'cancelled')),
  notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
    );
  END IF;
END $$;

-- Indexes for lead_tasks (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lead_tasks') THEN
    CREATE INDEX IF NOT EXISTS idx_lead_tasks_lead_id ON public.lead_tasks(lead_id);
    CREATE INDEX IF NOT EXISTS idx_lead_tasks_owner_id ON public.lead_tasks(owner_id);
    CREATE INDEX IF NOT EXISTS idx_lead_tasks_status ON public.lead_tasks(status);
    CREATE INDEX IF NOT EXISTS idx_lead_tasks_due_at ON public.lead_tasks(due_at);
    CREATE INDEX IF NOT EXISTS idx_lead_tasks_dealer_id ON public.lead_tasks(dealer_id);

    -- Enable RLS on lead_tasks
    ALTER TABLE public.lead_tasks ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- RLS policies for lead_tasks (drop if exists first)
DROP POLICY IF EXISTS "lead_tasks_select_by_dealer" ON public.lead_tasks;
CREATE POLICY "lead_tasks_select_by_dealer" ON public.lead_tasks
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
    AND (
      u.role = 'super_admin' OR
      (u.dealer_id = lead_tasks.dealer_id AND u.role IN ('dealer_admin', 'sales_manager')) OR
      (u.dealer_id = lead_tasks.dealer_id AND u.role = 'sales_rep' AND u.id = lead_tasks.owner_id)
    )
  )
);

DROP POLICY IF EXISTS "lead_tasks_write_by_dealer" ON public.lead_tasks;
CREATE POLICY "lead_tasks_write_by_dealer" ON public.lead_tasks
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
    AND (
      u.role = 'super_admin' OR
      (u.dealer_id = lead_tasks.dealer_id AND u.role IN ('dealer_admin', 'sales_manager')) OR
      (u.dealer_id = lead_tasks.dealer_id AND u.role = 'sales_rep' AND u.id = lead_tasks.owner_id)
    )
  )
);

-- =========================================
-- 3. PRICE CHANGE LOG TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.price_change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  old_price INTEGER,
  new_price INTEGER NOT NULL,
  changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Indexes for price_change_log
CREATE INDEX IF NOT EXISTS idx_price_change_log_vehicle_id ON public.price_change_log(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_price_change_log_dealer_id ON public.price_change_log(dealer_id);
CREATE INDEX IF NOT EXISTS idx_price_change_log_changed_at ON public.price_change_log(changed_at);

-- Enable RLS on price_change_log
ALTER TABLE public.price_change_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for price_change_log
CREATE POLICY "price_change_log_select_by_dealer" ON public.price_change_log
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
    AND (
      u.role = 'super_admin' OR
      (u.dealer_id = price_change_log.dealer_id AND u.role IN ('dealer_admin', 'sales_manager'))
    )
  )
);

CREATE POLICY "price_change_log_insert_by_dealer" ON public.price_change_log
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
    AND (
      u.role = 'super_admin' OR
      (u.dealer_id = price_change_log.dealer_id AND u.role IN ('dealer_admin', 'sales_manager'))
    )
  )
);

-- =========================================
-- 4. TRACKING EVENTS TABLE
-- =========================================

-- Check if leads table exists before creating tracking_events
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leads') THEN
    CREATE TABLE IF NOT EXISTS public.tracking_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
      lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('click_to_call', 'email_click', 'sms_click', 'cta_click', 'form_submit', 'page_view')),
  event_data JSONB,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Add missing columns to existing tracking_events table if needed
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tracking_events') THEN
    -- Check and add lead_id column if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'tracking_events' 
      AND column_name = 'lead_id'
    ) THEN
      ALTER TABLE public.tracking_events 
      ADD COLUMN lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL;
    END IF;
    
    -- Check and add vehicle_id column if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'tracking_events' 
      AND column_name = 'vehicle_id'
    ) THEN
      ALTER TABLE public.tracking_events 
      ADD COLUMN vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL;
    END IF;
    
    -- Check and add other required columns if they don't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'tracking_events' 
      AND column_name = 'event_type'
    ) THEN
      ALTER TABLE public.tracking_events 
      ADD COLUMN event_type TEXT CHECK (event_type IN ('click_to_call', 'email_click', 'sms_click', 'cta_click', 'form_submit', 'page_view'));
    END IF;
    
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'tracking_events' 
      AND column_name = 'event_data'
    ) THEN
      ALTER TABLE public.tracking_events 
      ADD COLUMN event_data JSONB;
    END IF;
    
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'tracking_events' 
      AND column_name = 'ip_address'
    ) THEN
      ALTER TABLE public.tracking_events 
      ADD COLUMN ip_address TEXT;
    END IF;
    
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'tracking_events' 
      AND column_name = 'user_agent'
    ) THEN
      ALTER TABLE public.tracking_events 
      ADD COLUMN user_agent TEXT;
    END IF;
  END IF;
END $$;

-- Indexes for tracking_events (only if table and columns exist)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tracking_events') THEN
    -- Only create index if lead_id column exists
    IF EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'tracking_events' 
      AND column_name = 'lead_id'
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_tracking_events_lead_id ON public.tracking_events(lead_id);
    END IF;
    
    -- Only create index if vehicle_id column exists
    IF EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'tracking_events' 
      AND column_name = 'vehicle_id'
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_tracking_events_vehicle_id ON public.tracking_events(vehicle_id);
    END IF;
    
    -- Create other indexes (these columns should exist)
    CREATE INDEX IF NOT EXISTS idx_tracking_events_dealer_id ON public.tracking_events(dealer_id);
    
    IF EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'tracking_events' 
      AND column_name = 'event_type'
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_tracking_events_event_type ON public.tracking_events(event_type);
    END IF;
    
    CREATE INDEX IF NOT EXISTS idx_tracking_events_created_at ON public.tracking_events(created_at);

    -- Enable RLS on tracking_events
    ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- RLS policies for tracking_events (drop if exists first)
DROP POLICY IF EXISTS "tracking_events_select_by_dealer" ON public.tracking_events;
CREATE POLICY "tracking_events_select_by_dealer" ON public.tracking_events
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
    AND (
      u.role = 'super_admin' OR
      (u.dealer_id = tracking_events.dealer_id AND u.role IN ('dealer_admin', 'sales_manager', 'sales_rep'))
    )
  )
);

DROP POLICY IF EXISTS "tracking_events_insert_public" ON public.tracking_events;
CREATE POLICY "tracking_events_insert_public" ON public.tracking_events
FOR INSERT WITH CHECK (true);

-- =========================================
-- 5. REPLY MACROS TABLE (Resend Templates)
-- =========================================

CREATE TABLE IF NOT EXISTS public.reply_macros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
  category TEXT, -- e.g., 'down_payment_options', 'bring_docs', 'directions_hours'
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for reply_macros
CREATE INDEX IF NOT EXISTS idx_reply_macros_dealer_id ON public.reply_macros(dealer_id);
CREATE INDEX IF NOT EXISTS idx_reply_macros_category ON public.reply_macros(category);
CREATE INDEX IF NOT EXISTS idx_reply_macros_channel ON public.reply_macros(channel);

-- Enable RLS on reply_macros
ALTER TABLE public.reply_macros ENABLE ROW LEVEL SECURITY;

-- RLS policies for reply_macros
CREATE POLICY "reply_macros_select_by_dealer" ON public.reply_macros
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
    AND (
      u.role = 'super_admin' OR
      (u.dealer_id = reply_macros.dealer_id AND u.role IN ('dealer_admin', 'sales_manager', 'sales_rep'))
    )
  )
);

CREATE POLICY "reply_macros_write_by_dealer" ON public.reply_macros
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
    AND (
      u.role = 'super_admin' OR
      (u.dealer_id = reply_macros.dealer_id AND u.role IN ('dealer_admin', 'sales_manager'))
    )
  )
);

-- =========================================
-- 6. ACCORRIA HOOKS COLUMNS
-- =========================================

-- Add Accorria columns to leads table
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS fb_user_id TEXT,
ADD COLUMN IF NOT EXISTS accorria_score INTEGER,
ADD COLUMN IF NOT EXISTS accorria_tags TEXT[],
ADD COLUMN IF NOT EXISTS lender_ref TEXT,
ADD COLUMN IF NOT EXISTS lender_status TEXT;

-- Add Accorria columns to vehicles table
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS accorria_status TEXT,
ADD COLUMN IF NOT EXISTS accorria_post_ids JSONB,
ADD COLUMN IF NOT EXISTS first_listed_at TIMESTAMPTZ;

-- Note: days_on_lot is calculated in queries, not stored as generated column
-- because NOW() is not immutable. Use this query to get days_on_lot:
-- SELECT EXTRACT(DAY FROM (NOW() - COALESCE(first_listed_at, created_at))) as days_on_lot

-- Indexes for Accorria columns
CREATE INDEX IF NOT EXISTS idx_leads_fb_user_id ON public.leads(fb_user_id);
CREATE INDEX IF NOT EXISTS idx_leads_accorria_score ON public.leads(accorria_score);
CREATE INDEX IF NOT EXISTS idx_vehicles_accorria_status ON public.vehicles(accorria_status);
CREATE INDEX IF NOT EXISTS idx_vehicles_first_listed_at ON public.vehicles(first_listed_at);

-- Note: days_on_lot is calculated at query time, not stored as a column
-- because NOW() is not immutable. Use this in your queries:
-- EXTRACT(DAY FROM (NOW() - COALESCE(first_listed_at, created_at))) as days_on_lot

-- =========================================
-- 7. FUNCTION TO CALCULATE RESPONSE TIME
-- =========================================

CREATE OR REPLACE FUNCTION calculate_response_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.first_response_at IS NOT NULL AND OLD.first_response_at IS NULL THEN
    NEW.response_time_minutes := EXTRACT(EPOCH FROM (NEW.first_response_at - NEW.created_at)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate response time
DROP TRIGGER IF EXISTS trigger_calculate_response_time ON public.leads;
CREATE TRIGGER trigger_calculate_response_time
BEFORE UPDATE ON public.leads
FOR EACH ROW
WHEN (NEW.first_response_at IS DISTINCT FROM OLD.first_response_at)
EXECUTE FUNCTION calculate_response_time();

-- =========================================
-- 8. FUNCTION TO LOG PRICE CHANGES
-- =========================================

CREATE OR REPLACE FUNCTION log_price_change()
RETURNS TRIGGER AS $$
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

-- Trigger to auto-log price changes
DROP TRIGGER IF EXISTS trigger_log_price_change ON public.vehicles;
CREATE TRIGGER trigger_log_price_change
AFTER UPDATE OF price ON public.vehicles
FOR EACH ROW
WHEN (OLD.price IS DISTINCT FROM NEW.price)
EXECUTE FUNCTION log_price_change();

-- =========================================
-- 9. UPDATE VEHICLE STATUS WHEN LISTED
-- =========================================

-- Set first_listed_at when vehicle status changes to 'available' or 'active'
CREATE OR REPLACE FUNCTION set_first_listed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('available', 'active') AND OLD.status NOT IN ('available', 'active') THEN
    IF NEW.first_listed_at IS NULL THEN
      NEW.first_listed_at := NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set first_listed_at
DROP TRIGGER IF EXISTS trigger_set_first_listed_at ON public.vehicles;
CREATE TRIGGER trigger_set_first_listed_at
BEFORE UPDATE OF status ON public.vehicles
FOR EACH ROW
EXECUTE FUNCTION set_first_listed_at();

-- =========================================
-- COMPLETE!
-- =========================================

