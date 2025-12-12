# Super Admin Notification System - Visual Diagrams

## 📊 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     BARANGAY SYSTEM USERS                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
        ┌───────────┐  ┌───────────┐  ┌────────────┐
        │   USER    │  │   ADMIN   │  │ SUPERADMIN │
        │           │  │           │  │            │
        │ role:     │  │ role:     │  │ role:      │
        │ "user"    │  │ "admin"   │  │ "superadmin│
        └───────────┘  └───────────┘  └────────────┘
             │              │                 │
             │              │                 │
    Makes    │   Manages    │      Manages   │
    Bookings │   Bookings   │      Accounts  │
             │              │                 │
             ▼              ▼                 ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │   Receives   │  │   Receives   │  │   Receives   │
    │     User     │  │    Admin     │  │ Super Admin  │
    │Notifications │  │Notifications │  │Notifications │
    └──────────────┘  └──────────────┘  └──────────────┘
         │                  │                    │
         │                  │                    │
         ▼                  ▼                    ▼
    Booking Status    Booking Events       Account Events
    - Approved        - New Requests       - Role Changes
    - Rejected        - Deadlines          - Account Status
    - In Progress     - Completions        - New Registrations
    - Completed       - Cancellations      
                      - Inventory Low      
```

---

## 🔄 Notification Flow Diagram

### Super Admin Notification Flow

```
EVENT OCCURS
    │
    ├─ User Role Changed ────────────┐
    ├─ Account Disabled ─────────────┤
    ├─ Account Enabled ──────────────┤
    └─ New User Registration ────────┤
                                     │
                                     ▼
                    ┌─────────────────────────────┐
                    │ createSuperAdminNotification│
                    │        (notificationData)    │
                    └─────────────────────────────┘
                                     │
                                     ▼
                    ┌─────────────────────────────┐
                    │  Query Firestore for users  │
                    │  WHERE role == "superadmin" │
                    └─────────────────────────────┘
                                     │
                        ┌────────────┴────────────┐
                        ▼                         ▼
            ┌───────────────────┐    ┌───────────────────┐
            │  Super Admin #1   │    │  Super Admin #2   │
            │  (userId: abc123) │    │  (userId: def456) │
            └───────────────────┘    └───────────────────┘
                        │                         │
                        ▼                         ▼
            ┌───────────────────┐    ┌───────────────────┐
            │ Create Notification│   │ Create Notification│
            │ Document in        │   │ Document in        │
            │ Firestore          │   │ Firestore          │
            │                    │   │                    │
            │ isSuperAdmin       │   │ isSuperAdmin       │
            │ Notification: true │   │ Notification: true │
            └───────────────────┘    └───────────────────┘
                        │                         │
                        └────────────┬────────────┘
                                     ▼
                        ┌────────────────────────┐
                        │   Update Badge Count   │
                        │   on Admin Pages       │
                        └────────────────────────┘
```

---

## 🗂️ Firestore Data Structure

```
notifications/ (Collection)
│
├─ notification_001/ (Document - User Notification)
│  ├─ userId: "user123"
│  ├─ isSuperAdminNotification: false
│  ├─ isAdminNotification: false
│  ├─ type: "status_change"
│  ├─ requestId: "booking456"
│  ├─ title: "Request Approved"
│  └─ ... other fields
│
├─ notification_002/ (Document - Admin Notification)
│  ├─ userId: "admin789"
│  ├─ isSuperAdminNotification: false
│  ├─ isAdminNotification: true ◄── FLAG
│  ├─ type: "new_request"
│  ├─ requestId: "booking789"
│  ├─ title: "New Booking Request"
│  └─ ... other fields
│
└─ notification_003/ (Document - Super Admin Notification)
   ├─ userId: "superadmin111"
   ├─ isSuperAdminNotification: true ◄── FLAG
   ├─ isAdminNotification: false
   ├─ type: "account_role_changed"
   ├─ title: "User Role Promoted"
   ├─ message: "John Doe was promoted to Admin"
   ├─ priority: "high"
   ├─ read: false
   ├─ createdAt: Timestamp
   ├─ actionUrl: "admin-user-manager.html"
   └─ metadata: {
       ├─ targetUserId: "user123"
       ├─ performedBy: "admin789"
       ├─ actionType: "role_change"
       ├─ oldRole: "user"
       ├─ newRole: "admin"
       └─ userEmail: "john@example.com"
      }
```

---

## 📥 Notification Loading Logic

```
User Opens admin-notifications.html
             │
             ▼
