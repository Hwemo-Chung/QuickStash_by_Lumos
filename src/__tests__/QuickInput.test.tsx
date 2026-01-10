import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockAddItem = vi.fn().mockResolvedValue({ item: { id: '1' }, isDuplicate: false });

vi.mock('../store/useStashStore', () => ({
  useStashStore: (selector: (state: unknown) => unknown) => {
    const state = {
      addItem: mockAddItem,
    };
    return selector(state);
  },
}));

vi.mock('../lib/classifier', () => ({
  classify: vi.fn((content: string) => {
    if (content.includes('youtube.com')) return 'watch';
    if (content.includes('github.com')) return 'dev';
    if (content.includes('@') && content.includes('.')) return 'contacts';
    return 'ideas';
  }),
}));

vi.mock('../lib/datePrefix', () => ({
  generateDatePrefix: vi.fn(() => '2024-01-15'),
  shouldAutoPrefix: vi.fn(() => false),
}));

vi.mock('../lib/genreExtractor', () => ({
  extractGenreFromUrl: vi.fn(() => null),
  getAvailableGenres: vi.fn(() => ['Drama', 'Comedy', 'Action']),
}));

vi.mock('../lib/placeExtractor', () => ({
  extractPlaceFromUrl: vi.fn(() => null),
  getMapSourceEmoji: vi.fn(() => '📍'),
  formatPlaceTitle: vi.fn(() => 'Test Place'),
}));

vi.mock('../i18n', () => ({
  t: () => ({
    quickInput: {
      placeholder: 'Paste anything...',
      titlePlaceholder: 'Add title',
      addTitle: 'Add title',
      willSaveTo: 'Will be saved to',
      saving: 'Saving...',
      mapLinkDetected: 'Map link detected',
      titleLabel: 'Title',
      autoSaveIn: 'Auto-save in {seconds}s',
      autoSavePaused: 'Auto-save paused',
      saved: 'Saved!',
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      confirm: 'Confirm',
    },
  }),
  getDrawerLabel: (type: string) => type.charAt(0).toUpperCase() + type.slice(1),
  getDrawerInputConfig: () => ({
    label: 'Title',
    placeholder: 'Enter title',
  }),
}));

async function renderQuickInput() {
  vi.resetModules();
  const { QuickInput } = await import('../components/QuickInput');
  const { render } = await import('@testing-library/react');
  return render(<QuickInput />);
}

