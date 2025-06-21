import React, { useState } from 'react';
import { 
  BarChart3, 
  Table, 
  FileSpreadsheet, 
  Search, 
  Settings,
  ChevronRight,
  Activity,
  Filter,
  Download,
  Upload,
  Calculator,
  Function,
  Sigma,
  TrendingUp,
  Database,
  Zap
} from 'lucide-react';

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
    { category: 'Math & Stats', icon: Sigma, functions: ['SUM', 'AVERAGE', 'COUNT', 'MIN', 'MAX', 'STDEV', 'VAR'] },
    { category: 'Lookup & Reference', icon: Database, functions: ['VLOOKUP', 'HLOOKUP', 'INDEX', 'MATCH', 'XLOOKUP'] },
    { category: 'Logical', icon: Zap, functions: ['IF', 'IFS', 'AND', 'OR', 'NOT', 'IFERROR'] },
    { category: 'Text', icon: Function, functions: ['CONCATENATE', 'LEFT', 'RIGHT', 'MID', 'LEN', 'FIND'] },
    { category: 'Date & Time', icon: TrendingUp, functions: ['TODAY', 'NOW', 'DATE', 'YEAR', 'MONTH', 'DAY'] }
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
                    <span>Excel Functions</span>
                  </div>
                  <ChevronRight className={`h-4 w-4 transition-transform ${showExcelFunctions ? 'rotate-90' : ''}`} />
                </button>

                {showExcelFunctions && (
                  <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                    {excelFunctions.map((category, index) => {
                      const CategoryIcon = category.icon;
                      return (
                        <div key={index} className="px-3">
                          <div className="flex items-center space-x-2 py-2">
                            <CategoryIcon className="h-3 w-3 text-gray-500" />
                            <span className="text-xs font-medium text-gray-600">{category.category}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 ml-5">
                            {category.functions.map((func) => (
                              <span
                                key={func}
                                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                                title={`Click to learn about ${func}`}
                              >
                                {func}
                              </span>
                            ))}
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