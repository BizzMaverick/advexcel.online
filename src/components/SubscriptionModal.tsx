import React, { useState, useEffect } from 'react';
import { X, Crown, Check, Star, Shield, CreditCard, Smartphone, Wallet, Building, Clock, AlertCircle, CheckCircle, Zap, Gift, TrendingUp } from 'lucide-react';

interface SubscriptionModalProps {
  isVisible: boolean;
  onClose: () => void;
  userId: string;
  onSubscriptionSuccess: () => void;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: 'daily' | 'monthly' | 'yearly';
  features: string[];
  isPopular?: boolean;
  discount?: {
    originalPrice: number;
    percentage: number;
  };
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isVisible,
  onClose,
  userId,
  onSubscriptionSuccess
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const plans: SubscriptionPlan[] = [
    {
      id: 'daily',
      name: 'Daily Plan',
      price: 49,
      currency: 'INR',
      duration: 'daily',
      features: [
        'Full access to all features',
        'Unlimited file imports',
        'Advanced analytics',
        'Natural language queries',
        'Export in all formats',
        'Priority support'
      ]
    },
    {
      id: 'monthly',
      name: 'Monthly Plan',
      price: 1199,
      currency: 'INR',
      duration: 'monthly',
      isPopular: true,
      discount: {
        originalPrice: 1470,
        percentage: 18
      },
      features: [
        'Everything in Daily Plan',
        'Save up to 18% vs daily',
        'Monthly billing convenience',
        'Advanced pivot tables',
        'Custom formulas',
        'Data visualization tools',
        'Premium templates'
      ]
    },
    {
      id: 'yearly',
      name: 'Yearly Plan',
      price: 12999,
      currency: 'INR',
      duration: 'yearly',
      discount: {
        originalPrice: 17885,
        percentage: 27
      },
      features: [
        'Everything in Monthly Plan',
        'Save up to 27% vs daily',
        'Best value for money',
        'Priority feature requests',
        'Dedicated account manager',
        'Advanced integrations',
        'Custom training sessions',
        'Early access to new features'
      ]
    }
  ];

