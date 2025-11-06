import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/adminAuth';

export async function POST(request: Request) {
  try {
    requireAdmin(request);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unauthorized' }, { status: e?.status || 401 });
  }
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'email and password are required' }, { status: 400 });
    }
    // Check if user exists
    const existing = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1, email });
    const user =
      existing.data?.users?.find((u) => (u.email || '').toLowerCase() === String(email).toLowerCase()) || null;
    if (!user) {
      const res = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'admin' }
      });
      if (res.error) return NextResponse.json({ error: res.error.message }, { status: 400 });
      return NextResponse.json({ ok: true, created: true, id: res.data.user?.id });
    } else {
      const upd = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password,
        email_confirm: true,
        user_metadata: { ...(user.user_metadata || {}), role: 'admin' }
      } as any);
      if (upd.error) return NextResponse.json({ error: upd.error.message }, { status: 400 });
      return NextResponse.json({ ok: true, created: false, id: user.id });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Invalid request' }, { status: 400 });
  }
}


