# Admin Integration Guide - Automated Notifications

## Overview
This guide explains how to integrate automated notifications into admin actions (approve/reject requests) so users receive real-time updates.

---

## 🎯 Integration Points

### 1. **Tents & Chairs Admin** (`admin-tents-requests.html`)

#### Location in Code
- **File**: `script.js`
- **Function**: `handleApprove(requestId)` (around line 5012)
- **Action**: When admin clicks "Approve" button

#### Integration Code

**BEFORE (Current Code):**
```javascript
async function handleApprove(requestId) {
  // ... inventory validation code ...
  
  // Update request status to approved
  await updateDoc(requestRef, {
    status: 'approved',
    approvedAt: new Date()
  });
  
  // Update inventory
  await updateDoc(inventoryRef, {
    availableTents: newTentsStock,
    availableChairs: newChairsStock,
    tentsInUse: increment(requestData.quantityTents || 0),
    chairsInUse: increment(requestData.quantityChairs || 0),
    lastUpdated: new Date()
  });
  
  showToast("Request approved successfully", true);
}
```

**AFTER (With Notification):**
```javascript
async function handleApprove(requestId) {
  // ... inventory validation code ...
  
  // Update request status to approved
  await updateDoc(requestRef, {
    status: 'approved',
    approvedAt: new Date()
  });
  
  // Update inventory
  await updateDoc(inventoryRef, {
    availableTents: newTentsStock,
    availableChairs: newChairsStock,
    tentsInUse: increment(requestData.quantityTents || 0),
    chairsInUse: increment(requestData.quantityChairs || 0),
    lastUpdated: new Date()
  });
  
  // ✅ CREATE NOTIFICATION FOR USER
  console.log('[Admin Action] Creating approval notification for user:', requestData.userId);
  await createStatusChangeNotification(
    requestId,                    // Request ID
    'tents-chairs',              // Request type
    requestData.userId,          // User ID to notify
    'pending',                   // Old status
    'approved',                  // New status
    requestData                  // Full request data
  );
  
  showToast("Request approved successfully", true);
}
```

---

### 2. **Tents & Chairs Rejection**

#### Location in Code
- **File**: `script.js`
- **Function**: `handleDeny(requestId)` (around line 5095)
- **Action**: When admin clicks "Deny" button and provides reason

#### Integration Code

**BEFORE (Current Code):**
```javascript
async function handleDeny(requestId) {
  const reason = prompt("Please enter the reason for rejection:");
  if (!reason) return;
  
  const requestRef = doc(db, "tentsChairsBookings", requestId);
  await updateDoc(requestRef, {
    status: 'rejected',
    rejectedAt: new Date(),
    rejectionReason: reason
  });
  
  showToast("Request rejected", true);
}
```

**AFTER (With Notification):**
```javascript
async function handleDeny(requestId) {
  const reason = prompt("Please enter the reason for rejection:");
  if (!reason) return;
  
  // Get request data first
  const requestRef = doc(db, "tentsChairsBookings", requestId);
  const requestSnap = await getDoc(requestRef);
  const requestData = requestSnap.data();
  
  // Update status
  await updateDoc(requestRef, {
    status: 'rejected',
    rejectedAt: new Date(),
    rejectionReason: reason
  });
  
  // ✅ CREATE NOTIFICATION FOR USER
  console.log('[Admin Action] Creating rejection notification for user:', requestData.userId);
  await createStatusChangeNotification(
    requestId,
    'tents-chairs',
    requestData.userId,
    'pending',
    'rejected',
    { ...requestData, rejectionReason: reason }  // Include rejection reason
  );
  
  showToast("Request rejected", true);
}
```

---

### 3. **Conference Room Admin** (`admin-conference-requests.html`)

#### Approve Action

```javascript
async function handleApproveConference(requestId) {
  const requestRef = doc(db, "conferenceRoomBookings", requestId);
  const requestSnap = await getDoc(requestRef);
  const requestData = requestSnap.data();
  
  // Update status
  await updateDoc(requestRef, {
    status: 'approved',
    approvedAt: new Date()
  });
  
  // ✅ CREATE NOTIFICATION
  console.log('[Admin Action] Creating approval notification for conference booking');
  await createStatusChangeNotification(
    requestId,
    'conference-room',           // Different request type
    requestData.userId,
    'pending',
    'approved',
    requestData
  );
  
  showToast("Conference room booking approved", true);
}
```

