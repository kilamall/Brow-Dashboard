import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAuth, 
  onAuthStateChanged, 
  updateProfile, 
  updateEmail,
  verifyBeforeUpdateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  linkWithCredential,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  linkWithPhoneNumber,
  sendEmailVerification,
  type User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import ProfilePictureUpload from '../components/ProfilePictureUpload';

// Extend Window interface for reCAPTCHA
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | undefined;
    grecaptcha: any;
  }
}

export default function Profile() {
  const { db } = useFirebase();
  const auth = getAuth();
  const functions = getFunctions();
  const nav = useNavigate();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Profile editing
  const [displayName, setDisplayName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [customerProfilePic, setCustomerProfilePic] = useState('');
  
  // Phone verification
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setDisplayName(currentUser.displayName || '');
        setNewEmail(currentUser.email || '');
        setProfilePictureUrl(currentUser.photoURL || '');
        
        // Load customer profile picture from Firestore
        try {
          const customerRef = doc(db, 'customers', currentUser.uid);
          const customerDoc = await getDoc(customerRef);
          if (customerDoc.exists()) {
            const customerData = customerDoc.data();
            if (customerData.profilePictureUrl) {
              setCustomerProfilePic(customerData.profilePictureUrl);
            }
          }
        } catch (error) {
          console.error('Error loading customer profile:', error);
        }
        
        // Check if user just verified their email
        if (currentUser.emailVerified && localStorage.getItem('pendingEmail')) {
          setSuccess('Email verified successfully! Your account is now fully verified.');
          localStorage.removeItem('pendingEmail');
        }
      } else {
        // Redirect to login if not authenticated
        nav('/login?returnTo=/profile');
      }
    });
    return unsubscribe;
  }, [auth, nav, db]);

  // Setup reCAPTCHA verifier for phone linking
  useEffect(() => {
    // Only setup reCAPTCHA if user is authenticated and we need phone linking
    if (user && !window.recaptchaVerifier) {
      // Create the reCAPTCHA container if it doesn't exist
      let container = document.getElementById('recaptcha-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'recaptcha-container';
        container.style.display = 'none';
        document.body.appendChild(container);
      }
      
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
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          // ignore cleanup errors
        }
        window.recaptchaVerifier = undefined;
      }
    };
  }, [auth, user]);

  const handleUpdateName = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await updateProfile(user, { displayName });
      setSuccess('Name updated successfully!');
      // Refresh user data
      await user.reload();
      setUser({ ...auth.currentUser } as User);
    } catch (err: any) {
      setError(err.message || 'Failed to update name');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureUpdate = async (url: string) => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Update Firebase Auth profile
      await updateProfile(user, { photoURL: url });
      
      // Update customer record in Firestore
      const customerRef = doc(db, 'customers', user.uid);
      await setDoc(customerRef, {
        profilePictureUrl: url,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      
      // Update local state
      setProfilePictureUrl(url);
      setCustomerProfilePic(url);
      
      setSuccess('Profile picture updated successfully!');
      
      // Refresh user data
      await user.reload();
      setUser({ ...auth.currentUser } as User);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile picture');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!user || !newEmail) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // For email changes, we need to use a different approach
      // Since Firebase requires recent authentication, we'll guide the user
      if (newEmail === user.email) {
        setError('This is already your current email address.');
        setLoading(false);
        return;
      }
      
      // Check if user needs to re-authenticate
      const lastSignIn = user.metadata.lastSignInTime;
      const now = new Date();
      const lastSignInTime = new Date(lastSignIn || 0);
      const timeDiff = now.getTime() - lastSignInTime.getTime();
      const hoursSinceSignIn = timeDiff / (1000 * 60 * 60);
      
      if (hoursSinceSignIn > 1) {
        setError('For security, please sign out and sign back in before changing your email. This ensures your account is secure.');
        setLoading(false);
        return;
      }
      
      // Use verifyBeforeUpdateEmail to ensure the new email is verified first
      const actionCodeSettings = {
        url: `${window.location.origin}/profile`,
        handleCodeInApp: false,
      };
      
      await verifyBeforeUpdateEmail(user, newEmail, actionCodeSettings);
      
      // Store pending email in localStorage for success message after verification
      localStorage.setItem('pendingEmail', newEmail);
      
      setSuccess(`Verification email sent to ${newEmail}! Please check your inbox and click the verification link to confirm your new email address.`);
      
      // Refresh user data
      await user.reload();
      setUser({ ...auth.currentUser } as User);
      
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        setError('For security, please sign out and sign back in before changing your email. This ensures your account is secure.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already in use by another account.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many requests. Please wait a few minutes before trying again.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email verification is currently unavailable. Please try again later or contact support.');
      } else {
        setError(err.message || 'Failed to update email');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLinkPhone = async () => {
    if (!user || !newPhone) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Format phone number to E.164 format
      let formattedPhone = newPhone.trim();
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = countryCode + formattedPhone.replace(/\D/g, '');
      }

      const appVerifier = window.recaptchaVerifier;
      if (!appVerifier) {
        throw new Error('reCAPTCHA not initialized');
      }

      const confirmationResult = await linkWithPhoneNumber(user, formattedPhone, appVerifier);
      setVerificationId(confirmationResult.verificationId);
      setShowPhoneVerification(true);
      setSuccess('Verification code sent! Check your phone.');
    } catch (err: any) {
      console.error('Phone linking error:', err);
      if (err.code === 'auth/provider-already-linked') {
        setError('A phone number is already linked to this account.');
      } else if (err.code === 'auth/credential-already-in-use') {
        setError('This phone number is already linked to another account.');
      } else {
        setError(err.message || 'Failed to send verification code');
      }
      
      // Reset reCAPTCHA on error
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

  const handleVerifyPhoneCode = async () => {
    if (!user || !verificationId || !verificationCode) return;
    
    setLoading(true);
    setError('');
    
    try {
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      await linkWithCredential(user, credential);
      setSuccess('Phone number linked successfully!');
      setShowPhoneVerification(false);
      setVerificationCode('');
      setNewPhone('');
      // Refresh user data
      await user.reload();
      setUser({ ...auth.currentUser } as User);
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/verify`,
        handleCodeInApp: false,
      };
      await sendEmailVerification(user, actionCodeSettings);
      setSuccess('Verification email sent! Please check your inbox and click the verification link.');
    } catch (err: any) {
      if (err.code === 'auth/too-many-requests') {
        setError('Too many requests. Please wait a few minutes before trying again.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email verification is not enabled for this account. Please contact support.');
      } else {
        setError(err.message || 'Failed to send verification email');
      }
    } finally {
      setLoading(false);
    }
  };

  // Send email verification for new email using Firebase
  const handleSendEmailVerification = async () => {
    if (!newEmail) {
      setError('Please enter an email address first.');
      return;
    }
    
    if (!user) {
      setError('You must be signed in to change your email. Please sign in and try again.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // For phone-authenticated users without email, use verifyBeforeUpdateEmail
      // This sends a verification email first, then updates the email after verification
      const actionCodeSettings = {
        url: `${window.location.origin}/profile`,
        handleCodeInApp: false,
      };
      
      await verifyBeforeUpdateEmail(user, newEmail, actionCodeSettings);
      
      // Store pending email in localStorage for success message after verification
      localStorage.setItem('pendingEmail', newEmail);
      
      setSuccess('Verification email sent! Please check your inbox and click the verification link to confirm your email address.');
      
    } catch (err: any) {
      console.error('Email verification error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already in use by another account.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/requires-recent-login') {
        setError('Please sign out and sign in again before changing your email.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email verification is currently unavailable. Please try again later or contact support.');
      } else {
        setError(err.message || 'Failed to send verification email');
      }
    } finally {
      setLoading(false);
    }
  };


  const handleSignOut = async () => {
    try {
      await auth.signOut();
      nav('/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign out');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-terracotta/10 to-cream/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => nav('/book')}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Booking
          </button>
          <h1 className="text-3xl font-serif text-terracotta">My Profile</h1>
          <p className="text-slate-600 mt-2">Manage your account information and authentication methods</p>
        </div>

        {/* Email Verification Warning */}
        {user.email && !user.emailVerified && (
          <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 mb-1">Email Not Verified</h3>
                <p className="text-sm text-amber-800 mb-3">
                  Please verify your email address to secure your account and receive important notifications.
                </p>
                <button
                  onClick={handleSendVerificationEmail}
                  disabled={loading}
                  className="text-sm bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {loading ? 'Sending...' : 'Resend Verification Email'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Note: Re-authentication is now handled automatically via idle session timeout */}

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Display Name Section */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Display Name</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
              <button
                onClick={handleUpdateName}
                disabled={loading || displayName === user.displayName}
                className="bg-terracotta text-white px-6 py-2 rounded-lg hover:bg-terracotta/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Updating...' : 'Update Name'}
              </button>
            </div>
          </div>

          {/* Profile Picture Section */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Profile Picture</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-6">
                {/* Current Profile Picture Display */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                    {profilePictureUrl || customerProfilePic ? (
                      <img
                        src={profilePictureUrl || customerProfilePic}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                
                {/* Profile Picture Upload */}
                <div className="flex-1">
                  <ProfilePictureUpload
                    userId={user?.uid}
                    onUploadComplete={handleProfilePictureUpdate}
                    currentImageUrl={profilePictureUrl || customerProfilePic}
                    label="Update Profile Picture"
                    showPreview={false}
                    className=""
                  />
                  <p className="text-sm text-slate-600 mt-2">
                    Your profile picture is used for skin analysis and account identification.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Email Section */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Email Address</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                {user.email && user.emailVerified ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        id="email"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent"
                        placeholder="Enter new email"
                      />
                      <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleUpdateEmail}
                        disabled={loading || newEmail === user.email}
                        className="bg-terracotta text-white px-6 py-2 rounded-lg hover:bg-terracotta/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? 'Sending Verification...' : 'Update Email'}
                      </button>
                    </div>
                  </div>
                ) : user.email ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        id="email"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent"
                        placeholder="Enter new email"
                      />
                      {user.emailVerified ? (
                        <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600 text-sm font-medium">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Not Verified
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleUpdateEmail}
                        disabled={loading || newEmail === user.email}
                        className="bg-terracotta text-white px-6 py-2 rounded-lg hover:bg-terracotta/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? 'Sending Verification...' : 'Update Email'}
                      </button>
                      {!user.emailVerified && (
                        <button
                          onClick={handleSendVerificationEmail}
                          disabled={loading}
                          className="bg-amber-100 text-amber-700 px-6 py-2 rounded-lg hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-amber-300"
                        >
                          {loading ? 'Sending...' : 'Resend Verification Email'}
                        </button>
                      )}
                    </div>
                    {!user.emailVerified && (
                      <p className="text-sm text-slate-600">
                        Please check your email and click the verification link to confirm your email address.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <input
                        id="email"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent"
                        placeholder="Add email address"
                        disabled={false}
                      />
                      
                      <button
                        onClick={handleSendEmailVerification}
                        disabled={loading || !newEmail}
                        className="bg-terracotta text-white px-6 py-2 rounded-lg hover:bg-terracotta/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? 'Sending...' : 'Send Verification Email'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Phone Number Section */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Phone Number</h2>
            <div className="space-y-4">
              {user.phoneNumber ? (
                <div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div>
                        <div className="font-medium text-slate-900">{user.phoneNumber}</div>
                        <div className="text-xs text-slate-500">Primary phone number</div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {!showPhoneVerification ? (
                    <>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                          Add Phone Number
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent"
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
                            type="tel"
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent"
                            placeholder="(555) 123-4567"
                          />
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          Enter your phone number with country code
                        </p>
                      </div>
                      <button
                        onClick={handleLinkPhone}
                        disabled={loading || !newPhone}
                        className="bg-terracotta text-white px-6 py-2 rounded-lg hover:bg-terracotta/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? 'Sending code...' : 'Add Phone Number'}
                      </button>
                      <div id="recaptcha-container"></div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="verification-code" className="block text-sm font-medium text-slate-700 mb-2">
                          Verification Code
                        </label>
                        <input
                          id="verification-code"
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent"
                          placeholder="123456"
                          maxLength={6}
                        />
                        <p className="mt-1 text-xs text-slate-500">
                          Enter the 6-digit code sent to {newPhone}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleVerifyPhoneCode}
                          disabled={loading || !verificationCode}
                          className="bg-terracotta text-white px-6 py-2 rounded-lg hover:bg-terracotta/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {loading ? 'Verifying...' : 'Verify Code'}
                        </button>
                        <button
                          onClick={() => {
                            setShowPhoneVerification(false);
                            setVerificationCode('');
                            setVerificationId('');
                            setError('');
                          }}
                          className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Authentication Providers */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Authentication Methods</h2>
            <div className="space-y-3">
              {user.providerData.map((provider, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {provider.providerId === 'google.com' && (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    )}
                    {provider.providerId === 'password' && (
                      <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    )}
                    {provider.providerId === 'phone' && (
                      <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    )}
                    <div>
                      <div className="font-medium text-slate-900">
                        {provider.providerId === 'google.com' && 'Google'}
                        {provider.providerId === 'password' && 'Email & Password'}
                        {provider.providerId === 'phone' && 'Phone'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {provider.email || provider.phoneNumber || 'Connected'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">Active</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sign Out */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <button
              onClick={handleSignOut}
              className="w-full bg-slate-100 text-slate-700 px-6 py-3 rounded-lg hover:bg-slate-200 transition-colors font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

