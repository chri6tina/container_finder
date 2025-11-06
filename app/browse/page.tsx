"use client";
import { useEffect, useMemo, useState } from 'react';
import FiltersPanel, { type Filters } from '@/components/ui/FiltersPanel';
import ProductCard from '@/components/ui/ProductCard';
import CompareBar from '@/components/ui/CompareBar';
import { useCompare } from '@/lib/useCompare';

type Product = any;

const DEFAULT_FILTERS: Filters = {
  q: undefined,
  minOz: undefined,
  maxOz: undefined,
  minMl: undefined,
  maxMl: undefined,
  len: undefined,
  wid: undefined,
  ht: undefined,
  units: 'cm',
  materials: [],
  features: [],
  shape: undefined,
  sort: 'popularity'
};

export default function BrowsePage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { add } = useCompare();

  // Hydrate from URL
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const initial: Filters = { ...DEFAULT_FILTERS };
    if (sp.get('q')) initial.q = sp.get('q')!;
    for (const k of ['minOz', 'maxOz', 'minMl', 'maxMl', 'len', 'wid', 'ht'] as const) {
      const v = sp.get(k);
      if (v) (initial as any)[k] = Number(v);
    }
    if (sp.get('units') === 'in') initial.units = 'in';
    if (sp.get('materials')) initial.materials = sp.get('materials')!.split(',');
    if (sp.get('features')) initial.features = sp.get('features')!.split(',');
    if (sp.get('shape')) initial.shape = sp.get('shape')!;
    if (sp.get('sort')) initial.sort = sp.get('sort') as Filters['sort'];
    setFilters(initial);
  }, []);

  // Sync URL and fetch
  useEffect(() => {
    const sp = new URLSearchParams();
    if (filters.q) sp.set('q', filters.q);
    for (const [k, v] of Object.entries(filters)) {
      if (v == null) continue;
      if (['q', 'materials', 'features'].includes(k)) continue;
      if (Array.isArray(v)) continue;
      if (typeof v === 'number' || typeof v === 'string') sp.set(k, String(v));
    }
    if (filters.materials.length) sp.set('materials', filters.materials.join(','));
    if (filters.features.length) sp.set('features', filters.features.join(','));
    const qs = sp.toString();
    const url = qs ? `/browse?${qs}` : '/browse';
    window.history.replaceState(null, '', url);

    setLoading(true);
    fetch(`/api/products/search?${sp.toString()}`)
      .then((r) => r.json())
      .then((data) => setItems(data.items))
      .finally(() => setLoading(false));
  }, [filters]);

  const jsonLd = useMemo(() => {
    const itemList = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: items.map((p: any, i: number) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: p.affiliateUrl,
        name: p.title
      }))
    };
    return JSON.stringify(itemList);
  }, [items]);

  return (
    <main className="py-8">
      <h1 className="text-2xl font-semibold mb-4">Browse Containers</h1>
      <FiltersPanel value={filters} onChange={setFilters} />

      <section className="mt-6 min-h-[200px]">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : items.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((p: any) => (
              <ProductCard key={p.id} product={p} onAddCompare={add} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600">No results. Try widening your filters.</div>
        )}
      </section>

      <CompareBar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
    </main>
  );
}


