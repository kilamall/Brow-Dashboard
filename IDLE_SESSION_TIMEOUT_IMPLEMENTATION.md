# Idle Session Timeout Implementation

## ✅ **COMPLETED**

### 1. **Created `useIdleSession` Hook** (`packages/shared/src/useIdleSession.ts`)
- Automatically tracks user activity (mouse, keyboard, scroll, touch)
- Signs out users after configurable idle timeout
- Shows warning before sign out
- Resettable timer with "Stay Signed In" button

### 2. **Removed Email Change Banner**
- Removed the "Sign Out & Sign Back In" banner from Profile page
- Replaced with automatic idle session timeout
- Users are now automatically signed out after inactivity, ensuring fresh sessions

### 3. **Added Idle Session Warning Components**
- **Booking App**: `apps/booking/src/components/IdleSessionWarning.tsx`
  - 30-minute timeout (5-minute warning)
  - Amber warning banner at top of page
- **Admin App**: `apps/admin/src/components/IdleSessionWarning.tsx`
  - 15-minute timeout (3-minute warning) - stricter for admin
  - Red warning banner positioned below header

### 4. **Integrated into Both Apps**
- **Booking App**: Added to `apps/booking/src/App.tsx`
- **Admin App**: Added to `apps/admin/src/App.tsx`
- Both apps now automatically sign out idle users

### 5. **Login Page Messages**
- Added "Session Expired" message when redirected due to idle timeout
- Shows in both booking and admin login pages
- Explains why user was signed out

---

## 🎯 **How It Works**

### User Experience:
1. **User is active**: Timer resets on any activity (mouse, keyboard, scroll, touch)
2. **User goes idle**: After timeout period, warning banner appears
3. **Warning period**: User sees countdown timer (e.g., "5:00", "4:59", ...)
4. **"Stay Signed In" button**: User can click to reset timer and continue
5. **Auto sign out**: If no activity, user is automatically signed out
6. **Redirect**: User is redirected to login page with `?reason=idle` parameter

### Technical Details:
- **Activity Tracking**: Monitors `mousedown`, `mousemove`, `keypress`, `scroll`, `touchstart`, `click`, `keydown`
- **Timer Reset**: Any activity resets the idle timer
- **Warning Display**: Shows countdown in MM:SS format
- **Automatic Sign Out**: Uses Firebase `signOut()` when timeout expires
- **Navigation**: Redirects to login page after sign out

---

## ⚙️ **Configuration**

### Booking App (Customer):
```tsx
<IdleSessionWarning 
  user={user} 
  timeoutMinutes={30}  // 30 minutes idle timeout
  warningMinutes={5}   // 5 minutes warning before sign out
/>
```

### Admin App:
```tsx
<IdleSessionWarning 
  user={user} 
  timeoutMinutes={15}  // 15 minutes idle timeout (stricter)
  warningMinutes={3}   // 3 minutes warning before sign out
/>
```

---

## 🔧 **Customization**

You can customize the timeout in the hook:

```tsx
const { remainingTime, isWarning, resetTimer } = useIdleSession(user, {
  timeoutMs: 15 * 60 * 1000,        // 15 minutes
  warningTimeMs: 3 * 60 * 1000,     // 3 minutes warning
  onWarning: (remaining) => {
    console.log(`Warning: ${remaining}ms remaining`);
  },
  onSignOut: () => {
    navigate('/login?reason=idle');
  },
  enabled: true,                     // Enable/disable idle detection
  events: ['mousedown', 'keypress']  // Custom events to track
});
```

---

## 📊 **Benefits**

1. **Security**: Prevents unauthorized access to unattended sessions
2. **Fresh Sessions**: Users always have recent authentication (fixes email change issue)
3. **User-Friendly**: Clear warning with countdown and "Stay Signed In" option
4. **Automatic**: No manual "sign out and back in" required
5. **Configurable**: Different timeouts for customer vs admin

---

## 🎨 **UI/UX**

### Warning Banner:
- **Booking**: Amber/yellow banner at top
- **Admin**: Red banner below header (more prominent)
- Shows countdown timer (MM:SS)
- "Stay Signed In" button to reset timer
- Auto-dismisses when timer resets

### Login Page:
- Shows "Session Expired" message when `?reason=idle` is in URL
- Explains why user was signed out
- Non-intrusive, doesn't block sign-in

---

## 🔄 **What Changed**

### Before:
- Users saw banner: "Please sign out and sign back in before changing your email"
- Manual process required
- Confusing for users

### After:
- Automatic sign out after idle period
- No manual steps required
- Clear warning with countdown
- Fresh session ensures email changes work

---

## 📝 **Files Modified**

1. ✅ `packages/shared/src/useIdleSession.ts` - New hook
2. ✅ `apps/booking/src/components/IdleSessionWarning.tsx` - New component
3. ✅ `apps/admin/src/components/IdleSessionWarning.tsx` - New component
4. ✅ `apps/booking/src/App.tsx` - Added warning component
5. ✅ `apps/admin/src/App.tsx` - Added warning component
6. ✅ `apps/booking/src/pages/Profile.tsx` - Removed email change banner
7. ✅ `apps/booking/src/pages/Login.tsx` - Added idle session message
8. ✅ `apps/admin/src/components/AuthGate.tsx` - Added idle session message

---

## 🚀 **Ready to Deploy**

All changes are complete and ready for deployment. The idle session timeout will:
- ✅ Automatically sign out idle users
- ✅ Show clear warnings before sign out
- ✅ Allow users to extend their session
- ✅ Fix the email change re-authentication issue
- ✅ Improve security for both customer and admin apps


