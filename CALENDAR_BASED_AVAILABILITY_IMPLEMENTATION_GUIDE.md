# Calendar-Based Availability System - Implementation Guide

**For Developers Using GitHub Copilot**

**Status:** 📋 Planning Phase - DO NOT IMPLEMENT YET  
**Last Updated:** December 12, 2025  
**Complexity:** 7/10 (Moderately Major)  
**Estimated Time:** 6-8 hours (across 3 phases)

---

## ⚠️ IMPORTANT: Pre-Implementation Checklist

**BEFORE making ANY changes, you MUST:**

1. ✅ **Analyze the current system thoroughly**
   - Read this entire document
   - Review existing validation logic in `script.js`
   - Understand current inventory management
   - Check all form handlers and admin approval functions

2. ✅ **Ask GitHub Copilot to analyze:**
   ```
   "Analyze the current tents/chairs booking validation system in script.js. 
   Show me all functions related to inventory validation, including:
   - handleTentsChairsSubmit
   - handleApprove (admin side)
   - Current duplicate prevention logic
   - Inventory update functions
   Explain how they currently work."
   ```

3. ✅ **Create a backup:**
   - Commit all current changes to Git
   - Create a new branch: `feature/calendar-based-availability`
   - Test the current system to document baseline behavior

4. ✅ **Present implementation plan to team:**
   - Review this document with your team lead
   - Get approval before starting Phase 1
   - Confirm testing requirements

---

## 📖 System Overview

### Current Problem
The system currently uses a **static inventory counter**:
- `inventory/equipment` document has: `availableChairs`, `availableTents`
- When admin approves a booking, inventory is deducted
- When booking is completed, inventory is returned
- **Issue:** Doesn't account for WHEN items will be returned

### What We're Building
A **timeline-based availability system**:
- Stock availability calculated based on **booking schedules**
- System knows when items are borrowed and when they'll be returned
- Users can book items for future dates even if current inventory is 0
- Real-time validation as users select dates

### Example Scenario
```
Setup: 20 total chairs

Rose books: 20 chairs, Dec 1-5, Status: APPROVED
  → Current inventory shows: 0 chairs available

Current System Behavior:
  Rachel tries to book 15 chairs for Dec 5-7
  → ❌ BLOCKED (sees "0 chairs available")

New System Behavior:
  Rachel tries to book 15 chairs for Dec 5-7
  → ✅ ALLOWED (system knows Rose returns chairs on Dec 5)
  → Shows: "20 chairs available during Dec 5-7"
```

---

## 🏗️ Architecture Overview

### Phase 1: Foundation (Date-Range Calculator)
**File:** `script.js`  
**New Function:** `calculateAvailableStock(startDate, endDate, itemType)`

**What It Does:**
1. Queries all bookings with status `approved` or `in-progress`
2. Filters bookings that overlap with requested date range
3. Calculates: `Total Stock - Items in Use During Period`
4. Returns available quantity

**Date Overlap Logic:**
```javascript
// Two bookings overlap if:
requestStart <= existingEnd AND requestEnd >= existingStart

// Special Case: Same-day return/pickup
// If Rose returns on Dec 5, Rachel can pick up on Dec 5
// So we use STRICT inequality:
requestStart < existingEnd AND requestEnd > existingStart
```

### Phase 2: User Form Validation
**Files:** `script.js`, `tents-chairs-request.html`, `conference-request.html`

**What It Does:**
1. Adds event listeners to date/quantity inputs
2. Calls `calculateAvailableStock()` when inputs change
3. Shows real-time feedback (green ✓ or red ✗)
4. Disables submit if insufficient stock

### Phase 3: Admin Approval Updates
**Files:** `script.js` (admin sections)

**What It Does:**
1. Replaces static inventory check with date-range check
2. Shows detailed availability breakdown
3. Prevents approval if insufficient stock during period

---

## 📋 Detailed Implementation Plan

---

## **PHASE 1: Build Date-Range Availability Calculator**

### Step 1.1: Create Core Calculation Function

**Location:** `script.js` (add after existing inventory functions, around line 2000-2500)

**Prompt for Copilot:**
```
Create a function calculateAvailableStockForDateRange(startDate, endDate, itemType) that:
1. Takes startDate (YYYY-MM-DD), endDate (YYYY-MM-DD), itemType ('chairs' or 'tents')
2. Queries tentsChairsBookings collection for all approved/in-progress bookings
3. Filters bookings where dates overlap with requested range (requestStart < existingEnd AND requestEnd > existingStart)
4. Sums up the quantities of the specified itemType in overlapping bookings
5. Gets total stock from inventory/equipment document
6. Returns: totalStock - stockInUse
Include comprehensive logging with [Availability Calculator] prefix.
```

