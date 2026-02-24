# 📦 Storage Management Rules & Limits

## Overview

This document outlines the storage management rules implemented to prevent exceeding Supabase storage quotas for vehicle photos.

---

## 🎯 Storage Limits

### **File Size Limits**
- **Maximum file size per photo:** 5MB
- **Automatic compression:** Photos are compressed to ~2MB during upload
- **Supported formats:** JPG, PNG, WebP, HEIC/HEIF

### **Photo Count Limits**
- **Maximum photos per vehicle:** 20 photos
- **Warning threshold:** System warns when approaching limit (18+ photos)

### **Storage Quota**
- **Total storage limit:** 1GB (configurable in `src/app/api/upload/route.ts`)
- **Warning threshold:** System warns at 90% capacity
- **Quota exceeded:** Uploads blocked when quota is reached

---

## 🔒 Implementation Details

### **1. Upload Route (`/api/upload`)**

**File Size Validation:**
- Checks file size BEFORE processing
- Rejects files over 5MB with clear error message
- Validates file type (JPG, PNG, WebP, HEIC only)

**Photo Count Validation:**
- Checks existing photo count for vehicle (if `vehicleId` provided)
- Blocks upload if vehicle already has 20 photos
- Returns clear error message with remaining slots

**Storage Quota Checking:**
- Estimates storage usage based on file count
- Blocks uploads when quota exceeded (507 Insufficient Storage)
- Warns when approaching 90% capacity

**Code Location:** `src/app/api/upload/route.ts`

```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB per file
const MAX_PHOTOS_PER_VEHICLE = 20
const MAX_STORAGE_QUOTA_MB = 1000 // 1GB
const STORAGE_WARNING_THRESHOLD = 0.9 // 90%
```

### **2. Photo Upload Component**

**Client-Side Validation:**
- Checks photo count limit before upload
- Validates file sizes before upload
- Shows progress and warnings
- Displays current photo count (X / 20)

**User Feedback:**
- Clear error messages for oversized files
- Warning when approaching photo limit
- Photo counter display
- Instructions with limits

**Code Location:** `src/components/PhotoUpload.tsx`

### **3. Vehicle Creation Route**

**Photo Limit Enforcement:**
- Limits photos to 20 per vehicle during creation
- Automatically truncates if more than 20 provided
- Logs warning if limit exceeded

**Code Location:** `src/app/api/vehicles/route.ts`

### **4. Vehicle Deletion Route**

**Storage Cleanup:**
- Deletes photos from Supabase Storage bucket
- Removes photo records from database
- Prevents orphaned files consuming storage

**Code Location:** `src/app/api/vehicles/[id]/route.ts`

---

## 🚨 Error Messages

### **File Too Large**
```
Error: File too large
Details: File size is X.XXMB. Maximum allowed size is 5MB per photo.
Hint: Please compress the image or use a smaller file.
```

### **Photo Limit Reached**
```
Error: Photo limit reached
Details: This vehicle already has X photos. Maximum allowed is 20 photos per vehicle.
Hint: Please delete some existing photos before adding new ones.
```

### **Storage Quota Exceeded**
```
Error: Storage quota exceeded
Details: Estimated storage usage is XXXMB. Maximum allowed is 1000MB.
Hint: Please delete unused photos or contact your administrator.
```

---

## 📊 Storage Usage Monitoring

### **Current Implementation**
- Estimates storage based on file count
- Assumes average file size of 1.5MB (compressed)
- Calculates: `estimatedUsageMB = fileCount * 1.5MB`

### **Future Enhancements** (Optional)
- Integrate Supabase Storage API for exact usage
- Add admin dashboard showing storage usage
- Set up alerts when approaching limits
- Implement automatic cleanup of orphaned files

---

## ⚙️ Configuration

### **Adjusting Limits**

To change storage limits, edit `src/app/api/upload/route.ts`:

```typescript
// File size limit (in bytes)
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Photos per vehicle
const MAX_PHOTOS_PER_VEHICLE = 20

// Total storage quota (in MB)
const MAX_STORAGE_QUOTA_MB = 1000 // 1GB

// Warning threshold (0.0 to 1.0)
const STORAGE_WARNING_THRESHOLD = 0.9 // 90%
```

### **Supabase Plan Limits**

**Free Tier:**
- 1GB storage
- 2GB bandwidth/month

**Pro Tier:**
- 100GB storage
- 250GB bandwidth/month

**Team Tier:**
- 200GB storage
- 500GB bandwidth/month

Adjust `MAX_STORAGE_QUOTA_MB` based on your Supabase plan.

---

## 🧹 Cleanup & Maintenance

### **Automatic Cleanup**
- Photos deleted from storage when vehicle is deleted
- Database records removed via CASCADE delete
- No orphaned files left in storage

### **Manual Cleanup** (If Needed)

1. **Find orphaned photos:**
   ```sql
   SELECT file_path 
   FROM storage.objects 
   WHERE bucket_id = 'vehicle-images'
   AND name NOT IN (
     SELECT file_path FROM vehicle_photos
   );
   ```

2. **Delete via Supabase Dashboard:**
   - Go to Storage → vehicle-images
   - Select unused files
   - Click Delete

3. **Or use Supabase CLI:**
   ```bash
   supabase storage rm vehicle-images --recursive --pattern "unused-files-*"
   ```

---

## ✅ Best Practices

1. **Compress photos before upload**
   - Use tools like TinyPNG or ImageOptim
   - Target file size: 1-2MB per photo

2. **Limit photos per vehicle**
   - 8-12 photos is usually sufficient
   - Focus on key angles: front, sides, interior, engine

3. **Regular cleanup**
   - Delete sold vehicles promptly
   - Remove duplicate or low-quality photos
   - Monitor storage usage monthly

4. **Monitor storage usage**
   - Check Supabase Dashboard → Storage regularly
   - Set up alerts if available
   - Plan upgrades before hitting limits

---

## 🔍 Troubleshooting

### **Issue: "Storage quota exceeded" but storage looks fine**
- The system estimates usage based on file count
- Check actual usage in Supabase Dashboard
- Adjust `MAX_STORAGE_QUOTA_MB` if needed

### **Issue: Photos not deleting from storage**
- Check file paths match between database and storage
- Verify service role key has DELETE permissions
- Check Supabase Storage logs for errors

### **Issue: Upload fails with "Photo limit reached"**
- Check existing photos for vehicle
- Delete unused photos first
- Verify limit is set correctly (should be 20)

---

## 📝 Summary

**Implemented Rules:**
- ✅ 5MB file size limit per photo
- ✅ 20 photos maximum per vehicle
- ✅ 1GB total storage quota (configurable)
- ✅ Storage cleanup on vehicle deletion
- ✅ Client-side validation and warnings
- ✅ Server-side validation and error handling

**Result:**
- Prevents storage quota overruns
- Clear user feedback on limits
- Automatic cleanup of deleted vehicles
- Configurable limits for different plans

---

**Last Updated:** January 2025
**Maintained By:** Unlimited Auto Development Team
