# Vercel Environment Variables Setup

## 🚨 **CRITICAL: Environment Variables Missing**

Your Vercel deployment is failing because the required Supabase environment variables are not configured. The application needs these variables to connect to your Supabase database.

## 📋 **Required Environment Variables**

You need to add these environment variables to your Vercel project:

### **Public Variables (NEXT_PUBLIC_*)**
These are safe to expose to the browser:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Private Variables (Server-only)**
These should never be exposed to the browser:

```
SUPABASE_SERVICE_ROLE=your_supabase_service_role_key
```

## 🔧 **How to Set Up Environment Variables in Vercel**

### **Step 1: Get Your Supabase Credentials**
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (for `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public** key (for `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role** key (for `SUPABASE_SERVICE_ROLE`)

### **Step 2: Add to Vercel**
1. Go to your Vercel dashboard
2. Select your project: `unlimited-auto-project`
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - **Name:** `NEXT_PUBLIC_SUPABASE_URL`
   - **Value:** `https://your-project-id.supabase.co`
   - **Environment:** Production, Preview, Development
   
   - **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your anon key)
   - **Environment:** Production, Preview, Development
   
   - **Name:** `SUPABASE_SERVICE_ROLE`
   - **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your service role key)
   - **Environment:** Production, Preview, Development

### **Step 3: Redeploy**
1. After adding all environment variables
2. Go to **Deployments** tab
3. Click **Redeploy** on the latest deployment
4. Or push a new commit to trigger automatic deployment

## 🔍 **How to Find Your Supabase Credentials**

### **If you don't have a Supabase project yet:**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for it to finish setting up
4. Go to Settings → API to get your credentials

### **If you have an existing Supabase project:**
1. Log into your Supabase dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy the required values

## ⚠️ **Important Notes**

- **NEXT_PUBLIC_*** variables are exposed to the browser - only put safe values here
- **SUPABASE_SERVICE_ROLE** is sensitive - never expose this to the browser
- Make sure to add variables to all environments (Production, Preview, Development)
- After adding variables, you must redeploy for them to take effect

## 🎯 **Expected Result**

Once you've added the environment variables and redeployed:
- ✅ The application error will disappear
- ✅ Your website will load properly
- ✅ Admin login will work
- ✅ Database operations will function correctly

## 🆘 **Need Help?**

If you need assistance:
1. Check the Vercel deployment logs for specific error messages
2. Verify your Supabase project is active and accessible
3. Ensure all environment variable names match exactly (case-sensitive)

---
**Status:** ⚠️ **BLOCKING ISSUE** - Environment variables required for deployment
