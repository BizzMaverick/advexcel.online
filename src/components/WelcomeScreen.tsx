import React, { useState, useEffect } from 'react';
import { Upload, Zap, Shield, Star, Users, CheckCircle, ArrowRight, Play, HelpCircle, Target, Award, Plus, Mail, Phone, Lock, Eye, EyeOff, Gift } from 'lucide-react';
import { Logo } from './Logo';
import { useAuthContext } from '../context/AuthContext';
import PhoneInput from 'react-phone-number-input';
import { isValidPhoneNumber } from 'libphonenumber-js';
import 'react-phone-number-input/style.css';

interface WelcomeScreenProps {
  onImportFile: () => void;
  onCreateNewSheet: () => void;
  isLoading: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onImportFile, onCreateNewSheet, isLoading }) => {
  const { login, register, isAuthenticated, error: authError, clearError } = useAuthContext();
  
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [identifierType, setIdentifierType] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    company: '',
    acceptTerms: false,
    rememberDevice: true,
    referralCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Calculate password strength
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    
    // Length check
    if (formData.password.length >= 8) strength += 25;
    
    // Contains uppercase
    if (/[A-Z]/.test(formData.password)) strength += 25;
    
    // Contains number
    if (/[0-9]/.test(formData.password)) strength += 25;
    
    // Contains special character
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 25;
    
    setPasswordStrength(strength);
  }, [formData.password]);

  useEffect(() => {
    // Clear errors when auth mode changes
    setError('');
    clearError();
  }, [authMode, clearError]);

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

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    clearError();
    
    if (!validateIdentifier()) {
      setError(`Please enter a valid ${identifierType}`);
      return;
    }

    setIsAuthLoading(true);

    try {
      if (authMode === 'login') {
        if (!formData.password) {
          throw new Error('Password is required');
        }

        const result = await login({
          identifier: formData.identifier,
          password: formData.password,
          rememberDevice: formData.rememberDevice
        });

        if (!result.success) {
          throw new Error(result.message || 'Login failed');
        }

        setSuccess('Login successful!');
      } else {
        if (formData.password.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }
        if (passwordStrength < 75) {
          throw new Error('Password is too weak. Include uppercase letters, numbers, and special characters.');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (!formData.acceptTerms) {
          throw new Error('You must accept the terms and conditions');
        }

        const result = await register({
          identifier: formData.identifier,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          firstName: formData.firstName,
          lastName: formData.lastName,
          company: formData.company,
          acceptTerms: formData.acceptTerms
        });

        if (!result.success) {
          throw new Error(result.message || 'Registration failed');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const features = [
    {
      icon: HelpCircle,
      title: 'Natural Language Commands',
      description: 'Use simple English to manipulate data: "add data value 100 to cell A1", "apply formula", "format cells"',
      color: 'text-cyan-600 bg-cyan-100',
      benefits: ['No complex formulas needed', 'Instant data manipulation', 'Plain English commands']
    },
    {
      icon: Target,
      title: 'Advanced Analytics',
      description: 'Automatic trend analysis, correlation detection, and outlier identification',
      color: 'text-blue-600 bg-blue-100',
      benefits: ['AI-powered insights', 'Statistical analysis', 'Predictive forecasting']
    },
    {
      icon: Award,
      title: 'Smart Forecasting',
      description: 'Generate predictions and forecasts based on your data patterns',
      color: 'text-purple-600 bg-purple-100',
      benefits: ['Future trend prediction', 'Business planning', 'Risk assessment']
    },
    {
      icon: Users,
      title: 'Full Excel Functionality',
      description: 'Complete Excel features with formulas, conditional formatting, pivot tables, and more',
      color: 'text-orange-600 bg-orange-100',
      benefits: ['200+ Excel functions', 'Advanced formulas', 'Data manipulation']
    }
  ];

  const supportedFormats = [
    { format: 'Excel', extensions: '.xlsx, .xls, .xlsm, .xlsb', icon: '📊' },
    { format: 'CSV', extensions: '.csv', icon: '📄' },
    { format: 'OpenDocument', extensions: '.ods', icon: '📋' },
    { format: 'PDF', extensions: '.pdf', icon: '📕' },
    { format: 'Word', extensions: '.doc, .docx', icon: '📝' },
    { format: 'Text', extensions: '.txt', icon: '📃' }
  ];

  const steps = [
    {
      number: "1",
      title: "Create or Import Data",
      description: "Start with a new sheet or upload Excel, CSV, PDF, Word documents, or other supported formats",
      details: "Create from templates or drag and drop your files. We support all major spreadsheet formats plus document conversion.",
      icon: Upload,
      color: "from-cyan-500 to-blue-500"
    },
    {
      number: "2", 
      title: "Use Natural Language Commands",
      description: "Manipulate data with simple English commands - no complex formulas required",
      details: "Type commands like 'add data value 100 to cell A1' or 'apply formula =SUM(A1:A10) to cell B1'.",
      icon: HelpCircle,
      color: "from-blue-500 to-purple-500"
    },
    {
      number: "3",
      title: "Get AI-Powered Insights",
      description: "Receive instant analytics, visualizations, and actionable insights",
      details: "View charts, pivot tables, statistical analysis, and forecasts generated automatically from your data.",
      icon: Target,
      color: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex flex-col">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <Logo size="lg" />
            <div>
              <h1 className="text-2xl font-bold text-white">Excel Pro AI</h1>
              <p className="text-sm text-slate-300">Advanced spreadsheet analysis with AI-powered insights</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row items-start justify-center p-6">
        {/* Left Side - Features */}
        <div className="w-full md:w-1/2 max-w-2xl mb-10 md:mb-0 md:pr-8 self-start">
          <div className="text-center md:text-left mb-8">
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              Create & Analyze Spreadsheets with
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> AI Power</span>
            </h2>
            <p className="text-xl text-slate-300 leading-relaxed">
              Create new Excel sheets, import existing files, and manipulate data using natural language commands. 
              Apply formulas, conditional formatting, and advanced analytics - all while keeping your data 100% private and secure.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mb-8">
            <div className="flex items-center space-x-2 text-cyan-400">
              <Shield className="h-5 w-5" />
              <span className="font-medium">Privacy First</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-400">
              <Users className="h-5 w-5" />
              <span className="font-medium">10,000+ Users</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-400">
              <Zap className="h-5 w-5" />
              <span className="font-medium">AI Powered</span>
            </div>
          </div>

          {/* Supported Formats */}
          <div className="mb-8">
            <p className="text-sm text-slate-400 mb-3 font-medium text-center md:text-left">Supported formats:</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              {supportedFormats.map((format, index) => (
                <span key={index} className="px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full text-xs border border-white/20 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-2">
                  <span className="text-lg">{format.icon}</span>
                  <div>
                    <strong className="text-white">{format.format}</strong> 
                    <span className="text-slate-400 ml-1">{format.extensions}</span>
                  </div>
                </span>
              ))}
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 mb-8">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-green-400 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-white">100% Private & Secure</h3>
                <p className="text-sm text-slate-300">
                  All data processing happens locally in your browser. Your files never leave your device.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full md:w-1/2 max-w-md self-start">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </h3>
              <p className="text-slate-300">
                {authMode === 'login' 
                  ? 'Sign in to access your account and start your free trial' 
                  : 'Create an account to start your free 5-day trial'}
              </p>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {/* Identifier Type Toggle */}
              <div className="flex bg-white/5 rounded-lg p-1 mb-4">
                <button
                  type="button"
                  onClick={() => setIdentifierType('email')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    identifierType === 'email'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white'
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
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Phone className="h-4 w-4" />
                  <span>Phone</span>
                </button>
              </div>

              {/* Identifier Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {identifierType === 'email' ? 'Email Address' : 'Phone Number'}
                </label>
                {identifierType === 'email' ? (
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="email"
                      value={formData.identifier}
                      onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-slate-400"
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
                      className: 'w-full pl-16 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-slate-400'
                    }}
                  />
                )}
              </div>

              {/* Name Fields (Signup only) */}
              {authMode === 'signup' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-slate-400"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-slate-400"
                      placeholder="Last name"
                    />
                  </div>
                </div>
              )}

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-slate-400"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {authMode === 'signup' && (
                  <div className="mt-1">
                    <div className="flex items-center space-x-1">
                      <div className={`h-1 flex-1 rounded-full ${passwordStrength >= 25 ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                      <div className={`h-1 flex-1 rounded-full ${passwordStrength >= 50 ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                      <div className={`h-1 flex-1 rounded-full ${passwordStrength >= 75 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div className={`h-1 flex-1 rounded-full ${passwordStrength >= 100 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Password must be at least 8 characters and include uppercase, numbers, and special characters
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password (Signup only) */}
              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-slate-400"
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Terms and Conditions (Signup only) */}
              {authMode === 'signup' && (
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    required
                  />
                  <label htmlFor="acceptTerms" className="text-sm text-slate-300">
                    I agree to the <a href="#terms" className="text-blue-400 hover:underline">Terms of Service</a> and <a href="#privacy" className="text-blue-400 hover:underline">Privacy Policy</a>
                  </label>
                </div>
              )}

              {/* Referral Code (Signup only) */}
              {authMode === 'signup' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-300">
                      Referral Code (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowReferralInput(!showReferralInput)}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                    >
                      <Gift className="h-3 w-3" />
                      <span>Have a referral code?</span>
                    </button>
                  </div>
                  {showReferralInput && (
                    <input
                      type="text"
                      value={formData.referralCode}
                      onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-slate-400"
                      placeholder="Enter referral code"
                      maxLength={8}
                    />
                  )}
                </div>
              )}

              {/* Error/Success Messages */}
              {(error || authError) && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-sm text-red-200">
                  {error || authError}
                </div>
              )}

              {success && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-sm text-green-200">
                  {success}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAuthLoading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
              >
                {isAuthLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>
                    {authMode === 'login' ? 'Sign In & Start Free Trial' : 'Create Account & Start Trial'}
                  </span>
                )}
              </button>

              {/* Mode Switching */}
              <div className="text-center">
                {authMode === 'login' ? (
                  <div className="text-sm text-slate-300">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        setError('');
                        clearError();
                      }}
                      className="text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Sign up for free trial
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-slate-300">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setError('');
                        clearError();
                      }}
                      className="text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Sign in
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Action Buttons (for authenticated users) */}
          {isAuthenticated && (
            <div className="mt-8 flex flex-col gap-4">
              <button
                onClick={onCreateNewSheet}
                disabled={isLoading}
                className="group flex items-center justify-center space-x-3 px-6 py-4 text-lg font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <Plus className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span>Create New Sheet</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onImportFile}
                disabled={isLoading}
                className="group flex items-center justify-center space-x-3 px-6 py-4 text-lg font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <Upload className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span>{isLoading ? 'Processing...' : 'Import Existing File'}</span>
                {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>}
                {!isLoading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 py-16 bg-gradient-to-b from-transparent to-slate-900">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-white text-center mb-12">Powerful Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 hover:border-white/30 transform hover:-translate-y-1">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-300 leading-relaxed mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-sm text-slate-300">
                        <CheckCircle className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center space-y-4 shadow-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-cyan-600"></div>
            <span className="text-slate-700 font-medium">Processing your file...</span>
            <p className="text-sm text-slate-500 text-center">This may take a few moments for large files</p>
          </div>
        </div>
      )}
    </div>
  );
};