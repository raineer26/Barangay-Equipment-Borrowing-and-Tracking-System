# 📧 Email Verification System - Complete Reference Guide

**Date:** November 14, 2025  
**Status:** ✅ Fully Implemented  
**Location:** `script.js` lines 757-900

---

## 🎯 Overview

This system ensures users **MUST verify their email** before accessing the platform. No user can login without clicking the verification link sent to their email.

---

## 🔧 Core Functions

### **1. `registerUser(email, password, userData)`**

**Purpose:** Create new account with mandatory email verification

**Flow:**
```
1. Create Firebase Auth user
2. Update display name (from userData.fullName)
3. Send verification email → user's inbox
4. Save user data to Firestore
5. SIGN OUT user immediately
6. User CANNOT login until email verified
```

**Parameters:**
- `email` (string) - User's email address
- `password` (string) - User's password
- `userData` (object) - Must include:
  - `fullName` - For display name
  - `firstName`
  - `lastName`
  - `contactNumber`
  - `address`
  - `role` - Default: "user"

**Returns:**
```javascript
{
  success: true/false,
  message: "Account created successfully! Please check your email..."
}
```

**Example Usage:**
```javascript
const userData = {
  firstName: "Juan",
  lastName: "Dela Cruz",
  fullName: "Juan Dela Cruz",
  contactNumber: "09123456789",
  address: "123 Main St",
  role: "user"
};

const result = await registerUser("juan@example.com", "SecurePass123!", userData);

if (result.success) {
  // Redirect to login
  window.location.href = "index.html";
} else {
  // Show error
  alert(result.message);
}
```

---

### **2. `loginUser(email, password)`**

**Purpose:** Authenticate user WITH email verification check

**Flow:**
```
1. Sign in with Firebase Auth
2. CHECK: user.emailVerified === true?
   
   ❌ If FALSE:
   - Sign out user immediately
   - Block login
   - Return error with needsVerification flag
   
   ✅ If TRUE:
   - Allow login
   - Return user object
```

**Parameters:**
- `email` (string) - User's email
- `password` (string) - User's password

**Returns:**
```javascript
// SUCCESS (email verified)
{
  success: true,
  message: "Login successful!",
  user: <Firebase User Object>
}

// FAILURE (email NOT verified)
{
  success: false,
  message: "Please verify your email before logging in...",
  user: null,
  needsVerification: true
}

// FAILURE (wrong credentials)
{
  success: false,
  message: "Incorrect email or password...",
  user: null
}
```

**Example Usage:**
```javascript
const result = await loginUser("juan@example.com", "SecurePass123!");

if (result.success) {
  // Proceed with login flow
  const user = result.user;
  // Fetch user role from Firestore
  // Redirect to appropriate dashboard
} else {
  if (result.needsVerification) {
    // Show "Resend verification email" option
    showResendLink();
  }
  // Show error message
  alert(result.message);
}
```

---

## 📋 Complete User Journey

### **Scenario 1: New User Signup**

```
1. User fills signup form
2. Clicks "Create Account"
3. registerUser() executes:
   ✓ Account created in Firebase Auth
   ✓ Display name set
   ✓ Verification email SENT
   ✓ Data saved to Firestore
   ✓ User SIGNED OUT
4. Alert: "Please check your email to verify..."
5. Redirected to login page
6. User receives email (check inbox/spam)
```

### **Scenario 2: Try to Login (Unverified)**

```
1. User enters email/password
2. Clicks "Login"
3. loginUser() executes:
   ✓ Authentication successful
   ✗ emailVerified = FALSE
   ✓ User signed out immediately
4. Error shown: "Please verify your email..."
5. "Resend verification email" link appears
6. User remains on login page
```

### **Scenario 3: Click Verification Link**

```
1. User opens email inbox
2. Finds "Verify your Email for Barangay..." email
3. Clicks "Verify Email" button
4. Browser opens Firebase verification page
5. Email marked as verified in Firebase Auth
6. Success message shown
```

### **Scenario 4: Login After Verification**

```
1. User returns to login page
2. Enters email/password
3. loginUser() executes:
   ✓ Authentication successful
   ✓ emailVerified = TRUE ✅
   ✓ Login allowed
4. User data fetched from Firestore
5. Redirected to user.html or admin.html
```

---

## 🧪 Testing Checklist

### **Test 1: Signup Flow**
- [ ] Fill signup form with valid data
- [ ] Submit form
- [ ] Console shows: `[Register] Verification email sent`
- [ ] Alert appears: "Please check your email..."
- [ ] Redirected to `index.html`
- [ ] Check email inbox (may be in spam folder)
- [ ] Verification email received

### **Test 2: Login Before Verification**
- [ ] Try to login with new account
- [ ] Console shows: `[Login] Email not verified`
- [ ] Error message: "Please verify your email..."
- [ ] "Resend verification email" link appears
- [ ] Remain on login page
- [ ] NOT redirected to dashboard

