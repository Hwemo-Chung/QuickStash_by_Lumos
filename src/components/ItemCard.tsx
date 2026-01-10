import { useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { Copy, Trash2, MoreHorizontal, Check, ArrowRight, FolderInput } from 'lucide-react';
import { DRAWER_META, type StashItem, type DrawerType } from '../types';
import { useStashStore } from '../store/useStashStore';
import { t, getDrawerLabel } from '../i18n';
import { DRAWER_COLORS } from '../constants/drawerColors';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import type { SearchHighlights, HighlightPosition } from '../lib/search';

interface ItemCardProps {
  item: StashItem;
  onShowDetail?: (item: StashItem) => void;
  searchHighlights?: SearchHighlights;
}

function getRelativeTime(timestamp: number): string {
  const i18n = t();
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return i18n.itemCard.justNow;
  if (minutes < 60) return `${minutes}${i18n.itemCard.minutesAgo}`;
  if (hours < 24) return `${hours}${i18n.itemCard.hoursAgo}`;
  if (days === 1) return i18n.itemCard.yesterday;
  if (days < 7) return `${days}${i18n.itemCard.daysAgo}`;

  return new Date(timestamp).toLocaleDateString();
}

function getFullDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const touchQuery = window.matchMedia('(pointer: coarse)');
      const widthQuery = window.matchMedia('(max-width: 768px)');
      setIsMobile(touchQuery.matches || widthQuery.matches);
    };

    checkMobile();
    const touchQuery = window.matchMedia('(pointer: coarse)');
    const widthQuery = window.matchMedia('(max-width: 768px)');

    touchQuery.addEventListener('change', checkMobile);
    widthQuery.addEventListener('change', checkMobile);

    return () => {
      touchQuery.removeEventListener('change', checkMobile);
      widthQuery.removeEventListener('change', checkMobile);
    };
  }, []);

  return isMobile;
}

const DRAWER_GLOW_COLORS: Record<DrawerType, string> = {
  contacts: 'hover:shadow-sky-200/50',
  money: 'hover:shadow-emerald-200/50',
  watch: 'hover:shadow-rose-200/50',
  read: 'hover:shadow-amber-200/50',
  dev: 'hover:shadow-violet-200/50',
  schedule: 'hover:shadow-blue-200/50',
  recipes: 'hover:shadow-orange-200/50',
  places: 'hover:shadow-teal-200/50',
  ideas: 'hover:shadow-yellow-200/50',
  notes: 'hover:shadow-slate-200/50',
  shopping: 'hover:shadow-pink-200/50',
  inbox: 'hover:shadow-gray-200/50',
};

function renderHighlightedText(text: string, highlights: HighlightPosition[]): ReactNode {
  if (highlights.length === 0) {
    return text;
  }

  const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);
  const parts: ReactNode[] = [];
  let lastEnd = 0;

  for (let i = 0; i < sortedHighlights.length; i++) {
    const { start, end } = sortedHighlights[i];
    
    if (start > lastEnd) {
      parts.push(text.slice(lastEnd, start));
    }
    
    parts.push(
      <mark
        key={`highlight-${i}`}
        data-testid="search-highlight"
        className="bg-yellow-200 text-yellow-900 rounded-sm px-0.5"
      >
        {text.slice(start, end)}
      </mark>
    );
    
    lastEnd = end;
  }

  if (lastEnd < text.length) {
    parts.push(text.slice(lastEnd));
  }

  return parts;
}

