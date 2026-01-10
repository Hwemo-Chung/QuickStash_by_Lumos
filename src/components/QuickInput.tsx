import { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { classify } from '../lib/classifier';
import { generateDatePrefix, shouldAutoPrefix } from '../lib/datePrefix';
import { extractGenreFromUrl, getAvailableGenres } from '../lib/genreExtractor';
import { extractPlaceFromUrl, getMapSourceEmoji, formatPlaceTitle } from '../lib/placeExtractor';
import { useStashStore } from '../store/useStashStore';
import { DRAWER_META, type DrawerType } from '../types';
import { t, getDrawerLabel, getDrawerInputConfig, type DrawerType as I18nDrawerType } from '../i18n';
import { DRAWER_COLORS } from '../constants/drawerColors';

type ClassificationState = 'idle' | 'detecting' | 'detected';

const AUTO_SAVE_DELAY = 10; // seconds

export function QuickInput() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [autoDetectedGenre, setAutoDetectedGenre] = useState<string | null>(null);
  const [detectedPlace, setDetectedPlace] = useState<ReturnType<typeof extractPlaceFromUrl>>(null);
  const [showTitleField, setShowTitleField] = useState(false);
  const [detectedDrawer, setDetectedDrawer] = useState<DrawerType | null>(null);
  const [selectedDrawer, setSelectedDrawer] = useState<DrawerType | null>(null);
  const [showDrawerSelect, setShowDrawerSelect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classificationState, setClassificationState] = useState<ClassificationState>('idle');
  const [showPasteFeedback, setShowPasteFeedback] = useState(false);
  const [ariaAnnouncement, setAriaAnnouncement] = useState('');
  const [autoSaveCountdown, setAutoSaveCountdown] = useState<number | null>(null);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);
  const [isAutoSavePaused, setIsAutoSavePaused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const drawerSelectRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const addItem = useStashStore(state => state.addItem);
  const i18n = t();

  // Clear auto-save timer helper
  const clearAutoSaveTimer = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    setAutoSaveCountdown(null);
  }, []);

  // Start auto-save countdown
  const startAutoSaveCountdown = useCallback(() => {
    clearAutoSaveTimer();
    setAutoSaveCountdown(AUTO_SAVE_DELAY);
    setIsAutoSavePaused(false);
  }, [clearAutoSaveTimer]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!content.trim()) {
      setDetectedDrawer(null);
      setSelectedDrawer(null);
      setAutoDetectedGenre(null);
      setDetectedPlace(null);
      setClassificationState('idle');
      setAriaAnnouncement('');
      clearAutoSaveTimer();
      return;
    }

    setClassificationState('detecting');
    // Pause auto-save while typing
    setIsAutoSavePaused(true);
    clearAutoSaveTimer();

    const timer = setTimeout(() => {
      const drawer = classify(content);
      setDetectedDrawer(drawer);
      setClassificationState('detected');

      const drawerMeta = DRAWER_META.find(d => d.type === drawer);
      if (drawerMeta) {
        setAriaAnnouncement(`${getDrawerLabel(drawer)} drawer detected`);
      }

      if (drawer === 'watch') {
        const detected = extractGenreFromUrl(content);
        setAutoDetectedGenre(detected);
        if (detected && !genre) {
          setGenre(detected);
        }
      } else {
        setAutoDetectedGenre(null);
      }

      if (drawer === 'places') {
        const placeInfo = extractPlaceFromUrl(content);
        setDetectedPlace(placeInfo);
        if (placeInfo?.name && !title) {
          setTitle(placeInfo.name);
        }
      } else {
        setDetectedPlace(null);
      }

      // Start auto-save countdown after detection
      startAutoSaveCountdown();
    }, 300);

    return () => clearTimeout(timer);
  }, [content, genre, title, clearAutoSaveTimer, startAutoSaveCountdown]);

  // Auto-save countdown timer effect
  useEffect(() => {
    if (autoSaveCountdown === null || isAutoSavePaused || showTitleField) {
      return;
    }

    if (autoSaveCountdown <= 0) {
      // Trigger auto-save
      const trimmed = content.trim();
      if (trimmed && !isSubmitting) {
        setIsSubmitting(true);
        const finalDrawer = selectedDrawer || detectedDrawer || undefined;
        addItem(trimmed, title.trim() || undefined, genre || undefined, finalDrawer)
          .then(() => {
            setContent('');
            setTitle('');
            setGenre('');
            setAutoDetectedGenre(null);
            setDetectedDrawer(null);
            setSelectedDrawer(null);
            setDetectedPlace(null);
            setShowTitleField(false);
            setShowDrawerSelect(false);
            setClassificationState('idle');
            setAriaAnnouncement('');
            clearAutoSaveTimer();
            // Show saved feedback
            setShowSavedFeedback(true);
            setTimeout(() => setShowSavedFeedback(false), 1500);
          })
          .finally(() => {
            setIsSubmitting(false);
          });
      }
      return;
    }

    const timer = setTimeout(() => {
      setAutoSaveCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [autoSaveCountdown, isAutoSavePaused, showTitleField, content, isSubmitting, selectedDrawer, detectedDrawer, title, genre, addItem, clearAutoSaveTimer]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (drawerSelectRef.current && !drawerSelectRef.current.contains(event.target as Node)) {
        setShowDrawerSelect(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [content, adjustHeight]);

  const handleSubmit = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;

    clearAutoSaveTimer();
    setIsSubmitting(true);
    try {
      const finalDrawer = selectedDrawer || detectedDrawer || undefined;
      await addItem(trimmed, title.trim() || undefined, genre || undefined, finalDrawer);

      setContent('');
      setTitle('');
      setGenre('');
      setAutoDetectedGenre(null);
      setDetectedDrawer(null);
      setSelectedDrawer(null);
      setDetectedPlace(null);
      setShowTitleField(false);
      setShowDrawerSelect(false);
      setClassificationState('idle');
      setAriaAnnouncement('');
      // Show saved feedback
      setShowSavedFeedback(true);
      setTimeout(() => setShowSavedFeedback(false), 1500);
    } finally {
      setIsSubmitting(false);
    }
  }, [content, title, genre, isSubmitting, addItem, selectedDrawer, detectedDrawer, clearAutoSaveTimer]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Tab' && !e.shiftKey && content.trim() && detectedDrawer) {
      e.preventDefault();
      setShowTitleField(true);
      if (shouldAutoPrefix(detectedDrawer) && !title) {
        setTitle(generateDatePrefix(detectedDrawer));
      }
      setTimeout(() => titleInputRef.current?.focus(), 0);
    }
  }, [handleSubmit, content, detectedDrawer, title]);

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setShowTitleField(false);
      textareaRef.current?.focus();
    }
  }, [handleSubmit]);

  const handlePaste = useCallback(() => {
    setShowPasteFeedback(true);
    setTimeout(() => setShowPasteFeedback(false), 800);
  }, []);

  const activeDrawer = selectedDrawer || detectedDrawer;
  const activeDrawerMeta = activeDrawer
    ? DRAWER_META.find(d => d.type === activeDrawer)
    : null;
  const activeDrawerColors = activeDrawer ? DRAWER_COLORS[activeDrawer] : null;

  const inputConfig = activeDrawer 
    ? getDrawerInputConfig(activeDrawer as I18nDrawerType)
    : null;

  const handleDrawerSelect = (drawer: DrawerType) => {
    setSelectedDrawer(drawer);
    setShowDrawerSelect(false);
    if (shouldAutoPrefix(drawer) && !title) {
      setTitle(generateDatePrefix(drawer));
    }
  };

  const showKeyboardHints = content.trim().length > 0;
  const hintsId = 'quickinput-hints';

  // Auto-save progress percentage (for progress bar)
  const autoSaveProgress = autoSaveCountdown !== null
    ? ((AUTO_SAVE_DELAY - autoSaveCountdown) / AUTO_SAVE_DELAY) * 100
    : 0;

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/80 p-4 relative overflow-hidden hover:shadow-md transition-shadow duration-300">
      {/* Auto-save progress bar */}
      {autoSaveCountdown !== null && !isAutoSavePaused && !showTitleField && (
        <div
          data-testid="auto-save-progress"
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-400 to-indigo-600 transition-all duration-1000 ease-linear"
          style={{ width: `${autoSaveProgress}%` }}
          aria-hidden="true"
        />
      )}

      {/* Saved feedback overlay */}
      {showSavedFeedback && (
        <div
          data-testid="saved-feedback"
          className="absolute inset-0 rounded-xl bg-emerald-500/10 pointer-events-none flex items-center justify-center z-20 animate-fade-in"
          aria-hidden="true"
        >
          <span className="text-emerald-600 font-medium flex items-center gap-2">
            <Check className="w-5 h-5" />
            {i18n.quickInput.saved}
          </span>
        </div>
      )}

      {showPasteFeedback && (
        <div
          data-testid="paste-feedback"
          className="absolute inset-0 rounded-xl bg-indigo-500/10 pointer-events-none animate-pulse z-10"
          aria-hidden="true"
        />
      )}

      <div
        data-testid="aria-live-region"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {ariaAnnouncement}
      </div>

      <div className="relative">
        {classificationState === 'detecting' && content.trim() && (
          <div
            data-testid="thinking-pulse"
            className="absolute -inset-1 rounded-xl animate-pulse bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 opacity-60"
            aria-hidden="true"
          />
        )}
        
        <div className="relative flex items-start gap-3">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={i18n.quickInput.placeholder}
            rows={1}
            data-quick-input
            aria-label={i18n.quickInput.placeholder}
            aria-describedby={showKeyboardHints ? hintsId : undefined}
            className="flex-1 resize-none bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none text-base leading-relaxed min-h-[48px] py-3"
            disabled={isSubmitting}
          />
          
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            aria-label={i18n.common.save}
            className={`flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200 ${
              content.trim() 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md active:scale-95' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Check className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        {showKeyboardHints && (
          <div 
            id={hintsId}
            className="flex items-center gap-3 mt-2 text-xs text-slate-400"
          >
            {classificationState === 'detecting' && (
              <div
                data-testid="classification-detecting"
                data-testid-indicator="classification-indicator"
                className="flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Detecting...</span>
              </div>
            )}
            
            {classificationState === 'detected' && activeDrawer && activeDrawerMeta && (
              <div
                data-testid="classification-detected"
                data-testid-indicator="confidence-indicator"
                className="flex items-center gap-1.5"
              >
                <div
                  data-testid="confidence-indicator"
                  className={`w-2 h-2 rounded-full ${activeDrawerColors?.accent || 'bg-indigo-500'}`}
                />
                <span className={activeDrawerColors?.text || 'text-slate-600'}>
                  {activeDrawerMeta.icon} {getDrawerLabel(activeDrawer)}
                </span>
              </div>
            )}

            {/* Auto-save countdown indicator */}
            {autoSaveCountdown !== null && !showTitleField && (
              <div
                data-testid="auto-save-indicator"
                className="flex items-center gap-1.5 text-indigo-500"
              >
                {isAutoSavePaused ? (
                  <span className="text-amber-500">{i18n.quickInput.autoSavePaused}</span>
                ) : (
                  <span>{i18n.quickInput.autoSaveIn.replace('{seconds}', String(autoSaveCountdown))}</span>
                )}
              </div>
            )}

            <div className="flex-1" />

            {activeDrawer && !showTitleField && (
              <kbd
                data-testid="tab-hint"
                className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono text-[10px]"
              >
                Tab
              </kbd>
            )}
            
            <kbd
              data-testid="enter-hint"
              className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono text-[10px]"
            >
              Enter
            </kbd>
          </div>
        )}
      </div>

      {activeDrawer && activeDrawerMeta && (
        <div className="mt-3 pt-3 border-t border-slate-100 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="relative inline-flex items-center gap-1.5 text-sm text-slate-500" ref={drawerSelectRef}>
              <button
                onClick={() => setShowDrawerSelect(!showDrawerSelect)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                  activeDrawerColors
                    ? `${activeDrawerColors.bg} ${activeDrawerColors.text} ${activeDrawerColors.bgHover}`
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{activeDrawerMeta.icon}</span>
                <span>{getDrawerLabel(activeDrawerMeta.type)}</span>
                {selectedDrawer && selectedDrawer !== detectedDrawer && (
                  <span className="text-xs text-indigo-500">✎</span>
                )}
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              
              {showDrawerSelect && (
                <div className="absolute left-0 top-full mt-1 z-50 bg-white rounded-lg shadow-lg border border-slate-200 py-1 min-w-[160px] max-h-[300px] overflow-y-auto">
                  {DRAWER_META.map(drawer => {
                    const colors = DRAWER_COLORS[drawer.type];
                    const isSelected = activeDrawer === drawer.type;
                    return (
                      <button
                        key={drawer.type}
                        onClick={() => handleDrawerSelect(drawer.type)}
                        className={`w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors ${
                          isSelected ? `${colors.bg} ${colors.text}` : 'text-slate-700'
                        }`}
                      >
                        <span>{drawer.icon}</span>
                        <span className="flex-1">{getDrawerLabel(drawer.type)}</span>
                        {isSelected && <Check className={`w-4 h-4 ${colors.text}`} />}
                        {detectedDrawer === drawer.type && drawer.type !== activeDrawer && (
                          <span className="text-xs text-slate-400">auto</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              
              <span>{i18n.quickInput.willSaveTo}</span>
            </div>
            
            {!showTitleField && (
              <button
                onClick={() => {
                  setShowTitleField(true);
                  if (shouldAutoPrefix(activeDrawer) && !title) {
                    setTitle(generateDatePrefix(activeDrawer));
                  }
                  setTimeout(() => titleInputRef.current?.focus(), 0);
                }}
                className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span>{i18n.quickInput.addTitle}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          </div>

          {showTitleField && inputConfig && (
            <div className="mt-3 animate-fade-in space-y-3">
              <div>
                <label htmlFor="title-input" className="block text-xs text-slate-500 mb-1">{i18n.quickInput.titleLabel}</label>
                <input
                  id="title-input"
                  ref={titleInputRef}
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  onKeyDown={handleTitleKeyDown}
                  placeholder={inputConfig.placeholder}
                  aria-label={i18n.quickInput.titleLabel}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              {activeDrawer === 'watch' && (
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Genre {autoDetectedGenre && <span className="text-green-600">(auto)</span>}
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={genre}
                      onChange={e => setGenre(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Select genre...</option>
                      {getAvailableGenres().map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    {genre && (
                      <button
                        onClick={() => setGenre('')}
                        className="px-2 text-slate-400 hover:text-slate-600"
                        type="button"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              )}

              {activeDrawer === 'places' && detectedPlace && (
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm">
                  <span>{getMapSourceEmoji(detectedPlace.source)}</span>
                  <span className="text-emerald-700">
                    {detectedPlace.name 
                      ? detectedPlace.name 
                      : detectedPlace.coordinates 
                        ? formatPlaceTitle(detectedPlace)
                        : i18n.quickInput.mapLinkDetected}
                  </span>
                  {detectedPlace.name && (
                    <span className="text-emerald-600 text-xs">(auto)</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
