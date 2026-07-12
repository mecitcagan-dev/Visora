/**
 * Functional download check after next/image conversion.
 * - Galeri lightbox "İndir"
 * - /uretim sonuç paneli tıkla-indir (mocked /api/generate)
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:3055";
const PNG_1X1 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const gallerySeed = [
  {
    id: "cwv-test-1",
    data: PNG_1X1,
    filename: "cwv-test.png",
    prompt: "test prompt",
    label: "CWV Test",
    source: "template",
  },
];

const generatePayload = {
  images: [
    {
      data: PNG_1X1,
      filename: "cwv-result.png",
      prompt: "result test",
      label: "Sonuç Test",
    },
  ],
  enrichment_source: "template",
};

function installDownloadProbe(page) {
  return page.addInitScript(() => {
    window.__visoraDownloads = [];
    const orig = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function patchedClick() {
      if (this.download != null && this.download !== "") {
        window.__visoraDownloads.push({
          download: this.download,
          hrefPrefix: String(this.href).slice(0, 32),
          hasDataUrl: String(this.href).startsWith("data:image/png;base64,"),
        });
      }
      return orig.apply(this, arguments);
    };
  });
}

async function readDownloads(page) {
  return page.evaluate(() => window.__visoraDownloads || []);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await installDownloadProbe(page);

  // --- Galeri lightbox ---
  await page.goto(`${BASE}/galeri`, { waitUntil: "networkidle" });
  await page.evaluate((items) => {
    sessionStorage.setItem("visora-session-gallery", JSON.stringify(items));
  }, gallerySeed);
  await page.reload({ waitUntil: "networkidle" });

  const acceptGaleri = page.getByRole("button", { name: /Kabul/i });
  if (await acceptGaleri.isVisible().catch(() => false)) {
    await acceptGaleri.click();
  }

  await page.getByRole("button", { name: /CWV Test — önizle/ }).click();
  await page.getByRole("button", { name: "İndir" }).click();
  const galeriDownloads = await readDownloads(page);
  const galeriOk =
    galeriDownloads.length >= 1 &&
    galeriDownloads.some(
      (d) => d.download === "cwv-test.png" && d.hasDataUrl
    );

  // --- Sonuç paneli (mock generate) ---
  await page.route("**/api/generate", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(generatePayload),
    });
  });
  await page.route("**/health", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.goto(`${BASE}/uretim`, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    window.__visoraDownloads = [];
  });
  // Dismiss cookie banner if present (blocks clicks)
  const accept = page.getByRole("button", { name: /Kabul/i });
  if (await accept.isVisible().catch(() => false)) {
    await accept.click();
  }
  await page.getByLabel("Açıklama").fill("CWV download test");
  await page.getByRole("button", { name: "Görsel üret" }).click();
  await page.getByRole("button", { name: /Sonuç Test — indirmek için tıkla/ }).waitFor({
    timeout: 15000,
  });
  await page.getByRole("button", { name: /Sonuç Test — indirmek için tıkla/ }).click();
  const resultDownloads = await readDownloads(page);
  const resultOk =
    resultDownloads.length >= 1 &&
    resultDownloads.some(
      (d) => d.download === "cwv-result.png" && d.hasDataUrl
    );

  await browser.close();

  const report = {
    galeriLightbox: {
      ok: galeriOk,
      downloads: galeriDownloads,
    },
    sonucPaneli: {
      ok: resultOk,
      downloads: resultDownloads,
    },
  };
  console.log(JSON.stringify(report, null, 2));
  if (!galeriOk || !resultOk) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
