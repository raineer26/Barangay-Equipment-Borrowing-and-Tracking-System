# Name Field Readonly Implementation Plan

## Date: December 7, 2025
## Status: 📋 PENDING VERIFICATION

---

## 📋 ANALYSIS SUMMARY

### Current Implementation Analysis

#### 1. **User Profile Edit Modal** (`UserProfile.html`)

**Current State:**
- Email field is **readonly** (line 222)
- First Name and Last Name fields are **editable** (lines 207, 212)
- Contact Number and Address fields are **editable** (lines 216, 227)

**HTML Structure:**
```html
<!-- CURRENTLY EDITABLE -->
<input type="text" id="editFirstName" placeholder="Enter your first name">
<input type="text" id="editLastName" placeholder="Enter your last name">

<!-- CURRENTLY EDITABLE -->
<input type="text" id="editContactNumber" placeholder="Enter your contact number">
<input type="text" id="editAddress" placeholder="Enter your address">

<!-- ALREADY READONLY (EMAIL) -->
<input type="email" id="editEmail" placeholder="Enter your email address" readonly>
```

**CSS Styling for Readonly Fields** (`style.css` line 3841):
```css
.form-group input[readonly] {
  background: #e8e8ff;
  color: #281ABC;
  font-weight: 600;
  cursor: not-allowed;
}
```

