import type { NextConfig } from "next";

// In production the static export is served from a GitHub Pages project
// subpath: https://blazekachu.github.io/prefix-satnames-tracker/
// basePath makes the _next/ assets resolve under that subpath.
const repo = "prefix-satnames-tracker";
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? `/${repo}` : "",
  trailingSlash: true,
};

export default nextConfig;
