
# Barangay Equipment Borrowing & Tracking System — AI Agent Instructions

## Architecture Overview

**Static multi-page site + Firebase backend.** No server code in this repo—everything runs client-side.

- **Core**: Single unified `script.js` (~5,600 lines) loaded as ES module. All Firebase logic, auth flows, form handlers, calendar renderers, admin panels, and page-specific scripts live here.
- **Pages**: 
  - **Public**: `index.html` (login), `signup.html`, `about.html`, `ContactPage.html`
  - **User**: `user.html` (user landing), `UserProfile.html`, calendar pages (`conference-room.html`, `tents-calendar.html`), request forms (`conference-request.html`, `tents-chairs-request.html`)
  - **Admin**: `admin.html` (admin dashboard), `admin-tents-requests.html` (tents & chairs review/management)
- **Routing**: Role-based after login: `users/{uid}` doc has `role` field ("user" or "admin") → redirects to `user.html` or `admin.html`.
- **Protection**: `onAuthStateChanged` guards protected pages via `protectedPaths` array. Unauthenticated users redirected to `index.html`.

## Critical Files & Their Roles

1. **`script.js`** — monolithic module. Page-specific code runs conditionally via `window.location.pathname.endsWith(...)` checks. Firebase init at top must stay intact.
2. **HTML pages** — define DOM structure and IDs that `script.js` targets. DOM IDs like `loginForm`, `signupForm`, `calendarDates`, `profileFullName`, etc. are contract points—**never rename without updating script**.
3. **`style.css`** — all styles. Uses CSS classes like `.error`, `.booked`, `.available`, `.animate-on-scroll`.
4. **`Assets/`** — images, logos (`BrgyLogo.png`, `Hall.jpg`, etc.).

## Data Model (Firestore)

- **`users` collection**: `{uid}` docs with fields (camelCase): `fullName`, `email`, `contactNumber`, `address`, `role` ("user"|"admin"), `createdAt`.
  - Backwards compat: code checks `fullName || fullname` to support legacy docs.

- **`tentsChairsBookings` collection**: Created by tents/chairs request form. Fields: 
  - `fullName`, `contactNumber`, `completeAddress`, `modeOfReceiving` ("Delivery"|"Pick-up")
  - `quantityChairs` (20-600), `quantityTents` (1-24)
  - `startDate`, `endDate` (format: "YYYY-MM-DD")
  - `status`: "pending"|"approved"|"in-progress"|"completed"|"rejected"|"cancelled"
  - `userId`, `userEmail`, `createdAt`, `cancelledAt` (optional)
  - `approvedAt`, `rejectedAt`, `completedAt`, `archivedAt` (timestamps added by admin actions)
  - `rejectionReason` (optional, added when admin rejects)
  - `archived` (boolean, for history management)

- **`conferenceRoomBookings` collection**: Created by conference room request form. Fields: 
  - `fullName`, `contactNumber`, `address`, `purpose`
  - `eventDate` (format: "YYYY-MM-DD"), `startTime`, `endTime` (format: "HH:mm")
  - `status`: "pending"|"approved"|"in-progress"|"completed"|"rejected"|"cancelled"
  - `userId`, `userEmail`, `createdAt`, `cancelledAt` (optional)

- **`inventory` collection** → **`equipment` document**: Centralized inventory tracking (CRITICAL for admin operations):
  - `availableTents` (number) - Current available tents for booking
  - `availableChairs` (number) - Current available chairs for booking
  - `tentsInUse` (number) - Tents currently in approved/in-progress bookings
  - `chairsInUse` (number) - Chairs currently in approved/in-progress bookings
  - `totalTents` (number) - Total tents owned by barangay
  - `totalChairs` (number) - Total chairs owned by barangay
  - `lastUpdated` (timestamp) - Last inventory update time
  - **NOTE**: This document MUST exist before approving any tents/chairs requests. Admin approval will fail if inventory is insufficient.

