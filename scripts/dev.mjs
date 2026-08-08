import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// C:\Users\...\Main is a junction to F:\Users\...\Main. Next.js mixes the
// logical and real paths and breaks .next lookups unless we start on the
// realpath.
const scriptsDir = fs.realpathSync.native(
  path.dirname(fileURLToPath(import.meta.url)),
);
const root = path.dirname(scriptsDir);
const nextBin = path.join(
  root,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next",
);

process.chdir(root);

// Prefer Turbopack (Next 16 default). Do not pass --webpack: Next 16.3
// webpack-dev still calls removed isHtmlBotRequest and 500s every page,
// which makes the home Track button appear broken.
const child = spawn(
  process.execPath,
  [nextBin, "dev", ...process.argv.slice(2)],
  {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
