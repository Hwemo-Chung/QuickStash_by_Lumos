import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

let toastCounter = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${++toastCounter}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearToasts: () => {
    set({ toasts: [] });
  },
}));

// Helper functions for common toast types
export const toast = {
  success: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    return useToastStore.getState().addToast({
      type: 'success',
      message,
      duration: 3000,
      ...options,
    });
  },

  error: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    return useToastStore.getState().addToast({
      type: 'error',
      message,
      duration: 4000,
      ...options,
    });
  },

  info: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    return useToastStore.getState().addToast({
      type: 'info',
      message,
      duration: 3000,
      ...options,
    });
  },

  warning: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    return useToastStore.getState().addToast({
      type: 'warning',
      message,
      duration: 3500,
      ...options,
    });
  },
};
