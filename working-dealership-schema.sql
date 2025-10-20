-- =========================================
-- WORKING DEALERSHIP SCHEMA - Accorria × Unlimited Auto
-- Complete schema without problematic cleanup section
-- =========================================

-- =========================================
-- ENUMS
-- =========================================

-- Photo angles for vehicle photography
CREATE TYPE angle_code AS ENUM (
  'FDS','FPS','SDS','SPS','SRDS','SRPS','RDS','R','F',
  'INT','INTB','ENG','TRK','ODOM','VIN'
);

-- User roles for RBAC
CREATE TYPE user_role AS ENUM (
  'super_admin',    -- SMA - Super Master Admin
  'dealer_admin',   -- DA - Dealer Owner/Admin  
  'sales_manager',  -- SM - Sales Manager
  'sales_rep'       -- SR - Sales Rep
);

-- Lead status tracking
CREATE TYPE lead_status AS ENUM (
  'new',        -- New lead
  'contacted',  -- Initial contact made
  'qualified',  -- Lead qualified
  'appointment',-- Appointment set
  'showed',     -- Customer showed up
  'test_drive', -- Test drive completed
  'negotiating',-- Price negotiation
  'financing',  -- Finance application
  'closed_won', -- Deal closed - won
  'closed_lost' -- Deal closed - lost
);

-- Appointment types
CREATE TYPE appointment_type AS ENUM (
  'test_drive',
  'finance_meeting',
  'delivery',
  'follow_up',
  'service',
  'inspection'
);

-- Appointment status
CREATE TYPE appointment_status AS ENUM (
  'scheduled',
  'confirmed',
  'in_progress',
  'completed',
  'no_show',
  'cancelled',
  'rescheduled'
);

-- Message channels
CREATE TYPE message_channel AS ENUM (
  'sms',
  'email',
  'phone_call',
  'facebook',
  'instagram',
  'website_chat',
  'in_person'
);

-- Message direction
CREATE TYPE message_direction AS ENUM (
  'inbound',
  'outbound'
);

-- Document types
CREATE TYPE document_type AS ENUM (
  'drivers_license',
  'proof_of_income',
  'bank_statement',
  'insurance_card',
  'contract',
  'title',
  'registration',
  'inspection_report',
  'service_record',
  'photo',
  'other'
);

-- =========================================
-- CORE TABLES
-- =========================================

-- Dealers table (multi-tenant support) - SKIP if already exists
CREATE TABLE IF NOT EXISTS public.dealers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,           -- e.g., 'unlimited-auto'
  name TEXT NOT NULL,                  -- e.g., 'Unlimited Auto'
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  hours JSONB,                         -- business hours
  social_media JSONB,                  -- social media links
  seo_settings JSONB,                  -- meta title, description, keywords
  is_active BOOLEAN DEFAULT true,      -- license control
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (RBAC system) - SKIP if already exists
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE,            -- Supabase auth.users.id
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  commission_rate DECIMAL(5,2) DEFAULT 0.00, -- e.g., 2.50 for 2.5%
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  vin TEXT UNIQUE,
  year INTEGER NOT NULL,
  make TEXT,
  model TEXT,
  model_code TEXT,      -- e.g., TB
  trim TEXT,
  miles INTEGER,
  price INTEGER,        -- asking price
  cost INTEGER,         -- acquisition cost
  title_status TEXT,    -- clean / rebuilt / salvage
  description TEXT,
  status TEXT DEFAULT 'available', -- available, sold, pending, reconditioning
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL, -- SR assignment
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique vehicles per dealer
  UNIQUE(year, model_code, dealer_id)
);

-- Vehicle photos table
CREATE TABLE IF NOT EXISTS public.vehicle_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  angle angle_code NOT NULL,
  file_path TEXT NOT NULL,           -- storage path in bucket
  public_url TEXT NOT NULL,          -- generated public URL
  width INTEGER,
  height INTEGER,
  is_primary BOOLEAN DEFAULT false,  -- primary photo for listing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one photo per angle per vehicle
  UNIQUE(vehicle_id, angle)
);

-- =========================================
-- LEAD MANAGEMENT
-- =========================================