┌──────────────────────────┐
│ loadAdminNotifications() │
└──────────────────────────┘
             │
             ▼
┌──────────────────────────┐
│  Get Current User ID     │
└──────────────────────────┘
             │
             ▼
┌──────────────────────────┐
│ Check User Role in       │
│ Firestore users/{uid}    │
└──────────────────────────┘
             │
       ┌─────┴─────┐
       │           │
       ▼           ▼
┌─────────┐   ┌──────────┐
│ role:   │   │  role:   │
│"super   │   │ "admin"  │
│admin"   │   │          │
└─────────┘   └──────────┘
       │           │
       │           │
       ▼           ▼
Query:         Query:
WHERE          WHERE
isSuperAdmin   isAdmin
Notification   Notification
== true        == true
       │           │
       │           │
       ▼           ▼
┌─────────┐   ┌──────────┐
│ Account │   │ Booking  │
│ Notifs  │   │ Notifs   │
│ Only    │   │ Only     │
└─────────┘   └──────────┘
```

---

## 🎯 Notification Types Matrix

```
┌────────────────────────────────────────────────────────────────┐
│                    NOTIFICATION TYPES                           │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SUPER ADMIN ONLY          │         ADMIN ONLY                │
│  (Account Management)      │         (Booking Management)      │
│                            │                                   │
│  ✅ account_role_changed   │  ✅ new_request                   │
│     Priority: HIGH/MEDIUM  │     Priority: HIGH                │
│                            │                                   │
│  ✅ account_status_changed │  ✅ deadline_approaching          │
│     (Disable/Enable)       │     Priority: MEDIUM              │
│     Priority: MEDIUM/LOW   │                                   │
│                            │  ✅ in_progress_alert             │
│  ✅ account_created        │     Priority: LOW                 │
│     Priority: LOW          │                                   │
│                            │  ✅ completion_reminder           │
│  🔮 security_alert*        │     Priority: MEDIUM              │
│     Priority: HIGH         │                                   │
│     *Future                │  ✅ cancelled_request             │
│                            │     Priority: LOW                 │
│  🔮 admin_activity*        │                                   │
│     Priority: LOW          │  ✅ inventory_low                 │
│     *Future                │     Priority: HIGH                │
│                            │                                   │
└────────────────────────────┴───────────────────────────────────┘
```

---

## 🔄 Trigger Points Map

```
CODE LOCATION                    TRIGGER                    CREATES
═══════════════════════════════════════════════════════════════════

script.js ~line 21015          User Role Change    →  Super Admin
changeUserRole()                                       Notification
                                                      (HIGH priority)

script.js ~line 21065          Account Disable     →  Super Admin
disableUser()                                         Notification
                                                      (MEDIUM priority)

script.js ~line 21115          Account Enable      →  Super Admin
enableUser()                                          Notification
                                                      (LOW priority)

script.js ~line 1262           New User Signup     →  Super Admin
Signup Handler                                        Notification
                                                      (LOW priority)

script.js ~various             Booking Actions     →  Admin
Admin Review Functions                                Notification
                                                      (varies)
```

---

## 🛡️ Security & Separation

```
┌─────────────────────────────────────────────────────────────┐
│              NOTIFICATION ACCESS MATRIX                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Notification Type          │  Super Admin │  Admin │ User │
│  ═══════════════════════════════════════════════════════════│
│                             │              │        │       │
│  Account Management         │      ✅      │   ❌   │  ❌   │
│  - Role Changes             │              │        │       │
│  - Account Status           │              │        │       │
│  - New Registrations        │              │        │       │
│                             │              │        │       │
│  Booking Management         │      ❌      │   ✅   │  ❌   │
│  - New Requests             │              │        │       │
│  - Deadlines                │              │        │       │
│  - Completions              │              │        │       │
│  - Inventory                │              │        │       │
│                             │              │        │       │
│  Personal Status            │      ❌      │   ❌   │  ✅   │
│  - Booking Approved         │              │        │       │
│  - Booking Rejected         │              │        │       │
│  - Event Reminders          │              │        │       │
│                             │              │        │       │
└─────────────────────────────────────────────────────────────┘

