# Real-Time Implementation Testing Guide

**Project**: Barangay Equipment Borrowing and Tracking System  
**Feature**: Real-Time Updates with Firebase onSnapshot  
**Last Updated**: November 19, 2025  
**Status**: Phase 1 Complete ✅ | Phase 2 Pending ⏳

---

## Table of Contents
1. [Testing Prerequisites](#testing-prerequisites)
2. [Phase 1 Testing (CURRENT)](#phase-1-testing-current)
3. [Phase 2 Testing (UPCOMING)](#phase-2-testing-upcoming)
4. [Common Issues & Troubleshooting](#common-issues--troubleshooting)
5. [Performance Testing](#performance-testing)
6. [Multi-User Testing](#multi-user-testing)

---

## Testing Prerequisites

### Required Accounts
- **1 User Account**: For testing user-side real-time updates
- **2 Admin Accounts**: For testing multi-admin coordination
- **Test Data**: At least 5 bookings (mix of pending, approved, in-progress)

### Browser Setup
- **Chrome/Edge** (recommended) or Firefox
- Enable Developer Tools (F12)
- Console tab open to monitor logs
- Network tab to verify Firebase connections

### Environment
- Stable internet connection (real-time requires active connection)
- Localhost server running: `python -m http.server 5500`
- Access URL: `http://localhost:5500`

### Before Starting Tests
1. Clear browser cache and cookies
2. Open DevTools Console (F12 → Console tab)
3. Log in with test account
4. Verify Firebase connection in console (look for `✅` checkmarks)

---

## Phase 1 Testing (CURRENT)

### 🎯 Test Scope
Phase 1 covers **5 core pages** with real-time updates:
1. User Profile - Requests Tab
2. User Profile - Notifications Tab
3. Admin Tents Requests Page
4. Admin Conference Requests Page
5. Admin Dashboard

---

### Test Suite 1: User Profile - Requests Tab

**Page**: `UserProfile.html` (Requests tab)  
**Real-Time Feature**: Instant booking status updates

#### Test 1.1: Status Update (User → Admin → User)
**Objective**: Verify user sees instant status changes without refresh

**Steps**:
1. Log in as **User** in Browser 1
2. Navigate to `UserProfile.html` → **Requests** tab
3. Note a pending request (e.g., "Conference Room - Nov 20")
4. Open Browser 2, log in as **Admin**
5. Navigate to `admin-conference-requests.html`
6. Find the same request and click **Approve**
7. **Immediately switch to Browser 1** (User)

**Expected Results**:
- ✅ Toast notification appears in Browser 1: "✅ Your request status changed to approved"
- ✅ Request status badge changes from **Pending** (orange) → **Approved** (blue)
- ✅ No page refresh needed
- ✅ Console logs show: `[Real-Time User Requests] ✏️ Request modified`

**Console Verification**:
```
[Real-Time User Requests] 🏛️ Conference requests updated: 3
[Real-Time User Requests]   ✏️ Request modified: [requestId]
[Real-Time User Requests] ✅ Processed 2 tents requests, 3 conference requests
```

#### Test 1.2: Rejection with Reason
**Steps**:
1. User has pending request visible in Browser 1
2. Admin (Browser 2) clicks **Deny** on the request
3. Admin enters reason: "Conference room unavailable on that date"
4. Admin clicks **Yes, Deny Request**
5. Check Browser 1 (User)

**Expected Results**:
- ✅ Toast: "❌ Your request status changed to rejected"
- ✅ Status badge → **Rejected** (red)
- ✅ Click "View Details" → shows rejection reason
- ✅ No refresh needed

#### Test 1.3: Multiple Status Changes
**Steps**:
1. User profile open (Browser 1)
2. Admin approves 3 requests in quick succession
3. Observe Browser 1

**Expected Results**:
- ✅ 3 separate toast notifications appear (one per request)
- ✅ All 3 status badges update to **Approved**
- ✅ Console shows 3 modification logs
- ✅ UI doesn't freeze or lag

#### Test 1.4: Filter by Status (Real-Time)
**Steps**:
1. User profile → Requests tab
2. Set filter to **Pending**
3. Admin approves one of the visible pending requests
4. Observe Browser 1

**Expected Results**:
- ✅ Approved request **disappears from filtered view** (no longer pending)
- ✅ Toast notification still appears
- ✅ Switching filter to "All" shows the approved request

---

### Test Suite 2: User Profile - Notifications Tab

**Page**: `UserProfile.html` (Notifications tab)  
**Real-Time Feature**: Instant notification delivery

#### Test 2.1: Notification on Status Change
**Steps**:
1. User logged in, **Notifications** tab open (Browser 1)
2. Note current notification count (e.g., "5 notifications")
3. Admin approves a user request (Browser 2)
4. Switch to Browser 1

**Expected Results**:
- ✅ Toast: "🔔 New notification received"
- ✅ New notification appears at **top of list**
- ✅ Badge count increases (e.g., "5" → "6")
- ✅ Notification shows correct type: "✅ Request Approved"
- ✅ No refresh needed

**Console Verification**:
```
[Real-Time Notifications] 🔔 Notifications updated: 6
[Real-Time Notifications]   ➕ New notification received
[Real-Time Notifications] ✅ Processed 6 notifications
```

#### Test 2.2: Mark as Read (Real-Time Sync)
**Steps**:
1. Notifications tab open with unread notifications
2. Click **Mark as Read** on one notification
3. Check console logs

**Expected Results**:
- ✅ Notification icon changes (unread → read)
- ✅ Console shows: `[Real-Time Notifications]   ✏️ Notification modified`
- ✅ Unread count decreases in badge

#### Test 2.3: Delete Notification
**Steps**:
1. Notifications tab open with 5 notifications
2. Click **Delete** (trash icon) on one notification
3. Confirm deletion

**Expected Results**:
- ✅ Notification **disappears from list**
- ✅ Total count decreases (5 → 4)
- ✅ Console shows: `[Real-Time Notifications]   ➖ Notification removed`

#### Test 2.4: Filter Real-Time Notifications
**Steps**:
1. Set filter to **Unread**
2. Admin triggers new notification (e.g., approve request)
3. Observe list

**Expected Results**:
- ✅ New notification appears in **Unread** filter view
- ✅ Toast notification appears
- ✅ Switching to "All" shows all notifications

---

### Test Suite 3: Admin Tents Requests Page

**Page**: `admin-tents-requests.html`  
**Real-Time Feature**: Live request updates + inventory tracking

#### Test 3.1: New Request Notification
**Steps**:
1. Admin page open in Browser 1 (`admin-tents-requests.html`)
2. Note current "Total Requests" count (e.g., "12 Total")
3. User submits new tents/chairs request (Browser 2)
4. **Immediately switch to Browser 1**

**Expected Results**:
- ✅ Toast: "📬 New tents/chairs request from [User Name]"
- ✅ **Total Requests** stat increases (12 → 13)
- ✅ **Pending Requests** stat increases
- ✅ New request appears in table (no refresh)
- ✅ Console logs: `[Real-Time Admin Tents]   ➕ New request from: [Name]`

**Console Verification**:
```
[Real-Time Admin Tents] 🎪 Requests updated: 13
[Real-Time Admin Tents]   ➕ New request from: Juan Dela Cruz
[Real-Time Admin Tents] ✅ Processed 13 requests
```

#### Test 3.2: Approve Request (Inventory Update)
**Steps**:
1. Admin page open
2. Note "Available Tents" count (e.g., "18 available")
3. Click **Approve** on pending request (e.g., 3 tents requested)
4. Confirm approval in modal (shows inventory preview)
5. Observe stats

**Expected Results**:
- ✅ Confirmation modal shows: "Available Tents: 18 → 15"
- ✅ After approval, **Pending** stat decreases
- ✅ **Approved** stat increases
- ✅ **Available Tents** updates to "15"
- ✅ Request moves to "Approved" status in table

#### Test 3.3: Multi-Admin Coordination
**Steps**:
1. **Admin 1** (Browser 1): `admin-tents-requests.html` open
2. **Admin 2** (Browser 2): Same page open
3. Admin 1 clicks **Approve** on a request
4. **Before Admin 1 confirms**, Admin 2 also clicks **Approve** on the same request
5. Admin 1 confirms approval first
6. Check what happens to Admin 2's modal

**Expected Results**:
- ✅ Admin 1 successfully approves request
- ✅ **Admin 2 sees real-time update**: Request disappears or status changes
- ✅ Admin 2's approval modal becomes invalid (request no longer pending)
- ✅ Prevents duplicate approvals (safety mechanism)

#### Test 3.4: Mark as Completed (Inventory Return)
**Steps**:
1. Admin page with approved request (e.g., 5 tents in use)
2. Note "Available Tents" (e.g., "15 available")
3. Click **Mark as Completed** on approved request
4. Confirm completion

**Expected Results**:
- ✅ Status changes to **Completed**
- ✅ **Approved** stat decreases
- ✅ **Completed** stat increases
- ✅ **Available Tents** increases back (15 → 20)
- ✅ Console logs inventory recalculation

---

### Test Suite 4: Admin Conference Requests Page

**Page**: `admin-conference-requests.html`  
**Real-Time Feature**: Live request updates

#### Test 4.1: New Conference Request
**Steps**:
1. Admin conference page open (Browser 1)
2. User submits conference room request (Browser 2)
3. Switch to Browser 1

**Expected Results**:
- ✅ Toast: "📬 New conference room request from [Name]"
- ✅ Request appears in table instantly
- ✅ **Total Requests** stat increases
- ✅ **Pending Requests** stat increases

#### Test 4.2: Approve with Time Overlap Check
**Steps**:
1. Admin page open
2. Approve request for "Nov 20, 2:00 PM - 4:00 PM"
3. User submits overlapping request: "Nov 20, 3:00 PM - 5:00 PM"
4. Check if admin sees overlap warning (note: overlap prevention is in user form)

**Expected Results**:
- ✅ First request approved successfully
- ✅ Second request appears in admin panel (pending)
- ✅ Admin can see both requests for same date
- ✅ Stats update correctly

#### Test 4.3: Cancel Internal Booking
**Steps**:
1. Admin creates internal booking (from dashboard or internal booking form)
2. Open `admin-conference-requests.html`
3. Find the internal booking (flagged as "Internal")
4. Click **Cancel** button (orange)
5. Enter cancellation reason: "Event postponed"
6. Confirm cancellation

**Expected Results**:
- ✅ Status changes to **Cancelled**
- ✅ **Approved** stat decreases
- ✅ Request moves to History tab
- ✅ Time slot becomes available again
- ✅ Console logs cancellation

---

### Test Suite 5: Admin Dashboard

**Page**: `admin.html`  
**Real-Time Feature**: Live pending counts + weekly reservations

#### Test 5.1: Pending Badge Updates
**Steps**:
1. Admin dashboard open (Browser 1)
2. Note pending badges (e.g., "Conference Room: 3 Pending", "Tents & Chairs: 5 Pending")
3. User submits new conference request (Browser 2)
4. Check Browser 1

**Expected Results**:
- ✅ "Conference Room" badge updates: "3 Pending" → "4 Pending"
- ✅ Badge color stays red (has pending requests)
- ✅ No page refresh needed
- ✅ Console: `[Real-Time Dashboard] 📊 Pending conference requests: 4`

#### Test 5.2: Badge Changes to Gray (No Pending)
**Steps**:
1. Dashboard open with pending requests (red badge)
2. Admin opens review page, approves/rejects all pending requests
3. Check dashboard

**Expected Results**:
- ✅ Badge updates to "0 Pending"
- ✅ Badge color changes: red → gray
- ✅ Indicates no action needed

#### Test 5.3: Weekly Calendar Updates
**Steps**:
1. Dashboard open showing current week calendar
2. Note dates with reservations (colored dots)
3. Admin approves a new request for a date in current week
4. Check dashboard calendar

**Expected Results**:
- ✅ Calendar updates to show new reservation
- ✅ Date gets colored dot/indicator
- ✅ Clicking date shows updated reservation list
- ✅ Reservation count increases for that date

#### Test 5.4: Inventory Counts (Dashboard)
**Steps**:
1. Dashboard open
2. Note "Available Tents" and "Available Chairs" counts
3. Admin approves tents/chairs request (e.g., 3 tents, 50 chairs)
4. Check dashboard

**Expected Results**:
- ✅ "Available Tents" decreases by 3
- ✅ "Available Chairs" decreases by 50
- ✅ Counts update without refresh
- ✅ Console logs inventory recalculation

---

## Phase 2 Testing (UPCOMING)

### 🔜 Test Scope
Phase 2 will cover **6 additional pages**:
1. User Tents Calendar (`tents-calendar.html`)
2. User Conference Calendar (`conference-room.html`)
3. Admin Tents Calendar (`admin-calendar-tents.html`)
4. Admin Conference Calendar (`admin-calendar-conference.html`)
5. Admin Manage Inventory (`admin-manage-inventory.html`)
6. Admin User Manager (`admin-user-manager.html`)

---

### Test Suite 6: User Tents Calendar (Phase 2)

**Page**: `tents-calendar.html`  
**Real-Time Feature**: Live booking availability

#### Test 6.1: Booked Dates Update (Pending)
**Steps**:
1. User calendar open showing available dates
2. Admin approves booking for Nov 25-27
3. Check calendar

**Expected Results** (Phase 2):
- ✅ Nov 25, 26, 27 marked as "Booked" (red/unavailable)
- ✅ Clicking booked date shows "Unavailable - Already reserved"
- ✅ No refresh needed

#### Test 6.2: Date Becomes Available (Pending)
**Steps**:
1. Calendar showing booked date
2. Admin marks booking as completed
3. Check calendar

**Expected Results** (Phase 2):
- ✅ Date changes: Booked → Available (green)
- ✅ User can now click to submit request
- ✅ Real-time availability update

---

### Test Suite 7: User Conference Calendar (Phase 2)

**Page**: `conference-room.html`  
**Real-Time Feature**: Live time slot availability

#### Test 7.1: Time Slots Update (Pending)
**Steps**:
1. User selects date on conference calendar
2. Views available time slots
3. Admin approves booking for 2:00 PM - 4:00 PM
4. Check time slot picker

**Expected Results** (Phase 2):
- ✅ 2:00 PM - 4:00 PM marked as unavailable
- ✅ Available slots update instantly
- ✅ User sees current availability

---

### Test Suite 8: Admin Calendars (Phase 2)

**Pages**: `admin-calendar-tents.html`, `admin-calendar-conference.html`  
**Real-Time Feature**: Live booking visualization

#### Test 8.1: Calendar View Updates (Pending)
**Steps**:
1. Admin calendar open (monthly view)
2. New booking approved for date in current month
3. Check calendar

**Expected Results** (Phase 2):
- ✅ Date shows new booking indicator
- ✅ Booking count increases for that date
- ✅ Clicking date shows updated modal with all bookings

#### Test 8.2: Multi-Day Booking Visualization (Pending)
**Steps**:
1. Admin tents calendar open
2. Approve booking: Nov 20-25 (6 days)
3. Check calendar

**Expected Results** (Phase 2):
- ✅ All dates Nov 20-25 marked as booked
- ✅ Hover shows booking details
- ✅ Visual indicator spans multiple days

---

### Test Suite 9: Admin Manage Inventory (Phase 2)

**Page**: `admin-manage-inventory.html`  
**Real-Time Feature**: Live stock counts

#### Test 9.1: Stock Updates from Bookings (Pending)
**Steps**:
1. Inventory page open
2. Admin approves tents booking (5 tents)
3. Check inventory page

**Expected Results** (Phase 2):
- ✅ "Tents In Use" increases by 5
- ✅ "Available Tents" decreases by 5
- ✅ No refresh needed

#### Test 9.2: Manual Adjustment Sync (Pending)
**Steps**:
1. Admin 1: Inventory page open
2. Admin 2: Adjusts total tents (24 → 30)
3. Check Admin 1's page

**Expected Results** (Phase 2):
- ✅ "Total Tents" updates to 30
- ✅ "Available Tents" recalculates
- ✅ Toast notification about change

---

### Test Suite 10: Admin User Manager (Phase 2)

**Page**: `admin-user-manager.html`  
**Real-Time Feature**: Live user count

#### Test 10.1: New User Registration (Pending)
**Steps**:
1. User Manager page open
2. Note total user count (e.g., "42 Registered Users")
3. New user signs up
4. Check User Manager

**Expected Results** (Phase 2):
- ✅ User count increases (42 → 43)
- ✅ New user appears in list
- ✅ No refresh needed

---

## Common Issues & Troubleshooting

### Issue 1: Toast Notifications Not Appearing
**Symptoms**:
- Console shows updates but no toast appears
- UI updates but silently

**Troubleshooting**:
1. Check if `showToast()` function exists in script.js
2. Verify toast CSS is loaded (check `style.css`)
3. Look for JavaScript errors in console (F12)
4. Check if toast container exists in DOM

**Expected Console**:
```
[Real-Time ...] ✅ Processed X requests
```
If you see ✅ but no toast, check toast function.

---

### Issue 2: Updates Not Reflecting
**Symptoms**:
- Admin approves request, user doesn't see change
- Console shows no real-time logs

**Troubleshooting**:
1. Check internet connection (real-time requires active connection)
2. Verify Firebase listener is active: Look for `[Real-Time ...] ✅ Listener active`
3. Check for errors: `[Real-Time ...] ❌ Listener error`
4. Verify user is on correct page (e.g., UserProfile.html for user tests)
5. Try logout → login to restart listeners

**Fix**:
```
If listener failed to start:
1. Refresh page (F5)
2. Check Firebase console for service issues
3. Verify Firestore security rules allow read access
```

---

### Issue 3: Multiple Toast Notifications (Spam)
**Symptoms**:
- Single action triggers multiple toasts
- Toast flood on page load

**Expected Behavior**:
- Toast should only appear for changes **after initial load**
- Code checks: `if (allRequests.length > 0)` before showing toast

**Troubleshooting**:
1. Check if initial data has loaded before showing toasts
2. Look for duplicate listeners in console (multiple `Listener active` logs for same key)
3. Verify `realtimeManager.addListener()` uses unique keys

---

### Issue 4: Memory Leak Warning
**Symptoms**:
- Browser console shows: "Detached listeners" warning
- Memory usage increases after logout/login cycles

**Troubleshooting**:
1. Check if `realtimeManager.cleanup()` is called on logout
2. Verify `beforeunload` event listener exists
3. Look for console log: `[Real-Time Manager] 🧹 Cleaning up X listeners`

**Test**:
```
1. Open Performance Monitor (DevTools → Performance)
2. Log in → log out → log in (repeat 5 times)
3. Check listener count (should not increase)
4. Memory usage should stabilize
```

---

### Issue 5: Stale Data After Network Disconnect
**Symptoms**:
- Internet disconnects briefly
- Page shows old data when reconnected

**Current Limitation**:
- No offline support in Phase 1
- Listeners don't auto-reconnect on network restore

**Workaround**:
1. Refresh page (F5) after network restores
2. Or logout → login to restart listeners

**Future Fix (Phase 2+)**:
- Implement offline detection
- Auto-reconnect listeners on network restore

---

## Performance Testing

### Test P1: Page Load Performance
**Objective**: Ensure real-time listeners don't slow down page load

**Steps**:
1. Open DevTools → Network tab
2. Clear cache and hard reload (Ctrl+Shift+R)
3. Load `UserProfile.html`
4. Measure time to "Listener active" log

**Acceptable Performance**:
- ✅ Page loads in < 2 seconds
- ✅ Listeners active in < 3 seconds
- ✅ No console errors
- ✅ UI interactive immediately

---

### Test P2: Update Latency
**Objective**: Measure time from action to UI update

**Steps**:
1. Note timestamp when admin clicks "Approve" (Browser 2)
2. Note timestamp when toast appears in user profile (Browser 1)
3. Calculate latency

**Acceptable Performance**:
- ✅ Update appears in < 2 seconds
- ✅ Toast appears within 3 seconds
- ✅ No UI freeze or lag

---

### Test P3: High-Frequency Updates
**Objective**: Test system with rapid consecutive changes

**Steps**:
1. Admin approves 10 requests in rapid succession (1 per second)
2. Observer user profile with all 10 requests visible
3. Monitor UI responsiveness

**Acceptable Performance**:
- ✅ All 10 toasts appear (may stack)
- ✅ All 10 status badges update
- ✅ No browser freeze
- ✅ No missing updates

---

### Test P4: Large Dataset
**Objective**: Test with many requests loaded

**Steps**:
1. Create 100+ test requests
2. Open admin tents page
3. Check load time and responsiveness

**Acceptable Performance**:
- ✅ Page loads in < 5 seconds
- ✅ Table renders all requests
- ✅ Real-time updates still work
- ✅ No performance degradation

---

## Multi-User Testing

### Test M1: Concurrent Admin Actions
**Scenario**: Two admins working simultaneously

**Steps**:
1. Admin 1 and Admin 2 both open `admin-tents-requests.html`
2. Admin 1 approves Request A
3. Admin 2 approves Request B (different request)
4. Both admins work independently for 5 minutes

**Expected Results**:
- ✅ Both admins see each other's actions in real-time
- ✅ No conflicts or lost updates
- ✅ Statistics consistent across both screens
- ✅ Inventory counts match on both screens

---

### Test M2: Admin-User Coordination
**Scenario**: Admin approving while user is viewing

**Steps**:
1. User has 3 pending requests visible
2. Admin approves all 3 in quick succession
3. User watches profile page

**Expected Results**:
- ✅ User sees 3 separate toasts (one per approval)
- ✅ All 3 statuses update to "Approved"
- ✅ User doesn't need to refresh
- ✅ Smooth UX, no confusion

---

### Test M3: Race Condition Test
**Scenario**: Prevent double-approval of same request

**Steps**:
1. Admin 1 and Admin 2 both viewing same pending request
2. Admin 1 clicks "Approve" at 10:00:00
3. Admin 2 clicks "Approve" at 10:00:01 (1 second later)
4. Admin 1 confirms approval first

**Expected Results**:
- ✅ Admin 1 successfully approves
- ✅ Admin 2's screen updates: request changes to "Approved"
- ✅ Admin 2's modal either auto-closes or shows error
- ✅ Inventory deducted only once (no double deduction)
- ✅ No duplicate approvals in Firestore

---

## Test Completion Checklist

### Phase 1 Testing Sign-Off

**QA Tester**: _________________  
**Date**: _________________

- [ ] **Test Suite 1** - User Profile Requests (4 tests)
- [ ] **Test Suite 2** - User Profile Notifications (4 tests)
- [ ] **Test Suite 3** - Admin Tents Requests (4 tests)
- [ ] **Test Suite 4** - Admin Conference Requests (3 tests)
- [ ] **Test Suite 5** - Admin Dashboard (4 tests)
- [ ] **Performance Tests** - P1, P2, P3, P4 (4 tests)
- [ ] **Multi-User Tests** - M1, M2, M3 (3 tests)

**Total Tests**: 26 tests  
**Tests Passed**: _____ / 26  
**Critical Issues Found**: _____  
**Non-Critical Issues Found**: _____

**Overall Status**: ⬜ PASS | ⬜ FAIL | ⬜ PASS WITH ISSUES

**Notes**:
```
[Add any observations, bugs found, or recommendations here]
```

---

### Phase 2 Testing Sign-Off (PENDING)

**QA Tester**: _________________  
**Date**: _________________

- [ ] **Test Suite 6** - User Tents Calendar (Pending)
- [ ] **Test Suite 7** - User Conference Calendar (Pending)
- [ ] **Test Suite 8** - Admin Calendars (Pending)
- [ ] **Test Suite 9** - Admin Manage Inventory (Pending)
- [ ] **Test Suite 10** - Admin User Manager (Pending)

**Status**: 🔜 Awaiting Phase 2 Implementation

---

## Quick Reference: Console Log Prefixes

Use these to filter console logs during testing (DevTools → Console → Filter):

| Prefix | Component |
|--------|-----------|
| `[Real-Time Manager]` | Core listener management |
| `[Real-Time User Requests]` | User profile requests tab |
| `[Real-Time Notifications]` | User profile notifications tab |
| `[Real-Time Admin Tents]` | Admin tents requests page |
| `[Real-Time Admin Conference]` | Admin conference requests page |
| `[Real-Time Dashboard]` | Admin dashboard stats |

**Filter Example**:
- Type `[Real-Time` in console filter to see only real-time logs
- Type `[Real-Time User` to see only user-related logs
- Type `✅` to see only success messages

---

## Test Data Setup Guide

### Creating Test Bookings

**Tents & Chairs Request**:
1. Log in as user
2. Go to `tents-calendar.html`
3. Click available date
4. Fill form:
   - Tents: 2, Chairs: 40
   - Mode: Delivery
   - Date: Nov 25 - Nov 27
5. Submit (status: pending)

**Conference Room Request**:
1. Log in as user
2. Go to `conference-room.html`
3. Click available date
4. Fill form:
   - Purpose: "Community Meeting"
   - Time: 2:00 PM - 4:00 PM
   - Date: Nov 26
5. Submit (status: pending)

**Ideal Test Dataset**:
- 5 Pending Tents Requests
- 5 Pending Conference Requests
- 3 Approved Tents Requests (for completion testing)
- 3 Approved Conference Requests (for completion testing)
- 2 Completed Requests (for history view)
- 2 Rejected Requests (for history view)

---

## Reporting Issues

### Issue Report Template

```markdown
**Issue Title**: [Brief description]

**Test Suite**: [e.g., Test Suite 1, Test 1.2]

**Severity**: ⬜ Critical | ⬜ High | ⬜ Medium | ⬜ Low

**Browser**: [Chrome/Firefox/Edge + version]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Console Logs**:
```
[Paste relevant console logs here]
```

**Screenshots**: [Attach if applicable]

**Workaround**: [If known]
```

### Example Issue Report

```markdown
**Issue Title**: Toast notification not appearing on request approval

**Test Suite**: Test Suite 1, Test 1.1

**Severity**: ⬜ Critical | ✅ High | ⬜ Medium | ⬜ Low

**Browser**: Chrome 120.0.6099.109

**Steps to Reproduce**:
1. User profile open in Browser 1
2. Admin approves request in Browser 2
3. Status badge updates but no toast appears

**Expected Result**:
Toast notification should appear: "✅ Your request status changed to approved"

**Actual Result**:
Status badge updates to "Approved" but no toast notification

**Console Logs**:
```
[Real-Time User Requests] 🏛️ Conference requests updated: 3
[Real-Time User Requests]   ✏️ Request modified: abc123
[Real-Time User Requests] ✅ Processed 3 conference requests
```

**Screenshots**: [Screenshot showing updated badge but no toast]

**Workaround**: Status still updates correctly, only visual feedback missing
```

---

## Contact & Support

**Developer**: AI Agent (Claude Sonnet 4.5)  
**Project Owner**: ROSADO  
**Repository**: `Barangay-Equipment-Borrowing-and-Tracking-System`

**For Questions**:
- Check `PHASE1_REALTIME_IMPLEMENTATION_COMPLETE.md` for technical details
- Review console logs with appropriate prefix filters
- Check Firestore console for data verification

**Emergency Rollback**:
If critical issues found in production:
1. Revert to previous commit before Phase 1 implementation
2. Disable real-time listeners by removing `setupRealtime*()` calls
3. Restore original `loadAllRequests()` function calls

---

**Document Version**: 1.0  
**Last Updated**: November 19, 2025  
**Status**: Phase 1 Ready for Testing ✅
