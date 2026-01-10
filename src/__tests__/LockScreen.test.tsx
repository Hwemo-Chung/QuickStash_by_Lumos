import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LockScreen } from '../components/LockScreen';
import * as security from '../lib/security';
import type { SecuritySettings } from '../types';

vi.mock('../lib/security', async () => {
  const actual = await vi.importActual('../lib/security');
  return {
    ...actual,
    verifyPin: vi.fn(),
  };
});

vi.mock('../i18n', () => ({
  t: () => ({
    lockScreen: {
      title: 'QuickStash',
      subtitle: 'Enter your PIN to unlock',
      wrongPin: 'Wrong PIN',
      attemptsRemaining: 'attempts remaining',
      forgotPin: 'Forgot PIN? After 10 failed attempts, all data will be erased.',
    },
  }),
}));

describe('LockScreen', () => {
  const mockOnUnlock = vi.fn();
  const mockOnSecurityUpdate = vi.fn();
  const mockOnWipe = vi.fn();
  
  const defaultSecurity: SecuritySettings = {
    id: 'main',
    pinHash: 'hash123',
    pinSalt: 'salt123',
    failedAttempts: 0,
    isEnabled: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderLockScreen = (securityOverrides?: Partial<SecuritySettings>) => {
    return render(
      <LockScreen
        security={{ ...defaultSecurity, ...securityOverrides }}
        onUnlock={mockOnUnlock}
        onSecurityUpdate={mockOnSecurityUpdate}
        onWipe={mockOnWipe}
      />
    );
  };

  describe('Visual Elements', () => {
    it('should render with gradient mesh background', () => {
      renderLockScreen();
      const container = screen.getByTestId('lock-screen');
      expect(container).toHaveClass('lock-screen-bg');
    });

    it('should render title and subtitle', () => {
      renderLockScreen();
      expect(screen.getByText('QuickStash')).toBeInTheDocument();
      expect(screen.getByText('Enter your PIN to unlock')).toBeInTheDocument();
    });

    it('should render 4 PIN dots', () => {
      renderLockScreen();
      const dots = screen.getAllByTestId('pin-dot');
      expect(dots).toHaveLength(4);
    });

    it('should render all keypad buttons (0-9 and delete)', () => {
      renderLockScreen();
      for (let i = 0; i <= 9; i++) {
        expect(screen.getByRole('button', { name: String(i) })).toBeInTheDocument();
      }
      expect(screen.getByTestId('delete-button')).toBeInTheDocument();
    });
  });

  describe('PIN Dot Animation', () => {
    it('should show empty dots initially', () => {
      renderLockScreen();
      const dots = screen.getAllByTestId('pin-dot');
      dots.forEach((dot: HTMLElement) => {
        expect(dot).toHaveClass('pin-dot-empty');
        expect(dot).not.toHaveClass('pin-dot-filled');
      });
    });

    it('should fill dots progressively when digits are entered', async () => {
      renderLockScreen();
      
      const button1 = screen.getByRole('button', { name: '1' });
      fireEvent.click(button1);
      
      const dots = screen.getAllByTestId('pin-dot');
      expect(dots[0]).toHaveClass('pin-dot-filled');
      expect(dots[1]).toHaveClass('pin-dot-empty');
      expect(dots[2]).toHaveClass('pin-dot-empty');
      expect(dots[3]).toHaveClass('pin-dot-empty');
    });

    it('should apply fill animation class when dot becomes filled', () => {
      renderLockScreen();
      
      const button1 = screen.getByRole('button', { name: '1' });
      fireEvent.click(button1);
      
      const dots = screen.getAllByTestId('pin-dot');
      expect(dots[0]).toHaveClass('animate-dot-fill');
    });

    it('should unfill dots when delete is pressed', async () => {
      renderLockScreen();
      
      const button1 = screen.getByRole('button', { name: '1' });
      const deleteButton = screen.getByTestId('delete-button');
      
      fireEvent.click(button1);
      fireEvent.click(button1);
      fireEvent.click(deleteButton);
      
      const dots = screen.getAllByTestId('pin-dot');
      expect(dots[0]).toHaveClass('pin-dot-filled');
      expect(dots[1]).toHaveClass('pin-dot-empty');
    });
  });

  describe('Keypad Button Feedback', () => {
    it('should apply press animation on button click', () => {
      renderLockScreen();
      const button5 = screen.getByRole('button', { name: '5' });
      
      expect(button5).toHaveClass('keypad-button');
      
      fireEvent.mouseDown(button5);
      expect(button5).toHaveClass('keypad-button-pressed');
      
      fireEvent.mouseUp(button5);
      expect(button5).not.toHaveClass('keypad-button-pressed');
    });

    it('should have proper hover state class', () => {
      renderLockScreen();
      const button7 = screen.getByRole('button', { name: '7' });
      expect(button7).toHaveClass('keypad-button');
    });

    it('should disable delete button when PIN is empty', () => {
      renderLockScreen();
      const deleteButton = screen.getByTestId('delete-button');
      expect(deleteButton).toBeDisabled();
    });

    it('should enable delete button when PIN has digits', () => {
      renderLockScreen();
      
      fireEvent.click(screen.getByRole('button', { name: '1' }));
      
      const deleteButton = screen.getByTestId('delete-button');
      expect(deleteButton).not.toBeDisabled();
    });
  });

  describe('Error State', () => {
    beforeEach(() => {
      vi.useRealTimers();
    });

    afterEach(() => {
      vi.useFakeTimers();
    });

    it('should show shake animation on wrong PIN', async () => {
      vi.mocked(security.verifyPin).mockResolvedValue({
        valid: false,
        failedAttempts: 1,
        shouldWipe: false,
        remainingAttempts: 9,
      });

      renderLockScreen();
      
      fireEvent.click(screen.getByRole('button', { name: '1' }));
      fireEvent.click(screen.getByRole('button', { name: '2' }));
      fireEvent.click(screen.getByRole('button', { name: '3' }));
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      
      await waitFor(() => {
        const dotsContainer = screen.getByTestId('pin-dots-container');
        expect(dotsContainer).toHaveClass('animate-shake');
      });
    });

    it('should show screen flash on error', async () => {
      vi.mocked(security.verifyPin).mockResolvedValue({
        valid: false,
        failedAttempts: 1,
        shouldWipe: false,
        remainingAttempts: 9,
      });

      renderLockScreen();
      
      fireEvent.click(screen.getByRole('button', { name: '1' }));
      fireEvent.click(screen.getByRole('button', { name: '2' }));
      fireEvent.click(screen.getByRole('button', { name: '3' }));
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      
      await waitFor(() => {
        const container = screen.getByTestId('lock-screen');
        expect(container).toHaveClass('animate-error-flash');
      });
    });

    it('should clear error flash after animation', async () => {
      vi.mocked(security.verifyPin).mockResolvedValue({
        valid: false,
        failedAttempts: 1,
        shouldWipe: false,
        remainingAttempts: 9,
      });

      renderLockScreen();
      
      fireEvent.click(screen.getByRole('button', { name: '1' }));
      fireEvent.click(screen.getByRole('button', { name: '2' }));
      fireEvent.click(screen.getByRole('button', { name: '3' }));
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      
      await waitFor(() => {
        const container = screen.getByTestId('lock-screen');
        expect(container).toHaveClass('animate-error-flash');
      });

      await waitFor(() => {
        const container = screen.getByTestId('lock-screen');
        expect(container).not.toHaveClass('animate-error-flash');
      }, { timeout: 1000 });
    });

    it('should display error message on wrong PIN', async () => {
      vi.mocked(security.verifyPin).mockResolvedValue({
        valid: false,
        failedAttempts: 1,
        shouldWipe: false,
        remainingAttempts: 9,
      });

      renderLockScreen();
      
      fireEvent.click(screen.getByRole('button', { name: '1' }));
      fireEvent.click(screen.getByRole('button', { name: '2' }));
      fireEvent.click(screen.getByRole('button', { name: '3' }));
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      
      await waitFor(() => {
        expect(screen.getByText('Wrong PIN')).toBeInTheDocument();
      });
    });
  });

  describe('Attempt Counter', () => {
    beforeEach(() => {
      vi.useRealTimers();
    });

    afterEach(() => {
      vi.useFakeTimers();
    });

    it('should display attempt counter when attempts remaining is 5 or less', async () => {
      vi.mocked(security.verifyPin).mockResolvedValue({
        valid: false,
        failedAttempts: 6,
        shouldWipe: false,
        remainingAttempts: 4,
      });

      renderLockScreen({ failedAttempts: 5 });
      
      fireEvent.click(screen.getByRole('button', { name: '1' }));
      fireEvent.click(screen.getByRole('button', { name: '2' }));
      fireEvent.click(screen.getByRole('button', { name: '3' }));
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      
      await waitFor(() => {
        const attemptCounter = screen.getByTestId('attempt-counter');
        expect(attemptCounter).toBeInTheDocument();
        expect(attemptCounter).toHaveTextContent('4');
      });
    });

    it('should show attempt counter with visual indicators', async () => {
      vi.mocked(security.verifyPin).mockResolvedValue({
        valid: false,
        failedAttempts: 8,
        shouldWipe: false,
        remainingAttempts: 2,
      });

      renderLockScreen({ failedAttempts: 7 });
      
      fireEvent.click(screen.getByRole('button', { name: '1' }));
      fireEvent.click(screen.getByRole('button', { name: '2' }));
      fireEvent.click(screen.getByRole('button', { name: '3' }));
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      
      await waitFor(() => {
        const attemptIndicators = screen.getAllByTestId('attempt-indicator');
        expect(attemptIndicators.length).toBeGreaterThan(0);
      });
    });

    it('should not show attempt counter when more than 5 attempts remaining', async () => {
      vi.mocked(security.verifyPin).mockResolvedValue({
        valid: false,
        failedAttempts: 1,
        shouldWipe: false,
        remainingAttempts: 9,
      });

      renderLockScreen();
      
      fireEvent.click(screen.getByRole('button', { name: '1' }));
      fireEvent.click(screen.getByRole('button', { name: '2' }));
      fireEvent.click(screen.getByRole('button', { name: '3' }));
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      
      await waitFor(() => {
        expect(screen.queryByTestId('attempt-counter')).not.toBeInTheDocument();
      });
    });
  });

  describe('Entrance Animation', () => {
    it('should apply staggered entrance animation to elements', () => {
      renderLockScreen();
      
      const title = screen.getByText('QuickStash');
      const subtitle = screen.getByText('Enter your PIN to unlock');
      
      expect(title).toHaveClass('animate-entrance');
      expect(subtitle).toHaveClass('animate-entrance');
    });

    it('should have different animation delays for staggered effect', () => {
      renderLockScreen();
      
      const title = screen.getByText('QuickStash');
      const subtitle = screen.getByText('Enter your PIN to unlock');
      const dotsContainer = screen.getByTestId('pin-dots-container');
      
      expect(title).toHaveStyle({ animationDelay: '0ms' });
      expect(subtitle).toHaveStyle({ animationDelay: '50ms' });
      expect(dotsContainer).toHaveStyle({ animationDelay: '100ms' });
    });

    it('should apply entrance animation to keypad with staggered delays', () => {
      renderLockScreen();
      
      const keypadButtons = screen.getAllByRole('button').filter((btn: HTMLElement) => 
        btn.textContent && /^[0-9]$/.test(btn.textContent)
      );
      
      keypadButtons.forEach((button: HTMLElement) => {
        expect(button.closest('[data-testid="keypad-row"]') || button).toHaveClass('animate-entrance');
      });
    });
  });

  describe('Security Behavior', () => {
    beforeEach(() => {
      vi.useRealTimers();
    });

    afterEach(() => {
      vi.useFakeTimers();
    });

    it('should call onUnlock when correct PIN is entered', async () => {
      vi.mocked(security.verifyPin).mockResolvedValue({
        valid: true,
        failedAttempts: 0,
        shouldWipe: false,
        remainingAttempts: 10,
      });

      renderLockScreen();
      
      fireEvent.click(screen.getByRole('button', { name: '1' }));
      fireEvent.click(screen.getByRole('button', { name: '2' }));
      fireEvent.click(screen.getByRole('button', { name: '3' }));
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      
      await waitFor(() => {
        expect(mockOnUnlock).toHaveBeenCalled();
        expect(mockOnSecurityUpdate).toHaveBeenCalledWith({ failedAttempts: 0 });
      });
    });

    it('should call onWipe when shouldWipe is true', async () => {
      vi.mocked(security.verifyPin).mockResolvedValue({
        valid: false,
        failedAttempts: 10,
        shouldWipe: true,
        remainingAttempts: 0,
      });

      renderLockScreen({ failedAttempts: 9 });
      
      fireEvent.click(screen.getByRole('button', { name: '1' }));
      fireEvent.click(screen.getByRole('button', { name: '2' }));
      fireEvent.click(screen.getByRole('button', { name: '3' }));
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      
      await waitFor(() => {
        expect(mockOnWipe).toHaveBeenCalled();
      });
    });

    it('should not allow more than 4 digits', () => {
      renderLockScreen();
      
      for (let i = 0; i < 6; i++) {
        fireEvent.click(screen.getByRole('button', { name: '1' }));
      }
      
      const filledDots = screen.getAllByTestId('pin-dot').filter(
        (dot: HTMLElement) => dot.classList.contains('pin-dot-filled')
      );
      expect(filledDots.length).toBeLessThanOrEqual(4);
    });

    it('should clear PIN after wrong attempt', async () => {
      vi.mocked(security.verifyPin).mockResolvedValue({
        valid: false,
        failedAttempts: 1,
        shouldWipe: false,
        remainingAttempts: 9,
      });

      renderLockScreen();
      
      fireEvent.click(screen.getByRole('button', { name: '1' }));
      fireEvent.click(screen.getByRole('button', { name: '2' }));
      fireEvent.click(screen.getByRole('button', { name: '3' }));
      fireEvent.click(screen.getByRole('button', { name: '4' }));
      
      await waitFor(() => {
        const dots = screen.getAllByTestId('pin-dot');
        dots.forEach((dot: HTMLElement) => {
          expect(dot).toHaveClass('pin-dot-empty');
        });
      });
    });
  });
});
