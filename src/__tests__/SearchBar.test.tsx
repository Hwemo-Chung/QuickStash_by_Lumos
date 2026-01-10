import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SearchBar } from '../components/SearchBar';
import type { SortOption, DateRange } from '../lib/search';

const { mockGetFilteredItems, mockSetSearchQuery, mockSetSearchSortOption, mockSetSearchDateFilter, mockState } = vi.hoisted(() => ({
  mockGetFilteredItems: vi.fn(),
  mockSetSearchQuery: vi.fn(),
  mockSetSearchSortOption: vi.fn(),
  mockSetSearchDateFilter: vi.fn(),
  mockState: {
    searchQuery: '' as string,
    searchSortOption: 'newest' as SortOption,
    searchDateFilter: 'all' as DateRange,
  },
}));

vi.mock('../store/useStashStore', () => ({
  useStashStore: vi.fn((selector) => {
    const state = {
      setSearchQuery: mockSetSearchQuery,
      setSearchSortOption: mockSetSearchSortOption,
      setSearchDateFilter: mockSetSearchDateFilter,
      getFilteredItems: mockGetFilteredItems,
      activeDrawer: 'all' as const,
      searchQuery: mockState.searchQuery,
      searchSortOption: mockState.searchSortOption,
      searchDateFilter: mockState.searchDateFilter,
    };
    return selector(state);
  }),
}));

vi.mock('../i18n', () => ({
  t: () => ({
    search: {
      placeholder: 'Search...',
      resultsCount: '{count} results',
      scopeAll: 'All',
      scopeDrawer: 'in {drawer}',
      shortcutHint: '⌘K',
      sortBy: 'Sort',
      sortRelevance: 'Relevance',
      sortNewest: 'Newest',
      sortOldest: 'Oldest',
      sortMostAccessed: 'Most Accessed',
      dateFilter: 'Date',
      dateAll: 'All Time',
      dateToday: 'Today',
      dateWeek: 'This Week',
      dateMonth: 'This Month',
    },
    drawers: {
      all: 'All',
      contacts: 'Contacts',
      notes: 'Notes',
    },
  }),
  getDrawerLabel: (drawer: string) => {
    const labels: Record<string, string> = {
      all: 'All',
      contacts: 'Contacts',
      notes: 'Notes',
    };
    return labels[drawer] || drawer;
  },
}));

