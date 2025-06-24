import React from 'react';
import { FileSpreadsheet, AlertCircle, CheckCircle, Info } from 'lucide-react';

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
    return <FileSpreadsheet className="h-8 w-8 text-blue-500 animate-pulse" />;
  };

  const getEstimatedTime = () => {
    if (progress <= 0) return '';
    if (progress >= 100) return 'Complete!';
    
    const remainingProgress = 100 - progress;
    const estimatedSeconds = Math.ceil((remainingProgress / progress) * 10); // Rough estimate
    
    if (estimatedSeconds < 60) {
      return `~${estimatedSeconds}s remaining`;
    } else {
      const minutes = Math.ceil(estimatedSeconds / 60);
      return `~${minutes}m remaining`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          {/* Icon and Title */}
          <div className="flex items-center space-x-3 mb-4">
            {getIcon()}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {progress === 100 ? 'Processing Complete!' : 'Processing Large File...'}
              </h3>
              {fileName && (
                <p className="text-sm text-gray-600 truncate" title={fileName}>{fileName}</p>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">{message}</span>
              <div className="text-right">
                <span className="text-sm font-medium text-gray-900">{Math.round(progress)}%</span>
                <div className="text-xs text-gray-500">{getEstimatedTime()}</div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-500 ease-out ${getProgressColor()}`}
                style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              />
            </div>
          </div>

          {/* Status Messages */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full transition-colors ${progress >= 10 ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className={`transition-colors ${progress >= 10 ? 'text-green-600' : 'text-gray-500'}`}>Reading file structure</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full transition-colors ${progress >= 40 ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className={`transition-colors ${progress >= 40 ? 'text-green-600' : 'text-gray-500'}`}>Processing data chunks</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full transition-colors ${progress >= 80 ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className={`transition-colors ${progress >= 80 ? 'text-green-600' : 'text-gray-500'}`}>Optimizing for display</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full transition-colors ${progress >= 95 ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className={`transition-colors ${progress >= 95 ? 'text-green-600' : 'text-gray-500'}`}>Finalizing</span>
            </div>
          </div>

          {/* Performance Tips */}
          {progress > 0 && progress < 100 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-blue-800">
                    <strong>Large file optimization:</strong> We're processing your file in chunks to maintain browser responsiveness. 
                    Large files may be automatically limited to the first 10,000 rows and 100 columns for optimal performance.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Memory Warning */}
          {progress > 50 && progress < 100 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-yellow-800">
                    <strong>Memory optimization active:</strong> For very large files, we automatically optimize memory usage. 
                    If you experience issues, try closing other browser tabs.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {onCancel && progress < 100 && (
              <button
                onClick={onCancel}
                className="flex-1 py-2 px-4 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            )}
            
            {progress === 100 && (
              <button
                onClick={onCancel}
                className="flex-1 py-2 px-4 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                Continue
              </button>
            )}
          </div>

          {/* Technical Info */}
          {progress > 0 && progress < 100 && (
            <div className="mt-3 text-xs text-gray-500 text-center">
              Processing optimized for large datasets • Memory-efficient chunking active
            </div>
          )}
        </div>
      </div>
    </div>
  );
};