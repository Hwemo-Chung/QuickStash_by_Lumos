import { useState, useCallback } from 'react';
import { verifyPin, type VerifyResult } from '../lib/security';
import { t } from '../i18n';
import type { SecuritySettings } from '../types';

interface LockScreenProps {
  security: SecuritySettings;
  onUnlock: () => void;
  onSecurityUpdate: (settings: Partial<SecuritySettings>) => void;
  onWipe: () => void;
}

export function LockScreen({ security, onUnlock, onSecurityUpdate, onWipe }: LockScreenProps) {
  const [pin, setPin] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isErrorFlash, setIsErrorFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [pressedButton, setPressedButton] = useState<string | null>(null);
  const [recentlyFilledDot, setRecentlyFilledDot] = useState<number | null>(null);
  const i18n = t();

  const handleDigitPress = useCallback(async (digit: string) => {
    if (pin.length >= 4) return;

    const newPin = pin + digit;
    setPin(newPin);
    setError(null);
    setRecentlyFilledDot(newPin.length - 1);
    
    setTimeout(() => setRecentlyFilledDot(null), 200);

    if (newPin.length === 4) {
      const result: VerifyResult = await verifyPin(newPin, security);

      if (result.valid) {
        onSecurityUpdate({ failedAttempts: 0 });
        onUnlock();
      } else {
        onSecurityUpdate({ failedAttempts: result.failedAttempts });
        
        if (result.shouldWipe) {
          onWipe();
          return;
        }

        setIsShaking(true);
        setIsErrorFlash(true);
        setTimeout(() => {
          setIsShaking(false);
          setIsErrorFlash(false);
        }, 400);
        setPin('');

        if (result.remainingAttempts <= 5) {
          setRemainingAttempts(result.remainingAttempts);
          setError(`${i18n.lockScreen.wrongPin}. ${result.remainingAttempts}${i18n.lockScreen.attemptsRemaining}`);
        } else {
          setRemainingAttempts(null);
          setError(i18n.lockScreen.wrongPin);
        }
      }
    }
  }, [pin, security, onUnlock, onSecurityUpdate, onWipe, i18n]);

  const handleDelete = useCallback(() => {
    setPin(prev => prev.slice(0, -1));
    setError(null);
  }, []);

  const handleButtonPress = useCallback((digit: string) => {
    setPressedButton(digit);
  }, []);

  const handleButtonRelease = useCallback(() => {
    setPressedButton(null);
  }, []);

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div 
      data-testid="lock-screen"
      className={`fixed inset-0 bg-slate-900 flex flex-col items-center justify-center p-6 lock-screen-bg ${isErrorFlash ? 'animate-error-flash' : ''}`}
    >
      <div className="text-center mb-12">
        <h1 
          className="text-2xl font-semibold text-white mb-2 animate-entrance"
          style={{ animationDelay: '0ms' }}
        >
          {i18n.lockScreen.title}
        </h1>
        <p 
          className="text-slate-400 animate-entrance"
          style={{ animationDelay: '50ms' }}
        >
          {i18n.lockScreen.subtitle}
        </p>
      </div>

      <div 
        data-testid="pin-dots-container"
        className={`flex gap-4 mb-8 animate-entrance ${isShaking ? 'animate-shake' : ''}`}
        style={{ animationDelay: '100ms' }}
      >
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            data-testid="pin-dot"
            className={`w-4 h-4 rounded-full transition-colors duration-150 ${
              i < pin.length 
                ? `bg-white pin-dot-filled ${recentlyFilledDot === i ? 'animate-dot-fill' : ''}` 
                : 'bg-slate-600 pin-dot-empty'
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-6 animate-fade-in">{error}</p>
      )}

      {remainingAttempts !== null && remainingAttempts <= 5 && (
        <div data-testid="attempt-counter" className="flex gap-1 mb-4">
          <span className="text-slate-400 text-xs">{remainingAttempts}</span>
          {Array.from({ length: remainingAttempts }).map((_, i) => (
            <div
              key={i}
              data-testid="attempt-indicator"
              className="w-2 h-2 rounded-full bg-red-500"
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 max-w-xs">
        {[0, 1, 2].map(rowIndex => (
          <div key={rowIndex} data-testid="keypad-row" className="contents animate-entrance" style={{ animationDelay: `${150 + rowIndex * 50}ms` }}>
            {digits.slice(rowIndex * 3, rowIndex * 3 + 3).map((digit, i) => {
              const globalIndex = rowIndex * 3 + i;
              if (digit === '') {
                return <div key={globalIndex} className="w-20 h-20" />;
              }

              if (digit === 'del') {
                return (
                  <button
                    key={globalIndex}
                    data-testid="delete-button"
                    onClick={handleDelete}
                    disabled={pin.length === 0}
                    className="w-20 h-20 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-30"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                    </svg>
                  </button>
                );
              }

              return (
                <button
                  key={globalIndex}
                  onClick={() => handleDigitPress(digit)}
                  onMouseDown={() => handleButtonPress(digit)}
                  onMouseUp={handleButtonRelease}
                  onMouseLeave={handleButtonRelease}
                  onTouchStart={() => handleButtonPress(digit)}
                  onTouchEnd={handleButtonRelease}
                  className={`w-20 h-20 rounded-full bg-slate-800 text-white text-2xl font-medium hover:bg-slate-700 active:bg-slate-600 transition-colors keypad-button ${pressedButton === digit ? 'keypad-button-pressed' : ''}`}
                  aria-label={digit}
                >
                  {digit}
                </button>
              );
            })}
          </div>
        ))}
        <div data-testid="keypad-row" className="contents animate-entrance" style={{ animationDelay: '300ms' }}>
          {digits.slice(9).map((digit, i) => {
            const globalIndex = 9 + i;
            if (digit === '') {
              return <div key={globalIndex} className="w-20 h-20" />;
            }

            if (digit === 'del') {
              return (
                <button
                  key={globalIndex}
                  data-testid="delete-button"
                  onClick={handleDelete}
                  disabled={pin.length === 0}
                  className="w-20 h-20 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-30"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                  </svg>
                </button>
              );
            }

            return (
              <button
                key={globalIndex}
                onClick={() => handleDigitPress(digit)}
                onMouseDown={() => handleButtonPress(digit)}
                onMouseUp={handleButtonRelease}
                onMouseLeave={handleButtonRelease}
                onTouchStart={() => handleButtonPress(digit)}
                onTouchEnd={handleButtonRelease}
                className={`w-20 h-20 rounded-full bg-slate-800 text-white text-2xl font-medium hover:bg-slate-700 active:bg-slate-600 transition-colors keypad-button ${pressedButton === digit ? 'keypad-button-pressed' : ''}`}
                aria-label={digit}
              >
                {digit}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-slate-500 text-xs mt-12 text-center max-w-xs">
        {i18n.lockScreen.forgotPin}
      </p>
    </div>
  );
}
