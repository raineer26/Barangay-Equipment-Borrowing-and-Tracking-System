# 🧪 Tents & Chairs Validation Testing Guide

**Date**: November 7, 2025  
**Feature**: Tents & Chairs Booking Validation System  
**Components Tested**: User-side identical blocking, Admin-side validation, Inventory management

---

## 📋 Pre-Testing Setup

### 1. Start Local Server
Since PowerShell execution policy is restricted, use one of these methods:

**Option A: Use VS Code Live Server Extension**
- Right-click `index.html` → "Open with Live Server"

**Option B: Bypass PowerShell Execution Policy (One-time)**
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npx http-server -p 5500
```

**Option C: Use Node.js directly**
```powershell
node -e "require('http').createServer((req,res)=>{require('fs').readFile('.'+req.url,(e,d)=>{res.end(d)})}).listen(5500)"
```

### 2. Open Browser
Navigate to: `http://localhost:5500`

### 3. Prepare Test Accounts
You'll need:
- **1 User Account** (for submitting requests)
- **1 Admin Account** (for approving requests)

If you don't have these, create them via signup page and manually set admin role in Firestore.

### 4. Set Up Initial Inventory
**CRITICAL**: Before testing, ensure inventory exists in Firestore:

**Firestore Path**: `inventory/equipment`

**Required Fields**:
```javascript
{
  totalTents: 24,
  totalChairs: 600,
  availableTents: 24,
  availableChairs: 600,
  tentsInUse: 0,
  chairsInUse: 0,
  lastUpdated: [Timestamp]
}
```

**How to Create**:
1. Open Firebase Console → Firestore Database
2. Create collection: `inventory`
3. Create document ID: `equipment`
4. Add fields above with values

---

## 🧪 Test Scenarios

### TEST 1: User-Side Identical Request Blocking ✅

**Purpose**: Verify users cannot submit identical requests (same dates + same quantities)

**Steps**:
1. Login as **user account**
2. Navigate to tents/chairs calendar
3. Select a date (e.g., November 15, 2025)
4. Fill form:
   - Start Date: `2025-11-15`
   - End Date: `2025-11-17`
   - Quantity Tents: `5`
   - Quantity Chairs: `100`
   - Fill other required fields
5. Click "Submit Request"
6. **Expected**: ✅ Request submitted successfully → redirected to user.html

7. Go back to calendar and select same date
8. Fill form with **IDENTICAL** values:
   - Start Date: `2025-11-15`
   - End Date: `2025-11-17`
   - Quantity Tents: `5`
   - Quantity Chairs: `100`
9. Click "Submit Request"

**Expected Result**: ❌ Should BLOCK with error modal:
```
Duplicate Request Detected

You already have a pending request with identical details:

Existing Request:
Dates: November 15, 2025 - November 17, 2025
Tents: 5
Chairs: 100
Status: pending

Your New Request:
Dates: November 15, 2025 - November 17, 2025
Tents: 5
Chairs: 100

Please wait for your existing request to be processed or cancel it before submitting a new one.
```

**Debug Console Should Show**:
```
🔍 [Tents/Chairs Submit] Checking for duplicate requests...
📊 Query: userId=xxx, startDate=2025-11-15, endDate=2025-11-17, status in [pending, approved, in-progress]
📋 Found 1 existing request(s) with same dates
❌ BLOCKED: Found identical request (same quantities)
```

**Pass Criteria**:
- ✅ Modal shows with properly formatted message (line breaks work)
- ✅ Submission is blocked
- ✅ Console shows emoji-prefixed logs

---

### TEST 2: User-Side Allow Different Quantities ✅

**Purpose**: Verify users CAN submit overlapping dates with different quantities

**Steps**:
1. Immediately after TEST 1, fill form again with:
   - Start Date: `2025-11-15` (SAME as existing)
   - End Date: `2025-11-17` (SAME as existing)
   - Quantity Tents: `10` (DIFFERENT - was 5)
   - Quantity Chairs: `100` (SAME - but one changed is enough)
2. Click "Submit Request"

**Expected Result**: ✅ Should ALLOW submission
```
Success!

Your request has been submitted successfully and is pending approval.
```

