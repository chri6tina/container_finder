"use client";
import { useMemo, useState } from 'react';
import { extractAsin, buildAffiliateUrl } from '@/lib/asin';
import { normalizeCapacity, normalizeDimensions, roundTo, mlToOz, ozToMl, cmToIn, inToCm } from '@/lib/units';
import Link from 'next/link';
import ErrorDialog from '@/components/ui/ErrorDialog';

type Material = 'GLASS' | 'PLASTIC' | 'SILICONE' | 'STEEL';
type Shape = 'ROUND' | 'SQUARE' | 'RECTANGULAR' | 'OVAL' | 'OTHER';
type Feature = 'LEAKPROOF' | 'STACKABLE' | 'DISHWASHER_SAFE' | 'MICROWAVE_SAFE' | 'BPA_FREE';

const MATERIALS: Material[] = ['GLASS', 'PLASTIC', 'SILICONE', 'STEEL'];
const SHAPES: Shape[] = ['ROUND', 'SQUARE', 'RECTANGULAR', 'OVAL', 'OTHER'];
const FEATURES: Feature[] = ['LEAKPROOF', 'STACKABLE', 'DISHWASHER_SAFE', 'MICROWAVE_SAFE', 'BPA_FREE'];

export default function AdminNewProductPage() {
  const [urlOrAsin, setUrlOrAsin] = useState('');
  const [asin, setAsin] = useState<string | null>(null);
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [prefillMsg, setPrefillMsg] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [material, setMaterial] = useState<Material>('GLASS');
  const [shape, setShape] = useState<Shape>('RECTANGULAR');
  const [imagesText, setImagesText] = useState(''); // newline-separated
  const [tagsText, setTagsText] = useState(''); // comma-separated
  const [features, setFeatures] = useState<Feature[]>([]);
  const [description, setDescription] = useState('');

  const [capUnit, setCapUnit] = useState<'ml' | 'oz' | 'kg'>('oz');
  const [minCap, setMinCap] = useState<number | ''>(''); // use one for display; save normalized

  const [dimUnit, setDimUnit] = useState<'cm' | 'in'>('in');
  const [len, setLen] = useState<number | ''>('');
  const [wid, setWid] = useState<number | ''>('');
  const [ht, setHt] = useState<number | ''>('');

  const images = useMemo(() => imagesText.split(/\r?\n/).map((s) => s.trim()).filter(Boolean), [imagesText]);
  const tags = useMemo(() => tagsText.split(',').map((s) => s.trim()).filter(Boolean), [tagsText]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onPrefill() {
    const a = extractAsin(urlOrAsin);
    setAsin(a);
    // Do not auto-set affiliate URL; user will paste their own
    try {
      const res = await fetch('/api/admin/prefill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urlOrAsin })
      });
      const data = await res.json();
      if (data.asin) {
        setAsin(data.asin);
        // Do not set affiliate URL from prefill; user controls this field
        setPrefillMsg(`ASIN detected: ${data.asin}`);
      } else {
        setPrefillMsg('Could not extract ASIN. Paste a full product URL containing /dp/ASIN or the 10-character ASIN.');
      }
      if (data.title && !title) setTitle(data.title);
      if (data.brand && !brand) setBrand(data.brand);
      if (data.images?.length && !imagesText) setImagesText(data.images.join('\n'));
      if (Array.isArray(data.features) && data.features.length) setFeatures((prev) => (prev.length ? prev : data.features));
      if (typeof (data as any).weightKg === 'number') {
        setCapUnit('kg');
        // Default to 0 so you decide the weight; do not auto-fill scraped kg
        setMinCap(0);
      } else if (typeof data.capacityMl === 'number' || typeof data.capacityOz === 'number') {
        if (capUnit === 'oz' && typeof data.capacityOz === 'number') setMinCap(Number(data.capacityOz.toFixed(1)));
        else if (capUnit === 'ml' && typeof data.capacityMl === 'number') setMinCap(Math.round(data.capacityMl));
        else if (typeof data.capacityOz === 'number') setMinCap(Number(data.capacityOz.toFixed(1)));
        else if (typeof data.capacityMl === 'number') setMinCap(Math.round(data.capacityMl));
      }
      if (
        typeof data.lengthCm === 'number' ||
        typeof data.widthCm === 'number' ||
        typeof data.heightCm === 'number'
      ) {
        if (dimUnit === 'in') {
          if (typeof data.lengthCm === 'number') setLen(Number((data.lengthCm / 2.54).toFixed(2)));
          if (typeof data.widthCm === 'number') setWid(Number((data.widthCm / 2.54).toFixed(2)));
          if (typeof data.heightCm === 'number') setHt(Number((data.heightCm / 2.54).toFixed(2)));
        } else {
          if (typeof data.lengthCm === 'number') setLen(Number(data.lengthCm.toFixed(2)));
          if (typeof data.widthCm === 'number') setWid(Number(data.widthCm.toFixed(2)));
          if (typeof data.heightCm === 'number') setHt(Number(data.heightCm.toFixed(2)));
        }
      }
    } catch (e) {
      // Silent; keep manual flow
    }
  }

  // Live extraction feedback after typing
  // Debounce minimal: runs when user pauses typing
  const [typingTimer, setTypingTimer] = useState<number | null>(null);
  function onChangeUrlOrAsin(v: string) {
    setUrlOrAsin(v);
    if (typingTimer) window.clearTimeout(typingTimer);
    const t = window.setTimeout(() => {
      if (!v) {
        setAsin(null);
        // Do not clear affiliate URL; user may have pasted a custom short link
        setPrefillMsg(null);
        return;
      }
      const a = extractAsin(v);
      setAsin(a);
      if (a) {
        setPrefillMsg(`ASIN detected: ${a}`);
      } else {
        setPrefillMsg('Could not extract ASIN from input yet. Click Prefill or paste /dp/ASIN format.');
      }
    }, 300);
    setTypingTimer(t);
  }

  const toggleFeature = (f: Feature) => setFeatures((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!asin) {
      alert('ASIN is required. Paste a valid Amazon URL or ASIN, then click Prefill.');
      return;
    }
    if (!/^[A-Z0-9]{10}$/i.test(asin)) {
      alert('ASIN must be 10 characters (letters/numbers).');
      return;
    }
    if (!title.trim()) {
      alert('Title is required.');
      return;
    }
    if (!affiliateUrl.trim()) {
      alert('Affiliate URL is required. Paste your amzn.to or amazon.com link.');
      return;
    }
    if (!images.length) {
      alert('At least one image URL is required (one per line).');
      return;
    }

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

    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      const pretty = JSON.stringify(j, null, 2) || res.statusText;
      setErrorMsg(pretty);
      return;
    }
    // After create, jump to admin list pre-filtered by ASIN so the new item is visible immediately
    window.location.href = `/admin/products?q=${encodeURIComponent(asin)}`;
  }

  return (
    <main className="py-8 space-y-6">
      <ErrorDialog open={!!errorMsg} message={errorMsg || ''} onClose={() => setErrorMsg(null)} title="Save failed" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Add Product</h1>
        <Link href="/admin/products" className="text-gray-600 underline">Back to list</Link>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-200 p-4 space-y-3">
          <div className="text-sm font-medium">1) Paste Amazon URL or ASIN</div>
          <div className="flex gap-2">
            <input
              value={urlOrAsin}
              onChange={(e) => onChangeUrlOrAsin(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onPrefill();
                }
              }}
              placeholder="https://www.amazon.com/dp/XXXXXXXXXX"
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2"
            />
            <button type="button" onClick={onPrefill} disabled={!urlOrAsin} className="rounded-xl bg-gray-900 disabled:opacity-50 text-white px-4 py-2">Prefill</button>
          </div>
          <div className="text-sm text-gray-600">ASIN: <span className="font-mono">{asin ?? '—'}</span></div>
          <div className="text-sm text-gray-600">Affiliate URL: <span className="break-all">{affiliateUrl || '—'}</span></div>
          {prefillMsg ? (
            <div className={`text-xs ${asin ? 'text-green-700' : 'text-red-700'}`}>{prefillMsg}</div>
          ) : null}
        </div>

        <div className="rounded-xl border border-gray-200 p-4 space-y-3">
          <div className="text-sm font-medium">2) Details</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="rounded-xl border border-gray-200 px-3 py-2" />
            <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Brand (optional)" className="rounded-xl border border-gray-200 px-3 py-2" />
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (optional)" className="rounded-xl border border-gray-200 px-3 py-2" />
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
            <input
              value={affiliateUrl}
              onChange={(e) => setAffiliateUrl(e.target.value)}
              placeholder="https://www.amazon.com/dp/XXXXXXXXXX?tag=YOUR_TAG"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 mt-1"
            />
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
          <div className="text-sm font-medium">3) Size</div>
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
          <button type="submit" className="rounded-xl bg-blush-500 text-white px-5 py-3 hover:bg-blush-600">Save Product</button>
          <span className="text-xs text-gray-600">We’ll normalize to ml and cm on save.</span>
        </div>
      </form>
    </main>
  );
}


