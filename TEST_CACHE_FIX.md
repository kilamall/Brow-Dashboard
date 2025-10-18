# 🧪 Testing the Cache Fix

## Quick Test Guide

### Before Testing
Make sure you've deployed the fix:
```bash
./deploy-with-cache-fix.sh
```

---

## Test 1: Service Worker Installation ✅

### Steps:
1. Open the booking site in **Chrome/Edge** (incognito recommended)
2. Open **DevTools** (Press `F12` or `Cmd+Option+I`)
3. Go to **Console** tab
4. Look for these logs:

```
Service Worker 1.0.1 initializing...
Service Worker 1.0.1 installed
Service Worker 1.0.1 activated
```

### Expected Result:
- ✅ Service worker logs appear in console
- ✅ No errors in console

### If it fails:
- Check if HTTPS is enabled (service workers require HTTPS)
- Check Network tab for service worker file loading
- Try hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

---

## Test 2: Service Worker Registration ✅

### Steps:
1. In **DevTools**, go to **Application** tab
2. Click **Service Workers** in the left sidebar
3. You should see:
   - Status: **Activated and running**
   - Source: `/firebase-messaging-sw.js`

### Expected Result:
- ✅ Service worker is registered
- ✅ Shows as "activated and running"

### If it fails:
- Click "Unregister" and refresh the page
- Check console for errors
- Verify the service worker file exists at `/firebase-messaging-sw.js`

---

## Test 3: Update Detection 🎯

### Steps:
1. With the site open, **make a small change** to any booking page
   ```bash
   # Example: Edit apps/booking/src/pages/Home.tsx
   # Add a comment or change text
   ```

2. **Build and deploy** the booking app:
   ```bash
   cd apps/booking
   npm run build
   cd ../..
   firebase deploy --only hosting:booking
   ```

3. **Increment service worker version** in `apps/booking/public/firebase-messaging-sw.js`:
   ```javascript
   const SW_VERSION = '1.0.2'; // Changed from 1.0.1
   ```

4. **Deploy again**:
   ```bash
   firebase deploy --only hosting:booking
   ```

5. **Wait 60 seconds** (or click "Update" in DevTools → Application → Service Workers)

### Expected Result:
- ✅ Update notification appears in **bottom-right corner**
- ✅ Notification shows: "Update Available"
- ✅ Has "Reload Now" and "Later" buttons

### If it fails:
- Check console for errors
- Manually trigger update:
  ```javascript
  // Run in console
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => reg.update());
  });
  ```

---

## Test 4: Update Installation 🔄

### Steps:
1. When update notification appears, click **"Reload Now"**
2. Page should reload automatically

### Expected Result:
- ✅ Page reloads within 1-2 seconds
- ✅ New version is loaded
- ✅ Console shows new service worker version:
  ```
  Service Worker 1.0.2 initializing...
  Service Worker 1.0.2 installed
  Service Worker 1.0.2 activated
  ```

### If it fails:
- Try manual reload: `Ctrl+R` or `Cmd+R`
- Check DevTools → Application → Service Workers for errors
- Try hard refresh: `Ctrl+Shift+R` or `Cmd+Shift+R`

---

## Test 5: Cache Invalidation 💾

### Steps:
1. Make a visible change (e.g., change home page title)
2. Build and deploy
3. Reload the page (should show update notification)
4. Click "Reload Now"

### Expected Result:
- ✅ Changes are visible immediately after reload
- ✅ No need to close browser
- ✅ No need to clear cache manually

### If it fails:
- Check cache headers in Network tab
- Check that build generated new hashed filenames
- Verify `firebase.json` has correct cache headers

---

## Test 6: Mobile Testing 📱

### Steps:
1. Open booking site on **mobile device** (or use DevTools mobile simulator)
2. Open **Chrome** (on Android) or **Safari** (on iOS)
3. Make a change and deploy
4. Wait for update notification

### Expected Result:
- ✅ Update notification appears on mobile
- ✅ "Reload Now" button is tap-friendly
- ✅ Reload works smoothly

