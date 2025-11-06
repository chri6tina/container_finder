import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: 'i.imgur.com' }
    ]
  },
  eslint: {
    // Ignore ESLint errors during builds (useful to unblock CI/CD deploys)
    ignoreDuringBuilds: true
  },
  experimental: {
    reactCompiler: false
  }
};

export default nextConfig;