**Debug Console Should Show**:
```
🔍 [Tents/Chairs Submit] Checking for duplicate requests...
📊 Query: userId=xxx, startDate=2025-11-15, endDate=2025-11-17
📋 Found 1 existing request(s) with same dates
✅ Request quantities differ - allowing submission
✅ Request submitted successfully
```

**Pass Criteria**:
- ✅ Request submitted successfully
- ✅ Redirected to user.html
- ✅ Console shows "allowing submission" message

---

### TEST 3: Admin-Side Identical Request Blocking ✅

**Purpose**: Verify admin cannot approve when identical pending request exists

**Steps**:
1. **Setup**: Ensure you have 2 pending requests with IDENTICAL details (from TEST 1 + manually create another via Firestore or different user)
   - Request A: Dates 11/15-11/17, Tents: 5, Chairs: 100, Status: pending
   - Request B: Dates 11/15-11/17, Tents: 5, Chairs: 100, Status: pending

2. Login as **admin account**
3. Navigate to `admin-tents-requests.html`
4. Locate Request A in the table
5. Click "Approve" button

**Expected Result**: ❌ Should BLOCK with comparison modal:
```
Cannot Approve: Identical Request Exists

An identical request already exists with the same dates and quantities.

Current Request:
Name: [User Name]
Dates: November 15, 2025 - November 17, 2025
Tents: 5
Chairs: 100

Existing Identical Request:
Name: [Other User Name]
Dates: November 15, 2025 - November 17, 2025
Tents: 5
Chairs: 100
Status: pending

Please review both requests. Consider denying one or adjusting quantities before approving.
```

**Debug Console Should Show**:
```
🔍 [Admin Approve Tents/Chairs] Starting approval for request xxx...
📋 Request Details: Tents: 5, Chairs: 100, Dates: 2025-11-15 to 2025-11-17
📊 STEP 1: Checking for identical requests...
📊 Found 1 request(s) with same dates
❌ BLOCKED: Identical request found (requestId: yyy)
```

**Pass Criteria**:
- ✅ Modal shows with detailed comparison
- ✅ Approval is blocked
- ✅ Console shows STEP 1 blocking

---

### TEST 4: Admin-Side Inventory Validation (Insufficient Stock) ✅

**Purpose**: Verify admin cannot approve when inventory is insufficient

**Steps**:
1. **Setup Inventory Shortage**: 
   - Go to Firebase Console → `inventory/equipment`
   - Temporarily set: `availableTents: 3`, `availableChairs: 50`

2. Login as **admin account**
3. Navigate to `admin-tents-requests.html`
4. Find a pending request with:
   - Quantity Tents: `5` (exceeds available 3)
   - Quantity Chairs: `100` (exceeds available 50)
5. Click "Approve" button

**Expected Result**: ❌ Should BLOCK with inventory shortage modal:
```
Insufficient Inventory

Cannot approve request due to insufficient stock.

Current Inventory:
Available Tents: 3
Available Chairs: 50

Requested Quantities:
Tents: 5 (shortage: 2)
Chairs: 100 (shortage: 50)

New stock would be:
Tents: -2 (INVALID)
Chairs: -50 (INVALID)

Please adjust the request quantities or wait for equipment to become available.
```

**Debug Console Should Show**:
```
📊 STEP 2: Validating inventory availability...
📦 Current Inventory: Tents=3, Chairs=50
📊 After approval: Tents=-2, Chairs=-50
❌ BLOCKED: Insufficient inventory
```

**Pass Criteria**:
- ✅ Modal shows shortage calculations
- ✅ Approval is blocked
- ✅ Console shows STEP 2 blocking

---

### TEST 5: Admin-Side Successful Approval with Inventory Deduction ✅

**Purpose**: Verify approval works and inventory is deducted correctly

**Steps**:
1. **Reset Inventory**:
   - Firebase Console → `inventory/equipment`
   - Set: `availableTents: 24`, `availableChairs: 600`, `tentsInUse: 0`, `chairsInUse: 0`

2. Create a new pending request (or use existing):
   - Dates: `2025-11-20` to `2025-11-22`
   - Quantity Tents: `8`
   - Quantity Chairs: `200`
   - Status: `pending`

3. Login as **admin account**
4. Navigate to `admin-tents-requests.html`
5. Find the request in table
6. Click "Approve" button
7. Confirm in the confirmation modal

