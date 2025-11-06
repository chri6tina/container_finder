import { useEffect, useMemo, useState } from 'react';
import { mlToOz, ozToMl, inToCm, cmToIn, type CapacityUnit, type LengthUnit, roundTo } from '@/lib/units';

export type Filters = {
  q?: string;
  minOz?: number;
  maxOz?: number;
  minMl?: number;
  maxMl?: number;
  len?: number;
  wid?: number;
  ht?: number;
  units: LengthUnit; // for dimensions
  materials: string[];
  features: string[];
  shape?: string;
  sort: 'popularity' | 'capacityAsc' | 'capacityDesc';
};

const MATERIALS = ['GLASS', 'PLASTIC', 'SILICONE', 'STEEL'];
const FEATURES = ['LEAKPROOF', 'STACKABLE', 'DISHWASHER_SAFE', 'MICROWAVE_SAFE', 'BPA_FREE'];
const SHAPES = ['ROUND', 'SQUARE', 'RECTANGULAR', 'OVAL', 'OTHER'];

export default function FiltersPanel({ value, onChange }: { value: Filters; onChange: (next: Filters) => void }) {
  const [local, setLocal] = useState<Filters>(value);

  // keep capacity oz/ml in sync
  useEffect(() => {
    setLocal(value);
  }, [value]);

  function update(partial: Partial<Filters>) {
    const next = { ...local, ...partial };
    setLocal(next);
    onChange(next);
  }

  const setCapacity = (v: number | undefined, unit: CapacityUnit, bound: 'min' | 'max') => {
    if (v == null || Number.isNaN(v)) {
      update({ [`${bound}Oz`]: undefined, [`${bound}Ml`]: undefined } as any);
      return;
    }
    const oz = unit === 'oz' ? v : mlToOz(v);
    const ml = unit === 'ml' ? v : ozToMl(v);
    update({ [`${bound}Oz`]: roundTo(oz, 2), [`${bound}Ml`]: roundTo(ml, 0) } as any);
  };

  const setDim = (key: 'len' | 'wid' | 'ht', v?: number) => {
    if (v == null || Number.isNaN(v)) {
      update({ [key]: undefined } as any);
      return;
    }
    update({ [key]: v } as any);
  };

  const toggleUnit = () => {
    const nextUnit: LengthUnit = local.units === 'cm' ? 'in' : 'cm';
    const convert = nextUnit === 'cm' ? inToCm : cmToIn;
    update({
      units: nextUnit,
      len: local.len != null ? roundTo(convert(local.len), 2) : undefined,
      wid: local.wid != null ? roundTo(convert(local.wid), 2) : undefined,
      ht: local.ht != null ? roundTo(convert(local.ht), 2) : undefined
    });
  };

  const matSelected = useMemo(() => new Set(local.materials), [local.materials]);
  const featSelected = useMemo(() => new Set(local.features), [local.features]);

  const toggleArray = (arr: string[], val: string) => (arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  return (
    <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-soft space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          placeholder="Search..."
          value={local.q ?? ''}
          onChange={(e) => update({ q: e.target.value || undefined })}
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2"
        />
        <select
          value={local.sort}
          onChange={(e) => update({ sort: e.target.value as Filters['sort'] })}
          className="rounded-xl border border-gray-200 px-3 py-2"
        >
          <option value="popularity">Sort: Popularity</option>
          <option value="capacityAsc">Capacity: Low to High</option>
          <option value="capacityDesc">Capacity: High to Low</option>
        </select>
        <button className="rounded-xl px-3 py-2 border border-gray-200" onClick={() => update({
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
        })}>Clear</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">Capacity (oz)</div>
          <div className="flex gap-2">
            <input type="number" step="0.1" placeholder="Min" value={local.minOz ?? ''} onChange={(e) => setCapacity(e.target.value ? Number(e.target.value) : undefined, 'oz', 'min')} className="w-full rounded-xl border border-gray-200 px-3 py-2" />
            <input type="number" step="0.1" placeholder="Max" value={local.maxOz ?? ''} onChange={(e) => setCapacity(e.target.value ? Number(e.target.value) : undefined, 'oz', 'max')} className="w-full rounded-xl border border-gray-200 px-3 py-2" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Capacity (ml)</div>
          <div className="flex gap-2">
            <input type="number" step="1" placeholder="Min" value={local.minMl ?? ''} onChange={(e) => setCapacity(e.target.value ? Number(e.target.value) : undefined, 'ml', 'min')} className="w-full rounded-xl border border-gray-200 px-3 py-2" />
            <input type="number" step="1" placeholder="Max" value={local.maxMl ?? ''} onChange={(e) => setCapacity(e.target.value ? Number(e.target.value) : undefined, 'ml', 'max')} className="w-full rounded-xl border border-gray-200 px-3 py-2" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>Dimensions ({local.units})</span>
            <button onClick={toggleUnit} className="text-xs underline">Toggle {local.units === 'cm' ? 'in' : 'cm'}</button>
          </div>
          <div className="flex gap-2">
            <input type="number" step="0.1" placeholder="L" value={local.len ?? ''} onChange={(e) => setDim('len', e.target.value ? Number(e.target.value) : undefined)} className="w-full rounded-xl border border-gray-200 px-3 py-2" />
            <input type="number" step="0.1" placeholder="W" value={local.wid ?? ''} onChange={(e) => setDim('wid', e.target.value ? Number(e.target.value) : undefined)} className="w-full rounded-xl border border-gray-200 px-3 py-2" />
            <input type="number" step="0.1" placeholder="H" value={local.ht ?? ''} onChange={(e) => setDim('ht', e.target.value ? Number(e.target.value) : undefined)} className="w-full rounded-xl border border-gray-200 px-3 py-2" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Shape</div>
          <select value={local.shape ?? ''} onChange={(e) => update({ shape: e.target.value || undefined })} className="w-full rounded-xl border border-gray-200 px-3 py-2">
            <option value="">Any</option>
            {SHAPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="text-sm font-medium mr-2">Materials:</div>
        {MATERIALS.map((m) => (
          <button
            key={m}
            onClick={() => update({ materials: toggleArray(local.materials, m) })}
            className={`rounded-full px-3 py-1 border ${matSelected.has(m) ? 'bg-blush-500 text-white border-blush-500' : 'border-gray-200'}`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="text-sm font-medium mr-2">Features:</div>
        {FEATURES.map((f) => (
          <label key={f} className="flex items-center gap-2 text-sm border border-gray-200 rounded-full px-3 py-1">
            <input
              type="checkbox"
              checked={featSelected.has(f)}
              onChange={() => update({ features: toggleArray(local.features, f) })}
            />
            <span>{f.replaceAll('_', ' ').toLowerCase()}</span>
          </label>
        ))}
      </div>
    </div>
  );
}


