import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, File, Database } from 'lucide-react';

interface ExportModalProps {
  isVisible: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
  hasData: boolean;
}

export interface ExportOptions {
  format: 'xlsx' | 'xls' | 'csv' | 'ods' | 'json';
  mode: 'new_file' | 'new_sheet' | 'replace_sheet';
  sheetName?: string;
  fileName?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isVisible,
  onClose,
  onExport,
  hasData
}) => {
  const [exportMode, setExportMode] = useState<'new_file' | 'new_sheet' | 'replace_sheet'>('new_file');
  const [selectedFormat, setSelectedFormat] = useState<'xlsx' | 'xls' | 'csv' | 'ods' | 'json'>('xlsx');
  const [fileName, setFileName] = useState('spreadsheet_export');
  const [sheetName, setSheetName] = useState('Sheet1');

  if (!isVisible) return null;

  const formatOptions = [
    {
      value: 'xlsx' as const,
      label: 'Excel Workbook (.xlsx)',
      description: 'Modern Excel format with full feature support',
      icon: FileSpreadsheet,
      color: 'text-green-600'
    },
    {
      value: 'xls' as const,
      label: 'Excel 97-2003 (.xls)',
      description: 'Legacy Excel format for older versions',
      icon: FileSpreadsheet,
      color: 'text-green-500'
    },
    {
      value: 'csv' as const,
      label: 'Comma Separated Values (.csv)',
      description: 'Simple text format, widely compatible',
      icon: File,
      color: 'text-blue-600'
    },
    {
      value: 'ods' as const,
      label: 'OpenDocument Spreadsheet (.ods)',
      description: 'Open standard format for LibreOffice/OpenOffice',
      icon: Database,
      color: 'text-purple-600'
    },
    {
      value: 'json' as const,
      label: 'JSON Data (.json)',
      description: 'Structured data format for developers',
      icon: Database,
      color: 'text-orange-600'
    }
  ];

  const handleExport = () => {
    const options: ExportOptions = {
      format: selectedFormat,
      mode: exportMode,
      fileName: fileName || 'spreadsheet_export',
      sheetName: exportMode !== 'new_file' ? (sheetName || 'Sheet1') : undefined
    };

    onExport(options);
    onClose();
  };

  const getFileExtension = () => {
    return selectedFormat === 'xlsx' ? '.xlsx' :
           selectedFormat === 'xls' ? '.xls' :
           selectedFormat === 'csv' ? '.csv' :
           selectedFormat === 'ods' ? '.ods' :
           '.json';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center space-x-3">
            <Download className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Export Options</h2>
              <p className="text-sm text-gray-600 hidden sm:block">Choose your export format and settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 lg:p-6 space-y-6">
          {/* Export Mode Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Mode</h3>
            <div className="space-y-3">
              <label className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="exportMode"
                  value="new_file"
                  checked={exportMode === 'new_file'}
                  onChange={(e) => setExportMode(e.target.value as any)}
                  className="text-blue-600 focus:ring-blue-500 mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Download as New File</div>
                  <div className="text-sm text-gray-500">Create a new file and download it</div>
                </div>
              </label>

              <label className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="exportMode"
                  value="new_sheet"
                  checked={exportMode === 'new_sheet'}
                  onChange={(e) => setExportMode(e.target.value as any)}
                  className="text-blue-600 focus:ring-blue-500 mt-1"
                  disabled={selectedFormat === 'csv' || selectedFormat === 'json'}
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Add New Sheet to Existing Workbook</div>
                  <div className="text-sm text-gray-500">
                    {(selectedFormat === 'csv' || selectedFormat === 'json') 
                      ? 'Not available for CSV/JSON formats' 
                      : 'Create a new sheet in the current workbook'
                    }
                  </div>
                </div>
              </label>

              <label className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="exportMode"
                  value="replace_sheet"
                  checked={exportMode === 'replace_sheet'}
                  onChange={(e) => setExportMode(e.target.value as any)}
                  className="text-blue-600 focus:ring-blue-500 mt-1"
                  disabled={selectedFormat === 'csv' || selectedFormat === 'json'}
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Replace Existing Sheet</div>
                  <div className="text-sm text-gray-500">
                    {(selectedFormat === 'csv' || selectedFormat === 'json') 
                      ? 'Not available for CSV/JSON formats' 
                      : 'Replace data in an existing sheet'
                    }
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* File Format Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">File Format</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {formatOptions.map((format) => {
                const IconComponent = format.icon;
                return (
                  <label
                    key={format.value}
                    className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="fileFormat"
                      value={format.value}
                      checked={selectedFormat === format.value}
                      onChange={(e) => {
                        setSelectedFormat(e.target.value as any);
                        // Reset export mode if CSV/JSON is selected
                        if (e.target.value === 'csv' || e.target.value === 'json') {
                          setExportMode('new_file');
                        }
                      }}
                      className="text-blue-600 focus:ring-blue-500 mt-1"
                    />
                    <IconComponent className={`h-5 w-5 ${format.color} mt-0.5`} />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{format.label}</div>
                      <div className="text-sm text-gray-500">{format.description}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* File Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {exportMode === 'new_file' ? 'File Name' : 'Sheet Name'}
            </label>
            <div className="flex">
              <input
                type="text"
                value={exportMode === 'new_file' ? fileName : sheetName}
                onChange={(e) => {
                  if (exportMode === 'new_file') {
                    setFileName(e.target.value);
                  } else {
                    setSheetName(e.target.value);
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder={exportMode === 'new_file' ? 'Enter file name' : 'Enter sheet name'}
              />
              {exportMode === 'new_file' && (
                <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 rounded-r-lg">
                  {getFileExtension()}
                </span>
              )}
            </div>
          </div>

          {/* Export Summary */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Export Summary</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <div>Format: <strong>{formatOptions.find(f => f.value === selectedFormat)?.label}</strong></div>
              <div>Mode: <strong>
                {exportMode === 'new_file' ? 'Download as new file' :
                 exportMode === 'new_sheet' ? 'Add new sheet to workbook' :
                 'Replace existing sheet'}
              </strong></div>
              <div>
                {exportMode === 'new_file' ? 'File' : 'Sheet'} name: <strong>
                  {exportMode === 'new_file' ? `${fileName}${getFileExtension()}` : sheetName}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 lg:p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={!hasData || (!fileName.trim() && exportMode === 'new_file') || (!sheetName.trim() && exportMode !== 'new_file')}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );
};