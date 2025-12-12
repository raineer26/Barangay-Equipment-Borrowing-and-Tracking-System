# Quick Testing Guide - Conference Room Internal Booking Real-Time Validation

## 🚀 Quick Start Testing

### Prerequisites
1. Admin account logged in
2. Navigate to `admin-conference-requests.html`
3. Open browser DevTools console (F12) to see logs

---

## ✅ Test Scenarios

### Test 1: Auto-Fill Functionality
**Steps**:
1. Click "Add Internal Reservation" button
2. Wait for modal to open

**Expected Result**:
- ✅ "Contact Person" field auto-filled with your admin name
- ✅ "Contact Number" field auto-filled with your admin contact number
- ✅ Console shows: "Auto-filling admin details for user: [your-email]"

**If Failed**:
- Check Firestore `users/{your-uid}` document has `fullName` and `contactNumber` fields

---

### Test 2: Booked Time Slot Filtering
**Setup**:
1. Create a test booking for tomorrow, 9:00 AM - 11:00 AM (use user-side booking or create manually in Firestore)

**Steps**:
1. Open internal booking modal
2. Select tomorrow's date
3. Click "Start Time" dropdown

**Expected Result**:
- ✅ 9:00 AM and 9:30 AM show as "(Booked)" and are disabled (grayed out)
- ✅ 10:00 AM and 10:30 AM show as "(Booked)" and are disabled
- ✅ 11:00 AM is also disabled (30-minute gap after booking)
- ✅ Times before 9:00 AM and after 11:30 AM are available
- ✅ Console shows: "Loading bookings for date: [selected-date]"

**If Failed**:
- Check existing booking has `status` = 'pending', 'approved', or 'in-progress'
- Check booking `eventDate` format is "YYYY-MM-DD"

---

### Test 3: 2-Hour Minimum Validation
**Steps**:
1. Open internal booking modal
2. Select a date
3. Select Start Time: "9:00 AM"
4. Select End Time: "10:00 AM" (only 1 hour)

**Expected Result**:
- ✅ Error appears: "Minimum booking duration is 2 hours. Current duration: 1 hour"
- ✅ Submit button becomes disabled (grayed out, opacity 0.6)
- ✅ Console shows: "Duration validation: 1 hour (60 minutes) - INVALID"

**Now Change**:
5. Change End Time to "11:00 AM" (2 hours)

**Expected Result**:
- ✅ Error disappears
- ✅ Submit button becomes enabled
- ✅ Console shows: "Duration validation: 2 hours (120 minutes) - VALID"

---

### Test 4: Availability Feedback (Available Slot)
**Steps**:
1. Open internal booking modal
2. Select tomorrow's date
3. Select Start Time: "1:00 PM"
4. Select End Time: "3:00 PM"
5. Wait 500ms (debounce delay)

**Expected Result**:
- ✅ Green checkmark (✓) appears below contact number field
- ✅ Text shows: "Available"
- ✅ Submit button remains enabled
- ✅ Console shows: "Availability check: AVAILABLE (0 conflicts)"

---

### Test 5: Availability Feedback (Conflicting Slot)
**Setup**:
1. Ensure there's a booking for tomorrow, 2:00 PM - 4:00 PM

**Steps**:
1. Open internal booking modal
2. Select tomorrow's date
3. Select Start Time: "1:00 PM"
4. Select End Time: "3:00 PM" (overlaps with 2:00 PM - 4:00 PM)
5. Wait 500ms

**Expected Result**:
- ✅ Red X (✗) appears below contact number field
- ✅ Text shows: "Unavailable (1 conflict)" or "Unavailable (X conflicts)"
- ✅ Submit button becomes disabled
- ✅ Console shows: "Availability check: UNAVAILABLE (1 conflict)"

---

### Test 6: Contact Number Validation
**Steps**:
1. Open internal booking modal
2. Clear the auto-filled contact number
3. Try typing: "abc123def456"

**Expected Result**:
- ✅ Only numbers are entered: "123456"
- ✅ Letters are blocked (no 'abc' or 'def')

**Continue**:
4. Type more numbers until you reach 11 digits

**Expected Result**:
- ✅ Input stops at 11 digits (e.g., "12345678901")
- ✅ Cannot type 12th digit

**Paste Test**:
5. Clear field
6. Paste: "Phone: 09171234567 (Mobile)"

**Expected Result**:
- ✅ Only numbers extracted: "09171234567"
- ✅ No "Phone:" or "(Mobile)" text appears

---

### Test 7: End Time Filtering
**Setup**:
1. Existing booking: Tomorrow, 2:00 PM - 4:00 PM

**Steps**:
1. Open internal booking modal
2. Select tomorrow's date
3. Select Start Time: "12:00 PM"
4. Open End Time dropdown

**Expected Result**:
- ✅ 12:30 PM, 1:00 PM are available
- ✅ 1:30 PM is available (ends before 2:00 PM booking)
- ✅ 2:00 PM shows "(Unavailable)" - would overlap
- ✅ 2:30 PM, 3:00 PM, 3:30 PM show "(Unavailable)"
- ✅ 4:00 PM shows "(Unavailable)" - needs 30-min gap
- ✅ 4:30 PM and later are available

