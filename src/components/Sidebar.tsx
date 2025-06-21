import React, { useState } from 'react';
import { BarChart3, Table, FileSpreadsheet, Search, Settings, ChevronRight, Activity, Filter, Download, Upload, Calculator, FunctionSquare as Function, Sigma, TrendingUp, Database, Zap, Calendar, Type, Hash, Palette, Code } from 'lucide-react';

interface SidebarProps {
  onAnalyticsClick: () => void;
  onPivotTableClick: () => void;
  onFunctionPanelToggle: () => void;
  onExportClick: () => void;
  onImportClick: () => void;
  showFunctionPanel: boolean;
  isDataLoaded: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onAnalyticsClick,
  onPivotTableClick,
  onFunctionPanelToggle,
  onExportClick,
  onImportClick,
  showFunctionPanel,
  isDataLoaded
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExcelFunctions, setShowExcelFunctions] = useState(false);

  const menuItems = [
    {
      id: 'import',
      label: 'Import Data',
      icon: Upload,
      onClick: onImportClick,
      color: 'text-blue-600 bg-blue-100',
      description: 'Import Excel, CSV, or other data files',
      enabled: true
    },
    {
      id: 'functions',
      label: 'Functions Panel',
      icon: Calculator,
      onClick: onFunctionPanelToggle,
      color: 'text-green-600 bg-green-100',
      description: 'Excel functions and formulas',
      enabled: true,
      active: showFunctionPanel
    },
    {
      id: 'analytics',
      label: 'Analytics Dashboard',
      icon: Activity,
      onClick: onAnalyticsClick,
      color: 'text-purple-600 bg-purple-100',
      description: 'Data insights, trends, charts, and correlations',
      enabled: isDataLoaded
    },
    {
      id: 'pivot',
      label: 'Pivot Tables',
      icon: Table,
      onClick: onPivotTableClick,
      color: 'text-orange-600 bg-orange-100',
      description: 'Create and manage pivot tables',
      enabled: isDataLoaded
    },
    {
      id: 'export',
      label: 'Export Data',
      icon: Download,
      onClick: onExportClick,
      color: 'text-red-600 bg-red-100',
      description: 'Export to various formats',
      enabled: isDataLoaded
    }
  ];

  const excelFunctions = [
    { 
      category: 'Math & Statistics', 
      icon: Sigma, 
      color: 'text-blue-600',
      functions: [
        { name: 'SUM', desc: 'Sum of values in range' },
        { name: 'AVERAGE', desc: 'Average of values' },
        { name: 'COUNT', desc: 'Count non-empty cells' },
        { name: 'MIN', desc: 'Minimum value' },
        { name: 'MAX', desc: 'Maximum value' },
        { name: 'STDEV', desc: 'Standard deviation' },
        { name: 'VAR', desc: 'Variance' },
        { name: 'MEDIAN', desc: 'Middle value' },
        { name: 'MODE', desc: 'Most frequent value' },
        { name: 'ROUND', desc: 'Round to digits' },
        { name: 'SUMIF', desc: 'Sum with condition' },
        { name: 'AVERAGEIF', desc: 'Average with condition' },
        { name: 'COUNTIF', desc: 'Count with condition' }
      ]
    },
    { 
      category: 'Lookup & Reference', 
      icon: Database, 
      color: 'text-green-600',
      functions: [
        { name: 'VLOOKUP', desc: 'Vertical lookup' },
        { name: 'HLOOKUP', desc: 'Horizontal lookup' },
        { name: 'INDEX', desc: 'Return value at position' },
        { name: 'MATCH', desc: 'Find position of value' },
        { name: 'XLOOKUP', desc: 'Advanced lookup' },
        { name: 'CHOOSE', desc: 'Choose from list' },
        { name: 'OFFSET', desc: 'Reference offset' },
        { name: 'INDIRECT', desc: 'Reference from text' }
      ]
    },
    { 
      category: 'Logical Functions', 
      icon: Zap, 
      color: 'text-purple-600',
      functions: [
        { name: 'IF', desc: 'Conditional logic' },
        { name: 'IFS', desc: 'Multiple conditions' },
        { name: 'AND', desc: 'All conditions true' },
        { name: 'OR', desc: 'Any condition true' },
        { name: 'NOT', desc: 'Reverse logical value' },
        { name: 'IFERROR', desc: 'Handle errors' },
        { name: 'IFNA', desc: 'Handle #N/A errors' },
        { name: 'ISBLANK', desc: 'Check if blank' }
      ]
    },
    { 
      category: 'Text Functions', 
      icon: Type, 
      color: 'text-yellow-600',
      functions: [
        { name: 'CONCATENATE', desc: 'Join text strings' },
        { name: 'LEFT', desc: 'Left characters' },
        { name: 'RIGHT', desc: 'Right characters' },
        { name: 'MID', desc: 'Middle characters' },
        { name: 'LEN', desc: 'Length of text' },
        { name: 'FIND', desc: 'Find text position' },
        { name: 'SUBSTITUTE', desc: 'Replace text' },
        { name: 'UPPER', desc: 'Convert to uppercase' },
        { name: 'LOWER', desc: 'Convert to lowercase' },
        { name: 'TRIM', desc: 'Remove extra spaces' }
      ]
    },
    { 
      category: 'Date & Time', 
      icon: Calendar, 
      color: 'text-indigo-600',
      functions: [
        { name: 'TODAY', desc: 'Current date' },
        { name: 'NOW', desc: 'Current date and time' },
        { name: 'DATE', desc: 'Create date from parts' },
        { name: 'YEAR', desc: 'Extract year' },
        { name: 'MONTH', desc: 'Extract month' },
        { name: 'DAY', desc: 'Extract day' },
        { name: 'WEEKDAY', desc: 'Day of week number' },
        { name: 'DATEDIF', desc: 'Difference between dates' }
      ]
    },
    { 
      category: 'Financial', 
      icon: Hash, 
      color: 'text-emerald-600',
      functions: [
        { name: 'PMT', desc: 'Payment calculation' },
        { name: 'PV', desc: 'Present value' },
        { name: 'FV', desc: 'Future value' },
        { name: 'NPV', desc: 'Net present value' },
        { name: 'IRR', desc: 'Internal rate of return' },
        { name: 'RATE', desc: 'Interest rate per period' }
      ]
    },
    { 
      category: 'Advanced', 
      icon: Code, 
      color: 'text-orange-600',
      functions: [
        { name: 'ARRAY FORMULA', desc: 'Array calculations' },
        { name: 'PIVOT TABLES', desc: 'Data summarization' },
        { name: 'CONDITIONAL FORMAT', desc: 'Format based on conditions' },
        { name: 'DATA VALIDATION', desc: 'Input restrictions' },
        { name: 'FILTER', desc: 'Dynamic filtering' },
        { name: 'SORT', desc: 'Dynamic sorting' },
        { name: 'UNIQUE', desc: 'Unique values' }
      ]
    }
  ];

  return (
    <>
      {/* Sidebar */}
      <div
        className={`
          fixed left-0 top-0 h-full bg-white shadow-2xl border-r border-gray-200 z-40
          transition-all duration-300 ease-in-out
          ${isExpanded ? 'w-80' : 'w-16'}
        `}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Header */}
        <div className="h-20 flex items-center justify-center border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
            </div>
            {isExpanded && (
              <div className="text-white">
                <h2 className="font-bold text-lg">Excel Pro</h2>
                <p className="text-xs text-blue-100">Analytics Suite</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-6 px-2">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isDisabled = !item.enabled;
              
              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={item.onClick}
                    disabled={isDisabled}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200
                      ${isDisabled 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-gray-50 hover:shadow-md cursor-pointer'
                      }
                      ${item.active ? 'bg-blue-50 border border-blue-200' : ''}
                    `}
                  >
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                      ${isDisabled ? 'bg-gray-100' : item.color}
                      transition-all duration-200 group-hover:scale-110
                    `}>
                      <IconComponent className={`h-5 w-5 ${isDisabled ? 'text-gray-400' : ''}`} />
                    </div>
                    
                    {isExpanded && (
                      <div className="flex-1 text-left">
                        <div className={`font-medium ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
                          {item.label}
                        </div>
                        <div className={`text-xs ${isDisabled ? 'text-gray-300' : 'text-gray-500'}`}>
                          {item.description}
                        </div>
                      </div>
                    )}
                    
                    {isExpanded && !isDisabled && (
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                  
                  {/* Tooltip for collapsed state */}
                  {!isExpanded && (
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Excel Functions Section */}
            {isExpanded && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowExcelFunctions(!showExcelFunctions)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Function className="h-4 w-4 text-blue-600" />
                    <span>Excel Functions Library</span>
                  </div>
                  <ChevronRight className={`h-4 w-4 transition-transform ${showExcelFunctions ? 'rotate-90' : ''}`} />
                </button>

                {showExcelFunctions && (
                  <div className="mt-2 space-y-3 max-h-96 overflow-y-auto">
                    {excelFunctions.map((category, index) => {
                      const CategoryIcon = category.icon;
                      return (
                        <div key={index} className="px-3">
                          <div className="flex items-center space-x-2 py-2 border-b border-gray-100">
                            <CategoryIcon className={`h-4 w-4 ${category.color}`} />
                            <span className="text-xs font-semibold text-gray-700">{category.category}</span>
                            <span className="text-xs text-gray-400">({category.functions.length})</span>
                          </div>
                          <div className="mt-2 space-y-1">
                            {category.functions.slice(0, 6).map((func) => (
                              <div
                                key={func.name}
                                className="group cursor-pointer"
                                title={func.desc}
                              >
                                <div className="flex items-center justify-between px-2 py-1 rounded hover:bg-blue-50 transition-colors">
                                  <span className="text-xs font-medium text-blue-700 group-hover:text-blue-800">
                                    {func.name}
                                  </span>
                                  <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    →
                                  </span>
                                </div>
                              </div>
                            ))}
                            {category.functions.length > 6 && (
                              <div className="text-xs text-gray-500 px-2 py-1">
                                +{category.functions.length - 6} more functions
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Excel Analyzer Pro</div>
              <div className="text-xs text-gray-400">Advanced Analytics Suite</div>
              <div className="text-xs text-blue-600 mt-1">200+ Functions Supported</div>
            </div>
          </div>
        )}

        {/* Expand/Collapse Indicator */}
        <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
          <div className={`
            w-6 h-12 bg-white border border-gray-200 rounded-r-lg flex items-center justify-center
            transition-all duration-300 shadow-lg
            ${isExpanded ? 'opacity-100' : 'opacity-60 hover:opacity-100'}
          `}>
            <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-30 lg:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
};