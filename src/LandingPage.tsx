import React from 'react';

const features = [
  {
    title: 'AI-Powered Excel Automation',
    description: 'Let AI handle formulas, data cleaning, and repetitive tasks instantly.',
    icon: '🤖',
  },
  {
    title: 'Natural Language Prompts',
    description: 'Just type what you want—no coding or complex formulas needed.',
    icon: '💬',
  },
  {
    title: 'Advanced Analytics',
    description: 'Get instant insights, trends, and visualizations from your data.',
    icon: '📊',
  },
  {
    title: 'Secure & Private',
    description: 'Your data stays safe—processing happens right in your browser.',
    icon: '🔒',
  },
];

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy via-brand-blue to-brand-cyan flex flex-col items-center justify-center px-4 py-8">
      <header className="flex flex-col items-center mb-12 mt-8">
        <img src="/logo.png" alt="Excel Pro Logo" className="w-32 h-32 mb-6 rounded-full shadow-lg border-4 border-brand-silver" />
        <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow mb-4 text-center">Excel Pro AI</h1>
        <p className="text-xl md:text-2xl text-brand-silver text-center max-w-2xl mb-6">AI-powered Excel automation and analytics for everyone. Upload your sheet, type a prompt, and let AI do the work!</p>
        <a href="#get-started" className="mt-4 px-8 py-4 rounded-full bg-brand-gradient text-white font-bold text-lg shadow-lg hover:scale-105 transition-transform">Get Started</a>
      </header>
      <section className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {features.map((feature) => (
          <div key={feature.title} className="bg-white/10 rounded-2xl shadow-xl p-6 flex flex-col items-center text-center">
            <span className="text-4xl mb-3">{feature.icon}</span>
            <h3 className="text-xl font-bold text-brand-silver mb-2">{feature.title}</h3>
            <p className="text-brand-silver text-base">{feature.description}</p>
          </div>
        ))}
      </section>
      <footer className="mt-auto text-brand-silver text-sm text-center opacity-80">
        &copy; {new Date().getFullYear()} Excel Pro AI. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage; 