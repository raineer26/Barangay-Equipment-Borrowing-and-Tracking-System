# Phase 2: Real-Time Availability Validation - Testing Guide

## Overview
Phase 2 implements real-time validation on the **tents-chairs-request.html** form, providing instant feedback as users fill out their booking request.

**Purpose**: Prevent submission of requests that exceed available inventory during selected dates.

**Key Features**:
- ✅ Debounced validation (500ms after last input)
- ✅ Visual feedback (green ✓ available, red ✗ insufficient)
- ✅ Auto-disable submit button when stock insufficient
- ✅ Shows available quantity during selected dates
- ✅ Uses Phase 1 calculator for accurate date-based availability

---

## What Was Implemented

### 1. HTML Changes (`tents-chairs-request.html`)
Added availability feedback divs after quantity inputs:

```html
<!-- After quantityTents input -->
<div id="tentsAvailabilityFeedback" class="availability-feedback" style="display: none;">
  <span class="availability-icon"></span>
  <span class="availability-text"></span>
</div>

<!-- After quantityChairs input -->
<div id="chairsAvailabilityFeedback" class="availability-feedback" style="display: none;">
  <span class="availability-icon"></span>
  <span class="availability-text"></span>
</div>
```

### 2. JavaScript Logic (`script.js` lines ~9400-9700)
**Key Functions**:
- `scheduleValidation()` - Debounces validation to 500ms after last input
- `validateAvailability()` - Main validation function using Phase 1 calculator
- `updateAvailabilityUI()` - Shows green ✓ or red ✗ feedback
- `enableSubmitButton()` / `disableSubmitButton()` - Controls form submission

**Event Listeners**: Attached to `startDate`, `endDate`, `quantityChairs`, `quantityTents`

### 3. CSS Styles (`style.css` lines ~522-565)
```css
.availability-feedback.available {
  background-color: #e8f5e9;  /* Light green */
  border: 1px solid #4caf50;
  color: #2e7d32;
}

.availability-feedback.unavailable {
  background-color: #ffebee;  /* Light red */
  border: 1px solid #f44336;
  color: #c62828;
}
```

### 4. Form Submission Update (`script.js` lines ~6880-6950)
Submit function now checks calendar-based availability **BEFORE** submitting to Firestore:
- Calls `calculateAvailableStockForDateRange()` for chairs and tents
- Shows detailed error message if insufficient stock
- Proceeds only if both items have sufficient availability

---

## How to Test

### Prerequisites
1. **Open the form**: Navigate to `tents-chairs-request.html` in browser
2. **Login first**: Must be authenticated to see the form
3. **Open DevTools Console**: Press `F12` → Console tab
4. **Look for logs**: Search for `[Phase 2 Validation]` prefix

---

## Test Scenarios

### ✅ Test 1: Basic Real-Time Validation (No Overlaps)

**Setup**: No existing bookings

**Steps**:
1. Navigate to `tents-chairs-request.html`
2. Fill in form fields:
   - Start Date: December 25, 2025
   - End Date: December 27, 2025
   - Quantity Chairs: 100
   - Quantity Tents: 5
3. Wait 500ms after last input

**Expected Result**:
- ✅ **Green feedback appears** under chairs input:
  ```
  ✓ Available: 600 chairs during selected dates
  ```
- ✅ **Green feedback appears** under tents input:
  ```
  ✓ Available: 24 tents during selected dates
  ```
- ✅ **Submit button enabled** (normal opacity, clickable)
- ✅ **Console logs** show:
  ```
  [Phase 2 Validation] 🔄 Starting availability validation...
  [Phase 2 Validation] 🪑 Checking chairs availability (requested: 100)...
  [Phase 2 Validation] ⛺ Checking tents availability (requested: 5)...
  [Phase 2 Validation] ✅ All items available, enabling submit button
  ```

---

### ❌ Test 2: Insufficient Chairs (Single Overlap)

