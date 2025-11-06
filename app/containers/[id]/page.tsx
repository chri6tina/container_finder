import Image from 'next/image';
import { prisma } from '@/lib/db';
import { extractIdFromSegment, productDetailPath } from '@/lib/slug';
import { isWithinPercentRange, mlToOz, roundTo } from '@/lib/units';
import Link from 'next/link';

async function getData(idOrSegment: string) {
  const id = extractIdFromSegment(idOrSegment);
  const product = await prisma.product.findUnique({ where: { id }, include: { size: true } });
  return product;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id: raw } = await params;
  const id = extractIdFromSegment(raw);
  const product = await prisma.product.findUnique({ where: { id }, include: { size: true } });
  if (!product) return { title: 'Not Found' };
  return {
    title: `${product.title} | Container Finder`,
    description: (product as any).description || `${product.material} container`,
    alternates: { canonical: productDetailPath(product as any) }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getData(id);
  if (!product) {
    return (
      <div className="py-12">
        <h1 className="text-2xl font-semibold mb-2">Not found</h1>
        <p className="text-gray-600">This container does not exist.</p>
      </div>
    );
  }

  const capacityMl = product.size?.capacityMl ?? undefined;
  const capacityOz = capacityMl ? roundTo(mlToOz(capacityMl), 1) : product.size?.capacityOz ?? undefined;
  const weightKg = (product.size as any)?.weightKg ?? undefined;
  const images = product.imagesText ? product.imagesText.split('|').filter(Boolean) : [];
  const firstImage = images[0];
  const allowedHosts = new Set(['m.media-amazon.com', 'i.imgur.com']);
  let image: string | undefined;
  if (firstImage) {
    try {
      const u = new URL(firstImage);
      if (allowedHosts.has(u.hostname)) image = firstImage;
    } catch {
      // ignore bad URL
    }
  }
  const features = product.featuresText ? product.featuresText.split(',').filter(Boolean) : [];

  // Related: within ±8% capacity and same material
  const related = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      material: product.material,
      size: capacityMl
        ? {
            capacityMl: {
              gte: capacityMl * 0.92,
              lte: capacityMl * 1.08
            }
          }
        : undefined
    },
    take: 8,
    include: { size: true }
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    brand: product.brand,
    url: product.affiliateUrl,
    image: images,
    material: product.material
    // TODO: Add offers when price is integrated via PA-API
  } as const;

  return (
    <main className="py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative aspect-[4/3] bg-gray-50 rounded-xl overflow-hidden">
          {image ? (
            <Image src={image} alt={product.title} fill className="object-contain" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">No image</div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-semibold mb-2">{product.title}</h1>
          <div className="text-gray-600 mb-4">{product.brand}</div>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="rounded-full bg-gray-100 px-2 py-1">{product.material}</span>
            {features.map((f) => (
              <span key={f} className="rounded-full bg-gray-100 px-2 py-1 text-sm">
                {f.replaceAll('_', ' ').toLowerCase()}
              </span>
            ))}
          </div>
          <div className="mb-6">
            <table className="min-w-[280px] text-sm">
              <tbody>
                {capacityOz ? (
                  <tr>
                    <td className="pr-4 text-gray-600">Capacity</td>
                    <td>
                      {capacityOz} oz{capacityMl ? ` (${capacityMl} ml)` : ''}
                    </td>
                  </tr>
                ) : null}
                {weightKg ? (
                  <tr>
                    <td className="pr-4 text-gray-600">Weight capacity</td>
                    <td>{weightKg} kg</td>
                  </tr>
                ) : null}
                {product.size?.lengthCm ? (
                  <tr>
                    <td className="pr-4 text-gray-600">Length</td>
                    <td>{product.size.lengthCm} cm</td>
                  </tr>
                ) : null}
                {product.size?.widthCm ? (
                    <tr>
                      <td className="pr-4 text-gray-600">Width</td>
                      <td>{product.size.widthCm} cm</td>
                    </tr>
                ) : null}
                {product.size?.heightCm ? (
                  <tr>
                    <td className="pr-4 text-gray-600">Height</td>
                    <td>{product.size.heightCm} cm</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <form action={product.affiliateUrl} method="get" target="_blank" rel="noopener noreferrer" onSubmit={async () => {
            'use server';
            // Note: Server Actions cannot run here for external redirect; clicks are tracked via client in ProductCard.
          }}>
            <Link
              href={product.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-blush-500 px-5 py-3 text-white shadow-soft hover:bg-blush-600 inline-block"
            >
              View on Amazon
            </Link>
          </form>
          {(product as any).description ? (
            <div className="mt-4 text-gray-700 leading-relaxed whitespace-pre-wrap">
              {(product as any).description}
            </div>
          ) : null}
          {/* TODO: Add price/availability integration via PA-API later */}
        </div>
      </div>

      {related.length ? (
        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Related</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((r) => (
              <Link key={r.id} href={productDetailPath(r as any)} className="rounded-xl border border-gray-200 p-3 hover:bg-gray-50">
                <div className="font-medium line-clamp-2">{r.title}</div>
                <div className="text-sm text-gray-600">{r.size?.capacityMl ? `${roundTo(mlToOz(r.size.capacityMl), 0)} oz` : ''}</div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}


