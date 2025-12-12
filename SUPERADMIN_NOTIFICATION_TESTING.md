# Super Admin Notification Testing Checklist

**Date:** December 12, 2025  
**Version:** 1.0  
**Status:** Ready for Testing

---

## 📋 Pre-Testing Setup

### Required Test Accounts

- [ ] **Super Admin Account**
  - Email: `superadmin@test.com`
  - Role in Firestore: `role: "superadmin"`
  - Can access: Manage Accounts, Notifications
  - Cannot access: Dashboard, Review Requests, Inventory

- [ ] **Regular Admin Account**
  - Email: `admin@test.com`
  - Role in Firestore: `role: "admin"`
  - Can access: All admin pages

- [ ] **Regular User Account**
  - Email: `user@test.com`
  - Role in Firestore: `role: "user"`
  - Can make booking requests

---

## ✅ Test Scenarios

### Test 1: Role Change Notification (User → Admin)

**Priority:** 🔴 CRITICAL

**Steps:**
1. [ ] Login as regular admin (not super admin)
2. [ ] Navigate to Manage Accounts page
3. [ ] Find a user account with `role: "user"`
4. [ ] Click "Promote to Admin" button
5. [ ] Confirm the promotion
6. [ ] Verify success toast appears
7. [ ] **Open browser console** - check for log:
   ```
   ✅ Super admin notification created for role change
   ```
8. [ ] Logout from admin account
9. [ ] Login as super admin
10. [ ] Navigate to Notifications page
11. [ ] Verify notification appears:
    - **Title:** "User Role Promoted"
    - **Message:** "[Name] was promoted to Admin"
    - **Priority Badge:** HIGH
    - **Type Badge:** Account management or similar
12. [ ] Click notification
13. [ ] Verify redirects to Manage Accounts page

**Expected Results:**
- ✅ Notification created without errors
- ✅ Super admin sees notification immediately
- ✅ Notification priority is HIGH
- ✅ Notification includes user's name
- ✅ Click action navigates to correct page

**Pass/Fail:** ________

**Notes:**
```
[Write any issues or observations here]
```

---

### Test 2: Role Change Notification (Admin → Super Admin)

**Priority:** 🔴 CRITICAL

**Steps:**
1. [ ] Login as super admin
2. [ ] Navigate to Manage Accounts page
3. [ ] Find an admin account
4. [ ] Click "Promote to Super Admin" button
5. [ ] Confirm the promotion
6. [ ] Check console for success log
7. [ ] Refresh Notifications page
8. [ ] Verify notification appears with MEDIUM priority

**Expected Results:**
- ✅ Notification priority is MEDIUM (not HIGH)
- ✅ Message says "promoted to Super Admin"

**Pass/Fail:** ________

---

### Test 3: Account Disable Notification

**Priority:** 🟡 HIGH

**Steps:**
1. [ ] Login as admin
2. [ ] Navigate to Manage Accounts page
3. [ ] Find a user account
4. [ ] Click "Disable Account" button
5. [ ] Confirm the action
6. [ ] Check console for:
   ```
   ✅ Super admin notification created for account disable
   ```
7. [ ] Logout and login as super admin
8. [ ] Navigate to Notifications page
9. [ ] Verify notification appears:
    - **Title:** "Account Disabled"
    - **Message:** "Account disabled: [Name] ([Email])"
    - **Priority Badge:** MEDIUM
10. [ ] Verify notification includes user's email address

**Expected Results:**
- ✅ Notification created successfully
- ✅ Message includes both name and email
- ✅ Priority is MEDIUM
- ✅ Super admin can see notification

**Pass/Fail:** ________

**Notes:**
```

```

---

### Test 4: Account Enable Notification

**Priority:** 🟢 MEDIUM

**Steps:**
1. [ ] Login as admin
2. [ ] Navigate to Manage Accounts page
3. [ ] Find a DISABLED user account (from Test 3)
4. [ ] Click "Enable Account" button
5. [ ] Confirm the action
6. [ ] Check console for success log
7. [ ] Login as super admin
8. [ ] Check Notifications page
9. [ ] Verify notification:
    - **Title:** "Account Enabled"
    - **Priority Badge:** LOW