-- Enhanced leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL, -- SM/DA assignment
  
  -- Contact information
  name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  message TEXT,
  
  -- Financial information
  income TEXT,
  net_monthly_income NUMERIC,
  employer TEXT,
  months_on_job INTEGER,
  dl_state TEXT,
  down_payment INTEGER,
  down_payment_ratio DECIMAL(3,2), -- e.g., 0.20 for 20%
  credit_score INTEGER,
  
  -- Attribution tracking
  source TEXT,                -- website, fb, sms, craigslist
  agent TEXT,                 -- mo, fred, dewey, etc
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  gclid TEXT,
  
  -- Lead management
  status lead_status DEFAULT 'new',
  notes TEXT,                 -- internal notes
  consent BOOLEAN DEFAULT FALSE,
  
  -- Follow-up tracking
  follow_up_date DATE,
  follow_up_notes TEXT,
  last_contact_date TIMESTAMPTZ,
  
  -- Deal closing
  close_date DATE,
  close_amount NUMERIC,
  commission_amount NUMERIC,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead status history for tracking
CREATE TABLE IF NOT EXISTS public.lead_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  from_status lead_status,
  to_status lead_status NOT NULL,
  changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- APPOINTMENT SYSTEM
-- =========================================

-- Appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL, -- sales rep
  type appointment_type NOT NULL DEFAULT 'test_drive',
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  status appointment_status NOT NULL DEFAULT 'scheduled',
  location TEXT,
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- COMMUNICATION SYSTEM
-- =========================================

-- Messages table (omni-inbox)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  channel message_channel NOT NULL,
  direction message_direction NOT NULL,
  sender_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,  -- for 'outbound' or in_person
  recipient_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  to_address TEXT,     -- phone/email/fb id
  from_address TEXT,   -- phone/email/fb id
  subject TEXT,
  body TEXT,
  attachments JSONB,   -- array of files/urls
  external_id TEXT,    -- provider msg id
  status TEXT,         -- sent|delivered|failed|read...
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- DOCUMENT MANAGEMENT
-- =========================================

-- Documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  doc_type document_type NOT NULL,
  file_path TEXT NOT NULL,
  public_url TEXT,   -- if public-read asset
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================
-- ANALYTICS & TRACKING
-- =========================================

-- Activity logs (audit trail)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  dealer_id UUID REFERENCES public.dealers(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,       -- e.g., 'lead_update','vehicle_edit','appointment_created'
  target_table TEXT NOT NULL,      -- 'leads','vehicles','users', etc.
  target_id UUID,
  old_values JSONB,
  new_values JSONB,
  details JSONB,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================
-- ROW LEVEL SECURITY
-- =========================================

-- Enable RLS on all tables
ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- =========================================
-- RLS POLICIES
-- =========================================

-- Dealers: Public read, admin write
CREATE POLICY "public read dealers" ON public.dealers
FOR SELECT USING (true);

CREATE POLICY "admin manage dealers" ON public.dealers
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.auth_user_id = auth.uid() 
    AND users.role = 'super_admin'
  )
);

-- Users: Role-based access
CREATE POLICY "users can read own dealer" ON public.users
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
    AND (
      u.role = 'super_admin' OR
      (u.role IN ('dealer_admin', 'sales_manager') AND u.dealer_id = users.dealer_id)
    )
  )
);

CREATE POLICY "admin manage users" ON public.users
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
    AND (
      u.role = 'super_admin' OR
      (u.role = 'dealer_admin' AND u.dealer_id = users.dealer_id)
    )
  )
);

-- Vehicles: Public read, dealer-scoped write
CREATE POLICY "public read vehicles" ON public.vehicles
FOR SELECT USING (true);

CREATE POLICY "dealer manage vehicles" ON public.vehicles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
    AND (
      u.role = 'super_admin' OR
      (u.dealer_id = vehicles.dealer_id AND u.role IN ('dealer_admin', 'sales_manager'))
    )
  )
);

-- Vehicle photos: Public read, dealer-scoped write
CREATE POLICY "public read photos" ON public.vehicle_photos
FOR SELECT USING (true);

