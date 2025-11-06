'use client';

import { useEffect, useState } from 'react';

export default function ComplianceNote() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('disclosure.dismissed');
      if (!dismissed) setVisible(true);
    } catch {}
  }, []);

  if (!visible) return null;

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 text-yellow-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 text-sm flex items-start sm:items-center justify-between gap-3">
        <p>
          As an Amazon Associate, we may earn commissions from qualifying purchases made through links on this site.
        </p>
        <button
          onClick={() => {
            try { localStorage.setItem('disclosure.dismissed', '1'); } catch {}
            setVisible(false);
          }}
          className="shrink-0 rounded-md border border-yellow-300 bg-white/60 px-2 py-1 text-yellow-900 hover:bg-white"
          aria-label="Dismiss affiliate disclosure"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}


