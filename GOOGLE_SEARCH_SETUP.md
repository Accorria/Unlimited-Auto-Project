# Google Search Integration Setup

## Overview
The vehicle inventory system can automatically search Google for vehicle specifications when you enter Year, Make, Model, and Trim. This auto-populates fields like Engine, MPG, Transmission, and Drivetrain.

## Setup Instructions

## ⚠️ Important: This is NOT Google AI Studio

**Google Custom Search API** is different from **Google AI Studio**:
- ❌ **NOT** set up in Google AI Studio
- ✅ Set up in **Google Cloud Console** (different platform)
- These are two separate services

## Optional: Set Up Google Custom Search API

### Step 1: Go to Google Cloud Console (NOT AI Studio)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
   - **NOTE:** This is different from Google AI Studio
   - Use your Google account (same account, different platform)
2. Create a new project or select an existing one
3. Enable the "Custom Search API" 
   - Go to **APIs & Services** → **Library**
   - Search for "Custom Search API"
   - Click **Enable**

### Step 2: Create API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Copy your API key
4. (Optional) Restrict the key to "Custom Search API" for security

### Step 3: Create Custom Search Engine

1. Go to [Google Custom Search](https://programmablesearchengine.google.com/)
2. Click **Add** to create a new search engine
3. Enter any website (e.g., `cars.com`) - you can change this later
4. Click **Create**
5. Click **Customize** on your new search engine
6. Under **Basics**, enable "Search the entire web"
7. Copy the **Search engine ID** (CX parameter)

### Step 4: Add Environment Variables

Add these to your `.env.local` file:

```bash
GOOGLE_SEARCH_API_KEY=your_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

For Vercel production:
1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add both variables for Production, Preview, and Development

## How It Works

1. When you select **Year**, **Make**, **Model**, and optionally **Trim**
2. The system automatically searches Google after 1.5 seconds
3. It extracts vehicle specifications from search results
4. Auto-populates: Engine, MPG, Transmission, Drivetrain
5. Shows a success indicator when data is found

## Fallback System

If Google API is not configured or fails:
- The system uses a built-in database of common vehicle specs
- Based on make/model combinations
- Still provides useful default values

## Cost & Pricing

### Google Custom Search API Pricing (2025)

**FREE Tier:**
- ✅ **100 free searches per day** (no credit card required)
- ✅ Perfect for testing and small dealerships
- ✅ No charge if you stay under 100 searches/day

**Paid Tier:**
- **$5 per 1,000 searches** after free tier
- Example: If you do 500 searches/month = FREE
- Example: If you do 2,000 searches/month = ~$10/month

**Real-World Usage:**
- Adding 1 vehicle = 1 search
- 100 vehicles/month = FREE
- 1,000 vehicles/month = ~$5/month
- For most dealerships, the **free tier is sufficient**

### Alternative: No API Key Needed!

**The system works WITHOUT Google API:**
- Uses built-in database of vehicle specs
- Auto-populates based on make/model
- Still very useful and accurate
- **100% FREE** - no setup required
- You can always add Google API later for even better results

## Troubleshooting

**No data found:**
- Check API key is correct
- Verify Search Engine ID is correct
- Check API is enabled in Google Cloud Console
- Review server logs for errors

**API errors:**
- Verify environment variables are set
- Check API quota hasn't been exceeded
- Ensure "Search the entire web" is enabled in Custom Search settings

## Example

When you enter:
- Year: 2015
- Make: Chevrolet
- Model: Cruze
- Trim: LT

The system searches: "2015 Chevrolet Cruze LT specifications engine mpg"

And auto-fills:
- Engine: 1.4L Turbo 4-Cylinder
- MPG: 28 City / 40 Highway
- Transmission: Automatic
- Drivetrain: FWD

