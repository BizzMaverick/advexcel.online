import React, { useState, useEffect } from 'react';
import { X, Table, BarChart3, Download, Settings, Terminal, Zap, Search } from 'lucide-react';
import { SpreadsheetData } from '../types/spreadsheet';
import { PivotTableEngine, PivotConfig, PivotResult } from '../utils/pivotTableEngine';
import { CommandBar } from './CommandBar';

interface PivotTablePanelProps {
  data: SpreadsheetData;
  isVisible: boolean;
  onClose: () => void;
  onExport?: (data: any[]) => void;
}

export const PivotTablePanel: React.FC<PivotTablePanelProps> = ({
  data,
  isVisible,
  onClose,
  onExport
}) => {
  const [pivotConfig, setPivotConfig] = useState<PivotConfig>({
    rows: [],
    columns: [],
    values: [],
    aggregation: 'sum'
  });
  const [pivotResult, setPivotResult] = useState<PivotResult | null>(null);
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCommandBar, setShowCommandBar] = useState(false);

  useEffect(() => {
    if (isVisible && Object.keys(data.cells).length > 0) {
      const engine = new PivotTableEngine(data.cells);
      const fields = engine.getAvailableFields();
      setAvailableFields(fields);
    }
  }, [isVisible, data.cells]);

  const handleGeneratePivot = async () => {
    if (pivotConfig.rows.length === 0 && pivotConfig.columns.length === 0) {
      return;
    }

    setIsGenerating(true);
    try {
      const engine = new PivotTableEngine(data.cells);
      const result = engine.generatePivotTable(pivotConfig);
      setPivotResult(result);
      setShowCommandBar(true);
    } catch (error) {
      console.error('Error generating pivot table:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = () => {
    if (onExport && pivotResult?.data) {
      onExport(pivotResult.data);
    }
  };

  const handlePivotCommand = (command: string) => {
    const lowerCommand = command.toLowerCase().trim();
    
    // Handle pivot-specific commands
    if (lowerCommand.includes('sum') || lowerCommand.includes('total')) {
      setPivotConfig(prev => ({ ...prev, aggregation: 'sum' }));
      handleGeneratePivot();
    } else if (lowerCommand.includes('average') || lowerCommand.includes('mean')) {
      setPivotConfig(prev => ({ ...prev, aggregation: 'average' }));
      handleGeneratePivot();
    } else if (lowerCommand.includes('count')) {
      setPivotConfig(prev => ({ ...prev, aggregation: 'count' }));
      handleGeneratePivot();
    } else if (lowerCommand.includes('max') || lowerCommand.includes('maximum')) {
      setPivotConfig(prev => ({ ...prev, aggregation: 'max' }));
      handleGeneratePivot();
    } else if (lowerCommand.includes('min') || lowerCommand.includes('minimum')) {
      setPivotConfig(prev => ({ ...prev, aggregation: 'min' }));
      handleGeneratePivot();
    } else if (lowerCommand.includes('sort') && pivotResult) {
      // Sort the pivot table data
      const sortedData = [...pivotResult.data].sort((a, b) => {
        const firstValueKey = Object.keys(a).find(key => typeof a[key] === 'number');
        if (firstValueKey) {
          return lowerCommand.includes('desc') ? b[firstValueKey] - a[firstValueKey] : a[firstValueKey] - b[firstValueKey];
        }
        return 0;
      });
      setPivotResult({ ...pivotResult, data: sortedData });
    } else if (lowerCommand.includes('filter') && pivotResult) {
      // Basic filtering
      const filterValue = command.split(' ').pop();
      if (filterValue) {
        const filteredData = pivotResult.data.filter(row => 
          Object.values(row).some(val => 
            String(val).toLowerCase().includes(filterValue.toLowerCase())
          )
        );
        setPivotResult({ ...pivotResult, data: filteredData });
      }
    }
  };

  const addToRows = (field: string) => {
    if (!pivotConfig.rows.includes(field)) {
      setPivotConfig(prev => ({
        ...prev,
        rows: [...prev.rows, field]
      }));
    }
  };

  const addToColumns = (field: string) => {
    if (!pivotConfig.columns.includes(field)) {
      setPivotConfig(prev => ({
        ...prev,
        columns: [...prev.columns, field]
      }));
    }
  };

  const addToValues = (field: string) => {
    if (!pivotConfig.values.includes(field)) {
      setPivotConfig(prev => ({
        ...prev,
        values: [...prev.values, field]
      }));
    }
  };

  const removeFromRows = (field: string) => {
    setPivotConfig(prev => ({
      ...prev,
      rows: prev.rows.filter(f => f !== field)
    }));
  };

  const removeFromColumns = (field: string) => {
    setPivotConfig(prev => ({
      ...prev,
      columns: prev.columns.filter(f => f !== field)
    }));
  };

  const removeFromValues = (field: string) => {
    setPivotConfig(prev => ({
      ...prev,
      values: prev.values.filter(f => f !== field)
    }));
  };

  const pivotSuggestions = [
    'Change aggregation to sum',
    'Change aggregation to average',
    'Change aggregation to count',
    'Change aggregation to max',
    'Change aggregation to min',
    'Sort by highest values',
    'Sort by lowest values',
    'Filter data containing sales',
    'Export pivot table',
    'Calculate percentage of total',
    'Add subtotals',
    'Group by quarters',
    'Show top 10 results',
    'Hide zero values',
    'Format as currency'
  ];

  const renderPivotTable = () => {
    if (!pivotResult) return null;

    const { data: pivotData, summary } = pivotResult;

    if (pivotData.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Table className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No data to display in pivot table</p>
        </div>
      );
    }

    const columns = Object.keys(pivotData[0]);

    return (
      <div className="space-y-4">
        {/* Summary */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Pivot Table Summary</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Total Rows:</span>
              <span className="font-medium ml-2">{summary.totalRows}</span>
            </div>
            <div>
              <span className="text-blue-700">Unique Groups:</span>
              <span className="font-medium ml-2">{summary.uniqueGroups}</span>
            </div>
            <div>
              <span className="text-blue-700">Aggregation:</span>
              <span className="font-medium ml-2 capitalize">{summary.aggregation}</span>
            </div>
            <div>
              <span className="text-blue-700">Generated:</span>
              <span className="font-medium ml-2">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Command Bar for Pivot Operations */}
        {showCommandBar && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="mb-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Terminal className="h-4 w-4" />
                <span className="font-medium">Pivot Operations:</span>
                <span className="text-blue-600">"change aggregation to average"</span>
                <span className="text-gray-400">•</span>
                <span className="text-blue-600">"sort by highest values"</span>
                <span className="text-gray-400">•</span>
                <span className="text-blue-600">"filter data"</span>
              </div>
            </div>
            <CommandBar 
              onExecuteCommand={handlePivotCommand} 
              suggestions={pivotSuggestions}
            />
          </div>
        )}

        {/* Pivot Table */}
        <div className="overflow-auto border border-gray-200 rounded-lg" style={{ maxHeight: 'calc(100vh - 400px)' }}>
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
              {pivotData.map((row, rowIndex) => (
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
        </div>
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Table className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Pivot Table Builder</h2>
              <p className="text-sm text-gray-600 hidden sm:block">Drag and drop fields to create your pivot table</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {pivotResult && (
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

        <div className="flex-1 flex overflow-hidden">
          {/* Configuration Panel */}
          <div className="w-80 border-r border-gray-200 p-4 lg:p-6 overflow-y-auto flex-shrink-0">
            <div className="space-y-6">
              {/* Available Fields */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Available Fields</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableFields.map((field, index) => (
                    <div
                      key={index}
                      className="p-2 bg-gray-100 rounded border cursor-move hover:bg-gray-200 transition-colors"
                      draggable
                    >
                      <span className="text-sm font-medium truncate block" title={field}>{field}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rows */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Rows</h3>
                <div className="min-h-[60px] p-3 border-2 border-dashed border-gray-300 rounded-lg">
                  {pivotConfig.rows.map((field, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mb-1 mr-1"
                    >
                      <span className="truncate max-w-20" title={field}>{field}</span>
                      <button
                        onClick={() => removeFromRows(field)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {pivotConfig.rows.length === 0 && (
                    <p className="text-gray-500 text-sm">Drop row fields here</p>
                  )}
                </div>
                <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
                  {availableFields.map((field, index) => (
                    <button
                      key={index}
                      onClick={() => addToRows(field)}
                      className="block w-full text-left px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded truncate"
                      title={`Add ${field} to Rows`}
                    >
                      + Add {field} to Rows
                    </button>
                  ))}
                </div>
              </div>

              {/* Columns */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Columns</h3>
                <div className="min-h-[60px] p-3 border-2 border-dashed border-gray-300 rounded-lg">
                  {pivotConfig.columns.map((field, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-2 py-1 rounded text-sm mb-1 mr-1"
                    >
                      <span className="truncate max-w-20" title={field}>{field}</span>
                      <button
                        onClick={() => removeFromColumns(field)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {pivotConfig.columns.length === 0 && (
                    <p className="text-gray-500 text-sm">Drop column fields here</p>
                  )}
                </div>
                <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
                  {availableFields.map((field, index) => (
                    <button
                      key={index}
                      onClick={() => addToColumns(field)}
                      className="block w-full text-left px-2 py-1 text-xs text-green-600 hover:bg-green-50 rounded truncate"
                      title={`Add ${field} to Columns`}
                    >
                      + Add {field} to Columns
                    </button>
                  ))}
                </div>
              </div>

              {/* Values */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Values</h3>
                <div className="min-h-[60px] p-3 border-2 border-dashed border-gray-300 rounded-lg">
                  {pivotConfig.values.map((field, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center space-x-2 bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm mb-1 mr-1"
                    >
                      <span className="truncate max-w-20" title={field}>{field}</span>
                      <button
                        onClick={() => removeFromValues(field)}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {pivotConfig.values.length === 0 && (
                    <p className="text-gray-500 text-sm">Drop value fields here</p>
                  )}
                </div>
                <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
                  {availableFields.map((field, index) => (
                    <button
                      key={index}
                      onClick={() => addToValues(field)}
                      className="block w-full text-left px-2 py-1 text-xs text-purple-600 hover:bg-purple-50 rounded truncate"
                      title={`Add ${field} to Values`}
                    >
                      + Add {field} to Values
                    </button>
                  ))}
                </div>
              </div>

              {/* Aggregation */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Aggregation</h3>
                <select
                  value={pivotConfig.aggregation}
                  onChange={(e) => setPivotConfig(prev => ({
                    ...prev,
                    aggregation: e.target.value as any
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="sum">Sum</option>
                  <option value="count">Count</option>
                  <option value="average">Average</option>
                  <option value="min">Minimum</option>
                  <option value="max">Maximum</option>
                </select>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGeneratePivot}
                disabled={isGenerating || (pivotConfig.rows.length === 0 && pivotConfig.columns.length === 0)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4" />
                    <span>Generate Pivot Table</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="flex-1 p-4 lg:p-6 overflow-auto">
            {pivotResult ? (
              renderPivotTable()
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Table className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Create Your Pivot Table</h3>
                  <p className="text-gray-600 max-w-md">
                    Add fields to rows, columns, and values, then click "Generate Pivot Table" to see your results.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};