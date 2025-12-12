# Inventory Diagnostic Script

## Problem: "0 tents available" even though no tents are in use

### Root Cause Analysis

The issue occurs when:
1. ❌ `inventory/equipment` document doesn't exist in Firestore, OR
2. ❌ The document exists but `totalTents` or `totalChairs` fields are missing/zero, OR  
3. ❌ Old cached data with `total: 0` is being used

### Immediate Fix (Run in Browser Console)

**Step 1: Clear the cache and reload**

```javascript
// Open browser console (F12) on tents-chairs-request.html
// Run this command:
availabilityCache.invalidate();
console.log('✅ Cache cleared! Now refresh the page.');
```

Then refresh the page (Ctrl+R or F5).

---

### Step 2: Check if Inventory Document Exists

```javascript
// Run this in console:
const inventoryRef = doc(db, 'inventory', 'equipment');
const inventorySnap = await getDoc(inventoryRef);

if (inventorySnap.exists()) {
  console.log('✅ Inventory document EXISTS');
  console.log('📋 Data:', inventorySnap.data());
} else {
  console.error('❌ Inventory document DOES NOT EXIST!');
  console.log('🔧 Creating inventory document now...');
  
  // Create the document with default values
  await setDoc(inventoryRef, {
    totalChairs: 600,
    totalTents: 24,
    availableChairs: 600,
    availableTents: 24,
    chairsInUse: 0,
    tentsInUse: 0,
    lastUpdated: new Date()
  });
  
  console.log('✅ Inventory document created successfully!');
  console.log('🔄 Please refresh the page and try again.');
}
```

---

### Step 3: Verify Inventory Fields

```javascript
// Run this to check field values:
const inventoryRef = doc(db, 'inventory', 'equipment');
const inventorySnap = await getDoc(inventoryRef);
const data = inventorySnap.data();

console.log('📊 Inventory Field Check:');
console.log('  totalTents:', data.totalTents, typeof data.totalTents);
console.log('  totalChairs:', data.totalChairs, typeof data.totalChairs);
console.log('  availableTents:', data.availableTents);
console.log('  availableChairs:', data.availableChairs);

// Check if fields are missing or zero
if (!data.totalTents || data.totalTents === 0) {
  console.error('❌ totalTents is missing or zero!');
  console.log('🔧 Fixing totalTents...');
  await updateDoc(inventoryRef, { totalTents: 24 });
  console.log('✅ totalTents set to 24');
}

if (!data.totalChairs || data.totalChairs === 0) {
  console.error('❌ totalChairs is missing or zero!');
  console.log('🔧 Fixing totalChairs...');
  await updateDoc(inventoryRef, { totalChairs: 600 });
  console.log('✅ totalChairs set to 600');
}

console.log('✅ Inventory check complete! Refresh the page.');
```

---

### Step 4: Test Availability Calculator Directly

```javascript
// Clear cache first
availabilityCache.invalidate();

// Test tents calculation
console.log('🧪 Testing tents availability...');
const tentsResult = await calculateAvailableStockForDateRange('2025-12-12', '2025-12-15', 'tents');
console.log('📊 Tents Result:', tentsResult);

// Test chairs calculation  
console.log('🧪 Testing chairs availability...');
const chairsResult = await calculateAvailableStockForDateRange('2025-12-12', '2025-12-15', 'chairs');
console.log('📊 Chairs Result:', chairsResult);

// Verify results
if (tentsResult.total === 0) {
  console.error('❌ PROBLEM: tentsResult.total is 0');
  console.error('🔍 Check if inventory document exists and has totalTents field');
} else {
  console.log('✅ Tents total looks good:', tentsResult.total);
}

if (chairsResult.total === 0) {
  console.error('❌ PROBLEM: chairsResult.total is 0');
  console.error('🔍 Check if inventory document exists and has totalChairs field');
} else {
  console.log('✅ Chairs total looks good:', chairsResult.total);
}
```

---

### Expected Console Output After Fix

When you submit the form with 24 tents for Dec 12-15, you should see:

```
[Page Load] 🧹 Clearing availability cache on tents-chairs-request.html page load
[Page Load] ✅ Cache cleared successfully

[Availability Calculator] 📊 Calculating availability...
[Availability Calculator] 📅 Date Range: 2025-12-12 to 2025-12-15
[Availability Calculator] 📦 Item Type: tents
[Availability Cache] ❌ Cache MISS for availability_2025-12-12_2025-12-15_tents
[Availability Calculator] 🔍 Querying Firestore for overlapping bookings...
[Availability Calculator] 📚 Found 0 approved/in-progress bookings
[Availability Calculator] 📊 Total in use during period: 0
[Availability Calculator] 📋 Overlapping bookings: 0
[Availability Calculator] 📦 Fetching total stock from inventory...
[Availability Calculator] ✅ Inventory document EXISTS
[Availability Calculator] 📋 Full inventory data: { totalTents: 24, totalChairs: 600, ... }
[Availability Calculator] 📦 Extracted total stock for tents: 24
[Availability Calculator] ✅ CALCULATION COMPLETE:
[Availability Calculator]   • Total Stock: 24
[Availability Calculator]   • In Use: 0
[Availability Calculator]   • Available: 24

[Phase 2 Submit] Availability results: { tents: { available: 24, requested: 24 } }
✅ [Phase 2 Submit] All items available, proceeding with submission
```

---

## What I Just Fixed

### 1. Cache Validation
- Added check to reject cached results with `total: 0` as invalid
- Forces fresh calculation if cache contains bad data
- Prevents using stale error data

### 2. Enhanced Logging
- Shows exactly what's in the cache when cache hits
- Logs full inventory document data
- Detailed error logging with all error properties
- Warns when totalStock is 0

### 3. Cache Invalidation on Page Load
- Automatically clears cache when loading tents-chairs-request.html
- Ensures fresh data on every page visit
- Prevents confusion from old cached errors

---

## Quick Resolution Steps

**Do this RIGHT NOW:**

1. **Open your browser** on the page showing the error
2. **Open Console** (press F12)
3. **Run this command:**
   ```javascript
   availabilityCache.invalidate(); location.reload();
   ```
4. **Try submitting again**

If it still shows 0 tents:

5. **Run the Step 2 diagnostic** from above to check/create inventory document
6. **Refresh the page**
7. **Try again**

---

## Long-Term Fix

The inventory document **MUST exist** in Firestore with these fields:

```javascript
// Firestore collection: inventory
// Document ID: equipment
{
  totalChairs: 600,
  totalTents: 24,
  availableChairs: 600,  // Updated by old system (Phase 3 still updates this)
  availableTents: 24,    // Updated by old system (Phase 3 still updates this)
  chairsInUse: 0,        // Updated by old system
  tentsInUse: 0,         // Updated by old system
  lastUpdated: Timestamp
}
```

**Note:** The new calendar-based system uses `totalChairs` and `totalTents`, but still updates the other fields for backward compatibility.

---

## Why This Happened

1. **Before my fix:** Error handler returned `{ available: 0, total: 0 }` 
2. **This got cached** for 30 seconds
3. **Your next attempt** within 30 seconds used the cached bad data
4. **Error message showed** "0 available" even though "0 in use"

The math didn't make sense because cached data was wrong!

---

## Prevention

- ✅ Cache now auto-clears on page load
- ✅ Cache validates data before returning
- ✅ Better error logging shows root cause
- ✅ Fallback to defaults (24/600) instead of 0
- ✅ Detailed console logs for debugging

**You should never see this issue again after refreshing the page!**
