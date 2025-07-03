import { SubscriptionPlan, UserSubscription, PaymentDetails, TrialInfo } from '../types/subscription';

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
}