# 🔐 Two-Factor Authentication (2FA) Setup Guide

## ✅ Easiest & Cheapest Solution: Firebase TOTP (FREE)

This guide implements **Time-based One-Time Password (TOTP)** authentication using Firebase's built-in Multi-Factor Authentication. This is:

- ✅ **100% FREE** - No per-transaction costs
- ✅ **Built into Firebase** - Native support, minimal setup
- ✅ **More secure than SMS** - Can't be intercepted
- ✅ **Easy for users** - Works with Google Authenticator, Authy, Microsoft Authenticator, etc.

---

## 📋 Step 1: Enable MFA in Firebase Console

1. **Go to Firebase Console**: https://console.firebase.google.com
2. Navigate to **Authentication** → **Sign-in method**
3. Click on **Multi-factor authentication** tab
4. Click **Get Started** (if first time)
5. Select **TOTP** and click **Enable**
6. Configure enrollment options:
   - **Optional** - Users can choose to enable 2FA (recommended for admin)
   - **Mandatory** - Force all users to set up 2FA

**Recommendation**: Set to **Optional** first, then manually require it for admin accounts only.

---

## 📦 Step 2: Update Dependencies

No additional dependencies needed! Firebase 11.0.0 already includes MFA support.

Your current `firebase` version (11.0.0) is perfect ✅

---

## 🔧 Step 3: Implementation

### Option A: Simple 2FA Enrollment in Settings (Recommended)

Add a 2FA management component to your admin settings page.

#### Create `apps/admin/src/components/TwoFactorSetup.tsx`:

```typescript
import { useState } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { 
  multiFactor, 
  TotpMultiFactorGenerator,
  TotpSecret,
  MultiFactorResolver
} from 'firebase/auth';

export default function TwoFactorSetup() {
  const { auth } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<TotpSecret | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const user = auth.currentUser;
  const mfaEnrolled = user ? multiFactor(user).enrolledFactors.length > 0 : false;

  // Step 1: Generate QR code
  async function startEnrollment() {
    if (!user) return;
    
    setLoading(true);
    setError('');
    try {
      const multiFactorSession = await multiFactor(user).getSession();
      const totpSecret = await TotpMultiFactorGenerator.generateSecret(multiFactorSession);
      
      // Generate QR code URL for authenticator apps
      const qrUrl = totpSecret.generateQrCodeUrl(
        user.email || 'admin@buenobrows.com',
        'Bueno Brows Admin'
      );
      
      setSecret(totpSecret);
      setQrCodeUrl(qrUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verify and finalize enrollment
  async function finishEnrollment() {
    if (!secret || !user) return;
    
    setLoading(true);
    setError('');
    try {
      const multiFactorAssertion = TotpMultiFactorGenerator.assertionForEnrollment(
        secret,
        verificationCode
      );
      
      await multiFactor(user).enroll(multiFactorAssertion, 'Authenticator App');
      
      setSuccess('Two-factor authentication enabled successfully!');
      setQrCodeUrl(null);
      setSecret(null);
      setVerificationCode('');
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  }

  // Unenroll (disable 2FA)
  async function disable2FA() {
    if (!user) return;
    
    if (!confirm('Are you sure you want to disable two-factor authentication?')) {
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const enrolledFactors = multiFactor(user).enrolledFactors;
      if (enrolledFactors.length > 0) {
        await multiFactor(user).unenroll(enrolledFactors[0]);
        setSuccess('Two-factor authentication disabled');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-serif text-slate-800 mb-4">Two-Factor Authentication</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm">
          {success}
        </div>
      )}

      {!mfaEnrolled && !qrCodeUrl && (
        <div>
          <p className="text-slate-600 mb-4 text-sm">
            Add an extra layer of security to your admin account by enabling two-factor authentication.
          </p>
          <button
            onClick={startEnrollment}
            disabled={loading}
            className="bg-terracotta text-white px-4 py-2 rounded hover:bg-opacity-90 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Enable Two-Factor Authentication'}
          </button>
        </div>
      )}

      {qrCodeUrl && (
        <div>
          <p className="text-slate-600 mb-4 text-sm">
            Scan this QR code with your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)
          </p>
          
          <div className="bg-white p-4 border rounded-lg mb-4 flex justify-center">
            <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
          </div>

          <p className="text-sm text-slate-600 mb-2">
            Or enter this code manually: <code className="bg-slate-100 px-2 py-1 rounded">{secret?.secretKey}</code>
          </p>

          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="border rounded px-3 py-2 w-full mb-4"
            maxLength={6}
          />

          <div className="flex gap-2">
            <button
              onClick={finishEnrollment}
              disabled={loading || verificationCode.length !== 6}
              className="bg-terracotta text-white px-4 py-2 rounded hover:bg-opacity-90 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify and Enable'}
            </button>
            <button
              onClick={() => {
                setQrCodeUrl(null);
                setSecret(null);
                setVerificationCode('');
              }}
              className="border border-slate-300 px-4 py-2 rounded hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {mfaEnrolled && !qrCodeUrl && (
        <div>
          <div className="bg-green-50 p-3 rounded mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-700 text-sm font-medium">Two-factor authentication is enabled</span>
          </div>
          
          <button
            onClick={disable2FA}
            disabled={loading}
            className="border border-red-300 text-red-600 px-4 py-2 rounded hover:bg-red-50 disabled:opacity-50"
          >
            {loading ? 'Disabling...' : 'Disable Two-Factor Authentication'}
          </button>
        </div>
      )}
    </div>
  );
}
```

