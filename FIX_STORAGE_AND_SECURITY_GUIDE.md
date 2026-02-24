# 🔧 Fix Storage & Security Issues - Complete Guide

## 🚨 Current Issues

### **Issue 1: Storage Quota Exceeded**
- **Current:** 1.134 GB / 1.019 GB (111% - OVER LIMIT)
- **Status:** Grace period until Feb 6, 2026
- **Impact:** After grace period, requests will return 402 status code

### **Issue 2: RLS Security Issues**
- **Errors:** 9 errors (Policy Exists RLS Disabled)
- **Warnings:** 6 warnings (RLS Disabled in Public)
- **Impact:** Security vulnerabilities, Supabase warnings

---

## ✅ Solution Overview

### **Part 1: Fix Security Issues** (Run First)
1. Add service role policies to all tables
2. Enable Row Level Security (RLS) on all tables
3. Verify Security Advisor shows 0 errors

### **Part 2: Fix Storage Issues** (Run After Security)
1. Identify unused/orphaned photos
2. Delete photos from sold/inactive vehicles
3. Limit photos to 20 per vehicle
4. Monitor storage usage

---

## 📋 Step-by-Step Instructions

### **STEP 1: Fix RLS Security Issues**

1. **Open Supabase SQL Editor**
   - Go to: Supabase Dashboard → SQL Editor
   - Create new query

2. **Run the Security Fix Script**
   - Copy contents from `fix-all-rls-security.sql`
   - OR run `fix-storage-and-security.sql` (Part 1)
   - Click "Run"

3. **Verify Security Fix**
   - Go to: Dashboard → Advisors → Security Advisor
   - Should show: **0 Errors, 0 Warnings**
   - If errors remain, check that all policies were created

---

### **STEP 2: Analyze Storage Usage**

1. **Run Storage Analysis Queries**
   - Open SQL Editor
   - Run queries from `cleanup-storage.sql` (Steps 1-5)
   - Review results:
     - How many photos total?
     - Which vehicles have >20 photos?
     - Which sold/inactive vehicles have photos?

2. **Calculate Storage Savings**
   - Each photo averages ~1.5MB
   - Need to free ~115MB to get below 1GB
   - That's ~77 photos to delete

---

### **STEP 3: Clean Up Storage**

**Option A: Delete Photos from Sold/Inactive Vehicles** (Recommended)

1. **Review sold vehicles with photos:**
   ```sql
   SELECT v.id, v.year, v.make, v.model, v.status, COUNT(vp.id) as photo_count
   FROM vehicles v
   LEFT JOIN vehicle_photos vp ON vp.vehicle_id = v.id
   WHERE v.status IN ('sold', 'inactive', 'removed')
   GROUP BY v.id, v.year, v.make, v.model, v.status
   HAVING COUNT(vp.id) > 0;
   ```

2. **Delete photos from these vehicles:**
   ```sql
   DELETE FROM vehicle_photos
   WHERE vehicle_id IN (
       SELECT id FROM vehicles 
       WHERE status IN ('sold', 'inactive', 'removed')
   );
   ```

3. **Delete files from storage bucket:**
   - Go to: Supabase Dashboard → Storage → vehicle-images
   - Find files matching deleted photo paths
   - Select and delete them

**Option B: Limit Photos to 20 Per Vehicle**

1. **Find vehicles with >20 photos:**
   ```sql
   SELECT vehicle_id, COUNT(*) as photo_count
   FROM vehicle_photos
   GROUP BY vehicle_id
   HAVING COUNT(*) > 20;
   ```

2. **Delete excess photos (keeps newest 20):**
   ```sql
   DELETE FROM vehicle_photos
   WHERE id IN (
       SELECT vp.id
       FROM vehicle_photos vp
       JOIN (
           SELECT vehicle_id, COUNT(*) as photo_count
           FROM vehicle_photos
           GROUP BY vehicle_id
           HAVING COUNT(*) > 20
       ) excess ON excess.vehicle_id = vp.vehicle_id
       WHERE vp.id NOT IN (
           SELECT id FROM vehicle_photos
           WHERE vehicle_id = excess.vehicle_id
           ORDER BY created_at DESC
           LIMIT 20
       )
   );
   ```

**Option C: Delete Duplicate Photos**

