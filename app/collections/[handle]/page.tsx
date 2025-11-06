import { prisma } from '@/lib/db';
import ProductCard from '@/components/ui/ProductCard';
import CompareBar from '@/components/ui/CompareBar';
import { useCompare } from '@/lib/useCompare';

const COLLECTIONS: Record<string, { title: string; where: any }> = {
  travel: {
    title: 'Travel Containers',
    where: { OR: [{ category: 'Travel' }, { tagsText: { contains: ',travel,' } }, { tagsText: { contains: ',tsa,' } }] }
  },
  makeup: {
    title: 'Makeup & Vanity',
    where: { OR: [{ category: 'Makeup' }, { tagsText: { contains: ',makeup,' } }, { tagsText: { contains: ',vanity,' } }] }
  },
  pantry: {
    title: 'Pantry Storage',
    where: { OR: [{ category: 'Pantry' }, { tagsText: { contains: ',pantry,' } }] }
  },
  'meal-prep': {
    title: 'Meal Prep',
    where: { OR: [{ category: 'Meal Prep' }, { tagsText: { contains: ',meal-prep,' } }] }
  },
  'breastmilk-storage': {
    title: 'Breastmilk Storage',
    where: { OR: [{ category: 'Breastmilk Storage' }, { tagsText: { contains: ',breastmilk,' } }] }
  }
};

export async function generateMetadata({ params }: { params: { handle: string } }) {
  const meta = COLLECTIONS[params.handle];
  return { title: meta ? `${meta.title} | Container Finder` : 'Collection | Container Finder' };
}

export default async function CollectionPage({ params }: { params: { handle: string } }) {
  const config = COLLECTIONS[params.handle];
  if (!config) {
    return (
      <div className="py-12">
        <h1 className="text-2xl font-semibold mb-2">Not found</h1>
        <p className="text-gray-600">This collection does not exist.</p>
      </div>
    );
  }
  const itemsRaw = await prisma.product.findMany({ where: config.where, include: { size: true } });
  const items = itemsRaw.map((p) => ({
    ...p,
    images: p.imagesText ? p.imagesText.split('|').filter(Boolean) : [],
    features: p.featuresText ? p.featuresText.split(',').filter(Boolean) : []
  }));
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: config.title,
    itemListElement: items.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: p.affiliateUrl, name: p.title }))
  } as const;
  return (
    <main className="py-8">
      <h1 className="text-2xl font-semibold mb-4">{config.title}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((p: any) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      <CompareBar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}


