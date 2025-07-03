import React, { useState } from 'react';
import { X, Download, Filter, BarChart3, Table, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { QueryResult } from '../utils/naturalLanguageProcessor';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showVisualization, setShowVisualization] = useState(false);
  const [visualizationType, setVisualizationType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [xAxisField, setXAxisField] = useState<string>('');
  const [yAxisField, setYAxisField] = useState<string>('');

  if (!isVisible || !result) return null;

  const handleExport = () => {
    if (onExport && result.data) {
      onExport(result.data);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!result.data || !sortConfig) return result.data;
    
    return [...result.data].sort((a, b) => {
      if (a[sortConfig.key] === null || a[sortConfig.key] === undefined) return 1;
      if (b[sortConfig.key] === null || b[sortConfig.key] === undefined) return -1;
      
      const aValue = typeof a[sortConfig.key] === 'string' ? a[sortConfig.key].toLowerCase() : a[sortConfig.key];
      const bValue = typeof b[sortConfig.key] === 'string' ? b[sortConfig.key].toLowerCase() : b[sortConfig.key];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [result.data, sortConfig]);

  const filteredData = React.useMemo(() => {
    if (!searchTerm.trim() || !sortedData) return sortedData;
    
    return sortedData.filter(row => 
      Object.values(row).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [sortedData, searchTerm]);

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
                  className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center space-x-1">
                    <div className="truncate" title={column}>{column}</div>
                    {sortConfig?.key === column && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.slice(0, 100).map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    <div className="truncate max-w-xs" title={String(row[column])}>
                      {typeof row[column] === 'number' ? 
                        row[column].toLocaleString(undefined, { maximumFractionDigits: 2 }) : 
                        row[column]
                      }
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length > 100 && (
          <div className="text-center py-4 text-sm text-gray-500 bg-gray-50">
            Showing first 100 rows of {filteredData.length} total rows
          </div>
        )}
      </div>
    );
  };

  const renderVisualization = () => {
    if (!result.data || result.data.length === 0 || !xAxisField || !yAxisField) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>Select X and Y axis fields to visualize data</p>
        </div>
      );
    }

    const chartData = result.data.slice(0, 50); // Limit to 50 items for better visualization

    switch (visualizationType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisField} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={yAxisField} fill="#2563EB" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisField} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={yAxisField} stroke="#2563EB" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={150}
                fill="#8884d8"
                dataKey={yAxisField}
                nameKey={xAxisField}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 45 % 360}, 70%, 60%)`} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const getNumericColumns = () => {
    if (!result.data || result.data.length === 0) return [];
    
    return Object.keys(result.data[0]).filter(key => {
      // Check if at least 70% of values are numeric
      const numericCount = result.data.filter(row => 
        typeof row[key] === 'number' || !isNaN(Number(row[key]))
      ).length;
      
      return numericCount / result.data.length > 0.7;
    });
  };

  const getCategoryColumns = () => {
    if (!result.data || result.data.length === 0) return [];
    
    return Object.keys(result.data[0]).filter(key => {
      // Check if column has relatively few unique values
      const uniqueValues = new Set(result.data.map(row => row[key]));
      return uniqueValues.size < result.data.length / 2; // Less than 50% unique values
    });
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

        {/* Search and Visualization Controls */}
        <div className="px-4 lg:px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search results..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowVisualization(!showVisualization)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  showVisualization ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>{showVisualization ? 'Hide Visualization' : 'Visualize Data'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Visualization Options */}
        {showVisualization && (
          <div className="px-4 lg:px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chart Type</label>
                <select
                  value={visualizationType}
                  onChange={(e) => setVisualizationType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="pie">Pie Chart</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">X-Axis (Category)</label>
                <select
                  value={xAxisField}
                  onChange={(e) => setXAxisField(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select field</option>
                  {getCategoryColumns().map(column => (
                    <option key={column} value={column}>{column}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Y-Axis (Value)</label>
                <select
                  value={yAxisField}
                  onChange={(e) => setYAxisField(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select field</option>
                  {getNumericColumns().map(column => (
                    <option key={column} value={column}>{column}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <div className="text-xs text-gray-500">
                  {result.data && (
                    <span>Showing {Math.min(result.data.length, 50)} of {result.data.length} records in chart</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {showVisualization ? (
            <div className="p-4 h-full">
              {renderVisualization()}
            </div>
          ) : (
            result.success ? (
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
            )
          )}
        </div>
      </div>
    </div>
  );
};