### **Test 3: Email Verification**
- [ ] Open verification email
- [ ] Click "Verify Email" button
- [ ] Firebase verification page opens
- [ ] Success message shown
- [ ] Email now marked as verified

### **Test 4: Login After Verification**
- [ ] Return to login page
- [ ] Enter same email/password
- [ ] Console shows: `[Login] Email verified - login successful`
- [ ] Successfully redirected to dashboard
- [ ] User is logged in ✅

### **Test 5: Resend Verification Email**
- [ ] Try to login (unverified account)
- [ ] Click "Resend verification email" link
- [ ] Toast notification: "Verification email sent!"
- [ ] Check inbox for new verification email
- [ ] Verify that new email was received

---

## 🔍 Debugging

### **Console Logs to Check:**

**During Signup:**
```
[Register] Creating user account for: user@example.com
[Register] User account created: <UID>
[Register] Display name updated: Juan Dela Cruz
[Register] Verification email sent to: user@example.com
[Register] User data saved to Firestore
[Register] User signed out - must verify email before logging in
```

**During Login (Unverified):**
```
[Login] Attempting login for: user@example.com
[Login] Authentication successful: <UID>
[Login] Email not verified for: user@example.com
[Login] User signed out due to unverified email
```

**During Login (Verified):**
```
[Login] Attempting login for: user@example.com
[Login] Authentication successful: <UID>
[Login] Email verified - login successful
[Login] Redirecting to user dashboard...
```

---

## ⚠️ Common Issues

### **Issue 1: "Email not verified" but I clicked the link**

**Causes:**
- Verification link not clicked yet
- Email client blocked the link
- Using different browser/device

**Solution:**
1. Check email again (including spam)
2. Click the BLUE button that says "Verify Email"
3. Wait for success page to load
4. Try logging in again

---

### **Issue 2: Not receiving verification email**

**Causes:**
- Email in spam/junk folder
- Wrong email address entered
- Email server delay

**Solution:**
1. Check spam/junk folder
2. Click "Resend verification email" on login page
3. Wait 2-3 minutes for delivery
4. Check Firebase Console → Authentication → Users → verify email is correct

---

### **Issue 3: Can login without verifying**

**Causes:**
- `loginUser()` function not being used
- `sendEmailVerification` import missing
- Code not deployed

**Solution:**
1. Check `script.js` line 9 has: `sendEmailVerification` in imports
2. Verify `loginUser()` function exists (lines 820-900)
3. Confirm login form uses `loginUser()` function
4. Hard refresh browser (Ctrl+Shift+R)

---

### **Issue 4: "sendEmailVerification is not defined"**

**Cause:**
- Missing import in line 9

**Solution:**
```javascript
// Line 9 should have:
import { 
  signInWithEmailAndPassword, 
  getAuth, 
  // ... other imports ...
  sendEmailVerification  // ← MUST BE HERE
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
```

---

## 📊 Firebase Console Verification

### **Check Email Verification Status:**

1. Go to Firebase Console
2. Navigate to: **Authentication** → **Users**
3. Find the user by email
4. Look at **Email verified** column:
   - ✅ **Yes** = Can login
   - ❌ **No** = Cannot login

### **Manually Verify Email (Admin Only):**

```javascript
// In Firebase Console → Authentication → Users
// Click user → Click "..." menu → "Send email verification"
```

---

## 🔐 Security Features

### **What's Protected:**

✅ **Signup:**
- User account created
- Email verification sent
- User signed out immediately
- Cannot access system until verified

✅ **Login:**
- Checks `emailVerified` property
- Blocks unverified users
- Signs them out if not verified
- Shows helpful error message

✅ **Session:**
- Only verified users can maintain session
- Unverified users cannot bypass login

---

## 📝 Code Locations

| Feature | File | Lines |
|---------|------|-------|
| Email verification functions | `script.js` | 757-900 |
| `registerUser()` | `script.js` | 765-823 |
| `loginUser()` | `script.js` | 825-900 |
| Signup form handler | `script.js` | 905-1070 |
| Login form handler | `script.js` | 410-545 |
| Firebase imports | `script.js` | 9 |

---

## 🎨 User Interface Elements

### **Signup Page:**
- Success alert redirects to login
- Error messages show inline

### **Login Page:**
- Email verification error appears
- "Resend verification email" link (clickable)
- Toast notification when resent

### **Email Template:**
- Configured in Firebase Console → Authentication → Templates
- Subject: "Verify your Email for Barangay Mapulang Lupa..."
- Sender: "Barangay Mapulang Lupa"
- Blue "Verify Email" button

---

## ✅ Verification Complete When:

- ✅ New signup redirects to login (not dashboard)
- ✅ Unverified login shows error + stays on login page
- ✅ Verification email received in inbox
- ✅ Click verification link → success page
- ✅ Login after verification → access granted
- ✅ Console logs show proper flow

---

**Last Updated:** November 14, 2025  
**Maintained By:** Development Team  
**Status:** Production Ready ✅
