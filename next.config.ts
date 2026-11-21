import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  trailingSlash: true,
  devIndicators: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
