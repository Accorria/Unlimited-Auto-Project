# 📊 Supabase Database Schema Summary

## Your Database Structure

Based on your actual Supabase database, here's what you have:

### **Schema: `public`**

**Total Tables: 15**

---

## 📋 **ENUMS (Custom Types)**

1. **`angle_code`** - Vehicle photo angles
   - FDS, FPS, SDS, SPS, SRDS, SRPS, RDS, R, F
   - INT, INTB, ENG, TRK, ODOM, VIN

2. **`user_role`** - User roles for RBAC
   - `super_admin` - Super Master Admin
   - `dealer_admin` - Dealer Owner/Admin
   - `sales_manager` - Sales Manager
   - `sales_rep` - Sales Rep

3. **`lead_status`** - Lead status tracking
   - `new`, `contacted`, `qualified`, `appointment`, `showed`, `test_drive`, `negotiating`, `financing`, `closed_won`, `closed_lost`

4. **`appointment_type`** - Appointment types
   - `test_drive`, `finance_meeting`, `delivery`, `follow_up`, `service`, `inspection`

5. **`appointment_status`** - Appointment status
   - `scheduled`, `confirmed`, `in_progress`, `completed`, `no_show`, `cancelled`, `rescheduled`

6. **`message_channel`** - Message channels
   - `sms`, `email`, `phone_call`, `facebook`, `instagram`, `website_chat`, `in_person`

7. **`message_direction`** - Message direction
   - `inbound`, `outbound`

8. **`document_type`** - Document types
   - `drivers_license`, `proof_of_income`, `bank_statement`, `insurance_card`, `contract`, `title`, `registration`, `inspection_report`, `service_record`, `photo`, `other`

---

## 🗃️ **TABLES**

### **1. `dealers`** - Dealership Information
**Purpose:** Multi-tenant dealer system

**Columns:**
- `id` (UUID) - Primary key
- `slug` (TEXT) - Unique identifier (e.g., 'unlimited-auto')
- `name` (TEXT) - Dealership name
- `address` (TEXT)
- `phone` (TEXT)
- `email` (TEXT)
- `website` (TEXT)
- `hours` (JSONB) - Business hours
- `social_media` (JSONB) - Social media links
- `seo_settings` (JSONB) - SEO metadata
- `is_active` (BOOLEAN) - License control
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

---

### **2. `users`** - User Management (RBAC)
**Purpose:** User accounts with role-based access control

**Columns:**
- `id` (UUID) - Primary key
- `auth_user_id` (UUID) - Links to Supabase auth.users
- `dealer_id` (UUID) - Foreign key to dealers
- `role` (user_role) - User role enum
- `email` (TEXT) - Unique
- `name` (TEXT)
- `phone` (TEXT)
- `commission_rate` (DECIMAL) - Commission percentage
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

---

### **3. `vehicles`** - Vehicle Inventory
**Purpose:** Vehicle inventory management

**Columns:**
- `id` (UUID) - Primary key
- `dealer_id` (UUID) - Foreign key to dealers
- `vin` (TEXT) - Unique VIN
- `year` (INTEGER)
- `make` (TEXT)
- `model` (TEXT)
- `model_code` (TEXT) - e.g., 'TB'
- `trim` (TEXT)
- `miles` (INTEGER)
- `price` (INTEGER) - Asking price
- `cost` (INTEGER) - Acquisition cost
- `title_status` (TEXT) - clean/rebuilt/salvage
- `description` (TEXT)
- `status` (TEXT) - available/sold/pending/reconditioning
- `assigned_to` (UUID) - Foreign key to users (sales rep)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Unique Constraint:** `(year, model_code, dealer_id)`

---

### **4. `vehicle_photos`** - Vehicle Photos
**Purpose:** Vehicle photo management

**Columns:**
- `id` (UUID) - Primary key
- `vehicle_id` (UUID) - Foreign key to vehicles
- `angle` (angle_code) - Photo angle enum
- `file_path` (TEXT) - Storage path
- `public_url` (TEXT) - Generated public URL
- `width` (INTEGER)
- `height` (INTEGER)
- `is_primary` (BOOLEAN) - Primary photo for listing
- `created_at` (TIMESTAMPTZ)

**Unique Constraint:** `(vehicle_id, angle)` - One photo per angle per vehicle

---

### **5. `leads`** - Lead Management ⭐
**Purpose:** Customer lead tracking and management

