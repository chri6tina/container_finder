"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get('next') || '/admin';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data, error: sError } = await supabase.auth.signInWithPassword({ email, password });
      if (sError || !data.session?.access_token) {
        setError(sError?.message || 'Invalid email or password');
        return;
      }
      const token = data.session.access_token;
      const res = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ token })
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j?.error || 'Auth failed');
        return;
      }
      router.replace(next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="py-12">
      <div className="mx-auto max-w-sm rounded-xl border border-gray-200 p-6 bg-white shadow-soft">
        <h1 className="text-xl font-semibold mb-2">Admin Sign In</h1>
        <p className="text-sm text-gray-600 mb-4">Sign in with your admin email and password.</p>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-gray-200 px-3 py-2"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-gray-200 px-3 py-2"
          />
          {error ? <div className="text-sm text-red-600">{error}</div> : null}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full rounded-xl bg-gray-900 text-white px-4 py-2 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <div className="text-xs text-gray-600 mt-4">
          <Link href="/" className="underline">Back to site</Link>
        </div>
      </div>
    </main>
  );
}


