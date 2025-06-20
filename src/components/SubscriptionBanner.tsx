import React from 'react';
import { Crown, Clock, AlertTriangle } from 'lucide-react';
import { TrialInfo } from '../types/subscription';

interface SubscriptionBannerProps {
  trialInfo: TrialInfo | null;
  isSubscribed: boolean;
  onUpgradeClick: () => void;
}

export const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({
  trialInfo,
  isSubscribed,
  onUpgradeClick
}) => {
  if (isSubscribed) return null;

  if (!trialInfo) return null;

  if (trialInfo.isTrialActive) {
    return (
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-3 px-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5" />
            <div>
              <span className="font-medium">
                Free Trial: {trialInfo.daysRemaining} day{trialInfo.daysRemaining !== 1 ? 's' : ''} remaining
              </span>
              <span className="ml-2 text-sm opacity-90">
                • Upgrade now to continue using all features
              </span>
            </div>
          </div>
          <button
            onClick={onUpgradeClick}
            className="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2"
          >
            <Crown className="h-4 w-4" />
            <span>Upgrade Now</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5" />
          <div>
            <span className="font-medium">Free Trial Expired</span>
            <span className="ml-2 text-sm opacity-90">
              • Subscribe to continue using Excel Analyzer Pro
            </span>
          </div>
        </div>
        <button
          onClick={onUpgradeClick}
          className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2"
        >
          <Crown className="h-4 w-4" />
          <span>Subscribe Now</span>
        </button>
      </div>
    </div>
  );
};