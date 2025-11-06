import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { rateLimit, ipKey } from '@/lib/rateLimit';

export async function GET(request: Request) {
  try {
    requireAdmin(request);
  } catch (e: any) {
    const status = e?.status || 401;
    return NextResponse.json({ error: e?.message || 'Unauthorized' }, { status });
  }
  if (!rateLimit(ipKey(request, 'admin:list-products'), 120, 60_000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }
  const { searchParams } = new URL(request.url);

  const q = searchParams.get('q') || undefined;
  const material = searchParams.get('material') || undefined;
  const hasImages = searchParams.get('hasImages') === '1';
  const sort = (searchParams.get('sort') || 'createdDesc') as 'createdDesc' | 'createdAsc' | 'titleAsc' | 'titleDesc' | 'clicksDesc';
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const perPage = Math.min(100, Math.max(1, Number(searchParams.get('perPage') || 20)));

  const where: any = {};
  const AND: any[] = [];
  if (q) {
    AND.push({
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { asin: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { tagsText: { contains: q } }
      ]
    });
  }
  if (material) AND.push({ material });
  if (hasImages) AND.push({ imagesText: { not: '' } });
  if (AND.length) where.AND = AND;

  const orderBy: Prisma.ProductOrderByWithRelationInput[] = (() => {
    switch (sort) {
      case 'createdAsc':
        return [{ createdAt: 'asc' as Prisma.SortOrder }];
      case 'titleAsc':
        return [{ title: 'asc' as Prisma.SortOrder }];
      case 'titleDesc':
        return [{ title: 'desc' as Prisma.SortOrder }];
      case 'clicksDesc':
        return [{ clicks: { _count: 'desc' as Prisma.SortOrder } }, { createdAt: 'desc' as Prisma.SortOrder }];
      case 'createdDesc':
      default:
        return [{ createdAt: 'desc' as Prisma.SortOrder }];
    }
  })();

  const total = await prisma.product.count({ where });
  const items = await prisma.product.findMany({
    where,
    include: { _count: { select: { clicks: true } } },
    orderBy,
    skip: (page - 1) * perPage,
    take: perPage
  });

  return NextResponse.json({ items, total, page, perPage });
}


