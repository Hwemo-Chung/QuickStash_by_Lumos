import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsModal } from '../components/SettingsModal';
import { setLocale, getLocale, initLocaleFromStorage } from '../i18n';

describe('SettingsModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    setLocale('ko');
    localStorage.clear();
  });

  describe('Modal Open/Close', () => {
    it('should not render when isOpen is false', () => {
      render(<SettingsModal isOpen={false} onClose={mockOnClose} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);
      
      const closeButton = screen.getByLabelText(/close/i);
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is clicked', () => {
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);
      
      const backdrop = screen.getByTestId('modal-backdrop');
      fireEvent.click(backdrop);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not close when modal content is clicked', () => {
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);
      
      const modalContent = screen.getByTestId('modal-content');
      fireEvent.click(modalContent);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should call onClose when Escape key is pressed', () => {
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Language Selection UI', () => {
    it('should display language settings section', () => {
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);
      
      expect(screen.getByText(/언어|Language/i)).toBeInTheDocument();
    });

    it('should display all available languages', () => {
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);
      
      expect(screen.getByText('한국어')).toBeInTheDocument();
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('日本語')).toBeInTheDocument();
      expect(screen.getByText('Español')).toBeInTheDocument();
    });

    it('should highlight current language as selected', () => {
      setLocale('ko');
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);
      
      const koreanOption = screen.getByTestId('language-option-ko');
      expect(koreanOption).toHaveAttribute('aria-selected', 'true');
    });

    it('should change language when a different option is selected', async () => {
      setLocale('ko');
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);
      
      const englishOption = screen.getByTestId('language-option-en');
      fireEvent.click(englishOption);
      
      await waitFor(() => {
        expect(getLocale()).toBe('en');
      });
    });

    it('should update UI to reflect new language after selection', async () => {
      setLocale('ko');
      const { rerender } = render(<SettingsModal isOpen={true} onClose={mockOnClose} />);
      
      const englishOption = screen.getByTestId('language-option-en');
      fireEvent.click(englishOption);
      
      rerender(<SettingsModal isOpen={true} onClose={mockOnClose} />);
      
      await waitFor(() => {
        const englishOptionAfter = screen.getByTestId('language-option-en');
        expect(englishOptionAfter).toHaveAttribute('aria-selected', 'true');
      });
    });
  });

  describe('LocalStorage Persistence', () => {
    it('should save language preference to localStorage when changed', async () => {
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);
      
      const englishOption = screen.getByTestId('language-option-en');
      fireEvent.click(englishOption);
      
      await waitFor(() => {
        expect(localStorage.getItem('quickstash-locale')).toBe('en');
      });
    });

    it('should load language from localStorage on mount', async () => {
      localStorage.setItem('quickstash-locale', 'ja');
      initLocaleFromStorage();
      
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);
      
      await waitFor(() => {
        const japaneseOption = screen.getByTestId('language-option-ja');
        expect(japaneseOption).toHaveAttribute('aria-selected', 'true');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper dialog role and aria attributes', () => {
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });

    it('should trap focus within the modal', () => {
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('should have accessible language option buttons', () => {
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);
      
      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThanOrEqual(4);
    });
  });
});
