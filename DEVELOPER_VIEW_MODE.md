# Secret Developer View Mode

## Overview
The developer (henryoverbeeke@gmail.com) has a secret keyboard shortcut to test the app from different privilege levels without logging out.

## How It Works

Press the **Z key** repeatedly to cycle through different view modes:

### Z Key Press Count & Modes:

| Presses | Mode | What You See |
|---------|------|--------------|
| 3x | **Admin Mode** | View as a regular admin (like Sarah or Claire) |
| 6x | **User Mode** | View as a regular user (no admin access) |
| 7+ | **Developer Mode** | Back to full developer privileges (default) |

## Visual Indicators

### Banner
When in Admin or User mode, a banner appears at the top:
- **Admin Mode**: Gold banner with "🔧 Developer Mode: Viewing as Admin"
- **User Mode**: Blue banner with "🔧 Developer Mode: Viewing as Regular User"

### Navigation
- **Admin Mode**: Shows "Admin" link (not "Developer"), Admin badge (not Developer)
- **User Mode**: No Admin link, no badge
- **Developer Mode**: Shows "Developer" panel with crown icon, red badge

## What Changes in Each Mode

### Admin Mode (3x Z)
✅ See Admin Panel (like a regular admin)
✅ View users
✅ View stats  
✅ View as user
❌ No developer controls
❌ Can't add/remove admins
❌ Can't change passwords
❌ Can't disable users
❌ Can't control lockdown

### User Mode (6x Z)
❌ No Admin Panel link
❌ No admin badge
✅ Regular Dashboard
✅ Workouts
✅ Nutrition
✅ Progress

### Developer Mode (7+ Z) - Default
✅ Full Developer Panel
✅ All admin controls
✅ Manage admins
✅ Change passwords
✅ Disable users
✅ Platform lockdown

## Technical Details

### Implementation
- Keyboard listener in `Layout.jsx`
- State managed in `AdminContext` (`devViewMode`)
- `effectiveIsDeveloper` computed based on `devViewMode`
- All permission checks use `effectiveIsDeveloper`
- 2-second timeout resets counter if no Z presses

### State Management
```javascript
devViewMode: 'developer' | 'admin' | 'user'
effectiveIsDeveloper = isDeveloper && devViewMode === 'developer'
```

### Console Logging
When you press Z 3, 6, or 7+ times, console logs:
- `🔧 Developer viewing as: Admin`
- `🔧 Developer viewing as: Regular User`  
- `🔧 Developer viewing as: Developer (normal)`

## Use Cases

### Testing Admin Features
1. Press Z 3 times
2. See what admins see
3. Test admin-only features
4. Press Z 7+ times to restore developer mode

### Testing User Experience
1. Press Z 6 times
2. Experience the app as a regular user
3. See what users without admin access see
4. Press Z 7+ times to restore developer mode

### Quick Reset
- Press Z 7+ times anytime to immediately return to developer mode
- Counter resets after 2 seconds of inactivity

## Security
- Only works for henryoverbeeke@gmail.com
- No way for other users to access this
- Server-side permissions unchanged (can't actually make unauthorized changes)
- Purely a UI/UX testing feature
