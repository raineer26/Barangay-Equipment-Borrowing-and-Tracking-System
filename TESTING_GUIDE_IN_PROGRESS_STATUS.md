# 🧪 QUICK TESTING GUIDE: In-Progress Status

## ⚡ Fast Testing Steps (5 minutes)

### Test 1: Tents & Chairs Auto-Transition

1. **Create a booking with today's date:**
   ```
   - Go to: tents-chairs-request.html
   - Fill form with:
     - Start Date: TODAY (2025-11-08)
     - End Date: TODAY or later
     - Fill other required fields
   - Submit request
   ```

2. **Admin approves:**
   ```
   - Go to: admin-tents-requests.html
   - Find the pending request
   - Click "Approve" button
   - Confirm approval
   - Status should be: "Approved"
   ```

3. **Trigger auto-transition:**
   ```
   - Refresh the admin page (F5)
   - OR go to: UserProfile.html
   - Wait 2-3 seconds
   ```

4. **Verify:**
   ```
   ✅ Check console for:
      [Status Auto-Update] Transitioned [ID] to in-progress
   
   ✅ Check database:
      - Open Firestore console
      - Find the booking document
      - Verify: status = "in-progress"
      - Verify: inProgressAt exists
      - Verify: autoTransitioned = true
   
   ✅ Check UI:
      - Status badge shows "In Progress"
      - "In Progress" filter shows the booking
   
   ✅ Check notification:
      - Go to Notifications tab
      - Should see: "🎉 Your Event Started!"
   ```

---

### Test 2: Conference Room Auto-Transition

1. **Create conference booking for today:**
   ```
   - Go to: conference-request.html
   - Event Date: TODAY (2025-11-08)
   - Time: Any valid time
   - Submit
   ```

2. **Admin approves:**
   ```
   - Go to: admin-conference-requests.html
   - Approve the request
   ```

3. **Trigger and verify:**
   ```
   - Refresh page
   - Check console logs
   - Verify status = "in-progress"
   - Check notification created
   ```

---

### Test 3: Filter Functionality

1. **On UserProfile.html:**
   ```
   - Click "Status Filter" dropdown
   - Select "In Progress"
   - Should show only in-progress bookings
   - Count in dropdown should be accurate: "In Progress (1)"
   ```

2. **On admin pages:**
   ```
   - "All Requests" tab should show in-progress items
   - "In Progress" status badge should display
   - Action button should be "Mark as Completed"
   ```

---

### Test 4: Date Range Logic (Tents)

**Test ongoing event:**
```
- Create booking:
  - Start Date: YESTERDAY (2025-11-07)
  - End Date: TOMORROW (2025-11-09)
- Admin approves
- Refresh page
- Should transition to "in-progress" (today is within range)
```

**Test future event:**
```
- Create booking:
  - Start Date: TOMORROW (2025-11-09)
  - End Date: Next week (2025-11-15)
- Admin approves
- Refresh page
- Should stay "approved" (not started yet)
```

**Test past event:**
```
- Create booking:
  - Start Date: LAST WEEK (2025-11-01)
  - End Date: YESTERDAY (2025-11-07)
- Admin approves
- Refresh page
- Should stay "approved" (past end date, waiting for completion)
```

---

## 🔍 Console Log Check

**Expected output when function runs:**

```
[UserProfile] ═══════════════════════════════════════
[UserProfile] Running automated system checks...
[UserProfile] User: test@example.com
═══════════════════════════════════════════════════════════════════
🔄 [Status Auto-Update] Starting automatic status transition check...
═══════════════════════════════════════════════════════════════════
📅 [Status Auto-Update] Current date: 2025-11-08
⏰ [Status Auto-Update] Timestamp: 2025-11-08T...

📦 [Status Auto-Update] Checking Tents & Chairs bookings...
📊 [Status Auto-Update] Found X approved tents bookings

🔍 [Status Auto-Update] Checking request: [ID]
   - User: [Name]
   - Start Date: 2025-11-08
   - End Date: 2025-11-08
   - Current Status: approved
✅ [Status Auto-Update] Event is active! Transitioning to IN-PROGRESS...
✅ [Status Auto-Update] SUCCESS! [ID] → in-progress
📧 [Status Auto-Update] Notification sent to user

...

═══════════════════════════════════════════════════════════════════
📊 [Status Auto-Update] SUMMARY:
   - Total transitions: 1
   - Tents bookings checked: X
   - Conference bookings checked: Y
✅ [Status Auto-Update] Status check completed successfully!
═══════════════════════════════════════════════════════════════════
```

---

## ❌ Common Issues & Solutions

### Issue 1: Status not updating
**Symptom:** Refresh page but status still "approved"

**Solutions:**
1. Check console for errors
2. Verify date format in Firestore (must be "YYYY-MM-DD")
3. Hard refresh (Ctrl + F5)
4. Check if status was already "in-progress"

---

### Issue 2: No console logs appear
**Symptom:** No `[Status Auto-Update]` logs in console

**Solutions:**
1. Verify you're on correct page (UserProfile.html or admin pages)
2. Wait 2-3 seconds on UserProfile (setTimeout delay)
3. Check for JavaScript errors blocking execution
4. Verify browser console is filtering properly (show all logs)

---

### Issue 3: Notification not created
**Symptom:** Status updates but no notification in tab

**Solutions:**
1. Check console for notification errors
2. Verify `createNotification()` function exists
3. Check Firestore rules allow writing to notifications collection
4. Refresh Notifications tab

---

### Issue 4: Function runs multiple times
**Symptom:** Console shows duplicate transition logs

**Solutions:**
1. Expected on page refreshes
2. Function is idempotent (safe to run multiple times)
3. Only transitions if status = "approved" (won't re-transition)

---

## 📊 Firestore Data Verification

### Before Transition:
```json
{
  "status": "approved",
  "approvedAt": "2025-11-08T10:00:00.000Z",
  "startDate": "2025-11-08",
  "endDate": "2025-11-08",
  // ... other fields
}
```

### After Transition:
```json
{
  "status": "in-progress",  // ← CHANGED
  "approvedAt": "2025-11-08T10:00:00.000Z",
  "inProgressAt": "2025-11-08T12:34:56.000Z",  // ← NEW
  "autoTransitioned": true,  // ← NEW
  "startDate": "2025-11-08",
  "endDate": "2025-11-08",
  // ... other fields
}
```

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Console shows transition logs
2. ✅ Firestore document status = "in-progress"
3. ✅ UI shows "In Progress" badge
4. ✅ Filter counts include in-progress requests
5. ✅ Notification appears in Notifications tab
6. ✅ Admin sees "Mark as Completed" button
7. ✅ No JavaScript errors in console

---

## 🎯 Quick Checklist

- [ ] Created test booking with today's date
- [ ] Admin approved the booking
- [ ] Refreshed page to trigger check
- [ ] Saw console logs confirming transition
- [ ] Verified Firestore status changed
- [ ] Checked UI shows "In Progress"
- [ ] Found notification in Notifications tab
- [ ] Tested "In Progress" filter
- [ ] Verified admin action button updated

---

**Expected Testing Time:** 5-10 minutes  
**Required:** Test user account + Admin account  
**Tools Needed:** Browser console, Firestore console
