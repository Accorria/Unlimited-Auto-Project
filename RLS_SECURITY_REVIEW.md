# 🔐 RLS Security Review - Unlimited Auto

**Date:** January 6, 2025  
**Status:** ⚠️ **9 Errors, 6 Warnings** - RLS Policies Exist But Are Disabled

---

## 📊 **Current Security Status**

### **Critical Issues Found:**

1. **`public.leads`** - "Policy Exists RLS Disabled"
   - ✅ Policies exist but RLS is **NOT enabled**
   - ⚠️ Service role policies may be missing

2. **`public.dealers`** - "RLS Disabled in Public"
   - ✅ Policies exist but RLS is **NOT enabled**

3. **Other Affected Tables:**
   - `public.users` - Policy Exists RLS Disabled
   - `public.lead_status_history` - Policy Exists RLS Disabled
   - `public.vehicles` - RLS Disabled in Public
   - `public.vehicle_photos` - RLS Disabled in Public
   - `public.activity_logs` - Policy Exists RLS Disabled
   - `public.documents` - Policy Exists RLS Disabled
   - `public.messages` - Policy Exists RLS Disabled

---

## 🔍 **What Policies Currently Exist**

### **1. Leads Table Policies** (`working-dealership-schema.sql`)

#### **User-Based Policies (Require `auth.uid()`):**
```sql
-- Read access for authenticated users
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

-- Write access for authenticated users
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
```

**Problem:** These policies require `auth.uid()` which is **NULL** for service role!

#### **Service Role Policy (In `fix-leads-permissions.sql`):**
```sql
CREATE POLICY IF NOT EXISTS "Service role can access all leads" ON public.leads
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);
```

**Status:** This policy exists in the fix script but may not be applied in production.

---

### **2. Dealers Table Policies**

```sql
-- Public read access
CREATE POLICY "public read dealers" ON public.dealers
FOR SELECT USING (true);

-- Admin write access
CREATE POLICY "admin manage dealers" ON public.dealers
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.auth_user_id = auth.uid() 
    AND users.role = 'super_admin'
  )
);
```

**Problem:** No service role policy for dealers table!

---

## ⚠️ **The Core Problem**

### **Why Lead Creation Currently Works:**

1. **RLS is DISABLED** on `public.leads`
   - All policies are ignored
   - Service role can insert without any policy checks

2. **Service Role Bypasses RLS**
   - `SUPABASE_SERVICE_ROLE` has `BYPASSRLS` privilege
   - Even if RLS was enabled, service role would bypass it

3. **Current Code Pattern:**
   ```typescript
   const supabase = createServerClient() // Uses service role
   // This bypasses RLS regardless of whether it's enabled
   ```

### **Why This Is a Security Risk:**

1. **Policies Exist But Aren't Enforced**
   - If RLS is enabled later, user-based policies will block service role
   - Service role policies may not exist in production

2. **No Row-Level Protection**
   - Anyone with service role key can access ALL leads
   - No dealer scoping for service role operations

3. **Inconsistent State**
   - Schema says RLS should be enabled
   - Production has RLS disabled
   - Policies exist but do nothing

---

## 🎯 **What Needs to Be Fixed**

### **Option 1: Enable RLS with Service Role Policies (Recommended)**

#### **Step 1: Add Service Role Policies to All Tables**

```sql
-- Leads table
CREATE POLICY IF NOT EXISTS "Service role can access all leads" ON public.leads
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Dealers table  
CREATE POLICY IF NOT EXISTS "Service role can access all dealers" ON public.dealers
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Users table
CREATE POLICY IF NOT EXISTS "Service role can access all users" ON public.users
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Vehicles table
CREATE POLICY IF NOT EXISTS "Service role can access all vehicles" ON public.vehicles
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Vehicle photos table
CREATE POLICY IF NOT EXISTS "Service role can access all vehicle photos" ON public.vehicle_photos
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Lead status history
CREATE POLICY IF NOT EXISTS "Service role can access all lead status history" ON public.lead_status_history
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Appointments
CREATE POLICY IF NOT EXISTS "Service role can access all appointments" ON public.appointments
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Messages
CREATE POLICY IF NOT EXISTS "Service role can access all messages" ON public.messages
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Documents
CREATE POLICY IF NOT EXISTS "Service role can access all documents" ON public.documents
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Activity logs
CREATE POLICY IF NOT EXISTS "Service role can access all activity logs" ON public.activity_logs
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);
```

#### **Step 2: Enable RLS on All Tables**

```sql
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
```

#### **Step 3: Verify Service Role Has Permissions**

```sql
-- Grant permissions (if not already granted)
GRANT ALL ON public.leads TO service_role;
GRANT ALL ON public.dealers TO service_role;
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.vehicles TO service_role;
GRANT ALL ON public.vehicle_photos TO service_role;
GRANT ALL ON public.lead_status_history TO service_role;
GRANT ALL ON public.appointments TO service_role;
GRANT ALL ON public.messages TO service_role;
GRANT ALL ON public.documents TO service_role;
GRANT ALL ON public.activity_logs TO service_role;
```

---

### **Option 2: Keep RLS Disabled (Not Recommended)**

**Pros:**
- ✅ No changes needed
- ✅ Current code continues to work

**Cons:**
- ❌ Security vulnerabilities
- ❌ Supabase Security Advisor warnings
- ❌ Policies exist but do nothing
- ❌ No row-level protection

---

## 🧪 **Testing After Enabling RLS**

### **Test Lead Creation:**

```typescript
// This should still work after enabling RLS
const supabase = createServerClient() // Service role
const { data: lead, error } = await supabase
  .from('leads')
  .insert({ dealer_id: dealer.id, ... })
  .select()
  .single()
```

### **Test User Access:**

```typescript
// This should work for authenticated users
const supabase = createClient() // Regular client with auth
const { data: leads, error } = await supabase
  .from('leads')
  .select()
  .eq('dealer_id', userDealerId)
```

---

## 📋 **Action Items**

- [ ] **Review all service role policies** - Ensure they exist for all tables
- [ ] **Enable RLS on all tables** - Start with `public.leads` and `public.dealers`
- [ ] **Test lead creation** - Verify service role can still insert leads
- [ ] **Test user access** - Verify authenticated users can access their dealer's leads
- [ ] **Run Security Advisor again** - Verify all errors are resolved
- [ ] **Document the change** - Update deployment notes

---

## 🔗 **Related Files**

- `working-dealership-schema.sql` - Main schema with RLS policies
- `fix-leads-permissions.sql` - Service role policy for leads
- `check-rls-status.sql` - Script to check RLS status
- `check-policies.sql` - Script to check existing policies

---

## 💡 **Recommendation**

**Enable RLS with service role policies.** This provides:
- ✅ Security compliance
- ✅ Row-level protection
- ✅ Consistent state (policies match reality)
- ✅ No code changes needed (service role still works)
- ✅ Future-proof (if you add user-based access later)

**Next Steps:**
1. Create a migration script with all service role policies
2. Test in a development environment first
3. Apply to production after verification
4. Monitor for any access issues
