import React from 'react';
import { X, Keyboard, Command, Info } from 'lucide-react';

interface ShortcutInfo {
  key: string;
  description: string;
}

interface KeyboardShortcutsModalProps {
  isVisible: boolean;
  onClose: () => void;
  shortcuts: ShortcutInfo[];
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isVisible,
  onClose,
  shortcuts
}) => {
  if (!isVisible) return null;

  // Group shortcuts by category based on description
  const groupedShortcuts: { [category: string]: ShortcutInfo[] } = {};
  
  shortcuts.forEach(shortcut => {
    const category = shortcut.description.includes(':') 
      ? shortcut.description.split(':')[0].trim() 
      : 'General';
    
    if (!groupedShortcuts[category]) {
      groupedShortcuts[category] = [];
    }
    
    groupedShortcuts[category].push({
      ...shortcut,
      description: shortcut.description.includes(':') 
        ? shortcut.description.split(':')[1].trim() 
        : shortcut.description
    });
  });

  // Format key combinations for display
  const formatKey = (key: string) => {
    return key
      .replace(/\+/g, ' + ')
      .replace(/command/gi, '⌘')
      .replace(/ctrl/gi, 'Ctrl')
      .replace(/alt/gi, 'Alt')
      .replace(/shift/gi, 'Shift')
      .replace(/arrow/gi, '↑')
      .replace(/arrowdown/gi, '↓')
      .replace(/arrowleft/gi, '←')
      .replace(/arrowright/gi, '→')
      .replace(/enter/gi, '↵')
      .replace(/escape/gi, 'Esc')
      .replace(/delete/gi, 'Del');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Keyboard className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">Keyboard Shortcuts Help</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Use these keyboard shortcuts to quickly access features and perform actions without using the mouse.
                  Press <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200">?</span> anywhere in the application to show this help.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{category}</h3>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Shortcut
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {categoryShortcuts.map((shortcut, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <Command className="h-4 w-4 text-gray-400" />
                              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded border border-gray-300">
                                {formatKey(shortcut.key)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {shortcut.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};