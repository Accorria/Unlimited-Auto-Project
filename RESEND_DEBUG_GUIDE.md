# Resend Email Debugging Guide

## 🚨 Issue: Emails Not Arriving

**Symptoms:**
- App shows "Success! Application submitted"
- No emails arriving in Gmail inbox
- Resend logs show last email was 2+ days ago
- Resend dashboard shows emails as "Delivered" but you're not receiving them

---

## 🔍 **Step 1: Check Environment Variables**

### **Local (.env.local):**
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### **Vercel Production:**
1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Check if `RESEND_API_KEY` is set
3. Make sure it's set for **Production**, **Preview**, and **Development**

### **Verify the Key:**
1. Go to [Resend Dashboard](https://resend.com)
2. **API Keys** → Check if your key exists
3. Copy the key from Resend
4. Compare with what's in Vercel

---

## 🔍 **Step 2: Check Server Logs**

### **In Vercel:**
1. **Deployments** → Click on latest deployment
2. **Logs** tab → Look for:
   - `⚠️ Resend API key not configured`
   - `❌ Error sending email notification`
   - `✅ Email notification sent successfully`

### **What to Look For:**
- ✅ `Attempting to send email notification via Resend...` - Good, code is running
- ✅ `✅ Email notification sent successfully` - Email was sent to Resend
- ⚠️ `⚠️ Resend API key not configured` - **KEY IS MISSING** - Fix this!
- ❌ `❌ Error sending email notification` - **Resend API rejected it** - Check key validity

---

## 🔍 **Step 3: Check Resend Dashboard**

### **In Resend Dashboard:**
1. Go to **Emails** tab
2. Check if emails are showing up
3. Look at **Status**:
   - **Delivered** = Resend sent it (but you might not receive it)
   - **Failed** = Resend couldn't send it
   - **No emails** = Code never called Resend

### **If Emails Show as "Delivered" But You're Not Getting Them:**
1. Check **Spam folder** in Gmail
2. Check Gmail **All Mail** folder
3. Search Gmail for: `from:onboarding@resend.dev`
4. Check if Gmail is filtering them
5. Try a different email address to test

---

## 🔧 **Common Fixes**

### **Fix 1: RESEND_API_KEY Not Set in Vercel**
**Problem:** Key is in `.env.local` but not in Vercel

**Solution:**
1. Copy key from `.env.local`
2. Vercel → **Settings** → **Environment Variables**
3. Add `RESEND_API_KEY` = `your_key_here`
4. Set for: Production, Preview, Development
5. **Redeploy** the latest deployment

### **Fix 2: Invalid API Key**
**Problem:** Key is wrong or expired

**Solution:**
1. Resend Dashboard → **API Keys**
2. **Create New API Key**
3. Copy new key
4. Update in Vercel
5. **Redeploy**

### **Fix 3: Emails Going to Spam**
**Problem:** Resend is sending, but Gmail is filtering

**Solution:**
1. Check Gmail spam folder
2. Mark as "Not Spam"
3. Add `onboarding@resend.dev` to contacts
4. Consider verifying a domain in Resend (advanced)

### **Fix 4: Code Not Calling Resend**
**Problem:** `resend` is `null` because key check failed

**Solution:**
- Check Vercel logs for `⚠️ Resend API key not configured`
- Verify `RESEND_API_KEY` is set correctly
- Make sure no typos in environment variable name

---

## 🧪 **Test Email Sending**

### **Test Locally:**
1. Make sure `.env.local` has `RESEND_API_KEY`
2. Restart dev server: `npm run dev`
3. Submit a test form on `localhost:3000`
4. Check terminal logs for email status
5. Check Resend dashboard for new email

### **Test on Production:**
1. Submit a test form on live site
2. Check Vercel **Logs** tab
3. Check Resend **Emails** tab
4. Check your Gmail inbox + spam

---

## 📊 **Debugging Checklist**

- [ ] `RESEND_API_KEY` set in `.env.local`
- [ ] `RESEND_API_KEY` set in Vercel (Production, Preview, Development)
- [ ] API key is valid (check in Resend dashboard)
- [ ] Latest deployment has environment variables
- [ ] Checked Vercel logs for errors
- [ ] Checked Resend dashboard for emails
- [ ] Checked Gmail inbox (including spam)
- [ ] Searched Gmail for `from:onboarding@resend.dev`
- [ ] Tried test form submission
- [ ] Checked server logs for `✅ Email sent` or `❌ Error`

---

## 🎯 **Quick Fix Steps**

1. **Copy your Resend API key** from Resend dashboard
2. **Go to Vercel** → Your Project → Settings → Environment Variables
3. **Add/Update** `RESEND_API_KEY` = `your_key_here`
4. **Redeploy** latest deployment
5. **Test** by submitting a form
6. **Check** Resend dashboard for new email
7. **Check** Gmail inbox + spam

---

## 💡 **Pro Tip: Better Error Visibility**

The code now logs:
- `✅ Email notification sent successfully` - If email sent
- `❌ Error sending email notification` - If Resend rejected it
- `⚠️ Resend API key not configured` - If key is missing

Check your Vercel logs to see which one appears!

