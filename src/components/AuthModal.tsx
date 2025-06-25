import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, Lock, Eye, EyeOff, Shield, CheckCircle, AlertCircle, Copy, RefreshCw, Gift, Users, Clock, Crown } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { useAuth } from '../hooks/useAuth';
import { SignupData, LoginCredentials } from '../types/auth';
import { ReferralService } from '../utils/referralService';
import { DeviceService } from '../utils/deviceService';
import { SecurityService } from '../utils/securityService';
import { AuthService } from '../utils/authService';
import 'react-phone-number-input/style.css';

interface AuthModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

type AuthMode = 'login' | 'signup' | 'otp' | 'forgot-password' | 'reset-password' | 'mfa';
type IdentifierType = 'email' | 'phone';

export const AuthModal: React.FC<AuthModalProps> = ({ isVisible, onClose, onAuthSuccess }) => {
  const { login, register, error: authError, clearError } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [identifierType, setIdentifierType] = useState<IdentifierType>('email');
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    confirmPassword: '',
    otp: '',
    mfaCode: '',
    referralCode: '',
    firstName: '',
    lastName: '',
    company: '',
    acceptTerms: false,
    rememberDevice: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [demoOTP, setDemoOTP] = useState('');
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    // Generate CSRF token
    const token = SecurityService.generateCSRFToken();
    setCsrfToken(token);
    
    // Clear errors when modal opens/closes
    if (isVisible) {
      setError('');
      clearError();
    }
  }, [isVisible, clearError]);

  useEffect(() => {
    // Set error from auth hook
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    try {
      return isValidPhoneNumber(phone);
    } catch {
      return false;
    }
  };

  const validateIdentifier = () => {
    if (identifierType === 'email') {
      return validateEmail(formData.identifier);
    } else {
      return validatePhone(formData.identifier);
    }
  };

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

  const sendOTP = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await AuthService.sendOTP(formData.identifier, identifierType);
      
      if (result.success) {
        setSuccess(result.message);
        startOtpTimer();
        
        // For demo purposes, retrieve the OTP that was generated
        const storedData = localStorage.getItem(`otp_${formData.identifier}`);
        if (storedData) {
          const { code } = JSON.parse(storedData);
          setDemoOTP(code);
        }
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyOTPToClipboard = () => {
    navigator.clipboard.writeText(demoOTP);
    setSuccess('Code copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        if (!validateIdentifier()) {
          throw new Error(`Please enter a valid ${identifierType}`);
        }
        if (!formData.password) {
          throw new Error('Password is required');
        }

        const credentials: LoginCredentials = {
          identifier: formData.identifier,
          password: formData.password,
          rememberDevice: formData.rememberDevice
        };

        const result = await login(credentials);
        
        if (result.success && result.user) {
          onAuthSuccess(result.user);
          onClose();
        } else if (result.requiresMFA) {
          setMode('mfa');
        } else {
          throw new Error(result.message || 'Login failed');
        }
      } else if (mode === 'signup') {
        if (!validateIdentifier()) {
          throw new Error(`Please enter a valid ${identifierType}`);
        }
        if (formData.password.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (!formData.acceptTerms) {
          throw new Error('You must accept the terms and conditions');
        }

        // Validate referral code if provided
        if (formData.referralCode) {
          const referralValidation = ReferralService.validateReferralCode(formData.referralCode);
          if (!referralValidation.valid) {
            throw new Error(referralValidation.message);
          }
        }

        const signupData: SignupData = {
          identifier: formData.identifier,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          firstName: formData.firstName,
          lastName: formData.lastName,
          company: formData.company,
          acceptTerms: formData.acceptTerms
        };

        const result = await register(signupData);
        
        if (result.success) {
          await sendOTP();
          setMode('otp');
        } else {
          throw new Error(result.message || 'Registration failed');
        }
      } else if (mode === 'mfa') {
        if (!formData.mfaCode) {
          throw new Error('Please enter your MFA code');
        }

        // In a real app, verify MFA code with backend
        const credentials: LoginCredentials = {
          identifier: formData.identifier,
          password: formData.password,
          mfaCode: formData.mfaCode,
          rememberDevice: formData.rememberDevice
        };

        const result = await login(credentials);
        
        if (result.success && result.user) {
          onAuthSuccess(result.user);
          onClose();
        } else {
          throw new Error(result.message || 'MFA verification failed');
        }
      } else if (mode === 'otp') {
        if (formData.otp.length !== 6) {
          throw new Error('Please enter a valid 6-digit verification code');
        }

        // Verify OTP
        const result = await AuthService.verifyOTP(formData.identifier, formData.otp);
        
        if (!result.success) {
          throw new Error(result.message);
        }

        // OTP verified, proceed with login
        const credentials: LoginCredentials = {
          identifier: formData.identifier,
          password: formData.password,
          rememberDevice: formData.rememberDevice
        };

        const loginResult = await login(credentials);
        
        if (loginResult.success && loginResult.user) {
          // Apply referral code if provided
          if (formData.referralCode) {
            ReferralService.applyReferralCode(formData.referralCode, loginResult.user.id);
          }
          
          onAuthSuccess(loginResult.user);
          onClose();
        } else {
          throw new Error(loginResult.message || 'Login failed after verification');
        }
      } else if (mode === 'forgot-password') {
        if (!validateIdentifier()) {
          throw new Error(`Please enter a valid ${identifierType}`);
        }

        await sendOTP();
        setMode('reset-password');
      } else if (mode === 'reset-password') {
        if (formData.otp.length !== 6) {
          throw new Error('Please enter a valid 6-digit verification code');
        }
        if (formData.password.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        // Verify OTP
        const otpResult = await AuthService.verifyOTP(formData.identifier, formData.otp);
        
        if (!otpResult.success) {
          throw new Error(otpResult.message);
        }

        // In a real app, reset password with backend
        // For demo, we'll simulate password reset
        const user = await AuthService['findUserByIdentifier'](formData.identifier);
        if (user) {
          const hashedPassword = await CryptoService.hashPassword(formData.password);
          await AuthService['storeUser'](user, hashedPassword);
          
          setSuccess('Password reset successfully!');
          setTimeout(() => {
            setMode('login');
            resetForm();
          }, 1000);
        } else {
          throw new Error('User not found');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      identifier: '',
      password: '',
      confirmPassword: '',
      otp: '',
      mfaCode: '',
      referralCode: '',
      firstName: '',
      lastName: '',
      company: '',
      acceptTerms: false,
      rememberDevice: true
    });
    setError('');
    setSuccess('');
    setOtpTimer(0);
    setDemoOTP('');
    setShowReferralInput(false);
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    clearError();
    setError('');
    setSuccess('');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {mode === 'login' ? 'Welcome Back' :
               mode === 'signup' ? 'Create Account' :
               mode === 'otp' ? 'Verify Account' :
               mode === 'mfa' ? 'Two-Factor Authentication' :
               mode === 'forgot-password' ? 'Forgot Password' :
               'Reset Password'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Free Trial & Subscription Info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Crown className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">🎉 Start Your Free Trial!</h3>
                <div className="text-xs text-blue-700 mt-1 space-y-1">
                  <p>• <strong>5 days FREE</strong> access to all premium features</p>
                  <p>• After trial: ₹49/day, ₹1,199/month, or ₹12,999/year</p>
                  <p>• Cancel anytime during trial period</p>
                  <p>• One account per device for security</p>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Clock className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-medium text-blue-800">Trial starts immediately after verification</span>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-green-800">Privacy Protected</h3>
                <p className="text-xs text-green-700 mt-1">
                  We don't store your data. All processing happens locally in your browser for maximum security.
                </p>
              </div>
            </div>
          </div>

          {/* Demo Notice for OTP */}
          {(mode === 'otp' || mode === 'reset-password' || mode === 'mfa') && demoOTP && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-800">Demo Mode - Code Generated</h3>
                  <p className="text-xs text-blue-700 mt-1">
                    For demo purposes, your code is: <strong className="font-mono text-lg">{demoOTP}</strong>
                  </p>
                  <button
                    onClick={copyOTPToClipboard}
                    className="mt-2 flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy Code</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* CSRF Token (hidden) */}
            <input type="hidden" name="csrfToken" value={csrfToken} />

            {/* Identifier Type Toggle */}
            {(mode === 'login' || mode === 'signup' || mode === 'forgot-password') && (
              <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
                <button
                  type="button"
                  onClick={() => setIdentifierType('email')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    identifierType === 'email'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIdentifierType('phone')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    identifierType === 'phone'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Phone className="h-4 w-4" />
                  <span>Phone</span>
                </button>
              </div>
            )}

            {/* Identifier Input */}
            {(mode === 'login' || mode === 'signup' || mode === 'forgot-password') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {identifierType === 'email' ? 'Email Address' : 'Phone Number'}
                </label>
                {identifierType === 'email' ? (
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.identifier}
                      onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                ) : (
                  <PhoneInput
                    value={formData.identifier}
                    onChange={(value) => setFormData({ ...formData, identifier: value || '' })}
                    defaultCountry="IN"
                    className="w-full"
                    numberInputProps={{
                      className: 'w-full pl-16 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    }}
                  />
                )}
              </div>
            )}

            {/* Name Fields (Signup only) */}
            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Last name"
                  />
                </div>
              </div>
            )}

            {/* Company (Signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company (Optional)
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your company name"
                />
              </div>
            )}

            {/* Password Input */}
            {(mode === 'login' || mode === 'signup' || mode === 'reset-password') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {mode === 'reset-password' ? 'New Password' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <div className="mt-1">
                    <div className="flex items-center space-x-1">
                      <div className={`h-1 flex-1 rounded-full ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div className={`h-1 flex-1 rounded-full ${/[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div className={`h-1 flex-1 rounded-full ${/[0-9]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div className={`h-1 flex-1 rounded-full ${/[^A-Za-z0-9]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Password must be at least 8 characters and include uppercase, numbers, and special characters
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Confirm Password Input */}
            {(mode === 'signup' || mode === 'reset-password') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Terms and Conditions (Signup only) */}
            {mode === 'signup' && (
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  required
                />
                <label htmlFor="acceptTerms" className="text-sm text-gray-600">
                  I agree to the <a href="#terms" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
                </label>
              </div>
            )}

            {/* Remember Device */}
            {(mode === 'login' || mode === 'mfa') && (
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="rememberDevice"
                  checked={formData.rememberDevice}
                  onChange={(e) => setFormData({ ...formData, rememberDevice: e.target.checked })}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberDevice" className="text-sm text-gray-600">
                  Remember this device for 30 days
                </label>
              </div>
            )}

            {/* Referral Code Input */}
            {mode === 'signup' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Referral Code (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowReferralInput(!showReferralInput)}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                  >
                    <Gift className="h-3 w-3" />
                    <span>Have a referral code?</span>
                  </button>
                </div>
                {showReferralInput && (
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.referralCode}
                      onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter referral code"
                      maxLength={8}
                    />
                  </div>
                )}
                {showReferralInput && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Gift className="h-4 w-4 text-yellow-600" />
                      <span className="text-xs font-medium text-yellow-800">Referral Benefits</span>
                    </div>
                    <p className="text-xs text-yellow-700 mt-1">
                      Get extra trial days when someone uses your referral code to make a purchase!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* OTP Input */}
            {mode === 'otp' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-gray-600">
                    Enter the 6-digit code sent to your {identifierType}
                  </p>
                  {otpTimer > 0 ? (
                    <span className="text-sm text-blue-600">Resend in {otpTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={sendOTP}
                      disabled={isLoading}
                      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Resend Code</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* MFA Input */}
            {mode === 'mfa' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Two-Factor Authentication Code
                </label>
                <input
                  type="text"
                  value={formData.mfaCode}
                  onChange={(e) => setFormData({ ...formData, mfaCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <p className="text-sm text-gray-600 mt-2">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            )}

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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <span>
                  {mode === 'login' ? 'Sign In & Start Free Trial' :
                   mode === 'signup' ? 'Create Account & Start Trial' :
                   mode === 'otp' ? 'Verify & Activate Trial' :
                   mode === 'mfa' ? 'Verify & Continue' :
                   mode === 'forgot-password' ? 'Send Reset Code' :
                   'Reset Password'}
                </span>
              )}
            </button>

            {/* Mode Switching */}
            <div className="text-center space-y-2">
              {mode === 'login' && (
                <>
                  <button
                    type="button"
                    onClick={() => switchMode('forgot-password')}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Forgot your password?
                  </button>
                  <div className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('signup')}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Sign up for free trial
                    </button>
                  </div>
                </>
              )}
              {mode === 'signup' && (
                <div className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Sign in
                  </button>
                </div>
              )}
              {(mode === 'forgot-password' || mode === 'reset-password' || mode === 'mfa') && (
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Back to sign in
                </button>
              )}
              {mode === 'otp' && (
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Change details
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};