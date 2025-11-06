import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { z } from 'zod';

export async function GET(request: Request) {
  try {
    requireAdmin(request);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unauthorized' }, { status: e?.status || 401 });
  }
  const notes = await prisma.note.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  return NextResponse.json({ items: notes });
}

export async function POST(request: Request) {
  try {
    requireAdmin(request);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unauthorized' }, { status: e?.status || 401 });
  }
  try {
    const body = await request.json();
    const schema = z.object({ content: z.string().min(1).max(5000) });
    const { content } = schema.parse(body);
    const created = await prisma.note.create({ data: { content } });
    return NextResponse.json({ ok: true, note: created });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Invalid request' }, { status: 400 });
  }
}


