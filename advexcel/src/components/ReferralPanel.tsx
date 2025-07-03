import React, { useState, useEffect } from 'react';
import { X, Copy, Gift, Users, Calendar, Trophy, Share2, CheckCircle, Clock } from 'lucide-react';
import { ReferralService } from '../utils/referralService';
import { ReferralCode, UserReferralStats } from '../types/referral';

interface ReferralPanelProps {
  isVisible: boolean;
  onClose: () => void;
  userId: string;
}

export const ReferralPanel: React.FC<ReferralPanelProps> = ({ isVisible, onClose, userId }) => {
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [stats, setStats] = useState<UserReferralStats | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isVisible && userId) {
      loadReferralData();
    }
  }, [isVisible, userId]);

  const loadReferralData = () => {
    // Get or create referral code
    const existingCodes = ReferralService.getUserReferralCodes(userId);
    const activeCode = existingCodes.find(code => !code.isUsed && new Date() < new Date(code.expiresAt));
    
    if (activeCode) {
      setReferralCode(activeCode);
    } else {
      const newCode = ReferralService.generateReferralCode(userId);
      setReferralCode(newCode);
    }

    // Get stats
    const userStats = ReferralService.getUserReferralStats(userId);
    setStats(userStats);
  };

  const copyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareReferral = () => {
    if (referralCode && navigator.share) {
      navigator.share({
        title: 'Excel Analyzer Pro - Free Trial',
        text: `Join me on Excel Analyzer Pro! Use my referral code ${referralCode.code} to get started with your free trial.`,
        url: window.location.origin
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Gift className="h-6 w-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Referral Program</h2>
              <p className="text-sm text-gray-600">Earn extra days by referring friends</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Your Referral Code */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Share2 className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Your Referral Code</h3>
            </div>
            
            {referralCode && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-white border border-purple-200 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 tracking-wider">
                        {referralCode.code}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Expires: {new Date(referralCode.expiresAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={copyReferralCode}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                  
                  {navigator.share && (
                    <button
                      onClick={shareReferral}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* How It Works */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">How Referrals Work</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Share your referral code</p>
                  <p className="text-xs text-gray-600">Send your unique code to friends and colleagues</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">They sign up and purchase</p>
                  <p className="text-xs text-gray-600">Your friend uses your code during registration and makes a purchase</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">You earn extra days</p>
                  <p className="text-xs text-gray-600">Get bonus subscription days based on their purchase</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reward Structure */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Trophy className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Reward Structure</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">+1</div>
                <div className="text-sm font-medium text-gray-900">Day</div>
                <div className="text-xs text-gray-600">Daily Plan Purchase</div>
              </div>
              
              <div className="bg-white border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">+7</div>
                <div className="text-sm font-medium text-gray-900">Days</div>
                <div className="text-xs text-gray-600">Monthly Plan Purchase</div>
              </div>
              
              <div className="bg-white border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">+30</div>
                <div className="text-sm font-medium text-gray-900">Days</div>
                <div className="text-xs text-gray-600">Yearly Plan Purchase</div>
              </div>
            </div>
          </div>

          {/* Your Stats */}
          {stats && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Calendar className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Your Referral Stats</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalReferrals}</div>
                  <div className="text-sm text-gray-600">Total Referrals</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.successfulReferrals}</div>
                  <div className="text-sm text-gray-600">Successful</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.totalRewardDays}</div>
                  <div className="text-sm text-gray-600">Days Earned</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.pendingRewards}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              </div>
            </div>
          )}

          {/* Terms */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Clock className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Important Notes</h4>
                <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                  <li>• Referral codes are valid for 30 days from generation</li>
                  <li>• Each code can only be used once</li>
                  <li>• Rewards are applied immediately after successful purchase</li>
                  <li>• Self-referrals are not allowed</li>
                  <li>• One account per device policy applies to all users</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};