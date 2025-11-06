import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="border-b border-gray-100 bg-white">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-12 flex items-center gap-4 text-sm">
          <Link href="/admin" className="text-gray-700 hover:text-gray-900">Admin</Link>
          <span className="text-gray-300">|</span>
          <Link href="/admin/products" className="text-gray-700 hover:text-gray-900">Products</Link>
          <Link href="/admin/products/new" className="text-gray-700 hover:text-gray-900">Add Product</Link>
          <Link href="/admin/insights" className="text-gray-700 hover:text-gray-900">Insights</Link>
          <Link href="/admin/notes" className="text-gray-700 hover:text-gray-900">Notes</Link>
        </nav>
      </div>
      {children}
    </div>
  );
}


