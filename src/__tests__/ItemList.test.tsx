import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemList } from '../components/ItemList';
import type { StashItem, DrawerType } from '../types';
import type { SortOption, DateRange } from '../lib/search';
import { setLocale } from '../i18n';

vi.mock('../store/useStashStore', () => ({
  useStashStore: vi.fn(),
}));

vi.mock('../lib/search', () => ({
  search: vi.fn((query: string, items: StashItem[]) => {
    const lowerQuery = query.toLowerCase();
    return items
      .filter(item => item.content.toLowerCase().includes(lowerQuery))
      .map(item => ({ item, score: 1, matchType: 'content' as const }));
  }),
}));

vi.mock('../components/ItemCard', () => ({
  ItemCard: ({ item }: { item: StashItem }) => (
    <div data-testid={`item-card-${item.id}`} data-drawer={item.drawer}>
      {item.content}
    </div>
  ),
}));

import { useStashStore } from '../store/useStashStore';

const createItem = (overrides: Partial<StashItem> = {}): StashItem => ({
  id: 'test-id',
  content: 'test content',
  drawer: 'inbox',
  tags: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  accessCount: 0,
  ...overrides,
});

interface MockStoreState {
  isLoading: boolean;
  items: StashItem[];
  activeDrawer: DrawerType | 'all';
  searchQuery: string;
  searchSortOption: SortOption;
  searchDateFilter: DateRange;
  viewMode: 'grid' | 'list';
  setViewMode: ReturnType<typeof vi.fn>;
  highlightedItemId: string | null;
  loadItems: ReturnType<typeof vi.fn>;
  addItem: ReturnType<typeof vi.fn>;
  findDuplicate: ReturnType<typeof vi.fn>;
  updateItem: ReturnType<typeof vi.fn>;
  deleteItem: ReturnType<typeof vi.fn>;
  moveItem: ReturnType<typeof vi.fn>;
  setActiveDrawer: ReturnType<typeof vi.fn>;
  setSearchQuery: ReturnType<typeof vi.fn>;
  setSearchSortOption: ReturnType<typeof vi.fn>;
  setSearchDateFilter: ReturnType<typeof vi.fn>;
  setHighlightedItem: ReturnType<typeof vi.fn>;
  getFilteredItems: ReturnType<typeof vi.fn>;
  searchItems: ReturnType<typeof vi.fn>;
  getDrawerCounts: ReturnType<typeof vi.fn>;
}

const mockStoreState: MockStoreState = {
  isLoading: false,
  items: [],
  activeDrawer: 'all',
  searchQuery: '',
  searchSortOption: 'newest',
  searchDateFilter: 'all',
  viewMode: 'grid',
  setViewMode: vi.fn(),
  highlightedItemId: null,
  loadItems: vi.fn(),
  addItem: vi.fn(),
  findDuplicate: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
  moveItem: vi.fn(),
  setActiveDrawer: vi.fn(),
  setSearchQuery: vi.fn(),
  setSearchSortOption: vi.fn(),
  setSearchDateFilter: vi.fn(),
  setHighlightedItem: vi.fn(),
  getFilteredItems: vi.fn(),
  searchItems: vi.fn(),
  getDrawerCounts: vi.fn(),
};