  const paymentMethods = [
    { 
      id: 'upi', 
      name: 'UPI', 
      icon: Smartphone, 
      description: 'Pay with any UPI app',
      popular: true,
      processingTime: 'Instant'
    },
    { 
      id: 'card', 
      name: 'Credit/Debit Card', 
      icon: CreditCard, 
      description: 'Visa, Mastercard, RuPay',
      popular: false,
      processingTime: 'Instant'
    },
    { 
      id: 'netbanking', 
      name: 'Net Banking', 
      icon: Building, 
      description: 'All major banks supported',
      popular: false,
      processingTime: '2-5 minutes'
    },
    { 
      id: 'wallet', 
      name: 'Digital Wallet', 
      icon: Wallet, 
      description: 'Paytm, PhonePe, Google Pay',
      popular: false,
      processingTime: 'Instant'
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setError('');
  };

  const handlePayment = () => {
    setIsProcessing(true);
    setError('');
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setSuccess('Payment successful! Your subscription is now active.');
      
      // Notify parent component
      setTimeout(() => {
        onSubscriptionSuccess();
        onClose();
      }, 2000);
    }, 3000);
  };

  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateSavings = (plan: SubscriptionPlan): string => {
    if (!plan.discount) return '';
    const savings = plan.discount.originalPrice - plan.price;
    return formatPrice(savings);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <Crown className="h-6 w-6 text-yellow-500" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
              <p className="text-sm text-gray-600">Unlock the full power of Excel Analyzer Pro</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {!showPayment ? (
            /* Plan Selection */
            <div className="space-y-6">
              {/* Special Offer Banner */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <Gift className="h-6 w-6" />
                  <div>
                    <h3 className="font-bold text-lg">Limited Time Offer!</h3>
                    <p className="text-sm opacity-90">Save up to 27% on yearly plans. Offer valid until end of month.</p>
                  </div>
                </div>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                      selectedPlan === plan.id
                        ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    } ${plan.isPopular ? 'ring-2 ring-yellow-400' : ''}`}
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                          <Star className="h-3 w-3" />
                          <span>MOST POPULAR</span>
                        </span>
                      </div>
                    )}

                    {plan.id === 'yearly' && (
                      <div className="absolute -top-3 right-4">
                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>BEST VALUE</span>
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <div className="mb-2">
                        <span className="text-3xl font-bold text-gray-900">
                          {formatPrice(plan.price)}
                        </span>
                        <span className="text-gray-600">/{plan.duration === 'daily' ? 'day' : plan.duration === 'monthly' ? 'month' : 'year'}</span>
                      </div>
                      
                      {plan.discount && (
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="text-gray-500 line-through">
                              {formatPrice(plan.discount.originalPrice)}
                            </span>
                            <span className="ml-2 text-green-600 font-medium">
                              Save {calculateSavings(plan)}
                            </span>
                          </div>
                          <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            {plan.discount.percentage}% OFF
                          </div>
                        </div>
                      )}

                      {plan.id === 'daily' && (
                        <div className="text-xs text-gray-500 mt-2">
                          Perfect for short-term projects
                        </div>
                      )}
                      {plan.id === 'monthly' && (
                        <div className="text-xs text-blue-600 mt-2 font-medium">
                          Most flexible option
                        </div>
                      )}
                      {plan.id === 'yearly' && (
                        <div className="text-xs text-green-600 mt-2 font-medium">
                          Maximum savings & benefits
                        </div>
                      )}
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        selectedPlan === plan.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Pricing Comparison */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">💰 Price Comparison</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-gray-900">Daily</div>
                    <div className="text-gray-600">₹49/day</div>
                    <div className="text-xs text-gray-500">₹1,470/month</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-blue-600">Monthly</div>
                    <div className="text-blue-600">₹1,199/month</div>
                    <div className="text-xs text-green-600">Save ₹271/month</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-green-600">Yearly</div>
                    <div className="text-green-600">₹12,999/year</div>
                    <div className="text-xs text-green-600">Save ₹4,886/year</div>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <div className="text-center">
                <button
                  onClick={() => setShowPayment(true)}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Zap className="h-5 w-5" />
                  <span>Continue to Payment</span>
                </button>
              </div>

              {/* Security Notice */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">🔒 Secure Payment</h4>
                    <p className="text-sm text-gray-600">
                      Your payment information is encrypted and secure. We support all major payment methods in India.
                      256-bit SSL encryption • PCI DSS compliant • No card details stored
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Payment Section */
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  <span>Order Summary</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-medium text-lg">
                      {plans.find(p => p.id === selectedPlan)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold text-2xl text-green-600">
                      {formatPrice(plans.find(p => p.id === selectedPlan)?.price || 0)}
                    </span>
                  </div>
                  {plans.find(p => p.id === selectedPlan)?.discount && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">You Save:</span>
                      <span className="font-medium text-green-600">
                        {calculateSavings(plans.find(p => p.id === selectedPlan)!)}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">ORDER_{Date.now()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Select Payment Method</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentMethods.map((method) => {
                    const IconComponent = method.icon;
                    return (
                      <label
                        key={method.id}
                        className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          paymentMethod === method.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) => setPaymentMethod(e.target.value as any)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <IconComponent className="h-6 w-6 text-gray-600" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{method.name}</span>
                            {method.popular && (
                              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                Popular
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">{method.description}</div>
                          <div className="text-xs text-blue-600">Processing: {method.processingTime}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-4 rounded-lg border border-green-200">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm">{success}</span>
                </div>
              )}

              {/* Payment Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowPayment(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back to Plans
                </button>
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      <span>Pay {formatPrice(plans.find(p => p.id === selectedPlan)?.price || 0)}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Terms and Security */}
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">100% Secure Payment</span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Your payment is protected by bank-level security. We never store your card details.
                  </p>
                </div>
                
                <p className="text-xs text-gray-500 text-center">
                  By proceeding with payment, you agree to our Terms of Service and Privacy Policy. 
                  Your subscription will auto-renew unless cancelled. You can cancel anytime from your account settings.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};