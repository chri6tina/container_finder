import { NextResponse } from 'next/server';

function mask(s?: string | null) {
  if (!s) return null;
  const str = String(s);
  if (str.length <= 12) return `${str.slice(0, 3)}...${str.slice(-3)}`;
  return `${str.slice(0, 6)}...${str.slice(-6)}`;
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || null;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || null;
  return NextResponse.json({
    url,
    anonPresent: !!anon,
    servicePresent: !!service,
    anonFirstLast: mask(anon || undefined),
    serviceFirstLast: mask(service || undefined),
    anonLen: anon ? anon.length : 0,
    serviceLen: service ? service.length : 0
  });
}


