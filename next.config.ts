import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Phones on the local network reach the dev server by IP; list the ranges Next may serve dev assets to.
  allowedDevOrigins: ["192.168.0.238", "192.168.*.*", "10.*.*.*", "*.local"],
};

export default nextConfig;
