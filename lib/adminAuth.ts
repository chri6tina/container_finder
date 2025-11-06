function parseCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  const parts = header.split(';').map((s) => s.trim());
  for (const p of parts) {
    const idx = p.indexOf('=');
    if (idx === -1) continue;
    const k = p.slice(0, idx);
    const v = p.slice(idx + 1);
    if (k === name) return decodeURIComponent(v);
  }
  return null;
}

export function requireAdmin(request: Request): void {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    throw new Error('ADMIN_SECRET not configured');
  }
  const header = request.headers.get('x-admin-secret') || '';
  const cookie = parseCookie(request.headers.get('cookie'), 'admin_session');
  const cookieOk = cookie === '1';
  const headerOk = header === secret;
  if (!cookieOk && !headerOk) {
    const err: any = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }
}



