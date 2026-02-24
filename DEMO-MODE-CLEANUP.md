# 🧹 Demo Mode Cleanup Guide

## Situation
- ✅ Storage quota exceeded (can't access Storage UI)
- ✅ Project is for demo only (not production)
- ✅ Want to clean up database

---

## 🎯 Solution: Delete All Photos from Database

Since you can't access Storage due to quota restrictions, we'll delete all photo records from the database. This will:

- ✅ Clean up the database
- ✅ Remove photo references from the app
- ✅ Files remain in Storage but won't be accessible
- ✅ Your frontend should show placeholder images

---

## 📋 Steps

### **Step 1: Delete All Photos from Database**

Run this SQL in Supabase SQL Editor:

```sql
DELETE FROM vehicle_photos;
```

This removes all photo records. Your vehicles will no longer have photos in the database.

### **Step 2: Update Frontend (Optional)**

Make sure your frontend handles missing photos gracefully:

```typescript
// Example: Show placeholder if no photo
const imageUrl = vehicle.coverPhoto || 
  vehicle.vehicle_photos?.[0]?.public_url || 
  '/placeholder-car.jpg'
```

### **Step 3: Verify**

Check that photos are gone:

```sql
SELECT COUNT(*) FROM vehicle_photos;
-- Should return 0
```

---

## 🔄 Alternative: Keep Main Photos Only

If you want to keep some photos for demo:

```sql
-- Keep only 1 main photo per vehicle
DELETE FROM vehicle_photos
WHERE id NOT IN (
    SELECT DISTINCT ON (vehicle_id) id
    FROM vehicle_photos
    ORDER BY vehicle_id,
        CASE WHEN is_primary = true THEN 1 ELSE 2 END,
        CASE WHEN angle = 'FDS' THEN 1 ELSE 2 END,
        created_at ASC
);
```

This keeps 1 photo per vehicle (the main one).

---

## 📊 What Happens to Storage Files?

**Current Situation:**
- ❌ Can't access Storage UI (quota exceeded)
- ❌ Files remain in Storage bucket
- ✅ Database records deleted (photos won't show in app)

**Options to Delete Storage Files Later:**

1. **Upgrade Plan** (if needed)
   - Upgrade to Pro plan to access Storage
   - Then delete files manually

2. **Use Supabase CLI** (if you have access)
   ```bash
   supabase storage rm vehicle-images --recursive --experimental
   ```

3. **Wait for Quota Reset**
   - Free plan resets monthly
   - Access Storage after reset
   - Then delete files

4. **Leave Files** (for demo)
   - Files won't hurt anything
   - They just take up storage space
   - App won't reference them (database cleaned)

---

## ✅ Demo Mode Checklist

- [ ] Delete all photos from database (`DELETE FROM vehicle_photos;`)
- [ ] Verify photos are gone (`SELECT COUNT(*) FROM vehicle_photos;`)
- [ ] Test frontend (should show placeholder images)
- [ ] Storage files can be deleted later (when quota allows)

---

## 💡 For Demo Purposes

Since this is just for demo:

1. **Database is clean** ✅ - No photo records
2. **Frontend works** ✅ - Shows placeholder images
3. **Storage files** ⏳ - Can delete later when quota allows

The app will function fine without photos - it will just show placeholder images or broken image icons, which is fine for demo purposes.

---

**Status:** Ready to clean database for demo mode 🧹