**Visual Effect:**
- Light purple background (#e8e8ff)
- Dark blue text (#281ABC)
- Bold font weight
- Not-allowed cursor on hover

---

#### 2. **Conference Room Request Form** (`conference-request.html`)

**Current State:**
- First Name and Last Name fields are **editable** (lines 111, 116)
- Auto-filled from Firestore user data on page load

**Auto-fill Implementation** (`script.js` line 6721):
```javascript
onAuthStateChanged(auth, (user) => {
  if (user) {
    autofillUserData({
      'firstName': 'firstName',
      'lastName': 'lastName',
      'contactNumber': 'contactNumber',
      'address': 'address'
    });
  }
});
```

**Auto-fill Function** (`script.js` line 6575-6625):
- Fetches user data from Firestore `users/{uid}` document
- Maps field IDs to Firestore data keys
- Fills input values automatically
- Adds `.autofilled` CSS class to filled fields
- **Important:** Currently does NOT make fields readonly

---

#### 3. **Tents & Chairs Request Form** (`tents-chairs-request.html`)

**Current State:**
- First Name and Last Name fields are **editable** (lines 107, 112)
- Auto-filled from Firestore user data on page load

**Auto-fill Implementation** (`script.js` line 6284):
```javascript
onAuthStateChanged(auth, (user) => {
  if (user) {
    autofillUserData({
      'firstName': 'firstName',
      'lastName': 'lastName',
      'contactNumber': 'contactNumber',
      'completeAddress': 'address'
    });
  }
});
```

---

#### 4. **Data Source for Auto-fill** (`script.js` line 2490-2500)

**User Profile Data Loading:**
```javascript
async function loadUserData() {
  const userData = docSnap.data();
  
  // Get firstName and lastName from Firestore
  const firstName = userData.firstName || '';
  const lastName = userData.lastName || '';
  
  // Pre-fill edit form with separate name fields
  document.getElementById('editFirstName').value = firstName;
  document.getElementById('editLastName').value = lastName;
}
```

**Firestore Document Structure:**
- Collection: `users`
- Document ID: `{uid}`
- Fields: `firstName`, `lastName`, `contactNumber`, `email`, `address`

---

## 🎯 REQUIRED CHANGES

### Change 1: Make First/Last Name Readonly in User Profile Edit Modal

**Files to Modify:**
- `UserProfile.html` (lines 207, 212)

**Changes:**
1. Add `readonly` attribute to `editFirstName` input
2. Add `readonly` attribute to `editLastName` input
3. Add explanatory comments (similar to email field)

**Expected Result:**
- Users can view but cannot edit their first and last names
- Fields will have the same visual styling as the email field (purple background, bold text, not-allowed cursor)
- CSS styling will automatically apply via existing `.form-group input[readonly]` rule

---

### Change 2: Make First/Last Name Readonly in Conference Room Request Form

**Files to Modify:**
- `conference-request.html` (lines 111, 116)

**Changes:**
1. Add `readonly` attribute to `firstName` input
2. Add `readonly` attribute to `lastName` input
3. Add explanatory comments

**Expected Result:**
- Fields will be auto-filled from user profile
- Users cannot modify their names on the form
- Same visual styling as profile edit modal

---

### Change 3: Make First/Last Name Readonly in Tents & Chairs Request Form

**Files to Modify:**
- `tents-chairs-request.html` (lines 107, 112)

**Changes:**
1. Add `readonly` attribute to `firstName` input
2. Add `readonly` attribute to `lastName` input
3. Add explanatory comments

**Expected Result:**
- Fields will be auto-filled from user profile
- Users cannot modify their names on the form
- Same visual styling as profile edit modal

---

### Change 4: Remove First/Last Name Validation from Profile Edit Script

**Files to Modify:**
- `script.js` (lines 2253-2288)

**Changes:**
1. Remove validation logic for `editFirstName` field
2. Remove validation logic for `editLastName` field
3. Remove `firstName` and `lastName` from the update payload
4. Remove input event listeners for name fields (line 2377)
5. Remove error clearing for name fields (lines 2053, 2193, 2213, 2245)

**Rationale:**
- Since fields are readonly, validation is unnecessary
- Firestore update should not include firstName/lastName
- Simplifies the save profile logic

---

## 📊 IMPACT ANALYSIS

### Fields Affected

| Field | Location | Current State | New State | User Can Edit? |
|-------|----------|---------------|-----------|----------------|
| **First Name** | Profile Edit Modal | Editable | **Readonly** | ❌ No |
| **Last Name** | Profile Edit Modal | Editable | **Readonly** | ❌ No |
| **Email** | Profile Edit Modal | Readonly | Readonly | ❌ No |
| **Contact Number** | Profile Edit Modal | Editable | Editable | ✅ Yes |
| **Address** | Profile Edit Modal | Editable | Editable | ✅ Yes |
| **First Name** | Conference Request | Editable (auto-filled) | **Readonly** | ❌ No |
| **Last Name** | Conference Request | Editable (auto-filled) | **Readonly** | ❌ No |
| **First Name** | Tents Request | Editable (auto-filled) | **Readonly** | ❌ No |
| **Last Name** | Tents Request | Editable (auto-filled) | **Readonly** | ❌ No |

### User Experience Changes

**Before:**
1. User can edit their name in profile modal ✏️
2. User can edit their name in request forms (even after auto-fill) ✏️
3. Name might differ between profile and requests 🔄

**After:**
1. User cannot edit their name in profile modal 🔒
2. User cannot edit their name in request forms (auto-filled and locked) 🔒
3. Name is **always consistent** across profile and all requests ✅

### Benefits

1. **Data Consistency** - Names are always the same across all forms
2. **Security** - Prevents users from submitting requests under different names
3. **Admin Trust** - Admins can trust that request names match user profiles
4. **Audit Trail** - Easier to track requests back to specific users
5. **User Experience** - Clear indication that name is tied to account (cannot be changed casually)

---

## 🔧 DETAILED IMPLEMENTATION STEPS

### Step 1: UserProfile.html Modifications

**Location:** Lines 204-213

**BEFORE:**
```html
<div class="form-group">
  <label for="editFirstName">First Name</label>
  <input type="text" id="editFirstName" placeholder="Enter your first name">
  <div class="error-message" id="error-edit-firstname"></div>
</div>
<div class="form-group">
  <label for="editLastName">Last Name</label>
  <input type="text" id="editLastName" placeholder="Enter your last name">
  <div class="error-message" id="error-edit-lastname"></div>
</div>
```

**AFTER:**
```html
<div class="form-group">
  <label for="editFirstName">First Name</label>
  <!-- First Name is not editable: tied to user account registration -->
  <input type="text" id="editFirstName" placeholder="Enter your first name" readonly>
  <div class="error-message" id="error-edit-firstname"></div>
</div>
<div class="form-group">
  <label for="editLastName">Last Name</label>
  <!-- Last Name is not editable: tied to user account registration -->
  <input type="text" id="editLastName" placeholder="Enter your last name" readonly>
  <div class="error-message" id="error-edit-lastname"></div>
</div>
```

---

### Step 2: conference-request.html Modifications

**Location:** Lines 108-121

**BEFORE:**
```html
<div class="form-group">
  <label for="firstName">FIRST NAME:</label>
  <input type="text" id="firstName" name="firstName">
  <div class="error-message" id="errorFirstName"></div>
</div>
<div class="form-group">
  <label for="lastName">LAST NAME:</label>
  <input type="text" id="lastName" name="lastName">
  <div class="error-message" id="errorLastName"></div>
</div>
```

**AFTER:**
```html
<div class="form-group">
  <label for="firstName">FIRST NAME:</label>
  <!-- Auto-filled from user profile and not editable -->
  <input type="text" id="firstName" name="firstName" readonly>
  <div class="error-message" id="errorFirstName"></div>
</div>
<div class="form-group">
  <label for="lastName">LAST NAME:</label>
  <!-- Auto-filled from user profile and not editable -->
  <input type="text" id="lastName" name="lastName" readonly>
  <div class="error-message" id="errorLastName"></div>
</div>
```

---

### Step 3: tents-chairs-request.html Modifications

**Location:** Lines 104-117

**BEFORE:**
```html
<div class="form-group">
  <label for="firstName">FIRST NAME:</label>
  <input type="text" id="firstName" name="firstName">
  <div class="error-message" id="errorFirstName"></div>
</div>
<div class="form-group">
  <label for="lastName">LAST NAME:</label>
  <input type="text" id="lastName" name="lastName">
  <div class="error-message" id="errorLastName"></div>
</div>
```

**AFTER:**
```html
<div class="form-group">
  <label for="firstName">FIRST NAME:</label>
  <!-- Auto-filled from user profile and not editable -->
  <input type="text" id="firstName" name="firstName" readonly>
  <div class="error-message" id="errorFirstName"></div>
</div>
<div class="form-group">
  <label for="lastName">LAST NAME:</label>
  <!-- Auto-filled from user profile and not editable -->
  <input type="text" id="lastName" name="lastName" readonly>
  <div class="error-message" id="errorLastName"></div>
</div>
```

---

### Step 4: script.js Profile Edit Form Modifications

**Location:** Lines 2237-2308

**Current Logic:**
```javascript
// Handle Edit Profile Form Submit
editProfileForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Clear previous errors
  [errorEditFirstname, errorEditLastname, errorEditContact, errorEditAddress].forEach(el => {
    if (el) clearErrorSignup(el);
  });
  
  const firstName = document.getElementById('editFirstName').value.trim();
  const lastName = document.getElementById('editLastName').value.trim();
  const contact = document.getElementById('editContactNumber').value.trim();
  const address = document.getElementById('editAddress').value.trim();
  
  let valid = true;
  
  // First Name validation (lines 2258-2271)
  if (!firstName) {
    setErrorSignup(errorEditFirstname, "First Name can't be blank");
    valid = false;
  } else if (firstName.length < 2) {
    // ... more validation
  }
  
  // Last Name validation (lines 2273-2286)
  if (!lastName) {
    setErrorSignup(errorEditLastname, "Last Name can't be blank");
    valid = false;
  } else if (lastName.length < 2) {
    // ... more validation
  }
  
  // Contact validation (lines 2288-2301)
  // Address validation (lines 2303-2308)
  
  if (!valid) return;
  
  // Update Firestore (lines 2310-2350)
  await updateDoc(docRef, {
    firstName: firstName,
    lastName: lastName,
    contactNumber: contact,
    address: sanitizedAddress,
    updatedAt: new Date()
  });
});
```

**CHANGES NEEDED:**

1. **Remove name fields from error clearing** (line 2245):
   ```javascript
   // BEFORE:
   [errorEditFirstname, errorEditLastname, errorEditContact, errorEditAddress].forEach(...)
   
   // AFTER:
   [errorEditContact, errorEditAddress].forEach(...)
   ```

2. **Remove name field value retrieval** (lines 2249-2250):
   ```javascript
   // DELETE THESE LINES:
   const firstName = document.getElementById('editFirstName').value.trim();
   const lastName = document.getElementById('editLastName').value.trim();
   ```

3. **Remove entire name validation blocks** (lines 2254-2288):
   ```javascript
   // DELETE ALL NAME VALIDATION CODE (34 lines)
   ```

4. **Remove name fields from Firestore update** (lines 2315-2316):
   ```javascript
   // BEFORE:
   await updateDoc(docRef, {
     firstName: firstName,
     lastName: lastName,
     contactNumber: contact,
     address: sanitizedAddress,
     updatedAt: new Date()
   });
   
   // AFTER:
   await updateDoc(docRef, {
     contactNumber: contact,
     address: sanitizedAddress,
     updatedAt: new Date()
   });
   ```

5. **Remove name field input listeners** (lines 2376-2377):
   ```javascript
   // DELETE THESE LINES:
   document.getElementById('editFirstName')?.addEventListener('input', () => { if (errorEditFirstname) clearErrorSignup(errorEditFirstname); });
   document.getElementById('editLastName')?.addEventListener('input', () => { if (errorEditLastname) clearErrorSignup(errorEditLastname); });
   ```

---

## ✅ VERIFICATION CHECKLIST

After implementation, verify the following:

### Visual Verification

- [ ] **User Profile Edit Modal**
  - [ ] First Name field has purple background (#e8e8ff)
  - [ ] Last Name field has purple background (#e8e8ff)
  - [ ] Email field still has purple background (unchanged)
  - [ ] All readonly fields show "not-allowed" cursor on hover
  - [ ] Contact Number and Address fields remain white (editable)

- [ ] **Conference Room Request Form**
  - [ ] First Name field auto-fills on page load
  - [ ] Last Name field auto-fills on page load
  - [ ] Both name fields have purple background
  - [ ] Cannot type in name fields
  - [ ] Contact Number and Address remain editable (white background)

- [ ] **Tents & Chairs Request Form**
  - [ ] First Name field auto-fills on page load
  - [ ] Last Name field auto-fills on page load
  - [ ] Both name fields have purple background
  - [ ] Cannot type in name fields
  - [ ] Contact Number and Address remain editable (white background)

### Functional Verification

- [ ] **Profile Edit - Save Without Errors**
  - [ ] Click "Edit Profile" in User Profile page
  - [ ] Modify only Contact Number (e.g., change to 09123456789)
  - [ ] Click "Save Changes"
  - [ ] Success message appears
  - [ ] No console errors
  - [ ] Contact Number updates in Firestore (verify in Firebase Console)
  - [ ] First Name and Last Name remain unchanged in Firestore

- [ ] **Profile Edit - Save Address Only**
  - [ ] Click "Edit Profile"
  - [ ] Modify only Address field
  - [ ] Click "Save Changes"
  - [ ] Success message appears
  - [ ] Address updates correctly

- [ ] **Conference Room Request - Submit Form**
  - [ ] Navigate to conference room calendar
  - [ ] Select a future date
  - [ ] First Name and Last Name auto-fill
  - [ ] Try to click in name fields (should not allow editing)
  - [ ] Fill other required fields
  - [ ] Submit form successfully
  - [ ] Verify firstName/lastName in Firestore match user profile

- [ ] **Tents & Chairs Request - Submit Form**
  - [ ] Navigate to tents calendar
  - [ ] Select a future date
  - [ ] First Name and Last Name auto-fill
  - [ ] Try to click in name fields (should not allow editing)
  - [ ] Fill other required fields
  - [ ] Submit form successfully
  - [ ] Verify firstName/lastName in Firestore match user profile

### Browser Console Verification

- [ ] No JavaScript errors after changes
- [ ] Auto-fill logs show successful name field population
- [ ] Profile save logs show only contactNumber and address updates
- [ ] Form submission logs show firstName/lastName included in request data

### Edge Cases to Test

- [ ] **New User Without Profile Data**
  - [ ] Create new test account via signup
  - [ ] Navigate to profile - name fields should be pre-filled from signup
  - [ ] Navigate to request forms - name fields should auto-fill

- [ ] **User Logs Out and Back In**
  - [ ] Logout from user account
  - [ ] Login again
  - [ ] Verify name fields still readonly and correctly populated

- [ ] **Direct URL Access to Request Forms**
  - [ ] Manually navigate to `conference-request.html` (not from calendar)
  - [ ] Name fields should still auto-fill and be readonly

---

## 🔒 DATA INTEGRITY NOTES

### Firestore Document Structure (Unchanged)

**`users/{uid}` Collection:**
```javascript
{
  firstName: "John",      // ← CAN BE SET DURING SIGNUP ONLY
  lastName: "Doe",        // ← CAN BE SET DURING SIGNUP ONLY
  email: "john@email.com", // ← TIED TO FIREBASE AUTH (READONLY)
  contactNumber: "09123456789", // ← CAN BE UPDATED IN PROFILE
  address: "123 Main St",       // ← CAN BE UPDATED IN PROFILE
  role: "user",
  createdAt: Timestamp,
  updatedAt: Timestamp    // ← UPDATES WHEN CONTACT/ADDRESS CHANGES
}
```

### Request Collections (Unchanged)

**`conferenceRoomBookings` and `tentsChairsBookings`:**
- Will continue to store `firstName` and `lastName` with each request
- These values will now ALWAYS match the user's profile (cannot be modified at request time)
- Admin can trust that request names are accurate

---

## 📌 IMPORTANT NOTES

### Why Not Remove Name Fields from Request Forms Entirely?

**Reasons to Keep Name Fields:**
1. **User Confirmation** - Users can verify their name before submitting
2. **Visual Feedback** - Shows the system recognizes them (logged in state)
3. **Admin Review** - Admins see names in request tables without extra lookups
4. **Existing Pattern** - Matches the email field pattern (visible but not editable)
5. **Accessibility** - Screen readers announce the user's name context

### Alternative Approaches Considered (Not Recommended)

❌ **Remove name fields entirely from forms**
   - Requires major refactor of form validation and submission logic
   - Admins would need to query user documents for names
   - Less transparent to users

❌ **Hide name fields but keep in DOM**
   - Confusing UX (where is my name?)
   - Still need to handle auto-fill logic

❌ **Show names as text labels (not inputs)**
   - Inconsistent with form styling
   - Screen reader accessibility concerns
   - More complex CSS layout

✅ **Make fields readonly** (CHOSEN APPROACH)
   - Simple implementation (add 1 attribute)
   - Consistent with email field pattern
   - Clear visual indication (purple background)
   - Maintains existing logic flow
   - Best accessibility support

---

## 🚀 DEPLOYMENT STEPS

1. **Backup Current Files**
   ```powershell
   Copy-Item UserProfile.html UserProfile.html.backup
   Copy-Item conference-request.html conference-request.html.backup
   Copy-Item tents-chairs-request.html tents-chairs-request.html.backup
   Copy-Item script.js script.js.backup
   ```

2. **Apply Changes** (After user verification approval)
   - Modify 3 HTML files (add `readonly` attributes)
   - Modify `script.js` (remove name validation and update logic)

3. **Test in Local Development**
   ```powershell
   python -m http.server 5500
   # Open http://localhost:5500 and test all verification steps
   ```

4. **Deploy to Production**
   - Commit changes to Git
   - Push to main branch
   - Vercel will auto-deploy

5. **Post-Deployment Verification**
   - Test on live site with real user accounts
   - Monitor Firebase Console for correct data updates
   - Check for any user-reported issues

---

## 📞 SUPPORT NOTES

If users ask **"Why can't I change my name?"**:

**Response:**
> Your first and last name are tied to your account registration for security and consistency. This ensures that all your booking requests are properly tracked to your account. If you need to update your legal name, please contact the barangay office administrators.

---

## ✨ SUMMARY

This implementation makes first and last name fields readonly across:
1. User Profile Edit Modal
2. Conference Room Request Form  
3. Tents & Chairs Request Form

**Benefits:**
- ✅ Names are always consistent across all user actions
- ✅ Prevents accidental or intentional name changes on forms
- ✅ Increases data integrity for admin review
- ✅ Follows same pattern as email field (familiar UX)
- ✅ Simple implementation with minimal code changes

**Files Modified:**
- `UserProfile.html` - Add readonly to 2 fields
- `conference-request.html` - Add readonly to 2 fields
- `tents-chairs-request.html` - Add readonly to 2 fields
- `script.js` - Remove name validation and update logic (~40 lines deleted, ~5 lines modified)

**No Database Changes Required** ✅
**No CSS Changes Required** ✅ (existing readonly styles will apply)
**Backward Compatible** ✅ (existing data works as-is)

---

## 🔍 CODE REVIEW CHECKLIST FOR IMPLEMENTATION

- [ ] All 6 name input fields have `readonly` attribute
- [ ] All 6 name inputs have explanatory HTML comments
- [ ] Profile edit form removes firstName/lastName validation
- [ ] Profile edit form removes firstName/lastName from Firestore update
- [ ] Profile edit form removes name field input listeners
- [ ] Profile edit form removes name fields from error clearing arrays
- [ ] No console errors after changes
- [ ] Visual styling matches email field (purple background, bold text, no-edit cursor)
- [ ] Auto-fill functionality still works for name fields
- [ ] Contact Number and Address remain fully editable
- [ ] All verification checklist items pass

---

**END OF DOCUMENT**
