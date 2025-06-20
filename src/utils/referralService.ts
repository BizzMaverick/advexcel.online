import { ReferralCode, ReferralReward, UserReferralStats } from '../types/referral';

export class ReferralService {
  static generateReferralCode(userId: string): ReferralCode {
    const code = this.generateUniqueCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days validity

    const referralCode: ReferralCode = {
      id: `REF_${Date.now()}`,
      code,
      referrerId: userId,
      isUsed: false,
      createdAt: new Date(),
      expiresAt
    };

    // Store in localStorage (in production, use backend)
    const existingCodes = this.getUserReferralCodes(userId);
    existingCodes.push(referralCode);
    localStorage.setItem(`referral_codes_${userId}`, JSON.stringify(existingCodes));

    return referralCode;
  }

  static validateReferralCode(code: string): { valid: boolean; referralCode?: ReferralCode; message: string } {
    // Get all referral codes from localStorage
    const allUsers = this.getAllUsers();
    
    for (const userId of allUsers) {
      const codes = this.getUserReferralCodes(userId);
      const referralCode = codes.find(c => c.code === code);
      
      if (referralCode) {
        if (referralCode.isUsed) {
          return { valid: false, message: 'This referral code has already been used.' };
        }
        
        if (new Date() > new Date(referralCode.expiresAt)) {
          return { valid: false, message: 'This referral code has expired.' };
        }
        
        return { valid: true, referralCode, message: 'Valid referral code!' };
      }
    }
    
    return { valid: false, message: 'Invalid referral code.' };
  }

  static applyReferralCode(code: string, newUserId: string): { success: boolean; message: string } {
    const validation = this.validateReferralCode(code);
    
    if (!validation.valid || !validation.referralCode) {
      return { success: false, message: validation.message };
    }

    const referralCode = validation.referralCode;
    
    // Mark code as used
    referralCode.isUsed = true;
    referralCode.usedBy = newUserId;
    referralCode.usedAt = new Date();
    
    // Update referral codes
    const referrerCodes = this.getUserReferralCodes(referralCode.referrerId);
    const updatedCodes = referrerCodes.map(c => c.id === referralCode.id ? referralCode : c);
    localStorage.setItem(`referral_codes_${referralCode.referrerId}`, JSON.stringify(updatedCodes));
    
    // Store referral relationship
    localStorage.setItem(`referred_by_${newUserId}`, referralCode.referrerId);
    
    return { success: true, message: 'Referral code applied successfully!' };
  }

  static processReferralReward(referredUserId: string, purchasePlan: 'daily' | 'monthly' | 'yearly'): void {
    const referrerId = localStorage.getItem(`referred_by_${referredUserId}`);
    
    if (!referrerId) return;

    // Calculate reward days based on purchase plan
    let rewardDays = 0;
    switch (purchasePlan) {
      case 'daily':
        rewardDays = 1;
        break;
      case 'monthly':
        rewardDays = 7;
        break;
      case 'yearly':
        rewardDays = 30;
        break;
    }

    const reward: ReferralReward = {
      id: `REWARD_${Date.now()}`,
      referrerId,
      referredUserId,
      purchasePlan,
      rewardDays,
      appliedAt: new Date()
    };

    // Store reward
    const existingRewards = this.getUserRewards(referrerId);
    existingRewards.push(reward);
    localStorage.setItem(`referral_rewards_${referrerId}`, JSON.stringify(existingRewards));

    // Extend referrer's subscription
    this.extendSubscription(referrerId, rewardDays);
  }

  static extendSubscription(userId: string, days: number): void {
    const subscriptionData = localStorage.getItem(`subscription_${userId}`);
    
    if (subscriptionData) {
      const subscription = JSON.parse(subscriptionData);
      const endDate = new Date(subscription.endDate);
      endDate.setDate(endDate.getDate() + days);
      
      subscription.endDate = endDate.toISOString();
      localStorage.setItem(`subscription_${userId}`, JSON.stringify(subscription));
    } else {
      // If no subscription, extend trial
      const trialData = localStorage.getItem(`trial_${userId}`);
      if (trialData) {
        const trial = JSON.parse(trialData);
        const endDate = new Date(trial.endDate);
        endDate.setDate(endDate.getDate() + days);
        
        trial.endDate = endDate.toISOString();
        localStorage.setItem(`trial_${userId}`, JSON.stringify(trial));
      }
    }
  }

  static getUserReferralStats(userId: string): UserReferralStats {
    const codes = this.getUserReferralCodes(userId);
    const rewards = this.getUserRewards(userId);
    
    return {
      totalReferrals: codes.length,
      successfulReferrals: codes.filter(c => c.isUsed).length,
      totalRewardDays: rewards.reduce((sum, r) => sum + r.rewardDays, 0),
      pendingRewards: 0 // Could implement pending rewards logic
    };
  }

  static getUserReferralCodes(userId: string): ReferralCode[] {
    const data = localStorage.getItem(`referral_codes_${userId}`);
    return data ? JSON.parse(data) : [];
  }

  private static getUserRewards(userId: string): ReferralReward[] {
    const data = localStorage.getItem(`referral_rewards_${userId}`);
    return data ? JSON.parse(data) : [];
  }

  private static getAllUsers(): string[] {
    const users: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('referral_codes_')) {
        users.push(key.replace('referral_codes_', ''));
      }
    }
    return users;
  }

  private static generateUniqueCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}