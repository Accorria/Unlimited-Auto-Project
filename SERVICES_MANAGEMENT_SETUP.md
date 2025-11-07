# 🔧 Services Management & Real-Time Chatbot Updates

## Overview

Your chatbot is now a **"Website Master"** that knows everything about your inventory and services in real-time! Every time a vehicle is added/removed or a service price changes, the chatbot automatically knows about it.

## ✅ What's Been Set Up

### 1. **Services Database Table**
- Created `services` table in Supabase
- Stores service name, description, category, price, features
- Supports multiple pricing units (flat, per hour, per vehicle, per window)
- Active/inactive status for services
- Display order for sorting

### 2. **Admin Services Management Page**
- **Location:** `/admin/services`
- **Access:** Super Admin and Dealer Admin only
- **Features:**
  - Add new services (e.g., "Window Tint" for $80)
  - Edit existing services (update price from $80 to $100)
  - Delete services
  - Activate/Deactivate services
  - Organize by category (tinting, detailing, repair, collision, wrapping)
  - Set display order

### 3. **Real-Time Chatbot Updates**
- **How it works:** The chatbot fetches fresh inventory and services data on EVERY conversation
- **What this means:**
  - Add a vehicle → Bot knows about it immediately
  - Remove a vehicle → Bot knows it's gone immediately
  - Change a service price → Bot knows the new price immediately
  - Add a new service → Bot can explain it immediately

### 4. **Chatbot Integration**
- Bot now knows about:
  - ✅ All vehicles in inventory (with real-time updates)
  - ✅ All services and pricing (with real-time updates)
  - ✅ Vehicle details (price, mileage, color, condition, etc.)
  - ✅ Service details (price, description, features, etc.)

## 🚀 How to Use

### Adding a Service (Example: Window Tint)

1. Go to `/admin/services` in your admin dashboard
2. Click **"+ Add New Service"**
3. Fill in the form:
   - **Service Name:** `Window Tint`
   - **Description:** `Professional window tinting for style and protection`
   - **Category:** `tinting`
   - **Price:** `80.00`
   - **Price Unit:** `flat` (or `per_window` if you charge per window)
   - **Features:** `UV Protection, Heat Reduction, Privacy` (comma-separated)
4. Click **"Add Service"**

**Result:** The chatbot now knows "Window Tint is $80" and can tell customers!

### Updating a Service Price

1. Go to `/admin/services`
2. Find the service (e.g., "Window Tint")
3. Click **"Edit"**
4. Change the price from `80.00` to `100.00`
5. Click **"Update Service"**

**Result:** The chatbot now knows "Window Tint is $100" and will tell customers the new price!

### Adding a Vehicle

1. Go to `/admin/inventory/add`
2. Add the vehicle details
3. Save

**Result:** The chatbot immediately knows about the new vehicle and can help customers find it!

## 📋 Service Categories

- **tinting** - Window tinting services
- **detailing** - Vehicle detailing services
- **repair** - Auto repair services
- **collision** - Collision repair services
- **wrapping** - Vehicle wrapping services
- **other** - Other services

## 💬 Chatbot Examples

### Example 1: Customer asks about window tint
**Customer:** "How much is window tint?"
**Bot:** "Our window tinting service is currently $80.00. It includes UV Protection, Heat Reduction, and Privacy. Would you like to schedule an appointment?"

### Example 2: Customer asks about a vehicle
**Customer:** "Do you have any Jeeps?"
**Bot:** "Yes! We have [X] Jeeps in stock. [Lists all Jeeps with details]"

### Example 3: Service price was updated
**Customer:** "What's the price for window tint?"
**Bot:** "Our window tinting service is currently $100.00. [Other details]"

*(The bot automatically knows the new price because it fetches fresh data on every conversation)*

## 🔄 Real-Time Updates Explained

**What "Real-Time" Means:**
- The chatbot doesn't store data in memory
- Every time a customer sends a message, the bot fetches:
  - Fresh vehicle inventory from the database
  - Fresh services and pricing from the database
- This means changes are reflected immediately

**Why This is Better:**
- ✅ No need to restart the bot when inventory changes
- ✅ No need to manually update bot knowledge
- ✅ Always accurate, up-to-date information
- ✅ Works automatically - no configuration needed

## 🗄️ Database Migration

To set up the services table, run the migration:

```sql
-- The migration file is located at:
-- supabase/migrations/20250125000000_create_services_table.sql
```

If you're using Supabase CLI:
```bash
supabase db push
```

Or apply it manually in your Supabase dashboard SQL editor.

## 📝 API Endpoints

### Get Services
```
GET /api/services?dealer=unlimited-auto
GET /api/services?dealer=unlimited-auto&category=tinting
```

### Create Service
```
POST /api/services
Body: {
  name: "Window Tint",
  description: "...",
  category: "tinting",
  price: 80.00,
  price_unit: "flat",
  features: ["UV Protection", "Heat Reduction"],
  dealerSlug: "unlimited-auto"
}
```

### Update Service
```
PUT /api/services
Body: {
  id: "...",
  price: 100.00,
  ...
}
```

### Delete Service
```
DELETE /api/services?id=...
```

## 🎯 Next Steps

1. **Run the migration** to create the services table
2. **Add your services** in `/admin/services`
3. **Test the chatbot** - ask it about services and vehicles
4. **Update prices** as needed - the bot will automatically know!

## 🔐 Security

- Services management is restricted to Super Admin and Dealer Admin roles
- Public can view active services (for the chatbot)
- RLS (Row Level Security) policies are in place

## 📊 What the Bot Knows

The chatbot is now a **"Website Master"** that knows:

✅ **Inventory:**
- All vehicles (make, model, year, trim, price, mileage, color, condition, etc.)
- Vehicle status (available, sold, pending)
- Real-time updates when vehicles are added/removed

✅ **Services:**
- All services and their current pricing
- Service descriptions and features
- Service categories
- Real-time updates when prices change

✅ **What it DOESN'T know (for privacy):**
- Customer personal information
- Lead details
- Internal notes
- Sales data

The bot focuses on helping customers find vehicles and services, not accessing private customer data.

---

**Your chatbot is now fully integrated with your inventory and services!** 🎉

