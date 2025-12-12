# Phase 1: Calendar-Based Availability Calculator - Testing Guide

**Status:** ✅ Implemented  
**Date:** December 12, 2025  
**Files Modified:** `script.js` (lines ~9170-9400)  
**Functions Added:** 
- `datesOverlap()` - Date range overlap checker
- `calculateAvailableStockForDateRange()` - Main availability calculator
- `availabilityCache` - 30-second caching mechanism

---

## 🎯 What Phase 1 Does

Phase 1 implements the **foundation** of the calendar-based availability system. Instead of relying on static inventory counters, the system now calculates availability based on **when items will be borrowed and returned**.

### Key Components

1. **`datesOverlap(start1, end1, start2, end2)`**
   - Checks if two date ranges overlap
   - Uses **strict inequality** (`<` and `>` instead of `<=` and `>=`)
   - Allows same-day return/pickup (Rose returns Dec 5 → Rachel can pickup Dec 5)

2. **`calculateAvailableStockForDateRange(startDate, endDate, itemType)`**
   - Main calculator function
   - Queries all approved/in-progress bookings
   - Filters bookings that overlap with requested period
   - Sums quantities in use
   - Returns: `{ available, inUse, total, overlappingBookings }`

3. **`availabilityCache`**
   - Caches results for 30 seconds
   - Keys: `availability_{startDate}_{endDate}_{itemType}`
   - Methods: `get()`, `set()`, `invalidate()`

---

## 🧪 Testing Procedures

### Prerequisites

1. ✅ **Firestore Setup**
   - `inventory/equipment` document exists with:
     ```javascript
     {
       totalChairs: 600,
       totalTents: 24,
       availableChairs: 600,  // Not used by Phase 1, but keep for backward compatibility
       availableTents: 24      // Not used by Phase 1, but keep for backward compatibility
     }
     ```

2. ✅ **Test Data** (create in Firestore `tentsChairsBookings` collection)
   - Use Firebase Console or create via the booking form
   - Minimum 3 test bookings (see test scenarios below)

3. ✅ **Browser Console Access**
   - Open Chrome DevTools (F12)
   - Go to Console tab
   - You'll see detailed logs with `[Availability Calculator]` prefix

---

## 📋 Test Scenarios

### Test 1: No Overlapping Bookings (Baseline)

**Setup:**
- No existing bookings in Firestore
- OR all bookings are outside the test date range

**Test Command:**
```javascript
// Open browser console on admin-tents-requests.html
await calculateAvailableStockForDateRange('2025-12-20', '2025-12-22', 'chairs');
```

**Expected Result:**
```javascript
{
  available: 600,      // Full stock available
  inUse: 0,            // Nothing in use
  total: 600,
  overlappingBookings: [],  // No overlaps
  dateRange: { start: '2025-12-20', end: '2025-12-22' },
  itemType: 'chairs'
}
```

**Console Logs to Verify:**
```
[Availability Calculator] 📊 Calculating availability...
[Availability Calculator] 📅 Date Range: 2025-12-20 to 2025-12-22
[Availability Calculator] 📦 Item Type: chairs
[Availability Calculator] 🔍 Querying Firestore for overlapping bookings...
[Availability Calculator] 📚 Found 0 approved/in-progress bookings
[Availability Calculator] 📊 Total in use during period: 0
[Availability Calculator] 📋 Overlapping bookings: 0
[Availability Calculator] 📦 Total stock from inventory: 600
[Availability Calculator] ✅ CALCULATION COMPLETE:
[Availability Calculator]   • Total Stock: 600
[Availability Calculator]   • In Use: 0
[Availability Calculator]   • Available: 600
```

---

### Test 2: Single Overlapping Booking

**Setup: Create Test Booking**

Via Firestore Console:
```javascript
// Collection: tentsChairsBookings
{
  fullName: "Test User - Rose",
  email: "rose@test.com",
  contactNumber: "09123456789",
  completeAddress: "Test Address",
  startDate: "2025-12-15",
  endDate: "2025-12-20",
  quantityChairs: 100,
  quantityTents: 5,
  modeOfReceiving: "Delivery",
  status: "approved",
  userId: "test-user-1",
  createdAt: new Date()
}
```

