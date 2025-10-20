# 🚀 Seamless Upload System Setup Guide

## What You Just Got

A **production-ready upload system** that works like modern apps (Instagram, Facebook, etc.) with:

✅ **Drag & Drop Interface** - Just drag photos onto the upload area  
✅ **Real-time Progress** - See upload progress for each file  
✅ **Smart Validation** - Automatically validates filename format  
✅ **Batch Processing** - Upload multiple files at once  
✅ **Error Handling** - Clear error messages for invalid files  
✅ **Auto-parsing** - Extracts vehicle info from filenames  
✅ **Preview System** - See what you're uploading before it goes live  

## Quick Setup (5 minutes)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for it to finish setting up (2-3 minutes)

### 2. Set Up Database
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `supabase-schema.sql`
3. Click **Run** to create all tables and policies

### 3. Create Storage Bucket
1. Go to **Storage** in your Supabase dashboard
2. Click **New Bucket**
3. Name it: `vehicle-images`
4. Make it **Public**
5. Click **Create bucket**

### 4. Get Your Keys
1. Go to **Settings** → **API**
2. Copy your **Project URL** and **anon public** key
3. Copy your **service_role** key (keep this secret!)

### 5. Set Environment Variables
1. Copy `.env.local.example` to `.env.local`
2. Fill in your Supabase keys:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 6. Test the Upload
1. Run your app: `npm run dev`
2. Go to: `http://localhost:3000/admin/upload`
3. Drag some photos with proper names like `2021TB_FDS.jpg`

## How It Works

### Filename Format
```
YYYYMODEL_ANGLE.jpg
```

**Examples:**
- `2021TB_FDS.jpg` = 2021 Trailblazer, Front Driver Side
- `2020CV_INT.jpg` = 2020 Civic, Interior
- `2019CM_ENG.jpg` = 2019 Camry, Engine

### Supported Angles
- `FDS` - Front Driver Side
- `FPS` - Front Passenger Side  
- `SDS` - Side Driver Side
- `SPS` - Side Passenger Side
- `SRDS` - Side Rear Driver Side
- `SRPS` - Side Rear Passenger Side
- `RDS` - Rear Driver Side
- `R` - Rear
- `F` - Front
- `INT` - Interior front
- `INTB` - Interior back
- `ENG` - Engine bay
- `TRK` - Trunk/cargo
- `ODOM` - Odometer
- `VIN` - VIN plate

### Supported Models
- `TB` - Trailblazer
- `CV` - Civic
- `CM` - Camry
- `NA` - Altima
- `RX` - Renegade
- `F150` - F-150
- `EQ` - Equinox
- `EL` - Elantra

*Add more in `src/lib/vehicleImages.ts`*

## Features

### 🎯 Smart Upload Flow
1. **Drag & Drop** - Just drop files onto the upload area
2. **Instant Validation** - See errors immediately if filenames are wrong
3. **Progress Tracking** - Real-time upload progress for each file
4. **Batch Upload** - Upload multiple files at once (3 at a time)
5. **Success Feedback** - Clear indication when uploads complete

### 🔒 Security
- **Server-side validation** - All uploads go through your API
- **Service role authentication** - Secure database access
- **File type validation** - Only images allowed
- **Filename validation** - Must follow naming convention

### 📱 User Experience
- **Responsive design** - Works on desktop and mobile
- **Error handling** - Clear error messages
- **Progress indicators** - Visual feedback during uploads
- **File management** - Remove files before uploading
- **Success tracking** - See what was uploaded

## Next Steps

1. **Test with real photos** - Upload some vehicle photos
2. **Customize models** - Add more model codes in `vehicleImages.ts`
3. **Connect to inventory** - The upload system is ready to feed your inventory pages
4. **Add admin features** - Bulk upload, CSV import, etc.

## Troubleshooting

### Upload Fails
- Check your `.env.local` file has correct Supabase keys
- Make sure the `vehicle-images` bucket exists and is public
- Check browser console for error messages

### Filename Errors
- Make sure filenames follow the exact format: `YYYYMODEL_ANGLE.jpg`
- Check that the model code exists in `MODEL_MAP`
- Verify the angle code is in the supported list

### Database Errors
- Run the SQL schema again in Supabase
- Check that RLS policies are set up correctly
- Verify your service role key has proper permissions

## Ready to Go! 🎉

Your upload system is now ready to handle vehicle photos seamlessly. The interface works just like modern apps - drag, drop, and watch the magic happen!
