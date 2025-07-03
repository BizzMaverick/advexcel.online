import React, { useState, useRef, useEffect } from 'react';
import { Calculator, Zap, Copy, CheckCircle, AlertCircle, BookOpen, Search, ArrowRight, X } from 'lucide-react';
import { Cell } from '../types/spreadsheet';
import { ExcelFormulaEngine } from '../utils/excelFormulaEngine';

interface FormulaAssistantProps {
  cells: { [key: string]: Cell };
  onCellUpdate: (cellId: string, value: any, formula?: string) => void;
  onCellFormat: (cellId: string, format: any) => void;
  isVisible: boolean;
  onClose: () => void;
}

interface FormulaResult {
  success: boolean;
  formula: string;
  result: any;
  explanation: string;
  affectedCells: string[];
  conditionalFormatting?: {
    range: string;
    condition: string;
    format: any;
  };
}

export const FormulaAssistant: React.FC<FormulaAssistantProps> = ({
  cells,
  onCellUpdate,
  onCellFormat,
  isVisible,
  onClose
}) => {
  const [request, setRequest] = useState('');
  const [result, setResult] = useState<FormulaResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<Array<{ request: string; result: FormulaResult }>>([]);
  const [showExamples, setShowExamples] = useState(false);
  const [copiedFormula, setCopiedFormula] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const formulaEngine = new ExcelFormulaEngine(cells);

  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  const exampleRequests = [
    {
      category: "Basic Operations",
      examples: [
        "Calculate the sum of values in range A1:A10 and put result in B1",
        "Find the average of column C and display in cell D1",
        "Count non-empty cells in range B2:B20",
        "Find the maximum value in column E"
      ]
    },
    {
      category: "Lookup Functions",
      examples: [
        "Use VLOOKUP to find product price from table A1:C10 based on product name in D1",
        "Create INDEX MATCH formula to lookup employee salary from range A1:B50",
        "Find the position of 'Sales' in column A using MATCH function",
        "Use HLOOKUP to find data in row 2 based on header in row 1"
      ]
    },
    {
      category: "Conditional Logic",
      examples: [
        "Create IF formula: if A1 > 100 then 'High' else 'Low'",
        "Use nested IF to categorize scores: 90+ = A, 80+ = B, 70+ = C, else F",
        "Apply IFS function for multiple conditions on column B",
        "Create logical AND formula to check if A1>0 and B1>0"
      ]
    },
    {
      category: "Conditional Formatting",
      examples: [
        "Highlight all values above 1000 in column B with red background",
        "Color cells in range A1:A20 green if they contain 'Complete'",
        "Apply gradient formatting to sales data in column C",
        "Format cells with bold text where value > 100"
      ]
    },
    {
      category: "Text Functions",
      examples: [
        "Concatenate first name in A1 and last name in B1 with space between",
        "Extract first 5 characters from text in column D",
        "Convert all text in column E to uppercase",
        "Use TRIM to remove extra spaces from text in A1"
      ]
    },
    {
      category: "Date Functions",
      examples: [
        "Calculate days between two dates in A1 and B1",
        "Add 30 days to the date in C1",
        "Extract year from date in column F",
        "Get current date with TODAY() function in cell A1"
      ]
    },
    {
      category: "Financial Functions",
      examples: [
        "Calculate loan payment (PMT) with rate 5%, 36 periods, 10000 principal",
        "Find future value (FV) of 100 monthly payments at 3% annual interest",
        "Calculate present value (PV) of future payments",
        "Determine interest rate (RATE) for loan terms"
      ]
    },
    {
      category: "Statistical Functions",
      examples: [
        "Find the median value in range A1:A20",
        "Calculate standard deviation of data in column B",
        "Count values that meet specific criteria with COUNTIF",
        "Sum values based on criteria with SUMIF"
      ]
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request.trim()) return;

    setIsProcessing(true);
    try {
      const result = await formulaEngine.processNaturalLanguageRequest(request);
      setResult(result);
      setCopiedFormula(false);
      
      if (result.success) {
        // Apply the formula or formatting
        if (result.conditionalFormatting) {
          // Apply conditional formatting
          const range = formulaEngine.parseRange(result.conditionalFormatting.range);
          range.forEach(cellId => {
            onCellFormat(cellId, result.conditionalFormatting!.format);
          });
        }
        
        // Update affected cells
        result.affectedCells.forEach(cellId => {
          if (result.formula.startsWith('=')) {
            onCellUpdate(cellId, result.result, result.formula);
          } else {
            onCellUpdate(cellId, result.result);
          }
        });

        // Add to history
        setHistory(prev => [{ request, result }, ...prev.slice(0, 9)]);
      }
    } catch (error) {
      setResult({
        success: false,
        formula: '',
        result: null,
        explanation: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        affectedCells: []
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyFormula = () => {
    if (result?.formula) {
      navigator.clipboard.writeText(result.formula);
      setCopiedFormula(true);
      setTimeout(() => setCopiedFormula(false), 2000);
    }
  };

  const useExample = (example: string) => {
    setRequest(example);
    setShowExamples(false);
    inputRef.current?.focus();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <Calculator className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Excel Formula Assistant</h2>
              <p className="text-sm text-gray-600">Describe what you want to do in plain English</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span>Examples</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Input Section */}
            <div className="p-6 border-b border-gray-200">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe your Excel operation:
                  </label>
                  <div className="flex space-x-3">
                    <input
                      ref={inputRef}
                      type="text"
                      value={request}
                      onChange={(e) => setRequest(e.target.value)}
                      placeholder="e.g., Calculate the sum of values in range A1:A10 and put result in B1"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={isProcessing || !request.trim()}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          <span>Execute</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Result Section */}
            {result && (
              <div className="p-6 border-b border-gray-200">
                <div className={`rounded-lg p-4 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-start space-x-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h3 className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                        {result.success ? 'Formula Generated Successfully' : 'Error Processing Request'}
                      </h3>
                      <p className={`text-sm mt-1 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                        {result.explanation}
                      </p>
                      
                      {result.success && result.formula && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between bg-white rounded p-3 border">
                            <code className="text-sm font-mono text-gray-800">{result.formula}</code>
                            <button
                              onClick={copyFormula}
                              className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700"
                            >
                              {copiedFormula ? (
                                <>
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                  <span className="text-green-600">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          
                          {result.result !== null && (
                            <div className="text-sm">
                              <span className="font-medium text-green-800">Result: </span>
                              <span className="text-green-700">{String(result.result)}</span>
                            </div>
                          )}
                          
                          {result.affectedCells.length > 0 && (
                            <div className="text-sm">
                              <span className="font-medium text-green-800">Affected Cells: </span>
                              <span className="text-green-700">{result.affectedCells.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* History Section */}
            {history.length > 0 && (
              <div className="flex-1 overflow-auto p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Operations</h3>
                <div className="space-y-3">
                  {history.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-2">{item.request}</div>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-white px-2 py-1 rounded border font-mono">
                          {item.result.formula}
                        </code>
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-700">{String(item.result.result)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Examples Sidebar */}
          {showExamples && (
            <div className="w-96 border-l border-gray-200 bg-gray-50 overflow-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Example Requests</h3>
                <div className="space-y-6">
                  {exampleRequests.map((category, categoryIndex) => (
                    <div key={categoryIndex}>
                      <h4 className="font-medium text-gray-800 mb-3">{category.category}</h4>
                      <div className="space-y-2">
                        {category.examples.map((example, exampleIndex) => (
                          <button
                            key={exampleIndex}
                            onClick={() => useExample(example)}
                            className="w-full text-left p-3 text-sm bg-white rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition-colors"
                          >
                            {example}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};