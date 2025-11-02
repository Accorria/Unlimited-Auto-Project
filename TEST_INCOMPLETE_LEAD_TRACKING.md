# Testing Incomplete Lead Tracking

## 🧪 **How to Test Incomplete Lead Capture**

Follow these steps to verify that incomplete leads are being captured with name and email (even if they don't finish the form).

---

## **Test Setup**

1. **Open Browser Console** - Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
   - Go to the **Console** tab
   - Keep it open while testing

2. **Open Admin Dashboard** - Go to `http://localhost:3000/admin/leads` in another tab
   - Login if needed
   - Watch for new leads appearing

3. **Check Your Email** - Make sure you're monitoring `unlimitedautoredford@gmail.com`

---

## **Test Scenarios**

### **Test 1: Name Only**
**Goal:** Verify that entering just a name captures the lead

**Steps:**
1. Go to `http://localhost:3000/credit-application`
2. Type only your first name in the "First Name" field
3. Click away or click another field
4. **Do NOT submit the form**

**Expected Results:**
- ✅ Browser console shows: `Error tracking incomplete lead` or API call made
- ✅ Admin dashboard shows new lead with just your name
- ✅ You receive an email with: Name (your name), Email: "No email provided", Phone: "No phone provided"

---

### **Test 2: Name + Email**
**Goal:** Verify that entering name and email captures both

**Steps:**
1. Go to `http://localhost:3000/credit-application`
2. Type your first name
3. Type your last name  
4. Type your email address
5. **Do NOT fill out any other fields**
6. **Do NOT submit the form**
7. Click away or refresh the page

**Expected Results:**
- ✅ Browser console shows API calls being made
- ✅ Admin dashboard shows lead with your name and email
- ✅ You receive an email with: Name (your full name), Email (your email), Phone: "No phone provided"
- ✅ If you previously entered just name, the lead should be UPDATED (not duplicated)

---

### **Test 3: Name + Email + Phone**
**Goal:** Verify all contact info is captured

**Steps:**
1. Go to `http://localhost:3000/credit-application`
2. Enter first name
3. Enter last name
4. Enter email address
5. Enter phone number
6. **Do NOT submit the form**
7. Close the tab or navigate away

**Expected Results:**
- ✅ Admin dashboard shows complete lead with name, email, and phone
- ✅ You receive an email with all three: Name, Email, Phone
- ✅ Lead is either created new OR updated if you already had a lead

---

### **Test 4: Enter Name First, Then Email Later**
**Goal:** Verify lead updates (not duplicates)

**Steps:**
1. Go to `http://localhost:3000/credit-application`
2. Enter only your first name
3. Wait 2-3 seconds (let it capture)
4. Check admin dashboard - you should see a lead with just name
5. Go back to the form
6. Now enter your email
7. Wait 2-3 seconds
8. Check admin dashboard again

**Expected Results:**
- ✅ First: Lead appears with just name
- ✅ Second: Same lead is UPDATED with email (not a new lead created)
- ✅ You receive TWO emails:
  - First: "Incomplete Lead: [Your Name]" (with no email)
  - Second: "Incomplete Lead Updated: [Your Name]" (with email added)

---

## **What to Check**

### **1. Browser Console** 
Look for these messages:
- If tracking is working: You'll see network requests to `/api/leads/track`
- If there are errors: You'll see error messages

### **2. Admin Dashboard**
Go to: `http://localhost:3000/admin/leads`

Look for:
- New leads with source: `website_incomplete`
- Leads showing name, email, phone (as filled)
- Leads with status: `new`

### **3. Email Inbox**
Check: `unlimitedautoredford@gmail.com`

Look for emails with subject:
- `🚨 Incomplete Lead: [Name]`
- `🚨 Incomplete Lead Updated: [Name]`

Email should show:
- ✅ **Name** (even if just first name)
- ✅ **Email** (if entered, or "No email provided")
- ✅ **Phone** (if entered, or "No phone provided")

### **4. API Response**
In browser console, check:
- Network tab → Look for POST to `/api/leads/track`
- Should show status 200
- Response should show: `{ success: true, leadId: "..." }`

---

## **Quick Test Checklist**

- [ ] Enter name only → Lead created with name
- [ ] Enter name + email → Lead shows name AND email
- [ ] Enter name + email + phone → Lead shows all three
- [ ] Enter name first, then email → Lead updates (not duplicates)
- [ ] Email notification received with name and email
- [ ] Lead appears in admin dashboard
- [ ] No console errors

---

## **Troubleshooting**

### **No Lead Appearing?**
1. Check browser console for errors
2. Check network tab - is API call being made?
3. Check server logs for API errors
4. Verify RESEND_API_KEY is set in environment

### **Email Not Received?**
1. Check spam folder
2. Verify email is going to: `unlimitedautoredford@gmail.com`
3. Check server console for email sending errors
4. Verify RESEND_API_KEY is configured

### **Lead Not Updating?**
1. Check if existing lead exists (by name/email/phone match)
2. Look at admin dashboard - does it show multiple leads?
3. Check API logs for matching logic

---

## **Expected Behavior Summary**

**When someone:**
- Types **name** → Lead created with name, email notification sent
- Types **email** → Lead updated with email, email notification sent (or lead created if no name yet)
- Types **phone** → Lead updated with phone, email notification sent (or lead created)

**You get:**
- ✅ Lead in database immediately
- ✅ Email notification immediately
- ✅ Name AND email (even if they don't finish form)

---

*Last Updated: January 2025*

