import { useUIStore } from '@/store/ui-store';
import { useEffect } from 'react';

export function useToast() {
  const { toasts, addToast, removeToast } = useUIStore();

  const toast = {
    success: (title: string, description?: string) => {
      addToast({ title, description, type: 'success' });
    },
    error: (title: string, description?: string) => {
      addToast({ title, description, type: 'error' });
    },
    warning: (title: string, description?: string) => {
      addToast({ title, description, type: 'warning' });
    },
    info: (title: string, description?: string) => {
      addToast({ title, description, type: 'info' });
    },
  };

  // Auto-remove toasts after 5 seconds
  useEffect(() => {
    toasts.forEach((t) => {
      setTimeout(() => {
        removeToast(t.id);
      }, 5000);
    });
  }, [toasts, removeToast]);

  return { toast, toasts, removeToast };
}