**Expected Function Signature:**
```javascript
/**
 * Calculate available stock for a specific date range
 * @param {string} startDate - Format: "YYYY-MM-DD"
 * @param {string} endDate - Format: "YYYY-MM-DD"
 * @param {string} itemType - "chairs" or "tents"
 * @returns {Promise<Object>} { available: number, inUse: number, total: number, overlappingBookings: Array }
 */
async function calculateAvailableStockForDateRange(startDate, endDate, itemType) {
  // Implementation here
}
```

**Key Logic Points:**
```javascript
// Date overlap check
function datesOverlap(start1, end1, start2, end2) {
  // Convert to Date objects for comparison
  const s1 = new Date(start1);
  const e1 = new Date(end1);
  const s2 = new Date(start2);
  const e2 = new Date(end2);
  
  // Strict inequality to allow same-day return/pickup
  return s1 < e2 && e1 > s2;
}

// Query bookings
const bookingsQuery = query(
  collection(db, "tentsChairsBookings"),
  where("status", "in", ["approved", "in-progress"])
);

// Filter and sum
let totalInUse = 0;
const overlappingBookings = [];

querySnapshot.forEach(doc => {
  const booking = doc.data();
  if (datesOverlap(startDate, endDate, booking.startDate, booking.endDate)) {
    const quantity = itemType === 'chairs' ? 
      parseInt(booking.quantityChairs || 0) : 
      parseInt(booking.quantityTents || 0);
    
    totalInUse += quantity;
    overlappingBookings.push({
      id: doc.id,
      startDate: booking.startDate,
      endDate: booking.endDate,
      quantity: quantity
    });
  }
});
```

### Step 1.2: Add Caching for Performance

**Prompt for Copilot:**
```
Create a caching mechanism for calculateAvailableStockForDateRange to improve performance:
1. Cache results for 30 seconds
2. Cache key: "availability_{startDate}_{endDate}_{itemType}"
3. Invalidate cache when any booking is created/updated/cancelled
4. Include cache hit/miss logging
```

**Implementation:**
```javascript
// Cache object
const availabilityCache = {
  data: {},
  timeout: 30000, // 30 seconds
  
  get(key) {
    const cached = this.data[key];
    if (cached && Date.now() - cached.timestamp < this.timeout) {
      console.log('[Availability Cache] 🎯 Cache HIT for', key);
      return cached.value;
    }
    console.log('[Availability Cache] ❌ Cache MISS for', key);
    return null;
  },
  
  set(key, value) {
    this.data[key] = {
      value: value,
      timestamp: Date.now()
    };
    console.log('[Availability Cache] 💾 Cached', key);
  },
  
  invalidate() {
    this.data = {};
    console.log('[Availability Cache] 🗑️ Cache cleared');
  }
};
```

### Step 1.3: Testing Phase 1

**Create Test Cases:**
```javascript
// Test 1: No overlapping bookings
await calculateAvailableStockForDateRange('2025-12-20', '2025-12-22', 'chairs');
// Expected: Full stock available (600 chairs)

// Test 2: One overlapping booking
// Setup: Create booking for 100 chairs, Dec 15-20
await calculateAvailableStockForDateRange('2025-12-18', '2025-12-22', 'chairs');
// Expected: 500 chairs available (600 - 100)

// Test 3: Multiple overlapping bookings
// Setup: 
//   - Booking 1: 100 chairs, Dec 15-20
//   - Booking 2: 50 chairs, Dec 18-25
await calculateAvailableStockForDateRange('2025-12-18', '2025-12-22', 'chairs');
// Expected: 450 chairs available (600 - 100 - 50)

// Test 4: Same-day return/pickup
// Setup: Booking 1: 200 chairs, Dec 10-15
await calculateAvailableStockForDateRange('2025-12-15', '2025-12-20', 'chairs');
// Expected: 600 chairs available (booking ends on Dec 15, so available)
```

**Verification Commands:**
```javascript
// Add console logging to track calculations
console.log('[Test] Querying bookings from Firestore...');
console.log('[Test] Found overlapping bookings:', overlappingBookings);
console.log('[Test] Total in use:', totalInUse);
console.log('[Test] Available:', available);
```

