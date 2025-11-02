# Lead Capture Testing Guide

## Quick Test Checklist

### Test 1: Incomplete Lead Capture (Name Only)
1. Go to: http://localhost:3000/credit-application
2. Open browser console (F12 → Console tab)
3. **Fill in ONLY the first name field** (e.g., "John")
4. **Check console** - You should see:
   - `📝 trackIncompleteLead called: {formStep: 'applicant_name', firstName: 'John', ...}`
   - `📤 Sending tracking data: {...}`
   - `✅ Tracking response: {success: true, ...}`
5. **Check your email** - Should receive: "🚨 Incomplete Lead: John"
6. **Wait 2 seconds, then check admin dashboard** - Lead should appear with status "Incomplete"

### Test 2: Incomplete Lead Capture (Name + Email)
1. **Continue from Test 1** or start fresh
2. Fill in:
   - First name: "John"
   - Last name: "Doe"
   - Email: "john.doe@test.com"
3. **DO NOT submit the form**
4. **Check console** - Should see multiple tracking calls
5. **Check your email** - Should receive updated lead notification (or new one)
6. **Check admin dashboard** - Lead should have name AND email

### Test 3: Incomplete Lead Capture (Name + Phone)
1. Fill in:
   - First name: "Jane"
   - Last name: "Smith"
   - Home Phone: "555-123-4567" (must have at least 10 digits)
2. **DO NOT submit the form**
3. **Check console** - Should see tracking when phone reaches 10 digits
4. **Check your email** - Should receive lead notification
5. **Check admin dashboard** - Lead should have name AND phone

### Test 4: Complete Lead Capture (Full Form Submission)
1. Fill out the **ENTIRE** pre-approval form completely
2. Click **"Submit Pre-approval"** button
3. **Check console** - Should see form submission
4. **Check your email** - Should receive: "New Pre-approval Application Received!"
5. **Check admin dashboard** - Should see complete application with all data

### Test 5: Update Existing Incomplete Lead
1. Fill in first name: "Bob"
2. Wait 2 seconds, check dashboard - Lead created
3. **Without submitting**, add email: "bob@test.com"
4. **Check console** - Should show lead update (not new lead)
5. **Check admin dashboard** - Same lead should now have email added
6. **Check your email** - Should receive "Incomplete Lead Updated: Bob"

## What to Look For

### ✅ Success Indicators:
- Console logs show `📝 trackIncompleteLead called` with correct data
- Console shows `✅ Tracking response: {success: true}`
- Email notifications arrive (check spam folder)
- Admin dashboard shows leads with correct information
- Incomplete leads have status: "new" and source: "website_incomplete"
- Complete applications have full form data in email

### ❌ Failure Indicators:
- Console shows `❌ Tracking failed` or errors
- No email notifications received
- Admin dashboard doesn't show leads
- Missing name, email, or phone in captured leads
- Duplicate leads created instead of updating existing

## Debugging Tips

### If incomplete leads aren't being captured:
1. Open browser console (F12)
2. Look for error messages
3. Check Network tab → Look for `/api/leads/track` requests
4. Verify the request body contains `firstName`, `email`, or `phone`
5. Check server logs (terminal where `npm run dev` is running)

### If emails aren't being sent:
1. Check spam/junk folder
2. Verify Resend API key is set in environment variables
3. Check server console for email errors
4. Look for `❌ Error sending email notification` in logs

### If leads appear in dashboard but missing data:
1. Check the "Notes" column in admin dashboard
2. Verify the lead has `name`, `email`, or `phone` fields populated
3. Check if lead is marked as `incompleteApplication: true` in notes

## Expected Console Output

```
📝 trackIncompleteLead called: {
  formStep: 'applicant_name',
  firstName: 'John',
  lastName: '',
  email: '',
  phone: ''
}
📤 Sending tracking data: {
  firstName: 'John',
  lastName: '',
  phone: '',
  email: '',
  formStep: 'applicant_name',
  source: 'credit_application'
}
✅ Tracking response: {success: true, leadId: '...', message: 'Lead tracked successfully'}
```

## Admin Dashboard Check

Go to your admin dashboard and look for:
- **Name**: Should show the name entered
- **Email**: Should show email if provided
- **Phone**: Should show phone if provided
- **Source**: Should be "website_incomplete"
- **Status**: Should be "new"
- **Notes**: Should contain JSON with `incompleteApplication: true`

