# Development Server Guide

## Current Status
- **Node.js Version:** v22.12.0 (Supabase compatible)
- **Current Port:** 3002 (auto-increments if 3000/3001 are busy)
- **Status:** ✅ Working with placeholder images

## Starting the Development Server

### Option 1: Clean Start (Recommended)
```bash
npm run dev:clean
```
This will:
- Kill any existing Next.js processes on ports 3000, 3001, 3002
- Use Node.js 22.12.0
- Start on port 3000

### Option 2: Regular Start
```bash
npm run dev
```
This will start on the next available port (3000, 3001, 3002, etc.)

## Checking Current Status
```bash
# Check what's running on ports 3000-3002
lsof -ti:3000,3001,3002

# Check Node.js version
node -v
```

## Troubleshooting
- If you get "port in use" errors, use `npm run dev:clean`
- If you get build errors, run `rm -rf .next && npm run build`
- Always use Node.js 22+ for Supabase compatibility

## Current URL
Your site is currently running at: **http://localhost:3002/admin/inventory**
