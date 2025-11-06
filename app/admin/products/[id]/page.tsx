import { prisma } from '@/lib/db';
import AdminEditProductForm from '@/components/admin/AdminEditProductForm';

export const metadata = { title: 'Admin · Edit Product', robots: { index: false } };

export default async function AdminEditProductPage({ params }: { params: { id: string } }) {
  const p = await prisma.product.findUnique({ where: { id: params.id }, include: { size: true } });
  if (!p) {
    return (
      <main className="py-8">
        <h1 className="text-2xl font-semibold mb-2">Not found</h1>
        <p className="text-gray-600">This product does not exist.</p>
      </main>
    );
  }
  const product = {
    id: p.id,
    asin: p.asin,
    title: p.title,
    brand: p.brand ?? null,
    category: p.category ?? null,
    material: p.material as any,
    shape: (p.shape as any) ?? null,
    images: p.imagesText ? p.imagesText.split('|').filter(Boolean) : [],
    tags: p.tagsText ? p.tagsText.replace(/^,|,$/g, '').split(',').filter(Boolean) : [],
    features: p.featuresText ? p.featuresText.replace(/^,|,$/g, '').split(',').filter(Boolean) as any : [],
    affiliateUrl: p.affiliateUrl,
    size: p.size
  };

  return (
    <main className="py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Edit Product</h1>
      <AdminEditProductForm product={product} />
    </main>
  );
}


