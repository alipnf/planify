'use client';

import { AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/stores/auth';

export function MessageDisplay({ className }: { className?: string }) {
  const message = useAuthStore((state) => state.message);

  if (!message) return null;

  const isError = message.type === 'error';

  return (
    <div
      className={cn(
        'p-3 rounded-md flex items-center space-x-2 border',
        isError
          ? 'bg-red-50 text-red-700 border-red-200'
          : 'bg-green-50 text-green-700 border-green-200',
        className
      )}
    >
      {isError ? (
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
      ) : (
        <CheckCircle className="h-4 w-4 flex-shrink-0" />
      )}
      <span className="text-sm">{message.text}</span>
    </div>
  );
}
