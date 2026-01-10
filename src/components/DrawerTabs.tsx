import { useRef, useEffect, useMemo, useState, useCallback, type KeyboardEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStashStore } from '../store/useStashStore';
import { DRAWER_META, type DrawerType } from '../types';
import { t, getDrawerLabel } from '../i18n';
import { DRAWER_COLORS } from '../constants/drawerColors';

interface ScrollState {
  canScrollLeft: boolean;
  canScrollRight: boolean;
}

export function DrawerTabs() {
  const activeDrawer = useStashStore(state => state.activeDrawer);
  const setActiveDrawer = useStashStore(state => state.setActiveDrawer);
  const items = useStashStore(state => state.items);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState<ScrollState>({ canScrollLeft: false, canScrollRight: true });
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const i18n = t();

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: items.length };
    for (const item of items) {
      result[item.drawer] = (result[item.drawer] || 0) + 1;
    }
    return result as Record<DrawerType | 'all', number>;
  }, [items]);

  const tabs: Array<{ type: DrawerType | 'all'; icon: string; label: string }> = [
    { type: 'all', icon: '📋', label: i18n.drawers.all },
    ...DRAWER_META.map(d => ({ ...d, label: getDrawerLabel(d.type) })),
  ];

  const updateScrollState = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const canScrollLeft = scrollLeft > 0;
    const canScrollRight = scrollLeft + clientWidth < scrollWidth - 1;

    setScrollState({ canScrollLeft, canScrollRight });
  }, []);

  const scrollBy = useCallback((direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.6;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }, []);

  const updateUnderlinePosition = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const activeTab = container.querySelector('[data-active="true"]') as HTMLElement;
    if (activeTab) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      setUnderlineStyle({
        left: tabRect.left - containerRect.left + container.scrollLeft,
        width: tabRect.width,
      });
    }
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const activeTab = container.querySelector('[data-active="true"]');
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }

    updateUnderlinePosition();
  }, [activeDrawer, updateUnderlinePosition]);

  useEffect(() => {
    updateScrollState();
    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollState);
      window.addEventListener('resize', updateScrollState);
      return () => {
        container.removeEventListener('scroll', updateScrollState);
        window.removeEventListener('resize', updateScrollState);
      };
    }
  }, [updateScrollState]);

  useEffect(() => {
    updateUnderlinePosition();
    window.addEventListener('resize', updateUnderlinePosition);
    return () => window.removeEventListener('resize', updateUnderlinePosition);
  }, [updateUnderlinePosition, activeDrawer]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = tabs.findIndex(tab => tab.type === activeDrawer);
    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowRight':
        newIndex = currentIndex >= tabs.length - 1 ? 0 : currentIndex + 1;
        break;
      case 'ArrowLeft':
        newIndex = currentIndex <= 0 ? tabs.length - 1 : currentIndex - 1;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    setActiveDrawer(tabs[newIndex].type);
  }, [activeDrawer, setActiveDrawer, tabs]);

  const getAccentColor = (type: DrawerType | 'all'): string => {
    if (type === 'all') return 'bg-indigo-500';
    const colors = DRAWER_COLORS[type];
    return colors?.accent || 'bg-indigo-500';
  };

  return (
    <div className="relative flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-sm border border-slate-100" data-gradient-container>
      <button
        data-scroll-left
        onClick={() => scrollBy('left')}
        aria-label="Scroll left"
        className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all duration-200 ${
          scrollState.canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div
        ref={scrollRef}
        data-scroll-container
        role="tablist"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onScroll={updateScrollState}
        className="relative flex-1 flex gap-1.5 overflow-x-auto hide-scrollbar py-0.5 px-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-xl"
      >
        {tabs.map(tab => {
          const isActive = activeDrawer === tab.type;
          const count = counts[tab.type] || 0;
          const isEmpty = count === 0 && tab.type !== 'all';
          const shouldDim = isEmpty && !isActive;

          const colors = tab.type !== 'all' ? DRAWER_COLORS[tab.type] : null;
          const activeClasses = colors
            ? `${colors.bg} ${colors.text} shadow-sm`
            : 'bg-indigo-100 text-indigo-700 shadow-sm';
          const inactiveClasses = colors
            ? `bg-transparent text-slate-500 ${colors.bgHover} hover:text-slate-700`
            : 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700';
          const badgeActiveClasses = colors
            ? `${colors.accent} text-white`
            : 'bg-indigo-500 text-white';

          return (
            <button
              key={tab.type}
              role="tab"
              aria-selected={isActive}
              data-active={isActive}
              data-drawer={tab.type}
              data-empty={isEmpty}
              onClick={() => setActiveDrawer(tab.type)}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive ? activeClasses : inactiveClasses
              } ${shouldDim ? 'opacity-40' : ''}`}
            >
              <span className="text-base leading-none">{tab.icon}</span>
              <span className="whitespace-nowrap">{tab.label}</span>
              {count > 0 && (
                <span
                  data-count-badge
                  data-animate="true"
                  className={`ml-0.5 min-w-[20px] px-1.5 py-0.5 text-[11px] font-semibold rounded-full text-center transition-all duration-200 ${
                    isActive ? badgeActiveClasses : 'bg-slate-200/80 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}

        <div
          data-underline-indicator
          data-color={activeDrawer === 'all' ? 'indigo' : activeDrawer}
          className={`absolute bottom-0 h-0.5 rounded-full transition-all duration-300 ease-out ${getAccentColor(activeDrawer)}`}
          style={{
            transform: `translateX(${underlineStyle.left}px)`,
            width: underlineStyle.width,
          }}
        />
      </div>

      <button
        data-scroll-right
        onClick={() => scrollBy('right')}
        aria-label="Scroll right"
        className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all duration-200 ${
          scrollState.canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
