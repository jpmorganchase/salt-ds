import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const dir = path.dirname(fileURLToPath(import.meta.url));
const read = async (name) =>
  JSON.parse(await fs.readFile(path.join(dir, name), "utf8"));
const [current, legacy] = await Promise.all([
  read("inventory.json"),
  read("junction-review-legacy.json"),
]);
if (legacy.schemaVersion !== 1 || !Array.isArray(legacy.exports))
  throw new Error("Invalid intersection-review rollout baseline.");
const existing = new Set(legacy.exports);
const added = current.filter((name) => !existing.has(name));
if (!added.length) {
  console.log("No new icon exports require an intersection-review decision.");
} else {
  console.log(
    `Checking intersection-review decisions for ${added.join(", ")}.`,
  );
  const audit = spawnSync(
    process.execPath,
    [path.join(dir, "audit-junctions.mjs")],
    { stdio: "inherit" },
  );
  if (audit.error) throw audit.error;
  process.exitCode = audit.status ?? 1;
}

// The final-paint contract also applies to future additions. Existing source
// reviews do not substitute for native-size corner decisions.
const corners = await read("corner-reviews.json");
if (added.length || Object.keys(corners.reviews).length) {
  const audit = spawnSync(
    process.execPath,
    [path.join(dir, "audit-corners.mjs"), "--enforce-new"],
    { stdio: "inherit" },
  );
  if (audit.error) throw audit.error;
  if (audit.status !== 0) process.exitCode = audit.status ?? 1;
}
