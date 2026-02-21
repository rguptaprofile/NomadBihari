# Quick Test Guide - Automatic Signup System

## 🚀 Quick Start Testing

### Prerequisites:
1. Backend server running on `http://localhost:5000`
2. Frontend server running on `http://localhost:8000`
3. MySQL database running with `nomad_bihari` database

### Test Case 1: Basic Signup

**Steps:**
1. Go to: `http://localhost:8000/frontend/pages/signup.html`
2. Fill the form:
   ```
   First Name: Rahul
   Last Name: Gupta
   Email: rahul.test@gmail.com
   Phone: 9876543210
   Date of Birth: 1995-05-15
   ```
3. Check "I agree to Terms & Conditions"
4. Click "Create Account"

**Expected Results:**
- ✅ See loading message "खाता बनाया जा रहा है..."
- ✅ Success message appears: "🎉 स्वागत है! खाता सफलतापूर्वक बनाया गया"
- ✅ Shows: "अपने ईमेल की जांच करें"
- ✅ Auto-redirect to signin page after 5 seconds
- ✅ Can see in browser console: "✅ Signup successful: {data}"
- ✅ Credentials email instruction shown

**Backend Console Should Show:**
```
✅ Credentials email sent to rahul.test@gmail.com
(Or if email not configured: ⚠️ Email not sent but account created)
```

---

### Test Case 2: Verify Data in Database

**Using MySQL Client:**
```sql
-- Check if user was created
SELECT * FROM users WHERE email = 'rahul.test@gmail.com';

-- Expected Output:
id | first_name | last_name | email                 | phone       | user_id           | password_hash          | is_active | created_at
15 | Rahul      | Gupta     | rahul.test@gmail.com  | 9876543210  | RAH_ABC12_1234    | $2a$10$... (bcrypt)... | 1         | 2026-02-20 ...

-- Check activity log
SELECT * FROM activity_logs WHERE user_id = 15;

-- Expected Output:
id | user_id | activity_type | activity_description                           | created_at
... | 15      | SIGNUP        | User RAH_ABC12_1234 created account - rahul... | 2026-02-20 ...
```

---

### Test Case 3: Login with Auto-Generated Credentials

**Steps:**
1. Go to: `http://localhost:8000/frontend/pages/signin.html`
2. Login with:
   ```
   User ID: RAH_ABC12_1234 (from database or console)
   Password: [Check console or email]
   ```
3. Click "Sign In"

**Expected Results:**
- ✅ See success message "Login successful! Redirecting..."
- ✅ Redirected to user dashboard
- ✅ Dashboard loads with user name
- ✅ No auto-redirect back to signin
- ✅ Can access all dashboard features

---

### Test Case 4: Validation Tests

#### 4.1 Missing Required Field
**Steps:**
1. Leave "First Name" empty
2. Click "Create Account"

**Expected:**
- ❌ Error: "कृपया सभी फील्ड भरें (Please fill in all required fields)"

#### 4.2 Invalid Email
**Steps:**
1. Enter Email: "invalid-email"
2. Click "Create Account"

**Expected:**
- ❌ Error: "कृपया एक वैध ईमेल दर्ज करें"
- Field border turns red with error message

#### 4.3 Invalid Phone (not 10 digits)
**Steps:**
1. Enter Phone: "12345"
2. Click "Create Account"

**Expected:**
- ❌ Error: "कृपया 10-अंकीय फोन नंबर दर्ज करें"

#### 4.4 Age Too Young (< 13 years)
**Steps:**
1. Enter DOB: "2020-01-01" (too recent)
2. Click "Create Account"

**Expected:**
- ❌ Error: "आपकी आयु कम से कम 13 वर्ष होनी चाहिए"

#### 4.5 Duplicate Email
**Steps:**
1. Enter email from previous signup: "rahul.test@gmail.com"
2. Click "Create Account"

**Expected:**
- ❌ Error: "इस ईमेल या फोन नंबर से खाता पहले से मौजूद है"

#### 4.6 Didn't Accept Terms
**Steps:**
1. Fill all fields correctly
2. DON'T check "I agree to Terms & Conditions"
3. Click "Create Account"

**Expected:**
- ❌ Error: "कृपया नियम और शर्तें स्वीकार करें"

---

### Test Case 5: Real-time Field Validation

**Steps:**
1. Fill Email field: "invalid"
2. Click outside (blur event)

**Expected:**
- ❌ Field border turns red
- ❌ Error shows below: "कृपया एक वैध ईमेल दर्ज करें"

**Steps:**
1. Correct the email: "valid@email.com"
2. Click outside

**Expected:**
- ✅ Field border turns normal
- ✅ Error message disappears

---

### Test Case 6: Multiple Signups (Unique ID Generation)

