# 📊 IN-PROGRESS STATUS ANALYSIS & IMPLEMENTATION WORKFLOW

## 🔍 CURRENT STATUS LIFECYCLE ANALYSIS

Based on comprehensive code analysis, here's the **actual current state** of the system:

### Current Status Flow
```
┌─────────┐    Admin      ┌──────────┐    Admin       ┌───────────┐
│ PENDING │──Approves───→ │ APPROVED │───Completes──→ │ COMPLETED │
└─────────┘               └──────────┘                └───────────┘
     │                                                       ↑
     │ User Cancels                                          │
     ↓                                                       │
┌───────────┐                                               │
│ CANCELLED │                                               │
└───────────┘                                               │
     ↑                                                       │
     │                                                       │
┌─────────┐    Admin                                        │
│ PENDING │──Rejects────────────────────────────────────→  │
└─────────┘                ┌──────────┐                     │
                           │ REJECTED │─────────────────────┘
                           └──────────┘
```

### ⚠️ CRITICAL FINDING: "In-Progress" Status is DEFINED but NEVER SET

#### Evidence from Code Analysis:

1. **Data Model Documentation** (`.github/copilot-instructions.md` lines 32, 41):
   - Status field explicitly includes: `"pending"|"approved"|"in-progress"|"completed"|"rejected"|"cancelled"`
   - Described in lifecycle: "Event date has arrived, equipment is currently in use"

2. **Code References** (20+ occurrences):
   - ✅ Status badges defined in CSS (`.status-in-progress`, `.tents-status-badge-in-progress`)
   - ✅ Queries include "in-progress" in WHERE clauses
   - ✅ Filters show "In Progress" option with count
   - ✅ Notification system checks for "in-progress" bookings
   - ❌ **ZERO** `updateDoc()` calls that set `status: 'in-progress'`

3. **Admin Actions** (script.js):
   - `handleApprove()` → Sets status to `'approved'` (line 9148)
   - `handleDeny()` → Sets status to `'rejected'` (line 9244)
   - `handleComplete()` → Sets status to `'completed'` (line 9310)
   - **NO** `handleStartEvent()` or automatic status transition

4. **Automated Reminder System** (`checkAndCreateAutomatedReminders()`, line 3317):
   - Queries for: `where("status", "in", ["approved", "in-progress"])`
   - Creates "Today Event" notification: `createTodayEventNotification()`
   - Notification says: "Your booking is now in progress"
   - **BUT**: Status is NEVER actually updated in Firestore

## 🎯 THE PROBLEM

**Status "in-progress" exists in theory but never in practice:**
- Users see requests stuck in "approved" status even during/after the event
- "In Progress" filter always shows 0 items
- Inventory tracking counts both "approved" and "in-progress" as active
- Admin can mark "approved" as "completed" directly (skipping in-progress)

## 💡 IDEAL IMPLEMENTATION WORKFLOW

### Option 1: **AUTOMATIC STATUS TRANSITION** (Recommended)
Most realistic for a barangay system - minimal admin intervention.

#### How It Works:
```javascript
// Triggered daily or on page load
async function checkAndUpdateEventStatuses() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0]; // "YYYY-MM-DD"
  
  // 1. Check Tents & Chairs Bookings
  const tentsQuery = query(
    collection(db, "tentsChairsBookings"),
    where("status", "==", "approved")
  );
  
  const tentsSnapshot = await getDocs(tentsQuery);
  
  for (const docSnap of tentsSnapshot.docs) {
    const request = docSnap.data();
    const startDate = request.startDate; // "YYYY-MM-DD"
    const endDate = request.endDate;     // "YYYY-MM-DD"
    
    // If today is between startDate and endDate (inclusive)
    if (todayStr >= startDate && todayStr <= endDate) {
      // Update status to in-progress
      await updateDoc(doc(db, "tentsChairsBookings", docSnap.id), {
        status: 'in-progress',
        inProgressAt: new Date() // Track when it became in-progress
      });
      
      console.log(`✅ Updated ${docSnap.id} to in-progress (event started)`);
      
      // Optional: Create notification
      await createNotification({
        userId: request.userId,
        type: 'status_change',
        title: '🎉 Your Event Started!',
        message: `Your tents & chairs booking is now in progress. Equipment should be in use. Return by ${formatDateToWords(endDate)}.`,
        requestId: docSnap.id,
        requestType: 'tents-chairs'
      });
    }
  }
  
  // 2. Check Conference Room Bookings
  const conferenceQuery = query(
    collection(db, "conferenceRoomBookings"),
    where("status", "==", "approved"),
    where("eventDate", "==", todayStr)
  );
  
  const conferenceSnapshot = await getDocs(conferenceQuery);
  
  for (const docSnap of conferenceSnapshot.docs) {
    const request = docSnap.data();
    
    // Update to in-progress when event date arrives
    await updateDoc(doc(db, "conferenceRoomBookings", docSnap.id), {
      status: 'in-progress',
      inProgressAt: new Date()
    });
    
    console.log(`✅ Updated ${docSnap.id} to in-progress (conference started)`);
  }
}
```

