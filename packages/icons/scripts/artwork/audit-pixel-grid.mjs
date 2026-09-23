import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { brandIconNames } from "./brands.mjs";
import { checkPixelGrid } from "./pixel-grid.mjs";

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, "../../../..");
const names = JSON.parse(
  await fs.readFile(path.join(dir, "inventory.json"), "utf8"),
);
const records = await Promise.all(
  names.map(async (name) => ({
    name,
    svg: await fs.readFile(
      path.join(root, "packages/icons/src/SVG", name),
      "utf8",
    ),
  })),
);
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage();
  const results = (await checkPixelGrid(page, records)).map((record) => ({
    ...record,
    brand: brandIconNames.has(record.name.replace(/(_solid)?\.svg$/, "")),
  }));
  const summary = {
    exports: results.length,
    withStraightEdges: results.filter((r) => r.samples[0].total > 0).length,
    cases: [
      { size: 12, weight: 4 / 3 },
      { size: 16, weight: 1 },
      { size: 16, weight: 4 / 3 },
    ],
    note: "Advisory straight-edge measurements at integer CSS origin, 100% zoom, DPR 1. They do not certify sharpness, recognition, curves or diagonals. Official brand geometry is excluded from the review queue.",
    reviewQueue: results
      .filter(
        (r) =>
          !r.brand && r.samples[0].total >= 12 && r.samples[0].error >= 0.2,
      )
      .sort((a, b) => b.samples[0].error - a.samples[0].error)
      .map((r) => ({
        name: r.name,
        error12: r.samples[0].error,
        error16: r.samples[1].error,
      })),
  };
  const out = path.join(root, "dist/icon-pixel-grid");
  await fs.mkdir(out, { recursive: true });
  await fs.writeFile(
    path.join(out, "report.json"),
    JSON.stringify({ summary, records: results }, null, 2) + "\n",
  );
  console.log(
    JSON.stringify(
      {
        ...summary,
        reviewQueue: summary.reviewQueue.length,
        report: path.join(out, "report.json"),
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
