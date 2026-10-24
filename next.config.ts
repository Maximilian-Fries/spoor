import type { NextConfig } from "next";

// The site is fully static. BASE_PATH is set by the GitHub Pages workflow (the site lives under /spoor there).
const basePath = process.env.BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  // Phones on the local network reach the dev server by IP; list the ranges Next may serve dev assets to.
  allowedDevOrigins: ["192.168.0.238", "192.168.*.*", "10.*.*.*", "*.local"],
};

export default nextConfig;
