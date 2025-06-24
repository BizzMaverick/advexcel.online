import React from 'react';
import { FileSpreadsheet, Mail, Phone, Shield, Cookie, FileText, Heart, Gift, Star } from 'lucide-react';

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
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/Tech Company Logo Excel Pro AI, Blue and Silver.png" 
                alt="Excel Pro AI" 
                className="h-8 w-8"
              />
              <div>
                <h3 className="text-xl font-bold">Excel Pro AI</h3>
                <p className="text-sm text-slate-300">Advanced Analytics Suite</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Transform your spreadsheets with AI-powered insights, natural language queries, and advanced analytics. 
              Your data stays private and secure.
            </p>
            <div className="flex items-center space-x-2 text-sm text-cyan-400">
              <Shield className="h-4 w-4" />
              <span>100% Privacy Protected</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-slate-300 hover:text-cyan-400 transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* User Actions */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Community</h4>
            <div className="space-y-3">
              {onReferralClick && (
                <button
                  onClick={onReferralClick}
                  className="flex items-center space-x-2 text-slate-300 hover:text-cyan-400 transition-colors text-sm"
                >
                  <Gift className="h-4 w-4" />
                  <span>Refer & Earn</span>
                </button>
              )}
              {onRatingClick && (
                <button
                  onClick={onRatingClick}
                  className="flex items-center space-x-2 text-slate-300 hover:text-cyan-400 transition-colors text-sm"
                >
                  <Star className="h-4 w-4" />
                  <span>Rate Our App</span>
                </button>
              )}
            </div>
          </div>

          {/* Contact & Legal */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contact & Support</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-slate-300">
                <Mail className="h-4 w-4 text-cyan-400" />
                <a 
                  href="mailto:contact@advexcel.online" 
                  className="hover:text-cyan-400 transition-colors"
                >
                  contact@advexcel.online
                </a>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-300">
                <Phone className="h-4 w-4 text-cyan-400" />
                <span>+91 9848220007</span>
              </div>
            </div>
            
            <div className="pt-2">
              <h5 className="text-sm font-medium text-white mb-2">Legal</h5>
              <ul className="space-y-1">
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href} 
                      className="text-slate-300 hover:text-cyan-400 transition-colors text-sm flex items-center space-x-2"
                    >
                      {link.name === 'Terms of Service' && <FileText className="h-3 w-3" />}
                      {link.name === 'Privacy Policy' && <Shield className="h-3 w-3" />}
                      {link.name === 'Cookie Policy' && <Cookie className="h-3 w-3" />}
                      {link.name === 'Refund Policy' && <Heart className="h-3 w-3" />}
                      <span>{link.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-700/50 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-sm text-slate-400">
                © {currentYear} Excel Pro AI. All rights reserved.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Made with <Heart className="h-3 w-3 inline text-red-400" /> for data analysts worldwide
              </p>
            </div>

            {/* Contact Info */}
            <div className="flex items-center space-x-4 text-xs text-slate-500">
              <div className="flex items-center space-x-2">
                <Mail className="h-3 w-3" />
                <a 
                  href="mailto:contact@advexcel.online" 
                  className="hover:text-cyan-400 transition-colors"
                >
                  Questions? Contact us
                </a>
              </div>
              <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
                Cookie Settings
              </button>
            </div>
          </div>

          {/* Additional Legal Text */}
          <div className="mt-4 pt-4 border-t border-slate-800/50">
            <p className="text-xs text-slate-500 text-center leading-relaxed">
              Excel Pro AI is an independent software application and is not affiliated with, endorsed by, or sponsored by Microsoft Corporation. 
              Excel is a trademark of Microsoft Corporation. All product names, logos, and brands are property of their respective owners.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};