**When to Run:**
1. **On UserProfile page load** (user sees current status)
2. **On Admin pages load** (admin sees accurate status)
3. **Daily via Cloud Functions** (production - most reliable)

**Advantages:**
- ✅ Automatic - no admin action required
- ✅ Reflects real-world status accurately
- ✅ Users see progress in real-time
- ✅ Better inventory tracking (distinguish upcoming vs. active)
- ✅ Can automatically complete when end date passes

**Integration Points:**
```javascript
// In script.js - UserProfile initialization
if (window.location.pathname.endsWith('UserProfile.html')) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Run status updates BEFORE loading requests
      checkAndUpdateEventStatuses().then(() => {
        loadUserData();
        loadUserRequests();
        loadNotifications();
      });
    }
  });
}

// In admin pages
if (window.location.pathname.endsWith('admin-tents-requests.html')) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      checkAndUpdateEventStatuses().then(() => {
        loadAllRequests();
      });
    }
  });
}
```

---

### Option 2: **MANUAL ADMIN BUTTON** (More Control)
Admin manually marks approved requests as "in-progress".

#### UI Changes:
Add button to admin table for approved requests:
```javascript
// In renderActionButtons() for tents admin
function renderActionButtons(req) {
  if (req.status === 'pending') {
    return `
      <button class="tents-btn-approve" onclick="handleApprove('${req.id}')">Approve</button>
      <button class="tents-btn-deny" onclick="handleDeny('${req.id}')">Deny</button>
    `;
  } else if (req.status === 'approved') {
    // NEW: Start Event button
    return `
      <button class="tents-btn-start" onclick="handleStartEvent('${req.id}')">Start Event</button>
      <button class="tents-btn-complete" onclick="handleComplete('${req.id}')">Mark as Completed</button>
    `;
  } else if (req.status === 'in-progress') {
    return `
      <button class="tents-btn-complete" onclick="handleComplete('${req.id}')">Mark as Completed</button>
    `;
  }
  return '';
}
```

#### Handler Function:
```javascript
async function handleStartEvent(requestId) {
  console.log(`🚀 Starting event: ${requestId}`);
  
  const confirmed = await showConfirmModal(
    'Start Event',
    'Mark this booking as In Progress? This means the equipment is now in use or the event is happening.'
  );
  
  if (!confirmed) return;
  
  try {
    const request = allRequests.find(r => r.id === requestId);
    if (!request) {
      showToast('Request not found', false);
      return;
    }
    
    const requestRef = doc(db, 'tentsChairsBookings', requestId);
    await updateDoc(requestRef, {
      status: 'in-progress',
      inProgressAt: new Date()
    });
    
    console.log('✅ Event started successfully');
    
    // Create notification
    await createStatusChangeNotification(
      requestId,
      'tents-chairs',
      request.userId,
      'approved',
      'in-progress',
      request
    );
    
    showToast('Event marked as in progress', true);
    await loadAllRequests();
    
  } catch (error) {
    console.error('❌ Error starting event:', error);
    showToast('Failed to start event', false);
  }
}
```

**Advantages:**
- ✅ Admin has full control
- ✅ Can verify equipment was actually picked up/delivered
- ✅ Prevents status change if event is cancelled last-minute

**Disadvantages:**
- ❌ Requires admin action for every event
- ❌ Status may be inaccurate if admin forgets
- ❌ Not scalable for high volume

---

### Option 3: **HYBRID APPROACH** (Best of Both Worlds) ⭐ RECOMMENDED

Combine automatic transition with admin override capability.

#### Workflow:
1. **Automatic transition** when event date arrives
2. **Admin can manually start** if needed (early start)
3. **Admin can revert** if there's an issue
4. **Automatic completion** when return date passes (optional)

