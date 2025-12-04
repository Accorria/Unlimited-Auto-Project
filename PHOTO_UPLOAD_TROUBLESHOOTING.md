# Photo Upload Error Troubleshooting

## Error: "Network error connecting to storage"

This error means the app can't connect to Supabase Storage. Here's how to fix it:

---

## ✅ **Step 1: Verify Vercel Environment Variables**

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

**CRITICAL - Must have ALL of these:**

1. ✅ `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://caieldvdbpkrhgjmylve.supabase.co`
   - Environment: Production, Preview, Development

2. ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Get from: Supabase Dashboard → Settings → API → anon public key
   - Environment: Production, Preview, Development

3. ✅ **`SUPABASE_SERVICE_ROLE`** ⚠️ **MOST IMPORTANT**
   - Get from: Supabase Dashboard → Settings → API → service_role key
   - Environment: Production, Preview, Development
   - **This is the one that's usually missing!**

**After adding/updating:**
- Click **Save**
- Go to **Deployments** tab
- Click **Redeploy** on the latest deployment

---

## ✅ **Step 2: Verify Storage Bucket Exists**

1. Go to: **Supabase Dashboard** → https://supabase.com/dashboard
2. Select your project: `caieldvdbpkrhgjmylve`
3. Click **Storage** in the left sidebar
4. Check if **`vehicle-images`** bucket exists

**If it doesn't exist:**
1. Click **New Bucket**
2. Name: `vehicle-images`
3. **Make it Public** ✅ (important!)
4. Click **Create bucket**

---

## ✅ **Step 3: Check Storage Bucket Policies**

1. In Supabase Dashboard → **Storage** → Click on **`vehicle-images`** bucket
2. Go to **Policies** tab
3. You should have policies that allow:
   - **Public read access** (anyone can view photos)
   - **Authenticated uploads** (your app can upload)

**If policies are missing, add these:**

**Policy 1: Public Read**
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'vehicle-images');
```

**Policy 2: Authenticated Upload**
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vehicle-images');
```

---

## ✅ **Step 4: Test the Connection**

After fixing the above, test by:

1. **Redeploy on Vercel** (after updating env vars)
2. Try uploading a photo on the live site
3. Check Vercel logs: **Deployments → Latest → Functions tab**
4. Look for any error messages

---

## 🔍 **Quick Diagnostic**

Run this in your browser console on the production site:

```javascript
fetch('/api/check-db')
  .then(r => r.json())
  .then(console.log)
```

This will tell you if the Supabase connection is working.

---

## 📋 **Most Common Issue**

**90% of the time, it's this:**
- `SUPABASE_SERVICE_ROLE` is **not set in Vercel**
- Or it's set but **not for Production environment**

**Fix:**
1. Go to Vercel → Settings → Environment Variables
2. Find `SUPABASE_SERVICE_ROLE`
3. Make sure it's set for **Production, Preview, AND Development**
4. Copy the value from your `.env.local` file
5. Save and redeploy

---

## 🆘 **Still Not Working?**

If it still fails after all the above:

1. **Check Supabase Status**: https://status.supabase.com
2. **Check Vercel Logs**: Look for specific error messages
3. **Verify the service role key**: Make sure it's the full key from Supabase (starts with `eyJ...`)

