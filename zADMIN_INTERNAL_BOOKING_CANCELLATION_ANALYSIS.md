# 📊 Admin Internal Booking Cancellation Analysis

## 🎯 Current Situation

### What Are Internal Bookings?

**Internal bookings** are reservations created by admin users for barangay events, internal activities, or official use. These bookings:

- ✅ **Auto-approved** - Skip the approval process (status = "approved" immediately)
- 🏷️ **Marked with flag** - `isInternalBooking: true` in Firestore
- 👤 **Admin-created** - Created through admin dashboard, not public request forms
- 📦 **Update inventory** - Immediately reduce available stock when created

### Where Internal Bookings Are Created

1. **Admin Dashboard** (`admin.html`)
   - Location: Lines 6795-7080 in `script.js`
   - Modal: `#internalBookingModal`
   - Creates: Tents & Chairs bookings
   - Auto-approved with `isInternalBooking: true`

2. **Admin Tents Requests Page** (`admin-tents-requests.html`)
   - Location: Lines 8283+ in `script.js`
   - Modal: `#internalBookingModalTents`
   - Creates: Tents & Chairs bookings
   - Auto-approved with `isInternalBooking: true`

3. **Admin Conference Requests Page** (`admin-conference-requests.html`)
   - Location: Lines 13590+ in `script.js`
   - Modal: `#internalBookingModalConference`
   - Creates: Conference room bookings
   - Auto-approved with `isInternalBooking: true`

---

## 🚨 THE PROBLEM

### Current Action Buttons (Tents & Chairs)

**For APPROVED requests (including internal bookings):**
```javascript
// From script.js lines 7536-7542
if (status === 'approved') {
  return `
    <div class="tents-action-buttons">
      <button class="tents-btn tents-btn-complete" onclick="window.completeRequest('${id}')">Mark Complete</button>
    </div>
  `;
}
```

**For IN-PROGRESS requests (including internal bookings):**
```javascript
// From script.js lines 7543-7549
if (status === 'in-progress') {
  return `
    <div class="tents-action-buttons">
      <button class="tents-btn tents-btn-complete" onclick="window.completeRequest('${id}')">Mark Complete</button>
    </div>
  `;
}
```

### ❌ Missing Functionality

**There is NO CANCEL/DELETE button for approved internal bookings.**

If admin creates an internal booking and then:
- ❌ Event gets cancelled
- ❌ Date changes
- ❌ Quantity needs to be adjusted
- ❌ Booking was created by mistake

**Current workaround:** Admin must:
1. Open Firestore console
2. Manually find the document
3. Delete it manually
4. Manually update inventory

This is **NOT user-friendly** and error-prone! ⚠️

---

## 💡 RECOMMENDED SOLUTION

### Option 1: **CANCEL BUTTON** (Recommended) ✅

**Add a "Cancel" button for approved/in-progress internal bookings**

#### Visual Flow
```
┌─────────────────────────────────────────────────┐
│  Admin creates internal booking                 │
│  Status: APPROVED ✅                            │
│  isInternalBooking: true                        │
└─────────────────────────────────────────────────┘
                    ↓
         ┌──────────────────────┐
         │  Event cancelled?    │
         │  Date changed?       │
         │  Made by mistake?    │
         └──────────────────────┘
                    ↓
         [Cancel Booking] Button
                    ↓
         ┌──────────────────────┐
         │  Confirmation Modal  │
         │  "Are you sure?"     │
         │  [Yes] [No]          │
         └──────────────────────┘
                    ↓
    ┌───────────────────────────────┐
    │  1. Update status: "cancelled"│
    │  2. Add cancelledAt timestamp │
    │  3. Return inventory to stock │
    │  4. Create notification       │
    └───────────────────────────────┘
```

#### Implementation Details

**1. Update `renderActionButtons()` Function**

```javascript
// For TENTS & CHAIRS (script.js ~line 7530)
function getActionButtons(req) {
  const status = req.status;
  const id = req.id;
  const isInternal = req.isInternalBooking || false;

  if (currentTab === 'history') {
    // History tab: show archive/delete
    return `
      <div class="tents-action-buttons">
        <button class="tents-btn tents-btn-archive" onclick="window.archiveRequest('${id}')">Archive</button>
        <button class="tents-btn tents-btn-delete" onclick="window.deleteRequest('${id}')">Delete</button>
      </div>
    `;
  }

  // Active requests tab
  if (status === 'pending') {
    return `
      <div class="tents-action-buttons">
        <button class="tents-btn tents-btn-approve" onclick="window.approveRequest('${id}')">Approve</button>
        <button class="tents-btn tents-btn-deny" onclick="window.denyRequest('${id}')">Deny</button>
      </div>
    `;
  } else if (status === 'approved') {
    // ✨ NEW: Add Cancel button for internal bookings
    const cancelBtn = isInternal ? 
      `<button class="tents-btn tents-btn-cancel" onclick="window.cancelInternalBooking('${id}')">Cancel</button>` : 
      '';
    return `
      <div class="tents-action-buttons">
        <button class="tents-btn tents-btn-complete" onclick="window.completeRequest('${id}')">Mark Complete</button>
        ${cancelBtn}
      </div>
    `;
  } else if (status === 'in-progress') {
    // ✨ NEW: Add Cancel button for internal bookings
    const cancelBtn = isInternal ? 
      `<button class="tents-btn tents-btn-cancel" onclick="window.cancelInternalBooking('${id}')">Cancel</button>` : 
      '';
    return `
      <div class="tents-action-buttons">
        <button class="tents-btn tents-btn-complete" onclick="window.completeRequest('${id}')">Mark Complete</button>
        ${cancelBtn}
      </div>
    `;
  }

  return '<span style="color: #6b7280;">No actions</span>';
}
```

