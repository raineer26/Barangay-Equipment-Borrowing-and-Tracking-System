# Quick Reference - Notification System

## 🎯 5-Minute Quick Start

### **Step 1: Verify Implementation** ✅
All notification features are already implemented. Check:
- ✅ `script.js` - Contains all 26 notification functions
- ✅ `UserProfile.html` - Has Notifications tab
- ✅ `style.css` - Has notification styling

### **Step 2: Admin Integration (Copy & Paste)**

Open `script.js` and find your admin action functions. Add these lines:

#### **For Tents/Chairs Approval:**
```javascript
// In handleApprove() function - After updateDoc()
await createStatusChangeNotification(
  requestId,
  'tents-chairs',
  requestData.userId,
  'pending',
  'approved',
  requestData
);
```

#### **For Tents/Chairs Rejection:**
```javascript
// In handleDeny() function - After updateDoc()
await createStatusChangeNotification(
  requestId,
  'tents-chairs',
  requestData.userId,
  'pending',
  'rejected',
  { ...requestData, rejectionReason: reason }
);
```

#### **For Conference Room Approval:**
```javascript
// In handleApproveConference() function - After updateDoc()
await createStatusChangeNotification(
  requestId,
  'conference-room',
  requestData.userId,
  'pending',
  'approved',
  requestData
);
```

### **Step 3: Test It**
1. Start local server: `python -m http.server 5500`
2. Login as user, submit a request
3. Login as admin, approve the request
4. Login as user again, check Notifications tab
5. You should see: "✅ Request Approved" notification

---

## 📋 Notification Types Reference

| Icon | Type | Trigger | Example Title |
|------|------|---------|---------------|
| ✅ | Approved | Admin approves request | "✅ Request Approved" |
| ❌ | Rejected | Admin rejects request | "❌ Request Rejected" |
| 🔄 | In Progress | Request status changes | "🔄 Booking In Progress" |
| 🏁 | Completed | Admin marks as done | "🏁 Booking Completed" |
| 📅 | 3-Day Reminder | 3 days before event | "📅 3-Day Reminder: Event Coming Up" |
| 🔔 | Tomorrow | 1 day before event | "🔔 Tomorrow: Event Reminder" |
| 🎉 | Today | Event day arrives | "🎉 Today: Your Event is Happening Now!" |
| ⏰ | Ending Soon | Event ends today | "⏰ Ending Soon: Prepare to Return/Vacate" |

---

## 🔍 Debugging Checklist

### **Notifications Not Showing?**
Open browser console (F12), check for:

✅ **Import Error Fixed:**
```
[Notifications] Loading notifications...
```
❌ If you see: `limit is not defined` → Imports are broken (should be fixed already)

✅ **Firestore Query:**
```
[Notifications] Found X notifications
[Notifications] Rendering X notifications
```
❌ If you see errors → Check Firestore rules or network

✅ **Admin Action:**
```
[Admin Action] Creating approval notification for user: abc123
[Notification Creator] ✓ Notification created successfully
```
❌ If not appearing → Admin integration not done yet

### **Badge Not Updating?**
Check console for:
```
[Notifications] Updating badge counts...
[Notifications] Unread count: X
```

### **Auto-Reminders Not Working?**
After 2 seconds of loading UserProfile, check for:
```
[UserProfile] Running automated reminder check...
[Auto Reminders] Checking for events that need reminders...
[Auto Reminders] Found X active tents bookings
```

---

## 📊 Console Log Patterns

### **Successful Notification Creation:**
```
[Admin Action] Creating approval notification for user: xyz789
[Notification Creator] ═══════════════════════════════════
[Notification Creator] Creating new notification...
[Notification Creator] Type: status_change
[Notification Creator] For user: xyz789
[Notification Creator] ✓ Notification created successfully
[Notification Creator] Notification ID: abc123def456
[Status Change Notification] ✓ Notification created successfully
[Status Change Notification] ═══════════════════════════════════
```

