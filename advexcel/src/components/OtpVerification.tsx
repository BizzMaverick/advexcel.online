import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Copy, RefreshCw } from 'lucide-react';
import { useOtpVerification } from '../hooks/useOtpVerification';

interface OtpVerificationProps {
  identifier: string;
  identifierType: 'email' | 'phone';
  onVerificationSuccess: () => void;
  onCancel: () => void;
}

export const OtpVerification: React.FC<OtpVerificationProps> = ({
  identifier,
  identifierType,
  onVerificationSuccess,
  onCancel
}) => {
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [copied, setCopied] = useState(false);
  
  const {
    isLoading,
    error,
    success,
    demoOtp,
    sendOtp,
    verifyOtp
  } = useOtpVerification({
    onSuccess: onVerificationSuccess
  });

  useEffect(() => {
    // Send OTP when component mounts
    sendOtp(identifier, identifierType);
    startOtpTimer();
  }, [identifier, identifierType]);

  const startOtpTimer = () => {
    setOtpTimer(60);
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    
    const success = await sendOtp(identifier, identifierType);
    if (success) {
      startOtpTimer();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    
    await verifyOtp(identifier, otp);
  };

  const copyOtpToClipboard = () => {
    if (!demoOtp) return;
    
    navigator.clipboard.writeText(demoOtp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Verify Your Account</h2>
      <p className="text-gray-600 mb-6">
        We've sent a verification code to your {identifierType === 'email' ? 'email' : 'phone'}.
        Please enter it below to verify your account.
      </p>

      {/* Demo OTP Display (for development only) */}
      {demoOtp && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">Demo Mode: Verification Code</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Your verification code is: <span className="font-mono font-bold">{demoOtp}</span>
              </p>
              <button
                onClick={copyOtpToClipboard}
                className="mt-2 flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification Code
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
            placeholder="000000"
            maxLength={6}
            required
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-gray-600">
              Enter the 6-digit code sent to your {identifierType === 'email' ? 'email' : 'phone'}
            </p>
            {otpTimer > 0 ? (
              <span className="text-sm text-blue-600">Resend in {otpTimer}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Resend Code</span>
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </form>
    </div>
  );
};