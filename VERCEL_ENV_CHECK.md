# Vercel Environment Variables Checklist

## Critical Environment Variables for Production

Your application requires these environment variables to be set in Vercel for production to work:

### 1. **RESEND_API_KEY** ⚠️ MOST IMPORTANT
- **Purpose**: Sends email notifications for credit applications and leads
- **Why it's failing**: If this isn't set, emails won't send on production
- **How to check**:
  1. Go to your Vercel dashboard: https://vercel.com/dashboard
  2. Select your project: "Unlimited-Auto-Project" (or whatever it's named)
  3. Go to Settings → Environment Variables
  4. Look for `RESEND_API_KEY`
  5. If it's missing or shows "Not set", you need to add it

### 2. **NEXT_PUBLIC_SUPABASE_URL**
- **Purpose**: Your Supabase project URL
- **Required for**: Database access, authentication, storage

### 3. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
- **Purpose**: Public Supabase API key (safe for browser)
- **Required for**: Client-side database reads

### 4. **SUPABASE_SERVICE_ROLE**
- **Purpose**: Service role key for server-side operations
- **Required for**: Writing to database, file uploads, email sending

### 5. **GOOGLE_SEARCH_API_KEY** (Optional)
- **Purpose**: Google Custom Search API for auto-populating vehicle specs
- **Not required**: System works without it using fallback data

### 6. **GOOGLE_SEARCH_ENGINE_ID** (Optional)
- **Purpose**: Google Custom Search Engine ID
- **Not required**: System works without it using fallback data

## Quick Fix Steps:

1. **Log into Vercel**: https://vercel.com/dashboard
2. **Select your project**
3. **Settings → Environment Variables**
4. **Verify all required variables are set**
5. **Redeploy**: Go to Deployments → Latest deployment → "Redeploy"

## Testing Email in Production:

After setting `RESEND_API_KEY`:
1. Submit a test credit application on the live site
2. Check Vercel logs: Deployments → Latest → Functions tab
3. Look for console logs showing email sending attempts
4. Check Resend dashboard: https://resend.com/emails (if you have Resend account)

## Common Issues:

- **"Email not working in production but works locally"**: `RESEND_API_KEY` is likely missing in Vercel
- **"Application not saving to database"**: `SUPABASE_SERVICE_ROLE` might be missing or incorrect
- **"Uploads not working"**: Check both `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE`

