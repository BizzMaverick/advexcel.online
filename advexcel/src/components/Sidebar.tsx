import { BarChart3, Table, Calculator, Search, FileSpreadsheet, Settings } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="w-64 bg-white shadow-md hidden md:block">
      <div className="h-full flex flex-col">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex-1 px-3 space-y-1">
            <a href="#" className="bg-gray-100 text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <FileSpreadsheet className="text-gray-500 mr-3 h-6 w-6" />
              Spreadsheets
            </a>
            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <Table className="text-gray-400 group-hover:text-gray-500 mr-3 h-6 w-6" />
              Data Tables
            </a>
            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <BarChart3 className="text-gray-400 group-hover:text-gray-500 mr-3 h-6 w-6" />
              Charts & Analytics
            </a>
            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <Calculator className="text-gray-400 group-hover:text-gray-500 mr-3 h-6 w-6" />
              Formulas
            </a>
            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <Search className="text-gray-400 group-hover:text-gray-500 mr-3 h-6 w-6" />
              AI Assistant
            </a>
          </div>
        </div>
        <div className="border-t border-gray-200 p-4">
          <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
            <Settings className="text-gray-400 group-hover:text-gray-500 mr-3 h-6 w-6" />
            Settings
          </a>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;