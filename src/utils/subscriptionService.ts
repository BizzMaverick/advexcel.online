import { SubscriptionPlan, UserSubscription, PaymentDetails, TrialInfo } from '../types/subscription';
import { ReferralService } from './referralService';

export class SubscriptionService {
  private static readonly TRIAL_DAYS = 5;
  
  static getSubscriptionPlans(): SubscriptionPlan[] {
    return [
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
          originalPrice: 1470, // 49 * 30
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
          originalPrice: 17885, // 49 * 365
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
  }

  static getUserTrial(userId: string): TrialInfo | null {
    const trialData = localStorage.getItem(`trial_${userId}`);
    
    if (!trialData) {
      // Start new trial
      const trialStartDate = new Date();
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + this.TRIAL_DAYS);
      
      const trialInfo: TrialInfo = {
        isTrialActive: true,
        trialStartDate,
        trialEndDate,
        daysRemaining: this.TRIAL_DAYS
      };
      
      localStorage.setItem(`trial_${userId}`, JSON.stringify({
        startDate: trialStartDate.toISOString(),
        endDate: trialEndDate.toISOString()
      }));
      
      return trialInfo;
    }
    
    const { startDate, endDate } = JSON.parse(trialData);
    const trialEndDate = new Date(endDate);
    const now = new Date();
    const daysRemaining = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    return {
      isTrialActive: daysRemaining > 0,
      trialStartDate: new Date(startDate),
      trialEndDate,
      daysRemaining
    };
  }

  static getUserSubscription(userId: string): UserSubscription | null {
    const subscriptionData = localStorage.getItem(`subscription_${userId}`);
    
    if (!subscriptionData) {
      return null;
    }
    
    const subscription = JSON.parse(subscriptionData);
    return {
      ...subscription,
      startDate: new Date(subscription.startDate),
      endDate: new Date(subscription.endDate),
      trialEndDate: subscription.trialEndDate ? new Date(subscription.trialEndDate) : undefined
    };
  }

  static isSubscriptionActive(userId: string): boolean {
    const subscription = this.getUserSubscription(userId);
    const trial = this.getUserTrial(userId);
    
    if (trial?.isTrialActive) {
      return true;
    }
    
    if (!subscription) {
      return false;
    }
    
    const now = new Date();
    return subscription.status === 'active' && subscription.endDate > now;
  }

  static async initiatePayment(planId: string, userId: string): Promise<PaymentDetails> {
    const plans = this.getSubscriptionPlans();
    const plan = plans.find(p => p.id === planId);
    
    if (!plan) {
      throw new Error('Invalid plan selected');
    }
    
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      amount: plan.price,
      currency: plan.currency,
      planId: plan.id,
      paymentMethod: 'upi', // Default, will be selected by user
      orderId
    };
  }

  static async processPayment(paymentDetails: PaymentDetails, userId: string): Promise<{ success: boolean; message: string }> {
    // Simulate payment processing with realistic delays
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // For demo purposes, randomly succeed/fail with high success rate
    const success = Math.random() > 0.05; // 95% success rate
    
    if (success) {
      const plans = this.getSubscriptionPlans();
      const plan = plans.find(p => p.id === paymentDetails.planId);
      
      if (plan) {
        const startDate = new Date();
        const endDate = new Date();
        
        switch (plan.duration) {
          case 'daily':
            endDate.setDate(endDate.getDate() + 1);
            break;
          case 'monthly':
            endDate.setMonth(endDate.getMonth() + 1);
            break;
          case 'yearly':
            endDate.setFullYear(endDate.getFullYear() + 1);
            break;
        }
        
        const subscription: UserSubscription = {
          id: `SUB_${Date.now()}`,
          userId,
          planId: plan.id,
          status: 'active',
          startDate,
          endDate,
          autoRenew: true,
          paymentMethod: paymentDetails.paymentMethod
        };
        
        localStorage.setItem(`subscription_${userId}`, JSON.stringify({
          ...subscription,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }));

        // Process referral rewards if user was referred
        ReferralService.processReferralReward(userId, plan.duration);
        
        return {
          success: true,
          message: `Payment successful! Your ${plan.name} is now active.`
        };
      }
    }
    
    return {
      success: false,
      message: 'Payment failed. Please try again or contact support.'
    };
  }

  static cancelSubscription(userId: string): { success: boolean; message: string } {
    const subscription = this.getUserSubscription(userId);
    
    if (!subscription) {
      return {
        success: false,
        message: 'No active subscription found.'
      };
    }
    
    const updatedSubscription = {
      ...subscription,
      status: 'cancelled' as const,
      autoRenew: false
    };
    
    localStorage.setItem(`subscription_${userId}`, JSON.stringify({
      ...updatedSubscription,
      startDate: updatedSubscription.startDate.toISOString(),
      endDate: updatedSubscription.endDate.toISOString()
    }));
    
    return {
      success: true,
      message: 'Subscription cancelled. You can continue using the service until your current period ends.'
    };
  }

  static formatPrice(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  }

  static calculateSavings(plan: SubscriptionPlan): string {
    if (!plan.discount) return '';
    
    const savings = plan.discount.originalPrice - plan.price;
    return this.formatPrice(savings);
  }

  // Payment Gateway Integration Methods
  static async initializeRazorpay(paymentDetails: PaymentDetails): Promise<any> {
    // This would integrate with Razorpay in production
    return {
      key: 'rzp_test_1234567890', // Demo key
      amount: paymentDetails.amount * 100, // Razorpay expects amount in paise
      currency: paymentDetails.currency,
      order_id: paymentDetails.orderId,
      name: 'Excel Analyzer Pro',
      description: 'Subscription Payment',
      theme: {
        color: '#2563EB'
      }
    };
  }

  static async initializePayU(paymentDetails: PaymentDetails): Promise<any> {
    // This would integrate with PayU in production
    return {
      key: 'test_key_123', // Demo key
      txnid: paymentDetails.orderId,
      amount: paymentDetails.amount,
      productinfo: 'Excel Analyzer Pro Subscription',
      firstname: 'User',
      email: 'user@example.com',
      phone: '9999999999',
      surl: 'https://your-domain.com/success',
      furl: 'https://your-domain.com/failure'
    };
  }

  static async initializeCCAvenue(paymentDetails: PaymentDetails): Promise<any> {
    // This would integrate with CCAvenue in production
    return {
      merchant_id: 'demo_merchant',
      order_id: paymentDetails.orderId,
      amount: paymentDetails.amount,
      currency: paymentDetails.currency,
      redirect_url: 'https://your-domain.com/ccavenue/response',
      cancel_url: 'https://your-domain.com/ccavenue/cancel'
    };
  }

  static getPaymentGatewayConfig(gateway: string, paymentDetails: PaymentDetails) {
    switch (gateway) {
      case 'razorpay':
        return this.initializeRazorpay(paymentDetails);
      case 'payu':
        return this.initializePayU(paymentDetails);
      case 'ccavenue':
        return this.initializeCCAvenue(paymentDetails);
      default:
        throw new Error('Unsupported payment gateway');
    }
  }
}