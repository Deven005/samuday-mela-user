import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [{ hostname: '**', pathname: '**' }],
  },
  allowedDevOrigins: ['http://192.168.31.149', '*.192.168.31.149'],
};

export default nextConfig;
