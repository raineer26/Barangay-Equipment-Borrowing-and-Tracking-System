# Auto-Archiving Quick Reference

**Feature:** Automatic archiving of old records  
**Retention Period:** 90 days  
**Status:** ✅ Active

---

## ⚙️ CONFIGURATION LOCATIONS

### Tents & Chairs Admin
**File:** `script.js`  
**Line:** ~10407  
**Constant:** `AUTO_ARCHIVE_CONFIG_TENTS`

### Conference Room Admin
**File:** `script.js`  
**Line:** ~14772  
**Constant:** `AUTO_ARCHIVE_CONFIG_CONFERENCE`

---

## 🎛️ SETTINGS

| Setting | Current Value | Description |
|---------|---------------|-------------|
| `enabled` | `true` | Turn auto-archiving on/off |
| `daysAfterFinalized` | `90` | Days before archiving (3 months) |
| `excludeInternalBookings` | `true` | Protect internal bookings |
| `showNotification` | `true` | Show toast to admin |
| `logActions` | `true` | Console logging |

---

## 🔄 WHEN IT RUNS

- ✅ When admin loads the page
- ✅ On initial data load only
- ❌ NOT on every real-time update
- ❌ NOT when data comes from cache

---

## 🛡️ WHAT'S PROTECTED

1. **Internal Bookings** - Never auto-archived
2. **Active Requests** - Only affects History tab
3. **Recent Records** - Only archives if >90 days old

---

## 📊 WHAT GETS ARCHIVED

**Criteria:**
- Status: `completed`, `rejected`, or `cancelled`
- Age: Older than 90 days
- Location: In History tab (not already archived)
- Type: NOT an internal booking

**Action:**
- Sets `archived: true`
- Adds `archivedAt: [timestamp]`
- Adds `autoArchived: true`
- Moves to Archives tab

---

## 🔧 COMMON ADJUSTMENTS

### Change Retention Period
```javascript
daysAfterFinalized: 120,  // 4 months
daysAfterFinalized: 60,   // 2 months
daysAfterFinalized: 30,   // 1 month
```

### Disable Temporarily
```javascript
enabled: false,
```

### Hide Notifications
```javascript
showNotification: false,
```

### Disable Console Logs
```javascript
logActions: false,
```

---

## 🐛 QUICK TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| No archiving happening | Check if `enabled: true` |
| Too many archived | Increase `daysAfterFinalized` |
| Internal bookings archived | Verify `excludeInternalBookings: true` |
| No notification | Check `showNotification: true` |

---

## 📝 CONSOLE COMMANDS

```javascript
// Check current config
console.log(AUTO_ARCHIVE_CONFIG_TENTS);
console.log(AUTO_ARCHIVE_CONFIG_CONFERENCE);

// Manual trigger (testing)
await autoArchiveOldTentsRequests();
await autoArchiveOldConferenceRequests();
```

---

## 📈 EXPECTED NOTIFICATIONS

**Examples:**
- "1 old tents & chairs record was automatically archived."
- "5 old conference room records were automatically archived."

**Duration:** 3 seconds  
**Type:** Success toast (green)

---

## ✅ VERIFICATION

After loading admin page, check:
1. Console logs show "[Auto-Archive]" messages
2. Old records moved from History to Archives
3. Toast notification appears (if records archived)
4. Internal bookings remain in History

---

**Full Documentation:** `AUTO_ARCHIVING_IMPLEMENTATION.md`
