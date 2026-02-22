# 🚀 NOMAD BIHARI - REAL-TIME OTP & OAUTH SETUP GUIDE

## ✅ STEP 1: CONFIGURE EMAIL OTP (Gmail SMTP)

### Option A: Using Your Personal Gmail
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification" (if not already enabled)
3. Go to https://myaccount.google.com/apppasswords
4. Select "Mail" and "Windows Computer"
5. Google will generate a 16-character password (e.g., `abcd efgh ijkl mnop`)
6. Copy this password (without spaces)

### Update .env File:
```
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="abcdefghijklmnop"
```

**Example:**
```
EMAIL_USER="gupta.rahul.hru@gmail.com"
EMAIL_PASS="abcdefghijklmnop"
```

---

## ✅ STEP 2: VERIFY TWILIO SMS (Already Configured)

Your Twilio credentials are already set:
- `TWILIO_ACCOUNT_SID`: ACfe577d80892839c403e0e94fae4f69f7
- `TWILIO_AUTH_TOKEN`: 552bb757e4499e64dec6e563e99a33b1
- `TWILIO_PHONE_NUMBER`: +916209980667

**SMS OTP is ready to use!**

---

## ✅ STEP 3: SETUP GOOGLE OAUTH

### Create Google OAuth App:
1. Go to https://console.cloud.google.com
2. Create a new project (name: "Nomad Bihari")
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Choose "Web application"
6. Add Authorized redirect URIs:
   ```
   http://localhost:5001/api/auth/google/callback
   ```
7. Copy the Client ID and Client Secret

### Update .env File:
```
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
GOOGLE_REDIRECT_URI="http://localhost:5001/api/auth/google/callback"
```

---

## ✅ STEP 4: SETUP FACEBOOK OAUTH

### Create Facebook OAuth App:
1. Go to https://developers.facebook.com
2. Create a new app (type: "Consumer")
3. Add "Facebook Login" product
4. Go to Settings → Basic and copy App ID and App Secret
5. Go to Settings → Basic → Add Platform "Website"
6. Set Site URL: `http://localhost:5001`
7. Go to Products → Facebook Login → Settings
8. Add Valid OAuth Redirect URIs:
   ```
   http://localhost:5001/api/auth/facebook/callback
   ```

### Update .env File:
```
FACEBOOK_CLIENT_ID="YOUR_FACEBOOK_APP_ID"
FACEBOOK_CLIENT_SECRET="YOUR_FACEBOOK_APP_SECRET"
FACEBOOK_REDIRECT_URI="http://localhost:5001/api/auth/facebook/callback"
```

---

## ✅ STEP 5: SETUP LINKEDIN OAUTH

### Create LinkedIn OAuth App:
1. Go to https://www.linkedin.com/developers/apps
2. Create a new app
3. Copy Client ID and Client Secret
4. Go to Auth tab
5. Add Authorized redirect URIs:
   ```
   http://localhost:5001/api/auth/linkedin/callback
   ```

### Update .env File:
```
LINKEDIN_CLIENT_ID="YOUR_LINKEDIN_CLIENT_ID"
LINKEDIN_CLIENT_SECRET="YOUR_LINKEDIN_CLIENT_SECRET"
LINKEDIN_REDIRECT_URI="http://localhost:5001/api/auth/linkedin/callback"
```

---

## 🧪 TESTING CHECKLIST

### Test Email OTP:
- [ ] Go to http://localhost:5001/pages/signup.html
- [ ] Enter email address
- [ ] Click "Send Email OTP"
- [ ] Check your email inbox for OTP
- [ ] Enter OTP and verify

### Test SMS OTP:
- [ ] Go to http://localhost:5001/pages/signup.html
- [ ] Enter phone number (format: +91 XXXXXXXXXX)
- [ ] Click "Send Phone OTP"
- [ ] Check your phone for SMS
- [ ] Enter OTP and verify

