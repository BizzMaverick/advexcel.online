import { useEffect, useCallback } from 'react';
import hotkeys from 'hotkeys-js';

type ShortcutHandler = () => void;

interface ShortcutConfig {
  key: string;
  handler: ShortcutHandler;
  description: string;
  scope?: string;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[], enabled = true) => {
  const registerShortcuts = useCallback(() => {
    shortcuts.forEach(({ key, handler, scope = 'all' }) => {
      hotkeys(key, { scope }, (event) => {
        event.preventDefault();
        handler();
      });
    });
  }, [shortcuts]);

  const unregisterShortcuts = useCallback(() => {
    shortcuts.forEach(({ key }) => {
      hotkeys.unbind(key);
    });
  }, [shortcuts]);

  useEffect(() => {
    if (enabled) {
      registerShortcuts();
    }

    return () => {
      unregisterShortcuts();
    };
  }, [enabled, registerShortcuts, unregisterShortcuts]);

  const setScope = useCallback((scope: string) => {
    hotkeys.setScope(scope);
  }, []);

  return {
    setScope,
    getShortcutsHelp: () => shortcuts.map(({ key, description }) => ({ key, description }))
  };
};