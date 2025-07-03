import React from 'react';
import { Cell } from '../types/spreadsheet';
import { Keyboard } from 'lucide-react';

interface StatusBarProps {
  selectedCell?: string;
  cell?: Cell;
  calculations?: {
    sum: number;
    count: number;
    average: number;
  };
}

export const StatusBar: React.FC<StatusBarProps> = ({ selectedCell, cell, calculations }) => {
  return (
    <div className="h-8 bg-gray-100 border-t border-gray-300 px-4 flex items-center justify-between text-xs text-gray-600">
      <div className="flex items-center space-x-6">
        <span className="font-medium">
          Cell: <span className="text-blue-600">{selectedCell || 'None'}</span>
        </span>
        
        {cell?.formula && (
          <span>
            Formula: <code className="bg-gray-200 px-1 rounded text-gray-800">{cell.formula}</code>
          </span>
        )}
        
        {cell?.type && (
          <span>
            Type: <span className="capitalize text-green-600">{cell.type}</span>
          </span>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {calculations && (
          <>
            <span>Sum: <strong>{calculations.sum.toFixed(2)}</strong></span>
            <span>Count: <strong>{calculations.count}</strong></span>
            <span>Average: <strong>{calculations.average.toFixed(2)}</strong></span>
          </>
        )}
        <span className="flex items-center text-blue-600">
          <Keyboard className="h-3 w-3 mr-1" />
          <span>Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-gray-800 font-mono text-xs">?</kbd> for keyboard shortcuts</span>
        </span>
      </div>
    </div>
  );
};