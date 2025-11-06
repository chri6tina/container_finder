import Link from 'next/link';

export const metadata = { title: 'Admin', robots: { index: false } };

const links = [
  { href: '/admin/products', title: 'Products', desc: 'View and manage products' },
  { href: '/admin/products/new', title: 'Add Product', desc: 'Paste Amazon URL/ASIN and save' },
  { href: '/admin/insights', title: 'Insights', desc: 'Top clicks and trends' },
  { href: '/admin/notes', title: 'Notes', desc: 'Capture dated improvement notes' }
];

export default function AdminHomePage() {
  return (
    <main className="py-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <Link
          href="/admin/agent"
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
        >
          ChatGPT Agent Read This
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-xl border border-gray-200 p-4 hover:bg-gray-50 shadow-soft"
          >
            <div className="font-medium">{l.title}</div>
            <div className="text-sm text-gray-600">{l.desc}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}


