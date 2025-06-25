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

  static getUserReferralStats(userId: string): UserReferralStats {
    const codes = this.getUserReferralCodes(userId);
    
    return {
      totalReferrals: codes.length,
      successfulReferrals: codes.filter(c => c.isUsed).length,
      totalRewardDays: 0,
      pendingRewards: 0
    };
  }

  static getUserReferralCodes(userId: string): ReferralCode[] {
    const data = localStorage.getItem(`referral_codes_${userId}`);
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