describe('ItemList', () => {
  beforeEach(() => {
    setLocale('en');
    vi.mocked(useStashStore).mockImplementation(<T,>(selector: (state: MockStoreState) => T): T => {
      return selector(mockStoreState);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockStoreState.isLoading = false;
    mockStoreState.items = [];
    mockStoreState.activeDrawer = 'all';
    mockStoreState.searchQuery = '';
    mockStoreState.searchSortOption = 'newest';
    mockStoreState.searchDateFilter = 'all';
    mockStoreState.viewMode = 'grid';
  });

  describe('Skeleton Loading with Shimmer Effect', () => {
    it('should show skeleton placeholders when loading', () => {
      mockStoreState.isLoading = true;

      render(<ItemList />);

      const skeletons = screen.getAllByTestId('skeleton-card');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should have shimmer animation class on skeleton elements', () => {
      mockStoreState.isLoading = true;

      render(<ItemList />);

      const skeletons = screen.getAllByTestId('skeleton-card');
      skeletons.forEach((skeleton: HTMLElement) => {
        expect(skeleton).toHaveClass('animate-shimmer');
      });
    });

    it('should render multiple skeleton lines for content preview', () => {
      mockStoreState.isLoading = true;

      render(<ItemList />);

      const shimmerLines = screen.getAllByTestId('shimmer-line');
      expect(shimmerLines.length).toBeGreaterThan(0);
    });
  });

  describe('Staggered Entrance Animation', () => {
    it('should apply staggered animation delay to each card', () => {
      const items = [
        createItem({ id: '1', content: 'Item 1' }),
        createItem({ id: '2', content: 'Item 2' }),
        createItem({ id: '3', content: 'Item 3' }),
      ];
      mockStoreState.items = items;

      render(<ItemList />);

      const cards = screen.getAllByTestId(/^item-card-/);
      expect(cards.length).toBe(3);
    });

    it('should calculate correct animation delay based on index (50ms per item)', () => {
      const items = Array.from({ length: 5 }, (_, i) => 
        createItem({ id: String(i), content: `Item ${i}` })
      );
      mockStoreState.items = items;

      const { container } = render(<ItemList />);

      const wrappers = container.querySelectorAll('[data-animation-index]');
      wrappers.forEach((wrapper: Element, index: number) => {
        expect(wrapper).toHaveAttribute('data-animation-index', String(index));
        expect(wrapper).toHaveStyle({ animationDelay: `${index * 50}ms` });
      });
    });

    it('should cap maximum animation delay at 500ms (10 items)', () => {
      const items = Array.from({ length: 15 }, (_, i) =>
        createItem({ id: String(i), content: `Item ${i}` })
      );
      mockStoreState.items = items;

      const { container } = render(<ItemList />);

      const wrappers = container.querySelectorAll('[data-animation-index]');
      const lastWrapper = wrappers[wrappers.length - 1];
      const styleAttr = lastWrapper.getAttribute('style') || '';
      const delay = parseInt(styleAttr.match(/animation-delay:\s*(\d+)ms/)?.[1] || '0');
      expect(delay).toBeLessThanOrEqual(500);
    });
  });

  describe('Context-Aware Empty States', () => {
    it('should show generic empty state for "all" drawer', () => {
      mockStoreState.items = [];
      mockStoreState.activeDrawer = 'all';

      render(<ItemList />);

      expect(screen.getByText(/no items yet/i)).toBeInTheDocument();
      expect(screen.getByText(/paste something/i)).toBeInTheDocument();
    });

    it('should show contacts-specific empty state for contacts drawer', () => {
      mockStoreState.items = [];
      mockStoreState.activeDrawer = 'contacts';

      render(<ItemList />);

      expect(screen.getByTestId('empty-state-icon')).toBeInTheDocument();
      expect(screen.getByText(/no contacts/i)).toBeInTheDocument();
    });

    it('should show money-specific empty state for money drawer', () => {
      mockStoreState.items = [];
      mockStoreState.activeDrawer = 'money';

      render(<ItemList />);

      expect(screen.getByText(/no financial/i)).toBeInTheDocument();
    });

    it('should show watch-specific empty state for watch drawer', () => {
      mockStoreState.items = [];
      mockStoreState.activeDrawer = 'watch';

      render(<ItemList />);

      expect(screen.getByText(/no videos/i)).toBeInTheDocument();
    });

    it('should show read-specific empty state for read drawer', () => {
      mockStoreState.items = [];
      mockStoreState.activeDrawer = 'read';

      render(<ItemList />);

      expect(screen.getByText(/no articles/i)).toBeInTheDocument();
    });

    it('should show dev-specific empty state for dev drawer', () => {
      mockStoreState.items = [];
      mockStoreState.activeDrawer = 'dev';

      render(<ItemList />);

      expect(screen.getByText(/no code/i)).toBeInTheDocument();
    });

    it('should show schedule-specific empty state for schedule drawer', () => {
      mockStoreState.items = [];
      mockStoreState.activeDrawer = 'schedule';

      render(<ItemList />);

      expect(screen.getByText(/no events/i)).toBeInTheDocument();
    });

    it('should show recipes-specific empty state for recipes drawer', () => {
      mockStoreState.items = [];
      mockStoreState.activeDrawer = 'recipes';

      render(<ItemList />);

      expect(screen.getByText(/no recipes/i)).toBeInTheDocument();
    });

    it('should show places-specific empty state for places drawer', () => {
      mockStoreState.items = [];
      mockStoreState.activeDrawer = 'places';

      render(<ItemList />);

      expect(screen.getByText(/no places/i)).toBeInTheDocument();
    });

    it('should show ideas-specific empty state for ideas drawer', () => {
      mockStoreState.items = [];
      mockStoreState.activeDrawer = 'ideas';

      render(<ItemList />);

      expect(screen.getByText(/no ideas/i)).toBeInTheDocument();
    });

    it('should show notes-specific empty state for notes drawer', () => {
      mockStoreState.items = [];
      mockStoreState.activeDrawer = 'notes';

      render(<ItemList />);

      expect(screen.getByText(/no notes/i)).toBeInTheDocument();
    });

    it('should show shopping-specific empty state for shopping drawer', () => {
      mockStoreState.items = [];
      mockStoreState.activeDrawer = 'shopping';

      render(<ItemList />);

      expect(screen.getByText(/no shopping/i)).toBeInTheDocument();
    });

    it('should show inbox-specific empty state for inbox drawer', () => {
      mockStoreState.items = [];
      mockStoreState.activeDrawer = 'inbox';

      render(<ItemList />);

      expect(screen.getByText(/inbox is empty/i)).toBeInTheDocument();
    });

    it('should display drawer-specific icon in empty state', () => {
      mockStoreState.items = [];
      mockStoreState.activeDrawer = 'contacts';

      render(<ItemList />);

      const emptyIcon = screen.getByTestId('empty-state-icon');
      expect(emptyIcon).toBeInTheDocument();
    });
  });

  describe('Search No-Results State', () => {
    it('should show no results message when search yields nothing', () => {
      mockStoreState.items = [createItem({ content: 'apple' })];
      mockStoreState.searchQuery = 'xyz123notfound';

      render(<ItemList />);

      expect(screen.getByTestId('search-no-results')).toBeInTheDocument();
    });

    it('should display the search query in no results message', () => {
      mockStoreState.items = [createItem({ content: 'apple' })];
      mockStoreState.searchQuery = 'banana';

      render(<ItemList />);

      expect(screen.getByText(/banana/)).toBeInTheDocument();
    });

    it('should show search suggestions when no results found', () => {
      mockStoreState.items = [createItem({ content: 'apple' })];
      mockStoreState.searchQuery = 'banan';

      render(<ItemList />);

      expect(screen.getByTestId('search-suggestions')).toBeInTheDocument();
    });

    it('should suggest checking spelling in no results state', () => {
      mockStoreState.items = [createItem({ content: 'apple' })];
      mockStoreState.searchQuery = 'aplpe';

      render(<ItemList />);

      expect(screen.getByText(/check.*spelling/i)).toBeInTheDocument();
    });

    it('should suggest trying different keywords', () => {
      mockStoreState.items = [createItem({ content: 'apple' })];
      mockStoreState.searchQuery = 'xyz';

      render(<ItemList />);

      expect(screen.getByText(/different keywords/i)).toBeInTheDocument();
    });

    it('should suggest browsing all items', () => {
      mockStoreState.items = [createItem({ content: 'apple' })];
      mockStoreState.searchQuery = 'xyz';

      render(<ItemList />);

      expect(screen.getByText(/browse all/i)).toBeInTheDocument();
    });
  });

  describe('Grid/List View Toggle', () => {
    it('should render grid view by default', () => {
      mockStoreState.items = [createItem()];
      mockStoreState.viewMode = 'grid';

      const { container } = render(<ItemList />);

      expect(container.querySelector('[data-view-mode="grid"]')).toBeInTheDocument();
    });

    it('should render list view when viewMode is list', () => {
      mockStoreState.items = [createItem()];
      mockStoreState.viewMode = 'list';

      const { container } = render(<ItemList />);

      expect(container.querySelector('[data-view-mode="list"]')).toBeInTheDocument();
    });

    it('should show view toggle buttons', () => {
      mockStoreState.items = [createItem()];

      render(<ItemList />);

      expect(screen.getByTestId('view-toggle-grid')).toBeInTheDocument();
      expect(screen.getByTestId('view-toggle-list')).toBeInTheDocument();
    });

    it('should highlight active view mode button', () => {
      mockStoreState.items = [createItem()];
      mockStoreState.viewMode = 'grid';

      render(<ItemList />);

      const gridButton = screen.getByTestId('view-toggle-grid');
      const listButton = screen.getByTestId('view-toggle-list');

      expect(gridButton).toHaveClass('active');
      expect(listButton).not.toHaveClass('active');
    });

    it('should call setViewMode when toggle button clicked', async () => {
      const user = userEvent.setup();
      mockStoreState.items = [createItem()];
      mockStoreState.viewMode = 'grid';

      render(<ItemList />);

      const listButton = screen.getByTestId('view-toggle-list');
      await user.click(listButton);

      expect(mockStoreState.setViewMode).toHaveBeenCalledWith('list');
    });

    it('should apply list-specific styles in list view', () => {
      mockStoreState.items = [createItem()];
      mockStoreState.viewMode = 'list';

      const { container } = render(<ItemList />);

      const listContainer = container.querySelector('[data-view-mode="list"]');
      expect(listContainer).toHaveClass('flex-col');
    });

    it('should apply grid-specific styles in grid view', () => {
      mockStoreState.items = [createItem()];
      mockStoreState.viewMode = 'grid';

      const { container } = render(<ItemList />);

      const gridContainer = container.querySelector('[data-view-mode="grid"]');
      expect(gridContainer).toHaveClass('grid');
    });
  });

  describe('Items Rendering', () => {
    it('should render all items when no filter is applied', () => {
      const items = [
        createItem({ id: '1', content: 'Item 1' }),
        createItem({ id: '2', content: 'Item 2' }),
      ];
      mockStoreState.items = items;

      render(<ItemList />);

      expect(screen.getByTestId('item-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('item-card-2')).toBeInTheDocument();
    });

    it('should filter items by activeDrawer', () => {
      const items = [
        createItem({ id: '1', content: 'Contact', drawer: 'contacts' }),
        createItem({ id: '2', content: 'Note', drawer: 'notes' }),
      ];
      mockStoreState.items = items;
      mockStoreState.activeDrawer = 'contacts';

      render(<ItemList />);

      expect(screen.getByTestId('item-card-1')).toBeInTheDocument();
      expect(screen.queryByTestId('item-card-2')).not.toBeInTheDocument();
    });

    it('should filter items by search query', () => {
      const items = [
        createItem({ id: '1', content: 'apple pie' }),
        createItem({ id: '2', content: 'banana bread' }),
      ];
      mockStoreState.items = items;
      mockStoreState.searchQuery = 'apple';

      render(<ItemList />);

      expect(screen.getByTestId('item-card-1')).toBeInTheDocument();
      expect(screen.queryByTestId('item-card-2')).not.toBeInTheDocument();
    });
  });
});