CREATE POLICY "dealer manage photos" ON public.vehicle_photos
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
    AND (
      u.role = 'super_admin' OR
      (u.dealer_id = (SELECT dealer_id FROM public.vehicles WHERE id = vehicle_photos.vehicle_id) 
       AND u.role IN ('dealer_admin', 'sales_manager', 'sales_rep'))
    )
  )
);

-- Leads: Role-based access with dealer scoping
CREATE POLICY "users can read dealer leads" ON public.leads
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
    AND (
      u.role = 'super_admin' OR
      (u.dealer_id = leads.dealer_id AND u.role IN ('dealer_admin', 'sales_manager')) OR
      (u.dealer_id = leads.dealer_id AND u.role = 'sales_rep' AND u.id = leads.assigned_to)
    )
  )
);

CREATE POLICY "users can manage dealer leads" ON public.leads
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
    AND (
      u.role = 'super_admin' OR
      (u.dealer_id = leads.dealer_id AND u.role IN ('dealer_admin', 'sales_manager')) OR
      (u.dealer_id = leads.dealer_id AND u.role = 'sales_rep' AND u.id = leads.assigned_to)
    )
  )
);

-- Lead status history: Same access as leads
CREATE POLICY "users can read lead history" ON public.lead_status_history
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.leads l ON l.id = lead_status_history.lead_id
    WHERE u.auth_user_id = auth.uid()
    AND (
      u.role = 'super_admin' OR
      (u.dealer_id = l.dealer_id AND u.role IN ('dealer_admin', 'sales_manager')) OR
      (u.dealer_id = l.dealer_id AND u.role = 'sales_rep' AND u.id = l.assigned_to)
    )
  )
);

CREATE POLICY "users can create lead history" ON public.lead_status_history
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.leads l ON l.id = lead_status_history.lead_id
    WHERE u.auth_user_id = auth.uid()
    AND (
      u.role = 'super_admin' OR
      (u.dealer_id = l.dealer_id AND u.role IN ('dealer_admin', 'sales_manager')) OR
      (u.dealer_id = l.dealer_id AND u.role = 'sales_rep' AND u.id = l.assigned_to)
    )
  )
);

-- Appointments: Dealer-scoped access
CREATE POLICY "appointments select by dealer" ON public.appointments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
      AND (
        u.role = 'super_admin' OR u.dealer_id = appointments.dealer_id
      )
  )
);

CREATE POLICY "appointments write by role" ON public.appointments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
      AND (
        u.role = 'super_admin'
        OR (u.dealer_id = appointments.dealer_id AND u.role IN ('dealer_admin','sales_manager'))
        OR (u.dealer_id = appointments.dealer_id AND u.role = 'sales_rep' AND u.id = appointments.assigned_to)
      )
  )
);

-- Messages: Dealer-scoped access
CREATE POLICY "messages select by dealer" ON public.messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
      AND (u.role = 'super_admin' OR u.dealer_id = messages.dealer_id)
  )
);

CREATE POLICY "messages write by dealer staff" ON public.messages
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
      AND (u.role = 'super_admin' OR u.dealer_id = messages.dealer_id)
  )
);

-- Documents: Dealer-scoped access
CREATE POLICY "documents select by dealer" ON public.documents
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
      AND (u.role = 'super_admin' OR u.dealer_id = documents.dealer_id)
  )
);

CREATE POLICY "documents write by staff" ON public.documents
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
      AND (u.role = 'super_admin' OR u.dealer_id = documents.dealer_id)
  )
);

-- Activity logs: Admin access only
CREATE POLICY "activity_logs select by dealer admins" ON public.activity_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
      AND (u.role IN ('super_admin','dealer_admin','sales_manager'))
      AND (activity_logs.dealer_id IS NULL OR u.dealer_id = activity_logs.dealer_id)
  )
);

-- =========================================
-- INDEXES FOR PERFORMANCE
-- =========================================

