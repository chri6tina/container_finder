import { prisma } from '@/lib/db';

function Sparkline({ points }: { points: number[] }) {
  const max = Math.max(1, ...points);
  const w = 200;
  const h = 40;
  const step = points.length > 1 ? w / (points.length - 1) : w;
  const d = points
    .map((p, i) => {
      const x = i * step;
      const y = h - (p / max) * h;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="text-blush-500">
      <path d={d} fill="none" stroke="currentColor" strokeWidth={2} />
    </svg>
  );
}

export default async function InsightsPage() {
  // Top outbound products
  const top = await prisma.click.groupBy({ by: ['productId'], _count: { productId: true }, orderBy: { _count: { productId: 'desc' } }, take: 10 });
  const topProducts = await prisma.product.findMany({ where: { id: { in: top.map((t) => t.productId) } } });
  const productMap = new Map(topProducts.map((p) => [p.id, p]));

  // Clicks by collection (source starts with 'collection:')
  const collectionClicks = await prisma.click.findMany({ where: { source: { startsWith: 'collection:' } } });
  const byCollection = collectionClicks.reduce<Record<string, number>>((acc, c) => {
    const key = c.source ?? 'unknown';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  // Clicks over last 14 days
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const clicks = await prisma.click.findMany({ where: { createdAt: { gte: since } } });
  const byDay = Array.from({ length: 14 }).map((_, i) => {
    const day = new Date(since.getTime() + i * 24 * 60 * 60 * 1000);
    const key = day.toISOString().slice(0, 10);
    const count = clicks.filter((c) => c.createdAt.toISOString().slice(0, 10) === key).length;
    return { key, count };
  });

  return (
    <main className="py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Insights</h1>
      </div>

      <section>
        <h2 className="text-lg font-medium mb-3">Top Outbound Products</h2>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Product</th>
                <th className="text-left p-3">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {top.map((t) => (
                <tr key={t.productId} className="border-t">
                  <td className="p-3">{productMap.get(t.productId)?.title ?? t.productId}</td>
                  <td className="p-3">{t._count.productId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-3">Clicks by Collection</h2>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Collection</th>
                <th className="text-left p-3">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(byCollection).map(([k, v]) => (
                <tr key={k} className="border-t">
                  <td className="p-3">{k.replace('collection:', '')}</td>
                  <td className="p-3">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-3">Clicks over Time (14d)</h2>
        <div className="rounded-xl border border-gray-200 p-4">
          <Sparkline points={byDay.map((d) => d.count)} />
        </div>
      </section>
    </main>
  );
}