```javascript
async function checkAndUpdateEventStatuses() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  
  // === PART 1: Auto-transition APPROVED → IN-PROGRESS ===
  const approvedTentsQuery = query(
    collection(db, "tentsChairsBookings"),
    where("status", "==", "approved")
  );
  
  const approvedTents = await getDocs(approvedTentsQuery);
  
  for (const docSnap of approvedTents.docs) {
    const request = docSnap.data();
    
    if (todayStr >= request.startDate && todayStr <= request.endDate) {
      await updateDoc(doc(db, "tentsChairsBookings", docSnap.id), {
        status: 'in-progress',
        inProgressAt: new Date(),
        autoTransitioned: true // Flag for tracking
      });
      
      console.log(`✅ Auto-transitioned ${docSnap.id} to in-progress`);
      
      // Notify user
      await createNotification({
        userId: request.userId,
        type: 'status_change',
        title: '🎉 Your Event Started!',
        message: `Your booking is now in progress. Equipment is in use. Return by ${formatDateToWords(request.endDate)}.`,
        requestId: docSnap.id,
        requestType: 'tents-chairs',
        metadata: { autoTransitioned: true }
      });
    }
  }
  
  // === PART 2: Auto-remind for IN-PROGRESS near end date ===
  const inProgressQuery = query(
    collection(db, "tentsChairsBookings"),
    where("status", "==", "in-progress")
  );
  
  const inProgress = await getDocs(inProgressQuery);
  
  for (const docSnap of inProgress.docs) {
    const request = docSnap.data();
    
    // If today is the end date, remind to return
    if (todayStr === request.endDate) {
      await createNotification({
        userId: request.userId,
        type: 'booking_reminder',
        title: '⏰ Equipment Return Due Today',
        message: `Your tents & chairs booking ends today. Please return equipment to barangay by end of day.`,
        requestId: docSnap.id,
        requestType: 'tents-chairs',
        metadata: { reminderType: 'return_due' }
      });
    }
    
    // If past end date, auto-remind admin (don't auto-complete)
    if (todayStr > request.endDate) {
      console.warn(`⚠️ Request ${docSnap.id} is overdue (ended ${request.endDate})`);
      // Could create admin notification or flag for follow-up
    }
  }
}
```

**Admin UI:**
```javascript
// Show both manual and automatic controls
function renderActionButtons(req) {
  if (req.status === 'pending') {
    return `
      <button class="tents-btn-approve">Approve</button>
      <button class="tents-btn-deny">Deny</button>
    `;
  } else if (req.status === 'approved') {
    const isToday = req.startDate === new Date().toISOString().split('T')[0];
    return `
      ${isToday ? '<button class="tents-btn-start">Start Now (Manual)</button>' : ''}
      <button class="tents-btn-complete">Mark as Completed</button>
      <small style="color: #666;">Auto-starts on ${req.startDate}</small>
    `;
  } else if (req.status === 'in-progress') {
    return `
      <button class="tents-btn-complete">Mark as Completed</button>
      ${req.autoTransitioned ? '<small style="color: #666;">Auto-started</small>' : ''}
    `;
  }
  return '';
}
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Core Function (1-2 hours)
- [ ] Create `checkAndUpdateEventStatuses()` function
- [ ] Add Firestore field: `inProgressAt` (timestamp)
- [ ] Add Firestore field: `autoTransitioned` (boolean, optional)
- [ ] Test with sample data (approved request with today's date)

### Phase 2: Integration (1 hour)
- [ ] Call function on UserProfile page load
- [ ] Call function on admin-tents-requests page load
- [ ] Call function on admin-conference-requests page load
- [ ] Add loading state while status updates run

### Phase 3: Notifications (30 min)
- [ ] Update `createTodayEventNotification()` to trigger on actual transition
- [ ] Create "Event Started" notification variant
- [ ] Create "Return Due Today" notification

### Phase 4: Admin UI Updates (1 hour)
- [ ] Update status badge rendering
- [ ] Update filter counts
- [ ] Add "In Progress" tab/filter prominence
- [ ] Show auto-transition indicator

### Phase 5: Testing (1 hour)
- [ ] Test approved → in-progress on start date
- [ ] Test in-progress persists during event period
- [ ] Test multiple requests transitioning same day
- [ ] Test conference room (same-day events)
- [ ] Test filter showing in-progress requests
- [ ] Verify inventory counts include in-progress

### Phase 6: Production (Optional - Advanced)
- [ ] Set up Cloud Functions for scheduled job
- [ ] Run daily at midnight (Philippine Time)
- [ ] Add error logging and alerts
- [ ] Monitor for failed transitions

---

## 🔧 CODE LOCATION REFERENCE

### Files to Modify:

1. **script.js** (Primary changes):
   - Add `checkAndUpdateEventStatuses()` → Insert after line 3440 (after `checkAndCreateAutomatedReminders`)
   - Call in UserProfile init → Around line 3445
   - Call in admin page inits → Around line 6700 (tents), 11140 (conference)

2. **Firestore Data Model**:
   - New field: `inProgressAt` (timestamp) - tracks when status changed to in-progress
   - New field: `autoTransitioned` (boolean) - distinguishes auto vs manual transition

3. **CSS** (Already exists):
   - `.status-badge.status-in-progress` → Line 2038
   - `.tents-status-badge-in-progress` → Line 6240

### Existing Functions to Leverage:

- `createNotification()` → Line 2872 (for status change notifications)
- `loadUserRequests()` → Line 1683 (will automatically show in-progress)
- `loadAllRequests()` → Line 6787 (admin pages)
- `updateInventoryInUse()` → Line 7017 (already counts in-progress)

---

## 🎬 QUICK START IMPLEMENTATION

Here's the **minimal code** to get started:

```javascript
// Add to script.js after line 3440