### Test Complete Signup:
- [ ] Fill all fields (Name, Email, Phone, DOB)
- [ ] Send Email OTP and verify
- [ ] Send Phone OTP and verify
- [ ] Click "Create Account"
- [ ] Should redirect to dashboard with token

### Test Login:
- [ ] Go to http://localhost:5001/pages/signin.html
- [ ] Enter User ID and Password (or Email)
- [ ] Click "Sign In"
- [ ] Should redirect to dashboard

### Test Social Login:
- [ ] Go to http://localhost:5001/pages/signup.html
- [ ] Click "Google" button → Should redirect to Google login
- [ ] Click "Facebook" button → Should redirect to Facebook login
- [ ] Click "LinkedIn" button → Should redirect to LinkedIn login
- [ ] After login → Should redirect to dashboard

---

## 📋 QUICK REFERENCE

### File to Edit:
`c:\Users\rgupt\OneDrive\Desktop\NomadBihari\backend\.env`

### Current Configuration:
```
PORT="3000"
NODE_ENV="development"
MONGODB_URI="mongodb://localhost:27017/nomad_bihari"
JWT_SECRET="91dab645891e0cdc0f4ed66061133b2e489845705e04ac2101fe6531f270cde9c155ff18644851f8b261fca2bde645dc358d705a9e9e616dc4832c74b74c765c"

# NEEDS SETUP:
EMAIL_USER="gupta.rahul.hru@gmail.com"
EMAIL_PASS="<16-char-app-password>"

GOOGLE_CLIENT_ID="<GET-FROM-GOOGLE-CONSOLE>"
GOOGLE_CLIENT_SECRET="<GET-FROM-GOOGLE-CONSOLE>"

FACEBOOK_CLIENT_ID="<GET-FROM-FACEBOOK-DEVELOPERS>"
FACEBOOK_CLIENT_SECRET="<GET-FROM-FACEBOOK-DEVELOPERS>"

LINKEDIN_CLIENT_ID="<GET-FROM-LINKEDIN-DEVELOPERS>"
LINKEDIN_CLIENT_SECRET="<GET-FROM-LINKEDIN-DEVELOPERS>"

# ALREADY CONFIGURED (Keep As Is):
TWILIO_ACCOUNT_SID="ACfe577d80892839c403e0e94fae4f69f7"
TWILIO_AUTH_TOKEN="552bb757e4499e64dec6e563e99a33b1"
TWILIO_PHONE_NUMBER="+916209980667"
```

---

## 🔧 NEXT STEPS

1. ✅ Update .env with Gmail credentials
2. ✅ Restart Node.js server
3. ✅ Test email OTP delivery
4. ✅ Configure Google OAuth (optional but recommended)
5. ✅ Configure Facebook OAuth (optional but recommended)
6. ✅ Configure LinkedIn OAuth (optional but recommended)
7. ✅ Test complete signup/login flow
8. ✅ Test social OAuth login

---

## 🐛 TROUBLESHOOTING

### Email OTP Not Sending?
- Check .env: EMAIL_USER and EMAIL_PASS should NOT have "YOUR_"
- App Password must be 16 characters without spaces
- Gmail account must have 2FA enabled
- Check server console for error messages

### SMS OTP Not Working?
- Verify Twilio credentials are correct
- Ensure phone number includes country code (+91 for India)
- Check Twilio account has sufficient balance
- Verify phone number is in correct E.164 format

### Social Login Not Working?
- Check OAuth credentials in .env (should NOT have "YOUR_")
- Ensure redirect URIs match exactly (including http:// vs https://)
- Check browser console for error messages
- Verify OAuth app is in active status

---

## 📱 TEST ACCOUNTS

After setup, you can test with:

**User Signup via Email OTP:**
- Email: test@example.com
- Phone: +91 9876543210
- OTP: Check email/SMS

**Admin Login:**
- Email: gupta.rahul.hru@gmail.com
- Password: Admin1-9525.com

---

**Status: Ready for Real-Time Testing! 🚀**
