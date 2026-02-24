# 🗑️ Manual Storage Cleanup Guide

## After Running SQL Cleanup

After you run the SQL cleanup script (`cleanup-sold-vehicles-keep-main-photo.sql`), the photo **records** are deleted from the database, but the actual **files** still exist in Supabase Storage. You need to delete them manually.

---

## 📋 Step-by-Step: Delete Files from Supabase Storage

### **Method 1: Via Supabase Dashboard (Easiest)**

1. **Go to Supabase Dashboard**
   - Open: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Storage**
   - Click **"Storage"** in the left sidebar
   - Click on **"vehicle-images"** bucket

3. **Find Files to Delete**
   - You'll see all uploaded photo files
   - Files are named like: `1234567890_filename.jpg`
   - Or organized in folders by vehicle ID

4. **Delete Files**
   - **Option A: Select Individual Files**
     - Check the box next to each file you want to delete
     - Click **"Delete"** button at the top
     - Confirm deletion
   
   - **Option B: Search for Specific Files**
     - Use the search bar to find files by name
     - Select multiple files using checkboxes
     - Click **"Delete"**

5. **Verify Deletion**
   - Files should disappear from the list
   - Check storage usage: Dashboard → Usage
   - Should see storage decrease

---

### **Method 2: Get File List from Database (More Precise)**

If you want to know exactly which files to delete:

1. **Run This Query in SQL Editor:**
   ```sql
   -- Get file paths of deleted photos (if you saved them before deletion)
   -- Or get remaining photos to see what should stay
   SELECT 
       vp.file_path,
       vp.public_url,
       v.year,
       v.make,
       v.model,
       v.status
   FROM vehicle_photos vp
   JOIN vehicles v ON v.id = vp.vehicle_id
   WHERE v.status IN ('sold', 'inactive', 'removed')
   ORDER BY v.status, v.year, v.make, v.model;
   ```

2. **This Shows:**
   - Which photos are still in database (should be 1 per sold vehicle)
   - File paths you can search for in Storage

3. **Then in Storage Dashboard:**
   - Search for the file paths shown in results
   - Delete files that are NOT in the query results

---

### **Method 3: Delete All Files from Sold Vehicles (Bulk)**

If you want to delete ALL files from sold vehicles (except the main one):

1. **First, Get List of Files to Keep:**
   ```sql
   -- Get the main photo file paths for sold vehicles (these should KEEP)
   SELECT DISTINCT ON (vehicle_id) 
       vp.file_path,
       vp.public_url,
       v.year,
       v.make,
       v.model
   FROM vehicle_photos vp
   JOIN vehicles v ON v.id = vp.vehicle_id
   WHERE v.status IN ('sold', 'inactive', 'removed')
   ORDER BY vehicle_id,
       CASE WHEN vp.is_primary = true THEN 1 ELSE 2 END,
       CASE WHEN vp.angle = 'FDS' THEN 1 ELSE 2 END,
       vp.created_at ASC;
   ```

2. **Save This List** - These are files to KEEP

3. **Then Get All Files from Sold Vehicles:**
   ```sql
   -- Get ALL photo file paths for sold vehicles
   SELECT 
       vp.file_path,
       vp.public_url,
       v.year,
       v.make,
       v.model
   FROM vehicle_photos vp
   JOIN vehicles v ON v.id = vp.vehicle_id
   WHERE v.status IN ('sold', 'inactive', 'removed')
   ORDER BY v.year, v.make, v.model;
   ```

4. **In Storage Dashboard:**
   - Compare the two lists
   - Delete files that are NOT in the "keep" list

---

## 🔍 Finding Files in Storage

### **File Naming Pattern:**
- Files are usually named: `{timestamp}_{originalFilename}`
- Example: `1704067200000_IMG_1234.jpg`
- Or: `1704067200000_photo.jpg`

### **Search Tips:**
1. **Search by Timestamp:**
   - If you know when photos were uploaded, search by timestamp
   - Example: Search "1704067200" to find files from that time

2. **Search by Vehicle:**
   - If files are in folders: `vehicle-images/{vehicleId}/filename.jpg`
   - Navigate to the vehicle folder
   - Delete all files except the main one

3. **Sort by Date:**
   - Click column headers to sort
   - Find older files from sold vehicles

---

## ⚠️ Important Notes

### **Before Deleting:**
- ✅ Make sure SQL cleanup ran successfully
- ✅ Verify which photos should remain (1 per sold vehicle)
- ✅ Double-check file paths match database records

### **After Deleting:**
- ✅ Check storage usage decreased
- ✅ Verify sold vehicles still show main photo on website
- ✅ Test a few sold vehicle pages to ensure photos display

### **Safety Tips:**
- **Don't delete files** from active/available vehicles
- **Keep the main photo** for each sold vehicle
- **Backup first** if unsure (download files before deleting)

---

## 📊 Verify Storage Cleanup

After manual deletion, verify:

1. **Check Storage Usage:**
   - Dashboard → Usage
   - Should see storage decrease
   - Target: Below 1GB

2. **Check File Count:**
   ```sql
   -- Count remaining photos
   SELECT 
       COUNT(*) as total_photos,
       COUNT(*) * 1.5 as estimated_mb
   FROM vehicle_photos;
   ```

3. **Verify Sold Vehicles Still Have Photos:**
   ```sql
   -- Should show 1 photo per sold vehicle
   SELECT 
       v.id,
       v.year,
       v.make,
       v.model,
       COUNT(vp.id) as photo_count
   FROM vehicles v
   LEFT JOIN vehicle_photos vp ON vp.vehicle_id = v.id
   WHERE v.status IN ('sold', 'inactive', 'removed')
   GROUP BY v.id, v.year, v.make, v.model
   HAVING COUNT(vp.id) > 1;  -- Should return 0 rows if cleanup worked
   ```

---

## 🚀 Quick Checklist

- [ ] SQL cleanup script ran successfully
- [ ] Identified files to delete (all except main photo per sold vehicle)
- [ ] Opened Supabase Storage → vehicle-images bucket
- [ ] Selected files to delete
- [ ] Clicked Delete and confirmed
- [ ] Verified storage usage decreased
- [ ] Checked sold vehicles still show main photo on website
- [ ] Storage is now below 1GB limit

---

## 💡 Pro Tip

If you have many files to delete:
1. Use the **bulk selection** feature in Storage dashboard
2. Sort by **date** or **name** to group files
3. Select multiple files at once using checkboxes
4. Delete in batches (e.g., 50 files at a time)

---

**Need Help?** If you're unsure which files to delete, run the SQL queries above first to get a list of files that should remain, then delete everything else from sold vehicles.
