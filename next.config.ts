import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@base-ui/react",
      "xlsx",
    ],
  },
  turbopack: {
    resolveAlias: {
      "@": "./",
    },
  },
};

export default nextConfig;
