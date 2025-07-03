import { useState, useEffect } from 'react';

interface SpreadsheetGridProps {
  data: any;
}

const SpreadsheetGrid = ({ data }: SpreadsheetGridProps) => {
  const [gridData, setGridData] = useState<any[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  useEffect(() => {
    if (data && Array.isArray(data) && data.length > 0 && Array.isArray(data[0]) && data[0].length > 0) {
      // Process data into a format suitable for the grid
      setGridData(data);
      setHeaders(data[0].map((_, index) => String.fromCharCode(65 + index)));
    } else if (data && typeof data === 'object') {
      // Assuming data is in a format like { A1: { value: 'foo' }, B1: { value: 'bar' } }
      const cells = data;
      const rows: any[][] = [];
      let maxRow = 0;
      let maxCol = 0;

      // Find the dimensions of the grid
      Object.keys(cells).forEach(cellId => {
        const match = cellId.match(/([A-Z]+)(\d+)/);
        if (match) {
          const col = match[1].split('').reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 64), 0);
          const row = parseInt(match[2]);
          maxRow = Math.max(maxRow, row);
          maxCol = Math.max(maxCol, col);
        }
      });

      // Initialize the grid
      for (let i = 0; i <= maxRow; i++) {
        rows[i] = Array(maxCol + 1).fill('');
      }

      // Fill in the values
      Object.keys(cells).forEach(cellId => {
        const match = cellId.match(/([A-Z]+)(\d+)/);
        if (match) {
          const col = match[1].split('').reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 64), 0);
          const row = parseInt(match[2]);
          rows[row - 1][col - 1] = cells[cellId].value || '';
        }
      });

      setGridData(rows);
      // Defensive: ensure maxCol is a valid number
      const safeMaxCol = Number.isFinite(maxCol) && maxCol > 0 ? maxCol : 0;
      setHeaders(Array.from({ length: safeMaxCol }, (_, i) => String.fromCharCode(65 + i)));
    } else {
      setGridData([]);
      setHeaders([]);
    }
  }, [data]);

  if (!data || gridData.length === 0 || headers.length === 0) {
    return <div className="text-gray-500">No valid spreadsheet data to display</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              #
            </th>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {gridData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                {rowIndex + 1}
              </td>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SpreadsheetGrid;