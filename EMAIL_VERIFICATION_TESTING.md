# 🧪 Email Verification - Quick Testing Guide

**Last Updated:** November 14, 2025

---

## ⚡ Quick Test (5 Minutes)

### **Step 1: Create New Account**
```
1. Open: signup.html
2. Fill form with REAL email address
3. Click "Create Account"
4. ✅ Should see: "Please check your email to verify your account before logging in."
5. ✅ Should redirect to: index.html (login page)
```

### **Step 2: Try to Login (Should FAIL)**
```
1. On login page
2. Enter the email/password you just created
3. Click "Login"
4. ❌ Should see: "Please verify your email before logging in..."
5. ✅ Should see: "Resend verification email" link
6. ✅ Should stay on login page (NOT go to dashboard)
```

### **Step 3: Check Email Inbox**
```
1. Open your email inbox
2. Look for email from: "Barangay Mapulang Lupa"
3. Subject: "Verify your Email for Barangay Mapulang Lupa Borrowing Website Account"
4. ✅ Email should be there (check spam if not found)
```

### **Step 4: Verify Email**
```
1. Open the verification email
2. Click the blue "Verify Email" button
3. Browser opens Firebase verification page
4. ✅ Should see success message
5. Close verification page
```

### **Step 5: Login Again (Should SUCCEED)**
```
1. Return to login page
2. Enter same email/password
3. Click "Login"
4. ✅ Should successfully login
5. ✅ Should redirect to user.html (dashboard)
```

---

## 🔍 What to Check

### **Browser Console Logs (F12)**

**During Signup:**
```
✅ [Register] Creating user account for: test@example.com
✅ [Register] User account created: ABC123XYZ
✅ [Register] Display name updated: Juan Dela Cruz
✅ [Register] Verification email sent to: test@example.com
✅ [Register] User data saved to Firestore
✅ [Register] User signed out - must verify email before logging in
```

**During Failed Login (Unverified):**
```
✅ [Login] Attempting login for: test@example.com
✅ [Login] Authentication successful: ABC123XYZ
❌ [Login] Email not verified for: test@example.com
✅ [Login] User signed out due to unverified email
```

**During Successful Login (Verified):**
```
✅ [Login] Attempting login for: test@example.com
✅ [Login] Authentication successful: ABC123XYZ
✅ [Login] Email verified - login successful
✅ [Login] Redirecting to user dashboard...
```

---

## ❌ Common Mistakes

### **Mistake 1: Using Old Account**
- ❌ Testing with account created BEFORE this feature
- ✅ Must create NEW account AFTER code changes

### **Mistake 2: Wrong Email**
- ❌ Using fake/invalid email (won't receive verification)
- ✅ Use REAL email address you can access

### **Mistake 3: Not Checking Spam**
- ❌ Only checking inbox
- ✅ Check spam/junk folder for verification email

### **Mistake 4: Not Hard Refreshing**
- ❌ Testing without clearing cache
- ✅ Press Ctrl+Shift+R to hard refresh

### **Mistake 5: Not Clicking Verify Button**
- ❌ Just reading the email
- ✅ Must click the BLUE "Verify Email" button

---

## 🐛 Troubleshooting

### **Problem: Still can login without verifying**

**Check:**
1. Are you using a NEW account created after the code changes?
2. Did you hard refresh the browser? (Ctrl+Shift+R)
3. Check console - does it show `[Login] Email not verified`?
4. Is `sendEmailVerification` in the imports (line 9)?

**Solution:**
```javascript
// 1. Check line 9 of script.js has:
import { ..., sendEmailVerification } from "...firebase-auth.js";

// 2. Clear browser cache completely
// 3. Create brand new account with different email
// 4. Test again
```

---

### **Problem: Not receiving verification email**

**Check:**
1. Is the email address correct?
2. Check spam/junk folder
3. Wait 2-3 minutes for delivery
4. Check Firebase Console → Authentication → Users

**Solution:**
```
1. On login page, click "Resend verification email"
2. Wait 2-3 minutes
3. Check spam folder
4. If still not received, verify email in Firebase Console
```

---

### **Problem: Error "sendEmailVerification is not defined"**

**Solution:**
```javascript
// Add to line 9 imports:
import { 
  signInWithEmailAndPassword, 
  getAuth, 
  fetchSignInMethodsForEmail, 
  onAuthStateChanged, 
  signOut, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider, 
  sendPasswordResetEmail, 
  sendEmailVerification  // ← ADD THIS
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
```

---

## ✅ Success Criteria

Your email verification is working correctly when:

- ✅ Signup redirects to LOGIN page (not dashboard)
- ✅ Unverified login is BLOCKED with error message
- ✅ Verification email is received in inbox
- ✅ Clicking verification link shows success page
- ✅ Login after verification is ALLOWED
- ✅ Console logs match expected flow
- ✅ "Resend verification email" link works

---

## 📧 Email Details

**From:** Barangay Mapulang Lupa <adminmapulanglupa@f5-softdev.firebaseapp.com>

**Subject:** Verify your Email for Barangay Mapulang Lupa Borrowing Website Account

**Content:**
```
Hello %DISPLAY_NAME%,

Follow this link to verify your email address.

[Verify Email] (Blue Button)

If you didn't ask to verify this address, you can ignore this email.

Thanks,

Barangay Mapulang Lupa team
```

---

## 🔐 Firebase Console Verification

### **How to Check if Email is Verified:**

```
1. Go to: https://console.firebase.google.com
2. Select your project: F5 SOFTDEV
3. Navigate to: Authentication → Users
4. Find user by email
5. Look at "Email verified" column
   - ✅ Yes = Can login
   - ❌ No = Cannot login
```

### **How to Manually Verify (Testing Only):**

```
1. Firebase Console → Authentication → Users
2. Click the user
3. Click "..." menu (top right)
4. Click "Send email verification"
   OR
5. Use Firebase CLI to update emailVerified property
```

---

## 🎯 Expected Behavior Summary

| Action | Expected Result |
|--------|----------------|
| Signup with new email | ✅ Email sent, redirected to login, signed out |
| Login before verification | ❌ Blocked, error shown, stays on login page |
| Click verification link | ✅ Email verified in Firebase |
| Login after verification | ✅ Allowed, redirected to dashboard |
| Resend verification | ✅ New email sent, toast notification |

---

## 📝 Test Accounts Template

Use this to track test accounts:

| Email | Password | Created | Verified? | Can Login? |
|-------|----------|---------|-----------|------------|
| test1@gmail.com | Test123! | ✅ | ❌ | ❌ |
| test2@gmail.com | Test123! | ✅ | ✅ | ✅ |
| admin@test.com | Admin123! | ✅ | ✅ | ✅ |

---

**Need Help?** Check `EMAIL_VERIFICATION_REFERENCE.md` for detailed documentation.
