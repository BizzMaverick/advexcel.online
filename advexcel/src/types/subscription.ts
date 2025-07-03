export interface SubscriptionPlan {
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

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'expired' | 'cancelled' | 'trial';
  startDate: Date;
  endDate: Date;
  trialEndDate?: Date;
  autoRenew: boolean;
  paymentMethod?: string;
  paymentGateway?: string;
}

export interface PaymentDetails {
  amount: number;
  currency: string;
  planId: string;
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'wallet';
  paymentGateway?: 'razorpay' | 'payu' | 'ccavenue' | 'stripe';
  orderId: string;
}

export interface TrialInfo {
  isTrialActive: boolean;
  trialStartDate: Date;
  trialEndDate: Date;
  daysRemaining: number;
}

export interface PaymentGatewayConfig {
  name: string;
  id: string;
  logo: string;
  supportedMethods: string[];
  isActive: boolean;
  processingFee?: number;
}