**Test Command:**
```javascript
// Test for chairs during Dec 18-22 (overlaps with Rose's Dec 15-20)
await calculateAvailableStockForDateRange('2025-12-18', '2025-12-22', 'chairs');
```

**Expected Result:**
```javascript
{
  available: 500,      // 600 total - 100 (Rose's booking)
  inUse: 100,
  total: 600,
  overlappingBookings: [
    {
      id: "...",
      startDate: "2025-12-15",
      endDate: "2025-12-20",
      quantity: 100,
      fullName: "Test User - Rose",
      status: "approved"
    }
  ],
  dateRange: { start: '2025-12-18', end: '2025-12-22' },
  itemType: 'chairs'
}
```

**Console Verification:**
```
[Date Overlap Check] { 
  range1: '2025-12-18 to 2025-12-22', 
  range2: '2025-12-15 to 2025-12-20', 
  overlaps: true 
}
[Availability Calculator]   ✓ Overlap found: {
  bookingId: '...',
  dates: '2025-12-15 to 2025-12-20',
  quantity: 100,
  user: 'Test User - Rose'
}
[Availability Calculator]   • Total Stock: 600
[Availability Calculator]   • In Use: 100
[Availability Calculator]   • Available: 500
```

---

### Test 3: Multiple Overlapping Bookings

**Setup: Create 2 More Bookings**

Booking 2:
```javascript
{
  fullName: "Test User - Rachel",
  startDate: "2025-12-18",
  endDate: "2025-12-25",
  quantityChairs: 50,
  quantityTents: 2,
  status: "approved",
  // ... other required fields
}
```

Booking 3:
```javascript
{
  fullName: "Test User - Monica",
  startDate: "2025-12-16",
  endDate: "2025-12-21",
  quantityChairs: 75,
  quantityTents: 3,
  status: "in-progress",  // Also counted
  // ... other required fields
}
```

**Test Command:**
```javascript
// Test for Dec 18-22 (should overlap with all 3 bookings)
await calculateAvailableStockForDateRange('2025-12-18', '2025-12-22', 'chairs');
```

**Expected Result:**
```javascript
{
  available: 375,      // 600 - 100 (Rose) - 50 (Rachel) - 75 (Monica)
  inUse: 225,
  total: 600,
  overlappingBookings: [
    { /* Rose's booking */ },
    { /* Rachel's booking */ },
    { /* Monica's booking */ }
  ],
  dateRange: { start: '2025-12-18', end: '2025-12-22' },
  itemType: 'chairs'
}
```

---

### Test 4: Same-Day Return/Pickup (Critical Edge Case)

**Setup:**
```javascript
// Rose returns chairs on Dec 15
{
  fullName: "Test User - Rose",
  startDate: "2025-12-10",
  endDate: "2025-12-15",
  quantityChairs: 200,
  status: "approved"
}
```

**Test Command:**
```javascript
// Rachel picks up on Dec 15 (same day Rose returns)
await calculateAvailableStockForDateRange('2025-12-15', '2025-12-20', 'chairs');
```

**Expected Result:**
```javascript
{
  available: 600,      // Full stock! Rose's booking DOES NOT overlap
  inUse: 0,
  total: 600,
  overlappingBookings: [],  // No overlap due to strict inequality
  dateRange: { start: '2025-12-15', end: '2025-12-20' },
  itemType: 'chairs'
}
```

**Console Verification:**
```
[Date Overlap Check] { 
  range1: '2025-12-15 to 2025-12-20', 
  range2: '2025-12-10 to 2025-12-15', 
  overlaps: false       // ✅ CORRECT! No overlap due to strict </>
}
```

**Why This Works:**
- Overlap formula: `start1 < end2 AND end1 > start2`
- Rose's endDate: Dec 15
- Rachel's startDate: Dec 15
- Check: `Dec 15 > Dec 15` → FALSE ✅

---

### Test 5: Cache Functionality

**Test Command (run twice):**
```javascript
// First call - cache miss
await calculateAvailableStockForDateRange('2025-12-20', '2025-12-22', 'chairs');

// Second call (within 30s) - cache hit
await calculateAvailableStockForDateRange('2025-12-20', '2025-12-22', 'chairs');
```

