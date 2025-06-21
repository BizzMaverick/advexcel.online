import React from 'react';
import { FileSpreadsheet, Upload, BarChart3, TrendingUp, Search, Zap, Database, Shield, Star, Users, CheckCircle, ArrowRight, Play, BookOpen, Target, Award } from 'lucide-react';

interface WelcomeScreenProps {
  onImportFile: () => void;
  isLoading: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onImportFile, isLoading }) => {
  const features = [
    {
      icon: Search,
      title: 'Natural Language Queries',
      description: 'Ask questions like "extract west region data" or "show top 10 sales"',
      color: 'text-blue-600 bg-blue-100',
      benefits: ['No complex formulas needed', 'Instant data insights', 'Plain English commands']
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Automatic trend analysis, correlation detection, and outlier identification',
      color: 'text-green-600 bg-green-100',
      benefits: ['AI-powered insights', 'Statistical analysis', 'Predictive forecasting']
    },
    {
      icon: TrendingUp,
      title: 'Smart Forecasting',
      description: 'Generate predictions and forecasts based on your data patterns',
      color: 'text-purple-600 bg-purple-100',
      benefits: ['Future trend prediction', 'Business planning', 'Risk assessment']
    },
    {
      icon: Database,
      title: 'Excel Functions',
      description: 'Full support for VLOOKUP, pivot tables, conditional formatting, and more',
      color: 'text-orange-600 bg-orange-100',
      benefits: ['200+ Excel functions', 'Advanced formulas', 'Data manipulation']
    }
  ];

  const supportedFormats = [
    { format: 'Excel', extensions: '.xlsx, .xls, .xlsm, .xlsb', icon: '📊' },
    { format: 'CSV', extensions: '.csv', icon: '📄' },
    { format: 'OpenDocument', extensions: '.ods', icon: '📋' },
    { format: 'PDF', extensions: '.pdf', icon: '📕' },
    { format: 'Word', extensions: '.doc, .docx', icon: '📝' },
    { format: 'Text', extensions: '.txt', icon: '📃' }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Data Analyst",
      company: "TechCorp",
      comment: "Excel Analyzer Pro has revolutionized how I work with spreadsheets. The natural language queries save me hours every day!",
      rating: 5,
      avatar: "👩‍💼"
    },
    {
      name: "Michael Chen",
      role: "Business Manager",
      company: "StartupXYZ",
      comment: "The AI-powered insights help me make better decisions faster. The privacy-first approach gives me peace of mind.",
      rating: 5,
      avatar: "👨‍💼"
    },
    {
      name: "Emily Rodriguez",
      role: "Financial Analyst",
      company: "FinanceFlow",
      comment: "Privacy-first approach and powerful analytics make this the perfect tool for sensitive financial data analysis.",
      rating: 5,
      avatar: "👩‍💻"
    }
  ];

  const useCases = [
    {
      title: "Sales Analysis",
      description: "Track performance, identify trends, and forecast revenue",
      icon: TrendingUp,
      examples: ["Monthly sales reports", "Regional performance", "Product analysis"]
    },
    {
      title: "Financial Planning",
      description: "Budget analysis, expense tracking, and financial modeling",
      icon: Target,
      examples: ["Budget vs actual", "Cash flow analysis", "ROI calculations"]
    },
    {
      title: "Data Research",
      description: "Academic research, survey analysis, and statistical studies",
      icon: BookOpen,
      examples: ["Survey data analysis", "Research findings", "Statistical reports"]
    },
    {
      title: "Business Intelligence",
      description: "KPI tracking, dashboard creation, and performance metrics",
      icon: Award,
      examples: ["KPI dashboards", "Performance metrics", "Business reports"]
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Import Your Data",
      description: "Upload Excel, CSV, PDF, or other supported file formats",
      icon: Upload
    },
    {
      number: "2", 
      title: "Ask Questions",
      description: "Use natural language to query your data instantly",
      icon: Search
    },
    {
      number: "3",
      title: "Get Insights",
      description: "Receive AI-powered analytics and visualizations",
      icon: BarChart3
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <FileSpreadsheet className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Excel Analyzer Pro</h1>
              <p className="text-sm text-gray-500">Advanced spreadsheet analysis with AI-powered insights</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <Shield className="h-4 w-4" />
              <span className="font-medium">100% Private & Secure</span>
            </div>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
              ))}
              <span className="text-sm text-gray-600 ml-1">4.9/5 (1,200+ reviews)</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-7xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6 shadow-2xl">
                <FileSpreadsheet className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Transform Your Spreadsheets with
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> AI Power</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Analyze Excel files with natural language queries, generate insights automatically, 
                and create powerful visualizations - all while keeping your data 100% private and secure.
              </p>
            </div>

            {/* Import Button */}
            <div className="mb-12">
              <button
                onClick={onImportFile}
                disabled={isLoading}
                className="group inline-flex items-center space-x-3 px-10 py-5 text-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2"
              >
                <Upload className="h-7 w-7 group-hover:scale-110 transition-transform" />
                <span>{isLoading ? 'Processing...' : 'Import Your Spreadsheet'}</span>
                {isLoading && <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>}
                {!isLoading && <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />}
              </button>
              
              <div className="mt-6 text-sm text-gray-500">
                <p className="mb-3 font-medium">Supported formats:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {supportedFormats.map((format, index) => (
                    <span key={index} className="px-4 py-2 bg-white rounded-full text-xs border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-2">
                      <span className="text-lg">{format.icon}</span>
                      <div>
                        <strong className="text-gray-700">{format.format}</strong> 
                        <span className="text-gray-500 ml-1">{format.extensions}</span>
                      </div>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 mb-16">
              <div className="flex items-center space-x-2 text-green-600">
                <Shield className="h-5 w-5" />
                <span className="font-medium">Privacy First</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-600">
                <Users className="h-5 w-5" />
                <span className="font-medium">10,000+ Users</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-600">
                <Zap className="h-5 w-5" />
                <span className="font-medium">AI Powered</span>
              </div>
              <div className="flex items-center space-x-2 text-orange-600">
                <Database className="h-5 w-5" />
                <span className="font-medium">200+ Functions</span>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-gray-900 text-center mb-10">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <div key={index} className="text-center group">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                        {step.number}
                      </div>
                      {index < steps.length - 1 && (
                        <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-purple-200 transform -translate-x-8"></div>
                      )}
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h4>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-gray-900 text-center mb-10">Powerful Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center space-x-2 text-sm text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Use Cases */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-gray-900 text-center mb-10">Perfect For Every Use Case</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {useCases.map((useCase, index) => {
                const IconComponent = useCase.icon;
                return (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                    <IconComponent className="h-8 w-8 text-blue-600 mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{useCase.title}</h4>
                    <p className="text-gray-600 text-sm mb-4">{useCase.description}</p>
                    <ul className="space-y-1">
                      {useCase.examples.map((example, idx) => (
                        <li key={idx} className="text-xs text-gray-500 flex items-center space-x-1">
                          <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                          <span>{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Example Queries */}
          <div className="bg-white rounded-2xl p-10 shadow-xl mb-16 border border-gray-100">
            <div className="text-center mb-8">
              <Zap className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Try These Natural Language Queries</h3>
              <p className="text-gray-600 text-lg">Once you import your data, you can ask questions in plain English</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'Extract west region data',
                'Show top 10 sales records',
                'Find products with highest revenue',
                'Get sales data for 2024',
                'Filter by product category',
                'Compare north vs south region',
                'Show total sales by region',
                'Find records where sales > 1000',
                'Analyze data for trends',
                'Create pivot table from data',
                'Calculate correlation between columns',
                'Generate forecast for next quarter'
              ].map((query, index) => (
                <div key={index} className="group bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <Play className="h-4 w-4 text-blue-600 group-hover:text-blue-700" />
                    <code className="text-blue-700 text-sm font-medium group-hover:text-blue-800 transition-colors">"{query}"</code>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-gray-900 text-center mb-10">What Our Users Say</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="flex items-center space-x-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.comment}"</p>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{testimonial.avatar}</div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                      <p className="text-xs text-blue-600">{testimonial.company}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-10 mb-16 border border-green-200">
            <div className="text-center">
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Your Privacy is Our Priority</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                <div className="flex items-center space-x-2 justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Local Processing Only</span>
                </div>
                <div className="flex items-center space-x-2 justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">No Data Upload</span>
                </div>
                <div className="flex items-center space-x-2 justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">256-bit Encryption</span>
                </div>
                <div className="flex items-center space-x-2 justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">GDPR Compliant</span>
                </div>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-10">
            <h3 className="text-2xl font-semibold text-gray-900 mb-8">Ready to Transform Your Data Analysis?</h3>
            <button
              onClick={onImportFile}
              disabled={isLoading}
              className="inline-flex items-center space-x-3 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Upload className="h-6 w-6" />
              <span>{isLoading ? 'Processing...' : 'Get Started Now - It\'s Free!'}</span>
              {!isLoading && <ArrowRight className="h-5 w-5" />}
            </button>
            <p className="text-sm text-gray-500 mt-4">
              5-day free trial • No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center space-y-4 shadow-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            <span className="text-gray-700 font-medium">Processing your file...</span>
            <p className="text-sm text-gray-500 text-center">This may take a few moments for large files</p>
          </div>
        </div>
      )}
    </div>
  );
};