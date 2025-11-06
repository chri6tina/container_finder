import { NextResponse } from 'next/server';

async function check(url: string, key: string) {
  try {
    const r = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: 'no-store'
    });
    const text = await r.text().catch(() => '');
    return { status: r.status, ok: r.ok, body: text.slice(0, 500) };
  } catch (e: any) {
    return { status: 0, ok: false, body: String(e?.message || e) };
  }
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const hasUrl = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url.trim());
  const refFromAnon = (() => {
    try {
      const payload = anon.split('.')[1];
      if (!payload) return null;
      const json = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
      return json?.ref || null;
    } catch {
      return null;
    }
  })();
  const anonCheck = url && anon ? await check(url, anon) : null;
  const serviceCheck = url && service ? await check(url, service) : null;
  return NextResponse.json({
    url,
    hasUrl,
    anonSet: !!anon,
    serviceSet: !!service,
    refFromAnon,
    anonCheck,
    serviceCheck
  });
}


