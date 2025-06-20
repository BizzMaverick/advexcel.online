import React from 'react';
import { X, Download, Filter, BarChart3, Table } from 'lucide-react';
import { QueryResult } from '../utils/naturalLanguageProcessor';

interface QueryResultsPanelProps {
  result: QueryResult | null;
  isVisible: boolean;
  onClose: () => void;
  onExport?: (data: any[]) => void;
}

export const QueryResultsPanel: React.FC<QueryResultsPanelProps> = ({
  result,
  isVisible,
  onClose,
  onExport
}) => {
  if (!isVisible || !result) return null;

  const handleExport = () => {
    if (onExport && result.data) {
      onExport(result.data);
    }
  };

  const renderTable = () => {
    if (!result.data || result.data.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Table className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No data to display</p>
        </div>
      );
    }

    const columns = Object.keys(result.data[0]);
    
    return (
      <div className="overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <div className="truncate" title={column}>{column}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {result.data.slice(0, 100).map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    <div className="truncate max-w-xs" title={String(row[column])}>
                      {typeof row[column] === 'number' ? 
                        row[column].toLocaleString() : 
                        row[column]
                      }
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {result.data.length > 100 && (
          <div className="text-center py-4 text-sm text-gray-500 bg-gray-50">
            Showing first 100 rows of {result.data.length} total rows
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Query Results</h2>
              <p className="text-sm text-gray-600 hidden sm:block">{result.message}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {result.data && result.data.length > 0 && (
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-3 lg:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Summary */}
        {result.summary && (
          <div className="px-4 lg:px-6 py-4 bg-blue-50 border-b border-gray-200 flex-shrink-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Table className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {result.summary.totalRows} rows
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {result.summary.columns.length} columns
                </span>
              </div>
              {result.summary.filters.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900 truncate">
                    {result.summary.filters.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {result.success ? (
            renderTable()
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <X className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Query Failed</h3>
                <p className="text-gray-600">{result.message}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};