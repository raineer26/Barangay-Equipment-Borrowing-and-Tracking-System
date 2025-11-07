# Notification System - Testing Guide

## 🎯 Overview
This guide provides step-by-step instructions to test all notification features implemented in the Barangay Equipment Borrowing System.

---

## 🔧 Prerequisites

### 1. Firebase Setup
- [ ] Firebase project configured with Firestore
- [ ] Authentication enabled (Email/Password)
- [ ] At least 2 test accounts created:
  - **User Account**: test-user@example.com
  - **Admin Account**: test-admin@example.com (with `role: "admin"` in Firestore)

### 2. Firestore Collections
Ensure these collections exist:
- [ ] `users` - User profiles
- [ ] `tentsChairsBookings` - Tents & chairs requests
- [ ] `conferenceRoomBookings` - Conference room requests
- [ ] `notifications` - User notifications (will be created automatically)

### 3. Local Development Server
```powershell
# Start local server
python -m http.server 5500

# Open in browser
http://localhost:5500
```

---

## 📋 Test Scenarios

### **SCENARIO 1: Notification Tab Display**

#### Test Steps:
1. Login as user (test-user@example.com)
2. Navigate to UserProfile page
3. Click on "Notifications" tab

#### Expected Results:
✅ Tab switches smoothly  
✅ Shows "No notifications yet" if empty  
✅ Filter dropdown visible (All, Unread, Read)  
✅ "Mark All as Read" button visible  
✅ Email icon in navigation shows badge if unread notifications exist  

#### Console Logs to Check:
```
[Notifications Tab] Tab initialized
[Notifications] Loading notifications...
[Notifications] Found X notifications
[Notifications] Rendering X notifications
```

---

### **SCENARIO 2: Request Approval Notification**

#### Test Steps:
1. **As User:**
   - Login as test-user@example.com
   - Submit a tents & chairs request
   - Note the request details (date, quantities)
   - Logout

2. **As Admin:**
   - Login as test-admin@example.com
   - Navigate to admin-tents-requests.html
   - Find the pending request
   - Click "Approve" button
   - Confirm approval
   - Logout

3. **As User:**
   - Login as test-user@example.com
   - Navigate to UserProfile
   - Click "Notifications" tab

#### Expected Results:
✅ New notification appears with green checkmark icon (✅)  
✅ Title: "✅ Request Approved"  
✅ Message includes event date and delivery mode  
✅ Notification marked as unread (bold text, blue dot)  
✅ Email icon shows badge "1"  
✅ Clicking notification navigates to Requests tab  
✅ Shows formatted time (e.g., "2 minutes ago")  

#### Console Logs to Check:
```
[Admin Action] Creating approval notification for user: [userId]
[Notification Creator] ═══════════════════════════════════
[Notification Creator] Creating new notification...
[Notification Creator] Type: status_change
[Notification Creator] For user: [userId]
[Notification Creator] ✓ Notification created successfully
[Status Change Notification] ✓ Notification created successfully
```

---

### **SCENARIO 3: Request Rejection Notification**

#### Test Steps:
1. **As User:**
   - Submit a conference room request
   - Logout

2. **As Admin:**
   - Login as admin
   - Navigate to admin-conference-requests.html
   - Find pending request
   - Click "Deny" button
   - Enter reason: "Room already booked for that time"
   - Confirm rejection
   - Logout

3. **As User:**
   - Login and check notifications

#### Expected Results:
✅ Notification has red X icon (❌)  
✅ Title: "❌ Request Rejected"  
✅ Message includes rejection reason  
✅ Notification is unread  
✅ Badge count updated  

#### Console Logs:
```
[Admin Action] Creating rejection notification for user: [userId]
[Notification Creator] Type: status_change
[Status Change Notification] ✓ Notification created successfully
```

---

### **SCENARIO 4: Tomorrow Reminder**

#### Test Steps:
1. **Setup:**
   - Create a tents booking with startDate = tomorrow's date (YYYY-MM-DD)
   - Ensure status is "approved"

2. **Trigger:**
   - Logout and login again (triggers automated check)
   - OR wait 2 seconds after page load
   - Check notifications tab

#### Expected Results:
✅ Bell icon notification (🔔)  
✅ Title: "🔔 Tomorrow: Event Reminder"  
✅ Message mentions event is tomorrow  
✅ Includes item details (chairs, tents)  
✅ Shows delivery/pickup instructions  