- **Planned `bookings` collection** (TODOs in calendar scripts): Will store `date: "YYYY-MM-DD"`, `type: "conference-room"|"tents-and-chairs"`, `status: "pending"|"approved"`, `userId`.

## Key Patterns to Preserve

### Firebase Init & Imports
```javascript
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, ... } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore, ... } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
```
Always keep at top of `script.js`. If splitting modules, export `auth` and `db` from the init module.

### Auth Flow
1. Login: `signInWithEmailAndPassword(auth, email, password)` → `getDoc(doc(db, 'users', user.uid))` → read `role` → redirect.
2. Logout: `window.logout()` function calls `signOut(auth)`, clears `sessionStorage`, and `location.replace('index.html')` to prevent back-button loops.
3. Page guard:
   ```javascript
   const protectedPaths = ["/user.html", "/admin.html", "user.html", "admin.html", "/UserProfile.html", "UserProfile.html"];
   if (protectedPaths.some(p => window.location.pathname.endsWith(p))) {
     onAuthStateChanged(auth, user => { if (!user) window.location.href = "index.html"; });
   }
   ```

### Validation Functions (reused across forms)
- **Email**: `validateEmail(email)` returns `{isValid, message}`. Regex: `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/`.
- **Password**: `validatePasswordSignup(password)` checks min 8 chars, uppercase, lowercase, number, special. Returns `{isValid, requirements, message, strength}`.
- **Contact**: Philippine mobile format `^09\d{9}$` (11 digits starting with "09").
- **Error display**: `setError(element, message)` and `setErrorSignup(element, message)` set red border on `element.previousElementSibling` (the input) and show error text. **Do not change sibling relationship without updating all callers.**

### Duplicate Request Prevention
**CRITICAL**: Different validation logic for each booking type:

#### Tents & Chairs (Identical Request Prevention)
Only blocks **IDENTICAL** requests (same dates AND same quantities):
- Query: `where("userId", "==", uid) && where("startDate", "==", date) && where("endDate", "==", date)`
- Additional check: `quantityChairs` AND `quantityTents` must match
- **Excludes**: Cancelled requests are NOT counted as duplicates
- **Allows**:
  - ✅ Same user, same dates, DIFFERENT quantities
  - ✅ Same user, DIFFERENT dates, same quantities
  - ✅ Same user, OVERLAPPING dates, different quantities
  - ✅ Resubmitting after cancelling a request
- **Blocks**:
  - ❌ Same user, IDENTICAL dates AND quantities (with pending/approved status)

#### Conference Room (Time Overlap Prevention)
Blocks **OVERLAPPING** time slots on the same date:
- Query: `where("userId", "==", uid) && where("eventDate", "==", date)`
- Additional check: `timeRangesOverlap(requestStart, requestEnd, existingStart, existingEnd)`
- Formula: `requestStartTime < existingEndTime AND requestEndTime > existingStartTime`
- **Excludes**: Cancelled requests are NOT counted as duplicates
- **Allows**:
  - ✅ Same user, DIFFERENT dates, any time
  - ✅ Same user, same date, NON-OVERLAPPING times
  - ✅ Resubmitting after cancelling a request
- **Blocks**:
  - ❌ Same user, same date, OVERLAPPING times (with pending/approved status)

**Helper Functions**:
- `timeRangesOverlap(start1, end1, start2, end2)` — checks if two time ranges overlap
- `sanitizeInput(text)` — XSS prevention via HTML entity encoding
- `formatTime12Hour(time)` — converts "14:00" to "2:00 PM"

### Request Cancellation
Users can cancel **ONLY pending requests**:
- Modal shows "Cancel Request" button for pending requests only
- Confirmation dialog prevents accidental cancellation
- Updates request status to "cancelled" and adds `cancelledAt` timestamp
- Cancelled requests are excluded from duplicate detection
- Users can submit new requests after cancelling
- **Important**: Approved and completed requests cannot be cancelled (must contact admin)

