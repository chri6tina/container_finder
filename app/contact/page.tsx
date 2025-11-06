export const metadata = { title: 'Contact | Container Finder' };

export default function ContactPage() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@example.com';
  return (
    <main className="py-8">
      <h1 className="text-2xl font-semibold mb-4">Contact</h1>
      <p className="text-gray-700 max-w-2xl">
        Have feedback or found an issue? Email us at{' '}
        <a href={`mailto:${email}`} className="underline">{email}</a>.
      </p>
    </main>
  );
}
