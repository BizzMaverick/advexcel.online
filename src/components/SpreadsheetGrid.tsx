import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Cell, SpreadsheetData } from '../types/spreadsheet';

interface SpreadsheetGridProps {
  data: SpreadsheetData;
  onCellChange: (cellId: string, value: any, formula?: string) => void;
  onCellSelect: (cellId: string) => void;
}

export const SpreadsheetGrid: React.FC<SpreadsheetGridProps> = ({
  data,
  onCellChange,
  onCellSelect,
}) => {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Calculate dynamic grid size based on data with proper buffer
  const calculateGridSize = () => {
    const cellEntries = Object.entries(data.cells);
    if (cellEntries.length === 0) {
      return { rows: 25, cols: 15 }; // Default size
    }

    const maxRow = Math.max(...cellEntries.map(([_, cell]) => cell.row));
    const maxCol = Math.max(...cellEntries.map(([_, cell]) => cell.col));

    // Add substantial buffer for editing and ensure minimum size
    return {
      rows: Math.max(maxRow + 15, 30),
      cols: Math.max(maxCol + 8, 20)
    };
  };

  const { rows, cols } = calculateGridSize();

  const numberToColumn = (num: number): string => {
    let result = '';
    while (num > 0) {
      num--;
      result = String.fromCharCode(65 + (num % 26)) + result;
      num = Math.floor(num / 26);
    }
    return result;
  };

  const getCellId = (row: number, col: number): string => {
    return `${numberToColumn(col)}${row}`;
  };

  const handleCellClick = (cellId: string) => {
    onCellSelect(cellId);
    const cell = data.cells[cellId];
    setEditingCell(cellId);
    setEditValue(cell?.formula || cell?.value?.toString() || '');
  };

  const handleCellSubmit = () => {
    if (editingCell) {
      const isFormula = editValue.startsWith('=');
      onCellChange(
        editingCell,
        isFormula ? editValue : editValue,
        isFormula ? editValue : undefined
      );
      setEditingCell(null);
      setEditValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellSubmit();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    }
  };

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const renderCell = (row: number, col: number) => {
    const cellId = getCellId(row, col);
    const cell = data.cells[cellId];
    const isSelected = data.selectedCell === cellId;
    const isEditing = editingCell === cellId;

    const cellValue = cell?.formula ? 
      (cell.value !== undefined ? cell.value : cell.formula) : 
      (cell?.value || '');

    // Determine if this cell has data
    const hasData = cell && (cell.value !== null && cell.value !== undefined && cell.value !== '');

    return (
      <div
        key={cellId}
        className={`
          relative h-8 border border-gray-300 cursor-pointer hover:bg-blue-50 
          transition-colors duration-150 flex items-center px-2 text-sm
          ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
          ${hasData ? 'bg-white' : 'bg-gray-50'}
          ${cell?.format?.backgroundColor ? '' : ''}
        `}
        style={{
          backgroundColor: cell?.format?.backgroundColor || (hasData ? 'white' : '#f9fafb'),
          color: cell?.format?.textColor,
          fontWeight: cell?.format?.fontWeight,
          textAlign: cell?.format?.alignment,
        }}
        onClick={() => handleCellClick(cellId)}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleCellSubmit}
            onKeyDown={handleKeyDown}
            className="w-full h-full border-none outline-none bg-transparent"
          />
        ) : (
          <span className="truncate w-full" title={String(cellValue)}>
            {cellValue}
          </span>
        )}
      </div>
    );
  };

  // Generate column widths dynamically
  const generateGridTemplate = () => {
    return `60px repeat(${cols}, 120px)`;
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 overflow-auto border border-gray-400 bg-white shadow-lg rounded-lg">
        <div 
          className="grid gap-0 min-w-max"
          style={{ gridTemplateColumns: generateGridTemplate() }}
        >
          {/* Corner cell */}
          <div className="h-8 bg-gray-100 border border-gray-300 flex items-center justify-center font-semibold text-xs sticky top-0 left-0 z-20"></div>
          
          {/* Column headers */}
          {Array.from({ length: cols }, (_, col) => (
            <div
              key={`col-${col}`}
              className="h-8 bg-gray-100 border border-gray-300 flex items-center justify-center font-semibold text-xs sticky top-0 z-10"
            >
              {numberToColumn(col + 1)}
            </div>
          ))}

          {/* Rows */}
          {Array.from({ length: rows }, (_, row) => (
            <React.Fragment key={`row-${row}`}>
              {/* Row header */}
              <div className="h-8 bg-gray-100 border border-gray-300 flex items-center justify-center font-semibold text-xs sticky left-0 z-10">
                {row + 1}
              </div>
              
              {/* Row cells */}
              {Array.from({ length: cols }, (_, col) => renderCell(row + 1, col + 1))}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Grid info */}
      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600 border-t flex flex-wrap items-center gap-4">
        <span>Grid: {rows} rows × {cols} columns</span>
        <span>Data cells: {Object.keys(data.cells).length}</span>
        <span>Selected: {data.selectedCell || 'None'}</span>
        <span className="text-blue-600">Click any cell to edit • Press Enter to save • Press Escape to cancel</span>
      </div>
    </div>
  );
};