---

### Test 8: Date Change Behavior
**Steps**:
1. Open internal booking modal
2. Select a date, start time, end time
3. Availability feedback shows green ✓
4. Change to a different date

**Expected Result**:
- ✅ Start time and end time reset to empty
- ✅ Availability feedback disappears
- ✅ Time dropdowns repopulate for new date
- ✅ Console shows: "Date changed, loading bookings for: [new-date]"

---

### Test 9: Form Submission
**Steps**:
1. Open internal booking modal
2. Fill all fields with valid data:
   - Date: Tomorrow
   - Start: 9:00 AM
   - End: 11:00 AM (no conflicts)
   - Purpose: "Team Planning Meeting" (10+ chars)
   - Contact Person: (auto-filled)
   - Contact Number: "09171234567"
3. Click "Add Reservation" button

**Expected Result**:
- ✅ Confirmation modal appears
- ✅ Modal shows 6 fields ONLY (no Department or Expected Attendees):
  - Event Date: Tomorrow's date
  - Start Time: 9:00 AM
  - End Time: 11:00 AM
  - Purpose: Team Planning Meeting
  - Contact Person: Your admin name
  - Contact Number: 09171234567
- ✅ Click "Confirm"
- ✅ Success alert: "Internal reservation added successfully!"
- ✅ Modal closes
- ✅ Form resets
- ✅ New booking appears in table with status "Approved"

**Verify in Firestore**:
- ✅ Document in `conferenceRoomBookings` collection
- ✅ Has `isInternalBooking: true`
- ✅ Has `status: 'approved'`
- ✅ Does NOT have `expectedAttendees` field
- ✅ Does NOT have `department` field

---

### Test 10: Submit Button Control
**Steps**:
1. Open internal booking modal
2. Select date and times
3. Observe submit button in these scenarios:

| Scenario | Duration | Conflict | Button State | Opacity |
|----------|----------|----------|--------------|---------|
| 1:00 PM - 2:30 PM | 1.5 hours | No | ❌ Disabled | 0.6 |
| 1:00 PM - 3:00 PM | 2 hours | No | ✅ Enabled | 1.0 |
| 1:00 PM - 3:00 PM | 2 hours | Yes | ❌ Disabled | 0.6 |
| 9:00 AM - 11:00 AM | 2 hours | No | ✅ Enabled | 1.0 |

**Expected Result**:
- ✅ Button correctly disabled/enabled based on both conditions
- ✅ Tooltip or visual feedback explains why disabled

---

## 🐛 Debugging Tips

### Console Logs to Watch For

**Auto-Fill**:
```
Auto-filling admin details for user: [email]
Contact person: [name]
Contact number: [number]
```

**Date Change**:
```
Loading bookings for date: [YYYY-MM-DD]
Found X bookings for date: [YYYY-MM-DD]
```

**Time Filtering**:
```
Checking slot: 09:00 - unavailable (overlaps with booking)
Checking slot: 12:00 - available
```

**Duration Validation**:
```
Duration validation: 2 hours (120 minutes) - VALID
Duration validation: 1 hour and 30 minutes (90 minutes) - INVALID
```

**Availability Check**:
```
Availability check: AVAILABLE (0 conflicts)
Availability check: UNAVAILABLE (2 conflicts)
```

---

## 🔧 Troubleshooting

### Problem: Auto-fill not working
**Solution**:
1. Check admin profile in Firestore `users` collection
2. Verify fields exist: `fullName`, `contactNumber`
3. Check browser console for errors

### Problem: Booked times not filtered
**Solution**:
1. Check existing bookings have correct `eventDate` format ("YYYY-MM-DD")
2. Verify bookings have `status` = 'pending', 'approved', or 'in-progress'
3. Check console for "Found X bookings" message

### Problem: Availability feedback not showing
**Solution**:
1. Wait 500ms after selecting times (debounce delay)
2. Check console for "Availability check:" messages
3. Verify Firestore rules allow reading `conferenceRoomBookings`

### Problem: Submit button stuck disabled
**Solution**:
1. Check console for validation errors
2. Verify duration is ≥ 2 hours
3. Verify no time conflicts exist
4. Try clearing and re-selecting times

### Problem: Confirmation modal shows old fields
**Solution**:
1. Hard refresh page (Ctrl+Shift+R)
2. Clear browser cache
3. Check HTML file has latest version (no Department/Expected Attendees)

---

## ✅ Success Criteria

All 10 tests should pass with expected results. If any test fails:
1. Check console logs for error messages
2. Refer to troubleshooting section
3. Verify Firestore data structure matches expected format
4. Check network tab for failed API calls

**Expected Overall Behavior**:
- ⚡ Fast and responsive UI
- 🎯 Real-time validation prevents errors
- 📊 Clear visual feedback (✓/✗, disabled states)
- 🔒 Cannot create conflicting bookings
- ✨ Smooth user experience with auto-fill

---

**Last Updated**: December 2024  
**Ready for Testing**: ✅