#### Console Logs:
```
[UserProfile] Running automated reminder check...
[Auto Reminders] ═══════════════════════════════════════════════════
[Auto Reminders] Checking for events that need reminders...
[Auto Reminders] Today: 2025-01-20
[Auto Reminders] Tomorrow: 2025-01-21
[Auto Reminders] Found X active tents bookings
[Auto Reminders] 🔔 Creating tomorrow reminder for [requestId]
[Tomorrow Reminder] ═══════════════════════════════════
[Tomorrow Reminder] Request ID: [requestId]
[Tomorrow Reminder] Event date: 2025-01-21
[Tomorrow Reminder] ✓ Reminder notification created
[Auto Reminders] ✓ Automated reminder check completed
```

---

### **SCENARIO 5: Today Event Notification**

#### Test Steps:
1. **Setup:**
   - Create a conference booking with eventDate = today's date
   - Status must be "approved"

2. **Trigger:**
   - Reload UserProfile page
   - Wait 2 seconds
   - Check notifications

#### Expected Results:
✅ Party icon (🎉)  
✅ Title: "🎉 Today: Your Event is Happening Now!"  
✅ Message says event is today  
✅ Includes time range  
✅ Reminds to clean up  

#### Console Logs:
```
[Auto Reminders] 🎉 Creating today notification for [requestId]
[Today Event] ═══════════════════════════════════
[Today Event] Request ID: [requestId]
[Today Event] Event is TODAY
[Today Event] ✓ Today event notification created
```

---

### **SCENARIO 6: Ending Soon Reminder**

#### Test Steps:
1. **Setup:**
   - Create tents booking with endDate = today's date
   - Status = "in-progress"

2. **Trigger:**
   - Reload page
   - Check notifications

#### Expected Results:
✅ Clock icon (⏰)  
✅ Title: "⏰ Ending Soon: Prepare to Return/Vacate"  
✅ Message reminds to return items today  
✅ Mentions cleaning/condition requirements  

#### Console Logs:
```
[Auto Reminders] ⏰ Creating ending soon reminder for [requestId]
[Ending Soon] ═══════════════════════════════════
[Ending Soon] Request ID: [requestId]
[Ending Soon] Event ending soon
[Ending Soon] ✓ Ending soon notification created
```

---

### **SCENARIO 7: 3-Day Advance Reminder**

#### Test Steps:
1. **Setup:**
   - Create booking with startDate/eventDate = 3 days from today
   - Calculate: If today is Jan 20, set date to Jan 23

2. **Trigger:**
   - Reload UserProfile page

#### Expected Results:
✅ Calendar icon (📅)  
✅ Title: "📅 3-Day Reminder: Event Coming Up"  
✅ Message mentions event in 3 days  
✅ Suggests finalizing preparations  

#### Console Logs:
```
[Auto Reminders] In 3 days: 2025-01-23
[Auto Reminders] 📅 Creating 3-day reminder for [requestId]
[3-Day Reminder] ═══════════════════════════════════
[3-Day Reminder] Request ID: [requestId]
[3-Day Reminder] Event in 3 days
[3-Day Reminder] ✓ 3-day reminder created
```

---

### **SCENARIO 8: Mark as Read**

#### Test Steps:
1. Have at least 1 unread notification
2. Click on the notification

#### Expected Results:
✅ Blue dot disappears  
✅ Text changes from bold to normal  
✅ Background color changes to lighter shade  
✅ Badge count decreases by 1  
✅ Email icon badge updates  

#### Console Logs:
```
[Notifications] Marking notification as read: [notificationId]
[Notifications] ✓ Notification marked as read
```

---

### **SCENARIO 9: Mark All as Read**

#### Test Steps:
1. Have multiple unread notifications
2. Click "Mark All as Read" button

#### Expected Results:
✅ All blue dots disappear  
✅ All notifications change to read style  
✅ Badge count goes to 0  
✅ Email icon badge disappears  
✅ Toast message confirms action  

#### Console Logs:
```
[Notifications] Marking all notifications as read...
[Notifications] ✓ Marked X notifications as read
```

---

### **SCENARIO 10: Delete Notification**

#### Test Steps:
1. Click trash icon on any notification
2. Confirm deletion

