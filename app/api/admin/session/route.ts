import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function jsonError(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function GET(request: Request) {
  const cookie = request.headers.get('cookie') || '';
  const has = /(?:^|;\s*)admin_session=1(?:;|$)/.test(cookie);
  const configured = !!(process.env.ADMIN_SECRET || process.env.NEXT_PUBLIC_ADMIN_SECRET);
  return NextResponse.json({ ok: has, configured });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({} as any));
  const secret = body?.secret as string | undefined;
  const token = body?.token as string | undefined;

  // Option 1: Header/secret login (legacy)
  const expected = process.env.ADMIN_SECRET || process.env.NEXT_PUBLIC_ADMIN_SECRET || '';
  if (secret) {
    if (!expected) return jsonError('Server not configured', 500);
    if (secret !== expected) return jsonError('Invalid credentials', 401);
  } else if (token) {
    // Option 2: Supabase token login
    try {
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !data?.user) {
        return jsonError('Invalid Supabase token', 401);
      }
      const allowed = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const email = (data.user.email || '').toLowerCase();
      if (allowed.length && !allowed.includes(email)) {
        return jsonError('Not authorized for admin', 403);
      }
    } catch (e) {
      return jsonError('Auth verification failed', 401);
    }
  } else {
    return jsonError('Missing credentials', 400);
  }
  const res = NextResponse.json({ ok: true });
  // HttpOnly cookie for admin session
  res.headers.append(
    'Set-Cookie',
    `admin_session=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 8}; ${
      process.env.NODE_ENV === 'production' ? 'Secure' : ''
    }`
  );
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.headers.append(
    'Set-Cookie',
    `admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; ${
      process.env.NODE_ENV === 'production' ? 'Secure' : ''
    }`
  );
  return res;
}


