# Admin Forms Spinner Implementation Fix

## Problem Identified

The admin internal booking forms were not properly disabling form fields during submission because of a **conflict between two approaches**:

1. **Class-based approach** (CSS): Admin buttons had pre-existing HTML structure with `<span class="btn-text">` and `<span class="btn-spinner">` elements, plus CSS rules that toggle visibility via `.loading` class
2. **Helper-based approach** (JavaScript): The `showButtonSpinner()` function was being called, but it was checking for existing `.btn-spinner` and returning early without updating text or showing the spinner

## Root Cause

The original `showButtonSpinner()` function had this logic:
```javascript
const existing = button.querySelector('.btn-spinner');
if (existing) return existing; // ❌ EXITS EARLY!
```

Since admin buttons ALREADY had `.btn-spinner` in their HTML markup, the function would:
- ✅ Find the existing spinner
- ❌ Return early (skip all other logic)
- ❌ Never update button text
- ❌ Never show the spinner (it remained `display: none`)
- ❌ Never disable form fields (because early return skipped that code)

## Solution Implemented

### 1. Updated `showButtonSpinner()` Function (Line ~1327)

**Key Changes**:
- ✅ Detects if `.btn-spinner` already exists in HTML
- ✅ If exists, makes it visible (`display: inline-flex`)
- ✅ If doesn't exist, creates new spinner element
- ✅ Always updates button text regardless
- ✅ Always disables form fields if `disableForm: true`
- ✅ Always makes `.btn-text` visible during loading

**New Logic**:
```javascript
let spinner = button.querySelector('.btn-spinner');
const hasPreExistingSpinner = !!spinner;

if (!hasPreExistingSpinner) {
  // Create new spinner for user forms
  spinner = createSpinnerElement(16, '#0b3b8c');
  button.insertBefore(spinner, button.firstChild);
} else {
  // Show pre-existing spinner for admin forms
  spinner.style.display = 'inline-flex';
}

// Continue with text update and form disable logic...
```

### 2. Updated `hideButtonSpinner()` Function (Line ~1417)

**Key Changes**:
- ✅ Detects if spinner is from HTML (has content) or dynamically created (empty)
- ✅ Hides HTML spinners instead of removing them
- ✅ Removes dynamically created spinners
- ✅ Resets `.btn-text` display style to restore visibility

**New Logic**:
```javascript
const spinner = button.querySelector('.btn-spinner');
if (spinner) {
  const hasContent = spinner.children.length > 0 || spinner.textContent.trim() !== '';
  if (hasContent) {
    // Pre-existing HTML spinner - hide it
    spinner.style.display = 'none';
  } else {
    // Dynamically created spinner - remove it
    spinner.remove();
  }
}

// Reset btn-text display
btnTextEl.style.display = '';
```

### 3. Removed Manual Class Manipulation

**Removed from all 3 admin form handlers**:
```javascript
// ❌ REMOVED: Manual class toggling
submitBtn.classList.add('loading');
submitBtn.classList.remove('loading');

// ❌ REMOVED: Manual DOM manipulation
const btnText = submitBtn.querySelector('.btn-text');
const btnSpinner = submitBtn.querySelector('.btn-spinner');
btnText.style.display = 'none';
btnSpinner.style.display = 'inline-flex';
```

**Replaced with**:
```javascript
// ✅ UNIFIED: Helper function handles everything
showButtonSpinner(submitBtn, { disableForm: true, text: 'CREATING BOOKING' });

// In finally block:
hideButtonSpinner(submitBtn);
```

## Implementation Status

### ✅ All 5 Forms Now Use Unified Helper

| Form | Location | Button Text | Status |
|------|----------|-------------|--------|
| Tents & Chairs Request (User) | Line 5616 | "SUBMITTING REQUEST" | ✅ Fixed |
| Conference Room Request (User) | Line 6279 | "SUBMITTING REQUEST" | ✅ Fixed |
| Internal Booking (Admin Dashboard) | Line 7331 | "CREATING BOOKING" | ✅ Fixed |
| Internal Booking (Admin Tents) | Line 11452 | "CREATING BOOKING" | ✅ Fixed |
| Internal Booking (Admin Conference) | Line 14247 | "CREATING RESERVATION" | ✅ Fixed |

### ✅ All Forms Have Proper Cleanup

Each form has `hideButtonSpinner(submitBtn)` in its `finally` block to restore state after submission.

## How It Works Now

### For User Forms (No Pre-existing Spinner)
1. User clicks submit
2. `showButtonSpinner()` creates new spinner element
3. Inserts spinner at start of button
4. Wraps button text in `.btn-text` span
5. Changes text to "SUBMITTING REQUEST"
6. Disables ALL form fields (inputs, selects, textareas, buttons)
7. Sets `aria-busy="true"` on form
8. On completion: removes spinner, restores text, re-enables fields

