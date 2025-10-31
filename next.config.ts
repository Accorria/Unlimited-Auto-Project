import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure Next.js uses this project directory as the root for tracing/build
  outputFileTracingRoot: __dirname,
  images: {
    domains: ['images.unsplash.com', 'caieldvdbpkrhgjmylve.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'caieldvdbpkrhgjmylve.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js'],
  },
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
