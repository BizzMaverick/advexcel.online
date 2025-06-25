import React from 'react';
import { Mail, Phone, Shield, Heart, Gift, Star, ExternalLink, FileText, Cookie, RefreshCw } from 'lucide-react';
import { Logo } from './Logo';

interface FooterProps {
  onReferralClick?: () => void;
  onRatingClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onReferralClick, onRatingClick }) => {
  const currentYear = new Date().getFullYear();

  const productLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Templates', href: '#templates' },
    { name: 'Analytics', href: '#analytics' }
  ];

  const supportLinks = [
    { name: 'Help Center', href: '#help' },
    { name: 'Documentation', href: '#docs' },
    { name: 'Tutorials', href: '#tutorials' },
    { name: 'API Reference', href: '#api' }
  ];

  const legalLinks = [
    { name: 'Terms of Service', href: '#terms', icon: FileText },
    { name: 'Privacy Policy', href: '#privacy', icon: Shield },
    { name: 'Cookie Policy', href: '#cookies', icon: Cookie },
    { name: 'Refund Policy', href: '#refunds', icon: RefreshCw }
  ];

  const socialLinks = [
    { name: 'LinkedIn', href: '#', icon: ExternalLink },
    { name: 'Twitter', href: '#', icon: ExternalLink },
    { name: 'GitHub', href: '#', icon: ExternalLink }
  ];

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <Logo size="lg" className="bg-white/10 backdrop-blur-sm border-white/20" />
              <div>
                <h3 className="text-xl font-bold">Excel Pro AI</h3>
                <p className="text-sm text-slate-300">Advanced Analytics Suite</p>
              </div>
            </div>
            
            <p className="text-slate-300 mb-6 leading-relaxed">
              Transform your spreadsheet data into actionable insights with natural language queries 
              and AI-powered analytics. 100% private and secure - your data never leaves your device.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a 
                href="mailto:contact@advexcel.online" 
                className="flex items-center space-x-3 text-slate-300 hover:text-cyan-400 transition-colors group"
              >
                <div className="w-8 h-8 bg-cyan-600/20 rounded-lg flex items-center justify-center group-hover:bg-cyan-600/30 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <span className="text-sm">contact@advexcel.online</span>
              </a>
              
              <div className="flex items-center space-x-3 text-slate-300">
                <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <Phone className="h-4 w-4" />
                </div>
                <span className="text-sm">+91 9848220007</span>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-6 flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-green-400">
                <Shield className="h-4 w-4" />
                <span className="text-xs font-medium">100% Secure</span>
              </div>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-3 w-3 text-yellow-400 fill-current" />
                ))}
                <span className="text-xs text-slate-400 ml-1">4.9/5</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Product</h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-slate-300 hover:text-cyan-400 transition-colors text-sm flex items-center group"
                  >
                    <span>{link.name}</span>
                    <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Support</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-slate-300 hover:text-cyan-400 transition-colors text-sm flex items-center group"
                  >
                    <span>{link.name}</span>
                    <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>

            {/* Community Actions */}
            <div className="mt-6 space-y-3">
              {onReferralClick && (
                <button
                  onClick={onReferralClick}
                  className="flex items-center space-x-2 text-slate-300 hover:text-cyan-400 transition-colors text-sm group"
                >
                  <Gift className="h-4 w-4" />
                  <span>Refer & Earn</span>
                </button>
              )}
              {onRatingClick && (
                <button
                  onClick={onRatingClick}
                  className="flex items-center space-x-2 text-slate-300 hover:text-cyan-400 transition-colors text-sm group"
                >
                  <Star className="h-4 w-4" />
                  <span>Rate Our App</span>
                </button>
              )}
            </div>
          </div>

          {/* Legal & Social */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <li key={link.name}>
                    <a 
                      href={link.href} 
                      className="text-slate-300 hover:text-cyan-400 transition-colors text-sm flex items-center group"
                    >
                      <IconComponent className="h-3 w-3 mr-2" />
                      <span>{link.name}</span>
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* Social Links */}
            <div className="mt-6">
              <h5 className="text-sm font-medium text-white mb-3">Follow Us</h5>
              <div className="flex space-x-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-cyan-600/30 transition-colors group"
                    title={social.name}
                  >
                    <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-cyan-400" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-700/50 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            {/* Copyright */}
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <span>© {currentYear} Excel Pro AI. All rights reserved.</span>
              <div className="hidden lg:flex items-center space-x-2">
                <Heart className="h-3 w-3 text-red-400" />
                <span>Made for data analysts worldwide</span>
              </div>
            </div>

            {/* Additional Info */}
            <div className="flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-6 text-xs text-slate-500">
              <div className="text-center lg:text-left">
                <p>Excel Pro AI is independent software, not affiliated with Microsoft Corporation.</p>
                <p className="lg:hidden mt-1">Excel is a trademark of Microsoft Corporation.</p>
              </div>
              
              <div className="hidden lg:flex items-center space-x-4">
                <span>Version 2.0.1</span>
                <span>•</span>
                <span>Last updated: Jan 2025</span>
              </div>
            </div>
          </div>

          {/* Mobile Additional Info */}
          <div className="lg:hidden mt-4 pt-4 border-t border-slate-800/50">
            <div className="text-center space-y-2 text-xs text-slate-500">
              <p>Excel is a trademark of Microsoft Corporation.</p>
              <div className="flex items-center justify-center space-x-4">
                <span>Version 2.0.1</span>
                <span>•</span>
                <span>Updated Jan 2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};