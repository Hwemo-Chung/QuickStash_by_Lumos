import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, ArrowUpDown, Calendar, ChevronDown } from 'lucide-react';
import { useStashStore } from '../store/useStashStore';
import { t, getDrawerLabel } from '../i18n';
import type { SortOption, DateRange } from '../lib/search';

export function SearchBar() {
  const [localQuery, setLocalQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const dateDropdownRef = useRef<HTMLDivElement>(null);
  
  const setSearchQuery = useStashStore(state => state.setSearchQuery);
  const getFilteredItems = useStashStore(state => state.getFilteredItems);
  const activeDrawer = useStashStore(state => state.activeDrawer);
  const searchQuery = useStashStore(state => state.searchQuery);
  const searchSortOption = useStashStore(state => state.searchSortOption);
  const searchDateFilter = useStashStore(state => state.searchDateFilter);
  const setSearchSortOption = useStashStore(state => state.setSearchSortOption);
  const setSearchDateFilter = useStashStore(state => state.setSearchDateFilter);
  
  const i18n = t();
  const filteredItems = getFilteredItems();

  useEffect(() => {
    if (localQuery) {
      setIsDebouncing(true);
    }
    
    const timer = setTimeout(() => {
      setSearchQuery(localQuery);
      setIsDebouncing(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [localQuery, setSearchQuery]);

  const handleClear = useCallback(() => {
    setLocalQuery('');
    setSearchQuery('');
  }, [setSearchQuery]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setShowDateDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSortChange = useCallback((option: SortOption) => {
    setSearchSortOption(option);
    setShowSortDropdown(false);
  }, [setSearchSortOption]);

  const handleDateFilterChange = useCallback((filter: DateRange) => {
    setSearchDateFilter(filter);
    setShowDateDropdown(false);
  }, [setSearchDateFilter]);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'relevance', label: i18n.search.sortRelevance },
    { value: 'newest', label: i18n.search.sortNewest },
    { value: 'oldest', label: i18n.search.sortOldest },
    { value: 'mostAccessed', label: i18n.search.sortMostAccessed },
  ];

  const dateOptions: { value: DateRange; label: string }[] = [
    { value: 'all', label: i18n.search.dateAll },
    { value: 'today', label: i18n.search.dateToday },
    { value: 'week', label: i18n.search.dateWeek },
    { value: 'month', label: i18n.search.dateMonth },
  ];

  const currentSortLabel = sortOptions.find(o => o.value === searchSortOption)?.label || '';
  const currentDateLabel = dateOptions.find(o => o.value === searchDateFilter)?.label || '';
  const showFilters = isFocused || localQuery.length > 0;

  const scopeLabel = activeDrawer === 'all' 
    ? i18n.search.scopeAll 
    : getDrawerLabel(activeDrawer);

  const showResultsCount = searchQuery.trim().length > 0;

  return (
    <div className="space-y-2">
      <div 
        className={`relative transition-all duration-200 ${isFocused ? 'search-focused scale-[1.02]' : ''}`}
        data-testid="search-container"
      >
        <Search 
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" 
          data-testid="search-icon"
        />
        
        <input
          type="text"
          value={localQuery}
          onChange={e => setLocalQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={i18n.search.placeholder}
          aria-label={i18n.search.placeholder}
          data-search-input
          className="w-full pl-10 pr-24 py-3 bg-white/95 backdrop-blur-sm rounded-xl border border-slate-200/80 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all shadow-sm hover:shadow-md"
        />

        {isDebouncing && localQuery && (
          <span 
            className="absolute right-16 top-1/2 -translate-y-1/2 w-2 h-2 bg-indigo-400 rounded-full animate-pulse-soft"
            data-testid="debounce-indicator"
          />
        )}

        {showResultsCount && (
          <span 
            className="absolute right-10 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full"
            data-testid="results-count"
            aria-live="polite"
          >
            {filteredItems.length}
          </span>
        )}

        {!isFocused && !localQuery && (
          <span 
            className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-xs font-medium text-slate-400 bg-slate-100 rounded border border-slate-200"
            data-testid="shortcut-hint"
          >
            {i18n.search.shortcutHint}
          </span>
        )}

        {isFocused && !localQuery && (
          <span 
            className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs font-medium text-slate-500 bg-slate-50 rounded"
            data-testid="scope-indicator"
          >
            {scopeLabel}
          </span>
        )}

        {localQuery && (
          <button
            onClick={handleClear}
            data-testid="clear-button"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {showFilters && (
        <div 
          className="flex gap-2 items-center animate-fade-in"
          data-testid="search-filters"
        >
          <div ref={sortDropdownRef} className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              data-testid="sort-dropdown-trigger"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span>{currentSortLabel}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showSortDropdown && (
              <div 
                className="absolute top-full left-0 mt-1 py-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-[140px]"
                data-testid="sort-dropdown-menu"
              >
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    data-testid={`sort-option-${option.value}`}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 transition-colors ${
                      searchSortOption === option.value ? 'text-indigo-600 bg-indigo-50' : 'text-slate-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div ref={dateDropdownRef} className="relative">
            <button
              onClick={() => setShowDateDropdown(!showDateDropdown)}
              data-testid="date-dropdown-trigger"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>{currentDateLabel}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showDateDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showDateDropdown && (
              <div 
                className="absolute top-full left-0 mt-1 py-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-[120px]"
                data-testid="date-dropdown-menu"
              >
                {dateOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleDateFilterChange(option.value)}
                    data-testid={`date-option-${option.value}`}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 transition-colors ${
                      searchDateFilter === option.value ? 'text-indigo-600 bg-indigo-50' : 'text-slate-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
