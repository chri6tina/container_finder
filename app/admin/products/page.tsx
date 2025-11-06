import Link from 'next/link';
import AdminProductsTable from '@/components/admin/AdminProductsTable';

export const metadata = { title: 'Admin · Products', robots: { index: false } };

export default async function AdminProductsPage() {
  return (
    <main className="py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link href="/admin/products/new" className="rounded-xl bg-blush-500 text-white px-4 py-2 hover:bg-blush-600">
          Add Product
        </Link>
      </div>
      <AdminProductsTable />
    </main>
  );
}


