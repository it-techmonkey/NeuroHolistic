import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Inlined at build; Vercel sets VERCEL_ENV=production | preview | development.
    // Non-Vercel production hosts: set VERCEL_ENV=production before `next build`.
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV ?? "",
  },
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
  turbopack: {},
};

export default nextConfig;
