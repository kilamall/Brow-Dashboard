# 🔧 Troubleshooting Blank Pages

## Steps to Diagnose:

### 1. Check Browser Console

**Admin Dashboard**: https://bueno-brows-admin.web.app
**Booking Site**: https://bueno-brows-7cce7.web.app

Open browser DevTools:
- **Chrome/Edge**: F12 or Ctrl+Shift+I (Cmd+Option+I on Mac)
- **Firefox**: F12 or Ctrl+Shift+K (Cmd+Option+K on Mac)
- **Safari**: Enable Developer menu first, then Cmd+Option+C

Go to **Console** tab and look for red errors.

### 2. Common Errors & Solutions:

#### Error: "Failed to fetch" or "Network error"
**Cause**: Firebase initialization issue or wrong credentials
**Solution**: Check `.env.local` files have correct Firebase config

#### Error: "initFirebase is not a function" or "Cannot read properties of undefined"
**Cause**: Import path issues
**Solution**: Already fixed, rebuild and redeploy

#### Error: "Missing or insufficient permissions"
**Cause**: Firestore security rules blocking access
**Solution**: Already configured correctly

#### Error: Blank page with no errors
**Cause**: React rendering issue or infinite loop
**Solution**: Check specific component causing the issue

### 3. Test Individual Pages:

Try accessing each page directly:

**Admin App:**
- https://bueno-brows-admin.web.app/ (redirects to /home)
- https://bueno-brows-admin.web.app/home
- https://bueno-brows-admin.web.app/services
- https://bueno-brows-admin.web.app/schedule
- https://bueno-brows-admin.web.app/customers

**Booking App:**
- https://bueno-brows-7cce7.web.app/
- https://bueno-brows-7cce7.web.app/services
- https://bueno-brows-7cce7.web.app/book

### 4. Check Firebase Console:

Go to: https://console.firebase.google.com/project/bueno-brows-7cce7

Check:
- **Firestore** → Verify data exists (services, settings collections)
- **Authentication** → Verify your user exists and has admin role
- **Hosting** → Check deployment status

### 5. Test Locally First:

Before deployment, test locally:

```bash
cd /Users/kilam/Desktop/Admin-Github/Brow-Admin-Booking-Dashboard

# Test admin app locally
pnpm dev:admin

# In another terminal, test booking app
pnpm dev:booking
```

If it works locally but not in production, the issue is with the build/deployment.

### 6. Clear Browser Cache:

Sometimes old cached files cause issues:
- **Chrome**: Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac) → Clear cache
- Or use Incognito/Private browsing mode
- Hard refresh: Ctrl+F5 (Cmd+Shift+R on Mac)

### 7. Check Network Tab:

In DevTools → **Network** tab:
- Refresh the page
- Look for failed requests (red status codes)
- Check if Firebase SDK files are loading

## What to Share for Help:

If still having issues, please provide:

1. **Console errors** (screenshot or copy text)
2. **Which page** is blank (admin home, services, booking, etc.)
3. **Browser and version** (Chrome 120, Firefox 121, etc.)
4. **What you see** (completely white page, header but no content, loading spinner, etc.)

## Quick Fix - Redeploy:

Sometimes a clean rebuild fixes things:

```bash
cd /Users/kilam/Desktop/Admin-Github/Brow-Admin-Booking-Dashboard

# Rebuild both apps
pnpm --filter @buenobrows/admin build
pnpm --filter @buenobrows/booking build

# Redeploy
firebase deploy --only hosting
```

