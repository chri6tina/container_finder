import { prisma } from '@/lib/db';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';
  const products = await prisma.product.findMany({ select: { id: true, updatedAt: true } });
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now },
    { url: `${base}/browse`, lastModified: now },
    { url: `${base}/compare`, lastModified: now },
    { url: `${base}/about`, lastModified: now },
    { url: `${base}/contact`, lastModified: now },
    { url: `${base}/privacy`, lastModified: now },
    { url: `${base}/terms`, lastModified: now },
    { url: `${base}/disclosure`, lastModified: now },
    { url: `${base}/collections/travel`, lastModified: now },
    { url: `${base}/collections/makeup`, lastModified: now },
    { url: `${base}/collections/pantry`, lastModified: now }
  ];
  for (const p of products) pages.push({ url: `${base}/containers/${p.id}`, lastModified: p.updatedAt });
  return pages;
}