**Columns:**
- `id` (UUID) - Primary key
- `dealer_id` (UUID) - Foreign key to dealers
- `vehicle_id` (UUID) - Foreign key to vehicles (optional)
- `assigned_to` (UUID) - Foreign key to users (SM/DA assignment)

**Contact Information:**
- `name` (TEXT)
- `phone` (TEXT)
- `email` (TEXT)
- `address` (TEXT)
- `city` (TEXT)
- `state` (TEXT)
- `zip_code` (TEXT)
- `message` (TEXT)

**Financial Information:**
- `income` (TEXT)
- `net_monthly_income` (NUMERIC)
- `employer` (TEXT)
- `months_on_job` (INTEGER)
- `dl_state` (TEXT) - Driver's license state
- `down_payment` (INTEGER)
- `down_payment_ratio` (DECIMAL) - e.g., 0.20 for 20%
- `credit_score` (INTEGER)

**Attribution Tracking:**
- `source` (TEXT) - website, fb, sms, craigslist
- `agent` (TEXT) - mo, fred, dewey, etc
- `utm_source` (TEXT)
- `utm_medium` (TEXT)
- `utm_campaign` (TEXT)
- `gclid` (TEXT) - Google Click ID

**Lead Management:**
- `status` (lead_status) - Status enum (default: 'new')
- `notes` (TEXT) - Internal notes
- `consent` (BOOLEAN) - Default: false

**Follow-up Tracking:**
- `follow_up_date` (DATE)
- `follow_up_notes` (TEXT)
- `last_contact_date` (TIMESTAMPTZ)

**Deal Closing:**
- `close_date` (DATE)
- `close_amount` (NUMERIC)
- `commission_amount` (NUMERIC)

**Timestamps:**
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)
- `status_updated_at` (TIMESTAMPTZ)

---

### **6. `lead_status_history`** - Lead Status History
**Purpose:** Audit trail for lead status changes

**Columns:**
- `id` (UUID) - Primary key
- `lead_id` (UUID) - Foreign key to leads
- `from_status` (lead_status)
- `to_status` (lead_status) - Required
- `changed_by` (UUID) - Foreign key to users
- `notes` (TEXT)
- `created_at` (TIMESTAMPTZ)

---

### **7. `appointments`** - Appointments
**Purpose:** Appointment scheduling

**Columns:**
- `id` (UUID) - Primary key
- `dealer_id` (UUID) - Foreign key to dealers
- `lead_id` (UUID) - Foreign key to leads (optional)
- `vehicle_id` (UUID) - Foreign key to vehicles (optional)
- `assigned_to` (UUID) - Foreign key to users (sales rep)
- `type` (appointment_type) - Default: 'test_drive'
- `start_at` (TIMESTAMPTZ) - Required
- `end_at` (TIMESTAMPTZ)
- `status` (appointment_status) - Default: 'scheduled'
- `location` (TEXT)
- `notes` (TEXT)
- `reminder_sent` (BOOLEAN) - Default: false
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

---

### **8. `messages`** - Messages (Omni-Inbox)
**Purpose:** Unified message inbox

**Columns:**
- `id` (UUID) - Primary key
- `dealer_id` (UUID) - Foreign key to dealers
- `lead_id` (UUID) - Foreign key to leads (optional)
- `channel` (message_channel) - Required
- `direction` (message_direction) - Required
- `sender_user_id` (UUID) - Foreign key to users
- `recipient_user_id` (UUID) - Foreign key to users
- `to_address` (TEXT) - phone/email/fb id
- `from_address` (TEXT) - phone/email/fb id
- `subject` (TEXT)
- `body` (TEXT)
- `attachments` (JSONB) - Array of files/urls
- `external_id` (TEXT) - Provider message ID
- `status` (TEXT) - sent|delivered|failed|read
- `is_read` (BOOLEAN) - Default: false
- `created_at` (TIMESTAMPTZ)

---

### **9. `documents`** - Document Management
**Purpose:** Document storage and management

**Columns:**
- `id` (UUID) - Primary key
- `dealer_id` (UUID) - Foreign key to dealers
- `lead_id` (UUID) - Foreign key to leads (optional)
- `vehicle_id` (UUID) - Foreign key to vehicles (optional)
- `doc_type` (document_type) - Required
- `file_path` (TEXT) - Required
- `public_url` (TEXT) - If public-read asset
- `file_size` (INTEGER)
- `mime_type` (TEXT)
- `uploaded_by` (UUID) - Foreign key to users
- `uploaded_at` (TIMESTAMPTZ) - Default: NOW()

