import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { rateLimit, ipKey } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    if (!rateLimit(ipKey(request, 'clicks'), 20, 60_000)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    const schema = z.object({
      productId: z.string().min(10).max(64),
      source: z.string().max(64).optional().nullable()
    });
    const body = schema.parse(await request.json());
    // Ensure product exists to avoid junk rows
    const exists = await prisma.product.findUnique({ where: { id: body.productId }, select: { id: true } });
    if (!exists) return NextResponse.json({ error: 'Unknown product' }, { status: 404 });
    const src = (body.source || undefined)?.slice(0, 64);
    const click = await prisma.click.create({ data: { productId: body.productId, source: src } });
    return NextResponse.json({ ok: true, click });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}


