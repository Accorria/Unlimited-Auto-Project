# 🔐 Supabase CLI Setup Guide

## Prerequisites
- ✅ Supabase CLI installed (`brew install supabase/tap/supabase`)
- ✅ Your Supabase account credentials

## Step-by-Step Setup

### 1. Login to Supabase
```bash
supabase login
```
- This opens your browser
- Log in with your Supabase account
- Grant access to the CLI

### 2. List Your Projects
```bash
supabase projects list
```
- Shows all your Supabase projects
- Note the project reference ID for "Unlimited Auto"

### 3. Link Your Project
```bash
supabase link --project-ref YOUR_PROJECT_REF
```
- Replace `YOUR_PROJECT_REF` with your actual project ID
- This connects your local project to Supabase

### 4. Initialize Supabase in Your Project
```bash
cd "/Users/prestoneaton/Unlimited Auto Project"
supabase init
```

### 5. Verify Connection
```bash
supabase status
```

## What This Gives You

After setup, you can:
- Run SQL scripts directly: `supabase db push`
- Pull database changes: `supabase db pull`
- Start local development: `supabase start`
- View database diff: `supabase db diff`

## Next Steps After Setup

1. Run the photo upload fix: `supabase db push`
2. Test photo uploads in your app
3. Clean up duplicate SQL queries in Supabase dashboard

## Troubleshooting

If you get errors:
- Make sure you're logged in: `supabase login`
- Check your project reference: `supabase projects list`
- Verify you're in the right directory: `pwd`