KEY:
✅ = Can see these notifications
❌ = Cannot see these notifications
```

---

## 📍 Page Access Diagram

```
┌────────────────────────────────────────────────────────────┐
│                  PAGE ACCESS BY ROLE                        │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Page Name                 │ Super Admin │ Admin │  User  │
│  ═════════════════════════════════════════════════════════ │
│                            │             │       │         │
│  admin.html (Dashboard)    │     ❌      │  ✅   │   ❌    │
│                            │ Redirected  │       │         │
│                            │             │       │         │
│  admin-conference-requests │     ❌      │  ✅   │   ❌    │
│  admin-tents-requests      │     ❌      │  ✅   │   ❌    │
│                            │             │       │         │
│  admin-manage-inventory    │     ❌      │  ✅   │   ❌    │
│                            │             │       │         │
│  admin-user-manager        │     ✅      │  ✅   │   ❌    │
│  (Manage Accounts)         │             │       │         │
│                            │             │       │         │
│  admin-notifications       │     ✅      │  ✅   │   ❌    │
│  (Different content)       │ (Account)   │(Book) │         │
│                            │             │       │         │
│  user.html                 │     ✅      │  ✅   │   ✅    │
│  UserProfile.html          │     ✅      │  ✅   │   ✅    │
│                            │             │       │         │
└────────────────────────────────────────────────────────────┘
```

---

## 🔄 Error Handling Flow

```
ACTION TRIGGERED
(e.g., Promote User)
        │
        ▼
┌───────────────┐
│ Main Action   │
│ (Role Change) │
└───────────────┘
        │
        ▼
    TRY {
        │
        ▼
┌───────────────────────┐
│ Update Firestore      │
│ users/{uid}           │
│ role: "admin"         │
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│ SUCCESS!              │
│ Show Toast            │
└───────────────────────┘
        │
        ▼
    TRY {
        │
        ▼
┌───────────────────────┐
│ Create Super Admin    │
│ Notification          │
└───────────────────────┘
        │
    ┌───┴───┐
    │       │
SUCCESS   FAIL
    │       │
    ▼       ▼
  ✅Log   ⚠️ Log Error
         (Don't throw)
    │       │
    └───┬───┘
        │
        ▼
┌───────────────┐
│ Action        │
│ Completes     │
│ Successfully  │
└───────────────┘
    }
}

CRITICAL: Notification failure
does NOT block main action!
```

---

## 📊 Metadata Structure

```
Notification Metadata Object
│
├─ targetUserId ─────► User being acted upon
│                      (e.g., promoted user)
│
├─ performedBy ──────► Admin who performed action
│                      (for auditing)
│
├─ actionType ───────► Type of action
│                      - "role_change"
│                      - "disable"
│                      - "enable"
│                      - "registration"
│
├─ oldRole ──────────► Previous role (if role change)
│
├─ newRole ──────────► New role (if role change)
│
├─ userEmail ────────► Email of affected user
│
└─ notificationDate ─► Date string for deduplication
                       (YYYY-MM-DD format)
```

---

## 🎨 UI Components

```
┌─────────────────────────────────────────────────────────┐
│  ADMIN NOTIFICATIONS PAGE STRUCTURE                     │
│  (admin-notifications.html)                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │          HEADER STATS (4 cards)                │    │
│  │  [Total] [Unread] [High Priority] [Today]     │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │         FILTER TABS                            │    │
│  │  [All (12)] [Unread (5)] [Read (7)]           │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │         FILTER DROPDOWNS                       │    │
│  │  [Priority ▼] [Type ▼] [Sort ▼]               │    │
│  │                                                 │    │
│  │  Super Admin Sees:        Admin Sees:          │    │
│  │  - Account Created        - New Requests       │    │
│  │  - Role Changed           - Deadlines          │    │
│  │  - Status Changed         - In Progress        │    │
│  │  - Security Alerts*       - Completions        │    │
│  │                           - Inventory          │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  NOTIFICATION LIST                             │    │
│  │                                                 │    │
│  │  ┌──────────────────────────────────────────┐ │    │
│  │  │ 🔴 User Role Promoted        [HIGH]      │ │    │
│  │  │ John Doe was promoted to Admin           │ │    │
│  │  │ [Mark Read] [View] [Delete]              │ │    │
│  │  │ 2 hours ago                               │ │    │
│  │  └──────────────────────────────────────────┘ │    │
│  │                                                 │    │
│  │  ┌──────────────────────────────────────────┐ │    │
│  │  │ 🟡 Account Disabled          [MEDIUM]    │ │    │
│  │  │ Account disabled: Jane Smith...          │ │    │
│  │  │ [Mark Read] [View] [Delete]              │ │    │
│  │  │ 1 day ago                                 │ │    │
│  │  └──────────────────────────────────────────┘ │    │
│  │                                                 │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

**End of Visual Diagrams**
