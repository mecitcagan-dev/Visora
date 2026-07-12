/**
 * Webpack production build with @next/bundle-analyzer (ANALYZE=true).
 * Uses webpack (not turbopack) so the analyzer can emit reports.
 */
import { spawnSync } from "node:child_process";

const result = spawnSync("npx", ["next", "build"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, ANALYZE: "true" },
});

process.exit(result.status ?? 1);
