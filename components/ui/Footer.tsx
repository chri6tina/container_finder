import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
        <div>
          © {new Date().getFullYear()} Container Finder. All rights reserved.
        </div>
        <nav className="flex flex-wrap items-center gap-4">
          <Link href="/about" className="hover:text-gray-900">About</Link>
          <Link href="/contact" className="hover:text-gray-900">Contact</Link>
          <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
          <Link href="/terms" className="hover:text-gray-900">Terms</Link>
          <Link href="/disclosure" className="hover:text-gray-900">Disclosure</Link>
          <Link href="/sitemap.xml" className="hover:text-gray-900">Sitemap</Link>
        </nav>
      </div>
    </footer>
  );
}