**Success Criteria for Phase 1:**
- ✅ Function correctly calculates overlapping bookings
- ✅ Returns accurate available stock
- ✅ Cache works (hit/miss logging visible)
- ✅ All test cases pass
- ✅ No errors in console

---

## **PHASE 2: Add Real-Time Form Validation**

### Step 2.1: Identify Form Elements

**Files to Modify:**
- `tents-chairs-request.html`
- `script.js` (form handler section, around line 6000-7500)

**Elements to Track:**
```javascript
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const quantityChairsInput = document.getElementById('quantityChairs');
const quantityTentsInput = document.getElementById('quantityTents');
const submitButton = document.querySelector('form button[type="submit"]');
```

### Step 2.2: Create Validation UI Elements

**Prompt for Copilot:**
```
Add HTML elements to tents-chairs-request.html for real-time validation feedback:
1. Add a div below quantity inputs to show availability status
2. Include green checkmark icon for available
3. Include red X icon for insufficient stock
4. Show available quantity text
5. Style with Poppins font and appropriate colors
```

**HTML to Add (in `tents-chairs-request.html`):**
```html
<!-- Add after quantityChairs input -->
<div id="chairsAvailabilityFeedback" class="availability-feedback" style="display: none;">
  <span class="availability-icon"></span>
  <span class="availability-text"></span>
</div>

<!-- Add after quantityTents input -->
<div id="tentsAvailabilityFeedback" class="availability-feedback" style="display: none;">
  <span class="availability-icon"></span>
  <span class="availability-text"></span>
</div>
```

**CSS to Add (in `style.css`):**
```css
.availability-feedback {
  margin-top: 8px;
  padding: 10px 14px;
  border-radius: 6px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.availability-feedback.available {
  background: #d4edda;
  border: 1px solid #28a745;
  color: #155724;
}

.availability-feedback.unavailable {
  background: #f8d7da;
  border: 1px solid #dc3545;
  color: #721c24;
}

.availability-icon {
  font-size: 1.2rem;
}

.availability-text {
  flex: 1;
}
```

### Step 2.3: Add Event Listeners

**Prompt for Copilot:**
```
In script.js, within the tents-chairs-request.html page conditional block:
1. Add event listeners to startDate, endDate, quantityChairs, quantityTents inputs
2. When any input changes, call a new function validateAvailability()
3. validateAvailability should:
   - Check if all required fields are filled
   - Call calculateAvailableStockForDateRange for both chairs and tents
   - Update UI feedback divs with results
   - Disable/enable submit button based on availability
4. Debounce the validation (wait 500ms after user stops typing)
```

**Implementation:**
```javascript
// Add in the tents-chairs-request page block
if (window.location.pathname.endsWith('tents-chairs-request.html')) {
  
  // Debounce helper
  let validationTimeout;
  function debounceValidation() {
    clearTimeout(validationTimeout);
    validationTimeout = setTimeout(() => {
      validateAvailability();
    }, 500);
  }
  
  // Event listeners
  startDateInput.addEventListener('change', debounceValidation);
  endDateInput.addEventListener('change', debounceValidation);
  quantityChairsInput.addEventListener('input', debounceValidation);
  quantityTentsInput.addEventListener('input', debounceValidation);
  
  // Validation function
  async function validateAvailability() {
    console.log('[Real-Time Validation] 🔄 Validating availability...');
    
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const requestedChairs = parseInt(quantityChairsInput.value) || 0;
    const requestedTents = parseInt(quantityTentsInput.value) || 0;
    
    // Check if all fields filled
    if (!startDate || !endDate || (requestedChairs === 0 && requestedTents === 0)) {
      hideAvailabilityFeedback();
      return;
    }
    
    // Validate date range
    if (new Date(startDate) > new Date(endDate)) {
      showAvailabilityError('Invalid date range');
      return;
    }
    
    // Check chairs availability
    let chairsAvailable = true;
    if (requestedChairs > 0) {
      const chairsResult = await calculateAvailableStockForDateRange(
        startDate, endDate, 'chairs'
      );
      
      chairsAvailable = chairsResult.available >= requestedChairs;
      updateAvailabilityUI('chairs', chairsAvailable, chairsResult.available, requestedChairs);
    }
    
    // Check tents availability
    let tentsAvailable = true;
    if (requestedTents > 0) {
      const tentsResult = await calculateAvailableStockForDateRange(
        startDate, endDate, 'tents'
      );
      
      tentsAvailable = tentsResult.available >= requestedTents;
      updateAvailabilityUI('tents', tentsAvailable, tentsResult.available, requestedTents);
    }
    
    // Enable/disable submit button
    const submitBtn = document.querySelector('form button[type="submit"]');
    submitBtn.disabled = !(chairsAvailable && tentsAvailable);
    
    console.log('[Real-Time Validation] ✓ Validation complete');
  }
  
  // UI update helpers
  function updateAvailabilityUI(itemType, isAvailable, availableQty, requestedQty) {
    const feedbackDiv = document.getElementById(`${itemType}AvailabilityFeedback`);
    const icon = feedbackDiv.querySelector('.availability-icon');
    const text = feedbackDiv.querySelector('.availability-text');
    
    feedbackDiv.style.display = 'flex';
    
    if (isAvailable) {
      feedbackDiv.className = 'availability-feedback available';
      icon.textContent = '✓';
      text.textContent = `Available: ${availableQty} ${itemType} during selected dates`;
    } else {
      feedbackDiv.className = 'availability-feedback unavailable';
      icon.textContent = '✗';
      text.textContent = `Insufficient stock: Only ${availableQty} ${itemType} available (requested: ${requestedQty})`;
    }
  }
  
  function hideAvailabilityFeedback() {
    document.getElementById('chairsAvailabilityFeedback').style.display = 'none';
    document.getElementById('tentsAvailabilityFeedback').style.display = 'none';
  }
}
```

