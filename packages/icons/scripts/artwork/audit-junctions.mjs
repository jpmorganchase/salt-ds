import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { drawings } from "./drawings.mjs";
import { discoverJunctionCandidates } from "./junction-discovery.mjs";
import {
  inspectDeclaredJunctions,
  paintAnalysisVersion,
} from "./junction-paint.mjs";
import { renderJunctionReviewPage } from "./junction-review-page.mjs";
import {
  evaluateReview,
  reviewFeatures,
  reviewFingerprint,
  reviewWeights,
  summarizeReviews,
} from "./junction-review-state.mjs";

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, "../../../..");
const out = path.join(root, "dist/icon-junction-review");
const hash = (value) => createHash("sha256").update(value).digest("hex");
const args = process.argv.slice(2);
if (args.some((arg) => arg !== "--complete"))
  throw new Error("Usage: audit-junctions.mjs [--complete]");
const readJSON = async (name) =>
  JSON.parse(await fs.readFile(path.join(dir, name), "utf8"));
const [inventory, transforms, sourceHashes, reviews] = await Promise.all([
  readJSON("inventory.json"),
  readJSON("view-box-transforms.json"),
  readJSON("junction-source-hashes.json"),
  readJSON("junction-reviews.json"),
]);
const legacy = await readJSON("junction-review-legacy.json");
if (legacy.schemaVersion !== 1 || !Array.isArray(legacy.exports))
  throw new Error("Invalid intersection-review rollout baseline.");
if (sourceHashes.schemaVersion !== 1 || reviews.schemaVersion !== 1)
  throw new Error("Unsupported junction source/review schema.");
const unknown = Object.keys(reviews.records).filter(
  (name) => !inventory.includes(name),
);
if (unknown.length)
  throw new Error(
    `Review names no longer in the catalogue: ${unknown.join(", ")}`,
  );
// Implementation hashes invalidate the computation cache, not review approval.
// Review fingerprints include actual evidence and explicit semantic versions,
// so formatting/comments do not force a catalogue-wide review.
const implementationHash = hash(
  (
    await Promise.all(
      ["junction-paint.mjs", "junction-discovery.mjs"].map((name) =>
        fs.readFile(path.join(dir, name), "utf8"),
      ),
    )
  ).join("\n"),
);
let previousCache = {};
try {
  previousCache =
    JSON.parse(await fs.readFile(path.join(out, "analysis-cache.json"), "utf8"))
      .records ?? {};
} catch (error) {
  if (error.code !== "ENOENT" && !(error instanceof SyntaxError)) throw error;
}
const nextCache = {};
const sources = await Promise.all(
  inventory.map(async (name) => {
    const base = name.replace(/(_solid)?\.svg$/, "");
    const drawing = drawings[base]?.[name.endsWith("_solid.svg") ? 1 : 0];
    const recipeHash = hash(JSON.stringify(drawing));
    if (recipeHash !== sourceHashes.records[name])
      throw new Error(
        `${name}: recipe changed since generation. Run generate:icons first.`,
      );
    if (!transforms[name]) throw new Error(`Missing export fit for ${name}.`);
    return {
      name,
      recipeHash,
      body: typeof drawing === "string" ? drawing : drawing.body,
      svg: await fs.readFile(
        path.join(root, "packages/icons/src/SVG", name),
        "utf8",
      ),
    };
  }),
);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const records = [];
let computed = 0;
try {
  const page = await browser.newPage();
  for (const source of sources) {
    const key = hash(
      JSON.stringify({
        implementationHash,
        browser: browser.version(),
        svg: source.svg,
        recipeHash: source.recipeHash,
        fit: transforms[source.name],
      }),
    );
    const cached = previousCache[source.name];
    let joins, found;
    if (
      cached?.key === key &&
      Array.isArray(cached.joins) &&
      Array.isArray(cached.found?.candidates)
    ) {
      ({ joins, found } = cached);
    } else {
      joins = await page.evaluate(inspectDeclaredJunctions, {
        body: source.body,
        svg: source.svg,
        transform: transforms[source.name],
      });
      found = await page.evaluate(discoverJunctionCandidates, source.svg);
      computed++;
    }
    nextCache[source.name] = { key, joins, found };
    const record = {
      name: source.name,
      svg: source.svg,
      hash: hash(source.svg),
      recipeHash: source.recipeHash,
      joins,
      candidates: found.candidates,
      discovery: {
        version: found.version,
        scope: found.scope,
        warnings: found.warnings,
        paintAnalysisVersion,
      },
    };
    // Prefixes keep discovered IDs separate from shared-construction join IDs.
    record.candidates = record.candidates.map((candidate, i) => ({
      ...candidate,
      id: `d${String(i + 1).padStart(3, "0")}`,
    }));
    record.fingerprint = reviewFingerprint(record);
    record.review = evaluateReview(record, reviews.records[record.name]);
    records.push(record);
    if (records.length % 50 === 0)
      console.log(`Mapped ${records.length}/${sources.length} exports.`);
  }
} finally {
  await browser.close();
}
const report = {
  schemaVersion: 1,
  summary: summarizeReviews(records),
  records,
};
const templates = {
  schemaVersion: 1,
  records: Object.fromEntries(
    records
      .filter((r) => r.review.status !== "current")
      .map((r) => [
        r.name,
        {
          fingerprint: r.fingerprint,
          reviewedBy: "",
          rationale: "",
          checks: {
            sizes: [12, 16],
            weights: reviewWeights,
            backgrounds: ["light", "dark"],
            completeDrawing: false,
          },
          decisions: reviewFeatures(r)
            .filter(
              (f) =>
                !f.observations ||
                f.observations.some((o) => o.status !== "visible"),
            )
            .map((f) => ({ ids: [f.id], treatment: "", reason: "" })),
        },
      ]),
  ),
};
await fs.mkdir(out, { recursive: true });
await Promise.all([
  fs.writeFile(path.join(out, "report.json"), `${JSON.stringify(report)}\n`),
  fs.writeFile(path.join(out, "index.html"), renderJunctionReviewPage(report)),
  fs.writeFile(
    path.join(out, "decision-templates.json"),
    `${JSON.stringify(templates, null, 2)}\n`,
  ),
  fs.writeFile(
    path.join(out, "analysis-cache.json"),
    JSON.stringify({ schemaVersion: 1, records: nextCache }),
  ),
]);
console.log(JSON.stringify(report.summary, null, 2));
console.log(
  `Recomputed ${computed} exports; reused ${records.length - computed} unchanged analyses.`,
);
console.log(`Review map: ${path.join(out, "index.html")}`);
const legacyNames = new Set(legacy.exports);
const unreviewedNew = records.filter(
  (record) =>
    !legacyNames.has(record.name) && record.review.status !== "current",
);
if (unreviewedNew.length)
  console.error(
    `New exports require review: ${unreviewedNew.map((record) => record.name).join(", ")}`,
  );
if (
  report.summary.stale ||
  unreviewedNew.length ||
  (args.includes("--complete") &&
    report.summary.reviewed !== report.summary.exports)
) {
  console.error(
    "Intersection review is incomplete or stale. Generated evidence never grants approval.",
  );
  process.exitCode = 1;
}
