"use client";

import { useState } from 'react';

export default function DeleteProductButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  async function onDelete() {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(`Failed: ${j.error || res.statusText}`);
      } else {
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  }
  return (
    <button onClick={onDelete} disabled={loading} className="rounded-md border border-red-200 text-red-700 hover:bg-red-50 px-3 py-1 text-sm disabled:opacity-50">
      {loading ? 'Deleting…' : 'Delete'}
    </button>
  );
}


