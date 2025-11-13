# 🗑️ How to Cancel Internal Bookings - Visual Guide

## Where to Find the Cancel Button

### 📍 Location: Admin Request Management Pages

The **Cancel** button appears ONLY for **internal bookings** (bookings created by admin) in these pages:

1. **Admin Dashboard** (`admin.html`) - Weekly reservations view
2. **Tents & Chairs Management** (`admin-tents-requests.html`)
3. **Conference Room Management** (`admin-conference-requests.html`)

---

## 🔍 How to Identify Internal Bookings

Internal bookings are marked with:
- Badge/tag showing "Internal Booking" or similar indicator
- Created by admin for barangay events (not user requests)
- Have `isInternalBooking: true` flag in database

---

## 🎯 Button Location in Table

### For APPROVED Bookings:
```
| Status    | Actions                              | Notify User |
|-----------|--------------------------------------|-------------|
| Approved  | [Mark Complete] [Cancel] (orange)    | [Time's Up] |
```

### For IN-PROGRESS Bookings:
```
| Status      | Actions                              | Notify User |
|-------------|--------------------------------------|-------------|
| In Progress | [Mark Complete] [Cancel] (orange)    | [Collect]   |
```

---

## 🖱️ What to Click

### Step-by-Step:

#### 1. **Navigate to Admin Page**
   - Go to Admin Dashboard (`admin.html`), OR
   - Go to Tents & Chairs Management (`admin-tents-requests.html`), OR
   - Go to Conference Room Management (`admin-conference-requests.html`)

#### 2. **Find the Internal Booking**
   - Look in the "All Requests" tab
   - Find bookings with "Internal Booking" indicator
   - Status must be "Approved" or "In Progress"

#### 3. **Click the Orange "Cancel" Button**
   - Located in the "Actions" column
   - Next to "Mark Complete" button
   - **Orange color** (`.tents-btn-cancel` class)

#### 4. **Confirm Cancellation**
   - Confirmation modal appears with booking details:
     ```
     Cancel Internal Booking
     
     Are you sure you want to cancel this internal booking?
     
     Event: [Date Range]
     Equipment: [X] Tents, [Y] Chairs
     Mode: [Delivery/Pick-up]
     ```
   - Click **"Yes"** to proceed
   - Click **"No"** to abort

#### 5. **Cancellation Complete**
   - Status changes to "Cancelled"
   - Inventory returned to available stock
   - Notification sent to user (if `userId` exists)
   - Success toast appears

---

## ⚠️ Important Notes

### ✅ You CAN Cancel:
- Internal bookings with status "Approved"
- Internal bookings with status "In Progress"
- From any admin request management page

### ❌ You CANNOT Cancel:
- Regular user requests (no Cancel button shown)
- Pending requests (use Deny instead)
- Completed requests (already finished)
- Rejected/Cancelled requests (already final status)

---

## 🎨 Button Appearance

### Visual Identity:
```css
.tents-btn-cancel {
  background-color: #f97316; /* Orange */
  color: white;
  border-radius: 4px;
  padding: 8px 16px;
}
```

**Why orange?** To distinguish from:
- ✅ Green "Approve" button
- 🔵 Blue "Mark Complete" button  
- ❌ Red "Deny" button

---

## 🔧 What Happens Behind the Scenes

When you click Cancel:

1. **Validates** booking is internal (`isInternalBooking: true`)
2. **Shows** confirmation modal with details
3. **Updates** Firestore document:
   - `status: "cancelled"`
   - `cancelledAt: [timestamp]`
   - `cancelledBy: [admin email]`
   - `cancellationReason: "Internal booking cancelled by admin"`
4. **Returns** inventory to available stock (for tents/chairs)
5. **Creates** notification for user (if booking assigned to user)
6. **Refreshes** table view

---

## 📋 Quick Reference

| Page | Cancel Button Shows For |
|------|------------------------|
| `admin.html` | Internal bookings in weekly reservations |
| `admin-tents-requests.html` | Internal tents/chairs bookings (approved/in-progress) |
| `admin-conference-requests.html` | Internal conference bookings (approved/in-progress) |

---

## 🐛 Troubleshooting

### "Cancel button not showing"
- ✔️ Check if booking is internal (`isInternalBooking: true`)
- ✔️ Check status (must be "approved" or "in-progress")
- ✔️ Refresh page to reload data

### "Nothing happens when I click Cancel"
- ✔️ Check browser console for errors
- ✔️ Verify Firebase connection
- ✔️ Check if confirmation modal appears

### "Inventory not updating after cancel"
- ✔️ Check Firestore `inventory/equipment` document
- ✔️ Verify `updateInventoryInUse()` function runs
- ✔️ Look for console logs with `[Cancel Internal Booking]` prefix

---

**Function Reference:** `window.cancelInternalBooking(requestId)` in `script.js` ~line 8069
