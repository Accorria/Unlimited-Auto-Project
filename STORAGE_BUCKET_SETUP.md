# 📦 Supabase Storage Bucket Setup

## Error: "Failed to upload to storage"

If you're seeing this error when uploading photos, it means the `vehicle-images` storage bucket doesn't exist or isn't configured properly.

## Quick Fix (2 minutes)

### Step 1: Create the Storage Bucket

1. Go to your **Supabase Dashboard**
2. Click **Storage** in the left sidebar
3. Click **New Bucket** button
4. Enter bucket name: **`vehicle-images`**
5. Set bucket to **Public** (so photos can be accessed on your website)
6. Click **Create bucket**

### Step 2: Verify Bucket Exists

- You should see `vehicle-images` in your buckets list
- Status should show as **Public**

## Detailed Setup Instructions

### Option A: Using Supabase Dashboard (Easiest)

1. **Navigate to Storage**
   - Open your Supabase project dashboard
   - Click **Storage** in the left menu

2. **Create New Bucket**
   - Click the **New Bucket** button
   - Name: `vehicle-images`
   - Visibility: **Public** ✅
   - File size limit: Leave default (50MB is fine)
   - Allowed MIME types: Leave empty (accepts all)

3. **Set Bucket Policies (Important!)**
   - Click on the `vehicle-images` bucket
   - Go to **Policies** tab
   - You should see default policies, but verify these exist:

**Policy 1: Allow Public Read Access**
```sql
-- Allow anyone to read files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'vehicle-images');
```

**Policy 2: Allow Authenticated Uploads**
```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vehicle-images');
```

4. **Test Upload**
   - Go back to your app
   - Try uploading a photo
   - Should work now! ✅

### Option B: Using SQL (Advanced)

If you prefer SQL, run this in **Supabase SQL Editor**:

```sql
-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-images', 'vehicle-images', true);

-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'vehicle-images');

-- Allow authenticated uploads
CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vehicle-images');
```

## Common Issues & Solutions

### Issue 1: "Bucket not found"
**Solution:** The bucket doesn't exist. Follow Step 1 above.

### Issue 2: "Permission denied"
**Solution:** Check bucket policies. Make sure:
- Bucket is set to **Public**
- Policies allow INSERT and SELECT operations

### Issue 3: "File too large"
**Solution:** 
- Check file size (should be under 50MB)
- The system compresses images automatically, but very large files might still fail

### Issue 4: "Already exists"
**Solution:** This means a file with the same name already exists. The system uses timestamps, so this is rare. Try uploading again.

## Verification

After setup, verify it works:

1. ✅ Bucket exists: `vehicle-images`
2. ✅ Bucket is Public
3. ✅ Policies allow read/insert
4. ✅ Upload a test photo in your app

## Still Having Issues?

Check these:
- ✅ Supabase environment variables are set correctly
- ✅ Service role key has proper permissions
- ✅ Storage API is enabled in Supabase
- ✅ No network/firewall blocking Supabase

## Need Help?

If you're still seeing errors after setup:
1. Check browser console for detailed error messages
2. Check Supabase logs (Dashboard → Logs)
3. Verify all environment variables are set

---

**Quick Checklist:**
- [ ] Storage bucket `vehicle-images` created
- [ ] Bucket set to Public
- [ ] Policies configured
- [ ] Test upload works