### **Successful Reminder Creation:**
```
[Auto Reminders] ═══════════════════════════════════════════════════
[Auto Reminders] Checking for events that need reminders...
[Auto Reminders] Today: 2025-01-20
[Auto Reminders] Tomorrow: 2025-01-21
[Auto Reminders] Found 3 active tents bookings
[Auto Reminders] 🔔 Creating tomorrow reminder for req123
[Tomorrow Reminder] ═══════════════════════════════════
[Tomorrow Reminder] Request ID: req123
[Tomorrow Reminder] Event date: 2025-01-21
[Tomorrow Reminder] ✓ Reminder notification created
[Auto Reminders] ✓ Automated reminder check completed
```

### **Error Pattern:**
```
[Notification Creator] ❌ Error creating notification: [Error object]
[Notification Creator]   - Error message: [Detailed message]
```

---

## 🎨 Customization Snippets

### **Change Notification Icon:**
```javascript
// In script.js, find createStatusChangeNotification()
if (newStatus === 'approved') {
  icon = '✅';  // Change to: '👍' or '🎉' or '✔️'
  title = 'Request Approved';
}
```

### **Change Reminder Days:**
```javascript
// In checkAndCreateAutomatedReminders()
const in3Days = new Date(today);
in3Days.setDate(in3Days.getDate() + 3);  // Change 3 to 7 for 7-day reminder
```

### **Change Auto-Refresh Time:**
```javascript
// In startNotificationRefresh()
setInterval(loadNotifications, 5 * 60 * 1000);  // 5 minutes
// Change to: 2 * 60 * 1000 for 2 minutes
```

### **Add Custom Notification:**
```javascript
// Call from anywhere in your code
await createNotification({
  userId: auth.currentUser.uid,
  type: 'custom',
  title: '🎊 Custom Title',
  message: 'Your custom message here',
  metadata: { customField: 'value' }
});
```

---

## 🗂️ File Locations

### **Implementation Files:**
- **JavaScript Logic**: `script.js` (lines 11, 1142-1177, 2342-3470)
- **HTML Structure**: `UserProfile.html` (tab navigation + notifications panel)
- **CSS Styling**: `style.css` (lines 1325-1825, ~500 lines)

### **Documentation Files:**
- **Admin Integration**: `ADMIN_NOTIFICATION_INTEGRATION.md`
- **Testing Guide**: `NOTIFICATION_TESTING_GUIDE.md`
- **Full Summary**: `AUTOMATED_NOTIFICATION_IMPLEMENTATION_SUMMARY.md`
- **This File**: `QUICK_REFERENCE.md`

---

## 🔧 Function Quick Reference

### **User-Facing Functions (in UserProfile):**
| Function | Purpose | Parameters |
|----------|---------|------------|
| `loadNotifications()` | Load from Firestore | None |
| `markNotificationAsRead(id)` | Mark single as read | Notification ID |
| `markAllNotificationsAsRead()` | Mark all as read | None |
| `deleteNotification(id)` | Delete notification | Notification ID |
| `filterNotifications(type)` | Filter list | 'all', 'unread', 'read' |

### **Admin Integration Functions:**
| Function | Purpose | When to Call |
|----------|---------|-------------|
| `createStatusChangeNotification()` | Create status notification | After admin approves/rejects |
| `createNotification()` | Low-level create | Direct Firestore write |

### **Automated Functions:**
| Function | Purpose | Trigger |
|----------|---------|---------|
| `checkAndCreateAutomatedReminders()` | Scan for reminders | Page load or Cloud Function |
| `create3DayReminderNotification()` | 3-day reminder | Called by check function |
| `createTomorrowReminderNotification()` | 1-day reminder | Called by check function |
| `createTodayEventNotification()` | Same-day notification | Called by check function |
| `createEndingSoonNotification()` | End-of-event reminder | Called by check function |

---

## 🧪 Quick Test Commands

### **Test in Browser Console:**

```javascript
// Check if functions exist
typeof createNotification
// Should return: "function"

// Check current user
console.log(auth.currentUser);
// Should show user object if logged in

// Manually create test notification
await createNotification({
  userId: auth.currentUser.uid,
  type: 'test',
  title: '🧪 Test Notification',
  message: 'This is a test notification created from console.',
  metadata: { test: true }
});
// Check Notifications tab - should appear immediately

// Manually trigger reminder check
await checkAndCreateAutomatedReminders();
// Check console for log output

// Load notifications manually
await loadNotifications();
// Check if notifications appear in tab
```