### Android Debug:
1. Connect device via USB
2. Open `chrome://inspect` on desktop
3. Click "Inspect" on your mobile tab
4. Check console logs

### iOS Debug:
1. Enable Web Inspector on iPhone (Settings → Safari → Advanced)
2. Connect to Mac
3. Open Safari → Develop → [Your iPhone] → [Your Site]

---

## Test 7: No Service Worker Users 🌐

Some users might have service workers disabled or be on older browsers.

### Steps:
1. Open site in **private/incognito** mode
2. Disable service workers:
   - Chrome: `chrome://flags/#service-worker-payment-apps` → Disabled
   - Or test in older browser

### Expected Result:
- ✅ Site still works without service worker
- ✅ No errors in console
- ✅ Update component doesn't show

---

## Debugging Commands 🔧

### Check Service Worker Status:
```javascript
// Run in browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => {
    console.log('Service Worker:', reg);
    console.log('Active:', reg.active);
    console.log('Waiting:', reg.waiting);
    console.log('Installing:', reg.installing);
  });
});
```

### Force Update:
```javascript
// Run in browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.update());
});
```

### Unregister All Service Workers:
```javascript
// Run in browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
  console.log('Unregistered all service workers');
});
// Then refresh page
```

### Clear All Caches:
```javascript
// Run in browser console
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
  console.log('Cleared all caches');
});
// Then refresh page
```

---

## Common Issues & Solutions 🔍

### Issue: "Service Worker won't update"
**Solutions:**
1. Check that `SW_VERSION` was incremented
2. Force update in DevTools
3. Check Network tab → service worker file should show `200` status
4. Try unregister and re-register

### Issue: "Update notification doesn't show"
**Solutions:**
1. Wait full 60 seconds for check interval
2. Check console for errors
3. Verify service worker is running
4. Try manual update command

### Issue: "Old version still showing after update"
**Solutions:**
1. Check cache headers in Network tab
2. Verify build generated new hashed files
3. Check `firebase.json` has proper headers
4. Try hard refresh

### Issue: "Service worker not installing"
**Solutions:**
1. Ensure site is served over HTTPS
2. Check console for syntax errors in service worker
3. Check Network tab for 404 on service worker file
4. Clear browser cache and try again

---

## Success Criteria ✨

Your cache fix is working correctly if:

- ✅ Service worker installs without errors
- ✅ Update notification appears when new version deployed
- ✅ Users can reload with one click
- ✅ Changes appear without closing browser
- ✅ No manual cache clearing needed
- ✅ Works on mobile devices
- ✅ Works on different browsers

---

## Performance Monitoring 📊

### Check Cache Headers:
1. Open DevTools → **Network** tab
2. Refresh page
3. Click on any file (JS, CSS, HTML)
4. Check **Response Headers**:

**Static Assets (JS/CSS/Images):**
```
Cache-Control: public, max-age=31536000, immutable
```

**HTML Files:**
```
Cache-Control: no-cache, no-store, must-revalidate
```

**Service Worker:**
```
Cache-Control: no-cache, no-store, must-revalidate
Service-Worker-Allowed: /
```

---

## Browser Compatibility 🌍

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 45+ | ✅ Full support |
| Firefox | 44+ | ✅ Full support |
| Safari | 11.1+ | ✅ Full support |
| Edge | 17+ | ✅ Full support |
| Opera | 32+ | ✅ Full support |
| Samsung Internet | 4+ | ✅ Full support |
| Chrome Android | All | ✅ Full support |
| Safari iOS | 11.3+ | ✅ Full support |

---

## Next Steps After Testing 🎯

1. ✅ Verify all tests pass
2. ✅ Monitor production for issues
3. ✅ Check browser console logs
4. ✅ Gather user feedback
5. ✅ Document any edge cases

---

**Need Help?**
- Check `CACHE_FIX_GUIDE.md` for detailed documentation
- Review service worker code in `apps/booking/public/firebase-messaging-sw.js`
- Check update component in `apps/booking/src/components/ServiceWorkerUpdate.tsx`

---

**Last Updated:** October 18, 2025  
**Version:** 1.0.0

