import { useEffect, useCallback } from 'react';
import { Check, X, AlertCircle, Info } from 'lucide-react';
import { useToastStore, type ToastType } from '../store/useToastStore';

const TOAST_ICONS: Record<ToastType, typeof Check> = {
  success: Check,
  error: X,
  info: Info,
  warning: AlertCircle,
};

const TOAST_STYLES: Record<ToastType, { bg: string; icon: string; text: string; border: string }> = {
  success: {
    bg: 'bg-emerald-50',
    icon: 'bg-emerald-500 text-white',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
  },
  error: {
    bg: 'bg-red-50',
    icon: 'bg-red-500 text-white',
    text: 'text-red-800',
    border: 'border-red-200',
  },
  info: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-500 text-white',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
  warning: {
    bg: 'bg-amber-50',
    icon: 'bg-amber-500 text-white',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
};

interface ToastItemProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

function ToastItem({ id, type, message, duration = 3000, action }: ToastItemProps) {
  const removeToast = useToastStore((state) => state.removeToast);
  const styles = TOAST_STYLES[type];
  const Icon = TOAST_ICONS[type];

  const handleDismiss = useCallback(() => {
    removeToast(id);
  }, [id, removeToast]);

  const handleAction = useCallback(() => {
    action?.onClick();
    removeToast(id);
  }, [action, id, removeToast]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(handleDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      data-testid={`toast-${type}`}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border
        animate-slide-up min-w-[280px] max-w-[400px]
        ${styles.bg} ${styles.border}
      `}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${styles.icon}`}>
        <Icon className="w-4 h-4" />
      </div>

      <p className={`flex-1 text-sm font-medium ${styles.text}`}>
        {message}
      </p>

      {action && (
        <button
          onClick={handleAction}
          className={`
            flex-shrink-0 px-3 py-1.5 text-sm font-semibold rounded-lg
            transition-colors min-h-[36px]
            ${styles.text} hover:bg-black/5
          `}
        >
          {action.label}
        </button>
      )}

      <button
        onClick={handleDismiss}
        aria-label="dismiss"
        className={`
          flex-shrink-0 p-1.5 rounded-full transition-colors
          ${styles.text} hover:bg-black/10
        `}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem {...toast} />
        </div>
      ))}
    </div>
  );
}
