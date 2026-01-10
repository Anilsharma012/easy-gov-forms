import { initializeApp, getApps } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, signOut, AuthErrorCodes } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBgNc51P86jC_zI7zx4Fz6ZViBnhdXVan4",
  authDomain: "easygovform.firebaseapp.com",
  projectId: "easygovform",
  storageBucket: "easygovform.firebasestorage.app",
  messagingSenderId: "223307275816",
  appId: "1:223307275816:web:b12cff12028bcf7a421f1d",
  measurementId: "G-3NH03VKN71"
};

// Initialize Firebase - prevent double initialization
let app;
try {
  const apps = getApps();
  if (apps.length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = apps[0];
  }
} catch (error) {
  console.error('Error initializing Firebase app:', error);
  app = initializeApp(firebaseConfig);
}

// Get Auth instance
export const auth = getAuth(app);

// Ensure auth is properly initialized with required properties
if (typeof window !== 'undefined' && auth) {
  // Set language
  auth.languageCode = 'en';
  
  // Safely ensure settings object exists and has required properties
  if (!auth.settings) {
    Object.defineProperty(auth, 'settings', {
      value: {},
      writable: true,
      enumerable: true,
      configurable: true
    });
  }
  
  // Ensure appVerificationDisabledForTesting is set
  if (!('appVerificationDisabledForTesting' in auth.settings)) {
    auth.settings.appVerificationDisabledForTesting = false;
  }
}

// Helper function to setup reCAPTCHA verifier
export const setupRecaptchaVerifier = (containerId: string) => {
  try {
    // Validate auth exists
    if (!auth) {
      throw new Error('Firebase auth is not initialized. Please reload the page.');
    }

    // Ensure container exists
    let container = document.getElementById(containerId);
    if (!container) {
      const div = document.createElement('div');
      div.id = containerId;
      div.style.display = 'none';
      document.body.appendChild(div);
      container = div;
    }

    // Create and return verifier
    const verifier = new RecaptchaVerifier(
      containerId,
      {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA verification complete');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA token expired');
        },
        'error-callback': () => {
          console.log('reCAPTCHA error');
        }
      },
      auth
    );

    return verifier;
  } catch (error) {
    console.error('reCAPTCHA verifier setup failed:', error);
    throw error;
  }
};

// Helper function to send OTP
export const sendOTP = async (phoneNumber, appVerifier) => {
  try {
    if (!auth) {
      throw new Error('Firebase auth is not initialized');
    }
    
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    return confirmationResult;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

// Helper function to verify OTP
export const verifyOTP = async (confirmationResult, otp) => {
  try {
    const result = await confirmationResult.confirm(otp);
    return result.user;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

// Helper function to get ID token
export const getIdToken = async () => {
  try {
    if (auth && auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
  } catch (error) {
    console.error('Error getting ID token:', error);
  }
  return null;
};

// Helper function to sign out
export const firebaseSignOut = async () => {
  try {
    if (auth) {
      await signOut(auth);
    }
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export default app;
