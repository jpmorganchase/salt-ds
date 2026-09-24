import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { checkPairContours } from "./check-pair-contours.mjs";
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const dir = path.join(root, "packages/icons/src/SVG");
const records = await Promise.all(
  (await fs.readdir(dir))
    .filter((n) => n.endsWith(".svg"))
    .map(async (name) => ({
      name,
      svg: await fs.readFile(path.join(dir, name), "utf8"),
    })),
);
const browser = await chromium.launch({ headless: true, channel: "chrome" });
try {
  const report = await checkPairContours(await browser.newPage(), records);
  const out = path.join(root, "dist/icon-pair-review");
  await fs.mkdir(out, { recursive: true });
  await fs.writeFile(
    path.join(out, "pairs.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(
    JSON.stringify(
      {
        pairs: report.results.length,
        passedContracts: report.results.filter((r) => r.status === "pass")
          .length,
        failedContracts: report.failures.map((r) => ({
          name: r.name,
          samples: r.samples,
        })),
        needsReview: report.needsReview.length,
        report: path.join(out, "pairs.json"),
      },
      null,
      2,
    ),
  );
  if (
    report.failures.length ||
    (process.argv.includes("--complete") && report.needsReview.length)
  )
    process.exitCode = 1;
} finally {
  await browser.close();
}
