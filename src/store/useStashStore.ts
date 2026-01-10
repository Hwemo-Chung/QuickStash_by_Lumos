import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import { classify } from '../lib/classifier';
import { extractTags } from '../lib/tags';
import { fetchMetadata, getYouTubeThumbnail } from '../lib/metadata';
import { extractGenreFromUrl } from '../lib/genreExtractor';
import { search, searchWithFilters, type SearchResult, type SortOption, type DateRange } from '../lib/search';
import type { StashItem, DrawerType } from '../types';

interface StashState {
  items: StashItem[];
  activeDrawer: DrawerType | 'all';
  searchQuery: string;
  searchSortOption: SortOption;
  searchDateFilter: DateRange;
  isLoading: boolean;
  highlightedItemId: string | null;
  viewMode: 'grid' | 'list';
}

interface AddItemResult {
  item: StashItem;
  isDuplicate: boolean;
}

interface StashActions {
  loadItems: () => Promise<void>;
  addItem: (content: string, title?: string, genre?: string, drawer?: DrawerType) => Promise<AddItemResult>;
  findDuplicate: (content: string) => StashItem | null;
  updateItem: (id: string, updates: Partial<StashItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  moveItem: (id: string, targetDrawer: DrawerType) => Promise<void>;
  setActiveDrawer: (drawer: DrawerType | 'all') => void;
  setSearchQuery: (query: string) => void;
  setSearchSortOption: (option: SortOption) => void;
  setSearchDateFilter: (filter: DateRange) => void;
  setHighlightedItem: (id: string | null) => void;
  getFilteredItems: () => StashItem[];
  searchItems: () => SearchResult[];
  getDrawerCounts: () => Record<DrawerType | 'all', number>;
  setViewMode: (mode: 'grid' | 'list') => void;
}

type StashStore = StashState & StashActions;

function extractUniqueIdentifier(content: string): string | null {
  const trimmed = content.trim();

  // URL check
  const urlMatch = trimmed.match(/^(https?:\/\/[^\s]+)/);
  if (urlMatch) {
    return urlMatch[1].replace(/\/$/, '').toLowerCase();
  }

  // Email check
  const emailMatch = trimmed.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  if (emailMatch) {
    return trimmed.toLowerCase();
  }

  return null;
}

export const useStashStore = create<StashStore>((set, get) => ({
  items: [],
  activeDrawer: 'all',
  searchQuery: '',
  searchSortOption: 'newest',
  searchDateFilter: 'all',
  isLoading: true,
  highlightedItemId: null,
  viewMode: 'grid',

  loadItems: async () => {
    set({ isLoading: true });
    const items = await db.items.orderBy('createdAt').reverse().toArray();
    set({ items, isLoading: false });
  },

  findDuplicate: (content: string) => {
    const { items } = get();
    const identifier = extractUniqueIdentifier(content);

    if (identifier) {
      return items.find(item => {
        const itemIdentifier = extractUniqueIdentifier(item.content);
        return itemIdentifier === identifier;
      }) || null;
    }

    return null;
  },

  addItem: async (content: string, title?: string, genre?: string, drawerOverride?: DrawerType) => {
    const duplicate = get().findDuplicate(content);
    if (duplicate) {
      set({ activeDrawer: duplicate.drawer, highlightedItemId: duplicate.id });
      setTimeout(() => set({ highlightedItemId: null }), 3000);
      return { item: duplicate, isDuplicate: true };
    }

    const drawer = drawerOverride || classify(content);
    const tags = extractTags(content);
    const now = Date.now();

    const autoGenre = genre || extractGenreFromUrl(content);

    // Get YouTube thumbnail immediately (no CORS issues)
    const youtubeThumbnail = getYouTubeThumbnail(content);

    const item: StashItem = {
      id: uuidv4(),
      content,
      drawer,
      tags,
      createdAt: now,
      updatedAt: now,
      accessCount: 0,
      title,
      genre: autoGenre || undefined,
      thumbnail: youtubeThumbnail || undefined,
    };

    await db.items.add(item);
    set(state => ({ items: [item, ...state.items] }));

    // Fetch additional metadata in background for URLs
    fetchMetadata(content).then(async (metadata) => {
      if (metadata) {
        const updates: Partial<StashItem> = {};
        if (metadata.title && !title) updates.title = metadata.title;
        if (metadata.thumbnail && !youtubeThumbnail) updates.thumbnail = metadata.thumbnail;
        if (metadata.description) updates.description = metadata.description;

        if (Object.keys(updates).length > 0) {
          await db.items.update(item.id, { ...updates, updatedAt: Date.now() });
          set(state => ({
            items: state.items.map(i =>
              i.id === item.id ? { ...i, ...updates, updatedAt: Date.now() } : i
            ),
          }));
        }
      }
    });

    return { item, isDuplicate: false };
  },

  updateItem: async (id: string, updates: Partial<StashItem>) => {
    await db.items.update(id, { ...updates, updatedAt: Date.now() });
    set(state => ({
      items: state.items.map(item =>
        item.id === id ? { ...item, ...updates, updatedAt: Date.now() } : item
      ),
    }));
  },

  deleteItem: async (id: string) => {
    await db.items.delete(id);
    set(state => ({ items: state.items.filter(item => item.id !== id) }));
  },

  moveItem: async (id: string, targetDrawer: DrawerType) => {
    await db.items.update(id, { drawer: targetDrawer, updatedAt: Date.now() });
    set(state => ({
      items: state.items.map(item =>
        item.id === id ? { ...item, drawer: targetDrawer, updatedAt: Date.now() } : item
      ),
    }));
  },

  setActiveDrawer: (drawer) => set({ activeDrawer: drawer }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSearchSortOption: (option) => set({ searchSortOption: option }),

  setSearchDateFilter: (filter) => set({ searchDateFilter: filter }),

  setHighlightedItem: (id) => set({ highlightedItemId: id }),

  getFilteredItems: () => {
    const { items, activeDrawer, searchQuery, searchSortOption, searchDateFilter } = get();
    
    let filtered = items;
    
    if (activeDrawer !== 'all') {
      filtered = filtered.filter(item => item.drawer === activeDrawer);
    }

    if (searchQuery.trim()) {
      const results = searchWithFilters(
        searchQuery, 
        filtered, 
        { dateRange: searchDateFilter },
        searchSortOption
      );
      return results.map(r => r.item);
    }

    return filtered;
  },

  searchItems: () => {
    const { items, searchQuery } = get();
    if (!searchQuery.trim()) return [];
    return search(searchQuery, items);
  },

  getDrawerCounts: () => {
    const { items } = get();
    const counts: Record<string, number> = { all: items.length };
    
    for (const item of items) {
      counts[item.drawer] = (counts[item.drawer] || 0) + 1;
    }

    return counts as Record<DrawerType | 'all', number>;
  },

  setViewMode: (mode) => set({ viewMode: mode }),
}));
