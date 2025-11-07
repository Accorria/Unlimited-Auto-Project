# 🚗 Complete Build Plan - "Talk to a Sales Agent" + SMS Features

**Date**: January 2025  
**Status**: Ready to Build  
**Twilio Account**: New account with different email (Option 1)  
**Timeline**: Build Today  

---

## 📋 **EXECUTIVE SUMMARY**

We're building **two simple features** for the Unlimited Auto dealership website:

1. **"Talk to a Sales Agent" Pop-Up** - Appears on vehicle detail pages, allows customers to schedule test drives or start pre-approval
2. **SMS Notifications** - Sends SMS alerts to your phone and Glover's phone when leads come in, plus ability to send SMS to reps from admin dashboard

**NOT building:**
- ❌ AI chatbot
- ❌ Aquaria features
- ❌ Complex routing
- ❌ Automated responses

**Just simple tools that make it easier for customers to connect and for you to respond faster.**

---

## 🎯 **FEATURE 1: "Talk to a Sales Agent" Pop-Up**

### **What It Does**

- **Location**: Vehicle detail pages (`/inventory/[id]`)
- **Trigger**: Customer clicks "Talk to a Sales Agent" button
- **Display**: Mobile-friendly pop-up modal showing:
  - Vehicle photo (cover photo)
  - Year, Make, Model, Price
  - Friendly greeting message
  - Two action buttons:
    1. **"Schedule Test Drive"** → Opens appointment form
    2. **"Get Pre-Approved"** → Opens credit application

### **User Flow**

1. Customer views vehicle detail page
2. Sees "Talk to a Sales Agent" button (prominent, mobile-friendly)
3. Clicks button → Pop-up opens instantly (no page reload)
4. Sees vehicle info and two options
5. Clicks "Schedule Test Drive" OR "Get Pre-Approved"
6. Fills out form (existing forms, no new forms needed)
7. Submits → Lead created in database
8. Email notification sent to `unlimitedautoredford@gmail.com`
9. SMS notification sent to configured phone numbers
10. Lead appears in admin dashboard

### **Technical Implementation**

#### **Component to Create:**
- **File**: `src/components/TalkToSalesAgent.tsx`
- **Type**: Client component (uses React hooks)
- **Props**: 
  - `vehicle` (object with vehicle data)
  - `onClose` (function to close pop-up)

#### **Integration Points:**
- **Vehicle Detail Page**: `src/app/inventory/[id]/page.tsx`
  - Add button: "Talk to a Sales Agent"
  - Import and render `TalkToSalesAgent` component
  - Pass vehicle data as prop

#### **API Endpoints Used:**
- **Existing**: `/api/appointments` - Create appointment
- **Existing**: `/api/leads` - Create/update lead
- **Existing**: `/api/leads/track` - Track incomplete leads

#### **Database Tables Used:**
- **Existing**: `leads` table - Store lead data
- **Existing**: `appointments` table - Store appointment data

#### **Design Requirements:**
- ✅ Mobile-first (big tap targets, min 44x44px)
- ✅ No horizontal scroll
- ✅ Fits within viewport
- ✅ Matches existing design system (Tailwind CSS)
- ✅ Responsive (mobile, tablet, desktop)
- ✅ Accessible (keyboard navigation, screen readers)

---

## 📲 **FEATURE 2: SMS Notifications**

### **What It Does**

#### **Part A: Automatic SMS Notifications**

- **Trigger**: When a new lead is created (from any source)
- **Recipients**: 
  - Your phone number (configurable in admin dashboard)
  - Glover's phone number (configurable in admin dashboard)
  - Any other phone numbers you add
- **Content**: 
  ```
  🚗 New Lead: [Customer Name]
  📞 Phone: [Phone Number]
  🚗 Vehicle: [Vehicle Info if available]
  🔗 View: [Short link to lead details in admin dashboard]
  ```
- **Timing**: Sent immediately when lead is created

#### **Part B: Manual SMS to Reps**

