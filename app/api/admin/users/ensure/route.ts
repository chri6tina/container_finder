import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/adminAuth';

async function findAdminUserByEmail(email: string) {
  const normalizedEmail = String(email).toLowerCase();
  const perPage = 200;
  for (let page = 1; page < 1000; page += 1) {
    const response = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (response.error) {
      throw response.error;
    }
    const users = response.data.users ?? [];
    const match = users.find((u) => (u.email || '').toLowerCase() === normalizedEmail);
    if (match) {
      return match;
    }
    if (users.length < perPage) {
      break;
    }
  }
  return null;
}

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
    const user = await findAdminUserByEmail(email);
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


