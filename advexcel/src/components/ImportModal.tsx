import { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

interface ImportModalProps {
  onClose: () => void;
  onImport: (data: any) => void;
  setIsLoading: (loading: boolean) => void;
}

const ImportModal = ({ onClose, onImport, setIsLoading }: ImportModalProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setError(null);
    const fileType = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileType) {
      setError('Unable to determine file type');
      return;
    }
    
    if (!['xlsx', 'xls', 'csv'].includes(fileType)) {
      setError('Unsupported file format. Please upload an Excel or CSV file.');
      return;
    }
    
    setIsLoading(true);
    
    if (fileType === 'csv') {
      Papa.parse(file, {
        header: false,
        complete: (results) => {
          setIsLoading(false);
          if (results.errors.length > 0) {
            setError(`Error parsing CSV: ${results.errors[0].message}`);
            return;
          }
          onImport(results.data);
        },
        error: (error) => {
          setIsLoading(false);
          setError(`Error parsing CSV: ${error.message}`);
        }
      });
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          setIsLoading(false);
          onImport(jsonData);
        } catch (error) {
          setIsLoading(false);
          setError(`Error parsing Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      };
      reader.onerror = () => {
        setIsLoading(false);
        setError('Error reading file');
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Import Spreadsheet</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-700 mb-2">Drag and drop your file here, or</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Upload className="h-4 w-4 mr-2" />
              Select File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileInput}
              className="hidden"
            />
            <p className="text-xs text-gray-500 mt-2">Supported formats: .xlsx, .xls, .csv</p>
          </div>
          
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Tips:</h3>
            <ul className="text-xs text-gray-600 space-y-1 list-disc pl-5">
              <li>Make sure your spreadsheet has headers in the first row</li>
              <li>For best results, clean your data before importing</li>
              <li>Large files may take a moment to process</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;