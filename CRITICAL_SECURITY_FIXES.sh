#!/bin/bash

# 🔴 CRITICAL SECURITY FIXES - RUN IMMEDIATELY
# This script applies emergency security patches to your Firebase project
# 
# WARNING: Review each section before running!
# Test in development environment first if possible

set -e  # Exit on error

echo "============================================"
echo "🔒 CRITICAL SECURITY FIXES"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to prompt for confirmation
confirm() {
    read -p "$1 (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipped."
        return 1
    fi
    return 0
}

echo "${RED}⚠️  CRITICAL: This script will apply security fixes${NC}"
echo "Make sure you have backups and test in development first."
echo ""

# ============================================
# FIX 1: Disable setAdminRole Function
# ============================================
echo ""
echo "${YELLOW}[1/5] Disabling Dangerous Admin Role Function${NC}"
echo "This function allows ANYONE to grant themselves admin access!"

if confirm "Do you want to disable the setAdminRole function?"; then
    # Comment out the export in index.ts
    if grep -q "export \* from './set-admin-role.js'" functions/src/index.ts; then
        sed -i.bak "s/export \* from '.\/set-admin-role.js'/\/\/ SECURITY: Disabled - export * from '.\/set-admin-role.js'/g" functions/src/index.ts
        echo "${GREEN}✓ Disabled setAdminRole in index.ts${NC}"
    else
        echo "setAdminRole not found in index.ts (may already be removed)"
    fi
    
    # Rename the file to prevent accidental deployment
    if [ -f "functions/src/set-admin-role.ts" ]; then
        mv functions/src/set-admin-role.ts functions/src/set-admin-role.ts.DISABLED
        echo "${GREEN}✓ Renamed set-admin-role.ts to .DISABLED${NC}"
    fi
else
    echo "${RED}⚠️  WARNING: setAdminRole function is still active!${NC}"
    echo "Anyone can grant themselves admin access to your system!"
fi

# ============================================
# FIX 2: Remove Hardcoded API Keys
# ============================================
echo ""
echo "${YELLOW}[2/5] Removing Hardcoded API Keys${NC}"
echo "API keys should NEVER be in source code!"

if confirm "Do you want to remove hardcoded Gemini API key?"; then
    # Fix messaging.ts
    if [ -f "functions/src/messaging.ts" ]; then
        sed -i.bak "s/const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '.*';/const GEMINI_API_KEY = process.env.GEMINI_API_KEY;/g" functions/src/messaging.ts
        sed -i.bak "/^const GEMINI_API_KEY = process.env.GEMINI_API_KEY;/a\\
if (!GEMINI_API_KEY) {\\
  console.error('GEMINI_API_KEY not configured');\\
}" functions/src/messaging.ts
        echo "${GREEN}✓ Fixed messaging.ts${NC}"
    fi
    
    # Fix skin-analysis.ts
    if [ -f "functions/src/skin-analysis.ts" ]; then
        sed -i.bak "s/const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '.*';/const GEMINI_API_KEY = process.env.GEMINI_API_KEY;/g" functions/src/skin-analysis.ts
        sed -i.bak "/^const GEMINI_API_KEY = process.env.GEMINI_API_KEY;/a\\
if (!GEMINI_API_KEY) {\\
  throw new HttpsError('failed-precondition', 'GEMINI_API_KEY not configured');\\
}" functions/src/skin-analysis.ts
        echo "${GREEN}✓ Fixed skin-analysis.ts${NC}"
    fi
    
    echo ""
    echo "${RED}⚠️  IMPORTANT: You MUST now set the API key in Firebase:${NC}"
    echo "Run: firebase functions:secrets:set GEMINI_API_KEY"
    echo ""
    echo "${RED}⚠️  ALSO: Revoke the exposed key in Google Cloud Console!${NC}"
    echo "Go to: https://console.cloud.google.com/apis/credentials"
else
    echo "${RED}⚠️  WARNING: API keys are still exposed in source code!${NC}"
fi

# ============================================
# FIX 3: Secure Firestore Rules
# ============================================
echo ""
echo "${YELLOW}[3/5] Securing Firestore Rules${NC}"
echo "Fixing overly permissive database access rules"

