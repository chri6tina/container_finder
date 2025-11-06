"use client";
import Link from 'next/link';
import { useCompare } from '@/lib/useCompare';

export default function CompareBar() {
  const { ids, remove, clear } = useCompare();
  if (!ids.length) return null;
  const query = `ids=${ids.join(',')}`;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-4">
        <div className="rounded-xl bg-white border border-gray-200 shadow-soft p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Compare ({ids.length}/4):</span>
            {ids.map((id) => (
              <span key={id} className="text-xs bg-gray-100 rounded-full px-2 py-1">
                {id.substring(0, 6)}
                <button className="ml-2 text-gray-500" onClick={() => remove(id)}>
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={clear} className="text-sm underline text-gray-600">
              Clear
            </button>
            <Link href={`/compare?${query}`} className="rounded-xl bg-blush-500 text-white px-4 py-2 hover:bg-blush-600">
              Compare
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