### Request Status Lifecycle
Request statuses follow this flow:
1. **Pending** - Initial status when user submits request (can be cancelled by user)
2. **Approved** - Admin approves request (cannot be cancelled, only admin can modify)
3. **In Progress** - Event date has arrived, equipment is currently in use (active status)
4. **Completed** - Equipment returned/event finished (final state, cannot be modified)
5. **Rejected** - Admin rejects request (final state, user can submit new request)
6. **Cancelled** - User cancelled pending request (final state, excluded from duplicate checks)

### Request Status Filtering
User profile page includes status filter dropdown:
- **Filter Options**: All Requests, Pending, Approved, In Progress, Completed, Rejected, Cancelled
- **Function**: `loadUserRequests(filterStatus)` handles filtering logic
- **Empty States**: Dynamic messages based on filter ("No pending requests found")
- **Logging**: Comprehensive console logs for debugging filter behavior

### Alert System
- **`showAlert(message, isSuccess, callback)`** — centered modal overlay for important messages (e.g., after signup/profile update). Callback runs when user clicks OK.
- **`showToast(message, isSuccess, duration)`** — top-right unobtrusive toast notifications (unified `TOAST_DURATION = 1600ms`).
- **`showButtonSpinner(button)` / `hideButtonSpinner(button)`** — add inline spinner to buttons during async ops (e.g., save profile, change password).

### Page-Specific Conditionals
`script.js` uses `if (window.location.pathname.endsWith('page.html'))` to run page-specific logic:
- Login page (`index.html`): clears sensitive fields on `pageshow` event (handles bfcache).
- User profile (`UserProfile.html`): modal for edit profile & change password, uses `loadUserData()` to fetch and populate from Firestore.
- Calendars (`conference-room.html`, `tents-calendar.html`): render monthly grid, mark past/today/booked dates, click available dates → redirect to request form with `?date=YYYY-MM-DD`.
- Request forms (`conference-request.html`, `tents-chairs-request.html`): validate inputs, submit to Firestore, show success alert → redirect to `user.html`.

## Developer Workflow

**No build step.** Serve over HTTP locally (required for ES modules & Firebase):
```powershell
# Windows PowerShell
python -m http.server 5500
# Then open http://localhost:5500
```

**Debugging**: Use browser DevTools console for `console.log` and `console.error`. Firebase errors logged with `.code` property—switch statements in `script.js` map codes to user-friendly messages (e.g., `auth/wrong-password`, `auth/email-already-in-use`).

**Testing auth flows**: Create test accounts via signup, login with different roles (manually set `role: "admin"` in Firestore to test admin route).

## Common Editing Scenarios

### Adding a new calendar/booking type
1. Create new collection in Firestore (e.g., `equipmentBookings`).
2. Add calendar HTML page (clone `conference-room.html`).
3. Add conditional block in `script.js` with `if (window.location.pathname.endsWith('new-calendar.html'))` to render calendar.
4. Add request form HTML (clone `conference-request.html`).
5. Add form handler in `script.js` (clone `handleConferenceRoomSubmit` pattern).
6. Update navigation dropdowns in all HTML files.

### Modifying validation rules
- **Email/password/contact**: Update regex in respective `validate*` functions in `script.js`.
- **Field constraints**: Update min/max checks in form handlers (e.g., chair quantity 20–600, tent quantity 1–24).
- Always keep inline error messages user-friendly (no technical jargon).

### Splitting `script.js`
If file becomes too large:
1. Create module files (e.g., `firebase-init.js`, `auth.js`, `calendar.js`).
2. Move Firebase init to `firebase-init.js`, export `auth` and `db`.
3. Import in other modules: `import { auth, db } from './firebase-init.js';`.
4. Update HTML `<script type="module" src="...">` tags to point to new entry point.
5. Keep page-specific conditionals in dedicated modules (e.g., `calendar.js` only runs calendar logic).