### Step 2.4: Update Form Submit Handler

**Prompt for Copilot:**
```
Update the handleTentsChairsSubmit function to use calendar-based validation:
1. Before submitting, call calculateAvailableStockForDateRange
2. Block submission if insufficient stock
3. Show error message with available quantity
4. Keep existing duplicate prevention logic (but it should now check identical dates AND quantities)
```

**Key Changes:**
```javascript
async function handleTentsChairsSubmit(e) {
  e.preventDefault();
  
  // ... existing validation code ...
  
  // NEW: Calendar-based availability check
  console.log('[Submit] 🔍 Checking availability for date range...');
  
  const chairsResult = await calculateAvailableStockForDateRange(
    startDate, endDate, 'chairs'
  );
  const tentsResult = await calculateAvailableStockForDateRange(
    startDate, endDate, 'tents'
  );
  
  if (chairsResult.available < quantityChairs) {
    showAlert(
      `Insufficient chairs available.\n\n` +
      `You requested: ${quantityChairs} chairs\n` +
      `Available during ${startDate} to ${endDate}: ${chairsResult.available} chairs\n\n` +
      `Currently in use: ${chairsResult.inUse} chairs (${chairsResult.overlappingBookings.length} bookings)`,
      false
    );
    return;
  }
  
  if (tentsResult.available < quantityTents) {
    showAlert(
      `Insufficient tents available.\n\n` +
      `You requested: ${quantityTents} tents\n` +
      `Available during ${startDate} to ${endDate}: ${tentsResult.available} tents\n\n` +
      `Currently in use: ${tentsResult.inUse} tents (${tentsResult.overlappingBookings.length} bookings)`,
      false
    );
    return;
  }
  
  // Continue with submission...
}
```

### Step 2.5: Testing Phase 2

**Test Scenarios:**
1. **Select dates with sufficient stock**
   - Choose Dec 20-22, request 50 chairs
   - Should show: ✓ "Available: 600 chairs during selected dates"
   - Submit button should be enabled

2. **Select dates with insufficient stock**
   - Create a booking: 550 chairs, Dec 15-20
   - Choose Dec 18-22, request 100 chairs
   - Should show: ✗ "Insufficient stock: Only 50 chairs available (requested: 100)"
   - Submit button should be disabled

3. **Change dates to available period**
   - From previous test, change end date to Dec 21
   - Should recalculate and show available stock
   - Submit button should re-enable

4. **Test debouncing**
   - Type quantity rapidly (e.g., 1, 10, 100, 500)
   - Should only validate once, 500ms after last keystroke

**Success Criteria for Phase 2:**
- ✅ Real-time feedback appears as user types
- ✅ Availability calculated correctly based on selected dates
- ✅ Submit button disabled when insufficient stock
- ✅ Error messages are clear and helpful
- ✅ No console errors
- ✅ Debouncing works (only one validation per input change)

