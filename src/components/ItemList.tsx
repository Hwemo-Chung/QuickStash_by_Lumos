import { useMemo, useState, useCallback } from 'react';
import { useStashStore } from '../store/useStashStore';
import { ItemCard } from './ItemCard';
import { ItemDetailModal } from './ItemDetailModal';
import { Inbox, Search, Grid3X3, List } from 'lucide-react';
import { search } from '../lib/search';
import { t } from '../i18n';
import { DRAWER_META, type DrawerType, type StashItem } from '../types';

const STAGGER_DELAY_MS = 50;
const MAX_STAGGER_DELAY_MS = 500;

function SkeletonCard({ index }: { index: number }) {
  return (
    <div
      data-testid="skeleton-card"
      className="animate-shimmer relative bg-white rounded-xl border border-slate-200 p-4 overflow-hidden"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
      <div className="flex items-center gap-2 mb-3">
        <div data-testid="shimmer-line" className="w-6 h-6 bg-slate-200 rounded" />
        <div data-testid="shimmer-line" className="w-16 h-3 bg-slate-200 rounded" />
      </div>
      <div className="space-y-2">
        <div data-testid="shimmer-line" className="w-full h-3 bg-slate-200 rounded" />
        <div data-testid="shimmer-line" className="w-3/4 h-3 bg-slate-200 rounded" />
        <div data-testid="shimmer-line" className="w-1/2 h-3 bg-slate-200 rounded" />
      </div>
    </div>
  );
}

function getDrawerEmptyState(drawer: DrawerType | 'all', i18n: ReturnType<typeof t>) {
  if (drawer === 'all') {
    return { title: i18n.itemList.noItems, hint: i18n.itemList.noItemsHint };
  }
  return i18n.itemList.emptyStates[drawer];
}

function getDrawerIcon(drawer: DrawerType | 'all'): string {
  if (drawer === 'all') return '';
  const meta = DRAWER_META.find(d => d.type === drawer);
  return meta?.icon || '';
}

interface ViewToggleProps {
  viewMode: 'grid' | 'list';
  onViewChange: (mode: 'grid' | 'list') => void;
  i18n: ReturnType<typeof t>;
}

function ViewToggle({ viewMode, onViewChange, i18n }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
      <button
        data-testid="view-toggle-grid"
        onClick={() => onViewChange('grid')}
        className={`p-1.5 rounded-md transition-colors ${
          viewMode === 'grid' 
            ? 'active bg-white text-slate-900 shadow-sm' 
            : 'text-slate-500 hover:text-slate-700'
        }`}
        title={i18n.itemList.gridView}
        aria-label={i18n.itemList.gridView}
      >
        <Grid3X3 className="w-4 h-4" />
      </button>
      <button
        data-testid="view-toggle-list"
        onClick={() => onViewChange('list')}
        className={`p-1.5 rounded-md transition-colors ${
          viewMode === 'list' 
            ? 'active bg-white text-slate-900 shadow-sm' 
            : 'text-slate-500 hover:text-slate-700'
        }`}
        title={i18n.itemList.listView}
        aria-label={i18n.itemList.listView}
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ItemList() {
  const isLoading = useStashStore(state => state.isLoading);
  const allItems = useStashStore(state => state.items);
  const activeDrawer = useStashStore(state => state.activeDrawer);
  const searchQuery = useStashStore(state => state.searchQuery);
  const viewMode = useStashStore(state => state.viewMode);
  const setViewMode = useStashStore(state => state.setViewMode);
  const [selectedItem, setSelectedItem] = useState<StashItem | null>(null);
  const i18n = t();

  const handleShowDetail = useCallback((item: StashItem) => {
    setSelectedItem(item);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const items = useMemo(() => {
    let filtered = allItems;
    
    if (activeDrawer !== 'all') {
      filtered = filtered.filter(item => item.drawer === activeDrawer);
    }

    if (searchQuery.trim()) {
      const results = search(searchQuery, filtered);
      return results.map(r => r.item);
    }

    return filtered;
  }, [allItems, activeDrawer, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;
  const hasNoResults = isSearching && items.length === 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} index={i} />
        ))}
      </div>
    );
  }

  if (hasNoResults) {
    return (
      <div 
        data-testid="search-no-results"
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-amber-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-700 mb-1">
          {i18n.itemList.searchNoResults}
        </h3>
        <p className="text-slate-500 mb-6">
          {i18n.itemList.searchNoResultsQuery.replace('{query}', searchQuery)}
        </p>
        <div 
          data-testid="search-suggestions"
          className="text-sm text-slate-400 space-y-1"
        >
          <p>{i18n.itemList.searchSuggestionSpelling}</p>
          <p>{i18n.itemList.searchSuggestionKeywords}</p>
          <p>{i18n.itemList.searchSuggestionBrowse}</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    const emptyState = getDrawerEmptyState(activeDrawer, i18n);
    const drawerIcon = getDrawerIcon(activeDrawer);
    
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div 
          data-testid="empty-state-icon"
          className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4"
        >
          {drawerIcon ? (
            <span className="text-3xl">{drawerIcon}</span>
          ) : (
            <Inbox className="w-8 h-8 text-slate-400" />
          )}
        </div>
        <h3 className="text-lg font-medium text-slate-700 mb-1">{emptyState.title}</h3>
        <p className="text-slate-500">{emptyState.hint}</p>
      </div>
    );
  }

  const containerClasses = viewMode === 'grid'
    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
    : 'flex flex-col gap-3';

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ViewToggle viewMode={viewMode} onViewChange={setViewMode} i18n={i18n} />
      </div>
      <div 
        data-view-mode={viewMode}
        className={containerClasses}
      >
        {items.map((item, index) => {
          const delay = Math.min(index * STAGGER_DELAY_MS, MAX_STAGGER_DELAY_MS);
          return (
            <div
              key={item.id}
              data-animation-index={index}
              className="animate-stagger-in opacity-0"
              style={{ animationDelay: `${delay}ms` }}
            >
              <ItemCard item={item} onShowDetail={handleShowDetail} />
            </div>
          );
        })}
      </div>

      <ItemDetailModal
        item={selectedItem}
        isOpen={selectedItem !== null}
        onClose={handleCloseDetail}
      />
    </div>
  );
}