### Implementing Firestore integration for calendars (current TODOs)
Example pattern already in code comments:
```javascript
const bookingsRef = collection(db, "bookings");
const q = query(bookingsRef, 
  where("type", "==", "conference-room"),
  where("status", "in", ["pending", "approved"])
);
const querySnapshot = await getDocs(q);
const booked = {};
querySnapshot.forEach(doc => {
  const data = doc.data();
  booked[data.date] = data.status; // date is "YYYY-MM-DD"
});
```

## Security & Deployment Notes

- **Firebase config in `script.js`** is intentional for frontend apps (API key restricts to allowed domains in Firebase console).
- **Firestore security rules** (not in this repo) should enforce user can only read/write their own data. Check Firebase console.
- **XSS prevention**: All text inputs sanitized with `sanitizeInput()` using HTML entity encoding (`&lt;`, `&gt;`, `&amp;`, `&quot;`, `&#x27;`, `&#x2F;`).
- **Authentication checks**: All form submissions validate `auth.currentUser` and verify `userId` before Firestore operations.
- **Loading states**: Submit buttons show spinner during validation and submission, with state restoration in `finally` blocks.
- **Browser back/forward cache**: `pageshow` event listener on login page clears inputs to prevent credential restoration after logout.

## DOM Contract Points (Do Not Rename)

**Form IDs**: `loginForm`, `signupForm`, `editProfileForm`, `changePasswordForm`, `conferenceRoomForm`, `tentsChairsForm`.  
**Input IDs**: `login-email`, `login-password`, `signup-email`, `signup-password`, `editFullName`, `editContactNumber`, `eventDate`, `startDate`, `endDate`, `quantityChairs`, etc.  
**Display IDs**: `profileFullName`, `infoFullName`, `infoContactNumber`, `infoEmail`, `infoAddress`, `calendarDates`, `currentMonthYear`.  
**Error IDs**: `error-login-email`, `error-login-password`, `error-fullname`, `error-email`, `error-password`, etc.

Renaming these requires search-replace in `script.js` and all related HTML files.

## Quick Wins for Next Steps

- **Complete booking system**: Implement Firestore integration for calendar bookings (replace `// TODO` comments with actual `getDocs` queries).
- **Admin dashboard**: Build UI in `admin.html` to view/approve pending requests (query `tentsChairsBookings` where `status == "pending"`).
- **Email notifications**: Integrate Firebase Cloud Functions to send email on booking approval (requires separate functions repo).
- **Testing**: Add basic unit tests for validation functions (`validateEmail`, `validatePasswordSignup`, `validateContactSignup`).

---

## 🎯 Admin Tents & Chairs Management System (IMPLEMENTED)

### Overview
Complete admin interface for managing tents and chairs booking requests located at `admin-tents-requests.html`. This is a **production-ready** system with ~900 lines of JavaScript, comprehensive validation, and inventory management.

### File Locations
- **HTML**: `admin-tents-requests.html` (lines 1-217)
- **CSS**: `style.css` (lines 4650-5590, ~940 lines for tents admin styles)
- **JavaScript**: `script.js` (lines 3900-5410, ~900 lines for tents admin logic)

### Key Features Implemented

#### 1. **Dashboard Statistics (Top Cards)**
- **Total Requests**: Count of all requests in system
- **Pending Requests**: Requests awaiting admin approval
- **Approved Requests**: Requests approved and ready for fulfillment
- **Completed Requests**: Requests that have been fulfilled and returned
- Real-time updates when status changes
- Color-coded indicators (pending=orange, approved=blue, completed=green)

#### 2. **Dual-Tab System**
- **All Requests Tab**: Shows active requests (pending, approved, in-progress)
- **History Tab**: Shows completed, rejected, cancelled requests
- Tab switching updates filters and available actions
- Export functionality only available in History tab

