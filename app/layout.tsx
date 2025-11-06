import type { ReactNode } from 'react';
import './globals.css';
import ComplianceNote from '@/components/ComplianceNote';
import NavBar from '@/components/ui/NavBar';
import Footer from '@/components/ui/Footer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Container Finder',
    template: '%s | Container Finder'
  },
  description: 'Find containers by size, material, and features.',
  openGraph: {
    title: 'Container Finder',
    description: 'Find containers by size, material, and features.',
    url: siteUrl,
    siteName: 'Container Finder',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Container Finder',
    description: 'Find containers by size, material, and features.'
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased text-gray-800">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-white border border-gray-200 rounded-md px-3 py-2 shadow-soft">Skip to content</a>
        {/* TODO: Affiliate disclosure banner mounts here */}
        <ComplianceNote />
        <NavBar />
        <main id="main" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}


