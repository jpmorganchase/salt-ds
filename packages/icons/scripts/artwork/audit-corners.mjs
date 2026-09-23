import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { inspectPaintedCorners } from "./painted-corners.mjs";
import {
  assessCornerReview,
  cornerAnalysisKey,
  cornerReviewFingerprint,
  cornerReviewTemplate,
} from "./corner-review-state.mjs";
import { cornerReviewPage } from "./corner-review-page.mjs";
const dir = path.dirname(fileURLToPath(import.meta.url)),
  root = path.resolve(dir, "../../../..");
const out = path.join(root, "dist/icon-corner-consistency");
const names = JSON.parse(
  await fs.readFile(path.join(dir, "inventory.json"), "utf8"),
);
const detectorSource = await fs.readFile(
  path.join(dir, "painted-corners.mjs"),
  "utf8",
);
let cache = {};
try {
  cache = JSON.parse(
    await fs.readFile(path.join(out, "paint-cache.json"), "utf8"),
  );
} catch (e) {
  if (e.code !== "ENOENT" && !(e instanceof SyntaxError)) throw e;
}
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const renderer = {
  browser: browser.version(),
  platform: process.platform,
  arch: process.arch,
};
const reviewFile = JSON.parse(
  await fs.readFile(path.join(dir, "corner-reviews.json"), "utf8"),
);
if (reviewFile.schemaVersion !== 1)
  throw Error("Unsupported corner review schema");
let baseline = {};
try {
  baseline = JSON.parse(
    await fs.readFile(
      path.join(
        root,
        reviewFile.comparisonBaseline ??
          "dist/icon-corner-consistency/before.json",
      ),
      "utf8",
    ),
  );
} catch (e) {
  if (e.code !== "ENOENT") throw e;
}
const records = [];
let computed = 0;
try {
  for (const name of names) {
    const svg = await fs.readFile(
      path.join(root, "packages/icons/src/SVG", name),
      "utf8",
    );
    const analysisKey = cornerAnalysisKey(svg, detectorSource, renderer);
    let record = cache[name];
    if (record?.analysisKey !== analysisKey) {
      record = {
        name,
        svg,
        analysisKey,
        ...(await page.evaluate(inspectPaintedCorners, { svg })),
      };
      computed++;
    }
    record.fingerprint = cornerReviewFingerprint(record);
    cache[name] = record;
    const decision = reviewFile.reviews[name];
    const review = assessCornerReview(record, decision);
    if (decision) {
      const evidence = [
        ...(decision.evidence ?? []),
        ...Object.values(decision.decisions ?? {}).flatMap((d) =>
          [d.evidence, ...Object.values(d.comparison ?? {})].filter(Boolean),
        ),
      ];
      for (const item of evidence) {
        if (
          typeof item !== "string" ||
          path.isAbsolute(item) ||
          item.split(/[\\/]/).includes("..")
        )
          throw Error(`Evidence must be a repository-relative file: ${name}`);
        try {
          await fs.access(path.join(root, item));
        } catch {
          review.status = "needs-review";
          review.problems.push(`Missing evidence: ${item}`);
        }
      }
    }
    records.push({
      ...record,
      review,
      decision,
      changed:
        baseline[name] !== undefined &&
        baseline[name].replace(/\r\n/g, "\n") !== svg.replace(/\r\n/g, "\n"),
    });
    if (records.length % 50 === 0)
      console.log("Inspected", records.length, "/", names.length);
  }
} finally {
  await browser.close();
}
await fs.mkdir(out, { recursive: true });
await fs.writeFile(path.join(out, "paint-cache.json"), JSON.stringify(cache));
const summary = {
  exports: records.length,
  computed,
  changed: records.filter((r) => r.changed).length,
  approved: records.filter((r) => r.review.status === "approved").length,
  inner: records.reduce(
    (n, r) =>
      n +
      r.observations.reduce(
        (n, o) => n + o.corners.filter((c) => c.kind === "inner").length,
        0,
      ),
    0,
  ),
  warnings: records.flatMap((r) =>
    r.observations.flatMap((o) => o.warnings.map((w) => r.name + ": " + w)),
  ),
};
await fs.writeFile(
  path.join(out, "paint-report.json"),
  JSON.stringify({ summary, records }),
);
await fs.writeFile(
  path.join(out, "index.html"),
  cornerReviewPage({
    summary,
    records: records.map((r) => ({
      ...r,
      observations: r.observations.map(({ weight, corners, warnings }) => ({
        weight,
        corners,
        warnings,
      })),
    })),
  }),
);
const requested = process.argv.indexOf("--template");
if (requested !== -1) {
  const record = records.find((r) => r.name === process.argv[requested + 1]);
  if (!record) throw Error("Pass a registered SVG export after --template");
  await fs.writeFile(
    path.join(out, "review-template.json"),
    JSON.stringify({ [record.name]: cornerReviewTemplate(record) }, null, 2) +
      "\n",
  );
}
console.log(JSON.stringify(summary));
if (
  process.argv.includes("--complete") &&
  summary.approved !== summary.exports
) {
  console.error(
    `${summary.exports - summary.approved} exports lack current complete corner approval.`,
  );
  process.exitCode = 1;
}

const legacy = JSON.parse(
  await fs.readFile(path.join(dir, "junction-review-legacy.json"), "utf8"),
);
if (legacy.schemaVersion !== 1 || !Array.isArray(legacy.exports))
  throw Error("Invalid rollout baseline");
const legacyNames = new Set(legacy.exports);
const rejected = records.filter(
  (r) =>
    (reviewFile.reviews[r.name] && r.review.status !== "approved") ||
    (process.argv.includes("--enforce-new") &&
      !legacyNames.has(r.name) &&
      r.review.status !== "approved"),
);
if (rejected.length) {
  console.error(
    `Corner decisions require attention: ${rejected.map((r) => r.name).join(", ")}`,
  );
  process.exitCode = 1;
}
