import { ReferralCode, ReferralReward, UserReferralStats } from '../types/referral';
import { AuthService } from './authService';

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

    // Store in localStorage
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

  static async applyReferral(referralCode: string, newUserId: string): Promise<{ success: boolean; message: string }> {
    try {
      const validation = this.validateReferralCode(referralCode);
      
      if (!validation.valid || !validation.referralCode) {
        return { success: false, message: validation.message };
      }

      const referralCodeData = validation.referralCode;
      
      // Mark the referral code as used
      const referrerCodes = this.getUserReferralCodes(referralCodeData.referrerId);
      const codeIndex = referrerCodes.findIndex(c => c.code === referralCode);
      
      if (codeIndex !== -1) {
        referrerCodes[codeIndex].isUsed = true;
        referrerCodes[codeIndex].usedBy = newUserId;
        referrerCodes[codeIndex].usedAt = new Date();
        localStorage.setItem(`referral_codes_${referralCodeData.referrerId}`, JSON.stringify(referrerCodes));
      }

      // Grant bonus days to both users
      await this.grantReferralBonus(referralCodeData.referrerId, 'referrer');
      await this.grantReferralBonus(newUserId, 'referee');

      // Create referral reward records
      const referrerReward: ReferralReward = {
        id: `REWARD_${Date.now()}_REFERRER`,
        userId: referralCodeData.referrerId,
        referralCodeId: referralCodeData.id,
        rewardType: 'trial_extension',
        rewardValue: 3, // 3 bonus days for referrer
        status: 'granted',
        grantedAt: new Date()
      };

      const refereeReward: ReferralReward = {
        id: `REWARD_${Date.now()}_REFEREE`,
        userId: newUserId,
        referralCodeId: referralCodeData.id,
        rewardType: 'trial_extension',
        rewardValue: 2, // 2 bonus days for referee
        status: 'granted',
        grantedAt: new Date()
      };

      // Store rewards
      this.storeReferralReward(referrerReward);
      this.storeReferralReward(refereeReward);

      return { 
        success: true, 
        message: 'Referral applied successfully! You and your referrer have received bonus trial days.' 
      };
    } catch (error) {
      console.error('Error applying referral:', error);
      return { success: false, message: 'Failed to apply referral code. Please try again.' };
    }
  }

  static getUserReferralStats(userId: string): UserReferralStats {
    const codes = this.getUserReferralCodes(userId);
    const rewards = this.getUserReferralRewards(userId);
    
    const totalRewardDays = rewards
      .filter(r => r.status === 'granted' && r.rewardType === 'trial_extension')
      .reduce((sum, r) => sum + r.rewardValue, 0);
    
    return {
      totalReferrals: codes.length,
      successfulReferrals: codes.filter(c => c.isUsed).length,
      totalRewardDays,
      pendingRewards: rewards.filter(r => r.status === 'pending').length
    };
  }

  static getUserReferralCodes(userId: string): ReferralCode[] {
    const data = localStorage.getItem(`referral_codes_${userId}`);
    return data ? JSON.parse(data) : [];
  }

  private static async grantReferralBonus(userId: string, type: 'referrer' | 'referee'): Promise<void> {
    try {
      const user = await AuthService.findUserByIdentifier(userId);
      if (!user) return;

      const bonusDays = type === 'referrer' ? 3 : 2;
      
      // Extend trial period
      if (user.subscription?.trialEndsAt) {
        const currentTrialEnd = new Date(user.subscription.trialEndsAt);
        currentTrialEnd.setDate(currentTrialEnd.getDate() + bonusDays);
        user.subscription.trialEndsAt = currentTrialEnd;
      } else {
        // If no trial, start a new one with bonus days
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 5 + bonusDays); // 5 base days + bonus
        user.subscription = {
          ...user.subscription,
          trialEndsAt: trialEnd,
          isTrialActive: true
        };
      }

      // Update user data
      await AuthService.updateUser(user);
    } catch (error) {
      console.error('Error granting referral bonus:', error);
    }
  }

  private static storeReferralReward(reward: ReferralReward): void {
    const existingRewards = this.getUserReferralRewards(reward.userId);
    existingRewards.push(reward);
    localStorage.setItem(`referral_rewards_${reward.userId}`, JSON.stringify(existingRewards));
  }

  private static getUserReferralRewards(userId: string): ReferralReward[] {
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