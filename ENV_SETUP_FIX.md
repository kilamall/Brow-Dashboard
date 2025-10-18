# Environment Variables Setup Fix

## Problem
The bookings tab was showing React error #321 when logged-in customers tried to access it. This was caused by missing environment variables preventing Firebase from initializing properly.

## Root Cause
1. Environment file was located in `apps/booking/src/env.local` instead of `apps/booking/.env.local`
2. File name was missing the dot prefix (`.env.local`)
3. Vite requires `.env` files to be in the app root directory, not in `src/`

## Solution Applied

### Booking App
✅ Created `/apps/booking/.env.local` with all required Firebase configuration
✅ Created `/apps/booking/.env.example` as a template for future setups
✅ Removed the incorrect `apps/booking/src/env.local` file

### Admin App  
✅ Created `/apps/admin/.env.local` with all required Firebase configuration
✅ Created `/apps/admin/.env.example` as a template for future setups

## Required Environment Variables

Both apps require these environment variables:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_FUNCTIONS_REGION
```

Booking app also needs:
```
VITE_AUTH_EMAIL_LINK_URL
```

## Setup Instructions

### For Local Development
1. Copy `.env.example` to `.env.local` in each app directory:
   ```bash
   cd apps/booking
   cp .env.example .env.local
   
   cd ../admin
   cp .env.example .env.local
   ```

2. Fill in the actual Firebase configuration values in `.env.local`

3. Rebuild the apps:
   ```bash
   npm run build
   ```

### For Production/Deployment
Make sure to set these environment variables in your hosting platform (Vercel, Netlify, Firebase Hosting, etc.)

## Security Note
- `.env.local` files are gitignored and should NEVER be committed
- `.env.example` files can be committed as they contain no sensitive data
- Keep your Firebase API keys secure and use Firebase security rules to restrict access

## Verification
After fixing, the ClientDashboard should:
- Load without React error #321
- Display user appointments correctly
- Show the "Book Your First Appointment" message for new users
- Allow users to view and cancel their bookings

## Related Files Changed
- ✅ Fixed subscription cleanup in `ClientDashboard.tsx`
- ✅ Improved service display formatting to match bookings page
- ✅ Added better empty state handling for new users

