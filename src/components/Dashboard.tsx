import { useState } from 'react';
import { FileSpreadsheet, Upload, BarChart3, Table, Search } from 'lucide-react';
import SpreadsheetGrid from './SpreadsheetGrid';

interface DashboardProps {
  data: any;
  isLoading: boolean;
}

const Dashboard = ({ data, isLoading }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState('spreadsheet');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-700">Loading your data...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <FileSpreadsheet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">No spreadsheet data loaded</h2>
        <p className="text-gray-500 mb-6">Import an Excel or CSV file to get started</p>
        <button 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={() => {
            // This would be connected to the import modal in a real implementation
            console.log('Import button clicked');
          }}
        >
          <Upload className="h-4 w-4 mr-2" />
          Import File
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">View and analyze your spreadsheet data</p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`${
                activeTab === 'spreadsheet'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab('spreadsheet')}
            >
              <Table className="inline-block h-5 w-5 mr-2 -mt-1" />
              Spreadsheet
            </button>
            <button
              className={`${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab('analytics')}
            >
              <BarChart3 className="inline-block h-5 w-5 mr-2 -mt-1" />
              Analytics
            </button>
            <button
              className={`${
                activeTab === 'ai'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab('ai')}
            >
              <Search className="inline-block h-5 w-5 mr-2 -mt-1" />
              AI Assistant
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'spreadsheet' && (
            <SpreadsheetGrid data={data} />
          )}
          
          {activeTab === 'analytics' && (
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Analytics Coming Soon</h2>
              <p className="text-gray-500">This feature is under development</p>
            </div>
          )}
          
          {activeTab === 'ai' && (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">AI Assistant Coming Soon</h2>
              <p className="text-gray-500">This feature is under development</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;