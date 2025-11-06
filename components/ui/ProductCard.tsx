import Image from 'next/image';
import Link from 'next/link';
import { useCallback } from 'react';
import { productDetailPath } from '@/lib/slug';

type Product = {
  id: string;
  asin: string;
  title: string;
  brand?: string | null;
  images: string[];
  material: string;
  features: string[];
  affiliateUrl: string;
  size?: {
    capacityMl?: number | null;
    capacityOz?: number | null;
    weightKg?: number | null;
  } | null;
  _count?: { clicks: number };
};

export default function ProductCard({ product, onAddCompare }: { product: Product; onAddCompare?: (id: string) => void }) {
  const imageUrl = product.images?.[0];
  const allowedHosts = new Set(['m.media-amazon.com', 'i.imgur.com']);
  let safeImageUrl: string | undefined;
  if (imageUrl) {
    try {
      const u = new URL(imageUrl);
      if (allowedHosts.has(u.hostname)) safeImageUrl = imageUrl;
    } catch {
      // ignore bad URL
    }
  }

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      try {
        await fetch('/api/clicks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id, source: 'browse' })
        });
      } catch {}
      window.open(product.affiliateUrl, '_blank', 'noopener');
    },
    [product]
  );

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-soft">
      <Link href={productDetailPath(product as any)} className="block">
        <div className="relative aspect-[4/3] bg-gray-50">
          {safeImageUrl ? (
            <Image src={safeImageUrl} alt={product.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">No image</div>
          )}
        </div>
      </Link>
      <div className="p-4 space-y-2">
        <div className="text-sm text-gray-500">{product.brand ?? '\u00A0'}</div>
        <h3 className="font-medium leading-snug line-clamp-2">
          <Link href={`/containers/${product.id}`} className="hover:underline">
            {product.title}
          </Link>
        </h3>
        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
          <span className="rounded-full bg-gray-100 px-2 py-1">{product.material}</span>
          {product.size?.capacityOz ? (
            <span className="rounded-full bg-gray-100 px-2 py-1">{product.size.capacityOz} oz</span>
          ) : product.size?.weightKg ? (
            <span className="rounded-full bg-gray-100 px-2 py-1">{product.size.weightKg} kg</span>
          ) : null}
          {product.features.slice(0, 2).map((f) => (
            <span key={f} className="rounded-full bg-gray-100 px-2 py-1">
              {f.replaceAll('_', ' ').toLowerCase()}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2">
          <button onClick={handleClick} className="rounded-xl bg-blush-500 px-4 py-2 text-white hover:bg-blush-600">
            View on Amazon
          </button>
          {onAddCompare ? (
            <button
              onClick={() => onAddCompare(product.id)}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Add to Compare
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}


