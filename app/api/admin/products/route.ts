import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/adminAuth';
import { rateLimit, ipKey } from '@/lib/rateLimit';

const schema = z.object({
  asin: z.string().regex(/^[A-Z0-9]{10}$/i),
  title: z.string().min(2),
  brand: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  material: z.enum(['GLASS', 'PLASTIC', 'SILICONE', 'STEEL']),
  shape: z.enum(['ROUND', 'SQUARE', 'RECTANGULAR', 'OVAL', 'OTHER']).optional().nullable(),
  images: z.array(z.string().url()).min(1),
  tags: z.array(z.string()).default([]),
  features: z.array(z.enum(['LEAKPROOF', 'STACKABLE', 'DISHWASHER_SAFE', 'MICROWAVE_SAFE', 'BPA_FREE'])).default([]),
  affiliateUrl: z.string().url(),
  description: z.string().optional().nullable(),
  capacityMl: z.number().optional().nullable(),
  capacityOz: z.number().optional().nullable(),
  weightKg: z.number().optional().nullable(),
  lengthCm: z.number().optional().nullable(),
  widthCm: z.number().optional().nullable(),
  heightCm: z.number().optional().nullable()
});

export async function POST(req: Request) {
  try {
    // Admin auth + rate limit
    requireAdmin(req);
    if (!rateLimit(ipKey(req, 'admin:post-product'), 30, 60_000)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    const json = await req.json();
    const data = schema.parse(json);

    const sizeCreate: any = {
      capacityMl: typeof data.capacityMl === 'number' ? data.capacityMl : undefined,
      capacityOz: typeof data.capacityOz === 'number' ? data.capacityOz : undefined,
      weightKg: typeof data.weightKg === 'number' ? data.weightKg : undefined,
      lengthCm: typeof data.lengthCm === 'number' ? data.lengthCm : undefined,
      widthCm: typeof data.widthCm === 'number' ? data.widthCm : undefined,
      heightCm: typeof data.heightCm === 'number' ? data.heightCm : undefined
    };
    // prune undefined
    Object.keys(sizeCreate).forEach((k) => sizeCreate[k] === undefined && delete sizeCreate[k]);
    const hasSize = Object.keys(sizeCreate).length > 0;

    try {
      const created = await prisma.product.create({
        data: ({
          asin: data.asin,
          title: data.title,
          brand: data.brand || undefined,
          category: data.category || undefined,
          material: data.material,
          shape: data.shape || undefined,
          imagesText: data.images.join('|'),
          tagsText: `,${data.tags.join(',')},`,
          featuresText: `,${data.features.join(',')},`,
          affiliateUrl: data.affiliateUrl,
          description: data.description || undefined,
          ...(hasSize ? { size: { create: sizeCreate } } : {})
        }) as any
      });
      return NextResponse.json({ ok: true, product: created });
    } catch (err: any) {
      const msg = String(err?.message || '');
      if (msg.includes('Unknown argument `weightKg`')) {
        // Retry without weightKg for environments not yet migrated
        delete sizeCreate.weightKg;
        const hasSizeRetry = Object.keys(sizeCreate).length > 0;
        const created2 = await prisma.product.create({
          data: ({
            asin: data.asin,
            title: data.title,
            brand: data.brand || undefined,
            category: data.category || undefined,
            material: data.material,
            shape: data.shape || undefined,
            imagesText: data.images.join('|'),
            tagsText: `,${data.tags.join(',')},`,
            featuresText: `,${data.features.join(',')},`,
            affiliateUrl: data.affiliateUrl,
            description: data.description || undefined,
            ...(hasSizeRetry ? { size: { create: sizeCreate } } : {})
          }) as any
        });
        return NextResponse.json({ ok: true, product: created2, note: 'Saved without weightKg (migration pending)' });
      }
      throw err;
    }
  } catch (e: any) {
    const err = e as any;
    // Surface Prisma error codes for easier debugging
    const code = err?.code as string | undefined;
    const meta = err?.meta as Record<string, unknown> | undefined;
    const msg = code ? `${err.message} (code ${code})` : err?.message || 'Invalid payload';
    return NextResponse.json({ error: msg, code, meta }, { status: 400 });
  }
}


