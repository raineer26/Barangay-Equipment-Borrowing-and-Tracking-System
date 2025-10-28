
# Barangay Equipment Borrowing & Tracking System — AI Agent Instructions

## Architecture Overview

**Static multi-page site + Firebase backend.** No server code in this repo—everything runs client-side.

- **Core**: Single unified `script.js` (2176 lines) loaded as ES module. All Firebase logic, auth flows, form handlers, calendar renderers, and page-specific scripts live here.
- **Pages**: `index.html` (login), `signup.html`, `user.html` (user landing), `admin.html` (admin dashboard), `UserProfile.html`, calendar pages (`conference-room.html`, `tents-calendar.html`), and request forms (`conference-request.html`, `tents-chairs-request.html`).
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
- **`tentsChairsBookings` collection**: created by tents/chairs request form. Fields: `fullName`, `contactNumber`, `completeAddress`, `modeOfReceiving`, `quantityChairs`, `quantityTents`, `startDate`, `endDate`, `status: "pending"`, `createdAt`.
- **Planned `bookings` collection** (TODOs in calendar scripts): will store `date: "YYYY-MM-DD"`, `type: "conference-room"|"tents-and-chairs"`, `status: "pending"|"approved"`, `userId`.

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
- **XSS prevention**: Address input already sanitized with `.replace(/<[^>]*>/g, '')` in signup/profile forms.
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
