/**
 * Temporary axe-core accessibility scan against a running Next.js server.
 * Usage: node scripts/a11y-scan.mjs [baseUrl]
 */
import { createRequire } from "node:module";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const axeSource = require("axe-core").source;

const BASE = process.argv[2] || "http://127.0.0.1:3000";
const PATHS = ["/", "/uretim", "/sergi", "/galeri"];

async function scanPage(page, path) {
  const url = `${BASE}${path}`;
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(400);
  await page.addScriptTag({ content: axeSource });
  const results = await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    return await axe.run(document, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"],
      },
    });
  });
  return { path, url, results };
}

function summarize(entry) {
  const { violations, incomplete, passes } = entry.results;
  const lines = [
    `\n=== ${entry.path} ===`,
    `passes: ${passes.length}  violations: ${violations.length}  incomplete: ${incomplete.length}`,
  ];
  for (const v of violations) {
    lines.push(
      `  FAIL [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s))`
    );
    for (const n of v.nodes.slice(0, 3)) {
      lines.push(`    - ${n.target.join(" > ")}`);
      if (n.failureSummary) {
        lines.push(`      ${n.failureSummary.split("\n")[0]}`);
      }
    }
  }
  for (const v of incomplete) {
    lines.push(`  REVIEW [${v.impact ?? "?"}] ${v.id}: ${v.help}`);
  }
  return lines.join("\n");
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const all = [];

try {
  for (const path of PATHS) {
    try {
      const entry = await scanPage(page, path);
      all.push(entry);
      console.log(summarize(entry));
    } catch (err) {
      console.error(`\n=== ${path} ===\n  ERROR: ${err.message}`);
      all.push({ path, error: String(err) });
    }
  }
} finally {
  await browser.close();
}

const totalViolations = all.reduce(
  (sum, e) => sum + (e.results?.violations?.length ?? 0),
  0
);
console.log(`\n--- Total violation rules across pages: ${totalViolations} ---`);
process.exit(totalViolations > 0 ? 1 : 0);
