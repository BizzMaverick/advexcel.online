import React from 'react';
import { Mail, Phone, Shield, Heart, Gift, Star, ExternalLink, FileText, Cookie, RefreshCw, MapPin, Clock, Award, Users } from 'lucide-react';
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
    { name: 'Analytics', href: '#analytics' },
    { name: 'API Access', href: '#api' }
  ];

  const supportLinks = [
    { name: 'Help Center', href: '#help' },
    { name: 'Documentation', href: '#docs' },
    { name: 'Video Tutorials', href: '#tutorials' },
    { name: 'Community Forum', href: '#forum' },
    { name: 'Contact Support', href: 'mailto:contact@advexcel.online' }
  ];

  const legalLinks = [
    { name: 'Terms of Service', href: '#terms', icon: FileText },
    { name: 'Privacy Policy', href: '#privacy', icon: Shield },
    { name: 'Cookie Policy', href: '#cookies', icon: Cookie },
    { name: 'Refund Policy', href: '#refunds', icon: RefreshCw }
  ];

  const companyStats = [
    { label: 'Active Users', value: '10,000+', icon: Users },
    { label: 'Files Processed', value: '1M+', icon: FileText },
    { label: 'Uptime', value: '99.9%', icon: Clock },
    { label: 'User Rating', value: '4.9/5', icon: Award }
  ];

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Company Info - Takes up more space */}
          <div className="lg:col-span-5">
            <div className="flex items-center space-x-4 mb-6">
              <Logo size="lg" className="bg-white/10 backdrop-blur-sm border-white/20" />
              <div>
                <h3 className="text-2xl font-bold">Excel Pro AI</h3>
                <p className="text-sm text-slate-300">Advanced Analytics Suite</p>
              </div>
            </div>
            
            <p className="text-slate-300 mb-8 leading-relaxed text-lg">
              Transform your spreadsheet data into actionable insights with natural language queries 
              and AI-powered analytics. 100% private and secure - your data never leaves your device.
            </p>

            {/* Company Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {companyStats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="bg-white/5 rounded-lg p-4 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-cyan-600/20 rounded-lg flex items-center justify-center">
                        <IconComponent className="h-4 w-4 text-cyan-400" />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white">{stat.value}</div>
                        <div className="text-xs text-slate-400">{stat.label}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-green-400">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">100% Secure & Private</span>
              </div>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
                <span className="text-sm text-slate-400 ml-2">4.9/5 (1,200+ reviews)</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div className="lg:col-span-2">
            <h4 className="text-lg font-semibold mb-6 text-white flex items-center space-x-2">
              <FileText className="h-5 w-5 text-cyan-400" />
              <span>Product</span>
            </h4>
            <ul className="space-y-4">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-slate-300 hover:text-cyan-400 transition-colors text-sm flex items-center group"
                  >
                    <span>{link.name}</span>
                    <ExternalLink className="h-3 w-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="lg:col-span-2">
            <h4 className="text-lg font-semibold mb-6 text-white flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-400" />
              <span>Support</span>
            </h4>
            <ul className="space-y-4">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-slate-300 hover:text-cyan-400 transition-colors text-sm flex items-center group"
                  >
                    <span>{link.name}</span>
                    <ExternalLink className="h-3 w-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Legal */}
          <div className="lg:col-span-3">
            <h4 className="text-lg font-semibold mb-6 text-white flex items-center space-x-2">
              <Mail className="h-5 w-5 text-blue-400" />
              <span>Contact & Legal</span>
            </h4>
            
            {/* Contact Info */}
            <div className="space-y-4 mb-8">
              <a 
                href="mailto:contact@advexcel.online" 
                className="flex items-center space-x-3 text-slate-300 hover:text-cyan-400 transition-colors group"
              >
                <div className="w-10 h-10 bg-cyan-600/20 rounded-lg flex items-center justify-center group-hover:bg-cyan-600/30 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-medium">Email Support</div>
                  <div className="text-xs text-slate-400">contact@advexcel.online</div>
                </div>
              </a>
              
              <div className="flex items-center space-x-3 text-slate-300">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-medium">Phone Support</div>
                  <div className="text-xs text-slate-400">+91 9848220007</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-slate-300">
                <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-medium">Location</div>
                  <div className="text-xs text-slate-400">Hyderabad, India</div>
                </div>
              </div>
            </div>

            {/* Legal Links */}
            <div className="grid grid-cols-2 gap-3">
              {legalLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <a 
                    key={link.name}
                    href={link.href} 
                    className="flex items-center space-x-2 text-slate-300 hover:text-cyan-400 transition-colors text-sm bg-white/5 rounded-lg p-3 border border-white/10"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{link.name}</span>
                  </a>
                );
              })}
            </div>

            {/* Community Actions */}
            <div className="mt-6 flex space-x-4">
              {onReferralClick && (
                <button
                  onClick={onReferralClick}
                  className="flex items-center space-x-2 text-slate-300 hover:text-cyan-400 transition-colors text-sm bg-white/5 rounded-lg p-3 border border-white/10"
                >
                  <Gift className="h-4 w-4" />
                  <span>Refer & Earn</span>
                </button>
              )}
              {onRatingClick && (
                <button
                  onClick={onRatingClick}
                  className="flex items-center space-x-2 text-slate-300 hover:text-cyan-400 transition-colors text-sm bg-white/5 rounded-lg p-3 border border-white/10"
                >
                  <Star className="h-4 w-4" />
                  <span>Rate Our App</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-700/50 bg-slate-900/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <span>© {currentYear} Excel Pro AI. All rights reserved.</span>
              <div className="hidden md:flex items-center space-x-2">
                <Heart className="h-3 w-3 text-red-400" />
                <span>Made with love for data analysts worldwide</span>
              </div>
            </div>

            {/* Version Info */}
            <div className="flex items-center space-x-4 text-xs text-slate-500">
              <span>Version 2.0.1</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">Last updated: Jan 2025</span>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-4 text-center text-xs text-slate-500 max-w-3xl mx-auto">
            <p>
              Excel Pro AI is an independent software application and is not affiliated with, endorsed by, or sponsored by Microsoft Corporation. 
              Excel is a trademark of Microsoft Corporation. All product names, logos, and brands are property of their respective owners.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};