**2. Create `cancelInternalBooking()` Handler Function**

```javascript
/**
 * Cancel an internal booking (admin-created booking)
 * Returns inventory to stock and updates status to "cancelled"
 */
window.cancelInternalBooking = async function(requestId) {
  console.log('🚫 [Cancel Internal Booking] Starting cancellation for:', requestId);
  
  try {
    // Get request data first
    const request = allRequests.find(r => r.id === requestId);
    if (!request) {
      await showConfirmModal('Error', 'Request not found.', null, true);
      return;
    }
    
    // Verify it's an internal booking
    if (!request.isInternalBooking) {
      await showConfirmModal(
        'Not Allowed', 
        'Only internal bookings can be cancelled this way. Regular user requests must be rejected instead.',
        null,
        true
      );
      return;
    }
    
    // Show confirmation
    const confirmed = await showConfirmModal(
      'Cancel Internal Booking',
      `Are you sure you want to cancel this internal booking?\n\n` +
      `Event: ${request.startDate} to ${request.endDate}\n` +
      `Tents: ${request.quantityTents}, Chairs: ${request.quantityChairs}\n\n` +
      `⚠️ This will return the equipment to available inventory.`,
      null,
      false
    );
    
    if (!confirmed) {
      console.log('❌ [Cancel Internal Booking] Cancelled by user');
      return;
    }
    
    // Get inventory document
    const inventoryRef = doc(db, 'inventory', 'equipment');
    const inventorySnap = await getDoc(inventoryRef);
    
    if (!inventorySnap.exists()) {
      await showConfirmModal('Error', 'Inventory document not found. Cannot update inventory.', null, true);
      return;
    }
    
    const currentInventory = inventorySnap.data();
    const tentsToReturn = parseInt(request.quantityTents) || 0;
    const chairsToReturn = parseInt(request.quantityChairs) || 0;
    
    // Calculate new inventory
    const newAvailableTents = (currentInventory.availableTents || 0) + tentsToReturn;
    const newAvailableChairs = (currentInventory.availableChairs || 0) + chairsToReturn;
    const newTentsInUse = Math.max(0, (currentInventory.tentsInUse || 0) - tentsToReturn);
    const newChairsInUse = Math.max(0, (currentInventory.chairsInUse || 0) - chairsToReturn);
    
    console.log('📦 [Cancel Internal Booking] Inventory changes:', {
      tentsReturned: tentsToReturn,
      chairsReturned: chairsToReturn,
      newAvailableTents,
      newAvailableChairs,
      newTentsInUse,
      newChairsInUse
    });
    
    // Update request status
    const requestRef = doc(db, 'tentsChairsBookings', requestId);
    await updateDoc(requestRef, {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelledBy: 'admin',
      cancellationReason: 'Internal booking cancelled by admin'
    });
    
    console.log('✅ [Cancel Internal Booking] Request status updated to cancelled');
    
    // Update inventory
    await updateDoc(inventoryRef, {
      availableTents: newAvailableTents,
      availableChairs: newAvailableChairs,
      tentsInUse: newTentsInUse,
      chairsInUse: newChairsInUse,
      lastUpdated: new Date()
    });
    
    console.log('✅ [Cancel Internal Booking] Inventory updated successfully');
    
    // Create notification (if user is not admin themselves)
    if (request.userId && typeof createStatusChangeNotification === 'function') {
      await createStatusChangeNotification(
        requestId,
        'tents-chairs',
        request.userId,
        request.status, // previous status
        'cancelled',
        request
      );
      console.log('✅ [Cancel Internal Booking] Notification created');
    }
    
    // Show success message
    showToast('Internal booking cancelled successfully. Inventory updated.', true);
    
    // Reload data
    await loadTentsRequests();
    
  } catch (error) {
    console.error('❌ [Cancel Internal Booking] Error:', error);
    await showConfirmModal('Error', `Failed to cancel booking: ${error.message}`, null, true);
  }
};
```

