//import React from 'react';

const features = [
  {
    icon: '🤖',
    title: 'AI-Powered Excel Automation',
    description: 'Let AI handle formulas, data cleaning, and repetitive tasks instantly.'
  },
  {
    icon: '💬',
    title: 'Natural Language Prompts',
    description: 'Just type what you want—no coding or complex formulas needed.'
  },
  {
    icon: '📊',
    title: 'Advanced Analytics',
    description: 'Get instant insights, trends, and visualizations from your data.'
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    description: 'Your data stays safe and private—always.'
  }
];

const LandingPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#18181b',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
      padding: '32px 8px'
    }}>
      <img src="/logo.png" alt="Excel Pro Logo" style={{ height: 64, marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 8px #0002' }} />
      <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 12px 0', letterSpacing: '-1px' }}>Excel Pro AI</h1>
      <p style={{ fontSize: '1.25rem', maxWidth: 600, textAlign: 'center', margin: '0 0 24px 0', color: '#b3b3b3' }}>
        AI-powered Excel automation and analytics for everyone. Upload your sheet, type a prompt, and let AI do the work!
      </p>
      <a href="#get-started" style={{
        background: 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)',
        color: '#fff',
        padding: '12px 32px',
        borderRadius: 8,
        fontWeight: 600,
        fontSize: '1.1rem',
        textDecoration: 'none',
        marginBottom: 40,
        boxShadow: '0 2px 8px #0002',
        transition: 'background 0.2s',
        display: 'inline-block'
      }}>Get Started</a>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 24,
        width: '100%',
        maxWidth: 700,
        margin: '0 auto',
        justifyItems: 'center',
      }}>
        {features.map((f, i) => (
          <div key={i} style={{
            background: '#23232b',
            borderRadius: 12,
            padding: 28,
            boxShadow: '0 2px 12px #0001',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            minHeight: 180
          }}>
            <span style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</span>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 8px 0' }}>{f.title}</h2>
            <p style={{ color: '#b3b3b3', margin: 0 }}>{f.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;