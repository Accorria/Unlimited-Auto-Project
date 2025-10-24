import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix for multiple lockfiles warning
  outputFileTracingRoot: '/Users/prestoneaton/Unlimited Auto Project',
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
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
};

export default nextConfig;
