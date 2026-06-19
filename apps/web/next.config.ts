import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@tubmind/api-client",
    "@tubmind/contracts",
    "@tubmind/database",
    "@tubmind/domain",
  ],
};

export default nextConfig;
