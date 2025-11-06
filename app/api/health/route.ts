import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function detectDbKind(url?: string | null): 'postgres' | 'sqlite' | 'unknown' {
  if (!url) return 'unknown';
  const u = url.toLowerCase();
  if (u.startsWith('postgres://') || u.startsWith('postgresql://')) return 'postgres';
  if (u.startsWith('file:') || u.startsWith('sqlite:')) return 'sqlite';
  return 'unknown';
}

function dbUrlDisplay(url?: string | null) {
  if (!url) return null;
  const kind = detectDbKind(url);
  if (kind === 'postgres') {
    try {
      const u = new URL(url);
      return `${u.protocol}//${u.hostname}:${u.port || '5432'}`;
    } catch {
      return 'postgres:?';
    }
  }
  if (kind === 'sqlite') {
    // show the file path for clarity
    return `sqlite:${url.replace(/^file:/i, '')}`;
  }
  return url.split('?')[0];
}

export async function GET(request: Request) {
  const url = process.env.DATABASE_URL || null;
  const kind = detectDbKind(url);
  const display = dbUrlDisplay(url);
  try {
    if (process.env.NODE_ENV === 'production') {
      const secret = process.env.HEALTH_SECRET || '';
      const header = request.headers.get('x-health-secret') || '';
      if (!secret || header !== secret) {
        return NextResponse.json({ ok: true }, { status: 200 });
      }
    }
    const productCount = await prisma.product.count();
    let dbVersion = 'unknown';
    if (kind === 'postgres') {
      const rows = await prisma.$queryRawUnsafe<any[]>(`select version() as version`);
      dbVersion = Array.isArray(rows) && rows[0] ? (rows[0].version as string) : 'postgres';
    } else if (kind === 'sqlite') {
      const rows = await prisma.$queryRawUnsafe<any[]>(`select sqlite_version() as version`);
      dbVersion = Array.isArray(rows) && rows[0] ? (rows[0].version as string) : 'sqlite';
    }
    return NextResponse.json({ ok: true, dbKind: kind, dbUrl: display, productCount, dbVersion });
  } catch (e: any) {
    return NextResponse.json({ ok: false, dbKind: kind, dbUrl: display, error: e?.message || String(e) }, { status: 500 });
  }
}