---

### **10. `activity_logs`** - Activity Logs
**Purpose:** Audit trail for system activities

**Columns:**
- `id` (UUID) - Primary key
- `actor_user_id` (UUID) - Foreign key to users
- `dealer_id` (UUID) - Foreign key to dealers
- `action_type` (TEXT) - Required (e.g., 'lead_update', 'vehicle_edit')
- `target_table` (TEXT) - Required ('leads', 'vehicles', 'users', etc.)
- `target_id` (UUID)
- `old_values` (JSONB)
- `new_values` (JSONB)
- `details` (JSONB)
- `occurred_at` (TIMESTAMPTZ) - Default: NOW()

---

### **11. `tracking_events`** - Tracking Events
**Purpose:** Analytics tracking for funnel analysis

**Columns:**
- `id` (UUID) - Primary key
- `dealer_id` (UUID) - Foreign key to dealers
- `event_type` (TEXT) - Required (phone_click, email_click, form_submit, page_view, vehicle_interest)
- `source` (TEXT) - Required
- `vehicle_id` (UUID) - Foreign key to vehicles (optional)
- `vehicle_name` (TEXT)
- `session_id` (TEXT) - Required
- `user_agent` (TEXT)
- `ip_address` (INET)
- `referer` (TEXT)
- `created_at` (TIMESTAMPTZ) - Default: NOW()

---

### **12. `user_performance`** - User Performance Metrics
**Purpose:** Sales performance tracking per user

**Columns:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `dealer_id` (UUID) - Foreign key to dealers
- `period_start` (DATE) - Required
- `period_end` (DATE) - Required

**Customer Interaction Metrics:**
- `customer_presentations` (INTEGER) - Default: 0
- `write_ups_per_customer` (DECIMAL) - Default: 0.00
- `trade_ins_added` (INTEGER) - Default: 0

**Approval Metrics:**
- `approved_finance_percent` (DECIMAL) - Default: 0.00
- `approved_lease_percent` (DECIMAL) - Default: 0.00
- `approved_cash_percent` (DECIMAL) - Default: 0.00
- `approved_write_ups` (INTEGER) - Default: 0
- `approval_abandon_rate` (DECIMAL) - Default: 0.00

**Sales Metrics:**
- `confirmed_customers` (INTEGER) - Default: 0
- `sales_count` (INTEGER) - Default: 0
- `first_pencil_rate` (DECIMAL) - Default: 0.00
- `close_rate` (DECIMAL) - Default: 0.00

**Time Metrics:**
- `time_in_app_per_customer` (INTEGER) - Minutes, Default: 0
- `approval_time` (INTEGER) - Minutes, Default: 0
- `deals_under_10_min_percent` (DECIMAL) - Default: 0.00

**Utilization Metrics:**
- `in_store_utilization` (DECIMAL) - Default: 0.00
- `lead_to_utilization` (DECIMAL) - Default: 0.00

**Timestamps:**
- `created_at` (TIMESTAMPTZ) - Default: NOW()
- `updated_at` (TIMESTAMPTZ) - Default: NOW()

---

### **13. `rdr_tracking`** - Retail Delivery Report Tracking
**Purpose:** RDR (Retail Delivery Report) system tracking

**Columns:**
- `id` (UUID) - Primary key
- `dealer_id` (UUID) - Foreign key to dealers
- `user_id` (UUID) - Foreign key to users (optional)
- `lead_id` (UUID) - Foreign key to leads (optional)
- `vehicle_id` (UUID) - Foreign key to vehicles (optional)

**RDR Classification:**
- `rdr_type` (TEXT) - Required (PURCHASE-INDIVIDUAL, LEASE-INDIVIDUAL, BUSINESS, RENTAL)
- `saaps_rdr` (BOOLEAN) - Sales as a Service Platform RDR, Default: false
- `slaaps_rdr` (BOOLEAN) - Sales Lead as a Service Platform RDR, Default: false
- `slaaps_lead_rdr` (BOOLEAN) - SLaaPS Lead RDR, Default: false

**Status Tracking:**
- `lead_submitted` (BOOLEAN) - Default: false
- `customer_confirmed` (BOOLEAN) - Default: false
- `customer_in_mst` (BOOLEAN) - Management System Time, Default: false
- `time_in_mst` (INTEGER) - Minutes

**Confirmation Details:**
- `confirmation_date` (TIMESTAMPTZ)
- `confirmation_notes` (TEXT)

