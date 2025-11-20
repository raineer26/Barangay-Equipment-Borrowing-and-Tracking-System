# Phase 2 Real-Time Testing Guide

**Project**: Barangay Equipment Borrowing and Tracking System  
**Phase**: Phase 2 - Final Testing  
**Date**: November 20, 2025  
**Pages to Test**: 4 pages (User Calendars, Admin Inventory, Admin User Manager)

---

## 📋 Table of Contents
1. [Testing Prerequisites](#testing-prerequisites)
2. [Quick Start Guide](#quick-start-guide)
3. [Test Suite 1: User Calendars](#test-suite-1-user-calendars)
4. [Test Suite 2: Admin Inventory](#test-suite-2-admin-inventory)
5. [Test Suite 3: Admin User Manager](#test-suite-3-admin-user-manager)
6. [Test Suite 4: Listener Cleanup](#test-suite-4-listener-cleanup)
7. [Troubleshooting](#troubleshooting)
8. [Success Criteria](#success-criteria)

---

## 🎯 Testing Prerequisites

### Required Accounts
- **1 User Account** - For testing user calendars
- **1 Admin Account** - For approving bookings and managing inventory
- **1 Extra Email** - For testing new user registration (can use temp email service)

### Browser Setup
1. **Primary Browser**: Chrome or Edge (recommended)
   - Open Developer Tools (F12)
   - Go to Console tab
   - Clear console before each test
2. **Secondary Browser/Incognito**: For multi-tab testing

### Test Data Preparation
Before starting tests, ensure you have:
- [ ] At least 2 pending tents/chairs bookings
- [ ] At least 2 pending conference room bookings
- [ ] At least 1 approved tents booking (to test inventory changes)
- [ ] Note current inventory levels (check `admin-manage-inventory.html`)

### Server Setup
```powershell
# Start local server
cd "C:\Users\ROSADO\Documents\GitHub\Barangay-Equipment-Borrowing-and-Tracking-System"
python -m http.server 5500

# Open in browser
# http://localhost:5500
```

---

## 🚀 Quick Start Guide

### 5-Minute Smoke Test

**Goal**: Verify all 4 Phase 2 pages have real-time working

1. **Test User Calendars** (2 min)
   - Open user tents calendar → Check console logs
   - Admin approves a booking in another tab
   - Verify calendar updates automatically

2. **Test Admin Inventory** (2 min)
   - Open inventory page → Note stock levels
   - Admin approves a booking → Verify stock decreases
   - Admin completes a booking → Verify stock increases

3. **Test User Manager** (1 min)
   - Open user manager → Note total user count
   - Register new user in incognito → Verify count increases

✅ **If all 3 tests pass**: Phase 2 is working correctly!

---

## 📅 Test Suite 1: User Calendars

### Test 1.1: User Tents Calendar - Real-Time Booking Updates

**Page**: `tents-calendar.html`  
**Duration**: 3-5 minutes  
**Difficulty**: Easy

#### Setup
1. **Browser 1 (User)**: 
   - Log in as regular user
   - Navigate to `tents-calendar.html`
   - Open Developer Console (F12)

2. **Browser 2 (Admin)**:
   - Log in as admin
   - Navigate to `admin-tents-requests.html`
   - Keep tab ready

#### Execution Steps
1. In **Browser 1** (User Calendar):
   ```
   ✅ Verify console logs:
   [Real-Time Manager] ✅ Initialized
   📅 Setting up real-time listener for tents calendar (2025-11)
   [Real-Time Manager] ✅ Added listener: userTentsCalendar (Total: 1)
   [Real-Time Tents Calendar] ✅ Listener active
   ```

2. Note a date that shows **available** (green/blue background)
   - Example: November 25, 2025

3. In **Browser 2** (Admin):
   - Find a pending tents booking for November 25
   - Click **Approve** button
   - Confirm approval

4. **Immediately switch to Browser 1** (User Calendar):
   ```
   ✅ Expected Results:
   - Console shows: "[Real-Time Tents Calendar] 📊 Data changed, re-rendering..."
   - November 25 changes from available to booked (darker/red shade)
   - NO PAGE REFRESH needed
   - Change happens within 1-2 seconds
   ```

#### Success Criteria
- ✅ Console logs appear correctly
- ✅ Calendar updates automatically (no refresh)
- ✅ Date color changes to indicate booking
- ✅ Hover shows "Booked" tooltip

#### Failure Indicators
- ❌ Console shows errors
- ❌ Calendar doesn't update (need manual refresh)
- ❌ Date remains available after approval

---

### Test 1.2: User Conference Calendar - Real-Time Room Availability

**Page**: `conference-room.html`  
**Duration**: 3-5 minutes  
**Difficulty**: Easy

#### Setup
1. **Browser 1 (User)**: 
   - Log in as regular user
   - Navigate to `conference-room.html`
   - Open Developer Console (F12)

2. **Browser 2 (Admin)**:
   - Log in as admin
   - Navigate to `admin-conference-requests.html`

#### Execution Steps
1. In **Browser 1** (User Calendar):
   ```
   ✅ Verify console logs:
   [Real-Time Manager] ✅ Initialized
   📅 Setting up real-time listener for conference calendar (2025-11)
   [Real-Time Manager] ✅ Added listener: userConferenceCalendar (Total: 1)
   [Real-Time Conference Calendar] ✅ Listener active
   ```

2. Note a date showing **available** (green)
   - Example: November 22, 2025

3. In **Browser 2** (Admin):
   - Find pending conference booking for November 22
   - Click **Approve**
   - Confirm approval

4. **Switch back to Browser 1**:
   ```
   ✅ Expected Results:
   - Console: "[Real-Time Conference Calendar] 📊 Data changed, re-rendering..."
   - November 22 changes to booked/partially booked
   - Hover shows "1 booking" or "Fully booked"
   - Automatic update (no refresh)
   ```

#### Success Criteria
- ✅ Listener active log appears
- ✅ Calendar updates automatically
- ✅ Date color/status changes correctly
- ✅ Booking count updates

---

### Test 1.3: Calendar Month Navigation with Cleanup

**Page**: Both calendars  
**Duration**: 2 minutes  
**Difficulty**: Easy

#### Execution Steps
1. Open user tents calendar (November 2025)
2. Check console: `userTentsCalendar` listener active
3. Click **Next Month** button (→)
4. Check console:
   ```
   ✅ Expected:
   [Real-Time Manager]   ✓ Cleaned: userTentsCalendar
   📅 Setting up real-time listener for tents calendar (2025-12)
   [Real-Time Manager] ✅ Added listener: userTentsCalendar (Total: 1)
   ```
5. Click **Previous Month** (←)
6. Verify cleanup and new listener for November

#### Success Criteria
- ✅ Old listener cleaned before creating new one
- ✅ New listener created for new month
- ✅ Total listener count stays at 1 (not accumulating)
- ✅ Calendar shows correct bookings for each month

---

## 📦 Test Suite 2: Admin Inventory

### Test 2.1: Inventory Real-Time Stock Decrease

**Page**: `admin-manage-inventory.html`  
**Duration**: 3-5 minutes  
**Difficulty**: Easy

#### Setup
1. **Browser 1 (Inventory Page)**:
   - Log in as admin
   - Navigate to `admin-manage-inventory.html`
   - Open Console (F12)

2. **Browser 2 (Tents Admin)**:
   - Same admin login
   - Navigate to `admin-tents-requests.html`

#### Execution Steps
1. In **Browser 1** (Inventory):
   ```
   ✅ Verify console logs:
   📦 Inventory Manager loaded
   Inventory synced in real-time: {availableTents: 24, availableChairs: 600, ...}
   [Real-Time Manager] ✅ Added listener: adminInventory (Total: 1)
   [Real-Time Inventory] ✅ Listener active
   ```

2. **Record current values**:
   ```
   Available Tents: _____ (e.g., 24)
   Tents In Use: _____ (e.g., 0)
   Available Chairs: _____ (e.g., 600)
   Chairs In Use: _____ (e.g., 0)
   ```

3. In **Browser 2** (Tents Admin):
   - Find a pending tents booking
   - Example: "Request for 5 tents, 100 chairs"
   - Click **Approve**
   - Confirm approval

4. **Immediately look at Browser 1** (Inventory):
   ```
   ✅ Expected Results (within 1-2 seconds):
   
   Before Approval:
   Available Tents: 24
   Tents In Use: 0
   
   After Approval:
   Available Tents: 19 ← DECREASED by 5
   Tents In Use: 5 ← INCREASED by 5
   
   Available Chairs: 500 ← DECREASED by 100
   Chairs In Use: 100 ← INCREASED by 100
   
   Console: "Inventory synced in real-time: {availableTents: 19, ...}"
   ```

#### Success Criteria
- ✅ Inventory updates automatically (no refresh)
- ✅ Available stock decreases correctly
- ✅ In-use stock increases correctly
- ✅ Total remains constant (Available + In-Use = Total)
- ✅ Console shows real-time sync log

---

### Test 2.2: Inventory Real-Time Stock Increase

**Page**: `admin-manage-inventory.html`  
**Duration**: 3-5 minutes  
**Difficulty**: Easy

#### Prerequisites
- Must have at least 1 approved tents booking with items in use
- Inventory shows: "Tents In Use: 5" (or any non-zero value)

#### Execution Steps
1. **Browser 1**: Inventory page open (from previous test)
2. **Browser 2**: `admin-tents-requests.html`

3. In **Browser 2**:
   - Find the approved booking (shows "Approved" status)
   - Click **Mark as Completed**
   - Confirm completion

4. **Switch to Browser 1** (Inventory):
   ```
   ✅ Expected Results:
   
   Before Completing:
   Available Tents: 19
   Tents In Use: 5
   
   After Completing:
   Available Tents: 24 ← INCREASED by 5 (restored)
   Tents In Use: 0 ← DECREASED to 0 (items returned)
   
   Console: "Inventory synced in real-time: {availableTents: 24, tentsInUse: 0, ...}"
   ```

#### Success Criteria
- ✅ Inventory restores automatically
- ✅ Available stock increases
- ✅ In-use stock decreases
- ✅ Numbers match original total
- ✅ Real-time sync within 1-2 seconds

---

### Test 2.3: Multiple Inventory Updates

**Duration**: 5 minutes  
**Difficulty**: Medium

#### Goal
Test rapid consecutive inventory changes

#### Execution Steps
1. Keep inventory page open in Browser 1
2. In Browser 2 (Tents Admin), perform these actions rapidly:
   - Approve Booking A (5 tents)
   - Approve Booking B (3 tents)
   - Complete Booking A (5 tents returned)

3. Watch Browser 1 inventory:
   ```
   ✅ Expected Sequence:
   
   Start: Available 24, In-Use 0
   
   After Approve A: Available 19, In-Use 5
   ↓ (1-2 sec later)
   After Approve B: Available 16, In-Use 8
   ↓ (1-2 sec later)
   After Complete A: Available 21, In-Use 3
   
   Final: Available 21, In-Use 3
   Total: 24 (constant)
   ```

#### Success Criteria
- ✅ All updates appear in correct sequence
- ✅ No updates are skipped
- ✅ Total inventory always equals 24
- ✅ Console logs show each sync

---

## 👥 Test Suite 3: Admin User Manager

### Test 3.1: Real-Time User Registration Detection

**Page**: `admin-user-manager.html`  
**Duration**: 3-5 minutes  
**Difficulty**: Easy

#### Setup
1. **Browser 1 (Admin)**: 
   - Log in as admin
   - Navigate to `admin-user-manager.html`
   - Open Console

2. **Incognito/Browser 2 (Guest)**: 
   - Open `http://localhost:5500/signup.html`
   - Do NOT log in yet

#### Execution Steps
1. In **Browser 1** (User Manager):
   ```
   ✅ Verify console logs:
   📊 Setting up real-time listener for total registered users...
   [Real-Time Manager] ✅ Added listener: adminUsersCount (Total: 1)
   [Real-Time User Manager] ✅ Count listener active
   👥 Setting up real-time listener for all users...
   ✅ Total registered users updated: 47
   [Real-Time Manager] ✅ Added listener: adminUsersData (Total: 2)
   [Real-Time User Manager] ✅ Data listener active
   ✅ Loaded 47 users
   ```

2. **Record current values**:
   ```
   Total Registered Users: _____ (e.g., 47)
   Number of rows in table: _____ (e.g., 47)
   ```

3. In **Incognito Tab** (Signup Page):
   - Fill out signup form:
     ```
     Full Name: Test User Real-Time
     Email: testuser_[timestamp]@test.com (use unique email)
     Contact: 09123456789
     Address: Test Address
     Password: Test1234!
     ```
   - Click **Sign Up**
   - Wait for success message

4. **Immediately switch to Browser 1** (User Manager):
   ```
   ✅ Expected Results (within 1-2 seconds):
   
   Console:
   ✅ Total registered users updated: 48
   ✅ Loaded 48 users
   
   UI Updates:
   - Top stat card: "48" (increased from 47)
   - New row appears in table
   - Row shows: "Test User Real-Time"
   - Email: "testuser_[timestamp]@test.com"
   - NO PAGE REFRESH
   ```

#### Success Criteria
- ✅ Total user count increases by 1
- ✅ New user appears in table automatically
- ✅ User details are correct (name, email, role)
- ✅ Console shows both listeners updating
- ✅ Update happens within 1-2 seconds

---

### Test 3.2: User Table Filtering with Real-Time

**Duration**: 3 minutes  
**Difficulty**: Easy

#### Execution Steps
1. User Manager page open from previous test
2. Use search filter: Type "Test User Real-Time"
3. Table should filter to show only matching user
4. Clear search filter
5. Register ANOTHER new user in incognito tab
6. Verify new user appears even with filters cleared

#### Success Criteria
- ✅ Filtering works correctly
- ✅ Real-time updates work even when filters are active
- ✅ New users appear after clearing filters

---

### Test 3.3: Multiple Admin Tabs Coordination

**Duration**: 3 minutes  
**Difficulty**: Easy

#### Setup
- **Tab 1**: `admin-user-manager.html`
- **Tab 2**: `admin-user-manager.html` (same browser)
- **Incognito**: Signup page ready

#### Execution Steps
1. Arrange Tab 1 and Tab 2 side-by-side
2. Both show user count: "48"
3. Register new user in incognito
4. Watch BOTH tabs simultaneously

#### Expected Results
```
✅ Tab 1 Updates:
Total Users: 48 → 49
New row appears

✅ Tab 2 Updates (at same time):
Total Users: 48 → 49
New row appears

Both tabs update independently but simultaneously
```

#### Success Criteria
- ✅ Both tabs update in real-time
- ✅ Updates happen simultaneously (within 1 second of each other)
- ✅ No tab interference
- ✅ Both tabs show identical data

---

## 🧹 Test Suite 4: Listener Cleanup

### Test 4.1: Single Page Navigation Cleanup

**Duration**: 2 minutes  
**Difficulty**: Easy

#### Execution Steps
1. Open `admin-manage-inventory.html`
2. Console shows:
   ```
   [Real-Time Manager] ✅ Added listener: adminInventory (Total: 1)
   ```
3. Click sidebar link to navigate to `admin-tents-requests.html`
4. Console shows:
   ```
   [Real-Time Manager] 🚪 Page unloading, cleaning up listeners...
   [Real-Time Manager]   ✓ Cleaned: adminInventory
   [Real-Time Manager] ✅ All listeners cleaned up
   ```
5. New page loads with fresh listeners

#### Success Criteria
- ✅ Cleanup logs appear on navigation
- ✅ Old listener is removed
- ✅ New page starts with clean state

---

### Test 4.2: Multiple Listeners Cleanup

**Duration**: 2 minutes  
**Difficulty**: Easy

#### Execution Steps
1. Open `admin-user-manager.html`
2. Console shows 2 listeners:
   ```
   [Real-Time Manager] ✅ Added listener: adminUsersCount (Total: 1)
   [Real-Time Manager] ✅ Added listener: adminUsersData (Total: 2)
   ```
3. Navigate to another page
4. Console shows both cleaned:
   ```
   [Real-Time Manager] 🚪 Page unloading, cleaning up listeners...
   [Real-Time Manager]   ✓ Cleaned: adminUsersCount
   [Real-Time Manager]   ✓ Cleaned: adminUsersData
   [Real-Time Manager] ✅ All listeners cleaned up
   ```

#### Success Criteria
- ✅ Both listeners cleaned
- ✅ Total count resets to 0
- ✅ No memory leaks

---

### Test 4.3: Tab Close Cleanup

**Duration**: 1 minute  
**Difficulty**: Easy

#### Execution Steps
1. Open any Phase 2 page
2. Verify listeners are active
3. **Close the tab** (not just navigate away)
4. Reopen page in new tab
5. Verify listener count starts fresh at 1 or 2

#### Success Criteria
- ✅ Closing tab triggers cleanup
- ✅ Reopening starts with count 1
- ✅ No listener accumulation

---

## 🔧 Troubleshooting

### Issue 1: Calendar Not Updating

**Symptoms**: 
- Booking approved but calendar doesn't change
- Console shows no errors

**Solutions**:
1. Check if listener is active:
   ```
   Look for: [Real-Time Tents Calendar] ✅ Listener active
   ```
2. Verify booking status:
   ```
   Only "approved" and "in-progress" bookings appear
   Pending bookings don't show on calendar
   ```
3. Refresh page and retry

---

### Issue 2: Inventory Not Decreasing

**Symptoms**:
- Approved booking but inventory stays same

**Possible Causes**:
1. **Inventory document doesn't exist**:
   ```javascript
   // Check Firestore Console
   Collection: inventory
   Document: equipment
   
   If missing, page will create it automatically
   ```

2. **Listener not active**:
   ```
   Missing log: [Real-Time Inventory] ✅ Listener active
   Solution: Refresh page
   ```

3. **Wrong tab**:
   ```
   Make sure you're looking at inventory page, not tents admin page
   ```

---

### Issue 3: User Manager Not Showing New User

**Symptoms**:
- Registered user but count doesn't increase

**Solutions**:
1. Check if registration succeeded:
   ```
   - Should redirect to user.html
   - User should be logged in
   ```

2. Verify listeners are active:
   ```
   Should see TWO listeners:
   - adminUsersCount
   - adminUsersData
   ```

3. Check Firestore:
   ```
   Collection: users
   Should have new document with user's uid
   ```

---

### Issue 4: Console Shows Errors

**Common Errors**:

1. **"Permission denied"**:
   ```
   Cause: Not logged in or insufficient permissions
   Solution: Log in as admin
   ```

2. **"Failed to get document"**:
   ```
   Cause: Network issue or Firestore connection
   Solution: Check internet, refresh page
   ```

3. **"Listener already exists"**:
   ```
   Cause: Duplicate listener setup
   Solution: Navigate away and back (triggers cleanup)
   ```

---

## ✅ Success Criteria

### Phase 2 is Successful If:

#### User Calendars (2 pages)
- ✅ Both calendars show real-time booking updates
- ✅ Console logs appear correctly
- ✅ No page refresh needed
- ✅ Month navigation cleans up old listeners

#### Admin Inventory (1 page)
- ✅ Stock levels update when bookings approved
- ✅ Stock restores when bookings completed
- ✅ Real-time sync within 1-2 seconds
- ✅ Console shows "Inventory synced in real-time"

#### Admin User Manager (1 page)
- ✅ New user registration detected instantly
- ✅ Total count increases automatically
- ✅ New user appears in table
- ✅ Multiple tabs update simultaneously

#### Listener Cleanup (All pages)
- ✅ Navigation triggers cleanup logs
- ✅ Old listeners are removed
- ✅ No listener accumulation
- ✅ Fresh start on each page load

---

## 📊 Testing Completion Checklist

### Quick Checklist (Print and Check Off)

```
Phase 2 Testing - November 20, 2025

User Calendars:
[ ] Test 1.1: Tents calendar real-time updates
[ ] Test 1.2: Conference calendar real-time updates
[ ] Test 1.3: Month navigation cleanup

Admin Inventory:
[ ] Test 2.1: Stock decrease on approval
[ ] Test 2.2: Stock increase on completion
[ ] Test 2.3: Multiple rapid updates

Admin User Manager:
[ ] Test 3.1: New user registration detection
[ ] Test 3.2: Filtering with real-time
[ ] Test 3.3: Multiple admin coordination

Listener Cleanup:
[ ] Test 4.1: Single page navigation
[ ] Test 4.2: Multiple listeners cleanup
[ ] Test 4.3: Tab close cleanup

Overall:
[ ] All 12 tests passed
[ ] No console errors
[ ] Real-time updates < 2 seconds
[ ] No memory leaks detected

Tested by: _______________
Date: _______________
Signature: _______________
```

---

## 🎉 Congratulations!

If all tests pass, **Phase 2 is complete!** 🎊

Your system now has:
- ✅ 9 pages with real-time updates
- ✅ Proper listener cleanup
- ✅ Multi-user coordination
- ✅ Live inventory tracking
- ✅ Instant user registration detection

**Next Steps**:
1. Document any issues found during testing
2. Deploy to production/staging
3. Train admin users on new features
4. Monitor real-time performance in production

---

**Testing Guide Version**: 1.0  
**Last Updated**: November 20, 2025  
**Status**: Ready for Testing ✅
