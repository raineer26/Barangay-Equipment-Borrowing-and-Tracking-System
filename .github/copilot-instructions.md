
## Purpose
Give short, actionable guidance to an AI code agent working on this repo (static multi-page frontend backed by Firebase).

## Big picture
- Static client-only site (HTML files at project root) served over HTTP. No server code in repo.
- Single combined ES module: `script.js` imports Firebase from CDN and implements Auth + Firestore reads/writes, page-protection, UI logic and simple calendars.
- Auth: Firebase Authentication (email/password). After sign-in the code reads `users/{uid}` from Firestore to route by `role` (redirects to `admin.html` or `user.html`).

## Key files to inspect first
- `script.js` — central file. Keep the top Firebase imports and `initializeApp(firebaseConfig)` intact when refactoring.
- `index.html`, `signup.html`, `user.html`, `admin.html`, `UserProfile.html` — these pages contain DOM IDs referenced by `script.js` and must not be renamed without updating the script.
- `Assets/` — images and static assets referenced by HTML.

## Data model & conventions (literal)
- Firestore collection `users` with documents at `users/{uid}`. Canonical fields (camelCase): `fullName`, `email`, `contactNumber`, `address`, `role` ("user"|"admin"), `createdAt: Date`.
- Planned `bookings` collection uses date strings in `YYYY-MM-DD`, `type: "conference-room"|"tents-and-chairs"`, `status: "pending"|"approved"`, and `userId`.

## Important runtime patterns to preserve
- `script.js` is loaded via `<script type="module" src="script.js"></script>` — preserve ES module imports and firebase init order.
- Auth flow: `signInWithEmailAndPassword()` then `getDoc(doc(db, 'users', user.uid))` to decide routing.
- Page protection: `onAuthStateChanged(auth, ...)` with `protectedPaths` array redirects unauthenticated users to `index.html`.
- Firestore writes use `setDoc(doc(db, 'users', user.uid), {...})` and sometimes `merge: true` for updates — preserve this pattern.

## UI & validation conventions (must keep)
- Email validation uses `validateEmail()` regex in `script.js`.
- Password policy used across forms: min 8 chars, uppercase, lowercase, number, special char (see `validatePasswordSignup`).
- Philippine mobile contact format: `^09\d{9}$` — keep this when changing signup/edit profile flows.
- Error display uses `setError`/`setErrorSignup` and manipulates `element.previousElementSibling.style.border` — DOM depends on this structure (do not change the sibling-based styling without updating callers).

## Integration points & TODOs
- Firebase config lives in `script.js` (apiKey present). If splitting modules, export `auth` and `db` from the module that initializes Firebase.
- Calendar pages (`conference-room.html`, `tents-calendar.html`) include TODOs to fetch `bookings` from Firestore — follow existing query examples using `collection`, `query`, `where`, `getDocs` when implementing.

## Editing guidelines for AI agents
- If you split `script.js`, keep Firebase init in the first module and export `auth` and `db` (update HTML imports accordingly).
- Never rename DOM IDs referenced in `script.js` (examples: `loginForm`, `signupForm`, `editProfileForm`, `profileFullName`, `calendarDates`).
- Preserve date format `YYYY-MM-DD` when integrating calendars with Firestore.
- Maintain backwards-compatibility checks `fullName || fullname` which the code uses to support legacy documents.

## Debugging & developer flow
- This is a static project — no build step. Serve the repo locally over HTTP to test Firebase flows (file:// can block module imports or auth). Example quick server for Windows PowerShell:
	```powershell
	python -m http.server 5500
	# open http://localhost:5500
	```
- Use browser DevTools to inspect `console.log` outputs and Firebase `error.code` strings — `script.js` switches on these to show inline messages.

## Safety & security notes
- `firebaseConfig` is in `script.js`. It's present intentionally for frontend use; consider using environment-specific hosting for production.
- When adding Firestore queries/writes, do not log or exfiltrate secrets. Keep reads/writes limited and use `merge: true` when updating partial profiles.

## Small contract for code changes
- Inputs: DOM elements with IDs mentioned above; `auth.currentUser` available after `onAuthStateChanged` fires.
- Outputs: page redirects (login -> `user.html`/`admin.html`), DOM population (profile fields), Firestore writes to `users/{uid}`.
- Failure modes: network errors, missing Firestore doc (handled in code), Firebase auth error codes (handled by existing switch statements).

---
If you'd like, I can: split `script.js` into smaller modules (keeping firebase init central), implement `bookings` Firestore integration for calendars, or add small tests for validation helpers. Which would you like next?