**Expected Result**: ✅ Should show success modal:
```
Request Approved

Request has been approved successfully.

Updated Inventory:
Available Tents: 16 (was 24)
Available Chairs: 400 (was 600)

Tents In Use: 8 (was 0)
Chairs In Use: 200 (was 0)
```

**Debug Console Should Show**:
```
🔍 [Admin Approve Tents/Chairs] Starting approval...
📊 STEP 1: No identical requests found
📊 STEP 2: Inventory check passed
📦 Deducting from inventory...
📦 New Inventory: availableTents=16, availableChairs=400
✅ Request approved successfully
```

**Verify in Firestore**:
- Request status changed to: `approved`
- Request has new field: `approvedAt: [Timestamp]`
- `inventory/equipment` updated:
  - `availableTents: 16` (was 24)
  - `availableChairs: 400` (was 600)
  - `tentsInUse: 8` (was 0)
  - `chairsInUse: 200` (was 0)
  - `lastUpdated: [New Timestamp]`

**Pass Criteria**:
- ✅ Success modal shows with inventory changes
- ✅ Request status updated in table (badge changes to blue "approved")
- ✅ Firestore reflects all changes correctly
- ✅ Console shows full approval flow

---

### TEST 6: Admin-Side Inventory Restoration on Completion ✅

**Purpose**: Verify completing a booking returns inventory to available stock

**Steps**:
1. **Use approved request from TEST 5** (or create one):
   - Status: `approved`
   - Quantity Tents: `8`
   - Quantity Chairs: `200`

2. **Current Inventory** should be:
   - `availableTents: 16`
   - `availableChairs: 400`
   - `tentsInUse: 8`
   - `chairsInUse: 200`

3. Login as **admin account**
4. Navigate to `admin-tents-requests.html`
5. Find the approved request
6. Click "Mark as Completed" button
7. Confirm in the modal (should mention inventory restoration)

**Expected Result**: ✅ Should show completion modal:
```
Request Completed

Request has been marked as completed.

Equipment Returned:
Tents: 8
Chairs: 200

Inventory has been updated.
```

**Debug Console Should Show**:
```
🔍 [Admin Complete Tents/Chairs] Starting completion for request xxx...
📋 Request Details: Tents: 8, Chairs: 200, Status: approved
📦 Restoring inventory for approved/in-progress booking...
📊 Current Inventory: Available Tents=16, Chairs=400, InUse Tents=8, Chairs=200
📦 New Inventory After Return: Available Tents=24, Chairs=600, InUse Tents=0, Chairs=0
✅ Inventory restored successfully
✅ Request marked as completed
```

**Verify in Firestore**:
- Request status: `completed`
- Request has new field: `completedAt: [Timestamp]`
- `inventory/equipment` updated:
  - `availableTents: 24` (was 16, +8 returned)
  - `availableChairs: 600` (was 400, +200 returned)
  - `tentsInUse: 0` (was 8, -8)
  - `chairsInUse: 0` (was 200, -200)
  - `lastUpdated: [New Timestamp]`

**Pass Criteria**:
- ✅ Completion modal shows equipment returned
- ✅ Request status changes to "completed" (green badge)
- ✅ Inventory fully restored in Firestore
- ✅ Console shows restoration flow

---

### TEST 7: Rejected Request Doesn't Affect Inventory ✅

**Purpose**: Verify rejected requests don't trigger inventory restoration

**Steps**:
1. **Note current inventory** from Firestore
2. Create a pending request (never approved)
3. Login as **admin**, navigate to `admin-tents-requests.html`
4. Click "Deny" button on the pending request
5. Enter rejection reason (optional)
6. Later, try marking it as "completed" from History tab

**Expected Result**:
- Rejection works normally
- Completing a rejected request shows modal: "Request has been marked as completed." (without inventory details)

**Debug Console Should Show**:
```
🔍 [Admin Complete Tents/Chairs] Starting completion...
📋 Request Details: Status: rejected
ℹ️ Skipping inventory restoration (status: rejected)
✅ Request marked as completed
```

**Verify in Firestore**:
- `inventory/equipment` unchanged (rejected requests never took inventory)

**Pass Criteria**:
- ✅ Inventory unchanged
- ✅ Console shows "skipping inventory restoration"

---