**First Signup:**
```
Name: User One
Email: user1@test.com
Generated User ID: USR_ABC12_1234
```

**Second Signup:**
```
Name: User One (same first name)
Email: user2@test.com
Generated User ID: USR_DEF45_5678 (Different! Not identical)
```

**Expected:**
- ✅ Each user gets unique ID
- ✅ No collision, no duplicates
- ✅ Format: `FIRSTNAME_CODE_TIMESTAMP`

---

### Test Case 7: Backend API Direct Testing

Using curl or Postman:

```bash
curl -X POST http://localhost:5000/api/auth/auto-signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test123@example.com",
    "phone": "9876543210",
    "dob": "2000-01-15"
  }'
```

**Expected Response (Success):**
```json
{
  "message": "खाता सफलतापूर्वक बनाया गया",
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 17,
  "user_id": "TST_XYZ99_1234",
  "firstName": "Test",
  "lastName": "User",
  "email": "test123@example.com",
  "emailSent": false,
  "note": "कृपया अपने ईमेल की जांच करें..."
}
```

**Expected Response (Duplicate Error):**
```json
{
  "message": "इस ईमेल या फोन नंबर से खाता पहले से मौजूद है"
}
```

---

## 📊 Success Criteria Checklist

- [ ] User form has only 5 fields (no username, no password fields)
- [ ] Form validation works (real-time and on submit)
- [ ] User ID generated automatically and uniquely
- [ ] Password generated automatically and is secure
- [ ] Data saved to database immediately
- [ ] Activity logged in activity_logs table
- [ ] User can login with auto-generated credentials
- [ ] Dashboard accessible after login
- [ ] No bounce-back to signin (fixed in previous commit)
- [ ] Email shows in response/console (even if not sent)
- [ ] Error messages are helpful and bilingual
- [ ] Form resets after successful signup
- [ ] Auto-redirect works after 5 seconds

---

## 🔍 Debugging Tips

### If Signup Fails:

1. **Check Backend Logs:**
   ```
   Look for errors in terminal where server is running
   Should see: "✅ Credentials email sent to..." or the error
   ```

2. **Check Browser Console:**
   - Press F12 → Console tab
   - Should see: "✅ Signup successful: {data}"
   - Or error message

3. **Check Network Tab:**
   - Press F12 → Network tab
   - Look for POST request to `/api/auth/auto-signup`
   - Check response status and data

4. **Database Check:**
   ```sql
   SELECT * FROM users ORDER BY created_at DESC LIMIT 1;
   ```
   - Verify user was created
   - Check user_id is not NULL
   - Check password_hash is not NULL and starts with $2a$

5. **Activity Log Check:**
   ```sql
   SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 5;
   ```
   - Verify SIGNUP activity was logged

---

## 🐛 Common Issues & Solutions

### Issue 1: "All fields are required" even though all filled
**Solution:**
- Check date picker format - should be YYYY-MM-DD
- Check phone has exactly 10 digits

### Issue 2: Email not received
**Solution:**
- Email service not configured in .env (normal for development)
- Check console for: "⚠️ Email not sent to ... but account created successfully"
- Login still works with credentials from console/alert

### Issue 3: Can't login after signup
**Solution:**
- Verify user_id format in database (should be like RAH_ABC12_1234)
- Try with the exact user_id from database
- Check password in database is bcrypt hash (starts with $2a$)
- Verify password from console when you signed up

### Issue 4: Form keeps showing loading state
**Solution:**
- Check if backend server is running on port 5000
- Check browser console for network errors
- Verify API endpoint path is correct

### Issue 5: Page redirects back to signin
**Solution:**
- This was fixed in previous commit
- Check that dashboard.js has the URL parameter logic
- Try clearing browser cache/cookies and retry

---

## ✅ Final Verification

1. **Open Database Client:**
   ```sql
   SELECT COUNT(*) FROM users;
   ```
   - Should show 1+ users from your signups

2. **Check User ID Format:**
   ```sql
   SELECT user_id FROM users WHERE email = 'your-test@email.com';
   ```
   - Should see format like: ABC_XYZ12_1234

3. **Check Password Hash:**
   ```sql
   SELECT password_hash FROM users LIMIT 1;
   ```
   - Should start with: $2a$10$...

4. **Check Activity Log:**
   ```sql
   SELECT * FROM activity_logs WHERE activity_type = 'SIGNUP';
   ```
   - Should see your signup activities

5. **Test Complete Flow:**
   - Signup ✓ → Check Email ✓ → Login ✓ → Dashboard ✓

---

## 📝 Notes

- All error messages are in Hindi + English
- Console logs available for debugging
- Email is optional (can work without email service)
- Password is secure with 8 characters, uppercase, lowercase, number, special char
- User ID is globally unique across all users
- All data is real-time in database

Happy Testing! 🎉