#### 3. **Advanced Filtering**
Five-column filter grid:
- **Search by Name**: Text search across user full names
- **Status Filter**: Filter by request status (All, Pending, Approved, etc.)
- **Date Filter**: Filter by event date (date picker)
- **Delivery Mode Filter**: Filter by Delivery or Pick-up
- **Sort By**: 6 sorting options
  - Last Name (A-Z / Z-A)
  - Event Date (Newest First / Oldest First)
  - Date Submitted (Newest First / Oldest First)

#### 4. **Table View with 13 Columns**
Optimized column widths for proper data display:
1. **Submitted On** (120-140px): Date + time in italic
2. **First Name** (110-140px): User's first name
3. **Last Name** (110-140px): User's last name
4. **Start Date** (110-130px): Event start date
5. **End Date** (110-130px): Event end date
6. **Chairs** (70-80px): Quantity of chairs (centered)
7. **Tents** (70-80px): Quantity of tents (centered)
8. **Delivery Mode** (110-130px): Delivery or Pick-up
9. **Address** (150-200px): Complete address
10. **Status** (100-120px): Color-coded status badge
11. **Actions** (180-200px): Context-aware action buttons
12. **Notify User** (140-160px): Notification buttons

**CSS Classes for Columns**: `.tents-requests-table th:nth-child(N)` and `.tents-requests-table td:nth-child(N)`

#### 5. **Status-Based Action Buttons**
Context-aware buttons based on request status:
- **Pending**: 
  - "Approve" button (green) - Validates inventory before approval
  - "Deny" button (red) - Prompts for rejection reason
- **Approved/In-Progress**:
  - "Mark as Completed" button (blue) - Updates inventory when items returned
- **History Tab Only**:
  - "Archive" button - Hides from history view
  - "Delete" button - Permanent deletion (confirmation required)

#### 6. **Confirmation Modal System**
Professional confirmation modals for all critical actions:
- **Modal ID**: `tentsConfirmModal`
- **Components**: Title, message, inventory preview, Yes/No buttons
- **Special Features**:
  - **Inventory Preview**: Shows before/after stock levels (Approve action only)
  - **Alert Mode**: Shows only OK button for error messages
  - **Multi-line Support**: Preserves line breaks in messages
- **Actions with Confirmations**:
  - Approve (shows inventory changes)
  - Reject (requires confirmation)
  - Mark as Completed (requires confirmation)
  - Time's Up notification (requires confirmation)
  - Collect notification (requires confirmation)
  - Archive (requires confirmation)
  - Delete (requires double confirmation)

**CSS Classes**: `.tents-confirm-modal-overlay`, `.tents-confirm-modal`, `.tents-inventory-preview`

#### 7. **Inventory Validation (CRITICAL)**
**Function**: `handleApprove(requestId)` (script.js ~line 5012)

Before approving ANY request:
1. Fetches current inventory from `inventory/equipment` document
2. Calculates: `newStock = currentStock - requestedQuantity`
3. **Blocks approval** if `newStock < 0` for tents OR chairs
4. Shows error modal with:
   ```
   Insufficient Inventory
   Tents: Requested 10, but only 8 available (shortage: 2)
   Chairs: Requested 250, but only 212 available (shortage: 38)
   ```
5. Only proceeds if inventory is sufficient

**IMPORTANT**: Admin CANNOT approve requests that exceed available inventory.

#### 8. **Notification Buttons**
Only visible for approved/in-progress requests:
- **Time's Up**: Remind user about booking deadline
- **Collect**: Remind user to collect items
- Placeholder for future email/SMS integration
- Both require confirmation before sending

#### 9. **Export Functionality** (History Tab)
Dropdown menu with export options:
- Export as PDF (placeholder)
- Export as Excel (placeholder)
- Export as CSV (placeholder)
- Only visible in History tab

