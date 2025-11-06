import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { buildOrderBy, buildWhere, type SearchParams } from '@/lib/search';
import { inToCm, ozToMl } from '@/lib/units';
import { z } from 'zod';
import { rateLimit, ipKey } from '@/lib/rateLimit';

function getArray(value: string | string[] | null): string[] | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) return value;
  return value.split(',').filter(Boolean);
}

export async function GET(request: Request) {
  if (!rateLimit(ipKey(request, 'search'), 60, 60_000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }
  const { searchParams } = new URL(request.url);

  const schema = z.object({
    q: z.string().min(1).max(200).optional(),
    minMl: z.coerce.number().min(0).max(100000).optional(),
    maxMl: z.coerce.number().min(0).max(100000).optional(),
    minOz: z.coerce.number().min(0).max(3380).optional(),
    maxOz: z.coerce.number().min(0).max(3380).optional(),
    len: z.coerce.number().min(0).max(200).optional(),
    wid: z.coerce.number().min(0).max(200).optional(),
    ht: z.coerce.number().min(0).max(200).optional(),
    units: z.enum(['in','cm']).optional(),
    materials: z.string().optional(),
    features: z.string().optional(),
    shape: z.string().optional(),
    sort: z.enum(['popularity','capacityAsc','capacityDesc']).optional()
  });
  const parsed = schema.safeParse(Object.fromEntries(searchParams.entries()));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid search parameters' }, { status: 400 });
  }
  const v = parsed.data;
  const params: SearchParams = {
    q: v.q || undefined,
    minMl: v.minMl,
    maxMl: v.maxMl,
    minOz: v.minOz,
    maxOz: v.maxOz,
    len: v.len,
    wid: v.wid,
    ht: v.ht,
    units: v.units,
    materials: getArray(v.materials || null),
    features: getArray(v.features || null),
    shape: v.shape || undefined,
    sort: v.sort || 'popularity'
  };

  // Convert dimensions to canonical cm if needed
  if (params.units === 'in') {
    if (params.len != null) params.len = inToCm(params.len);
    if (params.wid != null) params.wid = inToCm(params.wid);
    if (params.ht != null) params.ht = inToCm(params.ht);
  }

  // If only oz range is provided, also set equivalent ml for better index usage
  if (params.minOz != null && params.minMl == null) params.minMl = ozToMl(params.minOz);
  if (params.maxOz != null && params.maxMl == null) params.maxMl = ozToMl(params.maxOz);

  const where = buildWhere(params);
  const orderBy = buildOrderBy(params.sort);

  const products = await prisma.product.findMany({
    where,
    include: { size: true, _count: { select: { clicks: true } } },
    orderBy,
    take: 60
  });

  const items = products.map((p) => ({
    ...p,
    images: p.imagesText ? (p.imagesText as string).split('|').filter(Boolean) : [],
    features: p.featuresText
      ? (p.featuresText as string)
          .split(',')
          .filter(Boolean)
      : []
  }));

  return NextResponse.json({ items });
}


