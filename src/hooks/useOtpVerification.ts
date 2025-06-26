import { useState } from 'react';

interface OtpVerificationProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useOtpVerification = ({ onSuccess, onError }: OtpVerificationProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);

  const sendOtp = async (identifier: string, type: 'email' | 'phone') => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier, type })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to send verification code');
      }
      
      setSuccess(`Verification code sent to your ${type}`);
      setOtpSent(true);
      
      // For demo purposes only - in production, this would not be returned
      if (data.demo?.otp) {
        setDemoOtp(data.demo.otp);
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send verification code';
      setError(errorMessage);
      onError?.(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (identifier: string, otp: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier, otp })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Invalid verification code');
      }
      
      setSuccess('Verification successful');
      setOtpSent(false);
      onSuccess?.();
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      onError?.(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setIsLoading(false);
    setError(null);
    setSuccess(null);
    setOtpSent(false);
    setDemoOtp(null);
  };

  return {
    isLoading,
    error,
    success,
    otpSent,
    demoOtp,
    sendOtp,
    verifyOtp,
    resetState
  };
};