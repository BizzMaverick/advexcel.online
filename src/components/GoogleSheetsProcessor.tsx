import React, { useState, useRef } from 'react';
import { 
  Play, 
  Square, 
  Settings, 
  FileSpreadsheet, 
  Bot, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Download,
  Upload,
  Eye,
  X
} from 'lucide-react';
import { 
  GoogleSheetsConfig, 
  AIModelConfig, 
  BatchProcessingOptions, 
  ProcessingResult, 
  ProcessingError 
} from '../types/googleSheets';
import { BatchProcessor } from '../utils/batchProcessor';

interface GoogleSheetsProcessorProps {
  isVisible: boolean;
  onClose: () => void;
}

export const GoogleSheetsProcessor: React.FC<GoogleSheetsProcessorProps> = ({ isVisible, onClose }) => {
  const [activeTab, setActiveTab] = useState<'config' | 'processing' | 'results'>('config');
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>({
    spreadsheetId: '',
    worksheetName: 'Sheet1',
    promptColumn: 'A',
    outputColumn: 'B',
    apiKey: ''
  });
  const [aiConfig, setAiConfig] = useState<AIModelConfig>({
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    apiKey: '',
    temperature: 0.7,
    maxTokens: 1000
  });
  const [processingOptions, setProcessingOptions] = useState<BatchProcessingOptions>({
    batchSize: 5,
    delayBetweenBatches: 2000,
    maxRetries: 3,
    skipEmptyPrompts: true,
    overwriteExisting: false
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ processed: 0, total: 0, currentRow: 0 });
  const [errors, setErrors] = useState<ProcessingError[]>([]);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const processorRef = useRef<BatchProcessor | null>(null);

  const handleStartProcessing = async () => {
    try {
      setValidationErrors([]);
      setErrors([]);
      setResult(null);

      const processor = new BatchProcessor(sheetsConfig, aiConfig, processingOptions);
      processorRef.current = processor;

      // Validate configuration
      const validation = await processor.validateConfiguration();
      if (!validation.valid) {
        setValidationErrors(validation.errors);
        return;
      }

      setIsProcessing(true);
      setActiveTab('processing');

      const result = await processor.process(
        (progressUpdate) => {
          setProgress(progressUpdate);
        },
        (error) => {
          setErrors(prev => [...prev, error]);
        }
      );

      setResult(result);
      setActiveTab('results');
    } catch (error) {
      console.error('Processing failed:', error);
      setValidationErrors([error instanceof Error ? error.message : 'Unknown error']);
    } finally {
      setIsProcessing(false);
      processorRef.current = null;
    }
  };

  const handleStopProcessing = () => {
    if (processorRef.current) {
      processorRef.current.stop();
    }
  };

  const exportResults = () => {
    if (!result) return;

    const data = {
      summary: {
        totalRows: result.totalRows,
        processedRows: result.processedRows,
        successfulUpdates: result.successfulUpdates,
        errorCount: result.errors.length,
        duration: result.duration,
        startTime: result.startTime,
        endTime: result.endTime
      },
      errors: result.errors,
      configuration: {
        sheets: sheetsConfig,
        ai: { ...aiConfig, apiKey: '***' }, // Hide API key
        processing: processingOptions
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sheets-processing-results-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileSpreadsheet className="h-6 w-6 text-green-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Google Sheets AI Processor</h2>
              <p className="text-sm text-gray-600">Batch process prompts with AI models</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'config', label: 'Configuration', icon: Settings },
            { id: 'processing', label: 'Processing', icon: Bot },
            { id: 'results', label: 'Results', icon: CheckCircle }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'config' && (
            <div className="space-y-8">
              {/* Google Sheets Configuration */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  <span>Google Sheets Configuration</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Spreadsheet ID
                    </label>
                    <input
                      type="text"
                      value={sheetsConfig.spreadsheetId}
                      onChange={(e) => setSheetsConfig(prev => ({ ...prev, spreadsheetId: e.target.value }))}
                      placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Worksheet Name
                    </label>
                    <input
                      type="text"
                      value={sheetsConfig.worksheetName}
                      onChange={(e) => setSheetsConfig(prev => ({ ...prev, worksheetName: e.target.value }))}
                      placeholder="Sheet1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prompt Column
                    </label>
                    <input
                      type="text"
                      value={sheetsConfig.promptColumn}
                      onChange={(e) => setSheetsConfig(prev => ({ ...prev, promptColumn: e.target.value }))}
                      placeholder="A"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Output Column
                    </label>
                    <input
                      type="text"
                      value={sheetsConfig.outputColumn}
                      onChange={(e) => setSheetsConfig(prev => ({ ...prev, outputColumn: e.target.value }))}
                      placeholder="B"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Google Sheets API Key
                    </label>
                    <input
                      type="password"
                      value={sheetsConfig.apiKey}
                      onChange={(e) => setSheetsConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="AIzaSyD..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* AI Model Configuration */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  <span>AI Model Configuration</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      AI Provider
                    </label>
                    <select
                      value={aiConfig.provider}
                      onChange={(e) => setAiConfig(prev => ({ ...prev, provider: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic (Claude)</option>
                      <option value="google">Google AI</option>
                      <option value="custom">Custom API</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model
                    </label>
                    <input
                      type="text"
                      value={aiConfig.model}
                      onChange={(e) => setAiConfig(prev => ({ ...prev, model: e.target.value }))}
                      placeholder="gpt-3.5-turbo"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={aiConfig.apiKey}
                      onChange={(e) => setAiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="sk-..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temperature ({aiConfig.temperature})
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={aiConfig.temperature}
                      onChange={(e) => setAiConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      value={aiConfig.maxTokens}
                      onChange={(e) => setAiConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                      min="1"
                      max="4000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      System Prompt (Optional)
                    </label>
                    <textarea
                      value={aiConfig.systemPrompt || ''}
                      onChange={(e) => setAiConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
                      placeholder="You are a helpful assistant..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Processing Options */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  <span>Processing Options</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Batch Size
                    </label>
                    <input
                      type="number"
                      value={processingOptions.batchSize}
                      onChange={(e) => setProcessingOptions(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))}
                      min="1"
                      max="20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delay Between Batches (ms)
                    </label>
                    <input
                      type="number"
                      value={processingOptions.delayBetweenBatches}
                      onChange={(e) => setProcessingOptions(prev => ({ ...prev, delayBetweenBatches: parseInt(e.target.value) }))}
                      min="0"
                      step="500"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Retries
                    </label>
                    <input
                      type="number"
                      value={processingOptions.maxRetries}
                      onChange={(e) => setProcessingOptions(prev => ({ ...prev, maxRetries: parseInt(e.target.value) }))}
                      min="0"
                      max="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={processingOptions.skipEmptyPrompts}
                        onChange={(e) => setProcessingOptions(prev => ({ ...prev, skipEmptyPrompts: e.target.checked }))}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">Skip empty prompts</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={processingOptions.overwriteExisting}
                        onChange={(e) => setProcessingOptions(prev => ({ ...prev, overwriteExisting: e.target.checked }))}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">Overwrite existing responses</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900">Configuration Errors</h4>
                      <ul className="mt-2 text-sm text-red-800 space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Start Processing Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleStartProcessing}
                  disabled={isProcessing}
                  className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Play className="h-5 w-5" />
                  <span>Start Processing</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'processing' && (
            <div className="space-y-6">
              {/* Progress */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Processing Progress</h3>
                  {isProcessing && (
                    <button
                      onClick={handleStopProcessing}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Square className="h-4 w-4" />
                      <span>Stop</span>
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress: {progress.processed} / {progress.total}</span>
                      <span>{progress.total > 0 ? Math.round((progress.processed / progress.total) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress.total > 0 ? (progress.processed / progress.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  
                  {progress.currentRow > 0 && (
                    <p className="text-sm text-gray-600">
                      Currently processing row: {progress.currentRow}
                    </p>
                  )}
                </div>
              </div>

              {/* Real-time Errors */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Errors</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {errors.map((error, index) => (
                      <div key={index} className="bg-white border border-red-200 rounded p-3">
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-red-900">Row {error.row}</p>
                            <p className="text-sm text-red-800">{error.error}</p>
                            {error.prompt && (
                              <p className="text-xs text-red-700 mt-1 truncate">Prompt: {error.prompt}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'results' && result && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{result.totalRows}</div>
                    <div className="text-sm text-gray-600">Total Rows</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{result.processedRows}</div>
                    <div className="text-sm text-gray-600">Processed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{result.successfulUpdates}</div>
                    <div className="text-sm text-gray-600">Successful</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{result.errors.length}</div>
                    <div className="text-sm text-gray-600">Errors</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-green-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Duration: {Math.round(result.duration / 1000)} seconds</span>
                    <span>Success Rate: {result.processedRows > 0 ? Math.round((result.successfulUpdates / result.processedRows) * 100) : 0}%</span>
                  </div>
                </div>
              </div>

              {/* Export Button */}
              <div className="flex justify-center">
                <button
                  onClick={exportResults}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-5 w-5" />
                  <span>Export Results</span>
                </button>
              </div>

              {/* Detailed Errors */}
              {result.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Details</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {result.errors.map((error, index) => (
                      <div key={index} className="bg-white border border-red-200 rounded p-4">
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm font-medium text-red-900">Row {error.row}</span>
                              <span className="text-xs text-gray-500">{error.timestamp.toLocaleTimeString()}</span>
                            </div>
                            <p className="text-sm text-red-800 mb-2">{error.error}</p>
                            {error.prompt && (
                              <div className="bg-gray-50 rounded p-2">
                                <p className="text-xs text-gray-600 font-medium">Prompt:</p>
                                <p className="text-xs text-gray-700">{error.prompt}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};