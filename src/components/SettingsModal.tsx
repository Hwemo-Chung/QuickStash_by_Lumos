import { useEffect, useCallback, useState } from 'react';
import { X, Check } from 'lucide-react';
import { t, setLocale, getLocale, saveLocaleToStorage, type Locale } from '../i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LANGUAGES: { code: Locale; name: string; flag: string }[] = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [currentLocale, setCurrentLocale] = useState(getLocale());

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setCurrentLocale(getLocale());
    }
  }, [isOpen]);

  const handleLanguageChange = useCallback((locale: Locale) => {
    setLocale(locale);
    saveLocaleToStorage(locale);
    setCurrentLocale(locale);
  }, []);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        data-testid="modal-content"
        className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 id="settings-title" className="text-lg font-semibold text-gray-900">
            {t().settings.title}
          </h2>
          <button
            onClick={onClose}
            aria-label="close"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              {t().settings.language}
            </h3>
            <div role="listbox" className="space-y-2">
              {LANGUAGES.map(({ code, name, flag }) => {
                const isSelected = currentLocale === code;
                return (
                  <button
                    key={code}
                    role="option"
                    aria-selected={isSelected}
                    data-testid={`language-option-${code}`}
                    onClick={() => handleLanguageChange(code)}
                    className={`
                      w-full flex items-center justify-between p-3 rounded-xl transition-all
                      ${isSelected
                        ? 'bg-blue-50 border-2 border-blue-500 text-blue-700'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 text-gray-700'
                      }
                    `}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-xl">{flag}</span>
                      <span className="font-medium">{name}</span>
                    </span>
                    {isSelected && (
                      <Check className="w-5 h-5 text-blue-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