### Step 4: Update the Sign-In Flow

Update `apps/admin/src/components/AuthGate.tsx` to handle 2FA during login:

```typescript
import { PropsWithChildren, useEffect, useState } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  sendPasswordResetEmail,
  MultiFactorError,
  getMultiFactorResolver,
  TotpMultiFactorGenerator
} from 'firebase/auth';

// ... existing State type and AuthGate component ...

function SignIn({ error, onError }: { error?: string; onError: (e: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  
  // 2FA state
  const [needs2FA, setNeeds2FA] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [mfaResolver, setMfaResolver] = useState<any>(null);
  
  const { auth } = useFirebase();
  
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    onError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      // Check if 2FA is required
      if (e.code === 'auth/multi-factor-auth-required') {
        const resolver = getMultiFactorResolver(auth, e);
        setMfaResolver(resolver);
        setNeeds2FA(true);
        setLoading(false);
        return;
      }
      
      const errorMessage = e?.code === 'auth/invalid-credential' 
        ? 'Invalid email or password' 
        : e?.message || 'Failed to sign in';
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function verify2FA() {
    if (!mfaResolver || !totpCode) return;
    
    setLoading(true);
    onError('');
    
    try {
      const multiFactorAssertion = TotpMultiFactorGenerator.assertionForSignIn(
        mfaResolver.hints[0].uid,
        totpCode
      );
      
      await mfaResolver.resolveSignIn(multiFactorAssertion);
      // Success! User will be signed in
    } catch (e: any) {
      onError(e?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  }

  // If 2FA is needed, show verification screen
  if (needs2FA) {
    return (
      <div className="min-h-screen grid place-items-center bg-cream">
        <div className="bg-white shadow-soft rounded-xl p-6 w-[380px]">
          <h1 className="text-2xl font-serif text-slate-800 mb-4">Two-Factor Authentication</h1>
          {error && <p className="text-sm text-red-600 mb-3 p-2 bg-red-50 rounded">{error}</p>}
          
          <p className="text-slate-600 text-sm mb-4">
            Enter the 6-digit code from your authenticator app.
          </p>

          <input
            type="text"
            placeholder="000000"
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full border rounded-md p-2 mb-4 text-center text-2xl tracking-wider"
            maxLength={6}
            autoFocus
          />

          <button
            onClick={verify2FA}
            disabled={loading || totpCode.length !== 6}
            className="w-full bg-terracotta text-white rounded-md py-2 hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>

          <button
            onClick={() => {
              setNeeds2FA(false);
              setMfaResolver(null);
              setTotpCode('');
            }}
            className="w-full mt-2 text-sm text-terracotta hover:text-terracotta/80"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  // ... existing sign-in UI (rest of the component stays the same) ...
}
```

