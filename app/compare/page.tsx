import { prisma } from '@/lib/db';

export default async function ComparePage({ searchParams }: { searchParams: { ids?: string } }) {
  const ids = (searchParams.ids ?? '').split(',').filter(Boolean).slice(0, 4);
  const raw = ids.length
    ? await prisma.product.findMany({ where: { id: { in: ids } }, include: { size: true } })
    : [];
  const items = raw.map((p) => ({
    ...p,
    features: p.featuresText ? p.featuresText.split(',').filter(Boolean) : []
  }));

  return (
    <main className="py-8">
      <h1 className="text-2xl font-semibold mb-4">Compare</h1>
      {items.length ? (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left p-3">Spec</th>
                {items.map((p) => (
                  <th key={p.id} className="text-left p-3 w-64">{p.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-3 text-gray-600">Material</td>
                {items.map((p: any) => (
                  <td key={p.id} className="p-3">{p.material}</td>
                ))}
              </tr>
              <tr className="border-t">
                <td className="p-3 text-gray-600">Capacity</td>
                {items.map((p: any) => (
                  <td key={p.id} className="p-3">
                    {p.size?.capacityOz ? `${p.size.capacityOz} oz` : p.size?.capacityMl ? `${p.size.capacityMl} ml` : p.size?.weightKg ? `${p.size.weightKg} kg` : '-'}
                  </td>
                ))}
              </tr>
              <tr className="border-t">
                <td className="p-3 text-gray-600">Features</td>
                {items.map((p: any) => (
                  <td key={p.id} className="p-3">{p.features.map((f) => f.replaceAll('_', ' ').toLowerCase()).join(', ')}</td>
                ))}
              </tr>
              <tr className="border-t">
                <td className="p-3 text-gray-600">Dimensions (cm)</td>
                {items.map((p) => (
                  <td key={p.id} className="p-3">{[p.size?.lengthCm, p.size?.widthCm, p.size?.heightCm].filter(Boolean).join(' × ') || '-'}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-gray-600">Add items to compare from the browse page.</div>
      )}
    </main>
  );
}