**Setup**: Create a booking first
1. Open browser console on `admin-tents-requests.html`
2. Run:
   ```javascript
   await addDoc(collection(db, 'tentsChairsBookings'), {
     fullName: 'Test User',
     firstName: 'Test',
     lastName: 'User',
     contactNumber: '09123456789',
     completeAddress: 'Test Address',
     quantityChairs: 500,
     quantityTents: 10,
     startDate: '2025-12-26',
     endDate: '2025-12-28',
     status: 'approved',
     userId: 'test123',
     userEmail: 'test@test.com',
     createdAt: new Date()
   });
   ```

**Steps**:
1. Navigate to `tents-chairs-request.html`
2. Fill in form:
   - Start Date: December 25, 2025
   - End Date: December 27, 2025
   - Quantity Chairs: **200** (overlaps with 500 already booked)
   - Quantity Tents: 5
3. Wait 500ms

**Expected Result**:
- ❌ **Red feedback appears** under chairs input:
  ```
  ✗ Insufficient: Only 100 chairs available (requested: 200)
  ```
  _(Calculation: 600 total - 500 in use = 100 available)_
- ✅ **Green feedback appears** under tents input:
  ```
  ✓ Available: 14 tents during selected dates
  ```
- ❌ **Submit button disabled** (opacity 0.5, cursor not-allowed)
- ✅ **Console logs** show:
  ```
  [Phase 2 Validation] 🪑 Chairs result: { available: 100, requested: 200, isAvailable: false }
  [Phase 2 Validation] 🚫 Insufficient stock, disabling submit button
  ```

---

### ✅ Test 3: Debouncing Behavior

**Purpose**: Verify validation only runs once after user stops typing

**Steps**:
1. Navigate to `tents-chairs-request.html`
2. In quantity chairs field, type rapidly: **1** → **10** → **100** → **500**
3. Watch console output

**Expected Result**:
- ✅ **Console shows scheduled validations** for each keystroke:
  ```
  [Phase 2 Validation] 📝 Input changed, scheduling validation...
  [Phase 2 Validation] 📝 Input changed, scheduling validation...
  [Phase 2 Validation] 📝 Input changed, scheduling validation...
  ```
- ✅ **But only ONE actual validation** runs 500ms after last keystroke:
  ```
  [Phase 2 Validation] ⏰ Debounce timer fired, running validation...
  [Phase 2 Validation] 🔄 Starting availability validation...
  ```
- ✅ **Firestore NOT queried** until user stops typing (performance optimization)

---

### 🔄 Test 4: Changing Dates to Fix Insufficient Stock

**Setup**: Continue from Test 2 (red feedback showing)

**Steps**:
1. From previous test, you have insufficient chairs message
2. Change **End Date** from Dec 27 → **Dec 25** (no overlap now)
3. Wait 500ms

**Expected Result**:
- ✅ **Feedback updates to green**:
  ```
  ✓ Available: 600 chairs during selected dates
  ```
- ✅ **Submit button re-enables**
- ✅ **Console shows recalculation**:
  ```
  [Phase 2 Validation] 🔄 Starting availability validation...
  [Phase 2 Validation] 🪑 Chairs result: { available: 600, requested: 200, isAvailable: true }
  [Phase 2 Validation] ✅ All items available, enabling submit button
  ```

---

### 🧹 Test 5: Incomplete Form (Hide Feedback)

**Purpose**: Verify feedback hides when form incomplete

**Steps**:
1. Clear **End Date** field (leave it empty)
2. Wait 500ms

**Expected Result**:
- ✅ **Feedback disappears** (both chairs and tents)
- ✅ **Submit button re-enables** (basic form validation will handle this)
- ✅ **Console shows**:
  ```
  [Phase 2 Validation] ℹ️ Incomplete form, hiding feedback
  [Phase 2 Validation] 👁️ Availability feedback hidden
  ```

---

### 📅 Test 6: Invalid Date Range

**Steps**:
1. Set Start Date: December 27, 2025
2. Set End Date: December 25, 2025 (end before start)
3. Enter quantities
4. Wait 500ms

