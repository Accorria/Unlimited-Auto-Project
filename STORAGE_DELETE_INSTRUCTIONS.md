# 🗑️ Storage Cleanup Instructions

## ✅ Files to Keep (19 files)

You have the list of 19 files to keep. Here's how to delete the rest:

---

## 📋 Step-by-Step Instructions

### **Step 1: Open Storage Dashboard**
1. Go to: Supabase Dashboard → Storage → vehicle-images
2. You'll see all uploaded files

### **Step 2: Identify Files to Delete**

**Files to KEEP (19 files):**
- `1762868419648_IMG_6271.jpeg`
- `1761763186048_IMG_5313.jpeg`
- `1761923830159_IMG_5596.jpeg`
- `1761763645414_IMG_5164.jpeg`
- `1761835490863_IMG_4736.jpeg`
- `1765337850637_IMG_5485.jpeg`
- `1762543175323_IMG_6178.jpeg`
- `1765304234111_IMG_7591.jpeg`
- `1765384665745_IMG_7636.jpeg`
- `1766847271154_IMG_0326.jpeg`
- `1765391907939_IMG_7747.jpeg`
- `1761762388691_IMG_5146.jpeg`
- `1765337615711_IMG_5499.jpeg`
- `1761832448476_IMG_4312.jpeg`
- `1761920727541_IMG_5563.jpeg`
- `1762543062143_IMG_5982%202.jpeg` (note: has %20 for space)
- `1761771605467_IMG_4087.jpeg`
- `1762104702507_IMG_5695.jpeg`
- `1761762700438_IMG_5233%202.jpeg` (note: has %20 for space)

**Files to DELETE:**
- All other files with timestamps starting with `1761...`, `1762...`, `1765...`, `1766...`
- Any files that don't match the list above

### **Step 3: Delete Files**

**Option A: Select Individual Files**
1. Scroll through the file list
2. Check the box next to each file you want to delete
3. Click "Delete" button at the top
4. Confirm deletion

**Option B: Bulk Delete**
1. Look for files with similar timestamps (January 2025)
2. Select multiple files at once using checkboxes
3. Delete in batches (20-50 files at a time)
4. Repeat until all excess files are deleted

### **Step 4: Verify**

1. **Check Storage Usage:**
   - Dashboard → Usage
   - Storage should decrease by ~300MB
   - Should be below 1GB limit

2. **Test Sold Vehicle Pages:**
   - Visit a few sold vehicle detail pages
   - Main photos should still display correctly

3. **Count Remaining Files:**
   - In Storage → vehicle-images
   - Should see fewer files overall

---

## 🎯 Quick Reference

### **File Naming Pattern:**
- Files are named: `{timestamp}_{originalFilename}`
- Example: `1762868419648_IMG_6271.jpeg`
- Timestamp = milliseconds since epoch
- Your files are from January 2025 (1761... to 1766...)

### **What to Look For:**
- Files with timestamps: `1761...`, `1762...`, `1765...`, `1766...`
- These are from the sold vehicles
- Keep only the 19 files listed above
- Delete all others

---

## ⚠️ Important Notes

- ✅ **Keep:** The 19 files listed above
- ❌ **Delete:** All other files from January 2025 uploads
- ⚠️ **Don't delete:** Files from active/available vehicles
- ⚠️ **Don't delete:** Files from other time periods

---

## 📊 Expected Results

**Before:**
- ~220 files in Storage
- 1.134 GB usage (over limit)

**After:**
- 19 files kept (1 per sold vehicle)
- ~300MB freed
- Should be below 1GB limit

---

## ✅ Completion Checklist

- [ ] Opened Storage → vehicle-images
- [ ] Identified files to keep (19 files)
- [ ] Selected files to delete
- [ ] Deleted excess files
- [ ] Verified storage usage decreased
- [ ] Tested sold vehicle pages (photos still work)
- [ ] Storage is now below 1GB

---

**Status:** Ready to delete files from Storage 🗑️
