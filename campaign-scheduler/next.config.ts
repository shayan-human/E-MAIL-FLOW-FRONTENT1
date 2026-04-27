import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['ollama'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
