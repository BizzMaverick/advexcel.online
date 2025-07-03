import React, { useState, useRef, useEffect } from 'react';
import { Search, Terminal, Zap, BarChart3, Calculator, FileSpreadsheet, ArrowRight } from 'lucide-react';

interface CommandBarProps {
  onExecuteCommand: (command: string) => void;
  suggestions?: string[];
  isFocused?: boolean;
  onFocusChange?: (focused: boolean) => void;
}

export const CommandBar: React.FC<CommandBarProps> = ({ 
  onExecuteCommand, 
  suggestions = [],
  isFocused = false,
  onFocusChange
}) => {
  const [command, setCommand] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestionsCategory, setSuggestionsCategory] = useState<'all' | 'analytics' | 'formulas' | 'filters'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  const defaultSuggestions = [
    'Create pivot table from A1:D10',
    'Apply conditional formatting to B1:B20 where value > 100',
    'VLOOKUP in column C using table A1:B10',
    'Calculate SUM of range E1:E20',
    'Generate chart from data A1:C15',
    'Apply IF formula to column D',
    'Filter data where column A contains "Sales"',
    'Format range as currency',
  ];

  const analyticsSuggestions = [
    'Show sales by region',
    'Find top 10 products by revenue',
    'Compare north vs south region',
    'Calculate average salary by department',
    'Show monthly sales trend',
    'Find outliers in revenue data',
    'Create bar chart of sales by product',
    'Show correlation between price and quantity'
  ];

  const formulaSuggestions = [
    'Apply SUMIF to column B where values > 1000',
    'Create VLOOKUP to find employee data',
    'Calculate AVERAGE of range C5:C20',
    'Apply nested IF formula for grading',
    'Use INDEX MATCH to lookup values',
    'Create CONCATENATE formula for full names',
    'Apply DATE function to combine year, month, day',
    'Calculate PMT for loan with 5% interest'
  ];

  const filterSuggestions = [
    'Filter customers from Bangalore',
    'Show orders with amount above ₹10,000',
    'Find products in electronics category',
    'Show transactions from January 2024',
    'Filter employees with performance > 4.5',
    'Show items with quantity less than 10',
    'Find records containing "urgent"',
    'Show data where status is "completed"'
  ];

  const allSuggestions = [...suggestions, ...defaultSuggestions, ...analyticsSuggestions, ...formulaSuggestions, ...filterSuggestions];

  const getFilteredSuggestions = () => {
    let filteredSuggestions: string[] = [];
    
    switch (suggestionsCategory) {
      case 'analytics':
        filteredSuggestions = analyticsSuggestions;
        break;
      case 'formulas':
        filteredSuggestions = formulaSuggestions;
        break;
      case 'filters':
        filteredSuggestions = filterSuggestions;
        break;
      default:
        filteredSuggestions = allSuggestions;
    }
    
    return filteredSuggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(command.toLowerCase())
    ).slice(0, 8);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      onExecuteCommand(command.trim());
      
      // Add to history if not duplicate of last command
      if (history.length === 0 || history[0] !== command) {
        setHistory(prev => [command, ...prev.slice(0, 19)]); // Keep last 20 commands
      }
      
      setCommand('');
      setIsExpanded(false);
      setShowSuggestions(false);
      setHistoryIndex(-1);
      if (onFocusChange) onFocusChange(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCommand(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
    if (onFocusChange) onFocusChange(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle up/down arrows for history navigation
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setCommand(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(history[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand('');
      }
    }
  };

  useEffect(() => {
    if ((isExpanded || isFocused) && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded, isFocused]);

  // Focus the input when isFocused prop changes to true
  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  const filteredSuggestions = getFilteredSuggestions();

  return (
    <div className="relative">
      <div className={`
        transition-all duration-300 ease-in-out bg-white rounded-lg shadow-lg border-2
        ${isExpanded || isFocused ? 'border-cyan-500' : 'border-slate-200 hover:border-slate-300'}
      `}>
        <form onSubmit={handleSubmit} className="flex items-center">
          <div className="flex items-center px-4 py-3 space-x-3">
            <Terminal className="h-5 w-5 text-cyan-600" />
            <span className="text-sm font-medium text-slate-700">Ask anything:</span>
          </div>
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={command}
              onChange={(e) => {
                setCommand(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
                setHistoryIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setIsExpanded(true);
                setShowSuggestions(command.length > 0);
                if (onFocusChange) onFocusChange(true);
              }}
              onBlur={() => {
                setTimeout(() => {
                  setIsExpanded(false);
                  setShowSuggestions(false);
                  if (onFocusChange) onFocusChange(false);
                }, 200);
              }}
              placeholder="Enter natural language query or Excel command... (Ctrl+/ to focus)"
              className="w-full px-4 py-3 text-sm border-none outline-none bg-transparent placeholder-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={!command.trim()}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-r-lg hover:from-cyan-700 hover:to-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
          >
            <Zap className="h-4 w-4" />
            <span className="font-medium">Execute</span>
          </button>
        </form>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            {/* Category tabs */}
            <div className="flex border-b border-gray-200 mb-2">
              {[
                { id: 'all', label: 'All', icon: Search },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                { id: 'formulas', label: 'Formulas', icon: Calculator },
                { id: 'filters', label: 'Filters', icon: FileSpreadsheet }
              ].map(category => (
                <button
                  key={category.id}
                  onClick={() => setSuggestionsCategory(category.id as any)}
                  className={`
                    flex items-center space-x-1 px-3 py-2 text-xs font-medium
                    ${suggestionsCategory === category.id 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <category.icon className="h-3 w-3" />
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
            
            <div className="text-xs font-medium text-slate-500 px-3 py-2 uppercase tracking-wide">
              Suggestions
            </div>
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 rounded transition-colors duration-150 flex items-center space-x-2"
              >
                <Search className="h-4 w-4 text-slate-400" />
                <span>{suggestion}</span>
                <ArrowRight className="h-3 w-3 text-slate-400 ml-auto" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Command history dropdown */}
      {isExpanded && history.length > 0 && !showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-64 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-medium text-slate-500 px-3 py-2 uppercase tracking-wide">
              Recent Commands
            </div>
            {history.map((cmd, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(cmd)}
                className={`
                  w-full text-left px-3 py-2 text-sm rounded transition-colors duration-150 flex items-center space-x-2
                  ${historyIndex === index ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-gray-50'}
                `}
              >
                <Terminal className="h-4 w-4 text-slate-400" />
                <span>{cmd}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};