export function ItemCard({ item, onShowDetail, searchHighlights }: ItemCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showQuickMoveMenu, setShowQuickMoveMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const quickMoveRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);
  const deleteItem = useStashStore(state => state.deleteItem);
  const moveItem = useStashStore(state => state.moveItem);
  const highlightedItemId = useStashStore(state => state.highlightedItemId);
  const i18n = t();
  const isMobile = useIsMobile();

  const isHighlighted = highlightedItemId === item.id;

  const drawerMeta = DRAWER_META.find(d => d.type === item.drawer);

  const displayTitle = item.title || (item.content.length > 150
    ? item.content.slice(0, 150) + '...'
    : item.content);

  const showContent = item.title && item.content !== item.title;
  const contentPreview = showContent && item.content.length > 100
    ? item.content.slice(0, 100) + '...'
    : item.content;

  const titleHighlights = searchHighlights?.title || [];
  const contentHighlights = searchHighlights?.content || [];

  const renderedTitle = item.title && titleHighlights.length > 0
    ? renderHighlightedText(displayTitle, titleHighlights)
    : (!item.title && contentHighlights.length > 0
      ? renderHighlightedText(displayTitle, contentHighlights.filter(h => h.end <= displayTitle.length))
      : displayTitle);

  const renderedContent = showContent && contentHighlights.length > 0
    ? renderHighlightedText(contentPreview, contentHighlights.filter(h => h.end <= contentPreview.length))
    : contentPreview;

  // Swipe gesture handlers
  const handleSwipeLeft = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleSwipeRight = useCallback(() => {
    setShowQuickMoveMenu(true);
  }, []);

  const { ref: swipeRef } = useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 60,
    enabled: isMobile,
  });

  // Combine refs
  useEffect(() => {
    if (swipeRef.current && cardRef.current) {
      // The swipe ref is the outer container
    }
  }, [swipeRef]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
        setShowMoveMenu(false);
      }
      if (quickMoveRef.current && !quickMoveRef.current.contains(e.target as Node)) {
        setShowQuickMoveMenu(false);
      }
    }

    if (showMenu || showMoveMenu || showQuickMoveMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu, showMoveMenu, showQuickMoveMenu]);

  useEffect(() => {
    if (isHighlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isHighlighted]);

  // Auto-dismiss delete confirm after 3 seconds
  useEffect(() => {
    if (showDeleteConfirm) {
      const timer = setTimeout(() => setShowDeleteConfirm(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showDeleteConfirm]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(item.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    setShowMenu(false);
  }, [item.content]);

  const handleDelete = useCallback(() => {
    deleteItem(item.id);
    setShowMenu(false);
    setShowDeleteConfirm(false);
  }, [item.id, deleteItem]);

  const handleMove = useCallback((targetDrawer: DrawerType) => {
    moveItem(item.id, targetDrawer);
    setShowMoveMenu(false);
    setShowMenu(false);
    setShowQuickMoveMenu(false);
  }, [item.id, moveItem]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target === cardRef.current) {
      e.preventDefault();
      handleCopy();
    }
  }, [handleCopy]);

  const handleContentClick = useCallback(() => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap/click - show detail
      onShowDetail?.(item);
      lastTapRef.current = 0;
    } else {
      // Single tap - copy
      lastTapRef.current = now;
      setTimeout(() => {
        if (lastTapRef.current !== 0 && Date.now() - lastTapRef.current >= DOUBLE_TAP_DELAY) {
          handleCopy();
          lastTapRef.current = 0;
        }
      }, DOUBLE_TAP_DELAY);
    }
  }, [item, onShowDetail, handleCopy]);

  const drawerColors = DRAWER_COLORS[item.drawer];
  const glowColor = DRAWER_GLOW_COLORS[item.drawer];

  return (
    <div ref={swipeRef as React.RefObject<HTMLDivElement>} className="relative">
      {/* Delete confirmation overlay (triggered by swipe left) */}
      {showDeleteConfirm && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-red-500/95 rounded-xl animate-fade-in"
          data-testid="delete-confirm"
        >
          <div className="flex flex-col items-center gap-3">
            <p className="text-white font-medium">{i18n.itemCard.confirmDelete}</p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-white text-red-600 rounded-lg font-medium min-h-[44px] min-w-[80px] hover:bg-red-50 transition-colors"
              >
                {i18n.itemCard.delete}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium min-h-[44px] min-w-[80px] border border-red-400 hover:bg-red-700 transition-colors"
              >
                {i18n.common.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Move menu (triggered by swipe right) */}
      {showQuickMoveMenu && (
        <div
          ref={quickMoveRef}
          className="absolute inset-0 z-30 bg-indigo-500/95 rounded-xl animate-fade-in overflow-hidden"
          data-testid="quick-move-menu"
        >
          <div className="p-3">
            <p className="text-white font-medium text-sm mb-2">{i18n.itemCard.moveTo}</p>
            <div className="grid grid-cols-3 gap-1.5 max-h-[200px] overflow-y-auto">
              {DRAWER_META.filter(d => d.type !== item.drawer).map(drawer => (
                <button
                  key={drawer.type}
                  onClick={() => handleMove(drawer.type)}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors min-h-[56px]"
                >
                  <span className="text-xl">{drawer.icon}</span>
                  <span className="text-xs text-white/90 truncate w-full text-center">
                    {getDrawerLabel(drawer.type)}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowQuickMoveMenu(false)}
            className="absolute top-2 right-2 p-2 text-white/80 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            ✕
          </button>
        </div>
      )}

      <div
        ref={cardRef}
        data-testid="item-card"
        tabIndex={0}
        role="article"
        aria-label={`${displayTitle} - ${getDrawerLabel(item.drawer)}`}
        onKeyDown={handleKeyDown}
        className={`group relative bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border overflow-hidden hover:shadow-xl hover:-translate-y-1 ${glowColor} transition-all duration-300 animate-slide-up focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 ${
          isHighlighted
            ? 'ring-2 ring-indigo-500 border-indigo-300 shadow-lg'
            : 'border-slate-200'
        }`}
      >
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${drawerColors.accent}`} />
        {item.thumbnail && (
          <div className="aspect-video bg-slate-100 overflow-hidden">
            <img
              src={item.thumbnail}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              {drawerMeta && (
                <span className="text-lg flex-shrink-0" title={getDrawerLabel(drawerMeta.type)}>
                  {drawerMeta.icon}
                </span>
              )}
              <span
                className="text-xs text-slate-400 truncate cursor-help"
                data-testid="time-display"
                title={getFullDateTime(item.createdAt)}
              >
                {getRelativeTime(item.createdAt)}
              </span>
            </div>

            {/* Desktop menu button - hidden on mobile when quick actions shown */}
            {!isMobile && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="More actions"
                  aria-expanded={showMenu}
                  aria-haspopup="true"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {showMenu && (
                  <div
                    className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10 animate-fade-in"
                    role="menu"
                  >
                    <button
                      onClick={handleCopy}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 min-h-[44px]"
                      role="menuitem"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      {copied ? i18n.itemCard.copied : i18n.itemCard.copy}
                    </button>
                    <button
                      onClick={() => setShowMoveMenu(!showMoveMenu)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 min-h-[44px]"
                      role="menuitem"
                      aria-haspopup="true"
                    >
                      <ArrowRight className="w-4 h-4" />
                      {i18n.itemCard.moveTo}
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 min-h-[44px]"
                      role="menuitem"
                    >
                      <Trash2 className="w-4 h-4" />
                      {i18n.itemCard.delete}
                    </button>
                  </div>
                )}

                {showMoveMenu && (
                  <div
                    className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20 animate-fade-in max-h-64 overflow-y-auto scrollbar-thin"
                    role="menu"
                  >
                    {DRAWER_META.filter(d => d.type !== item.drawer).map(drawer => (
                      <button
                        key={drawer.type}
                        onClick={() => handleMove(drawer.type)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 min-h-[44px]"
                        role="menuitem"
                      >
                        <span>{drawer.icon}</span>
                        <span>{getDrawerLabel(drawer.type)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleContentClick}
            className="text-left w-full group/copy"
            aria-label={`View or copy ${displayTitle}`}
          >
            <p className="text-sm font-medium text-slate-900 leading-snug mb-1 group-hover/copy:text-indigo-600 transition-colors">
              {renderedTitle}
            </p>
            {showContent && (
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                {renderedContent}
              </p>
            )}
          </button>

          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {item.tags.slice(0, 4).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs bg-slate-100 text-slate-500 rounded-full cursor-pointer hover:bg-slate-200 hover:text-slate-700 transition-colors"
                >
                  {tag}
                </span>
              ))}
              {item.tags.length > 4 && (
                <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-400 rounded-full">
                  +{item.tags.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Quick Actions Bar - visible on mobile, hover on desktop */}
          {isMobile && (
            <div
              className="flex items-center justify-around mt-3 pt-3 border-t border-slate-100"
              data-testid="quick-actions-bar"
            >
              <button
                onClick={handleCopy}
                className="flex flex-col items-center gap-1 px-4 py-2 text-slate-500 hover:text-indigo-600 transition-colors min-h-[48px] min-w-[64px]"
                aria-label={i18n.itemCard.copy}
              >
                <Copy className="w-5 h-5" />
                <span className="text-xs">{i18n.itemCard.copy}</span>
              </button>
              <button
                onClick={() => setShowQuickMoveMenu(true)}
                className="flex flex-col items-center gap-1 px-4 py-2 text-slate-500 hover:text-indigo-600 transition-colors min-h-[48px] min-w-[64px]"
                aria-label={i18n.itemCard.swipeMove}
              >
                <FolderInput className="w-5 h-5" />
                <span className="text-xs">{i18n.itemCard.swipeMove}</span>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex flex-col items-center gap-1 px-4 py-2 text-slate-500 hover:text-red-600 transition-colors min-h-[48px] min-w-[64px]"
                aria-label={i18n.itemCard.delete}
              >
                <Trash2 className="w-5 h-5" />
                <span className="text-xs">{i18n.itemCard.delete}</span>
              </button>
            </div>
          )}
        </div>

        {copied && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-xl animate-pulse"
            data-testid="copy-feedback"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2 text-green-600 font-medium animate-bounce-in">
              <Check className="w-5 h-5" />
              {i18n.itemCard.copied}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