#### 10. **Calendar View** (Placeholder)
- Toggle between Table and Calendar view
- Placeholder UI with "Coming Soon" message
- Ready for future implementation with date-based grid

### Critical JavaScript Functions

#### Core Data Management
```javascript
// Line ~3920: Load all requests from Firestore
async function loadAllRequests()

// Line ~3960: Calculate statistics
function updateStatistics()

// Line ~3990: Filter requests based on criteria
function getFilteredRequests()

// Line ~4060: Calculate inventory in use
async function updateInventoryInUse()

// Line ~4150: Render table view
function renderTableView()

// Line ~4870: Render individual table rows
requests.forEach(req => { /* row rendering */ })

// Line ~4940: Render status badges
function renderStatusBadge(status)

// Line ~4950: Render action buttons
function renderActionButtons(req)

// Line ~4990: Render notification buttons
function renderNotifyButtons(req)
```

#### Action Handlers (CRITICAL)
```javascript
// Line ~5012: Approve request with inventory validation
async function handleApprove(requestId)
  // 1. Gets request data
  // 2. Fetches current inventory
  // 3. Calculates new stock levels
  // 4. VALIDATES: blocks if negative stock
  // 5. Shows confirmation with inventory preview
  // 6. Updates Firestore on confirmation

// Line ~5095: Reject request
async function handleDeny(requestId)
  // 1. Shows confirmation
  // 2. Prompts for rejection reason
  // 3. Updates status to "rejected"

// Line ~5125: Mark as completed
async function handleComplete(requestId)
  // 1. Shows confirmation
  // 2. Updates status to "completed"
  // 3. Triggers inventory update

// Line ~5150: Archive request
async function handleArchive(requestId)

// Line ~5175: Delete request permanently
async function handleDelete(requestId)

// Line ~5200: Send Time's Up notification
async function handleTimesUp(requestId)

// Line ~5225: Send Collect notification
async function handleCollect(requestId)
```

#### Confirmation Modal
```javascript
// Line ~5280: Show confirmation modal
function showConfirmModal(title, message, inventoryChanges, isAlert)
  // Parameters:
  //   - title: Modal header text
  //   - message: Main message (supports \n for line breaks)
  //   - inventoryChanges: { tents: {old, new}, chairs: {old, new} }
  //   - isAlert: If true, shows only OK button (for errors)
  // Returns: Promise<boolean> (true if confirmed, false if cancelled)
```

#### Tab & View Management
```javascript
// Line ~5370: Switch between All/History tabs
function switchTab(tabName)

// Line ~5410: Switch between Table/Calendar views
function switchView(viewName)

// Line ~5440: Update status filter options
function updateStatusFilterOptions()

// Line ~5470: Render content based on tab/view
function renderContent()
```

### CSS Architecture

#### Component Hierarchy
```
.tents-page-wrapper (container)
  ├── .tents-admin-header (hero header section)
  ├── .tents-stats-container (4-column grid of stats)
  ├── .tents-tabs-container (All Requests | History tabs)
  ├── .tents-controls-row (view toggle + export dropdown)
  ├── .tents-filters-section (5-column filter grid)
  └── .tents-content-area (table or calendar)
      ├── .tents-table-container (horizontal scroll container)
      │   └── .tents-requests-table (13-column table)
      └── .tents-calendar-placeholder (future calendar view)
```

#### Key CSS Classes
- **Layout**: `.tents-page-wrapper`, `.tents-admin-header`, `.tents-stats-container`
- **Stats**: `.tents-stat-card`, `.tents-stat-number`, `.tents-stat-label`
- **Tabs**: `.tents-tab`, `.tents-tab.active`
- **Filters**: `.tents-filters-section`, `.tents-filter-group`
- **Table**: `.tents-requests-table`, `.tents-requests-table th`, `.tents-requests-table td`
- **Status Badges**: `.tents-status-badge-pending`, `.tents-status-badge-approved`, etc.
- **Buttons**: `.tents-btn-approve`, `.tents-btn-deny`, `.tents-btn-complete`, etc.
- **Modals**: `.tents-modal-overlay`, `.tents-confirm-modal-overlay`

