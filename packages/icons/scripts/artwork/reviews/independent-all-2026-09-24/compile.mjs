import fs from "node:fs/promises";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

const reviewDirectory = path.dirname(fileURLToPath(import.meta.url));
const iconsDirectory = path.resolve(reviewDirectory, "../../../../src/SVG");
const manifest = JSON.parse(
  await fs.readFile(path.join(reviewDirectory, "manifest.json"), "utf8"),
);
const buckets = ["a-h", "i-p", "q-z"];
const reports = await Promise.all(
  buckets.map(async (bucket) => {
    const report = JSON.parse(
      await fs.readFile(path.join(reviewDirectory, `${bucket}.json`), "utf8"),
    );
    return { bucket, entries: Array.isArray(report) ? report : report.entries };
  }),
);
const expected = new Map(manifest.entries.map((entry) => [entry.file, entry]));
const seen = new Map();
for (const { bucket, entries } of reports) {
  if (!Array.isArray(entries)) throw new Error(`${bucket}: no entries array`);
  for (const entry of entries) {
    const file = entry.file ?? entry.name;
    if (!expected.has(file)) throw new Error(`${bucket}: unknown export ${file}`);
    if (expected.get(file).bucket !== bucket)
      throw new Error(`${bucket}: wrong bucket for ${file}`);
    if (seen.has(file)) throw new Error(`Duplicate verdict: ${file}`);
    if (!["pass", "issue", "uncertain"].includes(entry.status))
      throw new Error(`${file}: invalid status ${entry.status}`);
    if (!entry.reason?.trim()) throw new Error(`${file}: missing visual reason`);
    seen.set(file, { ...entry, file, reviewerBucket: bucket });
  }
}
const missing = [...expected.keys()].filter((file) => !seen.has(file));
if (missing.length)
  throw new Error(`${missing.length} exports have no verdict: ${missing.join(", ")}`);
if (seen.size !== manifest.total)
  throw new Error(`Verdict count ${seen.size} does not match ${manifest.total}`);

const changed = [];
for (const entry of manifest.entries) {
  const content = await fs.readFile(path.join(iconsDirectory, entry.file));
  const current = crypto.createHash("sha256").update(content).digest("hex");
  if (current !== entry.sha256) changed.push(entry.file);
}
if (changed.length)
  throw new Error(`Artwork changed during review: ${changed.join(", ")}`);

const entries = manifest.entries.map((entry) => seen.get(entry.file));
const counts = Object.fromEntries(
  ["pass", "issue", "uncertain"].map((status) => [
    status,
    entries.filter((entry) => entry.status === status).length,
  ]),
);
const summary = {
  date: manifest.date,
  coverage: { total: manifest.total, reviewed: entries.length, buckets },
  counts,
  issues: entries.filter((entry) => entry.status === "issue"),
  uncertain: entries.filter((entry) => entry.status === "uncertain"),
};
await fs.writeFile(
  path.join(reviewDirectory, "summary.json"),
  `${JSON.stringify(summary, null, 2)}\n`,
);
console.log(
  JSON.stringify({ coverage: summary.coverage, counts, unchangedArt: true }),
);
