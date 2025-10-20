-- =========================================
-- ACCORRIA PERFORMANCE ANALYTICS SCHEMA
-- Adds performance tracking, RDR system, and communication quality scoring
-- =========================================

-- =========================================
-- PERFORMANCE TRACKING TABLES
-- =========================================

-- User performance metrics
CREATE TABLE IF NOT EXISTS public.user_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Customer interaction metrics
  customer_presentations INTEGER DEFAULT 0,
  write_ups_per_customer DECIMAL(5,2) DEFAULT 0.00,
  trade_ins_added INTEGER DEFAULT 0,
  
  -- Approval metrics
  approved_finance_percent DECIMAL(5,2) DEFAULT 0.00,
  approved_lease_percent DECIMAL(5,2) DEFAULT 0.00,
  approved_cash_percent DECIMAL(5,2) DEFAULT 0.00,
  approved_write_ups INTEGER DEFAULT 0,
  approval_abandon_rate DECIMAL(5,2) DEFAULT 0.00,
  
  -- Sales metrics
  confirmed_customers INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  first_pencil_rate DECIMAL(5,2) DEFAULT 0.00,
  close_rate DECIMAL(5,2) DEFAULT 0.00,
  
  -- Time metrics
  time_in_app_per_customer INTEGER DEFAULT 0, -- minutes
  approval_time INTEGER DEFAULT 0, -- minutes
  deals_under_10_min_percent DECIMAL(5,2) DEFAULT 0.00,
  
  -- Utilization metrics
  in_store_utilization DECIMAL(5,2) DEFAULT 0.00,
  lead_to_utilization DECIMAL(5,2) DEFAULT 0.00,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RDR (Retail Delivery Report) tracking
CREATE TABLE IF NOT EXISTS public.rdr_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  
  -- RDR classification
  rdr_type TEXT NOT NULL, -- 'PURCHASE-INDIVIDUAL', 'LEASE-INDIVIDUAL', 'BUSINESS', 'RENTAL'
  saaps_rdr BOOLEAN DEFAULT false, -- Sales as a Service Platform RDR
  slaaps_rdr BOOLEAN DEFAULT false, -- Sales Lead as a Service Platform RDR
  slaaps_lead_rdr BOOLEAN DEFAULT false, -- SLaaPS Lead RDR
  
  -- Status tracking
  lead_submitted BOOLEAN DEFAULT false,
  customer_confirmed BOOLEAN DEFAULT false,
  customer_in_mst BOOLEAN DEFAULT false, -- Management System Time
  time_in_mst INTEGER, -- minutes
  
  -- Confirmation details
  confirmation_date TIMESTAMPTZ,
  confirmation_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Communication quality scoring
CREATE TABLE IF NOT EXISTS public.communication_quality (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  
  -- Quality scoring criteria
  personalized_subject_line BOOLEAN DEFAULT false,
  professional_introduction BOOLEAN DEFAULT false,
  addressed_by_name BOOLEAN DEFAULT false,
  showed_appreciation BOOLEAN DEFAULT false,
  acknowledged_steps BOOLEAN DEFAULT false,
  addressed_vehicle_availability BOOLEAN DEFAULT false,
  included_pricing BOOLEAN DEFAULT false,
  answered_question BOOLEAN DEFAULT false,
  addressed_trade_inquiry BOOLEAN DEFAULT false,
  provided_value_proposition BOOLEAN DEFAULT false,
  
  -- Scoring
  total_score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 100,
  quality_percentage DECIMAL(5,2) DEFAULT 0.00,
  
  -- Response time
  response_time_minutes INTEGER,
  
  -- AI analysis
  ai_feedback TEXT,
  improvement_suggestions TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance trends and benchmarking
CREATE TABLE IF NOT EXISTS public.performance_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Time period
  period_type TEXT NOT NULL, -- 'monthly', 'quarterly', 'yearly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Trend metrics
  metric_name TEXT NOT NULL, -- 'close_rate', 'utilization', 'first_pencil_rate'
  metric_value DECIMAL(10,2) NOT NULL,
  previous_period_value DECIMAL(10,2),
  change_percentage DECIMAL(5,2),
  
  -- Benchmarking
  dealer_average DECIMAL(10,2),
  region_average DECIMAL(10,2),
  national_average DECIMAL(10,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- ENHANCED EXISTING TABLES
-- =========================================

-- Add performance fields to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS performance_score INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_performance_review DATE;

-- Add performance fields to leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS presentation_count INTEGER DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS write_up_count INTEGER DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS time_in_app INTEGER DEFAULT 0; -- minutes
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS approval_time INTEGER DEFAULT 0; -- minutes
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS first_pencil_rate DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS rdr_status TEXT DEFAULT 'pending'; -- 'confirmed', 'pending', 'rejected'
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS is_eligible BOOLEAN DEFAULT true;

-- Add performance fields to vehicles table
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS utilization_rate DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS lead_to_utilization DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS stock_number TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS accessories TEXT[];
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS exterior_color TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS interior_color TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS invoice_price NUMERIC;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS total_srp NUMERIC;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS advertised_price NUMERIC;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS smart_pricing_status TEXT DEFAULT 'no_rule'; -- 'applied', 'override', 'no_rule'
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;

-- =========================================
-- ROW LEVEL SECURITY
-- =========================================

-- Enable RLS on new tables
ALTER TABLE public.user_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rdr_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_quality ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_trends ENABLE ROW LEVEL SECURITY;

-- =========================================
-- RLS POLICIES
-- =========================================

-- User performance policies
CREATE POLICY "user_performance select by dealer" ON public.user_performance
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
      AND (u.role = 'super_admin' OR u.dealer_id = user_performance.dealer_id)
  )
);

