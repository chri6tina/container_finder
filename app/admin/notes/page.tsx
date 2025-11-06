"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Note = { id: string; content: string; createdAt: string };

export default function AdminNotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/notes', { cache: 'no-store', credentials: 'same-origin' });
      if (!r.ok) {
        const t = await r.text().catch(() => '');
        setError(`Failed to load notes (${r.status}). ${t || ''}`);
        setNotes([]);
        return;
      }
      const j = await r.json().catch(() => ({}));
      setNotes((j as any).items || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!content.trim()) return;
    setLoading(true);
    try {
      const r = await fetch('/api/admin/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ content })
      });
      if (!r.ok) {
        const t = await r.text().catch(() => '');
        let msg = 'Failed to save note';
        try {
          const j = JSON.parse(t);
          if (j?.error) msg = j.error;
        } catch {}
        setError(`${msg} (${r.status})`);
        return;
      }
      setContent('');
      await load();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notes</h1>
        <Link href="/admin" className="text-gray-600 underline">Back to Admin</Link>
      </div>

      <form onSubmit={onAdd} className="rounded-xl border border-gray-200 p-4 bg-white shadow-soft space-y-3">
        <label className="text-sm font-medium">Add a note (auto-dated)</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="Write your note here..."
          className="w-full rounded-xl border border-gray-200 px-3 py-2"
        />
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="rounded-xl bg-gray-900 text-white px-4 py-2 disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Add Note'}
        </button>
      </form>

      <section className="rounded-xl border border-gray-200 bg-white shadow-soft">
        <div className="p-4 border-b border-gray-100 text-sm text-gray-600">
          {loading ? 'Loading…' : `${notes.length} note(s)`}
        </div>
        <ul className="divide-y">
          {notes.map((n) => (
            <li key={n.id} className="p-4">
              <div className="text-xs text-gray-500 mb-1">{new Date(n.createdAt).toLocaleString()}</div>
              <div className="whitespace-pre-wrap">{n.content}</div>
            </li>
          ))}
          {!notes.length ? <li className="p-4 text-gray-600 text-sm">No notes yet.</li> : null}
        </ul>
      </section>
    </main>
  );
}


