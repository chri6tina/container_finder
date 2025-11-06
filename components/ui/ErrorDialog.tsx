"use client";

import { useCallback } from 'react';

export default function ErrorDialog({
  open,
  title = 'Something went wrong',
  message,
  onClose
}: {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}) {
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message);
      alert('Error details copied to clipboard');
    } catch {
      // noop
    }
  }, [message]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-w-xl w-[92%] bg-white rounded-xl shadow-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-gray-900">✕</button>
        </div>
        <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-80 overflow-auto">
{message}
        </pre>
        <div className="mt-3 flex items-center justify-end gap-2">
          <button onClick={copy} className="rounded-md border border-gray-200 px-3 py-1 text-sm hover:bg-gray-50">Copy</button>
          <button onClick={onClose} className="rounded-md bg-gray-900 text-white px-3 py-1 text-sm">Close</button>
        </div>
      </div>
    </div>
  );
}