### For Admin Forms (Pre-existing Spinner in HTML)
1. Admin clicks submit on internal booking modal
2. `showButtonSpinner()` finds existing `.btn-spinner` element
3. Makes it visible (`display: inline-flex`)
4. Finds existing `.btn-text` element
5. Changes text to "CREATING BOOKING" or "CREATING RESERVATION"
6. Disables ALL form fields (includes date, time, contact, etc.)
7. Sets `aria-busy="true"` on form
8. On completion: hides spinner (`display: none`), restores text, re-enables fields

## Reference-Counted Form Disable

The system uses **WeakMaps** to track concurrent operations per form:

```javascript
const _formSpinnerCount = new WeakMap(); // Track active spinners per form
const _formDisabledSnapshot = new WeakMap(); // Save original disabled state

function _incFormSpinner(form) {
  const count = (_formSpinnerCount.get(form) || 0) + 1;
  _formSpinnerCount.set(form, count);
  if (count === 1) _disableFormControls(form); // Only disable on FIRST operation
}

function _decFormSpinner(form) {
  const count = Math.max(0, (_formSpinnerCount.get(form) || 0) - 1);
  _formSpinnerCount.set(form, count);
  if (count === 0) _restoreFormControls(form); // Only restore when ALL operations complete
}
```

This prevents race conditions if multiple async operations run simultaneously.

## Testing Checklist

- [ ] **User Tents & Chairs Form** (`tents-chairs-request.html`)
  - [ ] Click "Submit Request" button
  - [ ] Verify all fields become disabled (date inputs, quantity, mode, address)
  - [ ] Verify button text changes to "SUBMITTING REQUEST"
  - [ ] Verify spinner appears
  - [ ] After submission, verify fields re-enable and button restores to "SUBMIT REQUEST"

- [ ] **User Conference Room Form** (`conference-request.html`)
  - [ ] Click "Submit Request" button
  - [ ] Verify all fields become disabled (date, time, purpose, contact)
  - [ ] Verify button text changes to "SUBMITTING REQUEST"
  - [ ] Verify spinner appears
  - [ ] After submission, verify fields re-enable and button restores

- [ ] **Admin Dashboard Internal Booking** (`admin.html`)
  - [ ] Click "Add Booking" button in internal booking modal
  - [ ] Verify all fields become disabled (booking type, dates, quantities/times)
  - [ ] Verify button text changes to "CREATING BOOKING"
  - [ ] Verify spinner appears
  - [ ] After creation, verify modal closes and button restores

- [ ] **Admin Tents Internal Booking** (`admin-tents-requests.html`)
  - [ ] Click "Add Booking" button in internal booking modal
  - [ ] Verify all fields become disabled
  - [ ] Verify button text changes to "CREATING BOOKING"
  - [ ] Verify spinner appears
  - [ ] After creation, verify modal closes and button restores

- [ ] **Admin Conference Internal Booking** (`admin-conference-requests.html`)
  - [ ] Click "Add Reservation" button in internal booking modal
  - [ ] Verify all fields become disabled
  - [ ] Verify button text changes to "CREATING RESERVATION"
  - [ ] Verify spinner appears
  - [ ] After creation, verify modal closes and button restores

## Key Benefits

1. **Unified Behavior**: All forms now use the same helper functions for consistency
2. **No Code Duplication**: Single source of truth for spinner logic
3. **Prevents Double-Submission**: Form fields disabled during async operations
4. **Accessibility**: `aria-busy` attribute informs screen readers
5. **Safe Concurrent Operations**: Reference counting prevents premature restoration
6. **Visual Feedback**: Button text changes to show progress
7. **Graceful Fallback**: Try-catch blocks prevent errors from breaking submission

## Developer Notes

- **Never manually manipulate `.loading` class** on admin buttons — let the helper handle it
- **Never manually change button `innerHTML`** — use the `text` option in `showButtonSpinner()`
- **Always call `hideButtonSpinner()` in `finally` block** — ensures cleanup even on errors
- **The helper automatically detects button structure** — works with both user and admin buttons
- **Pre-existing `.btn-spinner` elements are preserved** — not removed, just hidden/shown

## Files Modified

- `script.js` (Lines 1327-1455): Updated `showButtonSpinner()` and `hideButtonSpinner()` functions
- `script.js` (Line 5616): Tents & Chairs user form handler
- `script.js` (Line 6279): Conference Room user form handler
- `script.js` (Line 7331): Admin dashboard internal booking handler
- `script.js` (Line 11452): Admin tents internal booking handler
- `script.js` (Line 14247): Admin conference internal booking handler

---

**Implementation Complete**: All forms now properly disable fields and show loading states during submission.