#### Responsive Design
- Filters use `grid-template-columns: repeat(5, 1fr)` on desktop
- Table scrolls horizontally on smaller screens (`.tents-table-container { overflow-x: auto }`)
- Page body and main container set to `overflow-x: hidden` to prevent page scroll
- Stats cards use 4-column grid with proper spacing

### DOM Contract Points (Critical IDs)

**NEVER rename these without updating JavaScript**:
- `tentsContentArea` - Main content rendering area
- `allTab`, `historyTab` - Tab buttons
- `tableViewBtn`, `calendarViewBtn` - View toggle buttons
- `searchNameFilter` - Name search input
- `statusFilter` - Status dropdown
- `dateFilter` - Date picker
- `deliveryModeFilter` - Delivery mode dropdown
- `sortByFilter` - Sort dropdown
- `exportDropdown` - Export menu
- `tentsModalOverlay` - Calendar modal (future use)
- `tentsConfirmModal` - Confirmation modal overlay
- `tentsConfirmTitle` - Confirmation modal title
- `tentsConfirmMessage` - Confirmation modal message
- `tentsConfirmInventory` - Inventory preview container
- `tentsConfirmYes`, `tentsConfirmNo` - Confirmation buttons

### Future Implementation Notes

#### 1. **Calendar View Implementation**
**Location**: `script.js` line ~5000 `renderCalendarView()`

**Steps to Implement**:
```javascript
// 1. Create monthly calendar grid
function renderCalendarView() {
  const contentArea = document.getElementById('tentsContentArea');
  
  // 2. Get all approved/in-progress bookings for current month
  const monthBookings = allRequests.filter(r => 
    ['approved', 'in-progress'].includes(r.status) &&
    isInCurrentMonth(r.startDate, r.endDate)
  );
  
  // 3. Build calendar HTML
  // - Loop through days of month
  // - Mark dates with bookings
  // - Show booking count per date
  // - Click date to show modal with bookings
  
  // 4. Use existing modal (#tentsModalOverlay)
  // - Update modal title with selected date
  // - List all bookings for that date
  // - Show tents/chairs quantities
}
```

**Reference**: See conference room calendar implementation for pattern

#### 2. **Conference Room Admin Page**
**To Create**: `admin-conference-requests.html`

**Steps**:
1. Clone `admin-tents-requests.html` structure
2. Update collection reference: `conferenceRoomBookings`
3. Modify table columns:
   - Remove: Chairs, Tents, Delivery Mode
   - Add: Purpose, Start Time, End Time
4. Update inventory logic (if tracking room availability)
5. Follow same patterns:
   - Tabs (All Requests | History)
   - Filters (Name, Status, Date, Sort)
   - Confirmation modals
   - Status-based actions

**CSS Classes**: Use `.conference-*` prefix instead of `.tents-*`

**JavaScript**: Create new section in `script.js`:
```javascript
if (window.location.pathname.endsWith('admin-conference-requests.html')) {
  // Initialize conference admin
  // Follow tents admin pattern (lines 3900-5410)
}
```

#### 3. **Manage Inventory Page**
**To Create**: `admin-manage-inventory.html`

**Purpose**: Admin interface to update inventory stock levels

**Required Features**:
```javascript
// CRUD operations on inventory/equipment document

// 1. Display current inventory
async function loadInventory() {
  const inventoryRef = doc(db, 'inventory', 'equipment');
  const inventorySnap = await getDoc(inventoryRef);
  // Display: totalTents, totalChairs, availableTents, availableChairs, tentsInUse, chairsInUse
}

// 2. Update total stock
async function updateTotalStock(tents, chairs) {
  const inventoryRef = doc(db, 'inventory', 'equipment');
  await updateDoc(inventoryRef, {
    totalTents: tents,
    totalChairs: chairs,
    lastUpdated: new Date()
  });
  // Recalculate available = total - inUse
}

// 3. Manual adjustment (for damaged items, etc.)
async function adjustAvailableStock(tentsAdjustment, chairsAdjustment) {
  // Add or subtract from available stock
  // Log adjustment reason and timestamp
}

// 4. Inventory history/audit log
// Track all inventory changes with timestamps and admin user
```

