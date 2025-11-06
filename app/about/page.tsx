export const metadata = { title: 'About | Container Finder' };

export default function AboutPage() {
  return (
    <main className="py-8">
      <h1 className="text-2xl font-semibold mb-4">About</h1>
      <p className="text-gray-700 max-w-2xl">
        Container Finder helps you quickly discover containers by size, material, and features. We curate and
        normalize product data so you can compare options with confidence.
      </p>
    </main>
  );
}