**Timestamps:**
- `created_at` (TIMESTAMPTZ) - Default: NOW()
- `updated_at` (TIMESTAMPTZ) - Default: NOW()

---

### **14. `communication_quality`** - Communication Quality Scoring
**Purpose:** Quality scoring for customer communications

**Columns:**
- `id` (UUID) - Primary key
- `dealer_id` (UUID) - Foreign key to dealers
- `user_id` (UUID) - Foreign key to users (optional)
- `lead_id` (UUID) - Foreign key to leads (optional)
- `message_id` (UUID) - Foreign key to messages (optional)

**Quality Scoring Criteria (All BOOLEAN, Default: false):**
- `personalized_subject_line`
- `professional_introduction`
- `addressed_by_name`
- `showed_appreciation`
- `acknowledged_steps`
- `addressed_vehicle_availability`
- `included_pricing`
- `answered_question`
- `addressed_trade_inquiry`
- `provided_value_proposition`

**Scoring:**
- `total_score` (INTEGER) - Default: 0
- `max_score` (INTEGER) - Default: 100
- `quality_percentage` (DECIMAL) - Default: 0.00

**Response Time:**
- `response_time_minutes` (INTEGER)

**AI Analysis:**
- `ai_feedback` (TEXT)
- `improvement_suggestions` (TEXT)

**Timestamps:**
- `created_at` (TIMESTAMPTZ) - Default: NOW()

---

### **15. `performance_trends`** - Performance Trends & Benchmarking
**Purpose:** Trend analysis and benchmarking

**Columns:**
- `id` (UUID) - Primary key
- `dealer_id` (UUID) - Foreign key to dealers
- `user_id` (UUID) - Foreign key to users (optional)

**Time Period:**
- `period_type` (TEXT) - Required (monthly, quarterly, yearly)
- `period_start` (DATE) - Required
- `period_end` (DATE) - Required

**Trend Metrics:**
- `metric_name` (TEXT) - Required (close_rate, utilization, first_pencil_rate, etc.)
- `metric_value` (DECIMAL) - Required
- `previous_period_value` (DECIMAL)
- `change_percentage` (DECIMAL)

**Benchmarking:**
- `dealer_average` (DECIMAL)
- `region_average` (DECIMAL)
- `national_average` (DECIMAL)

**Timestamps:**
- `created_at` (TIMESTAMPTZ) - Default: NOW()

---

## 🔐 **Row Level Security (RLS)**

All tables have RLS enabled with role-based policies:
- **Public read** for vehicles, vehicle_photos, dealers
- **Dealer-scoped** access for leads, appointments, messages, documents
- **Role-based** access control (super_admin > dealer_admin > sales_manager > sales_rep)

---

## 📊 **Indexes**

Performance indexes created on:
- Foreign keys (dealer_id, vehicle_id, lead_id, etc.)
- Status fields
- Timestamps (created_at, updated_at)
- Search fields (year, make, model, source, agent, etc.)

---

## 🎯 **Key Tables for Your Use Case**

### **Primary Tables:**
1. **`leads`** - All your customer leads ⭐ (Main table for exports)
2. **`vehicles`** - Your vehicle inventory
3. **`vehicle_photos`** - Vehicle images
4. **`lead_status_history`** - Lead change history
5. **`appointments`** - Scheduled appointments
6. **`messages`** - Customer communications
7. **`documents`** - Uploaded documents

### **Analytics & Performance Tables:**
8. **`tracking_events`** - Analytics tracking (funnel analysis)
9. **`user_performance`** - Sales performance metrics
10. **`rdr_tracking`** - Retail Delivery Report tracking
11. **`communication_quality`** - Communication quality scoring
12. **`performance_trends`** - Performance trends and benchmarking

---

## 📝 **How to Check Your Actual Database**

### Option 1: Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your project: **"Unlimited Auto"**
3. Click **"Table Editor"** in left sidebar
4. Click on any table to view its structure and data

### Option 2: SQL Editor
1. In Supabase Dashboard → **"SQL Editor"**
2. Run this query to see all tables:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Option 3: API Endpoint
- Visit: `http://localhost:3000/api/db/schema`
- Returns JSON with all tables and their structure

---

## 🔄 **Export Leads**

To export your leads to CSV:
- **API**: `http://localhost:3000/api/leads/export?format=csv`
- **Dashboard**: Table Editor → leads table → "..." menu → "Export as CSV"

---

This summary is based on your `working-dealership-schema.sql` file. Your actual database may have additional columns or tables that were added later.