#### Reject Action

```javascript
async function handleRejectConference(requestId) {
  const reason = prompt("Please enter the reason for rejection:");
  if (!reason) return;
  
  const requestRef = doc(db, "conferenceRoomBookings", requestId);
  const requestSnap = await getDoc(requestRef);
  const requestData = requestSnap.data();
  
  await updateDoc(requestRef, {
    status: 'rejected',
    rejectedAt: new Date(),
    rejectionReason: reason
  });
  
  // ✅ CREATE NOTIFICATION
  console.log('[Admin Action] Creating rejection notification for conference booking');
  await createStatusChangeNotification(
    requestId,
    'conference-room',
    requestData.userId,
    'pending',
    'rejected',
    { ...requestData, rejectionReason: reason }
  );
  
  showToast("Conference room booking rejected", true);
}
```

---

### 4. **Mark as Completed**

When admin marks a booking as completed (items returned):

```javascript
async function handleComplete(requestId) {
  const requestRef = doc(db, "tentsChairsBookings", requestId);
  const requestSnap = await getDoc(requestRef);
  const requestData = requestSnap.data();
  
  // Update status
  await updateDoc(requestRef, {
    status: 'completed',
    completedAt: new Date()
  });
  
  // Return inventory if needed
  // ... inventory update code ...
  
  // ✅ CREATE NOTIFICATION
  console.log('[Admin Action] Creating completion notification');
  await createStatusChangeNotification(
    requestId,
    'tents-chairs',
    requestData.userId,
    'in-progress',
    'completed',
    requestData
  );
  
  showToast("Booking marked as completed", true);
}
```

---

## 📅 Automated Reminder System

### Current Implementation
The automated reminder system runs when a user loads their UserProfile page:

```javascript
// In script.js (around line 3470)
if (window.location.pathname.endsWith('UserProfile.html')) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      setTimeout(() => {
        console.log('[UserProfile] Running automated reminder check...');
        checkAndCreateAutomatedReminders();
      }, 2000);
    }
  });
}
```

### Reminder Types Created
1. **3-Day Reminder**: Event is 3 days away
2. **Tomorrow Reminder**: Event is tomorrow
3. **Today Notification**: Event is happening today
4. **Ending Soon**: Event ends today (return/vacate reminder)

### Important Notes
- ✅ **Prevents Duplicates**: Checks if reminder already sent before creating
- ✅ **Multi-Booking Type**: Works for both tents/chairs and conference room
- ✅ **Date-Based Logic**: Compares event dates (startDate, endDate, eventDate)
- ✅ **Status Filtering**: Only checks approved/in-progress bookings

---

## 🚀 Better Implementation: Cloud Functions (Recommended)

### Why Cloud Functions?
- ⏰ **Scheduled Execution**: Runs daily at specific time (e.g., 8:00 AM)
- 🔋 **Server-Side**: No dependency on user page loads
- 📧 **Can Send Emails/SMS**: Integrate SendGrid or Twilio
- ⚡ **More Reliable**: Guaranteed execution

### Setup Steps

1. **Install Firebase CLI**
```powershell
npm install -g firebase-tools
firebase login
firebase init functions
```

2. **Create Scheduled Function**

**File**: `functions/index.js`
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