1. **Find duplicates:**
   ```sql
   SELECT file_path, COUNT(*) as duplicate_count
   FROM vehicle_photos
   GROUP BY file_path
   HAVING COUNT(*) > 1;
   ```

2. **Delete duplicates (keeps oldest):**
   ```sql
   DELETE FROM vehicle_photos
   WHERE id IN (
       SELECT id FROM (
           SELECT id, 
                  ROW_NUMBER() OVER (PARTITION BY file_path ORDER BY created_at ASC) as rn
           FROM vehicle_photos
       ) ranked
       WHERE rn > 1
   );
   ```

---

### **STEP 4: Verify Storage Usage**

1. **Check photo count:**
   ```sql
   SELECT 
       COUNT(*) as total_photos,
       COUNT(*) * 1.5 as estimated_mb,
       COUNT(DISTINCT vehicle_id) as vehicles_with_photos
   FROM vehicle_photos;
   ```

2. **Check Supabase Dashboard:**
   - Go to: Dashboard → Usage
   - Verify storage is below 1GB
   - Should show: **< 1.019 GB / 1.019 GB**

---

## 🛡️ Prevention: Storage Management Rules

The storage management rules we implemented will prevent future issues:

### **Automatic Limits:**
- ✅ Max 5MB per photo
- ✅ Max 20 photos per vehicle
- ✅ Storage quota checking before upload
- ✅ Automatic cleanup on vehicle deletion

### **Monitor Usage:**
- Check Supabase Dashboard → Usage monthly
- Review storage before major uploads
- Delete sold vehicle photos promptly

---

## ⚠️ Important Notes

### **Before Running Cleanup:**
1. **Backup your database** (Supabase → Database → Backups)
2. **Review all queries** before running DELETE statements
3. **Test on a few records first** before bulk deletion

### **After Deleting Photos:**
1. **Photos deleted from database** need manual deletion from storage bucket
2. **Go to:** Storage → vehicle-images → Select files → Delete
3. **Or use Supabase CLI** to delete files programmatically

### **Storage File Cleanup:**
After deleting photo records from database, you need to delete the actual files:

1. **Via Dashboard:**
   - Storage → vehicle-images
   - Filter/search for deleted photo filenames
   - Select and delete

2. **Via SQL (if you have file paths):**
   ```sql
   -- Get file paths to delete
   SELECT file_path FROM vehicle_photos 
   WHERE vehicle_id IN (SELECT id FROM vehicles WHERE status = 'sold');
   ```

3. **Then delete via Supabase Storage API or Dashboard**

---

## 📊 Expected Results

### **After Security Fix:**
- ✅ Security Advisor: **0 Errors, 0 Warnings**
- ✅ All tables have RLS enabled
- ✅ Service role policies exist
- ✅ User-based policies still work

### **After Storage Cleanup:**
- ✅ Storage usage: **< 1GB**
- ✅ No grace period warning
- ✅ All photos properly managed
- ✅ Future uploads prevented from exceeding limits

---

## 🔍 Troubleshooting

### **Security Issues Persist:**
- Check that all policies were created successfully
- Verify RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'`
- Check service role has permissions: `SELECT * FROM pg_policies WHERE policyname LIKE '%Service role%'`

### **Storage Still Over Limit:**
- Delete more photos (sold vehicles, duplicates)
- Check for large files in storage bucket
- Review other storage buckets (not just vehicle-images)
- Consider upgrading plan if you need more storage

### **Photos Not Deleting from Storage:**
- Files need manual deletion from Supabase Dashboard
- Check file paths match between database and storage
- Use Storage API to delete files programmatically

---

## 📝 Quick Reference

### **Files Created:**
- `fix-all-rls-security.sql` - Security fix only
- `cleanup-storage.sql` - Storage analysis and cleanup
- `fix-storage-and-security.sql` - Combined fix (both issues)
- `STORAGE_MANAGEMENT_RULES.md` - Prevention rules

### **Key Commands:**
```sql
-- Check RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check storage estimate
SELECT COUNT(*) * 1.5 as estimated_mb FROM vehicle_photos;

-- Find sold vehicles with photos
SELECT v.id, COUNT(vp.id) as photos 
FROM vehicles v 
LEFT JOIN vehicle_photos vp ON vp.vehicle_id = v.id 
WHERE v.status = 'sold' 
GROUP BY v.id;
```

---

**Last Updated:** January 2025  
**Status:** Ready to execute