**3. Conference Room Cancel Function**

```javascript
/**
 * Cancel an internal conference room booking
 */
window.cancelInternalConferenceBooking = async function(requestId) {
  console.log('🚫 [Cancel Internal Conference] Starting cancellation for:', requestId);
  
  try {
    // Get request data
    const request = allRequests.find(r => r.id === requestId);
    if (!request) {
      await showConfirmModal('Error', 'Request not found.', null, true);
      return;
    }
    
    // Verify it's an internal booking
    if (!request.isInternalBooking) {
      await showConfirmModal(
        'Not Allowed', 
        'Only internal bookings can be cancelled this way. Regular user requests must be rejected instead.',
        null,
        true
      );
      return;
    }
    
    // Show confirmation
    const confirmed = await showConfirmModal(
      'Cancel Internal Booking',
      `Are you sure you want to cancel this internal conference room booking?\n\n` +
      `Event: ${request.eventDate}\n` +
      `Time: ${request.startTime} - ${request.endTime}\n` +
      `Purpose: ${request.purpose}\n\n` +
      `⚠️ This will free up the conference room for that time slot.`,
      null,
      false
    );
    
    if (!confirmed) {
      console.log('❌ [Cancel Internal Conference] Cancelled by user');
      return;
    }
    
    // Update request status
    const requestRef = doc(db, 'conferenceRoomBookings', requestId);
    await updateDoc(requestRef, {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelledBy: 'admin',
      cancellationReason: 'Internal booking cancelled by admin'
    });
    
    console.log('✅ [Cancel Internal Conference] Request status updated to cancelled');
    
    // Create notification (if user is not admin themselves)
    if (request.userId && typeof createStatusChangeNotification === 'function') {
      await createStatusChangeNotification(
        requestId,
        'conference-room',
        request.userId,
        request.status, // previous status
        'cancelled',
        request
      );
      console.log('✅ [Cancel Internal Conference] Notification created');
    }
    
    // Show success message
    showToast('Internal conference booking cancelled successfully.', true);
    
    // Reload data
    await loadAllRequests();
    
  } catch (error) {
    console.error('❌ [Cancel Internal Conference] Error:', error);
    await showConfirmModal('Error', `Failed to cancel booking: ${error.message}`, null, true);
  }
};
```

**4. Add CSS for Cancel Button**

```css
/* Cancel button for internal bookings */
.tents-btn-cancel {
  background: #ef4444; /* Red */
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Poppins', sans-serif;
}

.tents-btn-cancel:hover {
  background: #dc2626; /* Darker red */
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.tents-btn-cancel:active {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.2);
}
```

---

## 📋 Implementation Checklist

### Phase 1: Tents & Chairs Admin Page
- [ ] Update `getActionButtons()` function to show Cancel button for internal bookings
- [ ] Create `window.cancelInternalBooking()` handler function
- [ ] Add inventory return logic
- [ ] Add notification creation
- [ ] Test cancellation flow with sample internal booking
- [ ] Verify inventory updates correctly

### Phase 2: Conference Room Admin Page
- [ ] Update `renderActionButtons()` function to show Cancel button for internal bookings
- [ ] Create `window.cancelInternalConferenceBooking()` handler function
- [ ] Add notification creation
- [ ] Test cancellation flow
- [ ] Verify time slot becomes available

### Phase 3: Admin Dashboard (Second Implementation)
- [ ] Update action buttons in second tents admin implementation (lines 8283+)
- [ ] Ensure both implementations have Cancel functionality
- [ ] Test from admin dashboard

### Phase 4: Styling & UX
- [ ] Add CSS for `.tents-btn-cancel` button
- [ ] Test button hover/active states
- [ ] Ensure button placement doesn't break layout
- [ ] Test on mobile viewport

### Phase 5: Testing
- [ ] Create internal tents booking → Cancel → Verify inventory returned
- [ ] Create internal conference booking → Cancel → Verify time slot freed
- [ ] Try to cancel regular user request → Should show error
- [ ] Cancel in-progress internal booking → Should work
- [ ] Check notification created for user
- [ ] Verify cancelled bookings appear in History tab

---

