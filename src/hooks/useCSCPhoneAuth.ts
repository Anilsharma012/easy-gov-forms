import { useState, useRef } from 'react';
import { auth, setupRecaptchaVerifier, sendOTP, verifyOTP, getIdToken } from '@/lib/firebase';
import { RecaptchaVerifier } from 'firebase/auth';

export interface CSCPhoneAuthState {
  phoneNumber: string;
  otp: string;
  otpSent: boolean;
  isLoading: boolean;
  error: string | null;
  confirmationResult: any;
  authMode: 'login' | 'signup';
}

export const useCSCPhoneAuth = () => {
  const [state, setState] = useState<CSCPhoneAuthState>({
    phoneNumber: '',
    otp: '',
    otpSent: false,
    isLoading: false,
    error: null,
    confirmationResult: null,
    authMode: 'login',
  });

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  const initializeRecaptcha = (containerId: string) => {
    try {
      // Clear previous verifier if it exists
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {
          console.warn('Error clearing previous verifier:', e);
        }
        recaptchaVerifierRef.current = null;
      }

      recaptchaVerifierRef.current = setupRecaptchaVerifier(containerId);
      return recaptchaVerifierRef.current;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to initialize reCAPTCHA. Please refresh the page.',
      }));
      throw error;
    }
  };

  const sendCSCPhoneOTP = async (
    phoneNumber: string,
    recaptchaContainerId: string,
    mode: 'login' | 'signup' = 'login'
  ) => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      authMode: mode,
    }));

    try {
      // Validate phone number format (Indian phone number)
      const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
      if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
        throw new Error('Please enter a valid phone number');
      }

      // Format phone number with country code
      const formattedPhoneNumber = phoneNumber.startsWith('+91') 
        ? phoneNumber 
        : '+91' + phoneNumber.replace(/^91/, '');

      // Initialize reCAPTCHA if not already done
      const verifier = initializeRecaptcha(recaptchaContainerId);

      // Send OTP
      const confirmationResult = await sendOTP(formattedPhoneNumber, verifier);

      setState((prev) => ({
        ...prev,
        phoneNumber: formattedPhoneNumber,
        otpSent: true,
        confirmationResult,
        isLoading: false,
      }));

      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send OTP. Please try again.';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return false;
    }
  };

  const verifyCSCPhoneOTP = async (otp: string) => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      if (!state.confirmationResult) {
        throw new Error('OTP session expired. Please request a new OTP.');
      }

      const user = await verifyOTP(state.confirmationResult, otp);
      const idToken = await getIdToken();

      setState((prev) => ({
        ...prev,
        otp,
        isLoading: false,
      }));

      return { user, idToken, mode: state.authMode };
    } catch (error: any) {
      const errorMessage = error.message || 'Invalid OTP. Please try again.';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return null;
    }
  };

  const resetAuth = () => {
    setState({
      phoneNumber: '',
      otp: '',
      otpSent: false,
      isLoading: false,
      error: null,
      confirmationResult: null,
      authMode: 'login',
    });
    recaptchaVerifierRef.current = null;
  };

  return {
    ...state,
    sendCSCPhoneOTP,
    verifyCSCPhoneOTP,
    resetAuth,
    initializeRecaptcha,
  };
};