**Expected Console Logs:**

First call:
```
[Availability Cache] ❌ Cache MISS for availability_2025-12-20_2025-12-22_chairs
[Availability Calculator] 🔍 Querying Firestore for overlapping bookings...
[Availability Cache] 💾 Cached availability_2025-12-20_2025-12-22_chairs
```

Second call (within 30s):
```
[Availability Cache] 🎯 Cache HIT for availability_2025-12-20_2025-12-22_chairs
[Availability Calculator] ⚡ Returning cached result
```

**Verify Cache Invalidation:**
```javascript
// Manually clear cache
availabilityCache.invalidate();

// Next call should be cache miss
await calculateAvailableStockForDateRange('2025-12-20', '2025-12-22', 'chairs');
```

Expected:
```
[Availability Cache] 🗑️ Cache cleared
[Availability Cache] ❌ Cache MISS for availability_2025-12-20_2025-12-22_chairs
```

---

### Test 6: Tents (Different Item Type)

**Setup:**
```javascript
// Create tents booking
{
  fullName: "Test User - Chandler",
  startDate: "2025-12-18",
  endDate: "2025-12-22",
  quantityChairs: 0,
  quantityTents: 10,
  status: "approved"
}
```

**Test Command:**
```javascript
await calculateAvailableStockForDateRange('2025-12-20', '2025-12-25', 'tents');
```

**Expected Result:**
```javascript
{
  available: 14,       // 24 total - 10 (Chandler's booking)
  inUse: 10,
  total: 24,
  overlappingBookings: [
    {
      id: "...",
      quantity: 10,
      fullName: "Test User - Chandler"
    }
  ],
  itemType: 'tents'
}
```

---

### Test 7: Edge Cases & Error Handling

#### Missing Parameters
```javascript
await calculateAvailableStockForDateRange('2025-12-20', null, 'chairs');
// Expected: Throws error "Missing required parameters"
```

#### Invalid Item Type
```javascript
await calculateAvailableStockForDateRange('2025-12-20', '2025-12-22', 'tables');
// Expected: Throws error "Invalid item type. Must be 'chairs' or 'tents'"
```

#### Invalid Date Format
```javascript
await calculateAvailableStockForDateRange('12/20/2025', '12/22/2025', 'chairs');
// Expected: May work but log warnings (JavaScript Date parsing is flexible)
```

#### Inventory Document Missing
```javascript
// Temporarily delete inventory/equipment in Firestore
await calculateAvailableStockForDateRange('2025-12-20', '2025-12-22', 'chairs');
```

Expected Console:
```
[Availability Calculator] ⚠️ Inventory document not found! Using default values
[Availability Calculator]   • Total Stock: 600  // Default for chairs
```

---

## 🔍 How to Run Tests

### Method 1: Browser Console (Recommended)

1. Navigate to `http://localhost:5500/admin-tents-requests.html`
2. Open Chrome DevTools (F12)
3. Go to Console tab
4. Copy-paste test commands directly
5. Watch for `[Availability Calculator]` logs

### Method 2: Add Temporary Test Button

Add to `admin-tents-requests.html`:
```html
<button id="testAvailability" style="position:fixed; top:10px; right:10px; z-index:9999; background:red; color:white; padding:10px;">
  Run Tests
</button>
```

Add to `script.js` (in admin-tents-requests page block):
```javascript
document.getElementById('testAvailability')?.addEventListener('click', async () => {
  console.clear();
  console.log('🧪 Running Phase 1 Tests...\n');
  
  // Test 1: No overlaps
  console.log('TEST 1: No Overlapping Bookings');
  const test1 = await calculateAvailableStockForDateRange('2025-12-20', '2025-12-22', 'chairs');
  console.log('Result:', test1);
  console.log('✅ Expected available = 600:', test1.available === 600 ? 'PASS' : 'FAIL');
  console.log('\n');
  
  // Test 2: Same-day return/pickup
  console.log('TEST 2: Same-Day Return/Pickup');
  const test2 = await calculateAvailableStockForDateRange('2025-12-15', '2025-12-20', 'chairs');
  console.log('Result:', test2);
  console.log('✅ Rose\'s Dec 10-15 booking should NOT overlap:', test2.inUse === 0 ? 'PASS' : 'FAIL');
  console.log('\n');
  
  // Add more tests...
  
  console.log('🎉 All tests complete! Check results above.');
});
```