/**
 * Check and update event statuses based on dates
 * Transitions: approved → in-progress (when event starts)
 */
async function checkAndUpdateEventStatuses() {
  console.log('[Status Auto-Update] ═══════════════════════════════════');
  console.log('[Status Auto-Update] Checking for status transitions...');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  
  console.log('[Status Auto-Update] Today:', todayStr);
  
  try {
    // === TENTS & CHAIRS ===
    const tentsQuery = query(
      collection(db, "tentsChairsBookings"),
      where("status", "==", "approved")
    );
    
    const tentsSnapshot = await getDocs(tentsQuery);
    console.log(`[Status Auto-Update] Found ${tentsSnapshot.size} approved tents bookings`);
    
    for (const docSnap of tentsSnapshot.docs) {
      const request = docSnap.data();
      
      // Check if event should be in-progress
      if (todayStr >= request.startDate && todayStr <= request.endDate) {
        await updateDoc(doc(db, "tentsChairsBookings", docSnap.id), {
          status: 'in-progress',
          inProgressAt: new Date()
        });
        
        console.log(`✅ [Status Auto-Update] Transitioned ${docSnap.id} to in-progress`);
      }
    }
    
    // === CONFERENCE ROOM ===
    const conferenceQuery = query(
      collection(db, "conferenceRoomBookings"),
      where("status", "==", "approved"),
      where("eventDate", "==", todayStr)
    );
    
    const conferenceSnapshot = await getDocs(conferenceQuery);
    console.log(`[Status Auto-Update] Found ${conferenceSnapshot.size} approved conference bookings for today`);
    
    for (const docSnap of conferenceSnapshot.docs) {
      await updateDoc(doc(db, "conferenceRoomBookings", docSnap.id), {
        status: 'in-progress',
        inProgressAt: new Date()
      });
      
      console.log(`✅ [Status Auto-Update] Transitioned ${docSnap.id} to in-progress`);
    }
    
    console.log('[Status Auto-Update] ✓ Status check completed');
    console.log('[Status Auto-Update] ═══════════════════════════════════');
    
  } catch (error) {
    console.error('[Status Auto-Update] ❌ Error:', error);
  }
}

// Call on UserProfile page load (add to existing onAuthStateChanged)
if (window.location.pathname.endsWith('UserProfile.html')) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      Promise.all([
        checkAndUpdateEventStatuses(),
        checkAndCreateAutomatedReminders()
      ]).then(() => {
        loadUserData();
        loadUserRequests();
        loadNotifications();
      });
    }
  });
}
```

---

## 📊 EXPECTED BEHAVIOR AFTER IMPLEMENTATION

### User Experience:
1. User submits request → Status: **Pending**
2. Admin approves → Status: **Approved**, receives approval notification
3. **Event start date arrives** → Status automatically changes to: **In Progress**
   - User sees notification: "🎉 Your Event Started!"
   - Status badge changes color
4. Admin marks as completed → Status: **Completed**

### Admin Experience:
1. Can see real-time status of all bookings
2. "In Progress" filter shows active events
3. Inventory accurately reflects in-use equipment
4. Can override if needed (manual "Start Event" button)

### System Benefits:
- ✅ Accurate inventory tracking (available vs in-use)
- ✅ Better reporting (events in progress vs upcoming)
- ✅ Automatic notifications aligned with actual status
- ✅ Reduced admin workload
- ✅ Improved user transparency

---

## 🚀 RECOMMENDATION

**Implement Option 3 (Hybrid Approach)** because:

1. **Automatic = Scalable**: System works without constant admin monitoring
2. **Accurate = Trustworthy**: Status reflects reality, not admin memory
3. **Flexible = Practical**: Admin can still intervene when needed
4. **User-Friendly = Transparent**: Users see their event progress in real-time
5. **Inventory = Accurate**: Clear distinction between upcoming vs active bookings

**Timeline:** 4-6 hours total implementation + testing

**Risk:** Low - function only reads and updates status, doesn't affect inventory logic

**Rollback:** Easy - remove function calls, status stays in previous state
