import React from 'react';
import { FileSpreadsheet, Upload, BarChart3, TrendingUp, Search, Zap, Database, Shield, Star, Users, CheckCircle, ArrowRight, Play, BookOpen, Target, Award, Plus } from 'lucide-react';

interface WelcomeScreenProps {
  onImportFile: () => void;
  onCreateNewSheet: () => void;
  isLoading: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onImportFile, onCreateNewSheet, isLoading }) => {
  const features = [
    {
      icon: Search,
      title: 'Natural Language Commands',
      description: 'Use simple English to manipulate data: "add data value 100 to cell A1", "apply formula", "format cells"',
      color: 'text-cyan-600 bg-cyan-100',
      benefits: ['No complex formulas needed', 'Instant data manipulation', 'Plain English commands']
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Automatic trend analysis, correlation detection, and outlier identification',
      color: 'text-blue-600 bg-blue-100',
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
      title: 'Full Excel Functionality',
      description: 'Complete Excel features with formulas, conditional formatting, pivot tables, and more',
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
      comment: "Excel Pro AI has revolutionized how I work with spreadsheets. The natural language commands save me hours every day!",
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
      title: "Create or Import Data",
      description: "Start with a new sheet or upload Excel, CSV, PDF, Word documents, or other supported formats",
      details: "Create from templates or drag and drop your files. We support all major spreadsheet formats plus document conversion.",
      icon: Upload,
      color: "from-cyan-500 to-blue-500"
    },
    {
      number: "2", 
      title: "Use Natural Language Commands",
      description: "Manipulate data with simple English commands - no complex formulas required",
      details: "Type commands like 'add data value 100 to cell A1' or 'apply formula =SUM(A1:A10) to cell B1'.",
      icon: Search,
      color: "from-blue-500 to-purple-500"
    },
    {
      number: "3",
      title: "Get AI-Powered Insights",
      description: "Receive instant analytics, visualizations, and actionable insights",
      details: "View charts, pivot tables, statistical analysis, and forecasts generated automatically from your data.",
      icon: BarChart3,
      color: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex flex-col">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <img 
              src="/Tech Company Logo Excel Pro AI, Blue and Silver.png" 
              alt="Excel Pro AI" 
              className="h-8 w-8"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">Excel Pro AI</h1>
              <p className="text-sm text-slate-300">Advanced spreadsheet analysis with AI-powered insights</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-cyan-400">
              <Shield className="h-4 w-4" />
              <span className="font-medium">100% Private & Secure</span>
            </div>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
              ))}
              <span className="text-sm text-slate-300 ml-1">4.9/5 (1,200+ reviews)</span>
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
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mb-6 shadow-2xl">
                <img 
                  src="/Tech Company Logo Excel Pro AI, Blue and Silver.png" 
                  alt="Excel Pro AI" 
                  className="h-12 w-12"
                />
              </div>
              <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
                Create & Analyze Spreadsheets with
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> AI Power</span>
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Create new Excel sheets, import existing files, and manipulate data using natural language commands. 
                Apply formulas, conditional formatting, and advanced analytics - all while keeping your data 100% private and secure.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={onCreateNewSheet}
                disabled={isLoading}
                className="group inline-flex items-center space-x-3 px-10 py-5 text-xl font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2"
              >
                <Plus className="h-7 w-7 group-hover:scale-110 transition-transform" />
                <span>Create New Sheet</span>
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onImportFile}
                disabled={isLoading}
                className="group inline-flex items-center space-x-3 px-10 py-5 text-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2"
              >
                <Upload className="h-7 w-7 group-hover:scale-110 transition-transform" />
                <span>{isLoading ? 'Processing...' : 'Import Existing File'}</span>
                {isLoading && <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>}
                {!isLoading && <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
            
            <div className="mt-6 text-sm text-slate-400">
              <p className="mb-3 font-medium">Supported formats:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {supportedFormats.map((format, index) => (
                  <span key={index} className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-xs border border-white/20 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-2">
                    <span className="text-lg">{format.icon}</span>
                    <div>
                      <strong className="text-white">{format.format}</strong> 
                      <span className="text-slate-400 ml-1">{format.extensions}</span>
                    </div>
                  </span>
                ))}
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 mb-16 mt-8">
              <div className="flex items-center space-x-2 text-cyan-400">
                <Shield className="h-5 w-5" />
                <span className="font-medium">Privacy First</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-400">
                <Users className="h-5 w-5" />
                <span className="font-medium">10,000+ Users</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-400">
                <Zap className="h-5 w-5" />
                <span className="font-medium">AI Powered</span>
              </div>
              <div className="flex items-center space-x-2 text-orange-400">
                <Database className="h-5 w-5" />
                <span className="font-medium">200+ Functions</span>
              </div>
            </div>
          </div>

          {/* How It Works - Redesigned */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold text-white mb-4">How It Works</h3>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Get from idea to insights in just three simple steps
              </p>
            </div>
            
            <div className="relative">
              {/* Connection Lines */}
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400/30 via-blue-400/30 to-purple-400/30 transform -translate-y-1/2"></div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                {steps.map((step, index) => {
                  const IconComponent = step.icon;
                  return (
                    <div key={index} className="relative group">
                      {/* Step Card */}
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-white/30 transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2">
                        {/* Step Number & Icon */}
                        <div className="relative mb-6">
                          <div className={`w-20 h-20 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <IconComponent className="h-10 w-10 text-white" />
                          </div>
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-cyan-500 rounded-full flex items-center justify-center text-sm font-bold text-cyan-600">
                            {step.number}
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="text-center">
                          <h4 className="text-2xl font-bold text-white mb-3">{step.title}</h4>
                          <p className="text-slate-300 text-lg mb-4 leading-relaxed">{step.description}</p>
                          <p className="text-slate-400 text-sm leading-relaxed">{step.details}</p>
                        </div>
                        
                        {/* Visual Enhancement */}
                        <div className="mt-6 flex justify-center">
                          <div className="w-12 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></div>
                        </div>
                      </div>
                      
                      {/* Arrow for larger screens */}
                      {index < steps.length - 1 && (
                        <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-10">
                          <ArrowRight className="h-8 w-8 text-cyan-400/60" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Additional Info */}
            <div className="mt-12 text-center">
              <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl p-6 border border-cyan-400/30 max-w-4xl mx-auto">
                <h4 className="text-xl font-semibold text-white mb-3">Why Choose Excel Pro AI?</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="flex items-center space-x-2 justify-center">
                    <CheckCircle className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                    <span className="text-slate-300">No technical expertise required</span>
                  </div>
                  <div className="flex items-center space-x-2 justify-center">
                    <CheckCircle className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                    <span className="text-slate-300">Instant results in seconds</span>
                  </div>
                  <div className="flex items-center space-x-2 justify-center">
                    <CheckCircle className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                    <span className="text-slate-300">100% privacy guaranteed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-white text-center mb-10">Powerful Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="group bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 hover:border-white/30 transform hover:-translate-y-1">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-4">{feature.title}</h3>
                    <p className="text-slate-300 leading-relaxed mb-4">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center space-x-2 text-sm text-slate-300">
                          <CheckCircle className="h-4 w-4 text-cyan-400" />
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
            <h3 className="text-3xl font-bold text-white text-center mb-10">Perfect For Every Use Case</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {useCases.map((useCase, index) => {
                const IconComponent = useCase.icon;
                return (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-white/20">
                    <IconComponent className="h-8 w-8 text-cyan-400 mb-4" />
                    <h4 className="text-lg font-semibold text-white mb-2">{useCase.title}</h4>
                    <p className="text-slate-300 text-sm mb-4">{useCase.description}</p>
                    <ul className="space-y-1">
                      {useCase.examples.map((example, idx) => (
                        <li key={idx} className="text-xs text-slate-400 flex items-center space-x-1">
                          <span className="w-1 h-1 bg-cyan-400 rounded-full"></span>
                          <span>{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Example Commands */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-10 shadow-xl mb-16 border border-white/20">
            <div className="text-center mb-8">
              <Zap className="h-10 w-10 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-white mb-4">Try These Natural Language Commands</h3>
              <p className="text-slate-300 text-lg">Once you create or import data, you can use simple English commands</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'Add data value 100 to cell A1',
                'Apply formula =SUM(A1:A10) to cell B1',
                'Format range A1:A10 if value > 100 with red background',
                'Sort range A1:A10 ascending',
                'Insert row at position 5',
                'Merge cells A1:C1',
                'Clear range B1:B10',
                'Copy A1:A5 to B1',
                'Create pivot table from data',
                'Apply conditional formatting',
                'Calculate average of column C',
                'Open formula assistant'
              ].map((command, index) => (
                <div key={index} className="group bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl p-4 border border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-200 hover:shadow-md cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <Play className="h-4 w-4 text-cyan-400 group-hover:text-cyan-300" />
                    <code className="text-cyan-300 text-sm font-medium group-hover:text-cyan-200 transition-colors">"{command}"</code>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-white text-center mb-10">What Our Users Say</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-shadow">
                  <div className="flex items-center space-x-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-300 mb-4 italic">"{testimonial.comment}"</p>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{testimonial.avatar}</div>
                    <div>
                      <p className="font-semibold text-white">{testimonial.name}</p>
                      <p className="text-sm text-slate-400">{testimonial.role}</p>
                      <p className="text-xs text-cyan-400">{testimonial.company}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl p-10 border border-cyan-400/30">
            <div className="text-center">
              <Shield className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-4">Your Privacy is Our Priority</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                <div className="flex items-center space-x-2 justify-center">
                  <CheckCircle className="h-5 w-5 text-cyan-400" />
                  <span className="text-slate-300">Local Processing Only</span>
                </div>
                <div className="flex items-center space-x-2 justify-center">
                  <CheckCircle className="h-5 w-5 text-cyan-400" />
                  <span className="text-slate-300">No Data Upload</span>
                </div>
                <div className="flex items-center space-x-2 justify-center">
                  <CheckCircle className="h-5 w-5 text-cyan-400" />
                  <span className="text-slate-300">256-bit Encryption</span>
                </div>
                <div className="flex items-center space-x-2 justify-center">
                  <CheckCircle className="h-5 w-5 text-cyan-400" />
                  <span className="text-slate-300">GDPR Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center space-y-4 shadow-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-cyan-600"></div>
            <span className="text-slate-700 font-medium">Processing your file...</span>
            <p className="text-sm text-slate-500 text-center">This may take a few moments for large files</p>
          </div>
        </div>
      )}
    </div>
  );
};