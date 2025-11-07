# 🚀 Quick Reference - Build Plan

**File to Reference**: `BUILD_PLAN_COMPLETE.md` (full details)

---

## ✅ **WHAT WE'RE BUILDING**

1. **"Talk to a Sales Agent" Pop-Up** - On vehicle pages, shows vehicle info, links to forms
2. **SMS Notifications** - Auto SMS to your phone/Glover's phone when leads come in
3. **SMS to Reps** - Button in admin to send SMS to reps with lead details

---

## 📁 **FILES TO CREATE**

1. `src/components/TalkToSalesAgent.tsx` - Pop-up component
2. `src/app/api/sms/send/route.ts` - SMS API endpoint

---

## 📝 **FILES TO MODIFY**

1. `src/app/inventory/[id]/page.tsx` - Add pop-up button
2. `src/app/admin/leads/page.tsx` - Add "Send via SMS" button
3. `src/app/admin/settings/page.tsx` - Add SMS phone number settings
4. `src/lib/sms.ts` - Replace with Twilio integration
5. `src/app/api/leads/route.ts` - Add SMS notification after lead creation
6. `src/app/api/applications/route.ts` - Add SMS notification
7. `src/app/api/financing/apply/route.ts` - Add SMS notification
8. `src/app/api/appointments/route.ts` - Add SMS notification

---

## 🔧 **SETUP STEPS**

1. **Twilio Account**: Create new account with different email
2. **Get Credentials**: Account SID, Auth Token, Phone Number
3. **Environment Variables**: Add to `.env.local` and Vercel
4. **Install Package**: `npm install twilio`
5. **Database**: Add `sms_phone_numbers` column to `dealers` table

---

## 🎯 **KEY FEATURES**

- **Pop-Up**: Mobile-friendly, shows vehicle, links to forms
- **Auto SMS**: Sent when leads created (to configured phones)
- **Manual SMS**: Send from admin dashboard to any phone
- **Phone Settings**: Manage phone numbers in admin settings

---

## ✅ **CHECKLIST**

- [ ] Twilio account created
- [ ] Environment variables set
- [ ] Twilio package installed
- [ ] Database updated
- [ ] Pop-up component created
- [ ] SMS API created
- [ ] Admin settings updated
- [ ] Lead APIs updated
- [ ] Testing complete
- [ ] Deployed to production

---

**Full details in**: `BUILD_PLAN_COMPLETE.md`

