import React, { useState } from 'react';
import { Plus, FileSpreadsheet, X, Check, BarChart3, Calculator, Users, TrendingUp, Calendar, DollarSign, Package, Target } from 'lucide-react';
import { Cell } from '../types/spreadsheet';

interface SheetCreatorProps {
  onCreateSheet: (name: string, initialData?: { [key: string]: Cell }) => void;
  isVisible: boolean;
  onClose: () => void;
}

export const SheetCreator: React.FC<SheetCreatorProps> = ({ onCreateSheet, isVisible, onClose }) => {
  const [sheetName, setSheetName] = useState('');
  const [template, setTemplate] = useState<string>('blank');

  const templates = {
    blank: {
      name: 'Blank Sheet',
      description: 'Start with an empty spreadsheet',
      icon: FileSpreadsheet,
      color: 'text-gray-600',
      data: {}
    },
    budget: {
      name: 'Budget Tracker',
      description: 'Personal or business budget management',
      icon: DollarSign,
      color: 'text-green-600',
      data: {
        'A1': { id: 'A1', row: 1, col: 1, value: 'Category', type: 'text' as const },
        'B1': { id: 'B1', row: 1, col: 2, value: 'Budgeted Amount', type: 'text' as const },
        'C1': { id: 'C1', row: 1, col: 3, value: 'Actual Amount', type: 'text' as const },
        'D1': { id: 'D1', row: 1, col: 4, value: 'Difference', type: 'text' as const },
        'E1': { id: 'E1', row: 1, col: 5, value: 'Status', type: 'text' as const },
        
        'A2': { id: 'A2', row: 2, col: 1, value: 'Income', type: 'text' as const },
        'B2': { id: 'B2', row: 2, col: 2, value: 5000, type: 'number' as const },
        'C2': { id: 'C2', row: 2, col: 3, value: 4800, type: 'number' as const },
        'D2': { id: 'D2', row: 2, col: 4, value: '=C2-B2', type: 'formula' as const, formula: '=C2-B2' },
        'E2': { id: 'E2', row: 2, col: 5, value: '=IF(D2<0,"Under","Over")', type: 'formula' as const, formula: '=IF(D2<0,"Under","Over")' },
        
        'A3': { id: 'A3', row: 3, col: 1, value: 'Housing', type: 'text' as const },
        'B3': { id: 'B3', row: 3, col: 2, value: 1500, type: 'number' as const },
        'C3': { id: 'C3', row: 3, col: 3, value: 1600, type: 'number' as const },
        'D3': { id: 'D3', row: 3, col: 4, value: '=C3-B3', type: 'formula' as const, formula: '=C3-B3' },
        'E3': { id: 'E3', row: 3, col: 5, value: '=IF(D3<0,"Under","Over")', type: 'formula' as const, formula: '=IF(D3<0,"Under","Over")' },
        
        'A4': { id: 'A4', row: 4, col: 1, value: 'Transportation', type: 'text' as const },
        'B4': { id: 'B4', row: 4, col: 2, value: 400, type: 'number' as const },
        'C4': { id: 'C4', row: 4, col: 3, value: 350, type: 'number' as const },
        'D4': { id: 'D4', row: 4, col: 4, value: '=C4-B4', type: 'formula' as const, formula: '=C4-B4' },
        'E4': { id: 'E4', row: 4, col: 5, value: '=IF(D4<0,"Under","Over")', type: 'formula' as const, formula: '=IF(D4<0,"Under","Over")' },
        
        'A5': { id: 'A5', row: 5, col: 1, value: 'Food & Dining', type: 'text' as const },
        'B5': { id: 'B5', row: 5, col: 2, value: 600, type: 'number' as const },
        'C5': { id: 'C5', row: 5, col: 3, value: 720, type: 'number' as const },
        'D5': { id: 'D5', row: 5, col: 4, value: '=C5-B5', type: 'formula' as const, formula: '=C5-B5' },
        'E5': { id: 'E5', row: 5, col: 5, value: '=IF(D5<0,"Under","Over")', type: 'formula' as const, formula: '=IF(D5<0,"Under","Over")' },
        
        'A6': { id: 'A6', row: 6, col: 1, value: 'Utilities', type: 'text' as const },
        'B6': { id: 'B6', row: 6, col: 2, value: 200, type: 'number' as const },
        'C6': { id: 'C6', row: 6, col: 3, value: 180, type: 'number' as const },
        'D6': { id: 'D6', row: 6, col: 4, value: '=C6-B6', type: 'formula' as const, formula: '=C6-B6' },
        'E6': { id: 'E6', row: 6, col: 5, value: '=IF(D6<0,"Under","Over")', type: 'formula' as const, formula: '=IF(D6<0,"Under","Over")' },
        
        'A7': { id: 'A7', row: 7, col: 1, value: 'Entertainment', type: 'text' as const },
        'B7': { id: 'B7', row: 7, col: 2, value: 300, type: 'number' as const },
        'C7': { id: 'C7', row: 7, col: 3, value: 250, type: 'number' as const },
        'D7': { id: 'D7', row: 7, col: 4, value: '=C7-B7', type: 'formula' as const, formula: '=C7-B7' },
        'E7': { id: 'E7', row: 7, col: 5, value: '=IF(D7<0,"Under","Over")', type: 'formula' as const, formula: '=IF(D7<0,"Under","Over")' },
        
        'A9': { id: 'A9', row: 9, col: 1, value: 'TOTALS', type: 'text' as const },
        'B9': { id: 'B9', row: 9, col: 2, value: '=SUM(B2:B7)', type: 'formula' as const, formula: '=SUM(B2:B7)' },
        'C9': { id: 'C9', row: 9, col: 3, value: '=SUM(C2:C7)', type: 'formula' as const, formula: '=SUM(C2:C7)' },
        'D9': { id: 'D9', row: 9, col: 4, value: '=SUM(D2:D7)', type: 'formula' as const, formula: '=SUM(D2:D7)' }
      }
    },
    sales: {
      name: 'Sales Tracker',
      description: 'Track sales performance and revenue',
      icon: TrendingUp,
      color: 'text-blue-600',
      data: {
        'A1': { id: 'A1', row: 1, col: 1, value: 'Date', type: 'text' as const },
        'B1': { id: 'B1', row: 1, col: 2, value: 'Product', type: 'text' as const },
        'C1': { id: 'C1', row: 1, col: 3, value: 'Customer', type: 'text' as const },
        'D1': { id: 'D1', row: 1, col: 4, value: 'Quantity', type: 'text' as const },
        'E1': { id: 'E1', row: 1, col: 5, value: 'Unit Price', type: 'text' as const },
        'F1': { id: 'F1', row: 1, col: 6, value: 'Total', type: 'text' as const },
        'G1': { id: 'G1', row: 1, col: 7, value: 'Region', type: 'text' as const },
        'H1': { id: 'H1', row: 1, col: 8, value: 'Sales Rep', type: 'text' as const },
        
        'A2': { id: 'A2', row: 2, col: 1, value: '2024-01-15', type: 'text' as const },
        'B2': { id: 'B2', row: 2, col: 2, value: 'Laptop Pro', type: 'text' as const },
        'C2': { id: 'C2', row: 2, col: 3, value: 'TechCorp Inc', type: 'text' as const },
        'D2': { id: 'D2', row: 2, col: 4, value: 5, type: 'number' as const },
        'E2': { id: 'E2', row: 2, col: 5, value: 1200, type: 'number' as const },
        'F2': { id: 'F2', row: 2, col: 6, value: '=D2*E2', type: 'formula' as const, formula: '=D2*E2' },
        'G2': { id: 'G2', row: 2, col: 7, value: 'North', type: 'text' as const },
        'H2': { id: 'H2', row: 2, col: 8, value: 'John Smith', type: 'text' as const },
        
        'A3': { id: 'A3', row: 3, col: 1, value: '2024-01-16', type: 'text' as const },
        'B3': { id: 'B3', row: 3, col: 2, value: 'Wireless Mouse', type: 'text' as const },
        'C3': { id: 'C3', row: 3, col: 3, value: 'StartupXYZ', type: 'text' as const },
        'D3': { id: 'D3', row: 3, col: 4, value: 25, type: 'number' as const },
        'E3': { id: 'E3', row: 3, col: 5, value: 50, type: 'number' as const },
        'F3': { id: 'F3', row: 3, col: 6, value: '=D3*E3', type: 'formula' as const, formula: '=D3*E3' },
        'G3': { id: 'G3', row: 3, col: 7, value: 'South', type: 'text' as const },
        'H3': { id: 'H3', row: 3, col: 8, value: 'Jane Doe', type: 'text' as const },
        
        'A4': { id: 'A4', row: 4, col: 1, value: '2024-01-17', type: 'text' as const },
        'B4': { id: 'B4', row: 4, col: 2, value: 'Monitor 4K', type: 'text' as const },
        'C4': { id: 'C4', row: 4, col: 3, value: 'Design Studio', type: 'text' as const },
        'D4': { id: 'D4', row: 4, col: 4, value: 3, type: 'number' as const },
        'E4': { id: 'E4', row: 4, col: 5, value: 450, type: 'number' as const },
        'F4': { id: 'F4', row: 4, col: 6, value: '=D4*E4', type: 'formula' as const, formula: '=D4*E4' },
        'G4': { id: 'G4', row: 4, col: 7, value: 'East', type: 'text' as const },
        'H4': { id: 'H4', row: 4, col: 8, value: 'Mike Johnson', type: 'text' as const },
        
        'A6': { id: 'A6', row: 6, col: 1, value: 'SUMMARY', type: 'text' as const },
        'E6': { id: 'E6', row: 6, col: 5, value: 'Total Revenue:', type: 'text' as const },
        'F6': { id: 'F6', row: 6, col: 6, value: '=SUM(F2:F4)', type: 'formula' as const, formula: '=SUM(F2:F4)' }
      }
    },
    inventory: {
      name: 'Inventory Management',
      description: 'Track stock levels and inventory status',
      icon: Package,
      color: 'text-purple-600',
      data: {
        'A1': { id: 'A1', row: 1, col: 1, value: 'Item Code', type: 'text' as const },
        'B1': { id: 'B1', row: 1, col: 2, value: 'Item Name', type: 'text' as const },
        'C1': { id: 'C1', row: 1, col: 3, value: 'Category', type: 'text' as const },
        'D1': { id: 'D1', row: 1, col: 4, value: 'Current Stock', type: 'text' as const },
        'E1': { id: 'E1', row: 1, col: 5, value: 'Min Stock', type: 'text' as const },
        'F1': { id: 'F1', row: 1, col: 6, value: 'Unit Price', type: 'text' as const },
        'G1': { id: 'G1', row: 1, col: 7, value: 'Total Value', type: 'text' as const },
        'H1': { id: 'H1', row: 1, col: 8, value: 'Status', type: 'text' as const },
        
        'A2': { id: 'A2', row: 2, col: 1, value: 'ITM001', type: 'text' as const },
        'B2': { id: 'B2', row: 2, col: 2, value: 'Office Chair', type: 'text' as const },
        'C2': { id: 'C2', row: 2, col: 3, value: 'Furniture', type: 'text' as const },
        'D2': { id: 'D2', row: 2, col: 4, value: 25, type: 'number' as const },
        'E2': { id: 'E2', row: 2, col: 5, value: 10, type: 'number' as const },
        'F2': { id: 'F2', row: 2, col: 6, value: 150, type: 'number' as const },
        'G2': { id: 'G2', row: 2, col: 7, value: '=D2*F2', type: 'formula' as const, formula: '=D2*F2' },
        'H2': { id: 'H2', row: 2, col: 8, value: '=IF(D2<E2,"Low Stock","OK")', type: 'formula' as const, formula: '=IF(D2<E2,"Low Stock","OK")' },
        
        'A3': { id: 'A3', row: 3, col: 1, value: 'ITM002', type: 'text' as const },
        'B3': { id: 'B3', row: 3, col: 2, value: 'Laptop Stand', type: 'text' as const },
        'C3': { id: 'C3', row: 3, col: 3, value: 'Accessories', type: 'text' as const },
        'D3': { id: 'D3', row: 3, col: 4, value: 8, type: 'number' as const },
        'E3': { id: 'E3', row: 3, col: 5, value: 15, type: 'number' as const },
        'F3': { id: 'F3', row: 3, col: 6, value: 45, type: 'number' as const },
        'G3': { id: 'G3', row: 3, col: 7, value: '=D3*F3', type: 'formula' as const, formula: '=D3*F3' },
        'H3': { id: 'H3', row: 3, col: 8, value: '=IF(D3<E3,"Low Stock","OK")', type: 'formula' as const, formula: '=IF(D3<E3,"Low Stock","OK")' },
        
        'A4': { id: 'A4', row: 4, col: 1, value: 'ITM003', type: 'text' as const },
        'B4': { id: 'B4', row: 4, col: 2, value: 'Wireless Keyboard', type: 'text' as const },
        'C4': { id: 'C4', row: 4, col: 3, value: 'Electronics', type: 'text' as const },
        'D4': { id: 'D4', row: 4, col: 4, value: 30, type: 'number' as const },
        'E4': { id: 'E4', row: 4, col: 5, value: 20, type: 'number' as const },
        'F4': { id: 'F4', row: 4, col: 6, value: 75, type: 'number' as const },
        'G4': { id: 'G4', row: 4, col: 7, value: '=D4*F4', type: 'formula' as const, formula: '=D4*F4' },
        'H4': { id: 'H4', row: 4, col: 8, value: '=IF(D4<E4,"Low Stock","OK")', type: 'formula' as const, formula: '=IF(D4<E4,"Low Stock","OK")' },
        
        'A6': { id: 'A6', row: 6, col: 1, value: 'TOTALS', type: 'text' as const },
        'F6': { id: 'F6', row: 6, col: 6, value: 'Total Inventory Value:', type: 'text' as const },
        'G6': { id: 'G6', row: 6, col: 7, value: '=SUM(G2:G4)', type: 'formula' as const, formula: '=SUM(G2:G4)' }
      }
    },
    employee: {
      name: 'Employee Database',
      description: 'Manage employee information and records',
      icon: Users,
      color: 'text-indigo-600',
      data: {
        'A1': { id: 'A1', row: 1, col: 1, value: 'Employee ID', type: 'text' as const },
        'B1': { id: 'B1', row: 1, col: 2, value: 'Full Name', type: 'text' as const },
        'C1': { id: 'C1', row: 1, col: 3, value: 'Department', type: 'text' as const },
        'D1': { id: 'D1', row: 1, col: 4, value: 'Position', type: 'text' as const },
        'E1': { id: 'E1', row: 1, col: 5, value: 'Salary', type: 'text' as const },
        'F1': { id: 'F1', row: 1, col: 6, value: 'Start Date', type: 'text' as const },
        'G1': { id: 'G1', row: 1, col: 7, value: 'Performance Score', type: 'text' as const },
        'H1': { id: 'H1', row: 1, col: 8, value: 'Status', type: 'text' as const },
        
        'A2': { id: 'A2', row: 2, col: 1, value: 'EMP001', type: 'text' as const },
        'B2': { id: 'B2', row: 2, col: 2, value: 'John Doe', type: 'text' as const },
        'C2': { id: 'C2', row: 2, col: 3, value: 'Engineering', type: 'text' as const },
        'D2': { id: 'D2', row: 2, col: 4, value: 'Senior Developer', type: 'text' as const },
        'E2': { id: 'E2', row: 2, col: 5, value: 75000, type: 'number' as const },
        'F2': { id: 'F2', row: 2, col: 6, value: '2022-03-15', type: 'text' as const },
        'G2': { id: 'G2', row: 2, col: 7, value: 4.5, type: 'number' as const },
        'H2': { id: 'H2', row: 2, col: 8, value: 'Active', type: 'text' as const },
        
        'A3': { id: 'A3', row: 3, col: 1, value: 'EMP002', type: 'text' as const },
        'B3': { id: 'B3', row: 3, col: 2, value: 'Jane Smith', type: 'text' as const },
        'C3': { id: 'C3', row: 3, col: 3, value: 'Marketing', type: 'text' as const },
        'D3': { id: 'D3', row: 3, col: 4, value: 'Marketing Manager', type: 'text' as const },
        'E3': { id: 'E3', row: 3, col: 5, value: 65000, type: 'number' as const },
        'F3': { id: 'F3', row: 3, col: 6, value: '2021-08-20', type: 'text' as const },
        'G3': { id: 'G3', row: 3, col: 7, value: 4.8, type: 'number' as const },
        'H3': { id: 'H3', row: 3, col: 8, value: 'Active', type: 'text' as const },
        
        'A4': { id: 'A4', row: 4, col: 1, value: 'EMP003', type: 'text' as const },
        'B4': { id: 'B4', row: 4, col: 2, value: 'Bob Johnson', type: 'text' as const },
        'C4': { id: 'C4', row: 4, col: 3, value: 'Sales', type: 'text' as const },
        'D4': { id: 'D4', row: 4, col: 4, value: 'Sales Representative', type: 'text' as const },
        'E4': { id: 'E4', row: 4, col: 5, value: 55000, type: 'number' as const },
        'F4': { id: 'F4', row: 4, col: 6, value: '2023-01-10', type: 'text' as const },
        'G4': { id: 'G4', row: 4, col: 7, value: 4.2, type: 'number' as const },
        'H4': { id: 'H4', row: 4, col: 8, value: 'Active', type: 'text' as const },
        
        'A6': { id: 'A6', row: 6, col: 1, value: 'STATISTICS', type: 'text' as const },
        'D6': { id: 'D6', row: 6, col: 4, value: 'Average Salary:', type: 'text' as const },
        'E6': { id: 'E6', row: 6, col: 5, value: '=AVERAGE(E2:E4)', type: 'formula' as const, formula: '=AVERAGE(E2:E4)' },
        'D7': { id: 'D7', row: 7, col: 4, value: 'Avg Performance:', type: 'text' as const },
        'E7': { id: 'E7', row: 7, col: 5, value: '=AVERAGE(G2:G4)', type: 'formula' as const, formula: '=AVERAGE(G2:G4)' }
      }
    },
    project: {
      name: 'Project Tracker',
      description: 'Track project progress and milestones',
      icon: Target,
      color: 'text-orange-600',
      data: {
        'A1': { id: 'A1', row: 1, col: 1, value: 'Project ID', type: 'text' as const },
        'B1': { id: 'B1', row: 1, col: 2, value: 'Project Name', type: 'text' as const },
        'C1': { id: 'C1', row: 1, col: 3, value: 'Start Date', type: 'text' as const },
        'D1': { id: 'D1', row: 1, col: 4, value: 'End Date', type: 'text' as const },
        'E1': { id: 'E1', row: 1, col: 5, value: 'Progress %', type: 'text' as const },
        'F1': { id: 'F1', row: 1, col: 6, value: 'Budget', type: 'text' as const },
        'G1': { id: 'G1', row: 1, col: 7, value: 'Spent', type: 'text' as const },
        'H1': { id: 'H1', row: 1, col: 8, value: 'Status', type: 'text' as const },
        
        'A2': { id: 'A2', row: 2, col: 1, value: 'PRJ001', type: 'text' as const },
        'B2': { id: 'B2', row: 2, col: 2, value: 'Website Redesign', type: 'text' as const },
        'C2': { id: 'C2', row: 2, col: 3, value: '2024-01-01', type: 'text' as const },
        'D2': { id: 'D2', row: 2, col: 4, value: '2024-03-31', type: 'text' as const },
        'E2': { id: 'E2', row: 2, col: 5, value: 75, type: 'number' as const },
        'F2': { id: 'F2', row: 2, col: 6, value: 50000, type: 'number' as const },
        'G2': { id: 'G2', row: 2, col: 7, value: 37500, type: 'number' as const },
        'H2': { id: 'H2', row: 2, col: 8, value: '=IF(E2=100,"Complete",IF(E2>50,"On Track","At Risk"))', type: 'formula' as const, formula: '=IF(E2=100,"Complete",IF(E2>50,"On Track","At Risk"))' },
        
        'A3': { id: 'A3', row: 3, col: 1, value: 'PRJ002', type: 'text' as const },
        'B3': { id: 'B3', row: 3, col: 2, value: 'Mobile App Development', type: 'text' as const },
        'C3': { id: 'C3', row: 3, col: 3, value: '2024-02-01', type: 'text' as const },
        'D3': { id: 'D3', row: 3, col: 4, value: '2024-06-30', type: 'text' as const },
        'E3': { id: 'E3', row: 3, col: 5, value: 45, type: 'number' as const },
        'F3': { id: 'F3', row: 3, col: 6, value: 80000, type: 'number' as const },
        'G3': { id: 'G3', row: 3, col: 7, value: 36000, type: 'number' as const },
        'H3': { id: 'H3', row: 3, col: 8, value: '=IF(E3=100,"Complete",IF(E3>50,"On Track","At Risk"))', type: 'formula' as const, formula: '=IF(E3=100,"Complete",IF(E3>50,"On Track","At Risk"))' },
        
        'A4': { id: 'A4', row: 4, col: 1, value: 'PRJ003', type: 'text' as const },
        'B4': { id: 'B4', row: 4, col: 2, value: 'Database Migration', type: 'text' as const },
        'C4': { id: 'C4', row: 4, col: 3, value: '2024-01-15', type: 'text' as const },
        'D4': { id: 'D4', row: 4, col: 4, value: '2024-02-15', type: 'text' as const },
        'E4': { id: 'E4', row: 4, col: 5, value: 100, type: 'number' as const },
        'F4': { id: 'F4', row: 4, col: 6, value: 25000, type: 'number' as const },
        'G4': { id: 'G4', row: 4, col: 7, value: 23000, type: 'number' as const },
        'H4': { id: 'H4', row: 4, col: 8, value: '=IF(E4=100,"Complete",IF(E4>50,"On Track","At Risk"))', type: 'formula' as const, formula: '=IF(E4=100,"Complete",IF(E4>50,"On Track","At Risk"))' },
        
        'A6': { id: 'A6', row: 6, col: 1, value: 'SUMMARY', type: 'text' as const },
        'E6': { id: 'E6', row: 6, col: 5, value: 'Total Budget:', type: 'text' as const },
        'F6': { id: 'F6', row: 6, col: 6, value: '=SUM(F2:F4)', type: 'formula' as const, formula: '=SUM(F2:F4)' },
        'E7': { id: 'E7', row: 7, col: 5, value: 'Total Spent:', type: 'text' as const },
        'F7': { id: 'F7', row: 7, col: 6, value: '=SUM(G2:G4)', type: 'formula' as const, formula: '=SUM(G2:G4)' }
      }
    },
    expense: {
      name: 'Expense Tracker',
      description: 'Track business or personal expenses',
      icon: Calculator,
      color: 'text-red-600',
      data: {
        'A1': { id: 'A1', row: 1, col: 1, value: 'Date', type: 'text' as const },
        'B1': { id: 'B1', row: 1, col: 2, value: 'Description', type: 'text' as const },
        'C1': { id: 'C1', row: 1, col: 3, value: 'Category', type: 'text' as const },
        'D1': { id: 'D1', row: 1, col: 4, value: 'Amount', type: 'text' as const },
        'E1': { id: 'E1', row: 1, col: 5, value: 'Payment Method', type: 'text' as const },
        'F1': { id: 'F1', row: 1, col: 6, value: 'Receipt', type: 'text' as const },
        'G1': { id: 'G1', row: 1, col: 7, value: 'Tax Deductible', type: 'text' as const },
        
        'A2': { id: 'A2', row: 2, col: 1, value: '2024-01-15', type: 'text' as const },
        'B2': { id: 'B2', row: 2, col: 2, value: 'Office Supplies', type: 'text' as const },
        'C2': { id: 'C2', row: 2, col: 3, value: 'Office', type: 'text' as const },
        'D2': { id: 'D2', row: 2, col: 4, value: 150.50, type: 'number' as const },
        'E2': { id: 'E2', row: 2, col: 5, value: 'Credit Card', type: 'text' as const },
        'F2': { id: 'F2', row: 2, col: 6, value: 'Yes', type: 'text' as const },
        'G2': { id: 'G2', row: 2, col: 7, value: 'Yes', type: 'text' as const },
        
        'A3': { id: 'A3', row: 3, col: 1, value: '2024-01-16', type: 'text' as const },
        'B3': { id: 'B3', row: 3, col: 2, value: 'Client Lunch', type: 'text' as const },
        'C3': { id: 'C3', row: 3, col: 3, value: 'Meals', type: 'text' as const },
        'D3': { id: 'D3', row: 3, col: 4, value: 85.00, type: 'number' as const },
        'E3': { id: 'E3', row: 3, col: 5, value: 'Cash', type: 'text' as const },
        'F3': { id: 'F3', row: 3, col: 6, value: 'Yes', type: 'text' as const },
        'G3': { id: 'G3', row: 3, col: 7, value: 'Yes', type: 'text' as const },
        
        'A4': { id: 'A4', row: 4, col: 1, value: '2024-01-17', type: 'text' as const },
        'B4': { id: 'B4', row: 4, col: 2, value: 'Software License', type: 'text' as const },
        'C4': { id: 'C4', row: 4, col: 3, value: 'Software', type: 'text' as const },
        'D4': { id: 'D4', row: 4, col: 4, value: 299.99, type: 'number' as const },
        'E4': { id: 'E4', row: 4, col: 5, value: 'Bank Transfer', type: 'text' as const },
        'F4': { id: 'F4', row: 4, col: 6, value: 'Yes', type: 'text' as const },
        'G4': { id: 'G4', row: 4, col: 7, value: 'Yes', type: 'text' as const },
        
        'A6': { id: 'A6', row: 6, col: 1, value: 'TOTALS', type: 'text' as const },
        'C6': { id: 'C6', row: 6, col: 3, value: 'Total Expenses:', type: 'text' as const },
        'D6': { id: 'D6', row: 6, col: 4, value: '=SUM(D2:D4)', type: 'formula' as const, formula: '=SUM(D2:D4)' },
        'C7': { id: 'C7', row: 7, col: 3, value: 'Tax Deductible:', type: 'text' as const },
        'D7': { id: 'D7', row: 7, col: 4, value: '=SUMIF(G2:G4,"Yes",D2:D4)', type: 'formula' as const, formula: '=SUMIF(G2:G4,"Yes",D2:D4)' }
      }
    },
    schedule: {
      name: 'Schedule Planner',
      description: 'Plan and track schedules and appointments',
      icon: Calendar,
      color: 'text-teal-600',
      data: {
        'A1': { id: 'A1', row: 1, col: 1, value: 'Date', type: 'text' as const },
        'B1': { id: 'B1', row: 1, col: 2, value: 'Time', type: 'text' as const },
        'C1': { id: 'C1', row: 1, col: 3, value: 'Event/Task', type: 'text' as const },
        'D1': { id: 'D1', row: 1, col: 4, value: 'Duration', type: 'text' as const },
        'E1': { id: 'E1', row: 1, col: 5, value: 'Location', type: 'text' as const },
        'F1': { id: 'F1', row: 1, col: 6, value: 'Attendees', type: 'text' as const },
        'G1': { id: 'G1', row: 1, col: 7, value: 'Priority', type: 'text' as const },
        'H1': { id: 'H1', row: 1, col: 8, value: 'Status', type: 'text' as const },
        
        'A2': { id: 'A2', row: 2, col: 1, value: '2024-01-22', type: 'text' as const },
        'B2': { id: 'B2', row: 2, col: 2, value: '09:00', type: 'text' as const },
        'C2': { id: 'C2', row: 2, col: 3, value: 'Team Standup', type: 'text' as const },
        'D2': { id: 'D2', row: 2, col: 4, value: '30 min', type: 'text' as const },
        'E2': { id: 'E2', row: 2, col: 5, value: 'Conference Room A', type: 'text' as const },
        'F2': { id: 'F2', row: 2, col: 6, value: 'Development Team', type: 'text' as const },
        'G2': { id: 'G2', row: 2, col: 7, value: 'High', type: 'text' as const },
        'H2': { id: 'H2', row: 2, col: 8, value: 'Scheduled', type: 'text' as const },
        
        'A3': { id: 'A3', row: 3, col: 1, value: '2024-01-22', type: 'text' as const },
        'B3': { id: 'B3', row: 3, col: 2, value: '11:00', type: 'text' as const },
        'C3': { id: 'C3', row: 3, col: 3, value: 'Client Presentation', type: 'text' as const },
        'D3': { id: 'D3', row: 3, col: 4, value: '2 hours', type: 'text' as const },
        'E3': { id: 'E3', row: 3, col: 5, value: 'Client Office', type: 'text' as const },
        'F3': { id: 'F3', row: 3, col: 6, value: 'Sales Team, Client', type: 'text' as const },
        'G3': { id: 'G3', row: 3, col: 7, value: 'High', type: 'text' as const },
        'H3': { id: 'H3', row: 3, col: 8, value: 'Confirmed', type: 'text' as const },
        
        'A4': { id: 'A4', row: 4, col: 1, value: '2024-01-22', type: 'text' as const },
        'B4': { id: 'B4', row: 4, col: 2, value: '15:00', type: 'text' as const },
        'C4': { id: 'C4', row: 4, col: 3, value: 'Code Review', type: 'text' as const },
        'D4': { id: 'D4', row: 4, col: 4, value: '1 hour', type: 'text' as const },
        'E4': { id: 'E4', row: 4, col: 5, value: 'Virtual', type: 'text' as const },
        'F4': { id: 'F4', row: 4, col: 6, value: 'Senior Developers', type: 'text' as const },
        'G4': { id: 'G4', row: 4, col: 7, value: 'Medium', type: 'text' as const },
        'H4': { id: 'H4', row: 4, col: 8, value: 'Scheduled', type: 'text' as const },
        
        'A5': { id: 'A5', row: 5, col: 1, value: '2024-01-23', type: 'text' as const },
        'B5': { id: 'B5', row: 5, col: 2, value: '10:00', type: 'text' as const },
        'C5': { id: 'C5', row: 5, col: 3, value: 'Project Planning', type: 'text' as const },
        'D5': { id: 'D5', row: 5, col: 4, value: '1.5 hours', type: 'text' as const },
        'E5': { id: 'E5', row: 5, col: 5, value: 'Conference Room B', type: 'text' as const },
        'F5': { id: 'F5', row: 5, col: 6, value: 'Project Managers', type: 'text' as const },
        'G5': { id: 'G5', row: 5, col: 7, value: 'High', type: 'text' as const },
        'H5': { id: 'H5', row: 5, col: 8, value: 'Tentative', type: 'text' as const }
      }
    }
  };

  const handleCreate = () => {
    if (!sheetName.trim()) return;
    
    const templateData = templates[template as keyof typeof templates].data;
    onCreateSheet(sheetName.trim(), templateData);
    setSheetName('');
    setTemplate('blank');
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <FileSpreadsheet className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create New Sheet</h2>
              <p className="text-sm text-gray-600">Choose a template to get started quickly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Sheet Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sheet Name
            </label>
            <input
              type="text"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              placeholder="Enter sheet name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose Template
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(templates).map(([key, template]) => {
                const IconComponent = template.icon;
                return (
                  <label
                    key={key}
                    className={`
                      flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md
                      ${template === key 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="template"
                      value={key}
                      checked={template === key}
                      onChange={(e) => setTemplate(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                      template === key ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <IconComponent className={`h-6 w-6 ${template.color}`} />
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900 mb-1">{template.name}</div>
                      <div className="text-xs text-gray-600 leading-relaxed">{template.description}</div>
                    </div>
                    {template === key && (
                      <div className="mt-2">
                        <Check className="h-5 w-5 text-blue-600" />
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Template Preview */}
          {template !== 'blank' && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Template Preview</h4>
              <p className="text-xs text-gray-600 mb-3">
                This template includes pre-filled data and formulas to help you get started quickly.
              </p>
              <div className="bg-white rounded border p-3 text-xs">
                <div className="grid grid-cols-4 gap-2 text-gray-500">
                  <div className="font-medium">Column A</div>
                  <div className="font-medium">Column B</div>
                  <div className="font-medium">Column C</div>
                  <div className="font-medium">Column D</div>
                </div>
                <div className="mt-1 text-gray-400 text-xs">
                  Sample data and formulas included...
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="text-sm text-gray-600">
            {template === 'blank' ? 
              'Start with an empty sheet' : 
              `Using ${templates[template as keyof typeof templates].name} template`
            }
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!sheetName.trim()}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Sheet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};