- **Location**: Admin lead detail view (`/admin/leads`)
- **Button**: "Send via SMS" button on each lead
- **Action**: 
  - Click button → Modal opens
  - Select rep's phone number (dropdown) OR type phone number manually
  - Optional: Reassign lead to that rep
  - Click "Send SMS" → SMS sent with lead details
- **Content**: Same as automatic notifications

### **Technical Implementation**

#### **SMS Service Setup:**
- **Provider**: Twilio
- **Account**: New account with different email (Option 1)
- **Free Trial**: $15.50 credit = 2,000 free SMS
- **Pricing After Trial**: $0.0075 per SMS + $1/month for phone number

#### **API Endpoint to Create:**
- **File**: `src/app/api/sms/send/route.ts`
- **Method**: POST
- **Function**: Send SMS via Twilio API
- **Parameters**:
  - `to` (phone number)
  - `message` (SMS content)
  - `leadId` (optional, for tracking)

#### **SMS Library to Update:**
- **File**: `src/lib/sms.ts`
- **Current**: Has Resend integration (doesn't support SMS)
- **Update**: Add Twilio integration
- **Functions**:
  - `sendSMS(to: string, message: string)` - Send single SMS
  - `sendSMSNotification(lead: Lead)` - Send lead notification SMS
  - `sendSMSToTeam(lead: Lead, phoneNumbers: string[])` - Send to multiple numbers

#### **Admin Dashboard Updates:**

##### **1. Settings Page for Phone Numbers**
- **File**: `src/app/admin/settings/page.tsx`
- **Add Section**: "SMS Notifications"
- **Fields**:
  - Primary phone number (your phone)
  - Secondary phone number (Glover's phone)
  - Additional phone numbers (array)
- **Storage**: Store in `dealers` table or new `settings` table

##### **2. Lead Detail View - SMS Button**
- **File**: `src/app/admin/leads/page.tsx`
- **Add Button**: "Send via SMS" on each lead
- **Modal**: 
  - Phone number selector (dropdown of users/phone numbers)
  - Manual phone number input
  - Checkbox: "Reassign lead to this rep"
  - "Send SMS" button
- **Action**: Calls `/api/sms/send` endpoint

#### **Database Updates:**
- **Option 1**: Add phone numbers to `dealers` table
  - `sms_phone_numbers` (JSONB array)
- **Option 2**: Create `settings` table
  - Store SMS configuration
- **Option 3**: Add to `users` table
  - `phone_number` field for each user

#### **Environment Variables Needed:**
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWILIO_PHONE_NUMBER` - Your Twilio phone number

---

## 🗄️ **DATABASE SCHEMA UPDATES**

### **Option 1: Add to `dealers` Table**

```sql
ALTER TABLE dealers 
ADD COLUMN sms_phone_numbers JSONB DEFAULT '[]'::jsonb;

-- Example data:
-- ["+13137664475", "+13131234567"]
```

### **Option 2: Create `settings` Table**

```sql
CREATE TABLE IF NOT EXISTS public.sms_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  primary_phone TEXT,
  secondary_phone TEXT,
  additional_phones JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Option 3: Add to `users` Table**

```sql
ALTER TABLE users 
ADD COLUMN phone_number TEXT;

-- Update existing users with phone numbers
```

**Recommendation**: Use Option 1 (add to `dealers` table) - simplest, no new table needed.

---

## 📁 **FILES TO CREATE**

### **1. Talk to Sales Agent Component**
- **File**: `src/components/TalkToSalesAgent.tsx`
- **Type**: Client component
- **Dependencies**: React, Tailwind CSS

### **2. SMS Send API Endpoint**
- **File**: `src/app/api/sms/send/route.ts`
- **Type**: Server-side API route
- **Dependencies**: Twilio SDK

### **3. SMS Settings Component (Admin)**
- **File**: `src/components/SMSSettings.tsx` (optional, can be in settings page)
- **Type**: Client component
- **Purpose**: Manage phone numbers in admin dashboard

---

## 📝 **FILES TO MODIFY**

### **1. Vehicle Detail Page**
- **File**: `src/app/inventory/[id]/page.tsx`
- **Changes**:
  - Import `TalkToSalesAgent` component
  - Add "Talk to a Sales Agent" button
  - Add state for pop-up open/close
  - Render pop-up when button clicked

### **2. Admin Leads Page**
- **File**: `src/app/admin/leads/page.tsx`
- **Changes**:
  - Add "Send via SMS" button to each lead
  - Add modal for SMS sending
  - Add phone number selector
  - Add function to call SMS API

### **3. Admin Settings Page**
- **File**: `src/app/admin/settings/page.tsx`
- **Changes**:
  - Add "SMS Notifications" section
  - Add phone number input fields
  - Add save functionality
  - Store phone numbers in database

### **4. SMS Library**
- **File**: `src/lib/sms.ts`
- **Changes**:
  - Remove Resend SMS code (doesn't work)
  - Add Twilio integration
  - Add `sendSMS()` function
  - Add `sendSMSNotification()` function
  - Add `sendSMSToTeam()` function

### **5. Lead Creation APIs**
- **Files**: 
  - `src/app/api/leads/route.ts`
  - `src/app/api/applications/route.ts`
  - `src/app/api/financing/apply/route.ts`
  - `src/app/api/appointments/route.ts`
- **Changes**:
  - After creating lead, call SMS notification function
  - Get phone numbers from database
  - Send SMS to all configured phone numbers

---

## 🔧 **TECHNICAL STACK**

### **Frontend:**
- **Framework**: Next.js 15.5.6
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: React 19

### **Backend:**
- **API Routes**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **SMS Service**: Twilio

### **Dependencies to Add:**
```json
{
  "twilio": "^4.19.0"
}
```

**Install command:**
```bash
npm install twilio
```

---

## 🎨 **DESIGN SPECIFICATIONS**

### **"Talk to a Sales Agent" Pop-Up**

**Layout:**
```
┌─────────────────────────────────────┐
│  Talk to a Sales Agent        [X]  │
│  ─────────────────────────────────  │
│                                      │
│  [Vehicle Photo - 200x150px]        │
│                                      │
│  2021 Chevrolet Malibu               │
│  $18,500                             │
│                                      │
│  Hi! Interested in this vehicle?    │
│  I can help you:                     │
│                                      │
│  [Schedule Test Drive]               │
│  (Full width, blue button)           │
│                                      │
│  [Get Pre-Approved]                  │
│  (Full width, green button)          │
│                                      │
│  Or call us: (313) 766-4475         │
│                                      │
└─────────────────────────────────────┘
```

**Styling:**
- Background: White with shadow
- Border radius: 12px
- Padding: 24px
- Mobile: Full width, max-height: 90vh, scrollable
- Desktop: Max-width: 500px, centered

**Button Styling:**
- "Schedule Test Drive": Blue (#2563EB), white text, full width, py-4, rounded-lg
- "Get Pre-Approved": Green (#10B981), white text, full width, py-4, rounded-lg
- Hover: Slightly darker shade
- Active: Scale down slightly

### **SMS Button in Admin**

**Location**: Lead detail modal or lead row
**Styling**: 
- Small button, gray/blue color
- Icon: 📱 or SMS icon
- Text: "Send via SMS"
- Hover: Highlight

---

## 🔐 **ENVIRONMENT VARIABLES**

### **Required for SMS:**

Add to `.env.local` (development) and Vercel (production):

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+13137664475
```

### **Where to Get These:**

1. **Sign up for Twilio** (new account with different email)
2. **Verify email**
3. **Get free trial credit** ($15.50 = 2,000 free SMS)
4. **Get phone number** ($1/month, but free during trial)
5. **Copy Account SID and Auth Token** from Twilio dashboard
6. **Add to environment variables**

---

## ✅ **IMPLEMENTATION CHECKLIST**

### **Phase 1: Setup**
- [ ] Create new Twilio account with different email
- [ ] Get Twilio Account SID and Auth Token
- [ ] Get Twilio phone number
- [ ] Add environment variables to `.env.local`
- [ ] Add environment variables to Vercel
- [ ] Install Twilio npm package: `npm install twilio`

### **Phase 2: SMS Infrastructure**
- [ ] Update `src/lib/sms.ts` with Twilio integration
- [ ] Create `src/app/api/sms/send/route.ts` endpoint
- [ ] Test SMS sending (send test SMS to your phone)
- [ ] Add phone number storage to database (update `dealers` table)

### **Phase 3: Admin Dashboard - SMS Settings**
- [ ] Add SMS settings section to admin settings page
- [ ] Add phone number input fields (primary, secondary, additional)
- [ ] Add save functionality
- [ ] Test saving phone numbers to database
- [ ] Test retrieving phone numbers from database

### **Phase 4: Automatic SMS Notifications**
- [ ] Update `/api/leads` route to send SMS after lead creation
- [ ] Update `/api/applications` route to send SMS after application
- [ ] Update `/api/financing/apply` route to send SMS after financing app
- [ ] Update `/api/appointments` route to send SMS after appointment
- [ ] Test SMS notifications (create test lead, verify SMS received)

### **Phase 5: Manual SMS to Reps**
- [ ] Add "Send via SMS" button to lead detail view
- [ ] Create SMS send modal component
- [ ] Add phone number selector (dropdown of users/phone numbers)
- [ ] Add manual phone number input
- [ ] Add "Reassign lead" checkbox
- [ ] Connect to SMS API endpoint
- [ ] Test sending SMS from admin dashboard

### **Phase 6: "Talk to a Sales Agent" Pop-Up**
- [ ] Create `src/components/TalkToSalesAgent.tsx` component
- [ ] Add pop-up modal with vehicle info
- [ ] Add "Schedule Test Drive" button (links to appointment form)
- [ ] Add "Get Pre-Approved" button (links to credit application)
- [ ] Make mobile-responsive
- [ ] Add to vehicle detail page (`src/app/inventory/[id]/page.tsx`)
- [ ] Add "Talk to a Sales Agent" button to vehicle page
- [ ] Test pop-up opens/closes correctly
- [ ] Test form submissions create leads
- [ ] Test SMS notifications are sent

### **Phase 7: Testing**
- [ ] Test on mobile device (iPhone/Android)
- [ ] Test on tablet
- [ ] Test on desktop
- [ ] Test SMS sending (your phone, Glover's phone)
- [ ] Test lead creation from pop-up
- [ ] Test appointment creation from pop-up
- [ ] Test credit application from pop-up
- [ ] Test admin dashboard SMS sending
- [ ] Test error handling (invalid phone numbers, API failures)

### **Phase 8: Deployment**
- [ ] Commit all changes to Git
- [ ] Push to GitHub
- [ ] Deploy to Vercel
- [ ] Verify environment variables in Vercel
- [ ] Test on production
- [ ] Monitor for errors

---

## 🧪 **TESTING PLAN**

### **Test Cases:**

#### **1. "Talk to a Sales Agent" Pop-Up**
- [ ] Pop-up opens when button clicked
- [ ] Vehicle info displays correctly
- [ ] "Schedule Test Drive" button works
- [ ] "Get Pre-Approved" button works
- [ ] Pop-up closes when X clicked
- [ ] Pop-up closes when clicking outside
- [ ] Mobile responsive (no horizontal scroll)
- [ ] Works on iPhone
- [ ] Works on Android
- [ ] Works on tablet
- [ ] Works on desktop

#### **2. SMS Notifications**
- [ ] SMS sent when lead created from pop-up
- [ ] SMS sent when lead created from contact form
- [ ] SMS sent when lead created from credit application
- [ ] SMS sent to primary phone number
- [ ] SMS sent to secondary phone number
- [ ] SMS sent to all additional phone numbers
- [ ] SMS content is correct (name, phone, vehicle, link)
- [ ] SMS link works (opens lead in admin dashboard)

#### **3. Manual SMS to Reps**
- [ ] "Send via SMS" button appears on lead detail
- [ ] Modal opens when button clicked
- [ ] Phone number selector works
- [ ] Manual phone number input works
- [ ] SMS sent when "Send SMS" clicked
- [ ] Lead reassignment works (if checkbox checked)
- [ ] Error handling works (invalid phone number)

#### **4. Admin Settings**
- [ ] Phone numbers can be added
- [ ] Phone numbers can be edited
- [ ] Phone numbers can be deleted
- [ ] Phone numbers are saved to database
- [ ] Phone numbers are retrieved from database

---

## 📊 **SUCCESS CRITERIA**

### **Feature 1: "Talk to a Sales Agent" Pop-Up**
- ✅ Pop-up appears on vehicle detail pages
- ✅ Shows vehicle photo and info
- ✅ Two clear action buttons
- ✅ Links to existing forms (no new forms)
- ✅ Mobile-responsive
- ✅ Creates leads in database
- ✅ Sends email notifications (existing flow)
- ✅ Sends SMS notifications (new)

### **Feature 2: SMS Notifications**
- ✅ SMS sent automatically when leads created
- ✅ SMS sent to configured phone numbers
- ✅ SMS content includes all relevant info
- ✅ SMS link works (opens lead in admin)
- ✅ Manual SMS sending works from admin
- ✅ Phone numbers can be managed in admin settings

---

## 🚀 **DEPLOYMENT STEPS**

### **1. Development Environment**
```bash
# Install Twilio package
npm install twilio

# Add environment variables to .env.local
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_number
```

### **2. Build and Test Locally**
```bash
# Run development server
npm run dev

# Test all features
# - Pop-up on vehicle pages
# - SMS sending
# - Admin dashboard
```

### **3. Deploy to Production**
```bash
# Commit changes
git add .
git commit -m "Add Talk to Sales Agent pop-up and SMS notifications"
git push

# Vercel will auto-deploy
# Add environment variables in Vercel dashboard
```

### **4. Post-Deployment**
- [ ] Verify environment variables in Vercel
- [ ] Test SMS sending on production
- [ ] Test pop-up on production
- [ ] Monitor for errors
- [ ] Check Twilio dashboard for usage

---

## 📝 **NOTES & CONSIDERATIONS**

### **Important:**
- **Twilio free trial**: $15.50 credit = 2,000 free SMS
- **After trial**: Pay-as-you-go, $0.0075 per SMS
- **Phone number**: $1/month (but free during trial)
- **No monthly minimum**: Only pay for what you use

### **Phone Number Format:**
- **Required format**: E.164 format
- **Example**: `+13137664475` (not `(313) 766-4475`)
- **Validation**: Validate phone numbers before sending SMS

### **Error Handling:**
- **Invalid phone numbers**: Show error, don't send SMS
- **Twilio API failures**: Log error, show user-friendly message
- **Rate limiting**: Twilio has rate limits, handle gracefully

### **Security:**
- **Never expose**: Twilio credentials in client-side code
- **Store securely**: Environment variables only
- **Validate input**: Phone numbers, message content

### **Performance:**
- **SMS sending**: Should be async (don't block lead creation)
- **Error handling**: Don't fail lead creation if SMS fails
- **Logging**: Log all SMS sends for debugging

---

## 🎯 **FINAL CHECKLIST BEFORE BUILDING**

- [ ] Twilio account created (new email)
- [ ] Twilio Account SID obtained
- [ ] Twilio Auth Token obtained
- [ ] Twilio phone number obtained
- [ ] Environment variables ready
- [ ] All files identified
- [ ] All dependencies known
- [ ] Design specifications clear
- [ ] Testing plan ready
- [ ] Deployment plan ready

---

## 📞 **SUPPORT & TROUBLESHOOTING**

### **Common Issues:**

#### **SMS Not Sending:**
- Check Twilio credentials in environment variables
- Check phone number format (E.164)
- Check Twilio account balance
- Check Twilio logs in dashboard

#### **Pop-Up Not Appearing:**
- Check component is imported
- Check button click handler
- Check state management
- Check browser console for errors

#### **Phone Numbers Not Saving:**
- Check database connection
- Check SQL query
- Check form submission
- Check API endpoint

---

## ✅ **READY TO BUILD**

**Status**: ✅ All requirements defined  
**Twilio Account**: Ready to set up  
**Timeline**: Build today  
**Next Step**: Start building!  

---

**This document is the complete reference for building these features. Use it as a guide throughout the build process.**

**Last Updated**: January 2025  
**Version**: 1.0