**Expected Results:**
- ✅ Notification created
- ✅ Priority is LOW (less urgent than disable)

**Pass/Fail:** ________

---

### Test 5: New User Registration Notification

**Priority:** 🔴 CRITICAL

**Steps:**
1. [ ] Logout from all accounts
2. [ ] Navigate to signup page (`signup.html`)
3. [ ] Fill out registration form:
   - First Name: Test
   - Last Name: User
   - Email: testuser@example.com
   - Password: (valid password)
   - Contact: 09123456789
   - Address: Test Address
4. [ ] Submit form
5. [ ] **Important:** Check browser console for:
   ```
   ✅ Super admin notification created for new registration
   ```
6. [ ] If error appears, note it down
7. [ ] Complete signup process
8. [ ] Login as super admin
9. [ ] Navigate to Notifications page
10. [ ] Verify notification appears:
    - **Title:** "New User Registered"
    - **Message:** "Test User (testuser@example.com) created an account"
    - **Priority Badge:** LOW
11. [ ] Verify email is displayed correctly

**Expected Results:**
- ✅ Notification created on signup
- ✅ Signup NOT blocked if notification fails
- ✅ Message includes full name and email
- ✅ Priority is LOW

**Pass/Fail:** ________

**Notes:**
```

```

---

### Test 6: Notification Separation (Super Admin View)

**Priority:** 🔴 CRITICAL

**Purpose:** Verify super admins DO NOT see booking-related notifications

**Prerequisites:**
- Have regular admin create/approve/reject some booking requests
- These should create admin notifications

**Steps:**
1. [ ] Login as super admin
2. [ ] Navigate to Notifications page
3. [ ] Review ALL notifications visible
4. [ ] Verify NONE of these types appear:
   - ❌ "New Request" (booking submission)
   - ❌ "Deadline Approaching"
   - ❌ "In Progress Alert"
   - ❌ "Completion Reminder"
   - ❌ "Inventory Low"
5. [ ] Verify ONLY these types appear:
   - ✅ "User Role Promoted"
   - ✅ "Account Disabled"
   - ✅ "Account Enabled"
   - ✅ "New User Registered"

**Expected Results:**
- ✅ Zero booking notifications visible
- ✅ Only account management notifications visible
- ✅ No mixing of notification types

**Pass/Fail:** ________

**Critical Issues Found:**
```

```

---

### Test 7: Notification Separation (Regular Admin View)

**Priority:** 🔴 CRITICAL

**Purpose:** Verify regular admins DO NOT see account-related notifications

**Steps:**
1. [ ] Login as regular admin (NOT super admin)
2. [ ] Navigate to Notifications page
3. [ ] Review ALL notifications visible
4. [ ] Verify NONE of these types appear:
   - ❌ "User Role Promoted"
   - ❌ "Account Disabled"
   - ❌ "Account Enabled"
   - ❌ "New User Registered"
5. [ ] Verify booking notifications DO appear (if any exist)

**Expected Results:**
- ✅ Zero account management notifications visible
- ✅ Only booking-related notifications visible
- ✅ Complete separation from super admin notifications

**Pass/Fail:** ________

---

### Test 8: Multiple Super Admins Notification

**Priority:** 🟡 HIGH

**Purpose:** Verify ALL super admins receive notifications

**Prerequisites:**
- Create 2 or more super admin accounts

**Steps:**
1. [ ] Create test super admin #2 in Firestore
2. [ ] Login as admin
3. [ ] Perform an action (e.g., promote a user)
4. [ ] Logout
5. [ ] Login as super admin #1
6. [ ] Check Notifications - verify notification exists
7. [ ] Logout
8. [ ] Login as super admin #2
9. [ ] Check Notifications - verify SAME notification exists

