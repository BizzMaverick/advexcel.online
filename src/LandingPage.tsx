//import React from 'react';
import { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';

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
  const [showUploader, setShowUploader] = useState(false);
  const [sheetLoaded, setSheetLoaded] = useState(false);
  const [prompt, setPrompt] = useState('');
  const luckysheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clean up Luckysheet instance on unmount
    return () => {
      if (document.getElementById('luckysheet')) {
        document.getElementById('luckysheet')!.innerHTML = '';
      }
    };
  }, []);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const json: (string | number | null)[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    // Prepare Luckysheet data
    const luckysheetData = [
      {
        name: sheetName,
        data: json.map(row => row.map(cell => ({ v: cell })))
      }
    ];
    // Destroy previous instance if any
    if (document.getElementById('luckysheet')) {
      document.getElementById('luckysheet')!.innerHTML = '';
    }
    // @ts-ignore
    window.luckysheet.create({
      container: 'luckysheet',
      data: luckysheetData,
      showinfobar: false,
      showtoolbar: true,
      showstatbar: true,
      allowEdit: true,
      lang: 'en',
      gridKey: '',
      allowCopy: true,
      allowEditName: true,
      allowAddRow: true,
      allowAddColumn: true,
      allowDeleteRow: true,
      allowDeleteColumn: true,
      allowSort: true,
      allowFilter: true,
      allowMoveRow: true,
      allowMoveColumn: true,
      allowInsertImage: true,
      allowInsertLink: true,
      allowInsertChart: true,
      allowInsertShape: true,
      allowInsertComment: true,
      allowInsertFormula: true,
      allowInsertFunction: true,
      allowInsertDropdown: true,
      allowInsertCheckbox: true,
      allowInsertRadio: true,
      allowInsertProgress: true,
      allowInsertSparkline: true,
      allowInsertPivotTable: true,
      allowInsertSlicer: true,
      allowInsertTimeline: true,
      allowInsertGantt: true,
      allowInsertKanban: true,
      allowInsertMindMap: true,
      allowInsertOrgChart: true,
      allowInsertTree: true,
      allowInsertTreeMap: true,
      allowInsertSunburst: true,
      allowInsertFunnel: true,
      allowInsertGauge: true,
      allowInsertRadar: true,
      allowInsertWordCloud: true,
      allowInsertMap: true,
      allowInsertGeoMap: true,
      allowInsertHeatMap: true,
      allowInsertCalendar: true,
      allowInsertTimelineChart: true,
      allowInsertGanttChart: true,
      allowInsertKanbanChart: true,
      allowInsertMindMapChart: true,
      allowInsertOrgChartChart: true,
      allowInsertTreeChart: true,
      allowInsertTreeMapChart: true,
      allowInsertSunburstChart: true,
      allowInsertFunnelChart: true,
      allowInsertGaugeChart: true,
      allowInsertRadarChart: true,
      allowInsertWordCloudChart: true,
      allowInsertMapChart: true,
      allowInsertGeoMapChart: true,
      allowInsertHeatMapChart: true,
      allowInsertCalendarChart: true,
    });
    setSheetLoaded(true);
  };

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
      {!showUploader && (
        <>
          <p style={{ fontSize: 22, color: '#bfc4d1', margin: '18px 0 32px 0', textAlign: 'center', maxWidth: 600 }}>
            AI-powered Excel automation and analytics for everyone. <br />
            <span style={{ fontWeight: 500 }}>
              <button
                style={{
                  background: 'linear-gradient(90deg, #6a8dff 0%, #7f53ff 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 18,
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 18px',
                  margin: '0 4px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px #0002',
                  transition: 'background 0.2s',
                  display: 'inline-block',
                  verticalAlign: 'middle',
                }}
                onClick={() => setShowUploader(true)}
              >
                Get Started
              </button>
            </span>
            to <b>Upload your sheet</b>, type a prompt, and let AI do the work!
          </p>
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
        </>
      )}
      {showUploader && !sheetLoaded && (
        <>
          <p style={{ fontSize: 22, color: '#bfc4d1', margin: '18px 0 32px 0', textAlign: 'center', maxWidth: 600 }}>
            AI-powered Excel automation and analytics for everyone. <br />
            <label style={{ fontWeight: 500, cursor: 'pointer', color: '#7f53ff', textDecoration: 'underline' }}>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFile}
                style={{ display: 'none' }}
              />
              Upload your sheet
            </label>
            , type a prompt, and let AI do the work!
          </p>
        </>
      )}
      {sheetLoaded && (
        <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <input
              type="text"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Type your prompt (e.g., 'Sum column B', 'Remove duplicates', etc.)"
              style={{
                width: 400,
                padding: '10px 16px',
                fontSize: 18,
                borderRadius: 8,
                border: '1px solid #7f53ff',
                outline: 'none',
                marginRight: 8
              }}
            />
            <button
              style={{
                background: 'linear-gradient(90deg, #6a8dff 0%, #7f53ff 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 18,
                border: 'none',
                borderRadius: 8,
                padding: '10px 24px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px #0002',
                transition: 'background 0.2s',
              }}
              disabled={!prompt.trim()}
            >
              Run AI
            </button>
          </div>
          <div id="luckysheet" ref={luckysheetRef} style={{ minHeight: 600, background: '#fff', borderRadius: 8 }} />
        </div>
      )}
    </div>
  );
};

export default LandingPage;