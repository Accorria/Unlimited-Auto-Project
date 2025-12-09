# Image Loading Debug Guide

## Quick Checks

### 1. **Check Browser Console**
When images don't load, open your browser's Developer Tools (F12) and check:
- **Console tab**: Look for any error messages about images
- **Network tab**: Check if image requests are failing (red status codes)
- Look for CORS errors or 403/404 errors

### 2. **Verify Image URLs**
The images should have URLs like:
```
https://[your-project-id].supabase.co/storage/v1/object/public/vehicle-images/[filename]
```

### 3. **Check Supabase Storage Bucket**
1. Go to **Supabase Dashboard** → **Storage**
2. Click on **`vehicle-images`** bucket
3. Verify:
   - ✅ Bucket is **Public** (not private)
   - ✅ Files are actually uploaded (check the Files tab)
   - ✅ Public URLs are accessible

### 4. **Check Environment Variables**
Make sure these are set in Vercel (for production) and `.env.local` (for local):
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE`

### 5. **Test Image URL Directly**
1. Copy a `public_url` from your database
2. Paste it directly in your browser
3. If it loads → URL is correct, issue is in the app
4. If it doesn't load → Storage bucket issue

## Common Issues

### Issue 1: Images Upload But Don't Display
**Symptoms**: Upload succeeds, but images show broken/placeholder
**Cause**: Public URL format incorrect or bucket not public
**Fix**: 
- Verify bucket is public in Supabase Dashboard
- Check that `getPublicUrl()` is generating correct URLs

### Issue 2: 403 Forbidden Errors
**Symptoms**: Network tab shows 403 errors for image requests
**Cause**: Bucket policies blocking public access
**Fix**:
- Go to Supabase → Storage → `vehicle-images` → Policies
- Add public read policy:
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'vehicle-images');
```

### Issue 3: Images Work Locally But Not in Production
**Symptoms**: Images load on localhost but not on Vercel
**Cause**: Environment variables not set in Vercel
**Fix**:
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE` are set
- Redeploy after adding variables

### Issue 4: CORS Errors
**Symptoms**: Console shows CORS policy errors
**Cause**: Supabase CORS settings
**Fix**: Usually not needed - Supabase handles CORS automatically, but check Supabase Dashboard → Settings → API → CORS

## Debug Steps

1. **Check what's in the database:**
   - Go to Supabase Dashboard → Table Editor → `vehicle_photos`
   - Look at a vehicle's photos
   - Copy a `public_url` value
   - Try opening it in a new browser tab

2. **Check browser network requests:**
   - Open DevTools → Network tab
   - Filter by "Img"
   - Reload the inventory page
   - Click on failed image requests
   - Check the Response tab for error messages

3. **Check console logs:**
   - Look for any `onError` handlers firing
   - Check for "Vehicle image failed to load" messages
   - These indicate the image URL exists but the file can't be loaded

## Quick Test

Run this in your browser console on the inventory page:
```javascript
// Get first vehicle's image URL
fetch('/api/vehicles?dealer=unlimited-auto')
  .then(r => r.json())
  .then(data => {
    const vehicle = data.vehicles[0]
    console.log('Vehicle:', vehicle.year, vehicle.make, vehicle.model)
    console.log('Photos:', vehicle.vehicle_photos)
    console.log('First photo URL:', vehicle.vehicle_photos?.[0]?.public_url)
    
    // Test if URL loads
    if (vehicle.vehicle_photos?.[0]?.public_url) {
      const img = new Image()
      img.onload = () => console.log('✅ Image loads successfully')
      img.onerror = () => console.log('❌ Image failed to load')
      img.src = vehicle.vehicle_photos[0].public_url
    }
  })
```

This will tell you if:
- ✅ Images are in the database
- ✅ URLs are correct format
- ✅ URLs are actually accessible