// Run daily at 8:00 AM
exports.dailyReminderCheck = functions.pubsub
  .schedule('0 8 * * *')  // Cron format: 8:00 AM every day
  .timeZone('Asia/Manila')  // Philippines timezone
  .onRun(async (context) => {
    console.log('Daily reminder check started');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const in3Days = new Date(today);
    in3Days.setDate(in3Days.getDate() + 3);
    
    // Format dates as YYYY-MM-DD
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const in3DaysStr = in3Days.toISOString().split('T')[0];
    
    console.log('Checking for events:', { todayStr, tomorrowStr, in3DaysStr });
    
    // Check tents & chairs bookings
    const tentsSnapshot = await db.collection('tentsChairsBookings')
      .where('status', 'in', ['approved', 'in-progress'])
      .get();
    
    for (const doc of tentsSnapshot.docs) {
      const request = { id: doc.id, ...doc.data() };
      
      // Check if reminders already sent
      const existingReminders = await db.collection('notifications')
        .where('userId', '==', request.userId)
        .where('requestId', '==', request.id)
        .get();
      
      const sentTypes = new Set(existingReminders.docs.map(d => 
        d.data().metadata?.reminderType
      ));
      
      // 3-day reminder
      if (request.startDate === in3DaysStr && !sentTypes.has('3_days')) {
        await createNotification(db, {
          userId: request.userId,
          type: 'booking_reminder',
          requestId: request.id,
          requestType: 'tents-chairs',
          title: '📅 3-Day Reminder: Event Coming Up',
          message: `Your tents & chairs booking is in 3 days (${request.startDate}).`,
          metadata: { reminderType: '3_days', daysUntil: 3 }
        });
        console.log(`Created 3-day reminder for ${request.id}`);
      }
      
      // Tomorrow reminder
      if (request.startDate === tomorrowStr && !sentTypes.has('tomorrow')) {
        await createNotification(db, {
          userId: request.userId,
          type: 'booking_reminder',
          requestId: request.id,
          requestType: 'tents-chairs',
          title: '🔔 Tomorrow: Event Reminder',
          message: `Your tents & chairs booking is tomorrow!`,
          metadata: { reminderType: 'tomorrow', daysUntil: 1 }
        });
        console.log(`Created tomorrow reminder for ${request.id}`);
      }
      
      // Today notification
      if (request.startDate === todayStr && !sentTypes.has('today')) {
        await createNotification(db, {
          userId: request.userId,
          type: 'booking_reminder',
          requestId: request.id,
          requestType: 'tents-chairs',
          title: '🎉 Today: Your Event is Happening Now!',
          message: `Your event is today! Items ready for collection/delivery.`,
          metadata: { reminderType: 'today', isToday: true }
        });
        console.log(`Created today notification for ${request.id}`);
      }
      
      // Ending soon (on end date)
      if (request.endDate === todayStr && !sentTypes.has('ending_soon')) {
        await createNotification(db, {
          userId: request.userId,
          type: 'booking_reminder',
          requestId: request.id,
          requestType: 'tents-chairs',
          title: '⏰ Ending Soon: Prepare to Return',
          message: `Your booking ends today. Please return items.`,
          metadata: { reminderType: 'ending_soon', endingToday: true }
        });
        console.log(`Created ending soon reminder for ${request.id}`);
      }
    }
    
    // Same logic for conference room bookings
    const conferenceSnapshot = await db.collection('conferenceRoomBookings')
      .where('status', 'in', ['approved', 'in-progress'])
      .get();
    
    // ... similar logic for conference rooms ...
    
    console.log('Daily reminder check completed');
    return null;
  });

