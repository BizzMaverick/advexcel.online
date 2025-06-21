import React from 'react';
import { FileSpreadsheet, Mail, Phone, MapPin, Shield, Cookie, FileText, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
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

  const excelFunctions = [
    'VLOOKUP', 'HLOOKUP', 'INDEX', 'MATCH', 'SUMIF', 'COUNTIF', 'AVERAGEIF', 'IF', 'NESTED IF', 'PIVOT TABLES'
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <FileSpreadsheet className="h-8 w-8 text-blue-400" />
              <div>
                <h3 className="text-xl font-bold">Excel Analyzer Pro</h3>
                <p className="text-sm text-gray-300">Advanced Analytics Suite</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Transform your spreadsheets with AI-powered insights, natural language queries, and advanced analytics. 
              Your data stays private and secure.
            </p>
            <div className="flex items-center space-x-2 text-sm text-green-400">
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
                    className="text-gray-300 hover:text-blue-400 transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Excel Functions */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Supported Functions</h4>
            <div className="flex flex-wrap gap-1">
              {excelFunctions.map((func) => (
                <span 
                  key={func}
                  className="px-2 py-1 bg-blue-800/30 text-blue-300 text-xs rounded border border-blue-700/50 hover:bg-blue-700/30 transition-colors"
                >
                  {func}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400">
              And 200+ more Excel functions supported
            </p>
          </div>

          {/* Contact & Legal */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Legal & Support</h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-gray-300 hover:text-blue-400 transition-colors text-sm flex items-center space-x-2"
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
            <div className="pt-2 space-y-1">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Mail className="h-3 w-3" />
                <span>support@advexcel.online</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Phone className="h-3 w-3" />
                <span>+91 9999999999</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700/50 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-400">
                © {currentYear} Excel Analyzer Pro. All rights reserved.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Made with <Heart className="h-3 w-3 inline text-red-400" /> for data analysts worldwide
              </p>
            </div>

            {/* Cookie Notice */}
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <Cookie className="h-3 w-3" />
                <span>We use cookies to enhance your experience</span>
              </div>
              <button className="text-blue-400 hover:text-blue-300 transition-colors">
                Cookie Settings
              </button>
            </div>
          </div>

          {/* Additional Legal Text */}
          <div className="mt-4 pt-4 border-t border-gray-800/50">
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              Excel Analyzer Pro is an independent software application and is not affiliated with, endorsed by, or sponsored by Microsoft Corporation. 
              Excel is a trademark of Microsoft Corporation. All product names, logos, and brands are property of their respective owners.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};