**UI Components**:
- Current stock display cards (Total, Available, In Use)
- Form to update total stock
- Form for manual adjustments
- Inventory change history table
- Validation: Prevent reducing total below in-use amount

**Integration Point**: Link from admin sidebar "Manage Inventory"

#### 4. **Email/SMS Notifications**
**Current State**: Placeholder functions in place

**To Implement**:
1. Set up Firebase Cloud Functions (separate repo/folder)
2. Install SendGrid or Twilio
3. Update these functions:
   ```javascript
   // script.js lines 5200, 5225
   async function handleTimesUp(requestId) {
     // Call Cloud Function endpoint
     // Pass: requestId, userEmail, userContactNumber
   }
   
   async function handleCollect(requestId) {
     // Call Cloud Function endpoint
     // Pass: requestId, userEmail, userContactNumber
   }
   ```
4. Send notifications on status changes:
   - Approved → Send approval email
   - Rejected → Send rejection email with reason
   - Completed → Send thank you message

### Testing Checklist

Before deployment, test:
- [ ] Load page with no inventory document (should default to 0)
- [ ] Load page with empty requests (should show "No requests" message)
- [ ] Filter by each status option
- [ ] Sort by all 6 sort options
- [ ] Search by name (partial matches)
- [ ] Filter by date and delivery mode
- [ ] Approve request with sufficient inventory
- [ ] Try to approve request with insufficient inventory (should block)
- [ ] Reject request (should prompt for reason)
- [ ] Mark as completed (should update inventory)
- [ ] Switch between All Requests and History tabs
- [ ] Archive and delete from History tab
- [ ] Send Time's Up and Collect notifications
- [ ] Test on mobile viewport (table should scroll horizontally)
- [ ] Test with 100+ requests (performance check)

### Common Issues & Solutions

**Issue**: Approve button doesn't work  
**Solution**: Check if `inventory/equipment` document exists. If not, create it with default values.

**Issue**: Table horizontal scroll scrolls entire page  
**Solution**: Ensure `.admin-body` and `.admin-main` have `overflow-x: hidden`, only `.tents-table-container` should have `overflow-x: auto`.

**Issue**: Filters not updating table  
**Solution**: Check filter event listeners (lines 5480-5550). Ensure `renderContent()` is called after filter change.

**Issue**: Confirmation modal not showing  
**Solution**: Check if `tentsConfirmModal` element exists in HTML. Ensure modal has `z-index: 10000`.

**Issue**: Status badges not color-coded  
**Solution**: Check CSS classes `.tents-status-badge-{status}` exist for all status values.

### Performance Considerations

- **Firestore Queries**: Currently loads all requests on page load. For large datasets (1000+ requests), implement pagination.
- **Real-time Updates**: Consider adding Firestore real-time listeners for live updates when another admin makes changes.
- **Inventory Sync**: When completing requests, inventory updates are manual. Consider Cloud Functions to auto-update on status change.
- **Image Optimization**: If adding user-uploaded images, use Firebase Storage with compression.

### Security Notes

- **Admin-only Access**: Add Firestore security rules to prevent non-admin users from accessing this page's data.
- **Input Sanitization**: All user input displayed in table is sanitized via `sanitizeInput()` function.
- **Inventory Validation**: Double-checked on both client (before approval) and should be validated on server (Cloud Functions).
- **Delete Protection**: Permanent deletion requires double confirmation and should be logged.

---
