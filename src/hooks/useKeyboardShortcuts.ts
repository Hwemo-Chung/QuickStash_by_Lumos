import { useEffect, useCallback } from 'react';
import { useStashStore } from '../store/useStashStore';
import { DRAWER_META, type DrawerType } from '../types';

interface KeyboardShortcutsOptions {
  enabled?: boolean;
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}) {
  const { enabled = true } = options;
  const setActiveDrawer = useStashStore(state => state.setActiveDrawer);
  const setSearchQuery = useStashStore(state => state.setSearchQuery);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isMod = e.metaKey || e.ctrlKey;
    const target = e.target as HTMLElement;
    const isInputFocused = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

    // Cmd/Ctrl + K: Focus search
    if (isMod && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }

    // Cmd/Ctrl + N: Focus quick input
    if (isMod && e.key === 'n') {
      e.preventDefault();
      const quickInput = document.querySelector<HTMLTextAreaElement>('[data-quick-input]');
      if (quickInput) {
        quickInput.focus();
      }
    }

    // Escape: Clear search, blur input, close menus
    if (e.key === 'Escape') {
      if (isInputFocused) {
        (target as HTMLInputElement).blur();
        setSearchQuery('');
      }
    }

    // Cmd/Ctrl + 0: Switch to "All" drawer
    if (isMod && e.key === '0') {
      e.preventDefault();
      setActiveDrawer('all');
    }

    // Cmd/Ctrl + 1-9: Switch to drawer 1-9
    if (isMod && /^[1-9]$/.test(e.key)) {
      e.preventDefault();
      const index = parseInt(e.key, 10) - 1;
      if (index < DRAWER_META.length) {
        setActiveDrawer(DRAWER_META[index].type as DrawerType | 'all');
      }
    }
  }, [setActiveDrawer, setSearchQuery]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);
}
