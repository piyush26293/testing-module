import { useUIStore } from '@/store/ui-store';
import { useEffect, useRef } from 'react';

export function useToast() {
  const { toasts, addToast, removeToast } = useUIStore();
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

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

  // Auto-remove toasts after 5 seconds with proper cleanup
  useEffect(() => {
    toasts.forEach((t) => {
      // Only set timer if not already set
      if (!timersRef.current.has(t.id)) {
        const timer = setTimeout(() => {
          removeToast(t.id);
          timersRef.current.delete(t.id);
        }, 5000);
        timersRef.current.set(t.id, timer);
      }
    });

    // Cleanup timers for removed toasts
    return () => {
      const currentToastIds = new Set(toasts.map(t => t.id));
      timersRef.current.forEach((timer, id) => {
        if (!currentToastIds.has(id)) {
          clearTimeout(timer);
          timersRef.current.delete(id);
        }
      });
    };
  }, [toasts, removeToast]);

  return { toast, toasts, removeToast };
}