**Expected Results:**
- ✅ Both super admins see the notification
- ✅ Each has their own notification document
- ✅ Both have same title/message
- ✅ Both can mark as read independently

**Pass/Fail:** ________

---

### Test 9: Notification Metadata Accuracy

**Priority:** 🟢 MEDIUM

**Purpose:** Verify metadata is stored correctly for auditing

**Steps:**
1. [ ] Login as admin #1 (note the email)
2. [ ] Promote a user to admin
3. [ ] Open Firestore console
4. [ ] Navigate to `notifications` collection
5. [ ] Find the most recent notification with `isSuperAdminNotification: true`
6. [ ] Verify metadata fields exist:
   - [ ] `targetUserId` - matches promoted user's ID
   - [ ] `performedBy` - matches admin #1's ID
   - [ ] `actionType` - equals "role_change"
   - [ ] `oldRole` - equals "user"
   - [ ] `newRole` - equals "admin"
   - [ ] `userEmail` - equals promoted user's email
7. [ ] Verify all values are accurate

**Expected Results:**
- ✅ All metadata fields present
- ✅ All values match actual action performed
- ✅ No null or undefined values
- ✅ Useful for future auditing

**Pass/Fail:** ________

---

### Test 10: Error Handling (Notification Failure)

**Priority:** 🔴 CRITICAL

**Purpose:** Verify actions still complete even if notification fails

**Steps:**
1. [ ] **Simulate network issue** (disable internet briefly during action)
2. [ ] Login as admin
3. [ ] Try to promote a user
4. [ ] Check browser console for error:
   ```
   ⚠️ Failed to create super admin notification
   ```
5. [ ] Verify action STILL completed successfully
6. [ ] Check Firestore - user role should be updated
7. [ ] Verify toast message shows success

**Expected Results:**
- ✅ Role change completes successfully
- ✅ User role updated in Firestore
- ✅ Success toast appears
- ✅ Error logged to console
- ✅ Action NOT blocked by notification failure

**Pass/Fail:** ________

**Critical:** This test ensures notification failures don't break core functionality

---

## 📊 Test Summary

### Results Table

| Test # | Test Name | Priority | Result | Notes |
|--------|-----------|----------|--------|-------|
| 1 | Role Change (User→Admin) | CRITICAL | ⬜ | |
| 2 | Role Change (Admin→Super) | CRITICAL | ⬜ | |
| 3 | Account Disable | HIGH | ⬜ | |
| 4 | Account Enable | MEDIUM | ⬜ | |
| 5 | New Registration | CRITICAL | ⬜ | |
| 6 | Separation (Super Admin) | CRITICAL | ⬜ | |
| 7 | Separation (Regular Admin) | CRITICAL | ⬜ | |
| 8 | Multiple Super Admins | HIGH | ⬜ | |
| 9 | Metadata Accuracy | MEDIUM | ⬜ | |
| 10 | Error Handling | CRITICAL | ⬜ | |

**Legend:** ✅ Pass | ❌ Fail | ⬜ Not Tested

---

## 🐛 Issues Found

### Critical Issues
```
[List any critical bugs that block functionality]

Example:
- Notifications not appearing for super admin #2
- Role change blocked when notification fails
```

### Non-Critical Issues
```
[List minor issues that don't break functionality]

Example:
- Notification timestamp shows wrong timezone
- Priority badge color too light
```

---

## ✅ Sign-Off

**Tested By:** ___________________  
**Date:** ___________________  
**Overall Status:** ⬜ PASS | ⬜ FAIL | ⬜ PARTIAL

**Ready for Production:** ⬜ YES | ⬜ NO | ⬜ WITH ISSUES

**Notes:**
```
[Final testing notes and recommendations]
```

---

## 📞 If Issues Found

1. **Check console logs** for error messages
2. **Review Firestore** notifications collection
3. **Verify user roles** in Firestore users collection
4. **Check documentation** - `SUPERADMIN_NOTIFICATION_SYSTEM.md`
5. **Review code** - `script.js` lines 22325+ (notification function)

---

**End of Testing Checklist**
