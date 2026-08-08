import type { NextConfig } from "next";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// In production the static export is served from a GitHub Pages project
// subpath: https://blazekachu.github.io/prefix-satnames-tracker/
// basePath makes the _next/ assets resolve under that subpath.
const repo = "prefix-satnames-tracker";
const isProd = process.env.NODE_ENV === "production";
// Resolve junctions (C:\Users\...\Main -> F:\Users\...\Main) so Next doesn't
// join logical + real paths into a broken .next location on Windows.
const projectRoot = fs.realpathSync.native(
  path.dirname(fileURLToPath(import.meta.url)),
);

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? `/${repo}` : "",
  trailingSlash: true,
  // Parent Main/package-lock.json otherwise becomes Turbopack root and breaks
  // .next paths (ENOENT with duplicated drive letters on Windows).
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