**Expected Result**:
- ✅ **Feedback disappears**
- ❌ **Submit button disabled**
- ✅ **Console shows**:
  ```
  [Phase 2 Validation] ❌ Invalid date range (start > end)
  [Phase 2 Validation] 🔒 Submit button disabled: Invalid date range
  ```

---

### 🎯 Test 7: Submit with Insufficient Stock

**Purpose**: Verify form submission blocked even if user tries to submit

**Setup**: Continue from Test 2 scenario (insufficient chairs)

**Steps**:
1. Ensure red feedback showing (insufficient chairs)
2. Try to click **SUBMIT REQUEST** button

**Expected Result**:
- ❌ **Button is disabled** (cannot click)
- ❌ **Form does NOT submit**
- ✅ **User must fix quantities or dates first**

---

### ✅ Test 8: Submit with Sufficient Stock (Full Flow)

**Purpose**: Verify successful submission when stock available

**Steps**:
1. Clear any overlapping bookings (or use future dates)
2. Fill form completely:
   - Start Date: January 15, 2026
   - End Date: January 17, 2026
   - Chairs: 50
   - Tents: 2
3. Wait for green feedback
4. Click **SUBMIT REQUEST**

**Expected Result**:
- ✅ **Green feedback shows** for both items
- ✅ **Submit button enabled**
- ✅ **Confirmation modal appears** with request summary
- ✅ **After confirming**, form submits successfully
- ✅ **Console shows**:
  ```
  [Phase 2 Submit] Checking calendar-based availability...
  [Phase 2 Submit] Availability results: { chairs: {...}, tents: {...} }
  [Phase 2 Submit] ✅ All items available, proceeding with submission
  ```

---

### 🔁 Test 9: Cache Behavior (Same Inputs Twice)

**Purpose**: Verify validation doesn't duplicate if inputs unchanged

**Steps**:
1. Fill form with:
   - Start: Dec 20, 2025
   - End: Dec 22, 2025
   - Chairs: 100
   - Tents: 5
2. Wait for validation (green feedback appears)
3. Click in **Chairs** field and type same value **100** again
4. Wait 500ms

**Expected Result**:
- ✅ **Console shows skip duplicate**:
  ```
  [Phase 2 Validation] ⏭️ Skipping duplicate validation
  ```
- ✅ **No Firestore query made** (uses lastValidationState tracking)
- ✅ **Feedback remains visible** (no flicker)

---

### 🪑 Test 10: Only Chairs (Tents = 0)

**Purpose**: Verify feedback only shows for requested items

**Steps**:
1. Fill form:
   - Start: Dec 20, 2025
   - End: Dec 22, 2025
   - Chairs: 100
   - **Tents: 0** (not requesting tents)
2. Wait 500ms

**Expected Result**:
- ✅ **Chairs feedback shows**:
  ```
  ✓ Available: 600 chairs during selected dates
  ```
- ✅ **Tents feedback HIDDEN** (display: none)
- ✅ **Console shows**:
  ```
  [Phase 2 Validation] 🪑 Checking chairs availability...
  [Phase 2 Validation] (no tents check logged)
  ```

---

## Console Commands for Manual Testing

### Check Current Availability
```javascript
// Check chairs availability for date range
const chairsResult = await calculateAvailableStockForDateRange('2025-12-25', '2025-12-27', 'chairs');
console.log('Chairs:', chairsResult);

// Check tents availability for date range
const tentsResult = await calculateAvailableStockForDateRange('2025-12-25', '2025-12-27', 'tents');
console.log('Tents:', tentsResult);
```

### Create Test Booking (Setup for Tests)
```javascript
await addDoc(collection(db, 'tentsChairsBookings'), {
  fullName: 'Rose Johnson',
  firstName: 'Rose',
  lastName: 'Johnson',
  contactNumber: '09123456789',
  completeAddress: '123 Test St',
  quantityChairs: 400,
  quantityTents: 15,
  startDate: '2025-12-26',
  endDate: '2025-12-28',
  status: 'approved',
  modeOfReceiving: 'Delivery',
  userId: 'testuser123',
  userEmail: 'rose@test.com',
  createdAt: new Date()
});
```

