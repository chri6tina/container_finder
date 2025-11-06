import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="py-12">
      <section className="text-center space-y-6">
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight">
          Find the Perfect Container by Size
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Browse glass, plastic, silicone, and steel containers. Filter by capacity, dimensions,
          and features. Simple, precise, and curated for everyday life.
        </p>

        <div className="mx-auto max-w-xl mt-4 w-full">
          <form id="dimForm" action="/browse" method="get" className="flex flex-col gap-2 items-center">
            <input type="hidden" name="units" value="in" />
            <div className="text-sm text-gray-600">Dimensions (in)</div>
            <div className="flex items-center gap-3 justify-center">
              <input
                type="number"
                step="0.1"
                name="len"
                placeholder="L"
                className="w-24 sm:w-28 rounded-xl border border-gray-200 px-3 py-2 text-center"
                aria-label="Length (in)"
              />
              <input
                type="number"
                step="0.1"
                name="wid"
                placeholder="W"
                className="w-24 sm:w-28 rounded-xl border border-gray-200 px-3 py-2 text-center"
                aria-label="Width (in)"
              />
              <input
                type="number"
                step="0.1"
                name="ht"
                placeholder="H"
                className="w-24 sm:w-28 rounded-xl border border-gray-200 px-3 py-2 text-center"
                aria-label="Height (in)"
              />
            </div>
          </form>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            type="submit"
            form="dimForm"
            className="rounded-xl bg-blush-500 px-5 py-3 text-white shadow-soft hover:bg-blush-600 transition"
          >
            Browse Containers
          </button>
          <Link
            href="/compare"
            className="rounded-xl border border-gray-200 px-5 py-3 hover:bg-gray-50"
          >
            Compare
          </Link>
        </div>

      </section>

      

      

      <section className="mt-16">
        <h2 className="text-xl font-semibold mb-4">Popular Size Presets</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { label: '3.4 oz TSA', query: 'maxOz=3.4' },
            { label: '8 oz', query: 'minOz=7&maxOz=9' },
            { label: '16 oz (pint)', query: 'minOz=15&maxOz=17' },
            { label: '32 oz (quart)', query: 'minOz=30&maxOz=34' },
            { label: '64 oz', query: 'minOz=60&maxOz=68' },
            { label: 'Large Pantry', query: 'minMl=2000' }
          ].map((p) => (
            <Link
              key={p.label}
              href={`/browse?${p.query}`}
              className="rounded-xl border border-gray-200 p-3 text-center hover:bg-gray-50"
            >
              {p.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-semibold mb-4">Browse by Material</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Glass', m: 'GLASS' },
            { label: 'Plastic', m: 'PLASTIC' },
            { label: 'Silicone', m: 'SILICONE' },
            { label: 'Steel', m: 'STEEL' }
          ].map((p) => (
            <Link
              key={p.m}
              href={`/browse?materials=${p.m}`}
              className="rounded-xl border border-gray-200 p-4 text-center hover:bg-gray-50"
            >
              {p.label}
            </Link>
          ))}
        </div>
      </section>

      

      
    </main>
  );
}


