# 📊 Supabase Leads Management Guide

## How to Access Your Supabase Dashboard

### 1. **Access Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Log in with your Supabase account
   - Select your project (should be "Unlimited Auto" or similar)

### 2. **View Leads in Supabase**
   - In the left sidebar, click **"Table Editor"**
   - Click on the **`leads`** table
   - You'll see all your leads with columns like:
     - `id`, `name`, `phone`, `email`
     - `status`, `source`, `agent`
     - `created_at`, `updated_at`
     - And all other lead information

### 3. **Filter Leads**
   - Click the **filter icon** (funnel) at the top
   - Add filters like:
     - Status: `new`, `set`, `show`, `close`
     - Source: `website`, `facebook`, etc.
     - Date range: `created_at`

### 4. **Export Leads to CSV**

#### **Option A: Using Supabase Dashboard (Simple)**
   1. Go to **Table Editor** → **`leads`** table
   2. Apply any filters you want
   3. Click the **"..." menu** at the top right
   4. Select **"Export as CSV"**
   5. The CSV file will download

#### **Option B: Using API Endpoint (Recommended)**
   1. Open your browser and go to:
      ```
      http://localhost:3000/api/leads/export?format=csv
      ```
   2. Or filter by status:
      ```
      http://localhost:3000/api/leads/export?format=csv&status=new
      ```
   3. The CSV file will automatically download
   4. **For production**, use:
      ```
      https://yourdomain.com/api/leads/export?format=csv
      ```

### 5. **Delete Leads from Supabase**

#### **Option A: Using Supabase Dashboard**
   1. Go to **Table Editor** → **`leads`** table
   2. Select the leads you want to delete (checkboxes on the left)
   3. Click **"Delete"** button
   4. Confirm deletion

#### **Option B: Archive Instead of Delete (Recommended)**
   Instead of deleting, you can **archive** leads to keep them for records:
   
   1. **Create an archived_leads table** (run this in SQL Editor):
   ```sql
   CREATE TABLE IF NOT EXISTS public.archived_leads (
     LIKE public.leads INCLUDING ALL
   );
   
   -- Copy leads to archive
   INSERT INTO public.archived_leads
   SELECT * FROM public.leads
   WHERE status = 'close' AND close_date < NOW() - INTERVAL '90 days';
   
   -- Delete archived leads from main table
   DELETE FROM public.leads
   WHERE id IN (SELECT id FROM public.archived_leads);
   ```

### 6. **View Archived Leads**
   - Go to **Table Editor** → **`archived_leads`** table
   - All your archived leads will be there

## 📋 CSV Export Features

The CSV export includes all lead information:
- Contact details (name, phone, email, address)
- Financial information (income, employer, down payment)
- Lead tracking (source, agent, UTM parameters)
- Status and notes
- Follow-up information
- Close information (if applicable)

## 🔄 Best Practices

### **Keep Records, Don't Delete**
Instead of deleting leads, consider:
1. **Archiving** - Move to `archived_leads` table
2. **Status Change** - Mark as "archived" status
3. **Export First** - Always export to CSV before deleting

### **Regular Exports**
- Export leads monthly or quarterly
- Keep CSV files backed up
- Import into your CRM system

### **Archive Old Leads**
- Archive leads older than 90 days
- Keep closed deals for at least 1 year
- Archive inactive leads after 6 months

## 🛠️ Advanced: Using SQL Editor

### **Export Specific Leads**
```sql
-- Export leads from last 30 days
COPY (
  SELECT * FROM leads
  WHERE created_at > NOW() - INTERVAL '30 days'
) TO '/tmp/leads_export.csv' WITH CSV HEADER;
```

### **Archive Leads by Status**
```sql
-- Move closed leads to archive
INSERT INTO archived_leads
SELECT * FROM leads
WHERE status = 'close' AND close_date < NOW() - INTERVAL '90 days';

-- Delete archived leads
DELETE FROM leads
WHERE id IN (SELECT id FROM archived_leads);
```

## 📱 Quick Access URLs

### **Local Development**
- Export CSV: `http://localhost:3000/api/leads/export?format=csv`
- Export JSON: `http://localhost:3000/api/leads/export?format=json`
- Filter by status: `http://localhost:3000/api/leads/export?format=csv&status=close`

### **Production**
- Replace `localhost:3000` with your domain
- Example: `https://yourdomain.com/api/leads/export?format=csv`

## ⚠️ Important Notes

1. **Always backup before deleting** - Export to CSV first
2. **Use archiving instead of deleting** - Keep records for compliance
3. **Check your CRM** - Make sure leads are synced before deleting
4. **Test exports** - Verify CSV format before bulk operations

## 🔐 Security

- API endpoints require authentication
- Only authorized users can export/delete leads
- Row Level Security (RLS) protects your data