---

## **PHASE 3: Update Admin Approval with Date-Based Validation**

### Step 3.1: Locate Admin Approval Functions

**Files:** `script.js`
**Functions to Update:**
- `handleApprove()` in Tents Admin section (around line 11500-11800)
- `handleApprove()` in Conference Admin section (around line 16000-16300)

**Prompt for Copilot:**
```
Find all handleApprove functions in script.js. Show me the current inventory validation logic and explain how it works.
```

### Step 3.2: Replace Static Inventory Check

**Current Code (to replace):**
```javascript
// OLD: Static inventory check
const inventorySnap = await getDoc(inventoryRef);
const currentInventory = inventorySnap.data();

if (currentInventory.availableChairs < requestedChairs) {
  // Block approval
}
```

**New Code:**
```javascript
// NEW: Calendar-based availability check
const chairsResult = await calculateAvailableStockForDateRange(
  request.startDate,
  request.endDate,
  'chairs'
);

const tentsResult = await calculateAvailableStockForDateRange(
  request.startDate,
  request.endDate,
  'tents'
);

// Check availability (excluding the current request if it's already approved)
let availableChairs = chairsResult.available;
let availableTents = tentsResult.available;

// If this request is already approved (re-approval scenario), add back its quantities
if (request.status === 'approved') {
  availableChairs += parseInt(request.quantityChairs || 0);
  availableTents += parseInt(request.quantityTents || 0);
}

// Validate
if (availableChairs < request.quantityChairs || availableTents < request.quantityTents) {
  const insufficientItems = [];
  
  if (availableChairs < request.quantityChairs) {
    insufficientItems.push(
      `Chairs: Requested ${request.quantityChairs}, Available ${availableChairs} ` +
      `(${chairsResult.inUse} in use by ${chairsResult.overlappingBookings.length} bookings)`
    );
  }
  
  if (availableTents < request.quantityTents) {
    insufficientItems.push(
      `Tents: Requested ${request.quantityTents}, Available ${availableTents} ` +
      `(${tentsResult.inUse} in use by ${tentsResult.overlappingBookings.length} bookings)`
    );
  }
  
  await showConfirmModal(
    'Insufficient Inventory',
    `Cannot approve this request due to insufficient stock during the requested period:<br><br>` +
    `<strong>Date Range:</strong> ${request.startDate} to ${request.endDate}<br><br>` +
    insufficientItems.join('<br>'),
    null,
    true // Alert mode
  );
  
  return; // Block approval
}
```

### Step 3.3: Update Confirmation Modal

**Prompt for Copilot:**
```
Update the approval confirmation modal to show detailed availability breakdown:
1. Show available quantity during requested period
2. Show number of overlapping bookings
3. Show inventory that will remain after approval
Make it informative but not overwhelming.
```

**Enhanced Confirmation:**
```javascript
const confirmed = await showConfirmModal(
  'Approve Booking Request',
  `Are you sure you want to approve this booking?<br><br>` +
  `<strong>User:</strong> ${request.fullName}<br>` +
  `<strong>Dates:</strong> ${request.startDate} to ${request.endDate}<br>` +
  `<strong>Chairs:</strong> ${request.quantityChairs}<br>` +
  `<strong>Tents:</strong> ${request.quantityTents}<br><br>` +
  `<div class="tents-inventory-preview">` +
    `<strong>Availability During This Period:</strong><br>` +
    `Chairs: ${availableChairs} available (${chairsResult.overlappingBookings.length} other bookings)<br>` +
    `Tents: ${availableTents} available (${tentsResult.overlappingBookings.length} other bookings)<br><br>` +
    `<strong>After Approval:</strong><br>` +
    `Chairs: ${availableChairs - request.quantityChairs} will remain available<br>` +
    `Tents: ${availableTents - request.quantityTents} will remain available` +
  `</div>`
);
```

### Step 3.4: Handle Inventory Updates on Approval

**Important Note:** Since we're using calendar-based validation, we may want to **remove** or **deprecate** the static inventory updates:

**Option A: Keep Static Inventory (Hybrid Approach)**
- Continue updating `availableChairs/Tents` for backwards compatibility
- Use it as a "quick reference" for admins
- Calendar-based validation is authoritative

**Option B: Remove Static Inventory (Pure Calendar Approach)**
- Stop updating `availableChairs/Tents` on approval
- Always calculate availability on-the-fly
- Cleaner but requires all validations to use new system