// Helper function to create notification
async function createNotification(db, data) {
  return await db.collection('notifications').add({
    userId: data.userId,
    type: data.type,
    requestId: data.requestId || null,
    requestType: data.requestType || null,
    title: data.title,
    message: data.message,
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    actionUrl: data.actionUrl || null,
    metadata: data.metadata || {}
  });
}
```

3. **Deploy Function**
```powershell
firebase deploy --only functions
```

4. **Monitor Logs**
```powershell
firebase functions:log
```

---

## 🧪 Testing Checklist

### Admin Actions
- [ ] Approve tents request → User receives approval notification
- [ ] Reject tents request → User receives rejection with reason
- [ ] Approve conference request → User receives approval notification
- [ ] Reject conference request → User receives rejection with reason
- [ ] Mark as completed → User receives completion notification

### Automated Reminders
- [ ] Create booking 3 days in future → Receive 3-day reminder
- [ ] Create booking for tomorrow → Receive tomorrow reminder
- [ ] Create booking for today → Receive today notification
- [ ] Booking ends today → Receive ending soon reminder
- [ ] No duplicate reminders sent for same event

### Console Logs
Check browser console for these log patterns:
```
[Admin Action] Creating approval notification for user: abc123
[Notification Creator] ═══════════════════════════════════
[Notification Creator] Creating new notification...
[Notification Creator] Type: status_change
[Notification Creator] ✓ Notification created successfully
[Status Change Notification] ✓ Notification created successfully
```

---

## 🐛 Troubleshooting

### Issue: Notifications not appearing
**Solution**: Check browser console for errors. Verify:
1. `createStatusChangeNotification` function exists in script.js
2. Firestore imports include `addDoc`, `collection`, `serverTimestamp`
3. User is logged in (`auth.currentUser` exists)

### Issue: Duplicate notifications
**Solution**: The automated reminder system already prevents duplicates by checking existing notifications before creating new ones. If duplicates occur:
1. Check if `checkAndCreateAutomatedReminders()` is called multiple times
2. Verify date comparison logic uses `.getTime()` for exact matches

### Issue: Wrong notification message
**Solution**: Edit notification templates in the respective functions:
- `createStatusChangeNotification()` - Status change messages
- `createTomorrowReminderNotification()` - Tomorrow reminders
- `createTodayEventNotification()` - Today notifications
- `createEndingSoonNotification()` - Ending soon reminders

---

## 📚 Function Reference

### `createNotification(notificationData)`
Low-level function to create notification in Firestore.

**Parameters:**
```javascript
{
  userId: string,           // User ID to notify
  type: string,            // 'status_change' | 'booking_reminder'
  requestId: string,       // Related request ID
  requestType: string,     // 'tents-chairs' | 'conference-room'
  title: string,           // Notification title with emoji
  message: string,         // Detailed message
  metadata: object         // Additional data
}
```

### `createStatusChangeNotification(requestId, requestType, userId, oldStatus, newStatus, requestData)`
Creates notification when admin changes request status.

**When to Call:** In admin approve/reject/complete handlers

### `createTomorrowReminderNotification(requestId, requestType, userId, requestData)`
Creates reminder 1 day before event.

**When to Call:** Automated by `checkAndCreateAutomatedReminders()` or Cloud Function

### `createTodayEventNotification(requestId, requestType, userId, requestData)`
Creates notification on event day.

**When to Call:** Automated by `checkAndCreateAutomatedReminders()` or Cloud Function

### `createEndingSoonNotification(requestId, requestType, userId, requestData)`
Creates reminder when event is ending (same as end date).

**When to Call:** Automated by `checkAndCreateAutomatedReminders()` or Cloud Function

### `checkAndCreateAutomatedReminders()`
Scans all active bookings and creates reminders based on dates.

**When to Call:** 
- UserProfile page load (current implementation)
- Cloud Function scheduled daily (recommended)

---

## 🎨 Customization

### Change Notification Icons
Edit the emoji in notification creation functions:
```javascript
// In createStatusChangeNotification()
if (newStatus === 'approved') {
  icon = '✅';  // Change to '👍', '🎉', etc.
  title = 'Request Approved';
}
```

### Change Reminder Timing
Edit the date calculations in `checkAndCreateAutomatedReminders()`:
```javascript
// Change 3-day reminder to 7-day reminder
const in7Days = new Date(today);
in7Days.setDate(in7Days.getDate() + 7);  // Changed from 3 to 7
```

### Add Email/SMS Integration
In Cloud Function, after creating notification:
```javascript
await createNotification(db, notificationData);

// Send email via SendGrid
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: request.userEmail,
  from: 'noreply@barangay.gov.ph',
  subject: notificationData.title,
  text: notificationData.message
});
```

---

## ✅ Quick Integration Checklist

Admin-side integration (5 minutes):
- [ ] Open `script.js`
- [ ] Find `handleApprove()` function
- [ ] Add `await createStatusChangeNotification(...)` after `updateDoc()`
- [ ] Find `handleDeny()` function
- [ ] Add `await createStatusChangeNotification(...)` after `updateDoc()`
- [ ] Test by approving/rejecting a request
- [ ] Check UserProfile Notifications tab for new notification

Cloud Function setup (30 minutes):
- [ ] Install Firebase CLI
- [ ] `firebase init functions`
- [ ] Copy code from this guide to `functions/index.js`
- [ ] `firebase deploy --only functions`
- [ ] Monitor logs to verify daily execution

---

## 🎯 Success Criteria

✅ Users receive notification within 1 second of admin action  
✅ Notification appears in Notifications tab with unread badge  
✅ Email icon shows unread count  
✅ Clicking notification navigates to Requests tab  
✅ Automated reminders sent at appropriate times  
✅ No duplicate notifications created  
✅ Console logs show successful creation  

**Integration Complete! 🎉**
