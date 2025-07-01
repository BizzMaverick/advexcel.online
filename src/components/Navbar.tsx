import { FileSpreadsheet, Upload, Download, Settings, User, LogOut } from 'lucide-react';

interface NavbarProps {
  onImportClick: () => void;
  onExportClick: () => void;
  onAuthClick: () => void;
  isAuthenticated: boolean;
  user: any;
  onLogout: () => void;
}

const Navbar = ({ 
  onImportClick, 
  onExportClick, 
  onAuthClick,
  isAuthenticated,
  user,
  onLogout
}: NavbarProps) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <FileSpreadsheet className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Excel Pro AI</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a href="#" className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Dashboard
              </a>
              <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Analytics
              </a>
              <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Templates
              </a>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={onImportClick}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </button>
            <button
              onClick={onExportClick}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            
            {isAuthenticated ? (
              <div className="flex items-center ml-3">
                <div className="relative">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-gray-700">
                      {user?.email}
                    </div>
                    <button
                      onClick={onLogout}
                      className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <User className="h-4 w-4 mr-2" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;