## 🎯 Correct Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│         ADMIN CREATES INTERNAL BOOKING              │
│                                                     │
│  admin.html / admin-tents-requests.html /           │
│  admin-conference-requests.html                     │
└─────────────────────────────────────────────────────┘
                      ↓
            ┌──────────────────┐
            │  Firestore Doc   │
            │  Created         │
            └──────────────────┘
                      ↓
        ┌──────────────────────────┐
        │  status: "approved" ✅   │
        │  isInternalBooking: true │
        │  approvedAt: timestamp   │
        │  Inventory: DEDUCTED     │
        └──────────────────────────┘
                      ↓
    ┌─────────────────────────────────┐
    │  Booking appears in admin table │
    │  with action buttons:           │
    │  [Mark Complete] [Cancel] 🔴    │
    └─────────────────────────────────┘
                      ↓
        ┌──────────────────────┐
        │  Admin Decision      │
        └──────────────────────┘
                ↓           ↓
        [Complete]    [Cancel] 🔴
                ↓           ↓
    ┌───────────────┐  ┌────────────────────┐
    │ Status:       │  │ Status: "cancelled"│
    │ "completed"   │  │ cancelledAt: now   │
    │ completedAt   │  │ cancelledBy: admin │
    │               │  │ Inventory: RETURNED│
    └───────────────┘  └────────────────────┘
```

---

## 🔒 Security Considerations

### Access Control
- ✅ Only admins can create internal bookings (protected pages)
- ✅ Only admins can cancel internal bookings
- ✅ Regular users cannot cancel approved requests (different flow)
- ✅ Verify `isInternalBooking` flag before allowing cancellation

### Data Integrity
- ✅ Inventory updates are atomic (use Firestore transactions if needed)
- ✅ Cancelled bookings remain in database (soft delete)
- ✅ Timestamps track who cancelled and when
- ✅ Notifications inform users if booking was made on their behalf

### Validation
- ✅ Check if request exists before cancelling
- ✅ Verify it's an internal booking
- ✅ Confirm admin really wants to cancel (modal)
- ✅ Handle inventory document not existing gracefully

---

## 🆚 Comparison: Regular User Cancellation vs Admin Internal Cancellation

| Feature | User Request Cancellation | Admin Internal Cancellation |
|---------|--------------------------|----------------------------|
| **Who can cancel** | User (only their own) | Admin (any internal booking) |
| **When can cancel** | Only if status = "pending" | If status = "approved" or "in-progress" |
| **Button location** | UserProfile.html modal | Admin pages action column |
| **Inventory impact** | None (not approved yet) | Returns items to stock |
| **Status change** | pending → cancelled | approved/in-progress → cancelled |
| **Notification** | No (user cancelled own) | Yes (if created for another user) |
| **Use case** | User changes mind | Event cancelled/postponed |

---

## ✅ Benefits of This Solution

1. **User-Friendly** ✨
   - No need to access Firestore console
   - One-click cancellation with confirmation
   - Clear visual feedback

2. **Data Integrity** 🔒
   - Inventory automatically updated
   - Audit trail preserved (cancelledAt, cancelledBy)
   - Soft delete (data not lost)

3. **Consistency** 🎯
   - Follows same pattern as other admin actions
   - Same confirmation modal system
   - Same notification system

4. **Flexible** 🔄
   - Cancel approved bookings
   - Cancel in-progress bookings (if event called off)
   - Works for both tents/chairs and conference room

5. **Safe** 🛡️
   - Requires confirmation before cancelling
   - Only works for internal bookings
   - Prevents accidental cancellation of user requests

---

## 📝 Alternative Solutions (NOT Recommended)

### ❌ Option 2: Delete Button
**Why not?**
- Loses audit trail
- No way to track cancelled bookings
- Harder to debug inventory issues

### ❌ Option 3: Reject Like User Requests
**Why not?**
- Confusing UX (already approved)
- Doesn't fit the workflow
- "Reject" implies denial of a request, not cancellation of approved booking

### ❌ Option 4: Edit/Modify Booking
**Why not?**
- More complex to implement
- Harder to track changes
- Better to cancel and create new booking

---

## 🎯 Final Recommendation

**Implement Option 1: CANCEL BUTTON for internal bookings** ✅

This solution:
- ✅ Solves the immediate problem (admin can cancel their own bookings)
- ✅ Maintains data integrity (inventory updates, audit trail)
- ✅ User-friendly (simple one-click + confirmation)
- ✅ Consistent with existing patterns (uses same modals, toast, etc.)
- ✅ Safe (only works for internal bookings, requires confirmation)

---

## 📞 Questions to Consider

1. **Should cancelled internal bookings appear in History tab?**
   - **Recommendation:** YES, to maintain audit trail

2. **Can admin un-cancel a booking?**
   - **Recommendation:** NO, create a new booking instead (cleaner audit trail)

3. **Should there be a reason field for cancellation?**
   - **Recommendation:** OPTIONAL, default to "Internal booking cancelled by admin"

4. **Can admin cancel bookings that are in the past?**
   - **Recommendation:** NO, only future or current bookings

---

## 🚀 Next Steps

1. Review this analysis with stakeholders
2. Get approval for implementation approach
3. Implement Phase 1 (Tents & Chairs)
4. Test thoroughly with sample data
5. Implement Phase 2 (Conference Room)
6. Deploy and monitor

---

**Document Version:** 1.0  
**Created:** November 8, 2025  
**Status:** Pending Implementation
