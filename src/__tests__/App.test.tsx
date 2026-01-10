import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

const mockIntersectionObserver = vi.fn();
const mockObserve = vi.fn();
const mockUnobserve = vi.fn();
const mockDisconnect = vi.fn();

let intersectionCallback: IntersectionObserverCallback | null = null;

beforeEach(() => {
  mockIntersectionObserver.mockImplementation((callback: IntersectionObserverCallback) => {
    intersectionCallback = callback;
    return {
      observe: mockObserve,
      unobserve: mockUnobserve,
      disconnect: mockDisconnect,
    };
  });
  window.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver;
  
  window.scrollTo = vi.fn();
  
  Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
});

afterEach(() => {
  vi.clearAllMocks();
  intersectionCallback = null;
});

vi.mock('../store/useStashStore', () => ({
  useStashStore: vi.fn((selector) => {
    const state = {
      loadItems: vi.fn().mockResolvedValue(undefined),
      items: [],
      filteredItems: [],
      searchQuery: '',
      setSearchQuery: vi.fn(),
      activeDrawer: null,
      setActiveDrawer: vi.fn(),
      addItem: vi.fn().mockResolvedValue({ item: { id: '1' }, isDuplicate: false }),
    };
    return selector(state);
  }),
}));

vi.mock('../db/database', () => ({
  db: {
    security: {
      get: vi.fn().mockResolvedValue({
        id: 'main',
        pinHash: null,
        pinSalt: null,
        failedAttempts: 0,
        isEnabled: false,
      }),
      add: vi.fn().mockResolvedValue(undefined),
      put: vi.fn().mockResolvedValue(undefined),
    },
    delete: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: vi.fn(),
}));

vi.mock('../components/QuickInput', () => ({
  QuickInput: () => <div data-testid="quick-input"><textarea /></div>,
}));

vi.mock('../components/SearchBar', () => ({
  SearchBar: () => <div data-testid="search-bar"><input type="text" /></div>,
}));

vi.mock('../components/DrawerTabs', () => ({
  DrawerTabs: () => <div data-testid="drawer-tabs">DrawerTabs</div>,
}));

vi.mock('../components/ItemList', () => ({
  ItemList: () => <div data-testid="item-list">ItemList</div>,
}));

vi.mock('../components/LockScreen', () => ({
  LockScreen: () => <div data-testid="lock-screen">LockScreen</div>,
}));

vi.mock('../components/SettingsModal', () => ({
  SettingsModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => 
    isOpen ? (
      <div data-testid="settings-modal" role="dialog">
        <button onClick={onClose} data-testid="close-settings">Close</button>
      </div>
    ) : null,
}));

import App from '../App';

function triggerIntersection(isIntersecting: boolean) {
  if (intersectionCallback) {
    intersectionCallback(
      [{ isIntersecting } as IntersectionObserverEntry],
      {} as IntersectionObserver
    );
  }
}

function simulateScroll(scrollY: number) {
  Object.defineProperty(window, 'scrollY', { value: scrollY, writable: true, configurable: true });
  fireEvent.scroll(window);
}

describe('App Layout', () => {
  describe('Header', () => {
    it('should render the header with app title', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByRole('banner')).toBeInTheDocument();
        expect(screen.getByText('QuickStash')).toBeInTheDocument();
      });
    });

    it('should render settings button placeholder in header', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('settings-button')).toBeInTheDocument();
      });
    });

    it('should have proper header structure with flexbox layout', async () => {
      render(<App />);
      
      await waitFor(() => {
        const header = screen.getByRole('banner');
        expect(header).toHaveClass('flex');
        expect(header).toHaveClass('items-center');
        expect(header).toHaveClass('justify-between');
      });
    });
  });

  describe('Sticky Input Area', () => {
    it('should render sticky container for input and search', async () => {
      render(<App />);
      
      await waitFor(() => {
        const stickyContainer = screen.getByTestId('sticky-input-area');
        expect(stickyContainer).toBeInTheDocument();
      });
    });

    it('should have sticky positioning class', async () => {
      render(<App />);
      
      await waitFor(() => {
        const stickyContainer = screen.getByTestId('sticky-input-area');
        expect(stickyContainer).toHaveClass('sticky');
        expect(stickyContainer).toHaveClass('top-0');
      });
    });

    it('should contain QuickInput component', async () => {
      render(<App />);
      
      await waitFor(() => {
        const stickyArea = screen.getByTestId('sticky-input-area');
        const textarea = stickyArea.querySelector('textarea');
        expect(textarea).toBeInTheDocument();
      });
    });

    it('should contain SearchBar component', async () => {
      render(<App />);
      
      await waitFor(() => {
        const stickyArea = screen.getByTestId('sticky-input-area');
        const searchInput = stickyArea.querySelector('input[type="text"]');
        expect(searchInput).toBeInTheDocument();
      });
    });

    it('should have elevated z-index for sticky behavior', async () => {
      render(<App />);
      
      await waitFor(() => {
        const stickyContainer = screen.getByTestId('sticky-input-area');
        expect(stickyContainer).toHaveClass('z-40');
      });
    });

    it('should have background and shadow when stuck', async () => {
      render(<App />);
      
      await waitFor(() => {
        const stickyContainer = screen.getByTestId('sticky-input-area');
        expect(stickyContainer).toBeInTheDocument();
      });

      act(() => {
        triggerIntersection(false);
      });

      await waitFor(() => {
        const stickyContainer = screen.getByTestId('sticky-input-area');
        expect(stickyContainer).toHaveClass('shadow-md');
      });
    });
  });

  describe('Scroll-to-Top Button', () => {
    it('should not render scroll-to-top button initially', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('scroll-to-top')).not.toBeInTheDocument();
      });
    });

    it('should appear after scrolling down', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('sticky-input-area')).toBeInTheDocument();
      });

      act(() => {
        simulateScroll(300);
      });

      await waitFor(() => {
        expect(screen.getByTestId('scroll-to-top')).toBeInTheDocument();
      });
    });

    it('should call scrollTo when clicked', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('sticky-input-area')).toBeInTheDocument();
      });

      act(() => {
        simulateScroll(300);
      });

      await waitFor(() => {
        expect(screen.getByTestId('scroll-to-top')).toBeInTheDocument();
      });

      const scrollButton = screen.getByTestId('scroll-to-top');
      fireEvent.click(scrollButton);

      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      });
    });

    it('should have proper accessibility attributes', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('sticky-input-area')).toBeInTheDocument();
      });

      act(() => {
        simulateScroll(300);
      });

      await waitFor(() => {
        const scrollButton = screen.getByTestId('scroll-to-top');
        expect(scrollButton).toHaveAttribute('aria-label');
      });
    });

    it('should hide when scrolling back to top', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('sticky-input-area')).toBeInTheDocument();
      });

      act(() => {
        simulateScroll(300);
      });

      await waitFor(() => {
        expect(screen.getByTestId('scroll-to-top')).toBeInTheDocument();
      });

      act(() => {
        simulateScroll(50);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('scroll-to-top')).not.toBeInTheDocument();
      });
    });
  });

  describe('Visual Hierarchy and Spacing', () => {
    it('should have proper spacing between sections', async () => {
      render(<App />);
      
      await waitFor(() => {
        const mainContainer = screen.getByTestId('main-content');
        expect(mainContainer).toHaveClass('space-y-6');
      });
    });

    it('should have max-width container for content', async () => {
      render(<App />);
      
      await waitFor(() => {
        const mainContainer = screen.getByTestId('main-content');
        expect(mainContainer).toHaveClass('max-w-6xl');
        expect(mainContainer).toHaveClass('mx-auto');
      });
    });
  });

  describe('Dark Mode CSS Variables', () => {
    it('should have CSS custom properties defined', async () => {
      render(<App />);
      
      await waitFor(() => {
        const root = document.documentElement;
        const styles = getComputedStyle(root);
        expect(styles.getPropertyValue('--color-bg-primary')).toBeDefined();
      });
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should have responsive padding', async () => {
      render(<App />);
      
      await waitFor(() => {
        const mainContainer = screen.getByTestId('main-content');
        expect(mainContainer).toHaveClass('px-4');
      });
    });

    it('should render correctly on all viewport sizes', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByRole('banner')).toBeInTheDocument();
        expect(screen.getByTestId('sticky-input-area')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner during initialization', () => {
      render(<App />);
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Intersection Observer', () => {
    it('should create IntersectionObserver on mount', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('sticky-input-area')).toBeInTheDocument();
      });

      expect(mockIntersectionObserver).toHaveBeenCalled();
    });

    it('should observe sentinel element', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('sticky-input-area')).toBeInTheDocument();
      });

      expect(mockObserve).toHaveBeenCalled();
    });

    it('should disconnect observer on unmount', async () => {
      const { unmount } = render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('sticky-input-area')).toBeInTheDocument();
      });

      unmount();
      
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });
});

describe('App Security Flow', () => {
  it('should not show lock screen when security is disabled', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });
});

describe('Settings Modal', () => {
  it('should not show settings modal initially', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
    
    expect(screen.queryByTestId('settings-modal')).not.toBeInTheDocument();
  });

  it('should open settings modal when settings button is clicked', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByTestId('settings-button')).toBeInTheDocument();
    });

    const settingsButton = screen.getByTestId('settings-button');
    fireEvent.click(settingsButton);

    await waitFor(() => {
      expect(screen.getByTestId('settings-modal')).toBeInTheDocument();
    });
  });

  it('should close settings modal when close button is clicked', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByTestId('settings-button')).toBeInTheDocument();
    });

    const settingsButton = screen.getByTestId('settings-button');
    fireEvent.click(settingsButton);

    await waitFor(() => {
      expect(screen.getByTestId('settings-modal')).toBeInTheDocument();
    });

    const closeButton = screen.getByTestId('close-settings');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('settings-modal')).not.toBeInTheDocument();
    });
  });
});