#### Expected Results:
✅ Notification removed from list  
✅ Deleted from Firestore  
✅ If was unread, badge count decreases  
✅ Toast confirms deletion  

#### Console Logs:
```
[Notifications] Deleting notification: [notificationId]
[Notifications] ✓ Notification deleted successfully
```

---

### **SCENARIO 11: Filter Notifications**

#### Test Steps:
1. Have mix of read and unread notifications
2. Click filter dropdown
3. Select "Unread"
4. Verify only unread shown
5. Select "Read"
6. Verify only read shown
7. Select "All"
8. Verify all shown

#### Expected Results:
✅ Filter updates immediately  
✅ Correct notifications displayed  
✅ Empty state message if no matches  
✅ Count updates correctly  

#### Console Logs:
```
[Notifications] Filtering notifications: unread
[Notifications] Rendering X notifications after filter
```

---

### **SCENARIO 12: Auto-Refresh**

#### Test Steps:
1. Open UserProfile in one browser tab
2. Open admin panel in another tab (or use admin account)
3. Approve a request
4. Wait up to 5 minutes (auto-refresh interval)
5. Check user's notification tab

#### Expected Results:
✅ New notification appears automatically  
✅ Badge updates without page reload  
✅ No duplicate notifications  

#### Console Logs:
```
[Notifications] Auto-refreshing notifications...
[Notifications] Found X notifications
[Notifications] ✓ Auto-refresh complete
```

---

### **SCENARIO 13: Duplicate Prevention**

#### Test Steps:
1. Create booking for tomorrow
2. Reload UserProfile 3 times
3. Check notifications

#### Expected Results:
✅ Only ONE tomorrow reminder created  
✅ No duplicate notifications  
✅ Console shows "reminder already sent" check  

#### Console Logs:
```
[Auto Reminders] Checking for events that need reminders...
[Auto Reminders] Found 1 active tents bookings
[Auto Reminders] Checking existing reminders for requestId
# Should NOT create duplicate if already exists
```

---

### **SCENARIO 14: View Request from Notification**

#### Test Steps:
1. Click on a notification
2. Page should switch to Requests tab

#### Expected Results:
✅ Requests tab becomes active  
✅ Request list loads  
✅ Related request is visible  
✅ Notification marked as read  

#### Console Logs:
```
[Notifications] Viewing request from notification: [requestId]
[Notifications] Marking notification as read
[Notifications] Switching to Requests tab
```

---

### **SCENARIO 15: Empty State**

#### Test Steps:
1. Login with new account (no notifications)
2. Check Notifications tab

#### Expected Results:
✅ Shows envelope icon  
✅ Message: "No notifications yet"  
✅ Subtext explains what notifications are  
✅ No errors in console  

---

### **SCENARIO 16: Badge Display**

#### Test Steps:
1. Have unread notifications
2. Check navigation bar

#### Expected Results:
✅ Email icon shows red badge  
✅ Badge number matches unread count  
✅ Badge disappears when all read  
✅ Badge max shows "9+" for 10+ notifications  

---

### **SCENARIO 17: Mobile Responsive**

#### Test Steps:
1. Open UserProfile on mobile device or resize browser to 480px
2. Check notifications tab

#### Expected Results:
✅ Tabs stack vertically or scroll horizontally  
✅ Notifications are full-width  
✅ Action buttons remain accessible  
✅ Filter dropdown works  
✅ No horizontal overflow  

---

## 🐛 Common Issues & Solutions

### Issue: Notifications not appearing
**Check:**
1. User is logged in (`auth.currentUser`)
2. Firestore imports include `limit`, `deleteDoc`
3. Browser console for errors
4. Network tab shows Firestore requests
5. Firestore rules allow read/write

**Solution:**
```javascript
// Check in browser console
console.log('Current user:', auth.currentUser);
console.log('User ID:', auth.currentUser?.uid);
```

---

### Issue: Auto-refresh not working
**Check:**
1. `startNotificationRefresh()` is called
2. 5-minute interval is running
3. Console shows "Auto-refreshing notifications..."

**Solution:**
```javascript
// Manually trigger refresh
loadNotifications();
```

---

### Issue: Duplicate reminders
**Check:**
1. Date comparison logic
2. Existing reminder query
3. Multiple page loads triggering checks

