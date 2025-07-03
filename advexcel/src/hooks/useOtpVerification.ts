import { useState } from 'react';
import { EnvironmentService } from '../utils/environmentService';

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

  const API_BASE = EnvironmentService.getApiBaseUrl();

  const sendOtp = async (identifier: string, type: 'email' | 'phone') => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // First try the Netlify function endpoint
      try {
        const response = await fetch('/.netlify/functions/send-otp', {
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
      } catch (netlifyError) {
        console.warn('Netlify function failed, trying API endpoint:', netlifyError);
        
        // Try the main API endpoint
        const response = await fetch(`${API_BASE}/api/send-otp`, {
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
        
        // For demo purposes only
        if (data.demo?.otp) {
          setDemoOtp(data.demo.otp);
        }
        
        return true;
      }
    } catch (err) {
      // If both API calls fail, fall back to local storage for demo
      console.warn('All API calls failed, using local fallback for OTP');
      
      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store in localStorage for demo purposes
      localStorage.setItem(`otp_${identifier}`, JSON.stringify({
        code: otp,
        timestamp: Date.now(),
        attempts: 0
      }));
      
      setDemoOtp(otp);
      setSuccess(`Verification code sent to your ${type} (demo mode)`);
      setOtpSent(true);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to send verification code';
      console.error(errorMessage);
      
      return true; // Return success for demo purposes
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (identifier: string, otp: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // First try the Netlify function endpoint
      try {
        const response = await fetch('/.netlify/functions/verify-otp', {
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
        // trialExpiresAt is not available in local fallback
        onSuccess?.();
        return true;
      } catch (netlifyError) {
        console.warn('Netlify function failed, trying API endpoint:', netlifyError);
        
        // Try the main API endpoint
        const response = await fetch(`${API_BASE}/api/verify-otp`, {
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
        // trialExpiresAt is not available in local fallback
        onSuccess?.();
        return true;
      }
    } catch (err) {
      // If both API calls fail, fall back to local storage for demo
      console.warn('All API calls failed, using local fallback for OTP verification');
      
      try {
        const storedData = localStorage.getItem(`otp_${identifier}`);
        
        if (!storedData) {
          throw new Error('Verification code expired or not found');
        }
        
        const { code, timestamp, attempts } = JSON.parse(storedData);
        
        // Check if OTP is expired (5 minutes)
        if (Date.now() - timestamp > 5 * 60 * 1000) {
          localStorage.removeItem(`otp_${identifier}`);
          throw new Error('Verification code has expired');
        }
        
        // Check attempts limit
        if (attempts >= 3) {
          localStorage.removeItem(`otp_${identifier}`);
          throw new Error('Too many failed attempts');
        }
        
        // Verify OTP
        if (otp !== code) {
          // Increment attempts
          localStorage.setItem(`otp_${identifier}`, JSON.stringify({
            code,
            timestamp,
            attempts: attempts + 1
          }));
          
          throw new Error(`Invalid verification code. ${2 - attempts} attempts remaining.`);
        }
        
        // OTP verified successfully
        localStorage.removeItem(`otp_${identifier}`);
        
        // Update user verification status in localStorage
        const userKey = `user_${identifier}`;
        const userData = localStorage.getItem(userKey);
        if (userData) {
          const { user, hashedPassword } = JSON.parse(userData);
          user.isVerified = true;
          localStorage.setItem(userKey, JSON.stringify({ user, hashedPassword }));
        }
        
        setSuccess('Verification successful');
        setOtpSent(false);
        // trialExpiresAt is not available in local fallback
        onSuccess?.();
        
        return true;
      } catch (localError) {
        const errorMessage = localError instanceof Error ? localError.message : 'Verification failed';
        setError(errorMessage);
        onError?.(errorMessage);
        return false;
      }
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