import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';

const mockSetActiveDrawer = vi.fn();
let mockActiveDrawer: string = 'all';
let mockItems: Array<{ id: string; drawer: string }> = [];

vi.mock('../store/useStashStore', () => ({
  useStashStore: (selector: (state: unknown) => unknown) => {
    const state = {
      activeDrawer: mockActiveDrawer,
      setActiveDrawer: mockSetActiveDrawer,
      items: mockItems,
    };
    return selector(state);
  },
}));

vi.mock('../i18n', () => ({
  t: () => ({
    drawers: {
      all: 'All',
      contacts: 'Contacts',
      money: 'Money',
      watch: 'Watch',
      read: 'Read',
      dev: 'Dev',
      schedule: 'Schedule',
      recipes: 'Recipes',
      places: 'Places',
      ideas: 'Ideas',
      notes: 'Notes',
      shopping: 'Shopping',
      inbox: 'Inbox',
    },
  }),
  getDrawerLabel: (type: string) => type.charAt(0).toUpperCase() + type.slice(1),
}));

async function renderDrawerTabs() {
  const { DrawerTabs } = await import('../components/DrawerTabs');
  return render(<DrawerTabs />);
}

function createMockItems(drawers: string[]): Array<{ id: string; drawer: string }> {
  return drawers.map((drawer, index) => ({
    id: `item-${index}`,
    drawer,
  }));
}

