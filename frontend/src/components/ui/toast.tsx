'use client';

import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-0 right-0 z-50 m-4 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-start gap-3 rounded-lg p-4 shadow-lg border animate-in slide-in-from-right-full max-w-md',
            {
              'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800':
                toast.type === 'success',
              'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800':
                toast.type === 'error',
              'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800':
                toast.type === 'warning',
              'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800':
                toast.type === 'info',
            }
          )}
        >
          <div className="flex-1">
            <h4 className="text-sm font-semibold">{toast.title}</h4>
            {toast.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {toast.description}
              </p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