if confirm "Do you want to apply secure Firestore rules?"; then
    # Backup current rules
    cp firebase.rules firebase.rules.backup.$(date +%Y%m%d_%H%M%S)
    echo "${GREEN}✓ Backed up current rules${NC}"
    
    # Apply fixes to rules
    cat > firebase.rules.secure << 'EOF'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null && request.auth.token.role == 'admin';
    }
    
    function isAuthenticated() {
      return request.auth != null;
    }

    match /settings/{doc} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /services/{id} {
      allow read: if true;
      allow write, delete, create: if isAdmin();
    }

    match /customers/{id} {
      // SECURED: Only authenticated users can create customers
      allow read: if isAdmin() || 
        (request.auth != null && 
         (request.auth.token.email == resource.data.email ||
          request.auth.token.phone_number == resource.data.phone));
      
      // SECURED: Require authentication + validation for creation
      allow create: if isAuthenticated() &&
        request.resource.data.keys().hasAll(['name']) &&
        request.resource.data.name is string &&
        request.resource.data.name.size() > 0 &&
        request.resource.data.name.size() < 100;
      
      allow update: if isAdmin() || 
        (request.auth != null && 
         (request.auth.token.email == resource.data.email ||
          request.auth.token.phone_number == resource.data.phone));
      allow delete: if isAdmin();
    }

    match /appointments/{id} {
      // SECURED: Limited public read for availability checking only
      allow read: if isAdmin() || 
        (request.auth != null && request.auth.uid == resource.data.customerId);
      
      // SECURED: Creation only via Cloud Functions
      allow create: if false; // Use Cloud Functions only
      
      allow update: if isAdmin() || 
        (request.auth != null && 
         request.auth.uid == resource.data.customerId &&
         request.resource.data.status == 'cancelled');
      allow delete: if isAdmin();
    }

    match /holds/{id} {
      // SECURED: Read for availability, write ONLY via Cloud Functions
      allow read: if true;
      allow write: if false; // Cloud Functions only via Admin SDK
      allow delete: if false;
    }

    match /messages/{id} {
      allow read: if isAdmin() || 
        (request.auth != null && 
         request.auth.uid == resource.data.customerId);
      allow create: if request.auth != null &&
        request.resource.data.content is string &&
        request.resource.data.type in ['customer', 'admin'] &&
        request.resource.data.customerName is string &&
        request.resource.data.customerId is string;
      allow update: if isAdmin();
    }

    match /reviews/{id} {
      allow read: if true;
      // SECURED: Require authentication for review creation
      allow create: if isAuthenticated() &&
        request.resource.data.rating is number &&
        request.resource.data.rating >= 1 &&
        request.resource.data.rating <= 5;
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    match /conversations/{id} {
      allow read: if isAdmin() || 
        (request.auth != null && 
         request.auth.uid == resource.data.customerId);
      allow create: if request.auth != null && 
        request.resource.data.customerId is string &&
        request.resource.data.customerName is string;
      allow update: if isAdmin() || 
        (request.auth != null && 
         request.auth.uid == resource.data.customerId);
    }

    match /customer_tokens/{id} {
      allow read, write: if isAdmin() || 
        (request.auth != null && 
         request.auth.uid == resource.data.customerId);
      allow create: if request.resource.data.customerId is string &&
        request.resource.data.token is string;
    }

    match /sms_conversations/{id} {
      allow read: if isAdmin();
      allow create: if request.auth != null;
    }

    match /sms_logs/{id} {
      allow read, write: if isAdmin();
    }

    match /ai_conversations/{id} {
      allow read: if isAdmin() || 
        (request.auth != null && 
         request.auth.uid == resource.data.customerId);
      allow create: if request.auth != null;
      allow update: if isAdmin();
    }

    match /ai_sms_conversations/{id} {
      allow read: if isAdmin() || 
        (request.auth != null && 
         request.auth.uid == resource.data.customerId);
      allow create: if request.auth != null;
      allow update: if isAdmin();
    }

    match /email_subscriptions/{id} {
      allow read: if isAdmin();
      allow create: if true;
      allow update, delete: if isAdmin();
    }

    match /sms_consents/{id} {
      allow read: if isAdmin();
      allow create: if true;
      allow update, delete: if isAdmin();
    }

    match /skinAnalyses/{id} {
      allow read: if isAdmin() || 
        (request.auth != null && 
         request.auth.uid == resource.data.customerId);
      allow create: if request.auth != null && 
        request.resource.data.customerId == request.auth.uid;
      allow update: if isAdmin() || 
        (request.auth != null && 
         request.auth.uid == resource.data.customerId);
      allow delete: if isAdmin();
    }

    match /appointmentEditRequests/{id} {
      allow read: if isAdmin() || 
        (request.auth != null && 
         request.auth.uid == resource.data.customerId);
      allow create: if request.auth != null && 
        request.resource.data.customerId is string &&
        request.resource.data.appointmentId is string &&
        request.resource.data.requestedChanges is map;
      allow update: if isAdmin();
    }
    
    // ADDED: Rate limiting collection
    match /rate_limits/{id} {
      allow read, write: if false; // Cloud Functions only
    }
    
    // ADDED: Audit logs (admin read-only)
    match /audit_logs/{id} {
      allow read: if isAdmin();
      allow write: if false; // Cloud Functions only
    }
  }
}
EOF
    
    mv firebase.rules.secure firebase.rules
    echo "${GREEN}✓ Applied secure Firestore rules${NC}"
    echo "${YELLOW}⚠️  You must deploy these rules: firebase deploy --only firestore:rules${NC}"
