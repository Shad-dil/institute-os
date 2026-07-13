import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "c6005a2e556ab53f174f81781fd9ecd2.r2.cloudflarestorage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pub-ffd4e6a2eaf245f0a416f14892876bf6.r2.dev",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