CREATE POLICY "user_performance write by admin" ON public.user_performance
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
      AND (u.role = 'super_admin' OR (u.role = 'dealer_admin' AND u.dealer_id = user_performance.dealer_id))
  )
);

-- RDR tracking policies
CREATE POLICY "rdr_tracking select by dealer" ON public.rdr_tracking
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
      AND (u.role = 'super_admin' OR u.dealer_id = rdr_tracking.dealer_id)
  )
);

CREATE POLICY "rdr_tracking write by dealer staff" ON public.rdr_tracking
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
      AND (u.role = 'super_admin' OR u.dealer_id = rdr_tracking.dealer_id)
  )
);

-- Communication quality policies
CREATE POLICY "communication_quality select by dealer" ON public.communication_quality
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
      AND (u.role = 'super_admin' OR u.dealer_id = communication_quality.dealer_id)
  )
);

CREATE POLICY "communication_quality write by dealer staff" ON public.communication_quality
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
      AND (u.role = 'super_admin' OR u.dealer_id = communication_quality.dealer_id)
  )
);

-- Performance trends policies
CREATE POLICY "performance_trends select by dealer" ON public.performance_trends
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
      AND (u.role = 'super_admin' OR u.dealer_id = performance_trends.dealer_id)
  )
);

CREATE POLICY "performance_trends write by admin" ON public.performance_trends
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
      AND (u.role = 'super_admin' OR (u.role = 'dealer_admin' AND u.dealer_id = performance_trends.dealer_id))
  )
);

-- =========================================
-- INDEXES FOR PERFORMANCE
-- =========================================

-- User performance indexes
CREATE INDEX IF NOT EXISTS idx_user_performance_user_id ON public.user_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_user_performance_dealer_id ON public.user_performance(dealer_id);
CREATE INDEX IF NOT EXISTS idx_user_performance_period ON public.user_performance(period_start, period_end);

-- RDR tracking indexes
CREATE INDEX IF NOT EXISTS idx_rdr_tracking_dealer_id ON public.rdr_tracking(dealer_id);
CREATE INDEX IF NOT EXISTS idx_rdr_tracking_user_id ON public.rdr_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_rdr_tracking_lead_id ON public.rdr_tracking(lead_id);
CREATE INDEX IF NOT EXISTS idx_rdr_tracking_type ON public.rdr_tracking(rdr_type);
CREATE INDEX IF NOT EXISTS idx_rdr_tracking_saaps ON public.rdr_tracking(saaps_rdr);
CREATE INDEX IF NOT EXISTS idx_rdr_tracking_slaaps ON public.rdr_tracking(slaaps_rdr);

-- Communication quality indexes
CREATE INDEX IF NOT EXISTS idx_communication_quality_dealer_id ON public.communication_quality(dealer_id);
CREATE INDEX IF NOT EXISTS idx_communication_quality_user_id ON public.communication_quality(user_id);
CREATE INDEX IF NOT EXISTS idx_communication_quality_lead_id ON public.communication_quality(lead_id);
CREATE INDEX IF NOT EXISTS idx_communication_quality_score ON public.communication_quality(quality_percentage);
CREATE INDEX IF NOT EXISTS idx_communication_quality_created_at ON public.communication_quality(created_at);

-- Performance trends indexes
CREATE INDEX IF NOT EXISTS idx_performance_trends_dealer_id ON public.performance_trends(dealer_id);
CREATE INDEX IF NOT EXISTS idx_performance_trends_user_id ON public.performance_trends(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_trends_metric ON public.performance_trends(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_trends_period ON public.performance_trends(period_start, period_end);

-- =========================================
-- SAMPLE DATA FOR TESTING
-- =========================================

-- Insert sample performance data for testing
INSERT INTO public.user_performance (
  user_id, dealer_id, period_start, period_end,
  customer_presentations, write_ups_per_customer, trade_ins_added,
  approved_finance_percent, approved_lease_percent, approved_cash_percent,
  approved_write_ups, approval_abandon_rate, confirmed_customers, sales_count,
  first_pencil_rate, close_rate, time_in_app_per_customer, approval_time,
  deals_under_10_min_percent, in_store_utilization, lead_to_utilization
) 
SELECT 
  u.id, u.dealer_id, '2025-01-01', '2025-01-31',
  25, 1.15, 8,
  2.5, 1.2, 0.8,
  12, 15.5, 5, 18,
  75.0, 65.0, 12, 45,
  85.0, 22.5, 18.3
FROM public.users u 
WHERE u.role = 'sales_rep' 
LIMIT 1
ON CONFLICT DO NOTHING;

-- =========================================
-- COMPLETE!
-- =========================================
