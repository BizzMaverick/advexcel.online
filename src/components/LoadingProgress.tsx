import React from 'react';
import { FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';

interface LoadingProgressProps {
  isVisible: boolean;
  progress: number;
  message: string;
  fileName?: string;
  onCancel?: () => void;
}

export const LoadingProgress: React.FC<LoadingProgressProps> = ({
  isVisible,
  progress,
  message,
  fileName,
  onCancel
}) => {
  if (!isVisible) return null;

  const getProgressColor = () => {
    if (progress < 30) return 'bg-blue-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getIcon = () => {
    if (progress === 100) return <CheckCircle className="h-8 w-8 text-green-500" />;
    if (progress < 0) return <AlertCircle className="h-8 w-8 text-red-500" />;
    return <FileSpreadsheet className="h-8 w-8 text-blue-500" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          {/* Icon and Title */}
          <div className="flex items-center space-x-3 mb-4">
            {getIcon()}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {progress === 100 ? 'Processing Complete!' : 'Processing File...'}
              </h3>
              {fileName && (
                <p className="text-sm text-gray-600 truncate">{fileName}</p>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">{message}</span>
              <span className="text-sm font-medium text-gray-900">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              />
            </div>
          </div>

          {/* Status Messages */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${progress >= 10 ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className={progress >= 10 ? 'text-green-600' : 'text-gray-500'}>Reading file</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${progress >= 50 ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className={progress >= 50 ? 'text-green-600' : 'text-gray-500'}>Processing data</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${progress >= 90 ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className={progress >= 90 ? 'text-green-600' : 'text-gray-500'}>Finalizing</span>
            </div>
          </div>

          {/* Performance Tips */}
          {progress < 100 && progress > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-800">
                <strong>Processing large file:</strong> This may take a few moments. 
                The app is optimized to handle your data efficiently while keeping your browser responsive.
              </p>
            </div>
          )}

          {/* Cancel Button */}
          {onCancel && progress < 100 && (
            <button
              onClick={onCancel}
              className="w-full py-2 px-4 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          )}

          {/* Memory Usage Warning */}
          {progress > 0 && progress < 100 && (
            <div className="mt-3 text-xs text-gray-500 text-center">
              Large files are processed in chunks to optimize performance
            </div>
          )}
        </div>
      </div>
    </div>
  );
};