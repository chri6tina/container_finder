"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import DeleteProductButton from '@/components/ui/DeleteProductButton';

type Item = {
  id: string;
  title: string;
  asin: string;
  material: string;
  createdAt: string;
  _count?: { clicks: number };
};

type ListResponse = {
  items: Item[];
  total: number;
  page: number;
  perPage: number;
};

export default function AdminProductsTable() {
  const [q, setQ] = useState('');
  const [material, setMaterial] = useState('');
  const [hasImages, setHasImages] = useState(false);
  const [sort, setSort] = useState<'createdDesc' | 'createdAsc' | 'titleAsc' | 'titleDesc' | 'clicksDesc'>('createdDesc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ListResponse>({ items: [], total: 0, page: 1, perPage: 20 });
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const totalPages = useMemo(() => Math.max(1, Math.ceil(data.total / data.perPage)), [data.total, data.perPage]);

  // Hydrate initial state from URL (e.g., after creating we navigate with ?q=ASIN)
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const q0 = sp.get('q');
      const m0 = sp.get('material');
      const hi0 = sp.get('hasImages');
      const s0 = sp.get('sort') as any;
      const p0 = Number(sp.get('page'));
      const pp0 = Number(sp.get('perPage'));
      if (q0) setQ(q0);
      if (m0) setMaterial(m0);
      if (hi0 === '1') setHasImages(true);
      if (s0 && ['createdDesc','createdAsc','titleAsc','titleDesc','clicksDesc'].includes(s0)) setSort(s0);
      if (p0 > 0) setPage(p0);
      if (pp0 > 0) setPerPage(pp0);
    } catch {}
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    const sp = new URLSearchParams();
    if (q) sp.set('q', q);
    if (material) sp.set('material', material);
    if (hasImages) sp.set('hasImages', '1');
    if (sort) sp.set('sort', sort);
    sp.set('page', String(page));
    sp.set('perPage', String(perPage));
    setLoading(true);
    fetch(`/api/admin/products/list?${sp.toString()}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((j) => setData(j))
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [q, material, hasImages, sort, page, perPage]);

  function toggleSelectAll()
  {
    if (selected.size === data.items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(data.items.map((i) => i.id)));
    }
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function bulkDelete() {
    if (!selected.size) return;
    if (!confirm(`Delete ${selected.size} product(s)?`)) return;
    const ids = Array.from(selected);
    setLoading(true);
    try {
      await Promise.all(ids.map((id) => fetch(`/api/admin/products/${id}`, { method: 'DELETE' })));
      // refresh
      setSelected(new Set());
      const sp = new URLSearchParams();
      if (q) sp.set('q', q);
      if (material) sp.set('material', material);
      if (hasImages) sp.set('hasImages', '1');
      if (sort) sp.set('sort', sort);
      sp.set('page', String(page));
      sp.set('perPage', String(perPage));
      const j = await fetch(`/api/admin/products/list?${sp.toString()}`).then((r) => r.json());
      setData(j);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          value={q}
          onChange={(e) => { setPage(1); setQ(e.target.value); }}
          placeholder="Search title, ASIN, brand, tags"
          className="rounded-xl border border-gray-200 px-3 py-2"
        />
        <select value={material} onChange={(e) => { setPage(1); setMaterial(e.target.value); }} className="rounded-xl border border-gray-200 px-3 py-2">
          <option value="">All materials</option>
          <option value="GLASS">GLASS</option>
          <option value="PLASTIC">PLASTIC</option>
          <option value="SILICONE">SILICONE</option>
          <option value="STEEL">STEEL</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="rounded-xl border border-gray-200 px-3 py-2">
          <option value="createdDesc">Newest</option>
          <option value="createdAsc">Oldest</option>
          <option value="titleAsc">Title A→Z</option>
          <option value="titleDesc">Title Z→A</option>
          <option value="clicksDesc">Most clicks</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={hasImages} onChange={(e) => { setPage(1); setHasImages(e.target.checked); }} />
          Only with images
        </label>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {loading ? 'Loading…' : `${data.total} result(s)`}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={bulkDelete} disabled={!selected.size || loading} className="rounded-md border border-red-200 text-red-700 hover:bg-red-50 px-3 py-1 text-sm disabled:opacity-50">
            Delete selected
          </button>
          <select value={perPage} onChange={(e) => { setPage(1); setPerPage(Number(e.target.value)); }} className="rounded-md border border-gray-200 px-2 py-1 text-sm">
            {[10,20,50,100].map(n => <option key={n} value={n}>{n}/page</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 w-10"><input type="checkbox" aria-label="Select all" onChange={toggleSelectAll} checked={selected.size === data.items.length && data.items.length > 0} /></th>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">ASIN</th>
              <th className="text-left p-3">Material</th>
              <th className="text-left p-3">Clicks</th>
              <th className="text-left p-3">Created</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3"><input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleRow(p.id)} aria-label={`Select ${p.title}`} /></td>
                <td className="p-3">{p.title}</td>
                <td className="p-3">{p.asin}</td>
                <td className="p-3">{p.material}</td>
                <td className="p-3">{p._count?.clicks ?? 0}</td>
                <td className="p-3">{new Date(p.createdAt).toLocaleString()}</td>
                <td className="p-3 flex items-center gap-2">
                  <Link href={`/containers/${p.id}`} target="_blank" rel="noopener noreferrer" className="rounded-md border border-gray-200 px-3 py-1 text-sm hover:bg-gray-50">View</Link>
                  <Link href={`/admin/products/${p.id}`} className="rounded-md border border-gray-200 px-3 py-1 text-sm hover:bg-gray-50">Edit</Link>
                  <DeleteProductButton id={p.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading} className="rounded-md border border-gray-200 px-3 py-1 text-sm disabled:opacity-50">Prev</button>
        <span className="text-sm text-gray-700">Page {page} of {totalPages}</span>
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loading} className="rounded-md border border-gray-200 px-3 py-1 text-sm disabled:opacity-50">Next</button>
      </div>
    </div>
  );
}