---

## ✅ Success Criteria

Phase 1 is successfully implemented if:

- [ ] All 7 test scenarios pass
- [ ] Console logs show correct overlap detection
- [ ] Cache works (hit/miss behavior verified)
- [ ] Same-day return/pickup allowed (strict inequality works)
- [ ] Both chairs and tents calculations work
- [ ] Error handling prevents invalid inputs
- [ ] No Firestore errors in console
- [ ] Performance acceptable (< 500ms per calculation)

---

## 🐛 Troubleshooting

### Issue: "availabilityCache is not defined"

**Solution:** Ensure you're on `admin-tents-requests.html` page. The code is scoped to this page only.

### Issue: "Missing required parameters"

**Solution:** Check date format. Must be `YYYY-MM-DD` (e.g., "2025-12-20", not "12/20/2025")

### Issue: Cache never hits

**Solution:** 
- Check if 30 seconds passed between calls
- Verify cache key matches exactly (dates must be identical)
- Try `availabilityCache.invalidate()` to clear and retry

### Issue: Wrong availability numbers

**Checklist:**
1. Verify booking status is "approved" or "in-progress" (pending/rejected/cancelled not counted)
2. Check date overlap logic with `datesOverlap()` directly
3. Verify quantity fields: `quantityChairs` and `quantityTents` are numbers
4. Check Firestore data: `startDate` and `endDate` in "YYYY-MM-DD" format
5. Verify inventory document exists with correct totals

### Issue: "Inventory document not found"

**Solution:** Create inventory document in Firestore:
```javascript
// Run in console
const inventoryRef = doc(db, 'inventory', 'equipment');
await setDoc(inventoryRef, {
  totalChairs: 600,
  totalTents: 24,
  availableChairs: 600,
  availableTents: 24,
  chairsInUse: 0,
  tentsInUse: 0,
  lastUpdated: new Date().toISOString()
});
```

### Issue: Date overlap logic wrong

**Debug:**
```javascript
// Test overlap function directly
datesOverlap('2025-12-10', '2025-12-15', '2025-12-15', '2025-12-20');
// Should return FALSE (no overlap - same day allowed)

datesOverlap('2025-12-10', '2025-12-16', '2025-12-15', '2025-12-20');
// Should return TRUE (overlaps on Dec 15-16)
```

---

## 📊 Performance Notes

- **First Call:** ~200-500ms (Firestore query + calculation)
- **Cached Call:** ~1-5ms (instant return)
- **Cache Memory:** Minimal (~1KB per cached result)
- **Firestore Reads:** 1 read per calculation (cached for 30s)

**Optimization Tips:**
- Cache invalidation should trigger on booking changes (Phase 2)
- For admin dashboards showing multiple periods, batch calculations
- Consider extending cache timeout to 60s if data changes infrequently

---

## 🚀 Next Steps

Once Phase 1 tests pass, proceed to:

**Phase 2: User Form Validation**
- Add real-time validation to `tents-chairs-request.html`
- Show availability feedback as user selects dates
- Disable submit button if insufficient stock

**Phase 3: Admin Approval Updates**
- Replace static inventory checks in `handleApprove()`
- Show date-based availability in admin approval modal
- Prevent approval if insufficient stock during period

---

## 📝 Testing Checklist

Before marking Phase 1 complete:

- [ ] Run all 7 test scenarios
- [ ] Verify console logs are comprehensive
- [ ] Test cache hit/miss behavior
- [ ] Test error handling (invalid inputs)
- [ ] Verify date overlap logic (same-day test)
- [ ] Test both chairs and tents
- [ ] Check performance (< 500ms)
- [ ] Document any issues found
- [ ] Commit changes to Git
- [ ] Create branch: `feature/calendar-based-availability`

---

**Last Updated:** December 12, 2025  
**Next Review:** After Phase 2 implementation
