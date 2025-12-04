import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useFirebase } from '@buenobrows/shared/useFirebase';

// Extend Window interface for reCAPTCHA
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | undefined;
    grecaptcha: any;
  }
}

type AuthMode = 'email' | 'phone';

export default function Login() {
  const { db, auth } = useFirebase();
  const nav = useNavigate();
  
  // Get return URL from query params
  const searchParams = new URLSearchParams(window.location.search);
  const returnTo = searchParams.get('returnTo') || '/book';
  const prefill = searchParams.get('prefill') || '';
  const reason = searchParams.get('reason'); // 'idle' if signed out due to idle session
  
  const [authMode, setAuthMode] = useState<AuthMode>('email');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [birthday, setBirthday] = useState('');

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digitsOnly = value.replace(/\D/g, '');
    
    // If it starts with 1 and has 11 digits, remove the leading 1
    if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
      return digitsOnly.slice(1);
    }
    
    // Return digits only (max 10)
    return digitsOnly.slice(0, 10);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Handle prefill from booking flow
  useEffect(() => {
    if (prefill) {
      if (prefill.startsWith('email=')) {
        const emailValue = decodeURIComponent(prefill.replace('email=', ''));
        setEmail(emailValue);
        setAuthMode('email');
      } else if (prefill.startsWith('phone=')) {
        const phoneValue = decodeURIComponent(prefill.replace('phone=', ''));
        setPhone(phoneValue);
        setAuthMode('phone');
      }
    }
  }, [prefill]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Update display name if provided
        if (userCredential.user) {
          const profileUpdates: any = {};
          if (name) profileUpdates.displayName = name;
          
          if (Object.keys(profileUpdates).length > 0) {
            await updateProfile(userCredential.user, profileUpdates);
          }

          // CRITICAL: Find or create customer record - REQUIRED for sign-up
          // This ensures a customer record exists (either finds existing or creates new)
          const { getFunctions, httpsCallable } = await import('firebase/functions');
          const functions = getFunctions();
          const findOrCreate = httpsCallable(functions, 'findOrCreateCustomer');
          
          try {
            console.log('🔍 Finding or creating customer record for sign-up:', email);
            const result = await findOrCreate({
              email: email,
              phone: phone || null,
              name: name || 'Customer',
              profilePictureUrl: null, // Profile picture can be added after signup from Profile page
              authUid: userCredential.user.uid,
              birthday: birthday || null
            }) as { data: { customerId: string; isNew: boolean; merged: boolean } };
            
            if (result.data.merged) {
              console.log('✅ Merged existing customer record with new auth account');
              alert('Welcome back! Your previous bookings have been linked to your account.');
            } else if (result.data.isNew) {
              console.log('✅ Created new customer record');
            } else {
              console.log('✅ Found existing customer record');
            }
          } catch (customerError: any) {
            // CRITICAL: If finding/creating customer record fails, sign out
            console.error('❌ Failed to find or create customer record:', customerError);
            await auth.signOut();
            throw new Error('Failed to set up your account. Please try again or contact support if the problem persists.');
          }

          // Send verification email with proper action code settings
          const actionCodeSettings = {
            url: `${window.location.origin}/verify`,
            handleCodeInApp: false,
          };
          await sendEmailVerification(userCredential.user, actionCodeSettings);
          setError(''); // Clear any errors
          alert('Account created! Please check your email to verify your account.');
        }
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Check if email is verified
        if (userCredential.user && !userCredential.user.emailVerified) {
          // Sign out the user since they're not verified
          await auth.signOut();
          setUnverifiedEmail(email);
          setNeedsVerification(true);
          setError('Please verify your email before signing in. Check your inbox for the verification link.');
          return;
        }

        // CRITICAL: Find or create customer record - REQUIRED for sign-in
        // This ensures a customer record exists (either finds existing or creates new)
        if (!userCredential.user) {
          throw new Error('Sign-in succeeded but no user object returned');
        }

        const { getFunctions, httpsCallable } = await import('firebase/functions');
        const functions = getFunctions();
        const findOrCreate = httpsCallable(functions, 'findOrCreateCustomer');
        
        try {
          console.log('🔍 Finding or creating customer record for sign-in:', userCredential.user.email);
          const result = await findOrCreate({
            email: userCredential.user.email,
            phone: null,
            name: userCredential.user.displayName || 'Customer',
            authUid: userCredential.user.uid,
          }) as { data: { customerId: string; isNew: boolean; merged: boolean } };
          
          if (result.data.isNew) {
            console.log('✅ Created new customer record');
          } else if (result.data.merged) {
            console.log('✅ Merged existing customer record');
          } else {
            console.log('✅ Found existing customer record');
          }
        } catch (customerError: any) {
          // CRITICAL: If finding/creating customer record fails, sign out
          console.error('❌ Failed to find or create customer record:', customerError);
          await auth.signOut();
          throw new Error('Failed to set up your account. Please try again or contact support if the problem persists.');
        }
      }
      
      // Restore booking state if coming from booking flow
      if (returnTo === '/book') {
        const bookingState = sessionStorage.getItem('bb_booking_state');
        if (bookingState) {
          try {
            const state = JSON.parse(bookingState);
            // Restore the booking cart
            sessionStorage.setItem('bb_booking_cart', JSON.stringify({
              selectedServiceIds: state.selectedServiceIds || [],
              dateStr: state.dateStr,
              gName: state.gName,
              gEmail: state.gEmail,
              gPhone: state.gPhone
            }));
            // Clear the temporary state
            sessionStorage.removeItem('bb_booking_state');
          } catch (error) {
            console.error('Failed to restore booking state:', error);
          }
        }
      }
      
      // Redirect back to return URL with cart intact
      nav(returnTo);
    } catch (err: any) {
      // Check if this is a customer record error (will have our custom message)
      if (err.message && err.message.includes('set up your account')) {
        setError(err.message);
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);

    try {
      console.log('🔍 Starting Google Auth...');
      console.log('🔍 Auth instance:', auth);
      console.log('🔍 Auth domain:', auth.app.options.authDomain);
      
      const provider = new GoogleAuthProvider();
      console.log('🔍 Provider created:', provider);
      
      const result = await signInWithPopup(auth, provider);
      console.log('🔍 Auth successful:', result.user?.email);
      
      // CRITICAL: Find or create customer record - REQUIRED for authenticated sign-in
      // This ensures a customer record exists (either finds existing or creates new)
      // Guest bookings handle customer creation separately during booking flow
      if (!result.user) {
        throw new Error('Authentication succeeded but no user object returned');
      }

      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const functions = getFunctions();
      const findOrCreate = httpsCallable(functions, 'findOrCreateCustomer');
      
      try {
        console.log('🔍 Finding or creating customer record for:', result.user.email);
        const customerResult = await findOrCreate({
          email: result.user.email,
          name: result.user.displayName || 'Customer',
          phone: result.user.phoneNumber || null,
          profilePictureUrl: result.user.photoURL || null,
          authUid: result.user.uid
        }) as { data: { customerId: string; isNew: boolean; merged: boolean } };
        
        console.log('✅ Customer record result:', customerResult.data);
        if (customerResult.data.isNew) {
          console.log('✅ Created new customer record');
        } else if (customerResult.data.merged) {
          console.log('✅ Merged existing customer record with Google account');
        } else {
          console.log('✅ Found existing customer record');
        }
      } catch (customerError: any) {
        // CRITICAL: If finding/creating customer record fails, we must sign out
        // to prevent user from being signed in without a customer record
        console.error('❌ Failed to find or create customer record:', customerError);
        console.error('❌ Error code:', customerError?.code);
        console.error('❌ Error message:', customerError?.message);
        
        // Sign user out to prevent incomplete state
        try {
          await auth.signOut();
        } catch (signOutErr) {
          console.error('Failed to sign out after customer record error:', signOutErr);
        }
        
        // Re-throw with clear message for user
        throw new Error('Failed to set up your account. Please try again or contact support if the problem persists.');
      }
      
      // Restore booking state if coming from booking flow
      if (returnTo === '/book') {
        const bookingState = sessionStorage.getItem('bb_booking_state');
        if (bookingState) {
          try {
            const state = JSON.parse(bookingState);
            // Restore the booking cart
            sessionStorage.setItem('bb_booking_cart', JSON.stringify({
              selectedServiceIds: state.selectedServiceIds || [],
              dateStr: state.dateStr,
              gName: state.gName,
              gEmail: state.gEmail,
              gPhone: state.gPhone
            }));
            // Clear the temporary state
            sessionStorage.removeItem('bb_booking_state');
          } catch (error) {
            console.error('Failed to restore booking state:', error);
          }
        }
      }
      
      // Redirect back to return URL with cart intact
      nav(returnTo);
    } catch (err: any) {
      console.error('🔍 Google Auth Error:', err);
      console.error('🔍 Error code:', err.code);
      console.error('🔍 Error message:', err.message);
      
      // Handle multi-factor authentication error
      if (err.code === 'auth/multi-factor-auth-required') {
        // MFA is enabled for admin site but not supported on booking site
        // Guide user to use email/password sign-in instead
        setError('Your account has multi-factor authentication enabled. The booking site doesn\'t support MFA. Please use email and password sign-in instead.');
        // Switch to email auth mode automatically so they can enter credentials
        setAuthMode('email');
        return;
      }
      
      // Handle other common Google auth errors with user-friendly messages
      let errorMessage = 'Failed to sign in with Google';
      
      // Check if this is a customer record error (will have our custom message)
      if (err.message && err.message.includes('set up your account')) {
        errorMessage = err.message;
      } else if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled. Please try again.';
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups for this site and try again.';
      } else if (err.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized. Please contact support.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = 'Google sign-in is not enabled. Please use email sign-in instead.';
      } else if (err.code === 'auth/network-request-failed' || err.code === 'auth/internal-error') {
        errorMessage = 'Network error detected. Please check your connection and try again.';
      } else if (err.code === 'auth/timeout') {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Setup reCAPTCHA verifier
  useEffect(() => {
    if (authMode === 'phone' && !showVerification && !window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved
          },
          'expired-callback': () => {
            setError('reCAPTCHA expired. Please try again.');
          }
        });
      } catch (err) {
        console.error('Error setting up reCAPTCHA:', err);
      }
    }
    
    return () => {
      if (window.recaptchaVerifier && authMode !== 'phone') {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          // ignore cleanup errors
        }
        window.recaptchaVerifier = undefined;
      }
    };
  }, [authMode, showVerification, auth]);

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Format phone number to E.164 format using selected country code
      let formattedPhone = phone.trim();
      if (!formattedPhone.startsWith('+')) {
        // Remove all non-digits and add selected country code
        const digitsOnly = formattedPhone.replace(/\D/g, '');
        formattedPhone = countryCode + digitsOnly;
      }

      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setVerificationId(confirmationResult.verificationId);
      setShowVerification(true);
      setError('');
    } catch (err: any) {
      console.error('Phone auth error:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to send verification code';
      if (err.code === 'auth/invalid-phone-number') {
        errorMessage = 'Please enter a valid phone number';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please wait a few minutes before trying again.';
      } else if (err.code === 'auth/quota-exceeded') {
        errorMessage = 'SMS quota exceeded. Please try again later.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Reset reCAPTCHA on error so user can try again
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = undefined;
        } catch (e) {
          console.error('Error resetting reCAPTCHA:', e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      const userCredential = await signInWithCredential(auth, credential);
      console.log('✅ Phone verification successful');
      
      // CRITICAL: Find or create customer record - REQUIRED for phone auth
      // This ensures a customer record exists (either finds existing or creates new)
      if (!userCredential.user) {
        throw new Error('Phone verification succeeded but no user object returned');
      }

      // Format phone number to E.164 format using selected country code
      let formattedPhone = phone.trim();
      if (!formattedPhone.startsWith('+')) {
        const digitsOnly = formattedPhone.replace(/\D/g, '');
        formattedPhone = countryCode + digitsOnly;
      }

      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const functions = getFunctions();
      const findOrCreate = httpsCallable(functions, 'findOrCreateCustomer');
      
      try {
        console.log('🔍 Finding or creating customer record for phone auth:', formattedPhone);
        const result = await findOrCreate({
          phone: formattedPhone,
          name: name || userCredential.user.displayName || 'Customer',
          email: null, // Phone auth doesn't provide email
          authUid: userCredential.user.uid,
          birthday: birthday || null
        }) as { data: { customerId: string; isNew: boolean; merged: boolean } };
        
        if (result.data.merged) {
          console.log('✅ Merged existing customer record with phone auth account');
          alert('Welcome back! Your previous bookings have been linked to your account.');
        } else if (result.data.isNew) {
          console.log('✅ Created new customer record');
        } else {
          console.log('✅ Found existing customer record');
        }
      } catch (customerError: any) {
        // CRITICAL: If finding/creating customer record fails, sign out
        console.error('❌ Failed to find or create customer record:', customerError);
        await auth.signOut();
        throw new Error('Failed to set up your account. Please try again or contact support if the problem persists.');
      }
      
      // Restore booking state if coming from booking flow
      if (returnTo === '/book') {
        const bookingState = sessionStorage.getItem('bb_booking_state');
        if (bookingState) {
          try {
            const state = JSON.parse(bookingState);
            // Restore the booking cart
            sessionStorage.setItem('bb_booking_cart', JSON.stringify({
              selectedServiceIds: state.selectedServiceIds || [],
              dateStr: state.dateStr,
              gName: state.gName,
              gEmail: state.gEmail,
              gPhone: state.gPhone
            }));
            // Clear the temporary state
            sessionStorage.removeItem('bb_booking_state');
          } catch (error) {
            console.error('Failed to restore booking state:', error);
          }
        }
      }
      
      // Redirect back to return URL with cart intact
      nav(returnTo);
    } catch (err: any) {
      console.error('❌ Phone verification error:', err);
      // Check if this is a customer record error (will have our custom message)
      if (err.message && err.message.includes('set up your account')) {
        setError(err.message);
      } else {
        setError(err.message || 'Invalid verification code');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmailVerification = async () => {
    setError('');
    setLoading(true);

    try {
      // Sign in temporarily ONLY to send verification email, then immediately sign out
      const tempUser = await signInWithEmailAndPassword(auth, unverifiedEmail, password);
      
      if (tempUser.user) {
        console.log('Sending verification email to:', unverifiedEmail);
        
        // Send verification email with proper action code settings
        const actionCodeSettings = {
          url: `${window.location.origin}/verify`,
          handleCodeInApp: false,
        };
        await sendEmailVerification(tempUser.user, actionCodeSettings);
        
        console.log('Verification email sent successfully');
        
        // Immediately sign out to prevent accessing the app prior to verification
        await auth.signOut();
        setError('');
        alert('Verification email sent! Please check your inbox and click the verification link, then sign in again.');
        // Keep the verification prompt visible and require a fresh login after verifying
        setNeedsVerification(true);
        setUnverifiedEmail(unverifiedEmail);
      }
    } catch (err: any) {
      console.error('Resend verification error:', err);
      if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email. Please sign up first.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a few minutes before trying again.');
      } else {
        setError(err.message || 'Failed to send verification email. Please try signing in again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const actionCodeSettings = {
        url: `https://buenobrows.com/login`,
        handleCodeInApp: false,
      };

      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      setResetEmailSent(true);
      setError(''); // Clear any errors
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a few minutes before trying again.');
      } else {
        setError(err.message || 'Failed to send password reset email.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-terracotta/10 to-cream/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        {/* Idle Session Message */}
        {reason === 'idle' && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">Session Expired</h3>
                <p className="text-sm text-amber-800">
                  You were automatically signed out due to inactivity. Please sign in again to continue.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div>
          <h2 className="text-center text-3xl font-serif text-terracotta">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            {isSignUp
              ? 'Sign up to manage your appointments'
              : 'Sign in to view and manage your bookings'}
          </p>
        </div>

        {/* Auth Mode Toggle */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setAuthMode('email');
              setError('');
              setShowVerification(false);
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              authMode === 'email'
                ? 'bg-white text-terracotta shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('phone');
              setError('');
              setShowVerification(false);
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              authMode === 'phone'
                ? 'bg-white text-terracotta shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Phone
          </button>
        </div>

        {/* Email Auth Form */}
        {authMode === 'email' && !needsVerification && (
          <form className="mt-8 space-y-6" onSubmit={handleEmailAuth}>
          {isSignUp && (
            <>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required={isSignUp}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-terracotta focus:border-terracotta"
                  placeholder="John Doe"
                />
              </div>
              
              {/* Profile Picture Notice - Cannot upload during sign-up */}
              <div className="rounded-md bg-blue-50 border border-blue-200 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      You can add a profile picture after creating your account from your profile page.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="birthday" className="block text-sm font-medium text-slate-700">
                  Birthday *
                </label>
                <input
                  id="birthday"
                  name="birthday"
                  type="date"
                  required={isSignUp}
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-terracotta focus:border-terracotta"
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-terracotta focus:border-terracotta"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-terracotta focus:border-terracotta"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4" role="alert" aria-live="polite">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-terracotta hover:bg-terracotta/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>

          {/* Forgot Password Link */}
          {!isSignUp && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowPasswordReset(true)}
                className="text-sm text-terracotta hover:text-terracotta/80"
              >
                Forgot your password?
              </button>
            </div>
          )}
        </form>
        )}

        {/* Password Reset Form */}
        {authMode === 'email' && showPasswordReset && (
          <div className="mt-8 space-y-6">
            {!resetEmailSent ? (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="text-sm font-medium text-blue-800">Reset Your Password</h3>
                  <p className="mt-2 text-sm text-blue-700">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div>
                    <label htmlFor="reset-email" className="block text-sm font-medium text-slate-700">
                      Email Address
                    </label>
                    <input
                      id="reset-email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-terracotta focus:border-terracotta"
                      placeholder="you@example.com"
                    />
                  </div>

                  {error && (
                    <div className="rounded-md bg-red-50 p-4" role="alert" aria-live="polite">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordReset(false);
                        setError('');
                      }}
                      className="flex-1 py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-terracotta hover:bg-terracotta/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">
                        Password Reset Email Sent!
                      </h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>We've sent a password reset link to <strong>{email}</strong></p>
                        <p className="mt-1">Please check your inbox and follow the link to reset your password.</p>
                        <p className="mt-1 text-xs">Didn't receive it? Check your spam folder.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowPasswordReset(false);
                    setResetEmailSent(false);
                    setEmail('');
                    setError('');
                  }}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-terracotta hover:bg-terracotta/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta"
                >
                  Back to Login
                </button>
              </>
            )}
          </div>
        )}

        {/* Email Verification Required Message */}
        {authMode === 'email' && needsVerification && (
          <div className="mt-8 space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">
                    Verify your email for Access to the Bueno Brows App
                  </h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>Please check your email for a verification link and click it to verify your account.</p>
                    <p className="mt-1">After clicking the link, you can return here to sign in.</p>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4" role="alert" aria-live="polite">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResendEmailVerification}
                  disabled={loading}
                  className="text-sm text-terracotta hover:text-terracotta/80 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Resend Verification Email'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setNeedsVerification(false);
                    setUnverifiedEmail('');
                    setError('');
                  }}
                  className="text-sm text-slate-600 hover:text-slate-800"
                >
                  ← Back to login
                </button>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-2">Can't find the email or need to book now?</p>
                <button
                  type="button"
                  onClick={() => nav('/book')}
                  className="text-sm text-terracotta hover:text-terracotta/80 font-medium"
                >
                  Continue as Guest →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Phone Auth Form */}
        {authMode === 'phone' && (
          <>
            {!showVerification ? (
              <form className="mt-8 space-y-6" onSubmit={handlePhoneAuth}>
                {isSignUp && (
                  <>
                    <div>
                      <label htmlFor="phone-name" className="block text-sm font-medium text-slate-700">
                        Full Name
                      </label>
                      <input
                        id="phone-name"
                        name="name"
                        type="text"
                        required={isSignUp}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-terracotta focus:border-terracotta"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone-birthday" className="block text-sm font-medium text-slate-700">
                        Birthday *
                      </label>
                      <input
                        id="phone-birthday"
                        name="birthday"
                        type="date"
                        required={isSignUp}
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-terracotta focus:border-terracotta"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                    Phone Number
                  </label>
                  <div className="flex gap-2 mt-1">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-24 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-terracotta focus:border-terracotta"
                    >
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+81">🇯🇵 +81</option>
                      <option value="+86">🇨🇳 +86</option>
                    </select>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={phone}
                      onChange={handlePhoneChange}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-terracotta focus:border-terracotta"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Enter your phone number with country code
                  </p>
                </div>

                {error && (
            <div className="rounded-md bg-red-50 p-4" role="alert" aria-live="polite">
              <p className="text-sm text-red-800">{error}</p>
            </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-terracotta hover:bg-terracotta/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta disabled:opacity-50"
                >
                  {loading ? 'Sending code...' : 'Send Verification Code'}
                </button>
                <div id="recaptcha-container"></div>
              </form>
            ) : (
              <form className="mt-8 space-y-6" onSubmit={handleVerifyCode}>
                <div>
                  <label htmlFor="verification-code" className="block text-sm font-medium text-slate-700">
                    Verification Code
                  </label>
                  <input
                    id="verification-code"
                    name="code"
                    type="text"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-terracotta focus:border-terracotta"
                    placeholder="123456"
                    maxLength={6}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Enter the 6-digit code sent to {phone}
                  </p>
                </div>

                {error && (
            <div className="rounded-md bg-red-50 p-4" role="alert" aria-live="polite">
              <p className="text-sm text-red-800">{error}</p>
            </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-terracotta hover:bg-terracotta/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowVerification(false);
                    setVerificationCode('');
                    setVerificationId('');
                    setError('');
                    // Reset reCAPTCHA verifier so user can try again
                    if (window.recaptchaVerifier) {
                      try {
                        window.recaptchaVerifier.clear();
                      } catch (e) {
                        console.error('Error clearing reCAPTCHA:', e);
                      }
                      window.recaptchaVerifier = undefined;
                    }
                  }}
                  className="w-full text-sm text-slate-600 hover:text-slate-800"
                >
                  ← Back to phone number
                </button>
              </form>
            )}
          </>
        )}

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="mt-4 w-full flex items-center justify-center gap-3 py-2 px-4 border border-slate-300 rounded-md shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        {authMode === 'email' && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-terracotta hover:text-terracotta/80"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={() => nav('/book')}
            className="text-sm text-slate-600 hover:text-slate-800"
          >
            Continue as guest
          </button>
        </div>
      </div>
    </div>
  );
}

