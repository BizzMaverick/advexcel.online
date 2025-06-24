import React, { useState, useCallback, useEffect } from 'react';
import { FileSpreadsheet, Download, Upload, Save, RotateCcw, BarChart3, TrendingUp, Search, RefreshCw, Table, MessageCircle, Star, LogOut, Shield, X, Crown, Gift, Users, Calculator } from 'lucide-react';
import Papa from 'papaparse';
import { SpreadsheetGrid } from './components/SpreadsheetGrid';
import { CommandBar } from './components/CommandBar';
import { StatusBar } from './components/StatusBar';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { QueryResultsPanel } from './components/QueryResultsPanel';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ExportModal, ExportOptions } from './components/ExportModal';
import { PivotTablePanel } from './components/PivotTablePanel';
import { Sidebar } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';
import { ChatBot } from './components/ChatBot';
import { RatingModal } from './components/RatingModal';
import { WorkbookManager } from './components/WorkbookManager';
import { SubscriptionModal } from './components/SubscriptionModal';
import { SubscriptionBanner } from './components/SubscriptionBanner';
import { ReferralPanel } from './components/ReferralPanel';
import { Footer } from './components/Footer';
import { LegalModals } from './components/LegalModals';
import { FormulaAssistant } from './components/FormulaAssistant';
import { SpreadsheetData, Cell } from './types/spreadsheet';
import { User } from './types/auth';
import { SuggestionFeedback } from './types/chat';
import { WorkbookData } from './types/workbook';
import { TrialInfo } from './types/subscription';
import { CommandProcessor } from './utils/commandProcessor';
import { ExcelFileHandler } from './utils/excelFileHandler';
import { NaturalLanguageProcessor, QueryResult } from './utils/naturalLanguageProcessor';
import { DocumentConverter } from './utils/documentConverter';
import { MultiSheetHandler } from './utils/multiSheetHandler';
import { SubscriptionService } from './utils/subscriptionService';
import { ReferralService } from './utils/referralService';

