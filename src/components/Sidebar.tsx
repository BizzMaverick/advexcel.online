import React, { useState } from 'react';
import { 
  Table, 
  ChevronRight,
  Activity,
  Download,
  Upload,
  Plus
} from 'lucide-react';
import { Logo } from './Logo';

interface SidebarProps {
  onAnalyticsClick: () => void;
  onPivotTableClick: () => void;
  onExportClick: () => void;
  onImportClick: () => void;
  onCreateSheetClick: () => void;
  isDataLoaded: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onAnalyticsClick,
  onPivotTableClick,
  onExportClick,
  onImportClick,
  onCreateSheetClick,
  isDataLoaded
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
    {
      id: 'create',
      label: 'Create New Sheet',
      icon: Plus,
      onClick: onCreateSheetClick,
      color: 'text-green-600 bg-green-100',
      description: 'Create a new Excel sheet with templates',
      enabled: true
    },
    {
      id: 'import',
      label: 'Import Data',
      icon: Upload,
      onClick: onImportClick,
      color: 'text-cyan-600 bg-cyan-100',
      description: 'Import Excel, CSV, or other data files',
      enabled: true
    },
    {
      id: 'analytics',
      label: 'Analytics Dashboard',
      icon: Activity,
      onClick: onAnalyticsClick,
      color: 'text-blue-600 bg-blue-100',
      description: 'Data insights, trends, charts, and correlations',
      enabled: isDataLoaded
    },
    {
      id: 'pivot',
      label: 'Pivot Tables',
      icon: Table,
      onClick: onPivotTableClick,
      color: 'text-purple-600 bg-purple-100',
      description: 'Create and manage pivot tables',
      enabled: isDataLoaded
    },
    {
      id: 'export',
      label: 'Export Data',
      icon: Download,
      onClick: onExportClick,
      color: 'text-orange-600 bg-orange-100',
      description: 'Export to various formats',
      enabled: isDataLoaded
    }
  ];

  return (
    <>
      {/* Sidebar */}
      <div
        className={`
          fixed left-0 top-0 h-full bg-white shadow-2xl border-r border-slate-200 z-40
          transition-all duration-300 ease-in-out
          ${isExpanded ? 'w-80' : 'w-16'}
        `}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Header */}
        <div className="h-20 flex items-center justify-center border-b border-slate-200 bg-gradient-to-r from-cyan-600 to-blue-600">
          <div className="flex items-center space-x-3">
            <Logo size="sm" showBackground={false} className="bg-white rounded-lg p-1.5" />
            {isExpanded && (
              <div className="text-white">
                <h2 className="font-bold text-lg">Excel Pro</h2>
                <p className="text-xs text-cyan-100">Analytics Suite</p>
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
                        : 'hover:bg-slate-50 hover:shadow-md cursor-pointer'
                      }
                    `}
                  >
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                      ${isDisabled ? 'bg-slate-100' : item.color}
                      transition-all duration-200 group-hover:scale-110
                    `}>
                      <IconComponent className={`h-5 w-5 ${isDisabled ? 'text-slate-400' : ''}`} />
                    </div>
                    
                    {isExpanded && (
                      <div className="flex-1 text-left">
                        <div className={`font-medium ${isDisabled ? 'text-slate-400' : 'text-slate-900'}`}>
                          {item.label}
                        </div>
                        <div className={`text-xs ${isDisabled ? 'text-slate-300' : 'text-slate-500'}`}>
                          {item.description}
                        </div>
                      </div>
                    )}
                    
                    {isExpanded && !isDisabled && (
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                    )}
                  </button>
                  
                  {/* Tooltip for collapsed state */}
                  {!isExpanded && (
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 rotate-45"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        {isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-slate-50">
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1">Excel Pro AI</div>
              <div className="text-xs text-slate-400">Advanced Analytics Suite</div>
              <div className="text-xs text-cyan-600 mt-1">Use prompts for Excel functions</div>
            </div>
          </div>
        )}

        {/* Expand/Collapse Indicator */}
        <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
          <div className={`
            w-6 h-12 bg-white border border-slate-200 rounded-r-lg flex items-center justify-center
            transition-all duration-300 shadow-lg
            ${isExpanded ? 'opacity-100' : 'opacity-60 hover:opacity-100'}
          `}>
            <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
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