---

## ⚡ Common Code Patterns

### **Pattern 1: Create Notification After Admin Action**
```javascript
// Step 1: Get request data
const requestRef = doc(db, "tentsChairsBookings", requestId);
const requestSnap = await getDoc(requestRef);
const requestData = requestSnap.data();

// Step 2: Update request status
await updateDoc(requestRef, {
  status: 'approved',
  approvedAt: new Date()
});

// Step 3: Create notification
await createStatusChangeNotification(
  requestId,
  'tents-chairs',
  requestData.userId,
  'pending',
  'approved',
  requestData
);
```

### **Pattern 2: Check for Existing Notifications**
```javascript
const existingQuery = query(
  collection(db, "notifications"),
  where("userId", "==", userId),
  where("requestId", "==", requestId),
  where("metadata.reminderType", "==", "tomorrow")
);

const existingSnap = await getDocs(existingQuery);
if (existingSnap.empty) {
  // No existing notification, safe to create
  await createTomorrowReminderNotification(...);
}
```

### **Pattern 3: Date Comparison for Reminders**
```javascript
const today = new Date();
today.setHours(0, 0, 0, 0);

const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const eventDate = new Date(requestData.startDate + 'T00:00:00');

// Compare using getTime() for exact match
if (eventDate.getTime() === tomorrow.getTime()) {
  // Event is tomorrow, create reminder
}
```

---

## 🎯 Success Indicators

### **✅ Everything Working:**
- Notifications tab loads without errors
- Console shows `[Notifications] Found X notifications`
- Unread badge appears on tab and email icon
- Clicking notification marks it as read
- Filter dropdown works
- Auto-refresh runs every 5 minutes
- Admin approval creates notification instantly

### **❌ Something Wrong:**
- Console shows errors (red text)
- "limit is not defined" error → Check imports
- No notifications appearing → Check Firestore rules
- Badge not updating → Check `updateNotificationCounts()`
- Auto-refresh not working → Check interval setup

---

## 📞 Need Help?

### **Check These First:**
1. Browser console (F12) for error messages
2. Network tab for failed Firestore requests
3. Firestore console for data validation
4. Authentication state (user logged in?)

### **Common Solutions:**
| Problem | Solution |
|---------|----------|
| Import errors | Line 11 of script.js should have `limit, deleteDoc` |
| No notifications | Check Firestore rules allow read access |
| Duplicate reminders | Check date comparison logic |
| Badge not showing | Check HTML has `#notificationBadge` element |
| Admin integration not working | Verify function names match exactly |

---

## 🚀 Production Deployment

### **Before Going Live:**
- [ ] Complete admin integration (5 integration points)
- [ ] Test all 17 scenarios from testing guide
- [ ] Set up Firestore composite indexes
- [ ] Deploy Firestore security rules
- [ ] Consider Cloud Functions for scheduled reminders
- [ ] Monitor Firestore usage and costs

### **Firestore Indexes to Create:**
```
Collection: notifications
1. userId (Ascending) + createdAt (Descending)
2. userId (Ascending) + read (Ascending) + createdAt (Descending)
3. userId (Ascending) + requestId (Ascending) + metadata.reminderType (Ascending)
```

---

## 📈 Monitoring Checklist

After deployment, monitor:
- [ ] Notification creation success rate (check logs)
- [ ] User engagement (how many read vs. unread)
- [ ] Firestore read/write counts
- [ ] Auto-reminder execution (daily check)
- [ ] User feedback on notification clarity

---

**That's it! The notification system is ready to use.** 🎉

For detailed guides, see:
- `ADMIN_NOTIFICATION_INTEGRATION.md` - Step-by-step admin setup
- `NOTIFICATION_TESTING_GUIDE.md` - 17 test scenarios
- `AUTOMATED_NOTIFICATION_IMPLEMENTATION_SUMMARY.md` - Complete overview
