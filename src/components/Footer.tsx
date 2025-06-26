import React from 'react';
import { Mail, Phone, Shield, Heart, Gift, Star, ExternalLink, FileText, Cookie, Keyboard } from 'lucide-react';
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
    { name: 'API Access', href: '#api' },
    { name: 'Integrations', href: '#integrations' }
  ];

  const resourcesLinks = [
    { name: 'Documentation', href: '#docs' },
    { name: 'Video Tutorials', href: '#tutorials' },
    { name: 'Blog', href: '#blog' },
    { name: 'Case Studies', href: '#cases' },
    { name: 'Changelog', href: '#changelog' },
    { name: 'Status Page', href: '#status' }
  ];

  const supportLinks = [
    { name: 'Help Center', href: '#help' },
    { name: 'Community Forum', href: '#forum' },
    { name: 'Contact Support', href: 'mailto:contact@advexcel.online' },
    { name: 'Report Bug', href: '#bug-report' },
    { name: 'Feature Request', href: '#feature-request' },
    { name: 'Live Chat', href: '#chat' }
  ];

  const companyLinks = [
    { name: 'About Us', href: '#about' },
    { name: 'Careers', href: '#careers' },
    { name: 'Press Kit', href: '#press' },
    { name: 'Partners', href: '#partners' },
    { name: 'Investors', href: '#investors' },
    { name: 'Contact', href: '#contact' }
  ];

  const legalLinks = [
    { name: 'Terms of Service', href: '#terms' },
    { name: 'Privacy Policy', href: '#privacy' },
    { name: 'Cookie Policy', href: '#cookies' },
    { name: 'Refund Policy', href: '#refunds' },
    { name: 'Security', href: '#security' },
    { name: 'Compliance', href: '#compliance' }
  ];

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Top Section - Company Info - Centered */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <Logo size="lg" className="bg-white/10 backdrop-blur-sm border-white/20" />
            <div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Excel Pro AI
              </h3>
              <p className="text-slate-300 text-lg">Advanced Analytics Suite</p>
            </div>
          </div>
          
          <p className="text-slate-300 mb-6 leading-relaxed text-lg max-w-2xl mx-auto">
            Transform your spreadsheet data into actionable insights with natural language queries 
            and AI-powered analytics. 100% private and secure - your data never leaves your device.
          </p>

          {/* Trust Indicators - Centered */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
            <div className="flex items-center space-x-2 text-green-400 bg-green-400/10 px-4 py-2 rounded-full border border-green-400/20">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">100% Secure & Private</span>
            </div>
            
            <div className="flex items-center space-x-2 text-blue-400 bg-blue-400/10 px-4 py-2 rounded-full border border-blue-400/20">
              <Keyboard className="h-5 w-5" />
              <span className="text-sm font-medium">Keyboard Shortcuts</span>
            </div>
          </div>
        </div>

        {/* Middle Section - Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
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
                    <ExternalLink className="h-3 w-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Resources</h4>
            <ul className="space-y-3">
              {resourcesLinks.map((link) => (
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
                    <ExternalLink className="h-3 w-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
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

          {/* Legal Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
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
        </div>

        {/* Contact & Community */}
        <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xl font-semibold text-white mb-3">Contact Us</h4>
              <div className="space-y-3">
                <a 
                  href="mailto:contact@advexcel.online" 
                  className="flex items-center space-x-3 text-slate-300 hover:text-cyan-400 transition-colors group"
                >
                  <Mail className="h-5 w-5 text-cyan-400" />
                  <span>contact@advexcel.online</span>
                </a>
                
                <div className="flex items-center space-x-3 text-slate-300">
                  <Phone className="h-5 w-5 text-blue-400" />
                  <span>+91 9848220007</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-xl font-semibold text-white mb-3">Join Our Community</h4>
              <div className="space-y-3">
                {onReferralClick && (
                  <button
                    onClick={onReferralClick}
                    className="flex items-center space-x-3 text-slate-300 hover:text-cyan-400 transition-colors"
                  >
                    <Gift className="h-5 w-5 text-yellow-400" />
                    <span>Refer & Earn Free Days</span>
                  </button>
                )}
                {onRatingClick && (
                  <button
                    onClick={onRatingClick}
                    className="flex items-center space-x-3 text-slate-300 hover:text-cyan-400 transition-colors"
                  >
                    <Star className="h-5 w-5 text-yellow-400" />
                    <span>Rate Our App</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    // Trigger the keyboard shortcuts modal
                    const event = new KeyboardEvent('keydown', { key: '?' });
                    window.dispatchEvent(event);
                  }}
                  className="flex items-center space-x-3 text-slate-300 hover:text-cyan-400 transition-colors"
                >
                  <Keyboard className="h-5 w-5 text-blue-400" />
                  <span>Keyboard Shortcuts</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div>
              <h4 className="text-2xl font-bold text-white mb-2">Stay Updated</h4>
              <p className="text-slate-300 mb-3">
                Get the latest news, updates, and tips for Excel Pro AI delivered to your inbox.
              </p>
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <Shield className="h-4 w-4 text-green-400" />
                <span>We respect your privacy. No spam, ever.</span>
              </div>
            </div>
            <div>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-white/10 border border-white/20 rounded-l-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-r-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 font-medium">
                  Subscribe
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-700/50 bg-slate-900/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row items-center justify-center space-y-3 md:space-y-0">
            {/* Copyright and Made with Love - Centered */}
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3 text-sm text-slate-400">
              <span>© {currentYear} Excel Pro AI. All rights reserved.</span>
              <div className="flex items-center space-x-2">
                <Heart className="h-3 w-3 text-red-400" />
                <span>Made with love for data analysts worldwide</span>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-3 text-center text-xs text-slate-500 max-w-3xl mx-auto">
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