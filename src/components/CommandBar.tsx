import React, { useState, useRef, useEffect } from 'react';
import { Search, Terminal, Zap } from 'lucide-react';

interface CommandBarProps {
  onExecuteCommand: (command: string) => void;
  suggestions?: string[];
}

export const CommandBar: React.FC<CommandBarProps> = ({ onExecuteCommand, suggestions = [] }) => {
  const [command, setCommand] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
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

  const allSuggestions = [...suggestions, ...defaultSuggestions];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      onExecuteCommand(command.trim());
      setCommand('');
      setIsExpanded(false);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCommand(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const filteredSuggestions = allSuggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(command.toLowerCase())
  ).slice(0, 6);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  return (
    <div className="relative">
      <div className={`
        transition-all duration-300 ease-in-out bg-white rounded-lg shadow-lg border-2
        ${isExpanded ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'}
      `}>
        <form onSubmit={handleSubmit} className="flex items-center">
          <div className="flex items-center px-4 py-3 space-x-3">
            <Terminal className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Excel Command:</span>
          </div>
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={command}
              onChange={(e) => {
                setCommand(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onFocus={() => {
                setIsExpanded(true);
                setShowSuggestions(command.length > 0);
              }}
              onBlur={() => {
                setTimeout(() => {
                  setIsExpanded(false);
                  setShowSuggestions(false);
                }, 200);
              }}
              placeholder="Enter Excel command or operation..."
              className="w-full px-4 py-3 text-sm border-none outline-none bg-transparent placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={!command.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
          >
            <Zap className="h-4 w-4" />
            <span className="font-medium">Execute</span>
          </button>
        </form>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 px-3 py-2 uppercase tracking-wide">
              Suggestions
            </div>
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition-colors duration-150 flex items-center space-x-2"
              >
                <Search className="h-4 w-4 text-gray-400" />
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};