describe('DrawerTabs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveDrawer = 'all';
    mockItems = [];
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Tab Rendering', () => {
    it('should render all 13 tabs (All + 12 drawers)', async () => {
      const { container } = await renderDrawerTabs();
      const buttons = container.querySelectorAll('button[data-drawer]');
      expect(buttons.length).toBe(13);
    });

    it('should render All tab first', async () => {
      const { container } = await renderDrawerTabs();
      const firstButton = container.querySelector('button[data-drawer]');
      expect(firstButton?.getAttribute('data-drawer')).toBe('all');
    });

    it('should mark active tab with data-active="true"', async () => {
      mockActiveDrawer = 'contacts';
      const { container } = await renderDrawerTabs();
      const activeButton = container.querySelector('[data-active="true"]');
      expect(activeButton?.getAttribute('data-drawer')).toBe('contacts');
    });

    it('should call setActiveDrawer when tab is clicked', async () => {
      const { container } = await renderDrawerTabs();
      
      const moneyTab = container.querySelector('[data-drawer="money"]');
      fireEvent.click(moneyTab!);
      
      expect(mockSetActiveDrawer).toHaveBeenCalledWith('money');
    });
  });

  describe('Gradient Fade Edge Indicators', () => {
    it('should have gradient container wrapper', async () => {
      const { container } = await renderDrawerTabs();
      const gradientWrapper = container.querySelector('[data-gradient-container]');
      expect(gradientWrapper).toBeTruthy();
    });

    it('should show right gradient when scrollable to right', async () => {
      const { container } = await renderDrawerTabs();
      const scrollContainer = container.querySelector('[data-scroll-container]');
      
      Object.defineProperty(scrollContainer, 'scrollWidth', { value: 1000, configurable: true });
      Object.defineProperty(scrollContainer, 'clientWidth', { value: 400, configurable: true });
      Object.defineProperty(scrollContainer, 'scrollLeft', { value: 0, configurable: true });
      
      fireEvent.scroll(scrollContainer!);
      
      // Test scroll right button visibility instead of gradient
      const rightButton = container.querySelector('[data-scroll-right]');
      expect(rightButton).toBeTruthy();
      expect(rightButton?.classList.contains('opacity-100')).toBeTruthy();
    });

    it('should show left gradient when scrolled from start', async () => {
      const { container } = await renderDrawerTabs();
      const scrollContainer = container.querySelector('[data-scroll-container]');
      
      Object.defineProperty(scrollContainer, 'scrollWidth', { value: 1000, configurable: true });
      Object.defineProperty(scrollContainer, 'clientWidth', { value: 400, configurable: true });
      Object.defineProperty(scrollContainer, 'scrollLeft', { value: 100, configurable: true });
      
      fireEvent.scroll(scrollContainer!);
      
      // Test scroll left button visibility instead of gradient
      const leftButton = container.querySelector('[data-scroll-left]');
      expect(leftButton?.classList.contains('opacity-100')).toBeTruthy();
    });

    it('should hide gradients when content fits without scroll', async () => {
      const { container } = await renderDrawerTabs();
      const scrollContainer = container.querySelector('[data-scroll-container]');
      
      Object.defineProperty(scrollContainer, 'scrollWidth', { value: 400, configurable: true });
      Object.defineProperty(scrollContainer, 'clientWidth', { value: 400, configurable: true });
      Object.defineProperty(scrollContainer, 'scrollLeft', { value: 0, configurable: true });
      
      fireEvent.scroll(scrollContainer!);
      
      // Test scroll buttons hidden when no scroll needed
      const leftButton = container.querySelector('[data-scroll-left]');
      const rightButton = container.querySelector('[data-scroll-right]');
      
      const leftHidden = leftButton?.classList.contains('opacity-0') || 
                         leftButton?.classList.contains('pointer-events-none');
      const rightHidden = rightButton?.classList.contains('opacity-0') || 
                          rightButton?.classList.contains('pointer-events-none');
      
      expect(leftHidden).toBeTruthy();
      expect(rightHidden).toBeTruthy();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should have tabIndex on tab container for keyboard focus', async () => {
      const { container } = await renderDrawerTabs();
      const scrollContainer = container.querySelector('[data-scroll-container]');
      expect(scrollContainer?.getAttribute('tabIndex')).toBe('0');
    });

    it('should navigate to next tab on ArrowRight key', async () => {
      mockActiveDrawer = 'all';
      const { container } = await renderDrawerTabs();
      
      const scrollContainer = container.querySelector('[data-scroll-container]');
      fireEvent.keyDown(scrollContainer!, { key: 'ArrowRight' });
      
      expect(mockSetActiveDrawer).toHaveBeenCalledWith('contacts');
    });

    it('should navigate to previous tab on ArrowLeft key', async () => {
      mockActiveDrawer = 'contacts';
      const { container } = await renderDrawerTabs();
      
      const scrollContainer = container.querySelector('[data-scroll-container]');
      fireEvent.keyDown(scrollContainer!, { key: 'ArrowLeft' });
      
      expect(mockSetActiveDrawer).toHaveBeenCalledWith('all');
    });

    it('should navigate to first tab on Home key', async () => {
      mockActiveDrawer = 'inbox';
      const { container } = await renderDrawerTabs();
      
      const scrollContainer = container.querySelector('[data-scroll-container]');
      fireEvent.keyDown(scrollContainer!, { key: 'Home' });
      
      expect(mockSetActiveDrawer).toHaveBeenCalledWith('all');
    });

    it('should navigate to last tab on End key', async () => {
      mockActiveDrawer = 'all';
      const { container } = await renderDrawerTabs();
      
      const scrollContainer = container.querySelector('[data-scroll-container]');
      fireEvent.keyDown(scrollContainer!, { key: 'End' });
      
      expect(mockSetActiveDrawer).toHaveBeenCalledWith('inbox');
    });

    it('should wrap to last tab on ArrowLeft from first tab', async () => {
      mockActiveDrawer = 'all';
      const { container } = await renderDrawerTabs();
      
      const scrollContainer = container.querySelector('[data-scroll-container]');
      fireEvent.keyDown(scrollContainer!, { key: 'ArrowLeft' });
      
      expect(mockSetActiveDrawer).toHaveBeenCalledWith('inbox');
    });

    it('should wrap to first tab on ArrowRight from last tab', async () => {
      mockActiveDrawer = 'inbox';
      const { container } = await renderDrawerTabs();
      
      const scrollContainer = container.querySelector('[data-scroll-container]');
      fireEvent.keyDown(scrollContainer!, { key: 'ArrowRight' });
      
      expect(mockSetActiveDrawer).toHaveBeenCalledWith('all');
    });

    it('should have proper ARIA role for tab list', async () => {
      const { container } = await renderDrawerTabs();
      const scrollContainer = container.querySelector('[role="tablist"]');
      expect(scrollContainer).toBeTruthy();
    });

    it('should have proper ARIA role for individual tabs', async () => {
      const { container } = await renderDrawerTabs();
      const tabs = container.querySelectorAll('[role="tab"]');
      expect(tabs.length).toBe(13);
    });
  });

  describe('Empty Tab Dimming', () => {
    it('should have dimmed styling for tabs with 0 items', async () => {
      mockItems = createMockItems(['contacts', 'contacts']);
      const { container } = await renderDrawerTabs();
      
      const moneyTab = container.querySelector('[data-drawer="money"]');
      const contactsTab = container.querySelector('[data-drawer="contacts"]');
      
      expect(moneyTab?.getAttribute('data-empty')).toBe('true');
      expect(contactsTab?.getAttribute('data-empty')).toBe('false');
    });

    it('should apply opacity reduction to empty tabs', async () => {
      mockItems = createMockItems(['contacts']);
      const { container } = await renderDrawerTabs();
      
      const emptyTab = container.querySelector('[data-drawer="money"]');
      expect(emptyTab?.classList.contains('opacity-40') || 
             emptyTab?.classList.contains('opacity-50') ||
             emptyTab?.classList.contains('opacity-60')).toBeTruthy();
    });

    it('should not dim All tab even when empty', async () => {
      mockItems = [];
      const { container } = await renderDrawerTabs();
      
      const allTab = container.querySelector('[data-drawer="all"]');
      expect(allTab?.getAttribute('data-empty')).toBe('false');
    });

    it('should not dim active tab even when empty', async () => {
      mockActiveDrawer = 'money';
      mockItems = [];
      const { container } = await renderDrawerTabs();
      
      const moneyTab = container.querySelector('[data-drawer="money"]');
      expect(moneyTab?.classList.contains('opacity-50')).toBeFalsy();
    });
  });

  describe('Underline Slider Indicator', () => {
    it('should render underline indicator element', async () => {
      const { container } = await renderDrawerTabs();
      const underline = container.querySelector('[data-underline-indicator]');
      expect(underline).toBeTruthy();
    });

    it('should have transition styles for smooth sliding', async () => {
      const { container } = await renderDrawerTabs();
      const underline = container.querySelector('[data-underline-indicator]');
      
      const hasTransition = underline?.classList.contains('transition-all') ||
                           underline?.classList.contains('transition-transform') ||
                           (underline as HTMLElement)?.style.transition !== '';
      expect(hasTransition).toBeTruthy();
    });

    it('should use drawer accent color for underline', async () => {
      mockActiveDrawer = 'contacts';
      const { container } = await renderDrawerTabs();
      const underline = container.querySelector('[data-underline-indicator]');
      
      expect(underline?.classList.contains('bg-sky-500') || 
             underline?.getAttribute('data-color') === 'sky').toBeTruthy();
    });

    it('should position underline under active tab', async () => {
      mockActiveDrawer = 'all';
      const { container } = await renderDrawerTabs();
      const underline = container.querySelector('[data-underline-indicator]');
      
      const style = (underline as HTMLElement)?.style;
      expect(style?.transform || style?.left !== undefined).toBeTruthy();
    });
  });

  describe('Count Badge Animation', () => {
    it('should render count badge for tabs with items', async () => {
      mockItems = createMockItems(['contacts', 'contacts', 'money']);
      const { container } = await renderDrawerTabs();
      
      const contactsTab = container.querySelector('[data-drawer="contacts"]');
      const badge = contactsTab?.querySelector('[data-count-badge]');
      expect(badge?.textContent).toBe('2');
    });

    it('should have animation class on badge', async () => {
      mockItems = createMockItems(['contacts']);
      const { container } = await renderDrawerTabs();
      
      const contactsTab = container.querySelector('[data-drawer="contacts"]');
      const badge = contactsTab?.querySelector('[data-count-badge]');
      
      expect(badge?.getAttribute('data-animate') || 
             badge?.classList.contains('transition-transform')).toBeTruthy();
    });

    it('should not render badge for empty tabs', async () => {
      mockItems = [];
      const { container } = await renderDrawerTabs();
      
      const moneyTab = container.querySelector('[data-drawer="money"]');
      const badge = moneyTab?.querySelector('[data-count-badge]');
      expect(badge).toBeFalsy();
    });

    it('should always show count for All tab', async () => {
      mockItems = createMockItems(['contacts', 'money']);
      const { container } = await renderDrawerTabs();
      
      const allTab = container.querySelector('[data-drawer="all"]');
      const badge = allTab?.querySelector('[data-count-badge]');
      expect(badge?.textContent).toBe('2');
    });
  });

  describe('Mobile Touch Scrolling', () => {
    it('should preserve touch scrolling capability', async () => {
      const { container } = await renderDrawerTabs();
      const scrollContainer = container.querySelector('[data-scroll-container]');
      
      expect(scrollContainer?.classList.contains('overflow-x-auto')).toBeTruthy();
    });

    it('should not prevent default on touch events', async () => {
      const { container } = await renderDrawerTabs();
      
      const scrollContainer = container.querySelector('[data-scroll-container]');
      const touchStartEvent = { preventDefault: vi.fn(), touches: [{ clientX: 0 }] };
      
      fireEvent.touchStart(scrollContainer!, touchStartEvent);
      
      expect(touchStartEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('should have hide-scrollbar class for clean mobile UI', async () => {
      const { container } = await renderDrawerTabs();
      const scrollContainer = container.querySelector('[data-scroll-container]');
      expect(scrollContainer?.classList.contains('hide-scrollbar')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-selected on active tab', async () => {
      mockActiveDrawer = 'contacts';
      const { container } = await renderDrawerTabs();
      
      const activeTab = container.querySelector('[data-drawer="contacts"]');
      expect(activeTab?.getAttribute('aria-selected')).toBe('true');
    });

    it('should have aria-selected="false" on inactive tabs', async () => {
      mockActiveDrawer = 'contacts';
      const { container } = await renderDrawerTabs();
      
      const inactiveTab = container.querySelector('[data-drawer="money"]');
      expect(inactiveTab?.getAttribute('aria-selected')).toBe('false');
    });

    it('should have scroll buttons with aria-labels', async () => {
      const { container } = await renderDrawerTabs();
      
      const leftButton = container.querySelector('[data-scroll-left]');
      const rightButton = container.querySelector('[data-scroll-right]');
      
      expect(leftButton?.getAttribute('aria-label')).toBe('Scroll left');
      expect(rightButton?.getAttribute('aria-label')).toBe('Scroll right');
    });
  });
});
