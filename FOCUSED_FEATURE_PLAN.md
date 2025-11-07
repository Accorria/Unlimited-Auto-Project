# 🎯 Focused Feature Plan - Two Simple Additions

## ✅ **What We're Building**

**NOT Aquaria. NOT AI chatbot. Just two simple features:**

1. **"Talk to a Sales Agent" pop-up** on vehicle detail pages
2. **"Send via SMS" button** in admin lead view

---

## 📱 **Feature 1: "Talk to a Sales Agent" Pop-Up**

### **Location**
- Vehicle detail page (`/inventory/[id]`)
- Mobile-friendly pop-up that opens when clicked

### **What It Shows**
- Vehicle photo (cover photo)
- Year, Make, Model, Price
- Two action buttons:
  1. **Schedule Test Drive** → Date & Time picker
  2. **Start Pre-Approval** → Quick info form → Full credit app

### **What Happens When Submitted**

#### **Option 1: Schedule Test Drive**
- Creates/updates Lead in database
- Creates Appointment in database
- Sends email notification to `unlimitedautoredford@gmail.com` (existing flow)
- Shows success message to customer

#### **Option 2: Start Pre-Approval**
- Collects: Name, Phone, Email
- Creates/updates Lead in database
- Redirects to full credit application form (`/credit-application`) with pre-filled data
- Sends email notification (existing flow)

### **Technical Implementation**
- New component: `TalkToSalesAgent.tsx`
- Mobile-first design (big tap targets, no horizontal scroll)
- Uses existing `/api/appointments` endpoint
- Uses existing `/api/leads` endpoint
- Integrates with existing `AppointmentScheduler` component

---

## 📲 **Feature 2: "Send via SMS" Button**

### **Location**
- Admin lead detail view (`/admin/leads`)
- Inside the lead detail modal/page

### **What It Does**
- Button: **"Send via SMS"**
- Opens a simple form:
  - Pick a rep's phone number (dropdown) OR
  - Type a phone number manually
  - Optional: Reassign lead to that rep

### **SMS Content**
```
🚗 New Lead: [Customer Name]
📞 Phone: [Phone Number]
🚗 Vehicle: [Vehicle Info if available]
🔗 View: [Short link to lead details]
```

### **What Happens**
- Sends SMS to selected phone number
- Optionally updates lead's `assigned_to` field
- Shows success message
- Logs SMS send in database (optional)

### **Technical Implementation**
- Add SMS button to lead detail view
- Create `/api/sms/send` endpoint
- Use Twilio (or similar SMS service) - Resend doesn't support SMS
- Store SMS provider credentials in environment variables

---

## 🔧 **Technical Details**

### **What Already Exists**
- ✅ Appointment creation API (`/api/appointments`)
- ✅ Lead creation/update API (`/api/leads`)
- ✅ Email notification system (Resend)
- ✅ Vehicle detail page structure
- ✅ Admin lead management page
- ✅ `AppointmentScheduler` component

### **What Needs to Be Built**
1. **`TalkToSalesAgent.tsx` component**
   - Pop-up modal
   - Vehicle info display
   - Two action buttons
   - Mobile-responsive

2. **SMS sending functionality**
   - `/api/sms/send` endpoint
   - Twilio integration (or similar)
   - SMS button in lead detail view

3. **Environment variables**
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER` (your business number)

---

## 📋 **Implementation Steps**

### **Step 1: "Talk to a Sales Agent" Pop-Up**
1. Create `TalkToSalesAgent.tsx` component
2. Add button to vehicle detail page
3. Integrate with existing appointment/lead APIs
4. Test on mobile device

### **Step 2: "Send via SMS" Button**
1. Set up Twilio account (or similar SMS service)
2. Create `/api/sms/send` endpoint
3. Add SMS button to lead detail view
4. Add phone number picker (from users table or manual entry)
5. Test SMS sending

---

## 🎨 **Design Requirements**

### **Mobile First**
- Big tap targets (min 44x44px)
- No horizontal scroll
- Fits within viewport
- Touch-friendly interactions

### **Existing UI Integration**
- Matches current design system
- Uses existing Tailwind classes
- Consistent with admin dashboard style
- No major redesign needed

---

## ✅ **Success Criteria**

1. ✅ Customer can click "Talk to a Sales Agent" on vehicle page
2. ✅ Pop-up opens with vehicle info and two clear options
3. ✅ Customer can schedule test drive or start pre-approval
4. ✅ Lead is created/updated in database
5. ✅ Email notification is sent (existing flow)
6. ✅ Admin can click "Send via SMS" on any lead
7. ✅ SMS is sent to selected phone number
8. ✅ Lead can be reassigned during SMS send
9. ✅ Everything works perfectly on mobile

---

## 🚫 **What We're NOT Building**

- ❌ AI chatbot
- ❌ Aquaria features
- ❌ Blockchain
- ❌ Agent network
- ❌ Cross-platform posting
- ❌ Negotiation AI
- ❌ Complex routing logic (for now)
- ❌ Automated lead assignment (for now)

---

## 📝 **Next Steps**

1. **Confirm this plan** - Does this match what you want?
2. **Choose SMS provider** - Twilio, or do you have a preference?
3. **Start building** - I'll create the components and APIs

---

**Ready to proceed?** 🚀

