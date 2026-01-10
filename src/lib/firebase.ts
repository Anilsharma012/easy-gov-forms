import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBgNc51P86jC_zI7zx4Fz6ZViBnhdXVan4",
  authDomain: "easygovform.firebaseapp.com",
  projectId: "easygovform",
  storageBucket: "easygovform.firebasestorage.app",
  messagingSenderId: "223307275816",
  appId: "1:223307275816:web:b12cff12028bcf7a421f1d",
  measurementId: "G-3NH03VKN71"
};

// Initialize Firebase
let app;
let authInstance;

try {
  app = initializeApp(firebaseConfig);
  authInstance = getAuth(app);
  
  // Force auth to be ready and properly configured
  authInstance.settings = authInstance.settings || {};
  if (!authInstance.settings.hasOwnProperty('appVerificationDisabledForTesting')) {
    authInstance.settings.appVerificationDisabledForTesting = false;
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Initialize Firebase Authentication
export const auth = authInstance;

// Helper function to setup reCAPTCHA verifier
export const setupRecaptchaVerifier = (containerId: string) => {
  try {
    if (!auth) {
      throw new Error('Firebase auth is not initialized');
    }

    // Check if container exists
    let container = document.getElementById(containerId);
    if (!container) {
      // Create container if it doesn't exist
      const div = document.createElement('div');
      div.id = containerId;
      div.style.display = 'none';
      document.body.appendChild(div);
    }

    // Ensure auth has required properties
    if (auth.settings && typeof auth.settings === 'object') {
      if (!auth.settings.appVerificationDisabledForTesting) {
        auth.settings.appVerificationDisabledForTesting = false;
      }
    }

    const verifier = new RecaptchaVerifier(containerId, {
      size: 'invisible',
      callback: (response) => {
        console.log('reCAPTCHA verified');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
      },
    }, auth);

    console.log('reCAPTCHA verifier created successfully');
    return verifier;
  } catch (error) {
    console.error('Failed to setup reCAPTCHA verifier:', error);
    throw error;
  }
};

// Helper function to sign in with phone number
export const sendOTP = async (phoneNumber, appVerifier) => {
  try {
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
  if (auth && auth.currentUser) {
    return await auth.currentUser.getIdToken();
  }
  return null;
};

// Helper function to sign out
export const firebaseSignOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export default app;