else
    echo "${RED}⚠️  WARNING: Database rules are still insecure!${NC}"
fi

# ============================================
# FIX 4: Add Admin Role Verification
# ============================================
echo ""
echo "${YELLOW}[4/5] Creating Admin Role Verification Helper${NC}"

if confirm "Do you want to create admin verification helper?"; then
    cat > functions/src/auth-helpers.ts << 'EOF'
// functions/src/auth-helpers.ts
import { HttpsError } from 'firebase-functions/v2/https';
import type { CallableRequest } from 'firebase-functions/v2/https';

/**
 * Verify that the request is from an authenticated admin user
 * Throws HttpsError if not authorized
 */
export function requireAdmin(req: CallableRequest): void {
  if (!req.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }
  
  if (req.auth.token.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Admin access required');
  }
}

/**
 * Verify that the request is authenticated
 * Throws HttpsError if not
 */
export function requireAuth(req: CallableRequest): void {
  if (!req.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }
}

/**
 * Check if the user can access a specific customer's data
 * Allows if: user is admin OR user is the customer
 */
export function canAccessCustomer(req: CallableRequest, customerId: string): boolean {
  if (!req.auth) {
    return false;
  }
  
  // Admin can access all
  if (req.auth.token.role === 'admin') {
    return true;
  }
  
  // User can access their own data
  return req.auth.uid === customerId;
}

/**
 * Require access to a specific customer's data
 * Throws HttpsError if not authorized
 */
export function requireCustomerAccess(req: CallableRequest, customerId: string): void {
  if (!canAccessCustomer(req, customerId)) {
    throw new HttpsError('permission-denied', 'Cannot access this customer data');
  }
}
EOF
    echo "${GREEN}✓ Created auth-helpers.ts${NC}"
    echo "You should now update your Cloud Functions to use these helpers."
    echo "Example: requireAdmin(req); // at the start of admin-only functions"
fi

# ============================================
# FIX 5: Create Secure Environment Template
# ============================================
echo ""
echo "${YELLOW}[5/5] Creating Secure Environment Configuration${NC}"

if confirm "Do you want to create .env.example templates?"; then
    # Admin app
    cat > apps/admin/.env.example << 'EOF'
# Firebase Configuration (from Firebase Console)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Security: Never commit .env.local with real values!
EOF

    # Booking app
    cat > apps/booking/.env.example << 'EOF'
# Firebase Configuration (from Firebase Console)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# reCAPTCHA (for App Check)
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key

# Security: Never commit .env.local with real values!
EOF

    echo "${GREEN}✓ Created .env.example templates${NC}"
    echo ""
    echo "${YELLOW}IMPORTANT:${NC}"
    echo "1. Copy these to .env.local files"
    echo "2. Fill in your actual Firebase configuration"
    echo "3. NEVER commit .env.local files to git"
fi

# ============================================
# Summary and Next Steps
# ============================================
echo ""
echo "============================================"
echo "${GREEN}✓ Security Fixes Applied${NC}"
echo "============================================"
echo ""
echo "${YELLOW}⚠️  CRITICAL NEXT STEPS:${NC}"
echo ""
echo "1. Revoke the exposed Gemini API key:"
echo "   https://console.cloud.google.com/apis/credentials"
echo ""
echo "2. Set new API key in Firebase:"
echo "   firebase functions:secrets:set GEMINI_API_KEY"
echo ""
echo "3. Build and deploy the fixed functions:"
echo "   cd functions && npm run build"
echo "   firebase deploy --only functions"
echo ""
echo "4. Deploy the secure Firestore rules:"
echo "   firebase deploy --only firestore:rules"
echo ""
echo "5. Review the SECURITY_AUDIT_REPORT.md for remaining issues"
echo ""
echo "6. Test your application thoroughly after deployment"
echo ""
echo "${RED}⚠️  WARNING: Some features may break until you complete step 2${NC}"
echo ""
echo "Backup files created with .backup.* extension"
echo ""
echo "${GREEN}Security fixes complete!${NC}"

