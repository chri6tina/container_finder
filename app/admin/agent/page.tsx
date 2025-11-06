export const metadata = { title: 'Agent Instructions', robots: { index: false } };

export default function AgentInstructionsPage() {
  return (
    <main className="py-8 space-y-6">
      <h1 className="text-2xl font-semibold">ChatGPT Agent: Read This First</h1>
      <section className="rounded-xl border border-gray-200 bg-white shadow-soft p-5 space-y-4">
        <div>
          <h2 className="text-lg font-medium">Goal</h2>
          <p className="text-gray-700">
            Create high-quality container product entries in our catalog with complete details and images, then publish without asking for additional permission.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-medium">How the System Works</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Use <span className="font-mono">/admin/products/new</span> to add a product.</li>
            <li>Paste an Amazon product URL or ASIN in the first field and click <b>Prefill</b> to extract title, brand, images, features, capacity, and dimensions.</li>
            <li>Edit or complete remaining fields (material, shape, features, description, tags).</li>
            <li>Click <b>Save Product</b> to post immediately.</li>
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-medium">Data Requirements</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li><b>Title</b>: Clear and specific (include size/material if helpful).</li>
            <li><b>Brand</b>: From Amazon page (byline or JSON-LD).</li>
            <li><b>Images</b>: Use prefill; ensure at least one good-quality image.</li>
            <li><b>Material</b>: One of GLASS, PLASTIC, SILICONE, STEEL.</li>
            <li><b>Shape</b>: ROUND, SQUARE, RECTANGULAR, OVAL, OTHER.</li>
            <li><b>Capacity</b>: Fill oz/ml (convert if needed). Weight kg optional.</li>
            <li><b>Dimensions</b>: L × W × H (cm). Convert from inches if needed.</li>
            <li><b>Features</b>: LEAKPROOF, STACKABLE, DISHWASHER_SAFE, MICROWAVE_SAFE, BPA_FREE (detect from bullets).</li>
            <li><b>Description</b>: Short SEO blurb summarizing value and use cases.</li>
            <li><b>Tags</b>: Comma-separated; relevant uses (e.g., pantry, meal prep, travel).</li>
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-medium">Affiliate Link</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Open the Amazon product page while signed into the Amazon Associates toolbar.</li>
            <li>Click <b>Get Link</b> at the top; generate a short/text link.</li>
            <li>Ensure the tracking ID is set to <b>container finder</b> (our tracking ID). If needed, edit the <span className="font-mono">tag=</span> query param to our ID.</li>
            <li>Paste the final affiliate URL into the <b>Affiliate URL</b> field.</li>
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-medium">Deduping & Coverage</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Before saving, check if the ASIN already exists via Admin list or search.</li>
            <li>If a 5×7 size exists, prefer a different size; however, multiple variants of a popular size are allowed if they differ by brand, material, or features.</li>
            <li>Aim for breadth (sizes, materials) and depth (variations and brands).</li>
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-medium">Quality Bar</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Fill in as much as possible. Convert units where needed (oz↔ml, in↔cm).</li>
            <li>Use clean titles; avoid marketing fluff. Keep descriptions concise and helpful.</li>
            <li>Ensure images render from allowed hosts (Amazon CDN preferred).</li>
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-medium">Publish Policy</h2>
          <p className="text-gray-700">
            Post without asking for permission once required fields are complete. If an essential field is missing and cannot be inferred, skip that product and move on.
          </p>
        </div>
        <div className="text-sm text-gray-600">
          Tip: Use the Admin list search to check ASINs or titles quickly before adding a new item.
        </div>
        <div>
          <h2 className="text-lg font-medium">Continuous Improvement</h2>
          <p className="text-gray-700">
            At the end of each work session, create a brief <b>Improvement Notes</b> section with today&apos;s date and bullet points on how we can improve this system (workflow gaps, missing fields, scraping improvements, UI tweaks, data validation, etc.). Post these notes without waiting for approval. We will add an in-app, dated notes system next; until then, include the dated notes inline in your final update.
          </p>
        </div>
      </section>
    </main>
  );
}


