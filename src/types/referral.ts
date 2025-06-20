export interface ReferralCode {
  id: string;
  code: string;
  referrerId: string;
  isUsed: boolean;
  usedBy?: string;
  usedAt?: Date;
  createdAt: Date;
  expiresAt: Date;
}

export interface ReferralReward {
  id: string;
  referrerId: string;
  referredUserId: string;
  purchasePlan: 'daily' | 'monthly' | 'yearly';
  rewardDays: number;
  appliedAt: Date;
}

export interface UserReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  totalRewardDays: number;
  pendingRewards: number;
}