**Solution:**
Ensure date formats match exactly (YYYY-MM-DD):
```javascript
const eventDate = new Date('2025-01-21T00:00:00');
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

// Compare as strings
const eventDateStr = eventDate.toISOString().split('T')[0];
const tomorrowStr = tomorrow.toISOString().split('T')[0];

if (eventDateStr === tomorrowStr) { /* create reminder */ }
```

---

### Issue: Badge not updating
**Check:**
1. `updateNotificationCounts()` is called
2. Query includes `where("read", "==", false)`
3. Badge element exists in HTML

**Solution:**
```javascript
// Manually update counts
updateNotificationCounts();
```

---

## 📊 Test Data Templates

### Create Test Booking (Tents - Tomorrow)
```javascript
// In browser console after logging in
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = tomorrow.toISOString().split('T')[0];

await addDoc(collection(db, "tentsChairsBookings"), {
  userId: auth.currentUser.uid,
  userEmail: auth.currentUser.email,
  fullName: "Test User",
  contactNumber: "09123456789",
  completeAddress: "123 Test St",
  startDate: tomorrowStr,
  endDate: tomorrowStr,
  quantityChairs: 50,
  quantityTents: 2,
  modeOfReceiving: "Pick-up",
  status: "approved",
  createdAt: new Date()
});
```

### Create Test Booking (Conference - Today)
```javascript
const today = new Date();
const todayStr = today.toISOString().split('T')[0];

await addDoc(collection(db, "conferenceRoomBookings"), {
  userId: auth.currentUser.uid,
  userEmail: auth.currentUser.email,
  fullName: "Test User",
  contactNumber: "09123456789",
  address: "123 Test St",
  purpose: "Team Meeting",
  eventDate: todayStr,
  startTime: "14:00",
  endTime: "16:00",
  status: "approved",
  createdAt: new Date()
});
```

---

## ✅ Testing Checklist

Print this checklist and mark off as you test:

### Display & UI
- [ ] Notifications tab shows correctly
- [ ] Filter dropdown works
- [ ] Mark all as read button works
- [ ] Email badge displays count
- [ ] Mobile responsive layout
- [ ] Empty state shows properly

### Status Change Notifications
- [ ] Approval notification created
- [ ] Rejection notification created
- [ ] Completion notification created
- [ ] In-progress notification created

### Automated Reminders
- [ ] 3-day reminder created
- [ ] Tomorrow reminder created
- [ ] Today notification created
- [ ] Ending soon reminder created
- [ ] No duplicates created

### Interactions
- [ ] Click notification → mark as read
- [ ] Click notification → navigate to requests
- [ ] Delete notification works
- [ ] Filter by read/unread works
- [ ] Auto-refresh works (5 min)

### Console Logs
- [ ] All actions show detailed logs
- [ ] No errors in console
- [ ] Success messages appear
- [ ] Timestamps are correct

---

## 📝 Test Report Template

**Date:** _________________  
**Tester:** _________________  
**Browser:** _________________  
**Device:** _________________  

| Scenario | Pass | Fail | Notes |
|----------|------|------|-------|
| 1. Notification Tab Display | ☐ | ☐ | |
| 2. Approval Notification | ☐ | ☐ | |
| 3. Rejection Notification | ☐ | ☐ | |
| 4. Tomorrow Reminder | ☐ | ☐ | |
| 5. Today Notification | ☐ | ☐ | |
| 6. Ending Soon Reminder | ☐ | ☐ | |
| 7. 3-Day Reminder | ☐ | ☐ | |
| 8. Mark as Read | ☐ | ☐ | |
| 9. Mark All as Read | ☐ | ☐ | |
| 10. Delete Notification | ☐ | ☐ | |
| 11. Filter Notifications | ☐ | ☐ | |
| 12. Auto-Refresh | ☐ | ☐ | |
| 13. Duplicate Prevention | ☐ | ☐ | |
| 14. View Request | ☐ | ☐ | |
| 15. Empty State | ☐ | ☐ | |
| 16. Badge Display | ☐ | ☐ | |
| 17. Mobile Responsive | ☐ | ☐ | |

**Overall Result:** ☐ Pass ☐ Fail  
**Issues Found:** _________________  
**Recommendations:** _________________  

---

**Testing Complete! 🎉**
