"use client";

import { useMemo, useState } from 'react';
import ErrorDialog from '@/components/ui/ErrorDialog';
import { normalizeCapacity, normalizeDimensions, roundTo, mlToOz, ozToMl, cmToIn, inToCm } from '@/lib/units';

type Material = 'GLASS' | 'PLASTIC' | 'SILICONE' | 'STEEL';
type Shape = 'ROUND' | 'SQUARE' | 'RECTANGULAR' | 'OVAL' | 'OTHER';
type Feature = 'LEAKPROOF' | 'STACKABLE' | 'DISHWASHER_SAFE' | 'MICROWAVE_SAFE' | 'BPA_FREE';

const MATERIALS: Material[] = ['GLASS', 'PLASTIC', 'SILICONE', 'STEEL'];
const SHAPES: Shape[] = ['ROUND', 'SQUARE', 'RECTANGULAR', 'OVAL', 'OTHER'];
const FEATURES: Feature[] = ['LEAKPROOF', 'STACKABLE', 'DISHWASHER_SAFE', 'MICROWAVE_SAFE', 'BPA_FREE'];

export default function AdminEditProductForm({
  product
}: {
  product: {
    id: string;
    asin: string;
    title: string;
    brand?: string | null;
    category?: string | null;
    material: Material;
    shape?: Shape | null;
    images: string[];
    tags: string[];
    features: Feature[];
    affiliateUrl: string;
    description?: string | null;
    size?: { capacityMl?: number | null; capacityOz?: number | null; weightKg?: number | null; lengthCm?: number | null; widthCm?: number | null; heightCm?: number | null } | null;
  };
}) {
  const [asin, setAsin] = useState(product.asin);
  const [title, setTitle] = useState(product.title);
  const [brand, setBrand] = useState(product.brand ?? '');
  const [category, setCategory] = useState(product.category ?? '');
  const [material, setMaterial] = useState<Material>(product.material);
  const [shape, setShape] = useState<Shape>(product.shape ?? 'RECTANGULAR');
  const [imagesText, setImagesText] = useState(product.images.join('\n'));
  const [tagsText, setTagsText] = useState(product.tags.join(','));
  const [features, setFeatures] = useState<Feature[]>(product.features);
  const [affiliateUrl, setAffiliateUrl] = useState(product.affiliateUrl);
  const [description, setDescription] = useState(product.description ?? '');

  const [capUnit, setCapUnit] = useState<'ml' | 'oz' | 'kg'>(
    product.size?.weightKg ? 'kg' : product.size?.capacityOz ? 'oz' : 'ml'
  );
  const [minCap, setMinCap] = useState<number | ''>(
    product.size?.weightKg ?? product.size?.capacityOz ?? (product.size?.capacityMl ? Number(roundTo(mlToOz(product.size.capacityMl), 1)) : '')
  );

  const [dimUnit, setDimUnit] = useState<'cm' | 'in'>('cm');
  const [len, setLen] = useState<number | ''>(product.size?.lengthCm ?? '');
  const [wid, setWid] = useState<number | ''>(product.size?.widthCm ?? '');
  const [ht, setHt] = useState<number | ''>(product.size?.heightCm ?? '');

  const images = useMemo(() => imagesText.split(/\r?\n/).map((s) => s.trim()).filter(Boolean), [imagesText]);
  const tags = useMemo(() => tagsText.split(',').map((s) => s.trim()).filter(Boolean), [tagsText]);

  const toggleFeature = (f: Feature) => setFeatures((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const capVal = typeof minCap === 'number' ? minCap : undefined;
    const cap = capVal != null && capUnit !== 'kg' ? normalizeCapacity(capVal, capUnit) : undefined;
    const dims = normalizeDimensions(
      {
        length: typeof len === 'number' ? len : undefined,
        width: typeof wid === 'number' ? wid : undefined,
        height: typeof ht === 'number' ? ht : undefined
      },
      dimUnit
    );

    const payload = {
      asin,
      title,
      brand: brand || undefined,
      category: category || undefined,
      material,
      shape,
      images,
      tags,
      features,
      affiliateUrl,
      description: description || undefined,
      capacityMl: cap?.ml,
      capacityOz: cap?.oz,
      weightKg: capUnit === 'kg' && capVal != null && capVal > 0 ? capVal : undefined,
      lengthCm: dims.lengthCm,
      widthCm: dims.widthCm,
      heightCm: dims.heightCm
    };

    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      const pretty = JSON.stringify(j, null, 2) || res.statusText;
      setErrorMsg(pretty);
      return;
    }
    window.location.href = '/admin/products';
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <ErrorDialog open={!!errorMsg} message={errorMsg || ''} onClose={() => setErrorMsg(null)} title="Update failed" />
      <div className="rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="text-sm font-medium">1) Details</div>
        <div className="grid sm:grid-cols-2 gap-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="rounded-xl border border-gray-200 px-3 py-2" />
          <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Brand (optional)" className="rounded-xl border border-gray-200 px-3 py-2" />
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (optional)" className="rounded-xl border border-gray-200 px-3 py-2" />
          <input value={asin} onChange={(e) => setAsin(e.target.value)} placeholder="ASIN" className="rounded-xl border border-gray-200 px-3 py-2" />
          <select value={material} onChange={(e) => setMaterial(e.target.value as Material)} className="rounded-xl border border-gray-200 px-3 py-2">
            {MATERIALS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select value={shape} onChange={(e) => setShape(e.target.value as Shape)} className="rounded-xl border border-gray-200 px-3 py-2">
            {SHAPES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Affiliate URL</label>
          <input value={affiliateUrl} onChange={(e) => setAffiliateUrl(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2 mt-1" />
        </div>

        <div>
          <label className="text-sm font-medium">Description (SEO blurb)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Short paragraph about this product."
            className="w-full rounded-xl border border-gray-200 px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Images (one URL per line)</label>
          <textarea value={imagesText} onChange={(e) => setImagesText(e.target.value)} rows={4} className="w-full rounded-xl border border-gray-200 px-3 py-2 mt-1" />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <input value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="Tags (comma-separated)" className="rounded-xl border border-gray-200 px-3 py-2" />
          <div className="flex flex-wrap gap-2 items-center">
            {FEATURES.map((f) => (
              <label key={f} className="flex items-center gap-2 text-sm border border-gray-200 rounded-full px-3 py-1">
                <input type="checkbox" checked={features.includes(f)} onChange={() => toggleFeature(f)} />
                <span>{f.replaceAll('_', ' ').toLowerCase()}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="text-sm font-medium">2) Size</div>
        <div className="grid sm:grid-cols-2 gap-3 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm">Capacity</span>
            <input type="number" step="0.1" value={minCap} onChange={(e) => setMinCap(e.target.value ? Number(e.target.value) : '')} className="w-32 rounded-xl border border-gray-200 px-3 py-2" />
            <select value={capUnit} onChange={(e) => setCapUnit(e.target.value as any)} className="rounded-xl border border-gray-200 px-2 py-2">
              <option value="oz">oz</option>
              <option value="ml">ml</option>
              <option value="kg">kg</option>
            </select>
            {typeof minCap === 'number' && capUnit !== 'kg' ? (
              <span className="text-xs text-gray-600">
                {capUnit === 'oz' ? `${roundTo(ozToMl(minCap), 0)} ml` : `${roundTo(mlToOz(minCap), 1)} oz`}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm">Dimensions</span>
            <input type="number" step="0.1" placeholder="L" value={len} onChange={(e) => setLen(e.target.value ? Number(e.target.value) : '')} className="w-20 rounded-xl border border-gray-200 px-3 py-2" />
            <input type="number" step="0.1" placeholder="W" value={wid} onChange={(e) => setWid(e.target.value ? Number(e.target.value) : '')} className="w-20 rounded-xl border border-gray-200 px-3 py-2" />
            <input type="number" step="0.1" placeholder="H" value={ht} onChange={(e) => setHt(e.target.value ? Number(e.target.value) : '')} className="w-20 rounded-xl border border-gray-200 px-3 py-2" />
            <select value={dimUnit} onChange={(e) => setDimUnit(e.target.value as any)} className="rounded-xl border border-gray-200 px-2 py-2">
              <option value="in">in</option>
              <option value="cm">cm</option>
            </select>
            <span className="text-xs text-gray-600">
              {['', len, wid, ht].some((v) => v === '')
                ? ''
                : dimUnit === 'in'
                ? `${roundTo(inToCm(len as number), 2)} × ${roundTo(inToCm(wid as number), 2)} × ${roundTo(inToCm(ht as number), 2)} cm`
                : `${roundTo(cmToIn(len as number), 2)} × ${roundTo(cmToIn(wid as number), 2)} × ${roundTo(cmToIn(ht as number), 2)} in`}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" className="rounded-xl bg-blush-500 text-white px-5 py-3 hover:bg-blush-600">Save Changes</button>
        <a href="/admin/products" className="text-sm text-gray-600 underline">Cancel</a>
      </div>
    </form>
  );
}