### TEST 8: Calendar Display Verification ✅

**Purpose**: Verify approved bookings show correctly on calendar

**Steps**:
1. **Create an approved booking**:
   - Start Date: `2025-11-25`
   - End Date: `2025-11-27` (3-day range)
   - Status: `approved`

2. Login as **user account**
3. Navigate to `tents-calendar.html`
4. Navigate to November 2025 calendar view

**Expected Result**:
- All three dates (Nov 25, 26, 27) should be marked as "booked"
- Dates should have the `.booked` CSS class (dark styling)
- Past dates and today should be clearly distinguishable

**Debug Console Should Show**:
```
[Calendar] Loading booked dates for tents & chairs...
[Calendar] Found X approved/in-progress booking(s)
[Calendar] Booking date range: 2025-11-25 to 2025-11-27
[Calendar] Marking all dates in range...
```

**Pass Criteria**:
- ✅ All dates in booking range marked as booked
- ✅ Clicking booked date shows "already booked" message or similar
- ✅ Console shows booking loading and date marking

---

## 📊 Final Verification Checklist

After completing all tests, verify:

### ✅ User Experience
- [ ] Error modals are clear and helpful
- [ ] Line breaks display correctly (no `\n` visible)
- [ ] Success messages guide users appropriately
- [ ] Calendar accurately reflects availability

### ✅ Admin Experience
- [ ] Cannot approve identical requests
- [ ] Cannot approve with insufficient inventory
- [ ] Inventory changes shown in confirmation modals
- [ ] Status badges update correctly after actions

### ✅ Data Integrity
- [ ] Firestore requests have correct status transitions
- [ ] Inventory numbers are accurate and consistent
- [ ] Timestamps added for all status changes
- [ ] No negative inventory values possible

### ✅ Debug Logging
- [ ] All operations have emoji-prefixed logs
- [ ] Logs show full validation flow
- [ ] Easy to trace where blocking occurs
- [ ] Inventory changes clearly logged

---

## 🐛 Common Issues & Solutions

### Issue: "Insufficient Inventory" even with enough stock
**Cause**: Inventory document doesn't exist or has wrong field names  
**Solution**: Check Firestore `inventory/equipment` document exists with correct fields

### Issue: Approval succeeds but inventory not deducted
**Cause**: updateDoc failed silently  
**Solution**: Check console for errors, verify Firestore permissions

### Issue: Modal shows `\n` instead of line breaks
**Cause**: Old cached JavaScript  
**Solution**: Hard refresh browser (Ctrl+Shift+R) or clear cache

### Issue: Calendar doesn't show booked dates
**Cause**: loadBookedDates() not querying approved status  
**Solution**: Check query includes `status: ['approved', 'in-progress']`

### Issue: Identical blocking not working
**Cause**: Existing request might be cancelled/rejected  
**Solution**: Verify test data has `status: 'pending'` or `'approved'`

---

## 📝 Test Results Template

Use this to record your test results:

```
TEST 1 - User Identical Blocking: [ PASS / FAIL ]
Notes: _______________________________________

TEST 2 - User Different Quantities: [ PASS / FAIL ]
Notes: _______________________________________

TEST 3 - Admin Identical Blocking: [ PASS / FAIL ]
Notes: _______________________________________

TEST 4 - Admin Insufficient Inventory: [ PASS / FAIL ]
Notes: _______________________________________

TEST 5 - Admin Successful Approval: [ PASS / FAIL ]
Notes: _______________________________________

TEST 6 - Inventory Restoration: [ PASS / FAIL ]
Notes: _______________________________________

TEST 7 - Rejected Request Inventory: [ PASS / FAIL ]
Notes: _______________________________________

TEST 8 - Calendar Display: [ PASS / FAIL ]
Notes: _______________________________________
```

---

## 🎯 Next Steps After Testing

If all tests pass:
1. ✅ Mark all testing tasks complete in todo list
2. 📝 Document any edge cases discovered
3. 🚀 Consider implementing conference room admin page using same patterns
4. 🔔 Consider adding email/SMS notifications for status changes

If tests fail:
1. 📋 Note which specific test failed
2. 🔍 Review debug console logs
3. 📊 Check Firestore data state
4. 💬 Report findings for debugging

---

**Good luck with testing! 🚀**