describe('SearchBar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockGetFilteredItems.mockReturnValue([]);
    mockSetSearchQuery.mockClear();
    mockSetSearchSortOption.mockClear();
    mockSetSearchDateFilter.mockClear();
    mockState.searchQuery = '';
    mockState.searchSortOption = 'newest';
    mockState.searchDateFilter = 'all';
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render search input with placeholder', () => {
      render(<SearchBar />);
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('should render search icon', () => {
      render(<SearchBar />);
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    it('should render clear button when there is input', async () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } });
      });

      expect(screen.getByTestId('clear-button')).toBeInTheDocument();
    });

    it('should not render clear button when input is empty', () => {
      render(<SearchBar />);
      expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument();
    });
  });

  describe('Results Count Badge', () => {
    it('should display results count when searching', async () => {
      const { useStashStore } = await import('../store/useStashStore');
      let currentSearchQuery = '';
      
      (useStashStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: Record<string, unknown>) => unknown) => {
        const state = {
          setSearchQuery: (query: string) => { currentSearchQuery = query; mockSetSearchQuery(query); },
          setSearchSortOption: mockSetSearchSortOption,
          setSearchDateFilter: mockSetSearchDateFilter,
          getFilteredItems: () => [
            { id: '1', content: 'test1' },
            { id: '2', content: 'test2' },
            { id: '3', content: 'test3' },
          ],
          activeDrawer: 'all' as const,
          searchQuery: currentSearchQuery,
          searchSortOption: 'newest',
          searchDateFilter: 'all',
        };
        return selector(state);
      });

      const { rerender } = render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } });
      });
      
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      rerender(<SearchBar />);

      expect(screen.getByTestId('results-count')).toBeInTheDocument();
      expect(screen.getByTestId('results-count')).toHaveTextContent('3');
      expect(screen.getByTestId('results-count')).toHaveAttribute('aria-live', 'polite');
    });

    it('should update results count when filtered items change', async () => {
      const { useStashStore } = await import('../store/useStashStore');
      let currentSearchQuery = '';
      let filteredItems = [{ id: '1', content: 'test1' }];
      
      (useStashStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: Record<string, unknown>) => unknown) => {
        const state = {
          setSearchQuery: (query: string) => { currentSearchQuery = query; mockSetSearchQuery(query); },
          setSearchSortOption: mockSetSearchSortOption,
          setSearchDateFilter: mockSetSearchDateFilter,
          getFilteredItems: () => filteredItems,
          activeDrawer: 'all' as const,
          searchQuery: currentSearchQuery,
          searchSortOption: 'newest',
          searchDateFilter: 'all',
        };
        return selector(state);
      });

      const { rerender } = render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } });
      });
      
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      rerender(<SearchBar />);
      expect(screen.getByTestId('results-count')).toHaveTextContent('1');

      filteredItems = [
        { id: '1', content: 'test1' },
        { id: '2', content: 'test2' },
      ];

      rerender(<SearchBar />);
      expect(screen.getByTestId('results-count')).toHaveTextContent('2');
    });

    it('should hide results count when no search query', async () => {
      const { useStashStore } = await import('../store/useStashStore');
      (useStashStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: Record<string, unknown>) => unknown) => {
        const state = {
          setSearchQuery: mockSetSearchQuery,
          setSearchSortOption: mockSetSearchSortOption,
          setSearchDateFilter: mockSetSearchDateFilter,
          getFilteredItems: () => [],
          activeDrawer: 'all' as const,
          searchQuery: '',
          searchSortOption: 'newest',
          searchDateFilter: 'all',
        };
        return selector(state);
      });

      render(<SearchBar />);
      expect(screen.queryByTestId('results-count')).not.toBeInTheDocument();
    });

    it('should show zero results message when no matches', async () => {
      const { useStashStore } = await import('../store/useStashStore');
      let currentSearchQuery = '';
      
      (useStashStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: Record<string, unknown>) => unknown) => {
        const state = {
          setSearchQuery: (query: string) => { currentSearchQuery = query; mockSetSearchQuery(query); },
          setSearchSortOption: mockSetSearchSortOption,
          setSearchDateFilter: mockSetSearchDateFilter,
          getFilteredItems: () => [],
          activeDrawer: 'all' as const,
          searchQuery: currentSearchQuery,
          searchSortOption: 'newest',
          searchDateFilter: 'all',
        };
        return selector(state);
      });

      const { rerender } = render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'nonexistent' } });
      });
      
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      rerender(<SearchBar />);
      expect(screen.getByTestId('results-count')).toHaveTextContent('0');
    });
  });

  describe('Keyboard Shortcut Hint', () => {
    it('should show keyboard shortcut hint when not focused', () => {
      render(<SearchBar />);
      expect(screen.getByTestId('shortcut-hint')).toBeInTheDocument();
      expect(screen.getByTestId('shortcut-hint')).toHaveTextContent('⌘K');
    });

    it('should hide keyboard shortcut hint when focused', async () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        fireEvent.focus(input);
      });

      expect(screen.queryByTestId('shortcut-hint')).not.toBeInTheDocument();
    });

    it('should show keyboard shortcut hint again when blurred', async () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        fireEvent.focus(input);
      });

      expect(screen.queryByTestId('shortcut-hint')).not.toBeInTheDocument();

      await act(async () => {
        fireEvent.blur(input);
      });

      expect(screen.getByTestId('shortcut-hint')).toBeInTheDocument();
    });
  });

  describe('Search Scope Indicator', () => {
    it('should show "All" scope when activeDrawer is all', () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      
      fireEvent.focus(input);

      expect(screen.getByTestId('scope-indicator')).toHaveTextContent('All');
    });

    it('should show drawer name when activeDrawer is specific', async () => {
      const { useStashStore } = await import('../store/useStashStore');
      (useStashStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: Record<string, unknown>) => unknown) => {
        const state = {
          setSearchQuery: mockSetSearchQuery,
          getFilteredItems: mockGetFilteredItems,
          activeDrawer: 'contacts' as const,
          searchQuery: '',
        };
        return selector(state);
      });

      render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        fireEvent.focus(input);
      });

      expect(screen.getByTestId('scope-indicator')).toHaveTextContent('Contacts');
    });

    it('should only show scope indicator when focused', () => {
      render(<SearchBar />);
      expect(screen.queryByTestId('scope-indicator')).not.toBeInTheDocument();

      const input = screen.getByPlaceholderText('Search...');
      fireEvent.focus(input);

      expect(screen.getByTestId('scope-indicator')).toBeInTheDocument();
    });
  });

  describe('Debounce Visual Indicator', () => {
    it('should show pulse animation during typing', async () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 't' } });
      });

      expect(screen.getByTestId('debounce-indicator')).toBeInTheDocument();
      expect(screen.getByTestId('debounce-indicator')).toHaveClass('animate-pulse-soft');
    });

    it('should hide pulse animation after debounce completes', async () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } });
      });

      expect(screen.getByTestId('debounce-indicator')).toBeInTheDocument();

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(screen.queryByTestId('debounce-indicator')).not.toBeInTheDocument();
    });

    it('should restart pulse animation on new keystroke', async () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } });
      });
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(screen.getByTestId('debounce-indicator')).toBeInTheDocument();

      await act(async () => {
        fireEvent.change(input, { target: { value: 'testing' } });
      });

      expect(screen.getByTestId('debounce-indicator')).toBeInTheDocument();

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(screen.queryByTestId('debounce-indicator')).not.toBeInTheDocument();
    });
  });

  describe('Enhanced Focus State', () => {
    it('should apply scale animation class on focus', async () => {
      render(<SearchBar />);
      const container = screen.getByTestId('search-container');
      const input = screen.getByPlaceholderText('Search...');
      
      expect(container).not.toHaveClass('search-focused');

      await act(async () => {
        fireEvent.focus(input);
      });

      expect(container).toHaveClass('search-focused');
    });

    it('should remove scale animation class on blur', async () => {
      render(<SearchBar />);
      const container = screen.getByTestId('search-container');
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        fireEvent.focus(input);
      });

      expect(container).toHaveClass('search-focused');

      await act(async () => {
        fireEvent.blur(input);
      });

      expect(container).not.toHaveClass('search-focused');
    });

    it('should have smooth transition styles', () => {
      render(<SearchBar />);
      const container = screen.getByTestId('search-container');
      
      expect(container.className).toContain('transition');
    });
  });

  describe('Debounce Behavior', () => {
    it('should debounce search query updates', async () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 't' } });
        fireEvent.change(input, { target: { value: 'te' } });
        fireEvent.change(input, { target: { value: 'tes' } });
        fireEvent.change(input, { target: { value: 'test' } });
      });

      expect(mockSetSearchQuery).not.toHaveBeenCalled();

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(mockSetSearchQuery).toHaveBeenCalledTimes(1);
      expect(mockSetSearchQuery).toHaveBeenCalledWith('test');
    });

    it('should maintain 200ms debounce timing', async () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } });
        vi.advanceTimersByTime(199);
      });

      expect(mockSetSearchQuery).not.toHaveBeenCalled();

      await act(async () => {
        vi.advanceTimersByTime(1);
      });

      expect(mockSetSearchQuery).toHaveBeenCalledWith('test');
    });
  });

  describe('Clear Functionality', () => {
    it('should clear input and search query when clear button clicked', async () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } });
        vi.advanceTimersByTime(200);
      });

      const clearButton = screen.getByTestId('clear-button');
      
      await act(async () => {
        fireEvent.click(clearButton);
      });

      expect(input).toHaveValue('');
      expect(mockSetSearchQuery).toHaveBeenCalledWith('');
    });
  });

  describe('Accessibility', () => {
    it('should have data-search-input attribute for keyboard shortcuts', () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      expect(input).toHaveAttribute('data-search-input');
    });

    it('should have aria-label for screen readers', () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      expect(input).toHaveAttribute('aria-label');
    });


  });

  describe('Sort and Filter Dropdowns', () => {
    it('should show filter buttons when input is focused', async () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      
      expect(screen.queryByTestId('search-filters')).not.toBeInTheDocument();

      await act(async () => {
        fireEvent.focus(input);
      });

      expect(screen.getByTestId('search-filters')).toBeInTheDocument();
      expect(screen.getByTestId('sort-dropdown-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('date-dropdown-trigger')).toBeInTheDocument();
    });

    it('should show filter buttons when there is search query', async () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } });
      });

      expect(screen.getByTestId('search-filters')).toBeInTheDocument();
    });

    it('should hide filter buttons when input is blurred and empty', async () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        fireEvent.focus(input);
      });

      expect(screen.getByTestId('search-filters')).toBeInTheDocument();

      await act(async () => {
        fireEvent.blur(input);
      });

      expect(screen.queryByTestId('search-filters')).not.toBeInTheDocument();
    });

    it('should open sort dropdown when trigger is clicked', async () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        fireEvent.focus(input);
      });

      const sortTrigger = screen.getByTestId('sort-dropdown-trigger');
      
      await act(async () => {
        fireEvent.click(sortTrigger);
      });

      expect(screen.getByTestId('sort-dropdown-menu')).toBeInTheDocument();
      expect(screen.getByTestId('sort-option-relevance')).toBeInTheDocument();
      expect(screen.getByTestId('sort-option-newest')).toBeInTheDocument();
      expect(screen.getByTestId('sort-option-oldest')).toBeInTheDocument();
      expect(screen.getByTestId('sort-option-mostAccessed')).toBeInTheDocument();
    });

    it('should call setSearchSortOption when sort option is selected', async () => {
      const { useStashStore } = await import('../store/useStashStore');
      (useStashStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: Record<string, unknown>) => unknown) => {
        const state = {
          setSearchQuery: mockSetSearchQuery,
          setSearchSortOption: mockSetSearchSortOption,
          setSearchDateFilter: mockSetSearchDateFilter,
          getFilteredItems: mockGetFilteredItems,
          activeDrawer: 'all' as const,
          searchQuery: '',
          searchSortOption: 'newest',
          searchDateFilter: 'all',
        };
        return selector(state);
      });

      render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        fireEvent.focus(input);
      });

      const sortTrigger = screen.getByTestId('sort-dropdown-trigger');
      
      await act(async () => {
        fireEvent.click(sortTrigger);
      });

      const relevanceOption = screen.getByTestId('sort-option-relevance');
      
      await act(async () => {
        fireEvent.click(relevanceOption);
      });

      expect(mockSetSearchSortOption).toHaveBeenCalledWith('relevance');
      expect(screen.queryByTestId('sort-dropdown-menu')).not.toBeInTheDocument();
    });

    it('should open date dropdown when trigger is clicked', async () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        fireEvent.focus(input);
      });

      const dateTrigger = screen.getByTestId('date-dropdown-trigger');
      
      await act(async () => {
        fireEvent.click(dateTrigger);
      });

      expect(screen.getByTestId('date-dropdown-menu')).toBeInTheDocument();
      expect(screen.getByTestId('date-option-all')).toBeInTheDocument();
      expect(screen.getByTestId('date-option-today')).toBeInTheDocument();
      expect(screen.getByTestId('date-option-week')).toBeInTheDocument();
      expect(screen.getByTestId('date-option-month')).toBeInTheDocument();
    });

    it('should call setSearchDateFilter when date option is selected', async () => {
      const { useStashStore } = await import('../store/useStashStore');
      (useStashStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: Record<string, unknown>) => unknown) => {
        const state = {
          setSearchQuery: mockSetSearchQuery,
          setSearchSortOption: mockSetSearchSortOption,
          setSearchDateFilter: mockSetSearchDateFilter,
          getFilteredItems: mockGetFilteredItems,
          activeDrawer: 'all' as const,
          searchQuery: '',
          searchSortOption: 'newest',
          searchDateFilter: 'all',
        };
        return selector(state);
      });

      render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        fireEvent.focus(input);
      });

      const dateTrigger = screen.getByTestId('date-dropdown-trigger');
      
      await act(async () => {
        fireEvent.click(dateTrigger);
      });

      const todayOption = screen.getByTestId('date-option-today');
      
      await act(async () => {
        fireEvent.click(todayOption);
      });

      expect(mockSetSearchDateFilter).toHaveBeenCalledWith('today');
      expect(screen.queryByTestId('date-dropdown-menu')).not.toBeInTheDocument();
    });

    it('should close dropdown when clicking outside', async () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        fireEvent.focus(input);
      });

      const sortTrigger = screen.getByTestId('sort-dropdown-trigger');
      
      await act(async () => {
        fireEvent.click(sortTrigger);
      });

      expect(screen.getByTestId('sort-dropdown-menu')).toBeInTheDocument();

      await act(async () => {
        fireEvent.mouseDown(document.body);
      });

      expect(screen.queryByTestId('sort-dropdown-menu')).not.toBeInTheDocument();
    });

    it('should display current sort option label', async () => {
      const { useStashStore } = await import('../store/useStashStore');
      (useStashStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: Record<string, unknown>) => unknown) => {
        const state = {
          setSearchQuery: mockSetSearchQuery,
          setSearchSortOption: mockSetSearchSortOption,
          setSearchDateFilter: mockSetSearchDateFilter,
          getFilteredItems: mockGetFilteredItems,
          activeDrawer: 'all' as const,
          searchQuery: '',
          searchSortOption: 'newest',
          searchDateFilter: 'all',
        };
        return selector(state);
      });

      render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        fireEvent.focus(input);
      });

      const sortTrigger = screen.getByTestId('sort-dropdown-trigger');
      expect(sortTrigger).toHaveTextContent('Newest');
    });

    it('should display current date filter label', async () => {
      const { useStashStore } = await import('../store/useStashStore');
      (useStashStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: Record<string, unknown>) => unknown) => {
        const state = {
          setSearchQuery: mockSetSearchQuery,
          setSearchSortOption: mockSetSearchSortOption,
          setSearchDateFilter: mockSetSearchDateFilter,
          getFilteredItems: mockGetFilteredItems,
          activeDrawer: 'all' as const,
          searchQuery: '',
          searchSortOption: 'newest',
          searchDateFilter: 'all',
        };
        return selector(state);
      });

      render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        fireEvent.focus(input);
      });

      const dateTrigger = screen.getByTestId('date-dropdown-trigger');
      expect(dateTrigger).toHaveTextContent('All Time');
    });

    it('should highlight selected sort option', async () => {
      const { useStashStore } = await import('../store/useStashStore');
      (useStashStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: Record<string, unknown>) => unknown) => {
        const state = {
          setSearchQuery: mockSetSearchQuery,
          setSearchSortOption: mockSetSearchSortOption,
          setSearchDateFilter: mockSetSearchDateFilter,
          getFilteredItems: mockGetFilteredItems,
          activeDrawer: 'all' as const,
          searchQuery: '',
          searchSortOption: 'newest',
          searchDateFilter: 'all',
        };
        return selector(state);
      });

      render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        fireEvent.focus(input);
      });

      const sortTrigger = screen.getByTestId('sort-dropdown-trigger');
      
      await act(async () => {
        fireEvent.click(sortTrigger);
      });

      const newestOption = screen.getByTestId('sort-option-newest');
      expect(newestOption).toHaveClass('text-indigo-600');
      expect(newestOption).toHaveClass('bg-indigo-50');
    });

    it('should highlight selected date filter option', async () => {
      const { useStashStore } = await import('../store/useStashStore');
      (useStashStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: Record<string, unknown>) => unknown) => {
        const state = {
          setSearchQuery: mockSetSearchQuery,
          setSearchSortOption: mockSetSearchSortOption,
          setSearchDateFilter: mockSetSearchDateFilter,
          getFilteredItems: mockGetFilteredItems,
          activeDrawer: 'all' as const,
          searchQuery: '',
          searchSortOption: 'newest',
          searchDateFilter: 'all',
        };
        return selector(state);
      });

      render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      
      await act(async () => {
        fireEvent.focus(input);
      });

      const dateTrigger = screen.getByTestId('date-dropdown-trigger');
      
      await act(async () => {
        fireEvent.click(dateTrigger);
      });

      const allOption = screen.getByTestId('date-option-all');
      expect(allOption).toHaveClass('text-indigo-600');
      expect(allOption).toHaveClass('bg-indigo-50');
    });
  });
});
