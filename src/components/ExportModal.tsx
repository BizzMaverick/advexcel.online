import { useState } from 'react';
import { X, Download, FileSpreadsheet, FileText } from 'lucide-react';

interface ExportModalProps {
  onClose: () => void;
  onExport: () => void;
  hasData: boolean;
}

const ExportModal = ({ onClose, onExport, hasData }: ExportModalProps) => {
  const [format, setFormat] = useState('xlsx');
  const [fileName, setFileName] = useState('spreadsheet_export');

  const handleExport = () => {
    if (!hasData) return;
    onExport();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Export Spreadsheet</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          {!hasData ? (
            <div className="text-center py-4">
              <p className="text-gray-700 mb-4">No data available to export.</p>
              <p className="text-sm text-gray-500">Please import a spreadsheet first.</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Format
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <input
                      type="radio"
                      id="xlsx"
                      name="format"
                      value="xlsx"
                      checked={format === 'xlsx'}
                      onChange={() => setFormat('xlsx')}
                      className="sr-only"
                    />
                    <label
                      htmlFor="xlsx"
                      className={`flex flex-col items-center p-3 border rounded-md cursor-pointer ${
                        format === 'xlsx'
                          ? 'bg-blue-50 border-blue-500'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <FileSpreadsheet className={`h-6 w-6 ${format === 'xlsx' ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className={`mt-2 text-sm ${format === 'xlsx' ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
                        Excel (.xlsx)
                      </span>
                    </label>
                  </div>
                  <div>
                    <input
                      type="radio"
                      id="csv"
                      name="format"
                      value="csv"
                      checked={format === 'csv'}
                      onChange={() => setFormat('csv')}
                      className="sr-only"
                    />
                    <label
                      htmlFor="csv"
                      className={`flex flex-col items-center p-3 border rounded-md cursor-pointer ${
                        format === 'csv'
                          ? 'bg-blue-50 border-blue-500'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <FileText className={`h-6 w-6 ${format === 'csv' ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className={`mt-2 text-sm ${format === 'csv' ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
                        CSV (.csv)
                      </span>
                    </label>
                  </div>
                  <div>
                    <input
                      type="radio"
                      id="json"
                      name="format"
                      value="json"
                      checked={format === 'json'}
                      onChange={() => setFormat('json')}
                      className="sr-only"
                    />
                    <label
                      htmlFor="json"
                      className={`flex flex-col items-center p-3 border rounded-md cursor-pointer ${
                        format === 'json'
                          ? 'bg-blue-50 border-blue-500'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <FileText className={`h-6 w-6 ${format === 'json' ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className={`mt-2 text-sm ${format === 'json' ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
                        JSON (.json)
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="fileName" className="block text-sm font-medium text-gray-700 mb-2">
                  File Name
                </label>
                <div className="flex rounded-md shadow-sm">
                  <input
                    type="text"
                    id="fileName"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter file name"
                  />
                  <span className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    .{format}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExport}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportModal;