import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = `file://${path.join(root, "docs", "index.html").replaceAll("\\", "/")}`;
const outputDir = path.join(root, "docs", "audit-browser-qa");

const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 },
];

const browser = await chromium.launch();
const results = [];

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    const consoleMessages = [];
    page.on("console", (message) => {
      if (["error", "warning"].includes(message.type())) {
        consoleMessages.push(`${message.type()}: ${message.text()}`);
      }
    });

    const response = await page.goto(target, { waitUntil: "load" });
    const recoveryTextVisible = await page
      .getByText("Public shipping, product-ready, and v1.0 maturity claims are frozen")
      .isVisible();
    const horizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    await page.keyboard.press("Tab");
    const focusedText = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? "");
    const screenshot = path.join(outputDir, `docs-index-recovery-${viewport.name}-2026-05-07.png`);
    await page.screenshot({ path: screenshot, fullPage: true });

    results.push({
      viewport: viewport.name,
      status: response?.status() ?? null,
      recoveryTextVisible,
      horizontalOverflow,
      focusedText,
      consoleMessages,
      screenshot,
    });

    await page.close();
  }
} finally {
  await browser.close();
}

const failed = results.some(
  (result) =>
    result.status !== 200 ||
    !result.recoveryTextVisible ||
    result.horizontalOverflow ||
    result.focusedText !== "Skip to main content" ||
    result.consoleMessages.length > 0,
);

console.log(JSON.stringify({ target, results }, null, 2));
if (failed) {
  process.exit(1);
}