**Recommendation:** Start with Option A (hybrid), transition to Option B after thorough testing.

### Step 3.5: Testing Phase 3

**Test Scenarios:**

1. **Approve with sufficient stock**
   - Create request: 100 chairs, Dec 25-27
   - Admin approves
   - Should show availability breakdown
   - Should succeed

2. **Block approval with insufficient stock**
   - Existing booking: 550 chairs, Dec 15-20
   - New request: 100 chairs, Dec 18-22
   - Admin tries to approve
   - Should show error: "Only 50 chairs available"
   - Should block approval

3. **Approve non-overlapping booking**
   - Existing booking: 200 chairs, Dec 10-15
   - New request: 200 chairs, Dec 15-20
   - Admin approves
   - Should succeed (no overlap, Rose returns on Dec 15)

4. **Multiple overlapping bookings**
   - Booking 1: 200 chairs, Dec 10-20
   - Booking 2: 150 chairs, Dec 15-25
   - New request: 300 chairs, Dec 18-22
   - Admin tries to approve
   - Should show: "250 chairs available (350 in use by 2 bookings)"
   - Should block

**Success Criteria for Phase 3:**
- ✅ Admin sees detailed availability breakdown
- ✅ Approval blocked when insufficient stock
- ✅ Approval succeeds when sufficient stock
- ✅ Overlapping bookings counted correctly
- ✅ No false positives/negatives
- ✅ Error messages are clear and actionable

---

## 🔍 Post-Implementation Verification

### Complete System Test

After implementing all 3 phases, run this comprehensive test:

**Scenario: Week-long Chair Shortage**

```
Total Chairs: 600

Day 1: Approve booking A - 300 chairs, Dec 10-15
Day 2: Approve booking B - 200 chairs, Dec 12-18
Day 3: User C tries to book 150 chairs, Dec 14-17
  → Should be BLOCKED (500 chairs in use, only 100 available)
  
Day 4: User D tries to book 100 chairs, Dec 14-17
  → Should be ALLOWED (exactly 100 available)
  → Admin approves
  
Day 5: User E tries to book 50 chairs, Dec 16-20
  → Should be BLOCKED during Dec 16-18 (still 500 in use)
  → Should calculate: Dec 16-18 = 100 available, Dec 19-20 = 400 available
  → Real-time validation should show unavailable
  
Day 6: User E changes dates to Dec 19-22
  → Should be ALLOWED (400 available)
  → Admin approves
  
Day 7 (Dec 15): Booking A auto-changes to "completed"
  → Future bookings for Dec 15+ should now see 300 more chairs available
```

### Performance Testing

**Test Cache Effectiveness:**
```javascript
// Clear cache
availabilityCache.invalidate();

// First call (cache miss)
console.time('First Call');
await calculateAvailableStockForDateRange('2025-12-20', '2025-12-25', 'chairs');
console.timeEnd('First Call');
// Expected: 100-300ms

// Second call (cache hit)
console.time('Second Call');
await calculateAvailableStockForDateRange('2025-12-20', '2025-12-25', 'chairs');
console.timeEnd('Second Call');
// Expected: <5ms
```

**Test with Large Dataset:**
```
Create 50 bookings with various overlapping dates
Request availability for popular dates
Should return result in < 500ms
```

### Edge Cases to Test

1. **Same-day return and pickup:**
   - Booking A: Dec 1-10
   - Booking B: Dec 10-15
   - Should both be approved (no overlap)

2. **Midnight boundary:**
   - Booking A: Dec 1 to Dec 10
   - Booking B: Dec 10 to Dec 15
   - Test at 11:59 PM on Dec 9
   - Should still allow Booking B

3. **Cancelled booking:**
   - Approve 500 chairs, Dec 10-15
   - User cancels
   - New request for 500 chairs, Dec 12-17
   - Should be approved (cancelled booking not counted)

4. **Rejected booking:**
   - Request 500 chairs, Dec 10-15 (status: pending)
   - Admin rejects
   - New request for 500 chairs, Dec 10-15
   - Should be approved (rejected booking not counted)

---

## 🚨 Common Pitfalls & Solutions

### Pitfall 1: Timezone Issues
**Problem:** Date comparison fails due to timezone mismatch  
**Solution:** Always use YYYY-MM-DD format, parse to UTC midnight
```javascript
const dateUTC = new Date(dateString + 'T00:00:00Z');
```

