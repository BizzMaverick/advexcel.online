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
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(120deg, #23243a 0%, #23243a 60%, #23243a 100%)',
      padding: 0,
      margin: 0,
    }}>
      <img src="/logo.png" alt="Excel Pro Logo" style={{ height: 64, marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 8px #0002' }} />
      <h1 style={{ fontSize: 48, fontWeight: 800, margin: 0, color: '#fff', textAlign: 'center' }}>Excel Pro AI</h1>
      <p style={{ fontSize: 22, color: '#bfc4d1', margin: '18px 0 32px 0', textAlign: 'center', maxWidth: 600 }}>
        AI-powered Excel automation and analytics for everyone. Upload your sheet, type a prompt, and let AI do the work!
      </p>
      <button style={{
        background: 'linear-gradient(90deg, #6a8dff 0%, #7f53ff 100%)',
        color: '#fff',
        fontWeight: 600,
        fontSize: 20,
        border: 'none',
        borderRadius: 8,
        padding: '14px 38px',
        marginBottom: 40,
        cursor: 'pointer',
        boxShadow: '0 2px 8px #0002',
        transition: 'background 0.2s',
      }}>Get Started</button>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 28,
        width: '100%',
        maxWidth: 900,
        margin: '0 auto',
        justifyItems: 'center',
      }}>
        {features.map((feature, idx) => (
          <div key={idx} style={{
            background: 'rgba(40, 42, 60, 0.98)',
            borderRadius: 18,
            boxShadow: '0 2px 12px #0003',
            padding: '32px 28px',
            minHeight: 180,
            width: '100%',
            maxWidth: 340,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            color: '#fff',
            transition: 'transform 0.15s',
          }}>
            <span style={{ fontSize: 36, marginBottom: 12 }}>{feature.icon}</span>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px 0' }}>{feature.title}</h2>
            <p style={{ fontSize: 16, color: '#bfc4d1', margin: 0 }}>{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;