import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemCard } from '../components/ItemCard';
import type { StashItem } from '../types';

const mockDeleteItem = vi.fn();
const mockMoveItem = vi.fn();
let mockHighlightedItemId: string | null = null;
let mockClipboardWriteText: Mock;

vi.mock('../store/useStashStore', () => ({
  useStashStore: vi.fn((selector: (state: Record<string, unknown>) => unknown) => {
    const state = {
      deleteItem: mockDeleteItem,
      moveItem: mockMoveItem,
      highlightedItemId: mockHighlightedItemId,
    };
    return selector(state);
  }),
}));

const mockItem: StashItem = {
  id: 'test-id-1',
  content: 'Test content for clipboard',
  drawer: 'ideas',
  tags: ['test', 'sample'],
  createdAt: Date.now() - 1000 * 60 * 5,
  updatedAt: Date.now(),
  accessCount: 0,
  title: 'Test Title',
};

const createMockItem = (overrides: Partial<StashItem> = {}): StashItem => ({
  ...mockItem,
  ...overrides,
});

describe('ItemCard', () => {
  let originalMatchMedia: typeof window.matchMedia;
  
  beforeEach(() => {
    vi.clearAllMocks();
    originalMatchMedia = window.matchMedia;
    
    mockClipboardWriteText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockClipboardWriteText },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  const mockMobileDevice = () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('max-width: 768px') || query.includes('pointer: coarse'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  };

  const mockDesktopDevice = () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  };

  describe('rendering', () => {
    it('should render item title', () => {
      render(<ItemCard item={mockItem} />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should render relative time', () => {
      render(<ItemCard item={mockItem} />);
      expect(screen.getByText(/5분 전|5m ago/)).toBeInTheDocument();
    });

    it('should render tags', () => {
      render(<ItemCard item={mockItem} />);
      expect(screen.getByText('test')).toBeInTheDocument();
      expect(screen.getByText('sample')).toBeInTheDocument();
    });

    it('should render drawer icon', () => {
      render(<ItemCard item={mockItem} />);
      expect(screen.getByTitle(/Ideas|아이디어/)).toBeInTheDocument();
    });
  });

  describe('hover states and elevation', () => {
    it('should have base shadow styles', () => {
      render(<ItemCard item={mockItem} />);
      const card = screen.getByTestId('item-card');
      expect(card).toHaveClass('shadow-sm');
    });

    it('should apply enhanced elevation on hover via CSS class', () => {
      render(<ItemCard item={mockItem} />);
      const card = screen.getByTestId('item-card');
      expect(card.className).toMatch(/hover:shadow/);
    });

    it('should have drawer-themed glow effect class on hover', () => {
      render(<ItemCard item={mockItem} />);
      const card = screen.getByTestId('item-card');
      expect(card.className).toMatch(/hover:/);
    });
  });

  describe('action button visibility', () => {
    it('should show quick actions bar always visible on mobile', () => {
      mockMobileDevice();
      render(<ItemCard item={mockItem} />);
      const quickActionsBar = screen.getByTestId('quick-actions-bar');
      expect(quickActionsBar).toBeInTheDocument();
    });

    it('should hide action button initially on desktop', () => {
      mockDesktopDevice();
      render(<ItemCard item={mockItem} />);
      const menuButton = screen.getByRole('button', { name: /menu|more|actions/i });
      expect(menuButton).toHaveClass('opacity-0');
      expect(menuButton).toHaveClass('group-hover:opacity-100');
    });
  });

  describe('copy functionality', () => {
    it('should copy content to clipboard when clicking card body', async () => {
      const user = userEvent.setup();
      render(<ItemCard item={mockItem} />);
      
      const copyButton = screen.getByRole('button', { name: /Copy Test Title/i });
      await user.click(copyButton);

      await waitFor(() => {
        expect(screen.getByTestId('copy-feedback')).toBeInTheDocument();
      });
    });

    it('should show copy feedback animation', async () => {
      const user = userEvent.setup();
      render(<ItemCard item={mockItem} />);
      
      const copyButton = screen.getByRole('button', { name: /Copy Test Title/i });
      await user.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText(/Copied|복사됨/i)).toBeInTheDocument();
      });
    });

    it('should hide copy feedback after animation completes', async () => {
      const user = userEvent.setup();
      render(<ItemCard item={mockItem} />);
      
      const copyButton = screen.getByRole('button', { name: /Copy Test Title/i });
      await user.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText(/Copied|복사됨/i)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.queryByText(/Copied|복사됨/i)).not.toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should show checkmark icon during copy feedback', async () => {
      const user = userEvent.setup();
      render(<ItemCard item={mockItem} />);
      
      const copyButton = screen.getByRole('button', { name: /Copy Test Title/i });
      await user.click(copyButton);

      await waitFor(() => {
        const feedbackOverlay = screen.getByTestId('copy-feedback');
        expect(feedbackOverlay).toBeInTheDocument();
      });
    });
  });

  describe('keyboard navigation', () => {
    it('should have keyboard handler for Enter key', () => {
      render(<ItemCard item={mockItem} />);
      
      const card = screen.getByTestId('item-card');
      expect(card).toHaveAttribute('tabindex', '0');
      expect(card).toHaveAttribute('role', 'article');
    });

    it('should be focusable via Tab', async () => {
      render(<ItemCard item={mockItem} />);
      
      const card = screen.getByTestId('item-card');
      expect(card).toHaveAttribute('tabindex', '0');
    });

    it('should allow Tab navigation through interactive elements', async () => {
      render(<ItemCard item={mockItem} />);
      
      const card = screen.getByTestId('item-card');
      const copyButton = screen.getByRole('button', { name: /Copy Test Title/i });
      const menuButton = screen.getByRole('button', { name: /more actions/i });
      
      expect(card).toHaveAttribute('tabindex', '0');
      expect(copyButton).toBeInTheDocument();
      expect(menuButton).toBeInTheDocument();
    });

    it('should have proper focus styles', () => {
      render(<ItemCard item={mockItem} />);
      const card = screen.getByTestId('item-card');
      expect(card.className).toMatch(/focus:/);
    });
  });

  describe('tag interaction', () => {
    it('should have hover state on tags', () => {
      render(<ItemCard item={mockItem} />);
      const tag = screen.getByText('test');
      expect(tag.className).toMatch(/hover:/);
    });

    it('should show cursor pointer on tag hover', () => {
      render(<ItemCard item={mockItem} />);
      const tag = screen.getByText('test');
      expect(tag).toHaveClass('cursor-pointer');
    });

    it('should render up to 4 tags with overflow indicator', () => {
      const itemWithManyTags = createMockItem({
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'],
      });
      render(<ItemCard item={itemWithManyTags} />);
      
      expect(screen.getByText('tag1')).toBeInTheDocument();
      expect(screen.getByText('tag4')).toBeInTheDocument();
      expect(screen.getByText('+2')).toBeInTheDocument();
    });
  });

  describe('time tooltip', () => {
    it('should show time element with relative time', () => {
      render(<ItemCard item={mockItem} />);
      const timeElement = screen.getByText(/5분 전|5m ago/);
      expect(timeElement).toBeInTheDocument();
    });

    it('should have tooltip with full date on hover', () => {
      render(<ItemCard item={mockItem} />);
      const timeElement = screen.getByTestId('time-display');
      expect(timeElement).toHaveAttribute('title');
      expect(timeElement.getAttribute('title')).toMatch(/\d{4}/);
    });
  });

  describe('menu interactions', () => {
    it('should open menu when clicking more button', async () => {
      const user = userEvent.setup();
      render(<ItemCard item={mockItem} />);
      
      const menuButton = screen.getByRole('button', { name: /more actions/i });
      await user.click(menuButton);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });
    });

    it('should have menu items with proper roles', async () => {
      const user = userEvent.setup();
      render(<ItemCard item={mockItem} />);
      
      const menuButton = screen.getByRole('button', { name: /more actions/i });
      await user.click(menuButton);

      await waitFor(() => {
        const menuItems = screen.getAllByRole('menuitem');
        expect(menuItems.length).toBeGreaterThanOrEqual(3);
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA label on card', () => {
      render(<ItemCard item={mockItem} />);
      const card = screen.getByTestId('item-card');
      expect(card).toHaveAttribute('aria-label');
    });

    it('should have proper ARIA label on copy button', () => {
      render(<ItemCard item={mockItem} />);
      const copyButton = screen.getByRole('button', { name: /Copy Test Title/i });
      expect(copyButton).toHaveAccessibleName();
    });

    it('should have proper ARIA label on menu button', () => {
      render(<ItemCard item={mockItem} />);
      const menuButton = screen.getByRole('button', { name: /menu|more|actions/i });
      expect(menuButton).toHaveAccessibleName();
    });

    it('should announce copy status to screen readers', async () => {
      const user = userEvent.setup();
      render(<ItemCard item={mockItem} />);
      
      const copyButton = screen.getByRole('button', { name: /Copy Test Title/i });
      await user.click(copyButton);

      await waitFor(() => {
        const feedback = screen.getByTestId('copy-feedback');
        expect(feedback).toHaveAttribute('role', 'status');
        expect(feedback).toHaveAttribute('aria-live', 'polite');
      });
    });
  });

  describe('highlighted state', () => {
    it('should apply highlight styles when item is highlighted', () => {
      mockHighlightedItemId = 'test-id-1';

      render(<ItemCard item={mockItem} />);
      const card = screen.getByTestId('item-card');
      expect(card).toHaveClass('ring-2');
      
      mockHighlightedItemId = null;
    });
  });

  describe('search highlight rendering', () => {
    it('should render highlighted text in title when searchHighlights provided', () => {
      const highlights = {
        content: [],
        title: [{ start: 0, end: 4 }],
      };
      render(<ItemCard item={mockItem} searchHighlights={highlights} />);
      
      const highlightedText = screen.getByTestId('search-highlight');
      expect(highlightedText).toBeInTheDocument();
      expect(highlightedText).toHaveTextContent('Test');
    });

    it('should render highlighted text in content when searchHighlights provided', () => {
      const itemWithContent = createMockItem({
        title: 'Title',
        content: 'This is test content for clipboard',
      });
      const highlights = {
        content: [{ start: 8, end: 12 }],
        title: [],
      };
      render(<ItemCard item={itemWithContent} searchHighlights={highlights} />);
      
      const highlightedText = screen.getByTestId('search-highlight');
      expect(highlightedText).toBeInTheDocument();
      expect(highlightedText).toHaveTextContent('test');
    });

    it('should render multiple highlights in content', () => {
      const itemWithContent = createMockItem({
        title: 'Title',
        content: 'React is great. I love React!',
      });
      const highlights = {
        content: [{ start: 0, end: 5 }, { start: 23, end: 28 }],
        title: [],
      };
      render(<ItemCard item={itemWithContent} searchHighlights={highlights} />);
      
      const highlightedTexts = screen.getAllByTestId('search-highlight');
      expect(highlightedTexts).toHaveLength(2);
    });

    it('should not render highlights when searchHighlights is undefined', () => {
      render(<ItemCard item={mockItem} />);
      
      const highlightedText = screen.queryByTestId('search-highlight');
      expect(highlightedText).not.toBeInTheDocument();
    });
  });
});
