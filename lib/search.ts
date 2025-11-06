import type { Prisma } from '@prisma/client';

export type SortOption = 'popularity' | 'capacityAsc' | 'capacityDesc';

export interface SearchParams {
  q?: string;
  minMl?: number;
  maxMl?: number;
  minOz?: number;
  maxOz?: number;
  len?: number;
  wid?: number;
  ht?: number;
  units?: 'in' | 'cm';
  materials?: string[];
  features?: string[];
  shape?: string;
  sort?: SortOption;
}

export function buildWhere(params: SearchParams): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};
  const and: Prisma.ProductWhereInput[] = [];

  if (params.q) {
    and.push({
      OR: [
        { title: { contains: params.q, mode: 'insensitive' } },
        { brand: { contains: params.q, mode: 'insensitive' } },
        { tagsText: { contains: params.q } }
      ]
    });
  }

  if (params.materials?.length) {
    and.push({ material: { in: params.materials as any } });
  }

  if (params.features?.length) {
    for (const f of params.features) {
      and.push({ featuresText: { contains: `,${f},` } });
    }
  }

  if (params.shape) {
    and.push({ shape: params.shape as any });
  }

  if (
    params.minMl != null ||
    params.maxMl != null ||
    params.minOz != null ||
    params.maxOz != null
  ) {
    const size: Prisma.SizeWhereInput = {};
    size.capacityMl = {};
    if (params.minMl != null) size.capacityMl.gte = params.minMl;
    if (params.maxMl != null) size.capacityMl.lte = params.maxMl;
    // Note: We also denorm capacityOz for quick filters
    if (params.minOz != null || params.maxOz != null) {
      size.OR = [{ capacityOz: {} }];
      const capOz = size.OR[0].capacityOz!;
      if (params.minOz != null) capOz.gte = params.minOz;
      if (params.maxOz != null) capOz.lte = params.maxOz;
    }
    and.push({ size: { AND: size } });
  }

  // Orientation-insensitive dimension matching with small tolerance
  if (params.len != null || params.wid != null || params.ht != null) {
    const tol = 0.5; // centimeters tolerance

    const range = (v: number) => ({ gte: v - tol, lte: v + tol });

    // Build conditions for L/W possibly swapped
    if (params.len != null && params.wid != null) {
      const condA: Prisma.SizeWhereInput = {
        lengthCm: range(params.len),
        widthCm: range(params.wid)
      };
      const condB: Prisma.SizeWhereInput = {
        lengthCm: range(params.wid),
        widthCm: range(params.len)
      };
      if (params.ht != null) {
        condA.heightCm = range(params.ht);
        condB.heightCm = range(params.ht);
      }
      and.push({ size: { OR: [condA, condB] } });
    } else if (params.len != null || params.wid != null) {
      const v = (params.len ?? params.wid)!;
      const or: Prisma.SizeWhereInput[] = [
        { lengthCm: range(v) },
        { widthCm: range(v) }
      ];
      // If height provided as well, require it in both alternatives
      if (params.ht != null) {
        or[0].heightCm = range(params.ht);
        or[1].heightCm = range(params.ht);
      }
      and.push({ size: { OR: or } });
    } else if (params.ht != null) {
      and.push({ size: { heightCm: range(params.ht) } });
    }
  }

  if (and.length) where.AND = and;
  return where;
}

export function buildOrderBy(sort?: SortOption): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case 'capacityAsc':
      return [{ size: { capacityMl: 'asc' } }];
    case 'capacityDesc':
      return [{ size: { capacityMl: 'desc' } }];
    case 'popularity':
    default:
      return [{ clicks: { _count: 'desc' } }, { createdAt: 'desc' }];
  }
}


