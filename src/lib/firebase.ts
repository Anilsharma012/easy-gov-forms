import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDKTpH_XqNwPH9w_X9Z9X9Z9X9Z9X9Z9X8",
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
  // Enable app verification for testing (if needed)
  authInstance.settings.appVerificationDisabledForTesting = false;
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Initialize Firebase Authentication
export const auth = authInstance as any;

// Helper function to setup reCAPTCHA verifier
export const setupRecaptchaVerifier = (containerId: string) => {
  try {
    // Check if container exists
    const container = document.getElementById(containerId);
    if (!container) {
      // Create container if it doesn't exist
      const div = document.createElement('div');
      div.id = containerId;
      div.style.display = 'none';
      document.body.appendChild(div);
    }

    return new RecaptchaVerifier(containerId, {
      size: 'invisible',
      callback: (response: any) => {
        console.log('reCAPTCHA verified:', response);
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
      },
    }, auth);
  } catch (error: any) {
    console.error('Failed to setup reCAPTCHA verifier:', error);
    throw error;
  }
};

// Helper function to sign in with phone number
export const sendOTP = async (phoneNumber: string, appVerifier: RecaptchaVerifier) => {
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    return confirmationResult;
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

// Helper function to verify OTP
export const verifyOTP = async (confirmationResult: any, otp: string) => {
  try {
    const result = await confirmationResult.confirm(otp);
    return result.user;
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

// Helper function to get ID token
export const getIdToken = async () => {
  if (auth.currentUser) {
    return await auth.currentUser.getIdToken();
  }
  return null;
};

// Helper function to sign out
export const firebaseSignOut = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export default app;