### Pitfall 2: Off-by-One Errors
**Problem:** Same-day return/pickup blocked  
**Solution:** Use strict inequality (`<` and `>` instead of `<=` and `>=`)

### Pitfall 3: Cache Not Invalidating
**Problem:** User sees stale availability after booking  
**Solution:** Call `availabilityCache.invalidate()` after every booking create/update/cancel

### Pitfall 4: Performance Degradation
**Problem:** Slow validation with many bookings  
**Solution:** 
- Ensure Firestore has index on `status` field
- Consider limiting query to bookings within ±1 year
- Use cache aggressively

### Pitfall 5: Conference Room Logic Different
**Problem:** Conference rooms use time ranges, not date ranges  
**Solution:** Create separate `calculateConferenceAvailability()` function

---

## 📊 Rollback Plan

If critical issues arise:

### Immediate Rollback (Emergency)
```bash
git checkout main
git branch -D feature/calendar-based-availability
# System reverts to static inventory
```

### Partial Rollback (Keep Phase 1, Remove Phases 2-3)
1. Comment out real-time validation event listeners
2. Revert `handleTentsChairsSubmit` to original
3. Revert admin `handleApprove` to original
4. Keep `calculateAvailableStockForDateRange` for future use

### Issues That Require Rollback
- ❌ Validation blocking legitimate bookings (false negatives)
- ❌ Validation allowing conflicting bookings (false positives)
- ❌ Performance degradation (>2 second validation time)
- ❌ Critical errors breaking booking flow

---

## 📞 Support & Questions

### Before Starting
Ask your team lead:
1. Confirm testing environment available
2. Confirm backup/rollback procedures
3. Clarify acceptance criteria

### During Implementation
If you encounter issues:
1. Check console logs (all functions have comprehensive logging)
2. Use GitHub Copilot to debug specific functions
3. Refer to this document's troubleshooting section
4. Ask team lead before making architectural changes

### After Implementation
Submit for code review with:
1. Test results from all phases
2. Performance metrics (cache hit rate, validation speed)
3. List of edge cases tested
4. Documentation updates

---

## ✅ Sign-Off Checklist

Before marking this feature as COMPLETE, verify:

- [ ] **Phase 1 Complete**
  - [ ] `calculateAvailableStockForDateRange()` function implemented
  - [ ] Date overlap logic tested and verified
  - [ ] Caching mechanism working
  - [ ] All Phase 1 test cases pass

- [ ] **Phase 2 Complete**
  - [ ] Real-time validation on user forms
  - [ ] UI feedback elements added
  - [ ] Debouncing works correctly
  - [ ] Submit button enables/disables correctly
  - [ ] All Phase 2 test cases pass

- [ ] **Phase 3 Complete**
  - [ ] Admin approval uses calendar-based validation
  - [ ] Error messages are clear and detailed
  - [ ] Inventory preview shows correct calculations
  - [ ] All Phase 3 test cases pass

- [ ] **System Integration**
  - [ ] Complete scenario test passed
  - [ ] Performance tests acceptable (<500ms)
  - [ ] Edge cases tested
  - [ ] No console errors
  - [ ] No broken existing functionality

- [ ] **Documentation**
  - [ ] Code comments added
  - [ ] README updated (if needed)
  - [ ] Team briefed on new system
  - [ ] User-facing help text added

---

## 📝 Notes for Copilot Users

### Best Prompts to Use

**Analysis:**
```
"Analyze the calendar-based availability logic in calculateAvailableStockForDateRange. 
Explain the date overlap calculation and identify any edge cases."
```

**Debugging:**
```
"Debug why real-time validation is showing incorrect available stock. 
Check the date parsing, overlap logic, and cache invalidation."
```

**Testing:**
```
"Generate comprehensive test cases for the calendar-based availability system, 
including edge cases for same-day returns, timezone handling, and cache behavior."
```

**Optimization:**
```
"Analyze performance of calculateAvailableStockForDateRange. 
Suggest optimizations for handling 100+ concurrent bookings."
```

### When to Ask for Human Review
- Before changing date overlap logic (critical for correctness)
- Before modifying cache invalidation (affects data freshness)
- Before changing admin approval flow (business logic)
- When test cases fail unexpectedly

---

**END OF IMPLEMENTATION GUIDE**

**Remember:** This is a moderately complex change. Take it slow, test thoroughly, and don't hesitate to ask questions!