function App() {
  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Subscription state
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [trialInfo, setTrialInfo] = useState<TrialInfo | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(true); // Default to subscribed for demo
  
  // Referral state
  const [showReferralPanel, setShowReferralPanel] = useState(false);
  
  // Legal modals state
  const [activeLegalModal, setActiveLegalModal] = useState<'terms' | 'privacy' | 'cookies' | 'refunds' | null>(null);
  
  // Formula Assistant state
  const [showFormulaAssistant, setShowFormulaAssistant] = useState(false);
  
  // Application state
  const [workbook, setWorkbook] = useState<WorkbookData | null>(null);
  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetData>({
    cells: {},
    selectedCell: undefined,
    selectedRange: [],
  });

  const [notifications, setNotifications] = useState<Array<{ id: number; message: string; type: 'success' | 'error' | 'info' }>>([]);
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false);
  const [showQueryResults, setShowQueryResults] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPivotPanel, setShowPivotPanel] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  const [suggestions, setSuggestions] = useState<SuggestionFeedback[]>([]);
  const [showPrivacyBanner, setShowPrivacyBanner] = useState(true);

  // Initialize demo user on app load
  useEffect(() => {
    try {
      // Check for existing user or create demo user
      const savedUser = localStorage.getItem('excelAnalyzerUser');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setShowWelcomeScreen(true);
      } else {
        // Create demo user for production
        const demoUser: User = {
          id: 'demo_user_' + Date.now(),
          email: 'user@advexcel.online',
          isVerified: true,
          createdAt: new Date(),
          lastLogin: new Date()
        };
        
        setUser(demoUser);
        localStorage.setItem('excelAnalyzerUser', JSON.stringify(demoUser));
      }

      // Check if privacy banner was dismissed
      const bannerDismissed = localStorage.getItem('privacyBannerDismissed');
      if (bannerDismissed) {
        setShowPrivacyBanner(false);
      }

      // Force HTTPS redirect if on HTTP (only in production)
      if (window.location.protocol === 'http:' && 
          window.location.hostname !== 'localhost' && 
          window.location.hostname !== '127.0.0.1' &&
          !window.location.hostname.includes('local')) {
        window.location.href = window.location.href.replace('http:', 'https:');
      }

      // Handle legal modal links from footer
      const handleHashChange = () => {
        const hash = window.location.hash.substring(1);
        if (['terms', 'privacy', 'cookies', 'refunds'].includes(hash)) {
          setActiveLegalModal(hash as any);
        }
      };

      window.addEventListener('hashchange', handleHashChange);
      handleHashChange(); // Check initial hash

      return () => {
        window.removeEventListener('hashchange', handleHashChange);
      };
    } catch (error) {
      console.error('Error initializing app:', error);
      // Fallback to demo user
      const demoUser: User = {
        id: 'demo_user_fallback',
        email: 'user@advexcel.online',
        isVerified: true,
        createdAt: new Date(),
        lastLogin: new Date()
      };
      setUser(demoUser);
    }
  }, []);

  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const dismissPrivacyBanner = () => {
    setShowPrivacyBanner(false);
    localStorage.setItem('privacyBannerDismissed', 'true');
  };

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
    localStorage.setItem('excelAnalyzerUser', JSON.stringify(userData));
    setShowAuthModal(false);
    setShowWelcomeScreen(true);
    addNotification(`Welcome ${userData.email || userData.phoneNumber}!`, 'success');
  };

  const handleLogout = () => {
    setShowAuthModal(true);
    setWorkbook(null);
    setSpreadsheetData({ cells: {}, selectedCell: undefined, selectedRange: [] });
    setIsDataLoaded(false);
    setShowWelcomeScreen(false);
    addNotification('Please sign in to continue', 'info');
  };

  const handleSubscriptionSuccess = () => {
    setIsSubscribed(true);
    addNotification('Subscription activated successfully!', 'success');
  };

  const checkFeatureAccess = (): boolean => {
    if (!user) {
      addNotification('Please log in to access this feature.', 'error');
      setShowAuthModal(true);
      return false;
    }
    
    // For demo, always allow access
    return true;
  };

  const handleLogoClick = () => {
    // Reset all state to initial values
    setWorkbook(null);
    setSpreadsheetData({
      cells: {},
      selectedCell: undefined,
      selectedRange: [],
    });
    setShowAnalyticsPanel(false);
    setShowQueryResults(false);
    setShowExportModal(false);
    setShowPivotPanel(false);
    setShowFormulaAssistant(false);
    setQueryResult(null);
    setIsDataLoaded(false);
    setIsLoading(false);
    setShowWelcomeScreen(true);
    setNotifications([]);
    
    addNotification('Application reset - Ready for new data import', 'info');
  };

  const handleCellChange = useCallback((cellId: string, value: any, formula?: string) => {
    if (!checkFeatureAccess()) return;
    
    setSpreadsheetData(prev => {
      const [col, row] = [cellId.match(/[A-Z]+/)?.[0] || '', cellId.match(/\d+/)?.[0] || ''];
      const rowNum = parseInt(row);
      const colNum = col.split('').reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 64), 0);

      const newCell: Cell = {
        id: cellId,
        row: rowNum,
        col: colNum,
        value: formula ? value : (isNaN(Number(value)) ? value : Number(value)),
        formula,
        type: formula ? 'formula' : (isNaN(Number(value)) ? 'text' : 'number'),
      };

      const newCells = {
        ...prev.cells,
        [cellId]: newCell,
      };

      // Update workbook if it exists
      if (workbook) {
        const updatedWorkbook = MultiSheetHandler.updateWorksheetCells(
          workbook,
          workbook.activeWorksheet,
          newCells
        );
        setWorkbook(updatedWorkbook);
      }

      return {
        ...prev,
        cells: newCells,
      };
    });
  }, [workbook, user]);

  const handleCellFormat = useCallback((cellId: string, format: any) => {
    if (!checkFeatureAccess()) return;
    
    setSpreadsheetData(prev => {
      const existingCell = prev.cells[cellId];
      if (!existingCell) return prev;

      const updatedCell = {
        ...existingCell,
        format: { ...existingCell.format, ...format }
      };

      return {
        ...prev,
        cells: {
          ...prev.cells,
          [cellId]: updatedCell
        }
      };
    });
  }, [user]);

  const handleCellSelect = useCallback((cellId: string) => {
    setSpreadsheetData(prev => ({
      ...prev,
      selectedCell: cellId,
    }));
  }, []);

  const handleExecuteCommand = useCallback((command: string) => {
    if (!checkFeatureAccess()) return;
    
    try {
      // Process multi-sheet queries if workbook exists
      let targetCells = spreadsheetData.cells;
      let processedCommand = command;

      if (workbook) {
        const { targetWorksheet, processedQuery } = MultiSheetHandler.processNaturalLanguageQuery(workbook, command);
        
        if (targetWorksheet && targetWorksheet !== workbook.activeWorksheet) {
          const targetSheet = workbook.worksheets.find(ws => ws.name === targetWorksheet);
          if (targetSheet) {
            targetCells = targetSheet.cells;
            processedCommand = processedQuery;
            addNotification(`Processing query on sheet: ${targetWorksheet}`, 'info');
          }
        }
      }

      // Check if this is a natural language query
      const queryKeywords = ['extract', 'show', 'find', 'get', 'filter', 'region', 'product', 'sales', 'top', 'bottom'];
      const isNaturalQuery = queryKeywords.some(keyword => processedCommand.toLowerCase().includes(keyword));

      if (isNaturalQuery && Object.keys(targetCells).length > 0) {
        // Process as natural language query
        const nlProcessor = new NaturalLanguageProcessor(targetCells);
        const result = nlProcessor.processQuery(processedCommand);
        
        setQueryResult(result);
        setShowQueryResults(true);
        
        if (result.success) {
          addNotification(result.message, 'success');
        } else {
          addNotification(result.message, 'error');
        }
        return;
      }

      // Process as traditional Excel command
      const processor = new CommandProcessor({ cells: targetCells, selectedCell: spreadsheetData.selectedCell, selectedRange: spreadsheetData.selectedRange });
      const result = processor.processCommand(processedCommand);
      
      if (result.success) {
        addNotification(result.message, 'success');
        
        // Handle specific command results
        if (result.data) {
          switch (result.data.type) {
            case 'analytics':
              setShowAnalyticsPanel(true);
              break;
            case 'chart':
              setShowAnalyticsPanel(true);
              addNotification('Chart generated successfully', 'success');
              break;
            case 'outliers':
              addNotification(`Found ${result.data.outliers.reduce((sum: number, col: any) => sum + col.outliers.length, 0)} outliers`, 'info');
              break;
            case 'quality':
              addNotification(`Data completeness: ${result.data.completenessRate.toFixed(1)}%`, 'info');
              break;
            case 'forecast':
              addNotification(`Forecast generated for ${result.data.forecasts.length} columns`, 'success');
              break;
            case 'conditional_format':
              addNotification('Conditional formatting applied successfully', 'success');
              break;
            case 'vlookup':
              addNotification('VLOOKUP formula ready to apply', 'info');
              break;
            case 'pivot':
              setShowPivotPanel(true);
              addNotification('Pivot table builder opened', 'success');
              break;
            case 'calculation':
              addNotification(`Result: ${result.data.result}`, 'success');
              break;
          }
        }
      } else {
        addNotification(result.message, 'error');
      }
    } catch (error) {
      console.error('Error executing command:', error);
      addNotification('Error executing command. Please try again.', 'error');
    }
  }, [spreadsheetData, workbook, user]);

  const calculateSelectionStats = () => {
    if (!spreadsheetData.selectedCell) return undefined;
    
    const cell = spreadsheetData.cells[spreadsheetData.selectedCell];
    if (!cell || typeof cell.value !== 'number') return undefined;

    return {
      sum: cell.value,
      count: 1,
      average: cell.value,
    };
  };

  const handleImportFile = () => {
    if (!checkFeatureAccess()) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls,.xlsm,.xlsb,.ods,.pdf,.doc,.docx,.txt';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsLoading(true);
      
      try {
        let newWorkbook: WorkbookData | null = null;
        let newCells: { [key: string]: Cell } = {};
        
        if (DocumentConverter.isDocumentFile(file.name)) {
          // Handle document conversion
          let conversion;
          const extension = file.name.toLowerCase().split('.').pop();
          
          if (extension === 'pdf') {
            conversion = await DocumentConverter.convertPdfToExcel(file);
          } else if (extension === 'txt') {
            conversion = await DocumentConverter.convertTextToExcel(file);
          } else {
            conversion = await DocumentConverter.convertWordToExcel(file);
          }
          
          if (conversion.success) {
            newWorkbook = conversion.convertedData;
            newCells = newWorkbook.worksheets[0].cells;
            addNotification(`Document converted successfully: ${conversion.conversionLog.length} steps completed`, 'success');
          } else {
            throw new Error('Document conversion failed');
          }
        } else if (ExcelFileHandler.isExcelFile(file.name)) {
          // Handle multi-sheet Excel files
          newWorkbook = await MultiSheetHandler.readMultiSheetExcel(file);
          const activeSheet = newWorkbook.worksheets.find(ws => ws.isActive);
          newCells = activeSheet?.cells || {};
          addNotification(`Excel workbook imported: ${newWorkbook.worksheets.length} sheets loaded`, 'success');
        } else if (ExcelFileHandler.isCSVFile(file.name)) {
          // Handle CSV files
          await new Promise<void>((resolve, reject) => {
            Papa.parse(file, {
              complete: (results) => {
                try {
                  const rows = results.data as string[][];
                  
                  rows.forEach((row, rowIndex) => {
                    row.forEach((cellValue, colIndex) => {
                      if (cellValue && cellValue.trim()) {
                        const cellId = `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`;
                        const numValue = Number(cellValue.trim());
                        newCells[cellId] = {
                          id: cellId,
                          row: rowIndex + 1,
                          col: colIndex + 1,
                          value: isNaN(numValue) ? cellValue.trim() : numValue,
                          type: isNaN(numValue) ? 'text' : 'number',
                        };
                      }
                    });
                  });
                  
                  // Create a simple workbook for CSV
                  newWorkbook = {
                    id: Date.now().toString(),
                    name: file.name.replace(/\.[^/.]+$/, ''),
                    worksheets: [{
                      name: 'Sheet1',
                      cells: newCells,
                      isActive: true,
                      rowCount: rows.length,
                      columnCount: rows[0]?.length || 0
                    }],
                    activeWorksheet: 'Sheet1',
                    createdAt: new Date(),
                    lastModified: new Date()
                  };
                  
                  addNotification(`CSV imported successfully: ${rows.length} rows, ${rows[0]?.length || 0} columns`, 'success');
                  resolve();
                } catch (error) {
                  reject(error);
                }
              },
              header: false,
              skipEmptyLines: true,
              error: (error) => reject(error)
            });
          });
        } else {
          throw new Error('Unsupported file format');
        }

        setWorkbook(newWorkbook);
        setSpreadsheetData(prev => ({
          ...prev,
          cells: newCells,
        }));
        setIsDataLoaded(true);
        setShowWelcomeScreen(false);
        
      } catch (error) {
        console.error('Import error:', error);
        addNotification(
          `Failed to import file: ${error instanceof Error ? error.message : 'Unknown error'}`, 
          'error'
        );
      } finally {
        setIsLoading(false);
      }
    };
    input.click();
  };

  const handleWorksheetChange = (worksheetName: string) => {
    if (!workbook) return;
    
    const updatedWorkbook = MultiSheetHandler.switchWorksheet(workbook, worksheetName);
    setWorkbook(updatedWorkbook);
    
    const activeSheet = updatedWorkbook.worksheets.find(ws => ws.name === worksheetName);
    if (activeSheet) {
      setSpreadsheetData(prev => ({
        ...prev,
        cells: activeSheet.cells,
        selectedCell: undefined,
        selectedRange: []
      }));
    }
    
    addNotification(`Switched to sheet: ${worksheetName}`, 'info');
  };

  const handleWorksheetAdd = (name: string) => {
    if (!workbook) return;
    
    try {
      const updatedWorkbook = MultiSheetHandler.addWorksheet(workbook, name);
      setWorkbook(updatedWorkbook);
      addNotification(`Sheet "${name}" added successfully`, 'success');
    } catch (error) {
      addNotification(error instanceof Error ? error.message : 'Failed to add sheet', 'error');
    }
  };

  const handleWorksheetDelete = (name: string) => {
    if (!workbook) return;
    
    try {
      const updatedWorkbook = MultiSheetHandler.deleteWorksheet(workbook, name);
      setWorkbook(updatedWorkbook);
      
      // Update current data if we deleted the active sheet
      if (name === workbook.activeWorksheet) {
        const newActiveSheet = updatedWorkbook.worksheets.find(ws => ws.isActive);
        if (newActiveSheet) {
          setSpreadsheetData(prev => ({
            ...prev,
            cells: newActiveSheet.cells,
            selectedCell: undefined,
            selectedRange: []
          }));
        }
      }
      
      addNotification(`Sheet "${name}" deleted successfully`, 'success');
    } catch (error) {
      addNotification(error instanceof Error ? error.message : 'Failed to delete sheet', 'error');
    }
  };

  const handleWorksheetRename = (oldName: string, newName: string) => {
    if (!workbook) return;
    
    const updatedWorkbook = MultiSheetHandler.renameWorksheet(workbook, oldName, newName);
    setWorkbook(updatedWorkbook);
    addNotification(`Sheet renamed from "${oldName}" to "${newName}"`, 'success');
  };

  const handleExport = (options: ExportOptions) => {
    if (!checkFeatureAccess()) return;
    
    if (!workbook) {
      addNotification('No workbook to export', 'error');
      return;
    }

    try {
      switch (options.format) {
        case 'xlsx':
        case 'xls':
          MultiSheetHandler.exportMultiSheetExcel(workbook, `${options.fileName}.${options.format}`);
          addNotification(`${options.format.toUpperCase()} file exported successfully`, 'success');
          break;

        case 'csv':
          // Export active sheet as CSV
          const activeSheet = workbook.worksheets.find(ws => ws.isActive);
          if (activeSheet) {
            exportToCSV(options.fileName || 'spreadsheet_export', activeSheet.cells);
          }
          break;

        case 'json':
          exportToJSON(options.fileName || 'spreadsheet_export');
          break;

        default:
          throw new Error('Unsupported export format');
      }
    } catch (error) {
      console.error('Export error:', error);
      addNotification(
        `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        'error'
      );
    }
  };

  const exportToCSV = (fileName: string, cells: { [key: string]: Cell }) => {
    const cellEntries = Object.entries(cells);
    const rows = new Set<number>();
    const cols = new Set<number>();
    
    cellEntries.forEach(([_, cell]) => {
      rows.add(cell.row);
      cols.add(cell.col);
    });

    const maxRow = Math.max(...rows);
    const maxCol = Math.max(...cols);

    const csvData: string[][] = [];
    for (let row = 1; row <= maxRow; row++) {
      const rowData: string[] = [];
      for (let col = 1; col <= maxCol; col++) {
        const cellId = `${String.fromCharCode(64 + col)}${row}`;
        const cell = cells[cellId];
        rowData.push(cell ? String(cell.value) : '');
      }
      csvData.push(rowData);
    }

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addNotification('CSV file exported successfully', 'success');
  };

  const exportToJSON = (fileName: string) => {
    if (!workbook) return;
    
    const data = {
      workbook: workbook,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addNotification('JSON file exported successfully', 'success');
  };

  const handleExportQueryResults = (data: any[]) => {
    if (!checkFeatureAccess()) return;
    
    if (data.length === 0) return;

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'query_results.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addNotification('Query results exported successfully', 'success');
  };

  const handleSuggestionSubmit = (suggestion: SuggestionFeedback) => {
    setSuggestions(prev => [...prev, suggestion]);
    
    // In a real app, you'd send this to your backend
    console.log('New suggestion received:', suggestion);
    
    // Simulate sending to developer
    addNotification('Thank you for your feedback! We\'ll review your suggestion.', 'success');
  };

  const handleRatingSubmit = (rating: any) => {
    localStorage.setItem('excelAnalyzerRated', 'true');
    
    // In a real app, you'd send this to your analytics service
    console.log('Rating submitted:', rating);
    
    addNotification('Thank you for rating Excel Analyzer Pro!', 'success');
  };

  const selectedCell = spreadsheetData.selectedCell ? spreadsheetData.cells[spreadsheetData.selectedCell] : undefined;

  const enhancedSuggestions = [
    // Natural Language Queries
    'Extract west region data',
    'Show top 10 sales records',
    'Find products with highest revenue',
    'Get sales data for 2024',
    'Filter by product category electronics',
    'Show bottom 5 performers',
    'Extract data for January 2024',
    'Find records where sales > 1000',
    'Compare north vs south region',
    'Show total sales by region',
    
    // Multi-sheet queries
    'Extract data from Sheet2',
    'Compare Sheet1 vs Sheet2',
    'Analyze sales sheet data',
    'Show summary from all sheets',
    
    // Data Analytics
    'Analyze data for insights and trends',
    'Find outliers in the dataset',
    'Calculate correlation between columns',
    'Generate forecast for next 5 periods',
    'Assess data quality and completeness',
    'Create distribution analysis',
    'Perform statistical analysis',
    
    // Excel Functions via Natural Language
    'Perform VLOOKUP on column A using table B1:D10',
    'Calculate SUM of range E1:E20',
    'Apply AVERAGE function to column C',
    'Create IF formula for column D where value > 100',
    'Apply nested IF to categorize data',
    'Use COUNTIF to count cells containing "Sales"',
    'Apply SUMIF where region equals "West"',
    'Create CONCATENATE formula for names',
    'Use INDEX MATCH instead of VLOOKUP',
    'Apply ROUND function to 2 decimal places',
    'Calculate MEDIAN of selected range',
    'Use TRIM to clean text data',
    'Apply UPPER case to text column',
    'Create DATE formula from separate columns',
    'Calculate DATEDIF between two dates',
    'Use PMT for loan calculations',
    'Apply conditional formatting to highlight values',
    'Create pivot table from A1:D10',
    'Filter data where column A contains "Sales"',
    'Format range as currency',
    'Open formula assistant',
    'Show formula helper',
    'Excel function help',
  ];

  // Show authentication modal if not logged in
  if (!user) {
    return (
      <>
        <AuthModal
          isVisible={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
        {!showAuthModal && (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
            <div className="text-center">
              <div className="mb-6">
                <img 
                  src="/Tech Company Logo Excel Pro AI, Blue and Silver.png" 
                  alt="Excel Pro AI" 
                  className="h-24 w-24 mx-auto mb-4"
                />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Excel Pro AI</h1>
              <p className="text-slate-300 mb-6">Advanced spreadsheet analysis with AI-powered insights</p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Show welcome screen if no data is loaded
  if (showWelcomeScreen && !isDataLoaded) {
    return (
      <div className="min-h-screen flex flex-col">
        <WelcomeScreen onImportFile={handleImportFile} isLoading={isLoading} />
        <Footer 
          onReferralClick={() => setShowReferralPanel(true)}
          onRatingClick={() => setShowRatingModal(true)}
        />
        
        {/* Referral Panel */}
        <ReferralPanel
          isVisible={showReferralPanel}
          onClose={() => setShowReferralPanel(false)}
          userId={user.id}
        />

        {/* Rating Modal */}
        <RatingModal
          isVisible={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          onSubmitRating={handleRatingSubmit}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Privacy Banner */}
      {showPrivacyBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2 px-4 z-50 shadow-lg">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <Shield className="h-4 w-4 flex-shrink-0" />
              <div className="flex items-center space-x-2 overflow-hidden">
                <div className="animate-pulse">
                  <span className="text-sm font-medium">🔒 Privacy Protected</span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-sm">•</span>
                </div>
                <div className="whitespace-nowrap animate-marquee">
                  <span className="text-sm">All data processing happens locally in your browser • Your files never leave your device • 100% secure and private</span>
                </div>
              </div>
            </div>
            <button
              onClick={dismissPrivacyBanner}
              className="text-white hover:text-cyan-100 transition-colors ml-4 flex-shrink-0"
              title="Dismiss privacy notice"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Subscription Banner */}
      <div className={`fixed top-0 left-0 right-0 z-40`}>
        <SubscriptionBanner
          trialInfo={trialInfo}
          isSubscribed={isSubscribed}
          onUpgradeClick={() => setShowSubscriptionModal(true)}
        />
      </div>

      {/* Sidebar */}
      <Sidebar
        onAnalyticsClick={() => {
          if (checkFeatureAccess()) setShowAnalyticsPanel(true);
        }}
        onPivotTableClick={() => {
          if (checkFeatureAccess()) setShowPivotPanel(true);
        }}
        onExportClick={() => {
          if (checkFeatureAccess()) setShowExportModal(true);
        }}
        onImportClick={handleImportFile}
        isDataLoaded={isDataLoaded}
      />

      {/* Main Content */}
      <div className={`flex-1 ml-16 flex flex-col ${
        trialInfo && !isSubscribed ? 'mt-12' : ''
      }`}>
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity duration-200"
              onClick={handleLogoClick}
              title="Click to refresh and start new analysis"
            >
              <div className="relative">
                <img 
                  src="/Tech Company Logo Excel Pro AI, Blue and Silver.png" 
                  alt="Excel Pro AI" 
                  className="h-10 w-10"
                />
                <RefreshCw className="h-3 w-3 text-cyan-500 absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">Excel Pro AI</h1>
                <p className="text-sm text-slate-500">Advanced spreadsheet analysis with natural language queries and AI-powered insights</p>
              </div>
            </div>
            
            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {!isSubscribed && (
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-colors shadow-md"
                >
                  <Crown className="h-4 w-4" />
                  <span>Upgrade</span>
                </button>
              )}
              
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Shield className="h-4 w-4 text-cyan-600" />
                <span>{user.email || user.phoneNumber}</span>
                {isSubscribed && (
                  <span className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded-full text-xs font-medium">
                    Pro
                  </span>
                )}
                {trialInfo?.isTrialActive && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    Trial: {trialInfo.daysRemaining}d
                  </span>
                )}
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Workbook Manager */}
        {workbook && (
          <WorkbookManager
            workbook={workbook}
            onWorksheetChange={handleWorksheetChange}
            onWorksheetAdd={handleWorksheetAdd}
            onWorksheetDelete={handleWorksheetDelete}
            onWorksheetRename={handleWorksheetRename}
          />
        )}

        {/* Command Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="mb-2">
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Search className="h-4 w-4" />
              <span className="font-medium">Try natural language queries and Excel functions:</span>
              <span className="text-cyan-600">"perform vlookup"</span>
              <span className="text-slate-400">•</span>
              <span className="text-cyan-600">"calculate sum of range A1:A10"</span>
              <span className="text-slate-400">•</span>
              <span className="text-cyan-600">"open formula assistant"</span>
              {workbook && workbook.worksheets.length > 1 && (
                <>
                  <span className="text-slate-400">•</span>
                  <span className="text-cyan-600">"analyze Sheet2 data"</span>
                </>
              )}
            </div>
          </div>
          <CommandBar 
            onExecuteCommand={(command) => {
              // Check if command is for formula assistant
              const formulaCommands = ['formula assistant', 'formula helper', 'excel function help', 'open formula assistant', 'show formula helper'];
              if (formulaCommands.some(cmd => command.toLowerCase().includes(cmd))) {
                setShowFormulaAssistant(true);
                addNotification('Formula Assistant opened', 'success');
                return;
              }
              handleExecuteCommand(command);
            }} 
            suggestions={enhancedSuggestions}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Spreadsheet Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-6 overflow-hidden">
              <SpreadsheetGrid
                data={spreadsheetData}
                onCellChange={handleCellChange}
                onCellSelect={handleCellSelect}
              />
            </div>
            
            {/* Status Bar */}
            <StatusBar
              selectedCell={spreadsheetData.selectedCell}
              cell={selectedCell}
              calculations={calculateSelectionStats()}
            />
          </div>
        </div>

        {/* Footer */}
        <Footer 
          onReferralClick={() => setShowReferralPanel(true)}
          onRatingClick={() => setShowRatingModal(true)}
        />
      </div>

      {/* Dynamic Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowChatBot(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
          title="Need help? Chat with us!"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      </div>

      {/* Analytics Panel */}
      <AnalyticsPanel
        data={spreadsheetData}
        isVisible={showAnalyticsPanel}
        onClose={() => setShowAnalyticsPanel(false)}
      />

      {/* Query Results Panel */}
      <QueryResultsPanel
        result={queryResult}
        isVisible={showQueryResults}
        onClose={() => setShowQueryResults(false)}
        onExport={handleExportQueryResults}
      />

      {/* Pivot Table Panel */}
      <PivotTablePanel
        data={spreadsheetData}
        isVisible={showPivotPanel}
        onClose={() => setShowPivotPanel(false)}
        onExport={handleExportQueryResults}
      />

      {/* Export Modal */}
      <ExportModal
        isVisible={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        hasData={Object.keys(spreadsheetData.cells).length > 0}
      />

      {/* Formula Assistant */}
      <FormulaAssistant
        cells={spreadsheetData.cells}
        onCellUpdate={handleCellChange}
        onCellFormat={handleCellFormat}
        isVisible={showFormulaAssistant}
        onClose={() => setShowFormulaAssistant(false)}
      />

      {/* Subscription Modal */}
      <SubscriptionModal
        isVisible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        userId={user.id}
        onSubscriptionSuccess={handleSubscriptionSuccess}
      />

      {/* Referral Panel */}
      <ReferralPanel
        isVisible={showReferralPanel}
        onClose={() => setShowReferralPanel(false)}
        userId={user.id}
      />

      {/* Chat Bot */}
      <ChatBot
        isVisible={showChatBot}
        onClose={() => setShowChatBot(false)}
        onSuggestionSubmit={handleSuggestionSubmit}
      />

      {/* Rating Modal */}
      <RatingModal
        isVisible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmitRating={handleRatingSubmit}
      />

      {/* Legal Modals */}
      <LegalModals
        activeModal={activeLegalModal}
        onClose={() => {
          setActiveLegalModal(null);
          window.history.pushState('', document.title, window.location.pathname);
        }}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-600"></div>
            <span className="text-slate-700">Processing file...</span>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className={`fixed top-4 right-4 space-y-2 z-50 ${showPrivacyBanner ? 'mb-16' : ''}`}>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`
              px-4 py-3 rounded-lg shadow-lg transition-all duration-300 max-w-md
              ${notification.type === 'success' ? 'bg-cyan-500 text-white' :
                notification.type === 'error' ? 'bg-red-500 text-white' :
                'bg-blue-500 text-white'}
            `}
          >
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;