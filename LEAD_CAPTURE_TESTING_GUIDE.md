# Lead Capture Testing Guide

## 🧪 Pre-Launch Testing Checklist

### 1. Vehicle Upload Testing (Localhost)
- [ ] Upload a test vehicle with photos
- [ ] Verify photos save to Supabase Storage
- [ ] Check vehicle appears in inventory
- [ ] Test vehicle editing functionality
- [ ] Verify vehicle deletion works

### 2. Lead Capture Form Testing

#### Contact Form (`/contact`)
- [ ] Fill out contact form
- [ ] Check lead appears in admin dashboard
- [ ] Verify email notification sent
- [ ] Test with vehicle interest pre-filled

#### Finance Application (`/finance`)
- [ ] Complete full finance application
- [ ] Test incomplete application tracking
- [ ] Verify all fields save correctly
- [ ] Check lead status updates

#### Credit Application (`/credit-application`)
- [ ] Test comprehensive credit form
- [ ] Verify document upload (if applicable)
- [ ] Check lead data completeness
- [ ] Test form validation

#### Professional Credit App (`/professional-credit-application`)
- [ ] Test business credit application
- [ ] Verify business-specific fields
- [ ] Check lead categorization

### 3. Lead Management Testing
- [ ] View leads in admin dashboard (`/admin/leads`)
- [ ] Test lead status updates
- [ ] Verify lead filtering and search
- [ ] Check lead analytics (`/admin/analytics`)

### 4. Production Deployment Testing
- [ ] Deploy to production
- [ ] Test all forms on live site
- [ ] Verify email notifications work
- [ ] Check lead data in production Supabase
- [ ] Test with real phone numbers/emails

## 📊 Lead Capture URLs for Testing

### Main Forms:
- **Contact:** `https://yourdomain.com/contact`
- **Finance:** `https://yourdomain.com/finance`
- **Credit App:** `https://yourdomain.com/credit-application`
- **Professional:** `https://yourdomain.com/professional-credit-application`

### With Vehicle Interest:
- **Contact with Vehicle:** `https://yourdomain.com/contact?vehicle=2021-Chrysler-Voyager`
- **Finance with Vehicle:** `https://yourdomain.com/finance?vehicle=2021-Chrysler-Voyager`

## 🔍 Lead Verification Process

### Check Admin Dashboard:
1. Go to `/admin/leads`
2. Look for new leads with status "new"
3. Check lead details and notes
4. Verify contact information is complete

### Check Supabase Database:
1. Go to Supabase Dashboard
2. Navigate to `leads` table
3. Check for new entries
4. Verify data completeness

### Check Email Notifications:
1. Check dealer email for notifications
2. Verify lead details in email
3. Test email formatting

## 🚀 Go-Live Checklist

### Before Launch:
- [ ] All forms tested locally
- [ ] Vehicle upload system working
- [ ] Lead capture verified
- [ ] Email notifications working
- [ ] Admin dashboard functional

### After Launch:
- [ ] Test all forms on live site
- [ ] Verify leads are being captured
- [ ] Check email notifications
- [ ] Monitor for any errors
- [ ] Test with real users

## 📱 Sharing Links

### For Testing:
- Share contact form link with friends/family
- Ask them to fill out basic information
- Monitor leads in admin dashboard
- Test different form paths

### For Real Leads:
- Share specific vehicle links
- Use UTM parameters for tracking
- Monitor lead quality and completion rates
- Follow up on captured leads

## 🎯 Lead Quality Tips

### High-Quality Leads:
- Pre-fill vehicle interest when possible
- Use specific service selections
- Include clear call-to-action buttons
- Make forms mobile-friendly

### Lead Follow-up:
- Check admin dashboard daily
- Respond to leads within 24 hours
- Use lead notes for context
- Track lead conversion rates
