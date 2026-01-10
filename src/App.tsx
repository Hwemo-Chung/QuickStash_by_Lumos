import { useState, useEffect, useCallback, useRef } from 'react';
import { Settings, ArrowUp } from 'lucide-react';
import { LockScreen } from './components/LockScreen';
import { QuickInput } from './components/QuickInput';
import { SearchBar } from './components/SearchBar';
import { DrawerTabs } from './components/DrawerTabs';
import { ItemList } from './components/ItemList';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer } from './components/Toast';
import { useStashStore } from './store/useStashStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { db } from './db/database';
import { initLocaleFromStorage } from './i18n';
import type { SecuritySettings } from './types';

const DEFAULT_SECURITY: SecuritySettings = {
  id: 'main',
  pinHash: null,
  pinSalt: null,
  failedAttempts: 0,
  isEnabled: false,
};

const SCROLL_THRESHOLD = 200;

function App() {
  const [isLocked, setIsLocked] = useState(true);
  const [security, setSecurity] = useState<SecuritySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSticky, setIsSticky] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadItems = useStashStore(state => state.loadItems);

  useKeyboardShortcuts({ enabled: !isLocked });

  useEffect(() => {
    initLocaleFromStorage();
    
    async function initialize() {
      try {
        let securitySettings = await db.security.get('main');
        
        if (!securitySettings) {
          securitySettings = DEFAULT_SECURITY;
          await db.security.add(securitySettings);
        }
        
        setSecurity(securitySettings);
        setIsLocked(securitySettings.isEnabled && !!securitySettings.pinHash);
        
        await loadItems();
      } catch (error) {
        // 에러 처리 개선: 환경에 따라 다르게 처리
        const isDev = import.meta.env.MODE === 'development';
        if (isDev) {
          console.error('Failed to initialize:', error);
        } else {
          // 프로덕션: 사용자 친화적 메시지
          console.error(
            '[APP_INIT_ERROR]',
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
        
        setSecurity(DEFAULT_SECURITY);
        setIsLocked(false);
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, [loadItems]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsSticky(!entry.isIntersecting);
        });
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [isLoading]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > SCROLL_THRESHOLD);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleUnlock = useCallback(() => {
    setIsLocked(false);
  }, []);

  const handleSecurityUpdate = useCallback(async (updates: Partial<SecuritySettings>) => {
    if (!security) return;
    
    const newSecurity = { ...security, ...updates };
    setSecurity(newSecurity);
    await db.security.put(newSecurity);
  }, [security]);

  const handleWipe = useCallback(async () => {
    await db.delete();
    window.location.reload();
  }, []);

  const handleScrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary,theme(colors.slate.50))]">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isLocked && security?.isEnabled && security?.pinHash) {
    return (
      <LockScreen
        security={security}
        onUnlock={handleUnlock}
        onSecurityUpdate={handleSecurityUpdate}
        onWipe={handleWipe}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary,theme(colors.slate.50))]">
      <div 
        data-testid="main-content"
        className="max-w-6xl mx-auto px-4 py-6 space-y-6"
      >
        <header 
          role="banner"
          className="flex items-center justify-between"
        >
          <h1 className="text-2xl font-bold text-[var(--color-text-primary,theme(colors.slate.900))]">
            QuickStash
          </h1>
          <button
            data-testid="settings-button"
            aria-label="Settings"
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </header>

        <div ref={sentinelRef} className="h-0" aria-hidden="true" />

        <div 
          data-testid="sticky-input-area"
          className={`sticky top-0 z-40 -mx-4 px-4 py-3 space-y-4 transition-all duration-200 ${
            isSticky 
              ? 'bg-[var(--color-bg-primary,theme(colors.slate.50))] shadow-md border-b border-slate-200/50' 
              : 'bg-transparent'
          }`}
        >
          <QuickInput />
          <SearchBar />
        </div>
        
        <DrawerTabs />
        
        <ItemList />
      </div>

      {showScrollTop && (
        <button
          data-testid="scroll-to-top"
          onClick={handleScrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all duration-200 animate-fade-in"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <ToastContainer />
    </div>
  );
}

export default App;
