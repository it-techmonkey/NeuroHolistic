import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  // Use webpack for development to avoid Turbopack path issues with spaces
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Ensure proper path resolution with spaces
      config.resolve.symlinks = true;
    }
    return config;
  },
  // Configure Turbopack for Next.js 16 compatibility
  turbopack: {},
};

export default nextConfig;
