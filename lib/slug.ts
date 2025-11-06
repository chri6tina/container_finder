import type { Product } from '@prisma/client';
import { mlToOz, roundTo } from './units';

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function productSlug(product: Product & { size?: { capacityMl?: number | null } | null }): string {
  const sizeOz = product.size?.capacityMl ? roundTo(mlToOz(product.size.capacityMl), 0) : undefined;
  const parts = [
    'containers',
    product.material.toLowerCase(),
    sizeOz ? `${sizeOz}oz` : 'size-unknown',
    slugify(product.title)
  ];
  return parts.join('/');
}

// Single-segment SEO path segment with trailing id for stable lookups
export function productUrlSegment(product: Product & { size?: { capacityMl?: number | null } | null }): string {
  const sizeOz = product.size?.capacityMl ? roundTo(mlToOz(product.size.capacityMl), 0) : undefined;
  const bits = [product.material.toLowerCase()];
  if (sizeOz) bits.push(`${sizeOz}oz`);
  bits.push(slugify(product.title));
  // append id for stable fetch without DB unique slug
  return `${bits.join('-')}-${product.id}`;
}

export function productDetailPath(product: Product & { size?: { capacityMl?: number | null } | null }): string {
  return `/containers/${productUrlSegment(product)}`;
}

export function extractIdFromSegment(idOrSegment: string): string {
  // Expect format ...-<id>; fall back to entire string if no hyphen
  const idx = idOrSegment.lastIndexOf('-');
  if (idx > 0) return idOrSegment.slice(idx + 1);
  return idOrSegment;
}