---

## 🎯 Step 5: Add to Settings Page

Add the `TwoFactorSetup` component to your admin settings page:

```typescript
// In your Settings page component
import TwoFactorSetup from '../components/TwoFactorSetup';

export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-serif mb-6">Settings</h1>
      
      {/* Other settings sections */}
      
      <TwoFactorSetup />
    </div>
  );
}
```

---

## 📱 User Experience Flow

### For Admins Enabling 2FA:

1. **Go to Settings** → Click "Enable Two-Factor Authentication"
2. **Scan QR Code** with Google Authenticator (or any TOTP app)
3. **Enter 6-digit code** from the app to verify
4. **Done!** 2FA is now enabled

### For Admins Logging In (with 2FA enabled):

1. **Enter email and password** as normal
2. **Enter 6-digit code** from authenticator app
3. **Signed in!**

---

## 💰 Cost Comparison

| Method | Setup Cost | Per-Auth Cost | Monthly Cost (100 logins) |
|--------|------------|---------------|---------------------------|
| **TOTP (This Guide)** | $0 | $0 | **$0** ✅ |
| SMS via Twilio | $0 | $0.0075 | $0.75 |
| SMS via AWS SNS | $0 | $0.00645 | $0.65 |
| Email OTP | $0 | $0 | $0 |

**Winner: TOTP** - Free forever, more secure than SMS!

---

## 🔒 Security Benefits

✅ **Prevents account takeover** - Even if password is stolen  
✅ **Phishing resistant** - TOTP codes expire in 30 seconds  
✅ **No SIM swap attacks** - Unlike SMS-based 2FA  
✅ **Offline capability** - Works without internet on authenticator app  

---

## 🚀 Quick Start Checklist

- [ ] Enable MFA in Firebase Console (Step 1)
- [ ] Create `TwoFactorSetup.tsx` component (Step 3)
- [ ] Update `AuthGate.tsx` with 2FA verification (Step 4)
- [ ] Add component to Settings page (Step 5)
- [ ] Test enrollment flow
- [ ] Test sign-in with 2FA
- [ ] Deploy to production

---

## 🆘 Troubleshooting

### "Multi-factor authentication is not enabled"
→ Make sure you enabled TOTP in Firebase Console (Step 1)

### "Invalid verification code"
→ Check that your device's clock is accurate (TOTP requires accurate time)

### "User must be signed in to enroll second factor"
→ User must be authenticated before enrolling in 2FA

### QR code not scanning
→ Use the manual entry code shown below the QR code

---

## 🎓 Alternative: SMS-based 2FA (Costs Money)

If you prefer SMS (not recommended due to cost and security):

1. Set up Twilio or AWS SNS (see `TWILIO_SETUP.md`)
2. Enable Phone verification in Firebase Console
3. Use `PhoneMultiFactorGenerator` instead of `TotpMultiFactorGenerator`

**Cost**: ~$0.0075 per SMS

---

## 📚 Additional Resources

- [Firebase MFA Documentation](https://firebase.google.com/docs/auth/web/multi-factor)
- [Google Authenticator App](https://support.google.com/accounts/answer/1066447)
- [Authy App](https://authy.com/)
- [Microsoft Authenticator](https://www.microsoft.com/en-us/security/mobile-authenticator-app)

---

## ✅ Best Practices

1. **Backup codes**: Implement backup codes for account recovery
2. **Admin-only**: Consider requiring 2FA only for admin accounts
3. **Grace period**: Give users time to set up 2FA before enforcing
4. **Clear instructions**: Provide screenshots and clear setup instructions
5. **Support**: Have a backup auth method for account recovery

---

**Questions?** The implementation is straightforward and takes about 30 minutes to set up!





