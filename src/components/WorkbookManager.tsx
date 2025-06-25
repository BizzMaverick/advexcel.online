import React, { useState } from 'react';
import { FileSpreadsheet, Plus, X, Eye, EyeOff, Download, Upload } from 'lucide-react';
import { WorkbookData, WorksheetData } from '../types/workbook';
import { Cell } from '../types/spreadsheet';
import { Logo } from './Logo';

interface WorkbookManagerProps {
  workbook: WorkbookData | null;
  onWorksheetChange: (worksheetName: string) => void;
  onWorksheetAdd: (name: string) => void;
  onWorksheetDelete: (name: string) => void;
  onWorksheetRename: (oldName: string, newName: string) => void;
}

export const WorkbookManager: React.FC<WorkbookManagerProps> = ({
  workbook,
  onWorksheetChange,
  onWorksheetAdd,
  onWorksheetDelete,
  onWorksheetRename
}) => {
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [newSheetName, setNewSheetName] = useState('');
  const [editingSheet, setEditingSheet] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAddSheet = () => {
    if (newSheetName.trim()) {
      onWorksheetAdd(newSheetName.trim());
      setNewSheetName('');
      setShowAddSheet(false);
    }
  };

  const handleRenameSheet = (oldName: string) => {
    if (editName.trim() && editName.trim() !== oldName) {
      onWorksheetRename(oldName, editName.trim());
    }
    setEditingSheet(null);
    setEditName('');
  };

  const startRename = (sheetName: string) => {
    setEditingSheet(sheetName);
    setEditName(sheetName);
  };

  if (!workbook) {
    return (
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center space-x-2 text-gray-500">
          <FileSpreadsheet className="h-4 w-4" />
          <span className="text-sm">No workbook loaded</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Workbook Header */}
      <div className="px-4 py-2 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Logo size="sm" />
            <span className="text-sm font-medium text-gray-900">{workbook.name}</span>
            <span className="text-xs text-gray-500">
              ({workbook.worksheets.length} sheet{workbook.worksheets.length !== 1 ? 's' : ''})
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              Modified: {workbook.lastModified.toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Worksheet Tabs */}
      <div className="px-4 py-2">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {workbook.worksheets.map((worksheet) => (
            <div key={worksheet.name} className="flex items-center">
              {editingSheet === worksheet.name ? (
                <div className="flex items-center space-x-1 bg-blue-50 border border-blue-200 rounded px-2 py-1">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => handleRenameSheet(worksheet.name)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleRenameSheet(worksheet.name);
                      } else if (e.key === 'Escape') {
                        setEditingSheet(null);
                        setEditName('');
                      }
                    }}
                    className="text-xs bg-transparent border-none outline-none w-20"
                    autoFocus
                  />
                </div>
              ) : (
                <button
                  onClick={() => onWorksheetChange(worksheet.name)}
                  onDoubleClick={() => startRename(worksheet.name)}
                  className={`
                    flex items-center space-x-2 px-3 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap
                    ${worksheet.isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <span>{worksheet.name}</span>
                  <span className="text-xs opacity-75">
                    ({worksheet.rowCount}×{worksheet.columnCount})
                  </span>
                  {workbook.worksheets.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onWorksheetDelete(worksheet.name);
                      }}
                      className="ml-1 hover:bg-red-500 hover:text-white rounded p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </button>
              )}
            </div>
          ))}

          {/* Add New Sheet */}
          {showAddSheet ? (
            <div className="flex items-center space-x-1 bg-green-50 border border-green-200 rounded px-2 py-1">
              <input
                type="text"
                value={newSheetName}
                onChange={(e) => setNewSheetName(e.target.value)}
                onBlur={() => {
                  if (!newSheetName.trim()) {
                    setShowAddSheet(false);
                  }
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddSheet();
                  } else if (e.key === 'Escape') {
                    setShowAddSheet(false);
                    setNewSheetName('');
                  }
                }}
                placeholder="Sheet name"
                className="text-xs bg-transparent border-none outline-none w-20"
                autoFocus
              />
              <button
                onClick={handleAddSheet}
                className="text-green-600 hover:text-green-700"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddSheet(true)}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              <Plus className="h-3 w-3" />
              <span>Add Sheet</span>
            </button>
          )}
        </div>

        {/* Sheet Info */}
        <div className="mt-2 text-xs text-gray-500">
          <span>
            Active: {workbook.activeWorksheet} • 
            Total cells: {workbook.worksheets.reduce((sum, ws) => sum + Object.keys(ws.cells).length, 0)} • 
            Double-click sheet name to rename
          </span>
        </div>
      </div>
    </div>
  );
};