describe('QuickInput', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render textarea with placeholder', async () => {
      const { container } = await renderQuickInput();
      const textarea = container.querySelector('textarea');
      expect(textarea).toBeTruthy();
    });

    it('should render submit button', async () => {
      const { container } = await renderQuickInput();
      const button = container.querySelector('button');
      expect(button).toBeTruthy();
    });
  });

  describe('Classification Confidence Indicator', () => {
    it('should show detecting state when typing', async () => {
      const { container } = await renderQuickInput();
      const { fireEvent, act } = await import('@testing-library/react');
      const textarea = container.querySelector('textarea')!;
      
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'https://youtube.com/watch?v=123' } });
      });

      const detectingIndicator = container.querySelector('[data-testid="classification-detecting"]');
      expect(detectingIndicator).toBeTruthy();
    });

    it('should show detected drawer after debounce', async () => {
      const { container } = await renderQuickInput();
      const { fireEvent, act } = await import('@testing-library/react');
      const textarea = container.querySelector('textarea')!;
      
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'https://youtube.com/watch?v=123' } });
      });

      await act(async () => {
        vi.advanceTimersByTime(350);
      });

      const detectedIndicator = container.querySelector('[data-testid="classification-detected"]');
      expect(detectedIndicator).toBeTruthy();
    });

    it('should show confidence indicator with drawer color', async () => {
      const { container } = await renderQuickInput();
      const { fireEvent, act } = await import('@testing-library/react');
      const textarea = container.querySelector('textarea')!;
      
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'https://youtube.com/watch?v=123' } });
        vi.advanceTimersByTime(350);
      });

      const indicator = container.querySelector('[data-testid="confidence-indicator"]');
      expect(indicator).toBeTruthy();
    });
  });

  describe('Keyboard Shortcut Hints', () => {
    it('should show Tab hint when content has detected drawer', async () => {
      const { container } = await renderQuickInput();
      const { fireEvent, act } = await import('@testing-library/react');
      const textarea = container.querySelector('textarea')!;
      
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'https://youtube.com/watch?v=123' } });
        vi.advanceTimersByTime(350);
      });

      const tabHint = container.querySelector('[data-testid="tab-hint"]');
      expect(tabHint).toBeTruthy();
    });

    it('should show Enter hint for submit when content exists', async () => {
      const { container } = await renderQuickInput();
      const { fireEvent, act } = await import('@testing-library/react');
      const textarea = container.querySelector('textarea')!;
      
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'some content' } });
        vi.advanceTimersByTime(350);
      });

      const enterHint = container.querySelector('[data-testid="enter-hint"]');
      expect(enterHint).toBeTruthy();
    });

    it('should hide Tab hint when title field is visible', async () => {
      const { container } = await renderQuickInput();
      const { fireEvent, act } = await import('@testing-library/react');
      const textarea = container.querySelector('textarea')!;
      
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'https://youtube.com/watch?v=123' } });
        vi.advanceTimersByTime(350);
      });

      const tabHintBefore = container.querySelector('[data-testid="tab-hint"]');
      expect(tabHintBefore).toBeTruthy();

      await act(async () => {
        fireEvent.keyDown(textarea, { key: 'Tab' });
      });

      const tabHintAfter = container.querySelector('[data-testid="tab-hint"]');
      expect(tabHintAfter).toBeFalsy();
    });
  });

  describe('ARIA Accessibility', () => {
    it('should have aria-label on textarea', async () => {
      const { container } = await renderQuickInput();
      const textarea = container.querySelector('textarea');
      expect(textarea?.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have aria-live region for classification announcements', async () => {
      const { container } = await renderQuickInput();
      const liveRegion = container.querySelector('[data-testid="aria-live-region"]');
      expect(liveRegion?.getAttribute('aria-live')).toBe('polite');
    });

    it('should announce classification result to screen readers', async () => {
      const { container } = await renderQuickInput();
      const { fireEvent, act } = await import('@testing-library/react');
      const textarea = container.querySelector('textarea')!;
      
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'https://youtube.com/watch?v=123' } });
        vi.advanceTimersByTime(350);
      });

      const liveRegion = container.querySelector('[data-testid="aria-live-region"]');
      expect(liveRegion?.textContent).toContain('Watch');
    });

    it('should have aria-describedby linking to keyboard hints', async () => {
      const { container } = await renderQuickInput();
      const { fireEvent, act } = await import('@testing-library/react');
      const textarea = container.querySelector('textarea')!;
      
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'https://youtube.com/watch?v=123' } });
        vi.advanceTimersByTime(350);
      });

      expect(textarea.getAttribute('aria-describedby')).toBeTruthy();
    });
  });

  describe('Thinking Pulse Animation', () => {
    it('should show pulse animation during classification', async () => {
      const { container } = await renderQuickInput();
      const { fireEvent, act } = await import('@testing-library/react');
      const textarea = container.querySelector('textarea')!;
      
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'some content' } });
      });

      const pulse = container.querySelector('[data-testid="thinking-pulse"]');
      expect(pulse).toBeTruthy();
    });

    it('should hide pulse after classification completes', async () => {
      const { container } = await renderQuickInput();
      const { fireEvent, act } = await import('@testing-library/react');
      const textarea = container.querySelector('textarea')!;
      
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'some content' } });
      });

      await act(async () => {
        vi.advanceTimersByTime(350);
      });

      const pulse = container.querySelector('[data-testid="thinking-pulse"]');
      expect(pulse).toBeFalsy();
    });
  });

  describe('Enhanced Paste Experience', () => {
    it('should show visual feedback on paste', async () => {
      const { container } = await renderQuickInput();
      const { fireEvent, act } = await import('@testing-library/react');
      const textarea = container.querySelector('textarea')!;
      
      await act(async () => {
        fireEvent.paste(textarea, {
          clipboardData: { getData: () => 'https://youtube.com/watch?v=123' },
        });
      });

      const feedback = container.querySelector('[data-testid="paste-feedback"]');
      expect(feedback).toBeTruthy();
    });

    it('should auto-detect content type after paste', async () => {
      const { container } = await renderQuickInput();
      const { fireEvent, act } = await import('@testing-library/react');
      const textarea = container.querySelector('textarea')!;
      
      await act(async () => {
        fireEvent.paste(textarea, {
          clipboardData: { getData: () => 'https://youtube.com/watch?v=123' },
        });
        fireEvent.change(textarea, { target: { value: 'https://youtube.com/watch?v=123' } });
        vi.advanceTimersByTime(350);
      });

      const detected = container.querySelector('[data-testid="classification-detected"]');
      expect(detected).toBeTruthy();
    });
  });

  describe('Classification States Visual Feedback', () => {
    it('should not show classification indicator when no content', async () => {
      const { container } = await renderQuickInput();
      const indicator = container.querySelector('[data-testid="classification-indicator"]');
      expect(indicator).toBeFalsy();
    });

    it('should transition from detecting to detected smoothly', async () => {
      const { container } = await renderQuickInput();
      const { fireEvent, act } = await import('@testing-library/react');
      const textarea = container.querySelector('textarea')!;
      
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'https://github.com/user/repo' } });
      });

      const detecting = container.querySelector('[data-testid="classification-detecting"]');
      expect(detecting).toBeTruthy();

      await act(async () => {
        vi.advanceTimersByTime(350);
      });

      const detected = container.querySelector('[data-testid="classification-detected"]');
      const detectingAfter = container.querySelector('[data-testid="classification-detecting"]');
      expect(detected).toBeTruthy();
      expect(detectingAfter).toBeFalsy();
    });
  });

  describe('Integration Tests', () => {
    it('should complete full flow: type, detect, add title', async () => {
      const { container } = await renderQuickInput();
      const { fireEvent, act } = await import('@testing-library/react');
      const textarea = container.querySelector('textarea')!;
      
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'https://youtube.com/watch?v=123' } });
        vi.advanceTimersByTime(350);
      });

      const detected = container.querySelector('[data-testid="classification-detected"]');
      expect(detected).toBeTruthy();

      await act(async () => {
        fireEvent.keyDown(textarea, { key: 'Tab' });
      });

      const titleInput = container.querySelector('input[type="text"]');
      expect(titleInput).toBeTruthy();
    });

    it('should maintain existing functionality while adding UX improvements', async () => {
      const { container } = await renderQuickInput();
      const { fireEvent, act } = await import('@testing-library/react');
      const textarea = container.querySelector('textarea')!;
      const submitButton = container.querySelector('button')!;
      
      expect(submitButton.disabled).toBe(true);
      
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'test content' } });
      });
      
      expect(submitButton.disabled).toBe(false);
    });
  });

  describe('Auto-save Feature', () => {
    it('should show auto-save countdown after content is entered', async () => {
      const { container } = await renderQuickInput();
      const { fireEvent, act } = await import('@testing-library/react');
      const textarea = container.querySelector('textarea')!;
      
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'https://youtube.com/watch?v=123' } });
      });
      
      await act(async () => {
        vi.advanceTimersByTime(350);
      });
      
      const autoSaveIndicator = container.querySelector('[data-testid="auto-save-indicator"]');
      expect(autoSaveIndicator).toBeTruthy();
    });

    it('should hide auto-save indicator and restart countdown when typing more', async () => {
      const { container } = await renderQuickInput();
      const { fireEvent, act } = await import('@testing-library/react');
      const textarea = container.querySelector('textarea')!;
      
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'test' } });
      });
      
      await act(async () => {
        vi.advanceTimersByTime(350);
      });
      
      const indicatorBefore = container.querySelector('[data-testid="auto-save-indicator"]');
      expect(indicatorBefore).toBeTruthy();
      
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'test more content' } });
      });
      
      const indicatorDuringTyping = container.querySelector('[data-testid="auto-save-indicator"]');
      expect(indicatorDuringTyping).toBeFalsy();
      
      await act(async () => {
        vi.advanceTimersByTime(350);
      });
      
      const indicatorAfterDetection = container.querySelector('[data-testid="auto-save-indicator"]');
      expect(indicatorAfterDetection).toBeTruthy();
    });

    it('should auto-save after countdown reaches zero', async () => {
      mockAddItem.mockClear();
      const { container } = await renderQuickInput();
      const { fireEvent, act } = await import('@testing-library/react');
      const textarea = container.querySelector('textarea')!;
      
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'https://youtube.com/watch?v=123' } });
      });
      
      await act(async () => {
        vi.advanceTimersByTime(350);
      });
      
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      
      expect(mockAddItem).toHaveBeenCalled();
    });

    it('should show saved feedback after auto-save', async () => {
      mockAddItem.mockClear();
      const { container } = await renderQuickInput();
      const { fireEvent, act } = await import('@testing-library/react');
      const textarea = container.querySelector('textarea')!;
      
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'https://youtube.com/watch?v=123' } });
      });
      
      await act(async () => {
        vi.advanceTimersByTime(350);
      });
      
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      
      const savedFeedback = container.querySelector('[data-testid="saved-feedback"]');
      expect(savedFeedback).toBeTruthy();
    });

    it('should show progress bar during auto-save countdown', async () => {
      const { container } = await renderQuickInput();
      const { fireEvent, act } = await import('@testing-library/react');
      const textarea = container.querySelector('textarea')!;
      
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'https://youtube.com/watch?v=123' } });
      });
      
      await act(async () => {
        vi.advanceTimersByTime(350);
      });
      
      const progressBar = container.querySelector('[data-testid="auto-save-progress"]');
      expect(progressBar).toBeTruthy();
    });
  });
});
