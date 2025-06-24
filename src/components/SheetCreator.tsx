import React, { useState } from 'react';
import { Plus, FileSpreadsheet, X, Check } from 'lucide-react';
import { Cell } from '../types/spreadsheet';

interface SheetCreatorProps {
  onCreateSheet: (name: string, initialData?: { [key: string]: Cell }) => void;
  isVisible: boolean;
  onClose: () => void;
}

export const SheetCreator: React.FC<SheetCreatorProps> = ({ onCreateSheet, isVisible, onClose }) => {
  const [sheetName, setSheetName] = useState('');
  const [template, setTemplate] = useState<'blank' | 'budget' | 'sales' | 'inventory'>('blank');

  const templates = {
    blank: {
      name: 'Blank Sheet',
      description: 'Start with an empty spreadsheet',
      data: {}
    },
    budget: {
      name: 'Budget Template',
      description: 'Personal or business budget tracker',
      data: {
        'A1': { id: 'A1', row: 1, col: 1, value: 'Category', type: 'text' as const },
        'B1': { id: 'B1', row: 1, col: 2, value: 'Budgeted', type: 'text' as const },
        'C1': { id: 'C1', row: 1, col: 3, value: 'Actual', type: 'text' as const },
        'D1': { id: 'D1', row: 1, col: 4, value: 'Difference', type: 'text' as const },
        'A2': { id: 'A2', row: 2, col: 1, value: 'Income', type: 'text' as const },
        'A3': { id: 'A3', row: 3, col: 1, value: 'Housing', type: 'text' as const },
        'A4': { id: 'A4', row: 4, col: 1, value: 'Transportation', type: 'text' as const },
        'A5': { id: 'A5', row: 5, col: 1, value: 'Food', type: 'text' as const },
        'A6': { id: 'A6', row: 6, col: 1, value: 'Utilities', type: 'text' as const },
        'A7': { id: 'A7', row: 7, col: 1, value: 'Entertainment', type: 'text' as const },
        'D2': { id: 'D2', row: 2, col: 4, value: '=C2-B2', type: 'formula' as const, formula: '=C2-B2' }
      }
    },
    sales: {
      name: 'Sales Tracker',
      description: 'Track sales performance and revenue',
      data: {
        'A1': { id: 'A1', row: 1, col: 1, value: 'Date', type: 'text' as const },
        'B1': { id: 'B1', row: 1, col: 2, value: 'Product', type: 'text' as const },
        'C1': { id: 'C1', row: 1, col: 3, value: 'Quantity', type: 'text' as const },
        'D1': { id: 'D1', row: 1, col: 4, value: 'Unit Price', type: 'text' as const },
        'E1': { id: 'E1', row: 1, col: 5, value: 'Total', type: 'text' as const },
        'F1': { id: 'F1', row: 1, col: 6, value: 'Region', type: 'text' as const },
        'A2': { id: 'A2', row: 2, col: 1, value: '2024-01-15', type: 'text' as const },
        'B2': { id: 'B2', row: 2, col: 2, value: 'Laptop', type: 'text' as const },
        'C2': { id: 'C2', row: 2, col: 3, value: 5, type: 'number' as const },
        'D2': { id: 'D2', row: 2, col: 4, value: 1200, type: 'number' as const },
        'E2': { id: 'E2', row: 2, col: 5, value: '=C2*D2', type: 'formula' as const, formula: '=C2*D2' },
        'F2': { id: 'F2', row: 2, col: 6, value: 'North', type: 'text' as const }
      }
    },
    inventory: {
      name: 'Inventory Management',
      description: 'Track stock levels and inventory',
      data: {
        'A1': { id: 'A1', row: 1, col: 1, value: 'Item Code', type: 'text' as const },
        'B1': { id: 'B1', row: 1, col: 2, value: 'Item Name', type: 'text' as const },
        'C1': { id: 'C1', row: 1, col: 3, value: 'Current Stock', type: 'text' as const },
        'D1': { id: 'D1', row: 1, col: 4, value: 'Min Stock', type: 'text' as const },
        'E1': { id: 'E1', row: 1, col: 5, value: 'Status', type: 'text' as const },
        'A2': { id: 'A2', row: 2, col: 1, value: 'ITM001', type: 'text' as const },
        'B2': { id: 'B2', row: 2, col: 2, value: 'Office Chair', type: 'text' as const },
        'C2': { id: 'C2', row: 2, col: 3, value: 25, type: 'number' as const },
        'D2': { id: 'D2', row: 2, col: 4, value: 10, type: 'number' as const },
        'E2': { id: 'E2', row: 2, col: 5, value: '=IF(C2<D2,"Low Stock","OK")', type: 'formula' as const, formula: '=IF(C2<D2,"Low Stock","OK")' }
      }
    }
  };

  const handleCreate = () => {
    if (!sheetName.trim()) return;
    
    const templateData = templates[template].data;
    onCreateSheet(sheetName.trim(), templateData);
    setSheetName('');
    setTemplate('blank');
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileSpreadsheet className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Create New Sheet</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Sheet Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sheet Name
            </label>
            <input
              type="text"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              placeholder="Enter sheet name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose Template
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(templates).map(([key, template]) => (
                <label
                  key={key}
                  className={`
                    flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors
                    ${template === key 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="template"
                    value={key}
                    checked={template === key}
                    onChange={(e) => setTemplate(e.target.value as any)}
                    className="text-blue-600 focus:ring-blue-500 mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{template.name}</div>
                    <div className="text-sm text-gray-600">{template.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!sheetName.trim()}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Sheet</span>
          </button>
        </div>
      </div>
    </div>
  );
};