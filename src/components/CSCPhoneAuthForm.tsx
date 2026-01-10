import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Loader2, CheckCircle2 } from 'lucide-react';
import { useCSCPhoneAuth } from '@/hooks/useCSCPhoneAuth';

interface CSCPhoneAuthFormProps {
  mode?: 'login' | 'signup';
  onSuccess?: (idToken: string, firebaseUser: any, phoneNumber: string) => void;
  onError?: (error: string) => void;
  onToggleMode?: () => void;
}

const CSCPhoneAuthForm = ({
  mode = 'login',
  onSuccess,
  onError,
  onToggleMode,
}: CSCPhoneAuthFormProps) => {
  const {
    phoneNumber,
    otp,
    otpSent,
    isLoading,
    error,
    sendCSCPhoneOTP,
    verifyCSCPhoneOTP,
  } = useCSCPhoneAuth();

  const [localPhone, setLocalPhone] = useState('');
  const [localOtp, setLocalOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [currentMode, setCurrentMode] = useState<'login' | 'signup'>(mode);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  // Timer for resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recaptchaContainerRef.current) return;

    const success = await sendCSCPhoneOTP(
      localPhone,
      recaptchaContainerRef.current.id,
      currentMode
    );

    if (success) {
      setResendTimer(60);
    } else if (onError) {
      onError(error || 'Failed to send OTP');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await verifyCSCPhoneOTP(localOtp);

    if (result?.idToken) {
      if (onSuccess) {
        onSuccess(result.idToken, result.user);
      }
    } else if (onError) {
      onError(error || 'Failed to verify OTP');
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    if (!recaptchaContainerRef.current) return;

    const success = await sendCSCPhoneOTP(
      phoneNumber,
      recaptchaContainerRef.current.id,
      currentMode
    );

    if (success) {
      setResendTimer(60);
    }
  };

  const handleToggleMode = () => {
    const newMode = currentMode === 'login' ? 'signup' : 'login';
    setCurrentMode(newMode);
    setLocalPhone('');
    setLocalOtp('');
    if (onToggleMode) {
      onToggleMode();
    }
  };

  const modeTitle = currentMode === 'login' ? 'CSC Center Login' : 'CSC Center Sign Up';
  const modeDescription =
    currentMode === 'login'
      ? 'Sign in with your mobile number to access your dashboard'
      : 'Create your CSC account with your mobile number';

  if (otpSent) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Verify OTP</CardTitle>
          <CardDescription>
            We've sent a 6-digit OTP to {phoneNumber}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <div className="relative">
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                  value={localOtp}
                  onChange={(e) => setLocalOtp(e.target.value.replace(/\D/g, ''))}
                  disabled={isLoading}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <Button
              type="submit"
              disabled={isLoading || localOtp.length !== 6}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Verify OTP
                </>
              )}
            </Button>

            <div className="space-y-2 text-center">
              <p className="text-sm text-muted-foreground">Didn't receive OTP?</p>
              <Button
                type="button"
                variant="outline"
                onClick={handleResendOTP}
                disabled={resendTimer > 0 || isLoading}
                className="w-full"
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{modeTitle}</CardTitle>
        <CardDescription>{modeDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSendOTP} className="space-y-6">
          <div
            ref={recaptchaContainerRef}
            id="csc-recaptcha-container"
            className="mb-4"
          />

          <div className="space-y-2">
            <Label htmlFor="csc-phone">Mobile Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="csc-phone"
                type="tel"
                placeholder="Enter 10-digit mobile number"
                className="pl-10"
                value={localPhone}
                onChange={(e) => setLocalPhone(e.target.value.replace(/\D/g, ''))}
                maxLength={10}
                disabled={isLoading}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Format: 10-digit mobile number (e.g., 9876543210)
            </p>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <Button
            type="submit"
            disabled={isLoading || localPhone.length !== 10}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending OTP...
              </>
            ) : (
              <>
                <Phone className="mr-2 h-4 w-4" />
                Send OTP
              </>
            )}
          </Button>

          {currentMode === 'login' && (
            <div className="space-y-2 text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">New to CSC Partner Portal?</p>
              <Button
                type="button"
                variant="outline"
                onClick={handleToggleMode}
                className="w-full"
              >
                Create an Account
              </Button>
            </div>
          )}

          {currentMode === 'signup' && (
            <div className="space-y-2 text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">Already have an account?</p>
              <Button
                type="button"
                variant="outline"
                onClick={handleToggleMode}
                className="w-full"
              >
                Sign In Instead
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default CSCPhoneAuthForm;
