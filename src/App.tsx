import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FileSpreadsheet, Upload } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ImportModal from './components/ImportModal';
import ExportModal from './components/ExportModal';
import { AuthModal } from './components/AuthModal';
import { useAuthContext } from './context/AuthContext';

function App() {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [spreadsheetData, setSpreadsheetData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { isAuthenticated, logout } = useAuthContext();

  const handleImportFile = (data: any) => {
    setSpreadsheetData(data);
    setShowImportModal(false);
  };

  const handleExportFile = () => {
    // Export logic will be implemented here
    setShowExportModal(false);
  };

  const handleAuthSuccess = (user: any) => {
    // Handle successful authentication
    setShowAuthModal(false);
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar 
          onImportClick={() => setShowImportModal(true)} 
          onExportClick={() => setShowExportModal(true)}
          onAuthClick={() => setShowAuthModal(true)}
          isAuthenticated={isAuthenticated}
          onLogout={logout}
        />
        
        <div className="flex flex-1">
          <Sidebar />
          
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Dashboard data={spreadsheetData} isLoading={isLoading} />} />
            </Routes>
          </main>
        </div>
        
        <Footer />
        
        {showImportModal && (
          <ImportModal 
            onClose={() => setShowImportModal(false)} 
            onImport={handleImportFile}
            setIsLoading={setIsLoading}
          />
        )}
        
        {showExportModal && (
          <ExportModal 
            onClose={() => setShowExportModal(false)} 
            onExport={handleExportFile}
            hasData={!!spreadsheetData}
          />
        )}
        
        <AuthModal 
          isVisible={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    </Router>
  );
}

export default App;