### Clear Test Data
```javascript
const bookingsRef = collection(db, 'tentsChairsBookings');
const q = query(bookingsRef, where('userId', '==', 'testuser123'));
const snapshot = await getDocs(q);
snapshot.forEach(doc => deleteDoc(doc.ref));
console.log('Test bookings deleted');
```

---

## Troubleshooting

### ❌ Problem: Feedback Not Showing
**Check**:
1. Console shows `[Phase 2 Validation]` logs?
   - If NO → Check if on correct page (tents-chairs-request.html)
   - If YES → Check CSS (`.availability-feedback` should exist)
2. Elements exist in HTML?
   ```javascript
   console.log(document.getElementById('chairsAvailabilityFeedback'));
   console.log(document.getElementById('tentsAvailabilityFeedback'));
   ```

**Fix**: Refresh page, ensure HTML changes applied

---

### ❌ Problem: Validation Runs Too Many Times
**Check**: Console shows multiple validations for single input change

**Fix**: Debounce timer should cancel previous timeout. Check:
```javascript
// Should only see ONE of these per input change
[Phase 2 Validation] ⏰ Debounce timer fired, running validation...
```

---

### ❌ Problem: Submit Button Stuck Disabled
**Check**:
1. Console shows availability results?
2. Both items showing green feedback?
3. Try changing a value (trigger re-validation)

**Manual Fix**:
```javascript
const btn = document.querySelector('#tentsChairsForm button[type="submit"]');
btn.disabled = false;
btn.style.opacity = '1';
btn.style.cursor = 'pointer';
```

---

### ❌ Problem: Phase 1 Calculator Not Found
**Error**: `calculateAvailableStockForDateRange is not defined`

**Fix**: Phase 1 must be implemented first. Check:
```javascript
typeof calculateAvailableStockForDateRange === 'function'  // Should be true
```

If false, implement Phase 1 first.

---

## Success Criteria Checklist

Before moving to Phase 3, verify:

- [ ] Real-time feedback appears as user types
- [ ] Debouncing works (only one validation after 500ms)
- [ ] Green ✓ shows when stock available
- [ ] Red ✗ shows when stock insufficient
- [ ] Submit button disables when insufficient stock
- [ ] Submit button re-enables when stock becomes available
- [ ] Feedback hides for incomplete forms
- [ ] Invalid date ranges handled correctly
- [ ] Only requested items show feedback (tents=0 hides tents feedback)
- [ ] Form submission blocked when insufficient stock
- [ ] Form submission allowed when sufficient stock
- [ ] No console errors
- [ ] Cache prevents duplicate validations

---

## What's Next?

After completing Phase 2 testing:

**Phase 3**: Update Admin Approval Logic
- Replace static inventory checks in `handleApprove()`
- Show date-based availability in admin confirmation modal
- Block approval if insufficient stock during requested period
- Stop modifying `availableChairs` and `availableTents` on approval

**File**: `script.js` (Admin Tents Requests section around lines 11500-12000)

---

## Testing Log Template

Copy this to track your testing:

```
Date: _______________
Tester: _______________

Test 1 (Basic Validation): ☐ Pass ☐ Fail
Test 2 (Insufficient Stock): ☐ Pass ☐ Fail
Test 3 (Debouncing): ☐ Pass ☐ Fail
Test 4 (Date Change): ☐ Pass ☐ Fail
Test 5 (Incomplete Form): ☐ Pass ☐ Fail
Test 6 (Invalid Range): ☐ Pass ☐ Fail
Test 7 (Submit Blocked): ☐ Pass ☐ Fail
Test 8 (Submit Success): ☐ Pass ☐ Fail
Test 9 (Cache Behavior): ☐ Pass ☐ Fail
Test 10 (Single Item): ☐ Pass ☐ Fail

Notes:
_______________________________________
_______________________________________
```
