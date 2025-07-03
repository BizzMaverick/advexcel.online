import React, { useState } from 'react';
import { X, FileText, Shield, Cookie, Heart, CheckCircle, AlertTriangle, Mail } from 'lucide-react';

interface LegalModalsProps {
  activeModal: 'terms' | 'privacy' | 'cookies' | 'refunds' | null;
  onClose: () => void;
}

export const LegalModals: React.FC<LegalModalsProps> = ({ activeModal, onClose }) => {
  if (!activeModal) return null;

  const modalContent = {
    terms: {
      title: 'Terms of Service',
      icon: FileText,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h3>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using Excel Analyzer Pro, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Service Description</h3>
            <p className="text-gray-700 leading-relaxed">
              Excel Analyzer Pro is a web-based application that provides advanced spreadsheet analysis, natural language queries, 
              and data visualization tools. All data processing occurs locally in your browser.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">3. User Responsibilities</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You agree not to use the service for any unlawful purposes</li>
              <li>You will not attempt to reverse engineer or modify the software</li>
              <li>You are responsible for the accuracy and legality of data you upload</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Subscription and Billing</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Subscriptions are billed in advance on a recurring basis</li>
              <li>You may cancel your subscription at any time</li>
              <li>Refunds are provided according to our refund policy</li>
              <li>Prices may change with 30 days notice</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Data Privacy</h3>
            <p className="text-gray-700 leading-relaxed">
              Your data privacy is our priority. All data processing occurs locally in your browser. 
              We do not store, access, or transmit your spreadsheet data to our servers.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Limitation of Liability</h3>
            <p className="text-gray-700 leading-relaxed">
              Excel Analyzer Pro is provided "as is" without warranty of any kind. We shall not be liable 
              for any indirect, incidental, special, consequential, or punitive damages.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Termination</h3>
            <p className="text-gray-700 leading-relaxed">
              We may terminate or suspend your account immediately, without prior notice, for conduct 
              that we believe violates these Terms of Service.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Contact Us</h4>
                <p className="text-sm text-blue-800 mt-1">
                  If you have any questions about these Terms of Service, please contact us at{' '}
                  <a 
                    href="mailto:contact@advexcel.online" 
                    className="underline hover:text-blue-900"
                  >
                    contact@advexcel.online
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    privacy: {
      title: 'Privacy Policy',
      icon: Shield,
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Privacy First Approach</h4>
                <p className="text-sm text-green-800 mt-1">
                  Your data never leaves your device. All processing happens locally in your browser.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Information We Collect</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-800">Account Information:</h4>
                <p className="text-gray-700 text-sm">Email address or phone number for account creation and authentication.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Usage Analytics:</h4>
                <p className="text-gray-700 text-sm">Anonymous usage statistics to improve our service (no personal data).</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Payment Information:</h4>
                <p className="text-gray-700 text-sm">Processed securely through third-party payment providers.</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">2. What We DON'T Collect</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Your spreadsheet data or file contents</li>
              <li>Personal information from your files</li>
              <li>Browsing history or behavior outside our app</li>
              <li>Location data or device information</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">3. How We Use Information</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>To provide and maintain our service</li>
              <li>To process payments and manage subscriptions</li>
              <li>To send important service updates</li>
              <li>To improve our application based on usage patterns</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Data Security</h3>
            <p className="text-gray-700 leading-relaxed">
              We implement industry-standard security measures including SSL encryption, secure authentication, 
              and regular security audits. Your spreadsheet data is processed entirely in your browser and never transmitted to our servers.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Third-Party Services</h3>
            <p className="text-gray-700 leading-relaxed">
              We use trusted third-party services for payments (Razorpay, PayU) and analytics (anonymized). 
              These services have their own privacy policies and security measures.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Your Rights</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
              <li>Export your account information</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Privacy Questions?</h4>
                <p className="text-sm text-blue-800 mt-1">
                  If you have any questions about our privacy practices, please contact us at{' '}
                  <a 
                    href="mailto:contact@advexcel.online" 
                    className="underline hover:text-blue-900"
                  >
                    contact@advexcel.online
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    cookies: {
      title: 'Cookie Policy',
      icon: Cookie,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">What Are Cookies?</h3>
            <p className="text-gray-700 leading-relaxed">
              Cookies are small text files stored on your device when you visit our website. 
              They help us provide you with a better experience and remember your preferences.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Types of Cookies We Use</h3>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Essential Cookies</span>
                </h4>
                <p className="text-sm text-gray-600 mt-2">
                  Required for the website to function properly. These include authentication, 
                  security, and basic functionality cookies.
                </p>
                <p className="text-xs text-gray-500 mt-1">Cannot be disabled</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span>Functional Cookies</span>
                </h4>
                <p className="text-sm text-gray-600 mt-2">
                  Remember your preferences and settings to provide a personalized experience.
                </p>
                <p className="text-xs text-gray-500 mt-1">Can be disabled in settings</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span>Analytics Cookies</span>
                </h4>
                <p className="text-sm text-gray-600 mt-2">
                  Help us understand how you use our website to improve our service. 
                  All data is anonymized and aggregated.
                </p>
                <p className="text-xs text-gray-500 mt-1">Can be disabled in settings</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Managing Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You can control and manage cookies in several ways:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Use our cookie preference center (click "Cookie Settings" in the footer)</li>
              <li>Adjust your browser settings to block or delete cookies</li>
              <li>Use browser extensions that manage cookies</li>
              <li>Clear your browser data regularly</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Third-Party Cookies</h3>
            <p className="text-gray-700 leading-relaxed">
              We may use third-party services that set their own cookies:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
              <li>Payment processors (for secure transactions)</li>
              <li>Analytics services (for anonymized usage data)</li>
              <li>Content delivery networks (for faster loading)</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Cookie className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Cookie Questions?</h4>
                <p className="text-sm text-blue-800 mt-1">
                  If you have questions about our cookie usage, please contact us at{' '}
                  <a 
                    href="mailto:contact@advexcel.online" 
                    className="underline hover:text-blue-900"
                  >
                    contact@advexcel.online
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    refunds: {
      title: 'Refund Policy',
      icon: Heart,
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Heart className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Customer Satisfaction Guarantee</h4>
                <p className="text-sm text-green-800 mt-1">
                  We want you to be completely satisfied with Excel Analyzer Pro. 
                  If you're not happy, we'll make it right.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Free Trial Period</h3>
            <p className="text-gray-700 leading-relaxed">
              All new users receive a 5-day free trial with full access to all features. 
              You can cancel anytime during the trial period without any charges.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Refund Eligibility</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-800">7-Day Money-Back Guarantee</h4>
                  <p className="text-sm text-gray-600">Full refund within 7 days of purchase for any reason</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-800">Technical Issues</h4>
                  <p className="text-sm text-gray-600">Refund available if we cannot resolve technical problems</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-800">Service Downtime</h4>
                  <p className="text-sm text-gray-600">Prorated refund for extended service interruptions</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Refund Process</h3>
            <ol className="list-decimal list-inside text-gray-700 space-y-2">
              <li>Contact our support team at contact@advexcel.online</li>
              <li>Provide your account details and reason for refund</li>
              <li>We'll process your request within 2 business days</li>
              <li>Refunds are issued to the original payment method</li>
              <li>Processing time: 3-7 business days depending on payment method</li>
            </ol>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Partial Refunds</h3>
            <p className="text-gray-700 leading-relaxed">
              For annual subscriptions, we may offer prorated refunds based on unused time. 
              Monthly and daily subscriptions are typically refunded in full when requested within the eligible period.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Non-Refundable Items</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Subscriptions cancelled after 30 days (except for technical issues)</li>
              <li>Accounts terminated for violation of terms of service</li>
              <li>Third-party service fees (payment processing charges)</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Cancellation vs Refund</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Cancellation:</strong> Stops future billing but allows access until current period ends.<br/>
                <strong>Refund:</strong> Returns payment and immediately terminates access.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Need a Refund?</h4>
                <p className="text-sm text-blue-800 mt-1">
                  Before requesting a refund, please contact our support team at{' '}
                  <a 
                    href="mailto:contact@advexcel.online" 
                    className="underline hover:text-blue-900"
                  >
                    contact@advexcel.online
                  </a>
                  . We're often able to resolve issues and help you get the most out of Excel Analyzer Pro.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  };

  const modal = modalContent[activeModal];
  const IconComponent = modal.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <IconComponent className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">{modal.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {modal.content}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <div className="flex items-center space-x-3">
              <a 
                href="mailto:contact@advexcel.online" 
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <Mail className="h-3 w-3" />
                <span>Contact Support</span>
              </a>
              <button
                onClick={onClose}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};