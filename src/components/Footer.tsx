import React from 'react';
import { Mail, Phone, Shield, Heart, Gift, Star } from 'lucide-react';
import { Logo } from './Logo';

interface FooterProps {
  onReferralClick?: () => void;
  onRatingClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onReferralClick, onRatingClick }) => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Help Center', href: '#help' },
    { name: 'Contact', href: '#contact' }
  ];

  const legalLinks = [
    { name: 'Terms of Service', href: '#terms' },
    { name: 'Privacy Policy', href: '#privacy' },
    { name: 'Cookie Policy', href: '#cookies' },
    { name: 'Refund Policy', href: '#refunds' }
  ];

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      {/* Single Line Footer */}
      <div className="border-t border-slate-700/50 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            {/* Left Section - Company Info */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <Logo size="sm" />
                <div>
                  <span className="text-sm font-bold">Excel Pro AI</span>
                  <span className="text-xs text-slate-400 ml-2">© {currentYear}</span>
                </div>
              </div>
              
              <div className="hidden md:flex items-center space-x-2 text-xs text-cyan-400">
                <Shield className="h-3 w-3" />
                <span>100% Privacy Protected</span>
              </div>
            </div>

            {/* Center Section - Links */}
            <div className="flex items-center space-x-6 text-xs">
              {/* Quick Links */}
              <div className="hidden lg:flex items-center space-x-4">
                {quickLinks.map((link) => (
                  <a 
                    key={link.name}
                    href={link.href} 
                    className="text-slate-300 hover:text-cyan-400 transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
              </div>

              {/* Legal Links */}
              <div className="flex items-center space-x-4">
                {legalLinks.map((link) => (
                  <a 
                    key={link.name}
                    href={link.href} 
                    className="text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
              </div>

              {/* Community Actions */}
              <div className="flex items-center space-x-4">
                {onReferralClick && (
                  <button
                    onClick={onReferralClick}
                    className="flex items-center space-x-1 text-slate-300 hover:text-cyan-400 transition-colors"
                  >
                    <Gift className="h-3 w-3" />
                    <span>Refer & Earn</span>
                  </button>
                )}
                {onRatingClick && (
                  <button
                    onClick={onRatingClick}
                    className="flex items-center space-x-1 text-slate-300 hover:text-cyan-400 transition-colors"
                  >
                    <Star className="h-3 w-3" />
                    <span>Rate App</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Section - Contact */}
            <div className="flex items-center space-x-6 text-xs">
              <div className="flex items-center space-x-4">
                <a 
                  href="mailto:contact@advexcel.online" 
                  className="flex items-center space-x-1 text-slate-300 hover:text-cyan-400 transition-colors"
                >
                  <Mail className="h-3 w-3" />
                  <span className="hidden sm:inline">contact@advexcel.online</span>
                </a>
                <div className="flex items-center space-x-1 text-slate-400">
                  <Phone className="h-3 w-3" />
                  <span className="hidden sm:inline">+91 9848220007</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 text-slate-500">
                <Heart className="h-3 w-3 text-red-400" />
                <span className="hidden md:inline">Made for data analysts</span>
              </div>
            </div>
          </div>

          {/* Mobile Responsive Additional Info */}
          <div className="lg:hidden mt-3 pt-3 border-t border-slate-800/50">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 text-xs text-slate-500">
              <div className="flex items-center space-x-4">
                <span>Excel Pro AI is independent software, not affiliated with Microsoft Corporation</span>
              </div>
              <div className="flex items-center space-x-2">
                <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  Cookie Settings
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Additional Legal Text */}
          <div className="hidden lg:block mt-2 pt-2 border-t border-slate-800/50">
            <p className="text-xs text-slate-500 text-center">
              Excel Pro AI is an independent software application and is not affiliated with, endorsed by, or sponsored by Microsoft Corporation. 
              Excel is a trademark of Microsoft Corporation. All product names, logos, and brands are property of their respective owners.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};