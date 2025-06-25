import React from 'react';
import { Mail, Phone, Shield, Heart, Gift, Star, ExternalLink, FileText, Cookie, RefreshCw, MapPin, Clock, Award, Users, Zap, TrendingUp, Target, Globe, Github, Twitter, Linkedin } from 'lucide-react';
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

  const companyStats = [
    { label: 'Active Users', value: '10,000+', icon: Users, color: 'text-blue-400' },
    { label: 'Files Processed', value: '1M+', icon: FileText, color: 'text-green-400' },
    { label: 'Uptime', value: '99.9%', icon: Clock, color: 'text-purple-400' },
    { label: 'User Rating', value: '4.9/5', icon: Award, color: 'text-yellow-400' }
  ];

  const socialLinks = [
    { name: 'Twitter', href: '#twitter', icon: Twitter },
    { name: 'LinkedIn', href: '#linkedin', icon: Linkedin },
    { name: 'GitHub', href: '#github', icon: Github },
    { name: 'Website', href: 'https://advexcel.online', icon: Globe }
  ];

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Top Section - Company Info & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-4 mb-6">
              <Logo size="lg" className="bg-white/10 backdrop-blur-sm border-white/20" />
              <div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Excel Pro AI
                </h3>
                <p className="text-slate-300 text-lg">Advanced Analytics Suite</p>
              </div>
            </div>
            
            <p className="text-slate-300 mb-8 leading-relaxed text-lg max-w-2xl">
              Transform your spreadsheet data into actionable insights with natural language queries 
              and AI-powered analytics. 100% private and secure - your data never leaves your device.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <div className="flex items-center space-x-2 text-green-400 bg-green-400/10 px-4 py-2 rounded-full border border-green-400/20">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">100% Secure & Private</span>
              </div>
              <div className="flex items-center space-x-1 bg-yellow-400/10 px-4 py-2 rounded-full border border-yellow-400/20">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
                <span className="text-sm text-slate-300 ml-2">4.9/5 (1,200+ reviews)</span>
              </div>
              <div className="flex items-center space-x-2 text-cyan-400 bg-cyan-400/10 px-4 py-2 rounded-full border border-cyan-400/20">
                <Zap className="h-5 w-5" />
                <span className="text-sm font-medium">AI Powered</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <span className="text-slate-400 text-sm">Follow us:</span>
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors group"
                    title={social.name}
                  >
                    <IconComponent className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Company Stats */}
          <div className="lg:col-span-1">
            <h4 className="text-xl font-semibold mb-6 text-white">Platform Stats</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {companyStats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="bg-white/5 rounded-lg p-4 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                        <IconComponent className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <div>
                        <div className="text-xl font-bold text-white">{stat.value}</div>
                        <div className="text-xs text-slate-400">{stat.label}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Middle Section - Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16">
          {/* Product Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Product</h4>
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

          {/* Resources Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Resources</h4>
            <ul className="space-y-4">
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
            <h4 className="text-lg font-semibold mb-6 text-white">Support</h4>
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

          {/* Company Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Company</h4>
            <ul className="space-y-4">
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
            <h4 className="text-lg font-semibold mb-6 text-white">Legal</h4>
            <ul className="space-y-4">
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

          {/* Contact & Community */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Contact</h4>
            
            {/* Contact Info */}
            <div className="space-y-4 mb-6">
              <a 
                href="mailto:contact@advexcel.online" 
                className="flex items-center space-x-3 text-slate-300 hover:text-cyan-400 transition-colors group"
              >
                <Mail className="h-4 w-4 text-cyan-400" />
                <span className="text-sm">contact@advexcel.online</span>
              </a>
              
              <div className="flex items-center space-x-3 text-slate-300">
                <Phone className="h-4 w-4 text-blue-400" />
                <span className="text-sm">+91 9848220007</span>
              </div>

              <div className="flex items-center space-x-3 text-slate-300">
                <MapPin className="h-4 w-4 text-purple-400" />
                <span className="text-sm">Hyderabad, India</span>
              </div>
            </div>

            {/* Community Actions */}
            <div className="space-y-3">
              {onReferralClick && (
                <button
                  onClick={onReferralClick}
                  className="flex items-center space-x-2 text-slate-300 hover:text-cyan-400 transition-colors text-sm"
                >
                  <Gift className="h-4 w-4 text-yellow-400" />
                  <span>Refer & Earn</span>
                </button>
              )}
              {onRatingClick && (
                <button
                  onClick={onRatingClick}
                  className="flex items-center space-x-2 text-slate-300 hover:text-cyan-400 transition-colors text-sm"
                >
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span>Rate Our App</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="bg-white/5 rounded-2xl p-8 backdrop-blur-sm border border-white/10 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h4 className="text-2xl font-bold text-white mb-2">Stay Updated</h4>
              <p className="text-slate-300 mb-4">
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

        {/* Featured Use Cases */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-blue-400" />
            </div>
            <h5 className="text-lg font-semibold text-white mb-2">Sales Analytics</h5>
            <p className="text-slate-300 text-sm mb-4">
              Track performance, identify trends, and forecast revenue with our powerful analytics tools.
            </p>
            <a href="#sales-analytics" className="text-cyan-400 text-sm flex items-center hover:text-cyan-300 transition-colors">
              <span>Learn more</span>
              <ExternalLink className="h-3 w-3 ml-2" />
            </a>
          </div>
          
          <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-purple-400" />
            </div>
            <h5 className="text-lg font-semibold text-white mb-2">Financial Planning</h5>
            <p className="text-slate-300 text-sm mb-4">
              Budget analysis, expense tracking, and financial modeling with natural language commands.
            </p>
            <a href="#financial-planning" className="text-cyan-400 text-sm flex items-center hover:text-cyan-300 transition-colors">
              <span>Learn more</span>
              <ExternalLink className="h-3 w-3 ml-2" />
            </a>
          </div>
          
          <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-green-400" />
            </div>
            <h5 className="text-lg font-semibold text-white mb-2">Team Collaboration</h5>
            <p className="text-slate-300 text-sm mb-4">
              Share insights, collaborate on data analysis, and make data-driven decisions as a team.
            </p>
            <a href="#team-collaboration" className="text-cyan-400 text-sm flex items-center hover:text-cyan-300 transition-colors">
              <span>Learn more</span>
              <ExternalLink className="h-3 w-3 ml-2" />
            </a>
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