-- Core tables
CREATE INDEX IF NOT EXISTS idx_dealers_slug ON public.dealers(slug);
CREATE INDEX IF NOT EXISTS idx_dealers_active ON public.dealers(is_active);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_dealer_id ON public.users(dealer_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_vehicles_dealer_id ON public.vehicles(dealer_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_assigned_to ON public.vehicles(assigned_to);
CREATE INDEX IF NOT EXISTS idx_vehicles_year_make_model ON public.vehicles(year, make, model);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON public.vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicle_photos_vehicle_id ON public.vehicle_photos(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_photos_angle ON public.vehicle_photos(angle);

-- Lead management
CREATE INDEX IF NOT EXISTS idx_leads_dealer_id ON public.leads(dealer_id);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_vehicle_id ON public.leads(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_agent ON public.leads(agent);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_follow_up_date ON public.leads(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_leads_close_date ON public.leads(close_date);
CREATE INDEX IF NOT EXISTS idx_lead_history_lead_id ON public.lead_status_history(lead_id);

-- Appointments
CREATE INDEX IF NOT EXISTS idx_appointments_dealer_time ON public.appointments(dealer_id, start_at);
CREATE INDEX IF NOT EXISTS idx_appointments_lead_id ON public.appointments(lead_id);
CREATE INDEX IF NOT EXISTS idx_appointments_assigned_to ON public.appointments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_dealer_time ON public.messages(dealer_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_lead_id ON public.messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_messages_channel ON public.messages(channel);
CREATE INDEX IF NOT EXISTS idx_messages_direction ON public.messages(direction);

-- Documents
CREATE INDEX IF NOT EXISTS idx_documents_dealer_time ON public.documents(dealer_id, uploaded_at);
CREATE INDEX IF NOT EXISTS idx_documents_lead_id ON public.documents(lead_id);
CREATE INDEX IF NOT EXISTS idx_documents_vehicle_id ON public.documents(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(doc_type);

-- Activity logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_dealer_time ON public.activity_logs(dealer_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_actor ON public.activity_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_target ON public.activity_logs(target_table, target_id);

-- =========================================
-- SAMPLE DATA
-- =========================================

-- Insert sample dealer data
INSERT INTO public.dealers (slug, name, address, phone, email, website, hours, social_media, seo_settings) VALUES
('unlimited-auto', 'Unlimited Auto', '24645 Plymouth Rd, Redford, MI 48239', '(313) 766-4475', 'info@unlimitedauto.com', 'https://unlimitedauto.com', 
 '{"monday": "9AM-7PM", "tuesday": "9AM-7PM", "wednesday": "9AM-7PM", "thursday": "9AM-7PM", "friday": "9AM-7PM", "saturday": "9AM-6PM", "sunday": "12PM-5PM"}',
 '{"facebook": "", "instagram": "", "twitter": "", "google": ""}',
 '{"metaTitle": "Unlimited Auto - Redford''s Easiest Credit Approval", "metaDescription": "Quality used cars with guaranteed financing. Bad credit? No credit? No problem! Drive home today.", "keywords": "used cars, auto financing, bad credit, Redford, Michigan"}')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample vehicles (after dealer exists)
INSERT INTO public.vehicles (dealer_id, year, make, model, model_code, price, miles, description) 
SELECT d.id, 2021, 'Chevrolet', 'Trailblazer', 'TB', 24995, 25000, 'Excellent condition, one owner'
FROM public.dealers d WHERE d.slug = 'unlimited-auto'
ON CONFLICT (year, model_code, dealer_id) DO NOTHING;

INSERT INTO public.vehicles (dealer_id, year, make, model, model_code, price, miles, description) 
SELECT d.id, 2020, 'Honda', 'Civic', 'CV', 18995, 45000, 'Well maintained, clean title'
FROM public.dealers d WHERE d.slug = 'unlimited-auto'
ON CONFLICT (year, model_code, dealer_id) DO NOTHING;

INSERT INTO public.vehicles (dealer_id, year, make, model, model_code, price, miles, description) 
SELECT d.id, 2019, 'Toyota', 'Camry', 'CM', 21995, 38000, 'Reliable transportation, great fuel economy'
FROM public.dealers d WHERE d.slug = 'unlimited-auto'
ON CONFLICT (year, model_code, dealer_id) DO NOTHING;

-- =========================================
-- COMPLETE!
-- =========================================
