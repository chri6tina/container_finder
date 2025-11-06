"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = useCallback(
    (href: string) => (pathname === href || (href !== '/' && pathname?.startsWith(href)) ? 'text-gray-900' : 'text-gray-600'),
    [pathname]
  );

  const submitSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const q = query.trim();
      const url = q ? `/browse?q=${encodeURIComponent(q)}` : '/browse';
      router.push(url);
      setMenuOpen(false);
    },
    [query, router]
  );

  const navItems = useMemo(
    () => [
      { href: '/', label: 'Home' },
      { href: '/browse', label: 'Browse' },
      { href: '/compare', label: 'Compare' }
    ],
    []
  );

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-100">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            aria-label="Open menu"
            className="sm:hidden p-2 rounded-md border border-gray-200"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>

          <Link href="/" className="font-semibold tracking-tight text-gray-900">
            Container Finder
          </Link>

          <div className="hidden sm:flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm hover:text-gray-900 ${isActive(item.href)}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <form onSubmit={submitSearch} className="hidden sm:flex items-center gap-2 min-w-[260px]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search containers..."
            className="w-full rounded-xl border border-gray-200 px-3 py-2"
            aria-label="Search containers"
          />
          <button type="submit" className="rounded-xl bg-blush-500 px-4 py-2 text-white hover:bg-blush-600">
            Search
          </button>
        </form>
      </nav>

      {menuOpen ? (
        <div className="sm:hidden border-t border-gray-100">
          <div className="px-4 py-3 space-y-3">
            <form onSubmit={submitSearch} className="flex items-center gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search containers..."
                className="w-full rounded-xl border border-gray-200 px-3 py-2"
                aria-label="Search containers"
              />
              <button type="submit" className="rounded-xl bg-blush-500 px-4 py-2 text-white">Go</button>
            </form>
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-md px-2 py-2 ${isActive(item.href)}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
