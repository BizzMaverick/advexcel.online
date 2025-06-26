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
  const [selectedRange, setSelectedRange] = useState<string[]>([]);
  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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
      
      // Move to the cell below if not the last row
      if (editingCell) {
        const [col, row] = [editingCell.match(/[A-Z]+/)?.[0] || '', editingCell.match(/\d+/)?.[0] || ''];
        const rowNum = parseInt(row);
        if (rowNum < rows) {
          const nextCellId = `${col}${rowNum + 1}`;
          setTimeout(() => handleCellClick(nextCellId), 0);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleCellSubmit();
      
      // Move to the next cell to the right if not the last column
      if (editingCell) {
        const [col, row] = [editingCell.match(/[A-Z]+/)?.[0] || '', editingCell.match(/\d+/)?.[0] || ''];
        const colNum = col.split('').reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 64), 0);
        if (colNum < cols) {
          const nextCellId = `${numberToColumn(colNum + 1)}${row}`;
          setTimeout(() => handleCellClick(nextCellId), 0);
        }
      }
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      if (editingCell) {
        // If in edit mode, let the default behavior happen
        return;
      }
      
      e.preventDefault();
      
      if (data.selectedCell) {
        const [col, row] = [data.selectedCell.match(/[A-Z]+/)?.[0] || '', data.selectedCell.match(/\d+/)?.[0] || ''];
        const rowNum = parseInt(row);
        const colNum = col.split('').reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 64), 0);
        
        let newRow = rowNum;
        let newCol = colNum;
        
        switch (e.key) {
          case 'ArrowUp':
            newRow = Math.max(1, rowNum - 1);
            break;
          case 'ArrowDown':
            newRow = Math.min(rows, rowNum + 1);
            break;
          case 'ArrowLeft':
            newCol = Math.max(1, colNum - 1);
            break;
          case 'ArrowRight':
            newCol = Math.min(cols, colNum + 1);
            break;
        }
        
        const newCellId = `${numberToColumn(newCol)}${newRow}`;
        onCellSelect(newCellId);
        
        // If Shift is pressed, extend selection
        if (e.shiftKey) {
          if (!selectionStart) {
            setSelectionStart(data.selectedCell);
          }
          
          const range = getCellRange(selectionStart || data.selectedCell, newCellId);
          setSelectedRange(range);
        } else {
          setSelectionStart(null);
          setSelectedRange([]);
        }
      }
    }
  };

  // Handle cell selection with mouse
  const handleMouseDown = (cellId: string) => {
    onCellSelect(cellId);
    setSelectionStart(cellId);
    setSelectedRange([cellId]);
    setIsSelecting(true);
  };

  const handleMouseEnter = (cellId: string) => {
    if (isSelecting && selectionStart) {
      const range = getCellRange(selectionStart, cellId);
      setSelectedRange(range);
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  // Calculate cell range between two cells
  const getCellRange = (start: string, end: string): string[] => {
    const startCol = start.match(/[A-Z]+/)?.[0] || '';
    const startRow = parseInt(start.match(/\d+/)?.[0] || '0');
    const endCol = end.match(/[A-Z]+/)?.[0] || '';
    const endRow = parseInt(end.match(/\d+/)?.[0] || '0');
    
    const startColNum = startCol.split('').reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 64), 0);
    const endColNum = endCol.split('').reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 64), 0);
    
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);
    const minCol = Math.min(startColNum, endColNum);
    const maxCol = Math.max(startColNum, endColNum);
    
    const range: string[] = [];
    
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        range.push(`${numberToColumn(col)}${row}`);
      }
    }
    
    return range;
  };

  // Add keyboard shortcuts for cell navigation and editing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If we're editing a cell, let the input handle the keydown
      if (editingCell) return;
      
      // If we're focused on an input elsewhere, don't handle
      if (document.activeElement?.tagName === 'INPUT' || 
          document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      
      // Handle F2 to edit the selected cell
      if (e.key === 'F2' && data.selectedCell) {
        e.preventDefault();
        handleCellClick(data.selectedCell);
      }
      
      // Handle Delete key to clear selected cell
      if ((e.key === 'Delete' || e.key === 'Backspace') && data.selectedCell) {
        e.preventDefault();
        onCellChange(data.selectedCell, '');
      }
      
      // Handle Ctrl+C to copy cell value
      if (e.key === 'c' && (e.ctrlKey || e.metaKey) && data.selectedCell) {
        e.preventDefault();
        const cell = data.cells[data.selectedCell];
        if (cell) {
          const value = cell.formula || cell.value?.toString() || '';
          navigator.clipboard.writeText(value);
        }
      }
      
      // Handle Ctrl+V to paste into cell
      if (e.key === 'v' && (e.ctrlKey || e.metaKey) && data.selectedCell) {
        e.preventDefault();
        navigator.clipboard.readText().then(text => {
          if (text) {
            onCellChange(data.selectedCell!, text);
          }
        });
      }
      
      // Handle Ctrl+X to cut cell value
      if (e.key === 'x' && (e.ctrlKey || e.metaKey) && data.selectedCell) {
        e.preventDefault();
        const cell = data.cells[data.selectedCell];
        if (cell) {
          const value = cell.formula || cell.value?.toString() || '';
          navigator.clipboard.writeText(value);
          onCellChange(data.selectedCell, '');
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [data.selectedCell, data.cells, editingCell, onCellChange]);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  // Add event listener for mouse up to stop selection
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsSelecting(false);
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  const renderCell = (row: number, col: number) => {
    const cellId = getCellId(row, col);
    const cell = data.cells[cellId];
    const isSelected = data.selectedCell === cellId;
    const isInRange = selectedRange.includes(cellId);
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
          ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50 z-10' : ''}
          ${isInRange ? 'bg-blue-50 border-blue-200' : ''}
          ${hasData ? 'bg-white' : 'bg-gray-50'}
        `}
        style={{
          backgroundColor: cell?.format?.backgroundColor || (hasData ? 'white' : '#f9fafb'),
          color: cell?.format?.textColor,
          fontWeight: cell?.format?.fontWeight,
          textAlign: cell?.format?.alignment as any,
        }}
        onClick={() => onCellSelect(cellId)}
        onMouseDown={() => handleMouseDown(cellId)}
        onMouseEnter={() => handleMouseEnter(cellId)}
        onDoubleClick={() => handleCellClick(cellId)}
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
          ref={gridRef}
          className="grid gap-0 min-w-max"
          style={{ gridTemplateColumns: generateGridTemplate() }}
          onMouseUp={handleMouseUp}
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
        <span className="text-blue-600">
          Keyboard: <span className="font-mono bg-gray-100 px-1 rounded">↑↓←→</span> to navigate • 
          <span className="font-mono bg-gray-100 px-1 rounded">F2</span> to edit • 
          <span className="font-mono bg-gray-100 px-1 rounded">Enter</span> to save • 
          <span className="font-mono bg-gray-100 px-1 rounded">Esc</span> to cancel
        </span>
      </div>
    </div>
  );
};