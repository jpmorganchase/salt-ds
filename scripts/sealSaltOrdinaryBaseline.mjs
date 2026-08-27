import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  assert,
  commitPattern,
  gitHeadCommit,
  parseArgs,
  readJson,
  repositoryRoot,
  sha256,
  writeJsonAtomic,
} from "./saltAiEvidenceUtils.mjs";

const args = parseArgs(process.argv.slice(2));
const inventoryPath = path.resolve(
  repositoryRoot,
  String(
    args.get("--inventory") ??
      "tooling/ai/ordinary-legacy-attestations-v1.json",
  ),
);
const output = path.resolve(
  repositoryRoot,
  String(
    args.get("--output") ??
      "dist/salt-ai-baseline/ordinary-baseline-receipt.json",
  ),
);
const inventory = await readJson(inventoryPath);
assert(inventory.schema_version === "1.0.0", "Unsupported ordinary baseline inventory");
assert(Array.isArray(inventory.entries), "Ordinary baseline entries must be an array");

const seen = new Set();
const entries = [];
for (const entry of [...inventory.entries].sort((left, right) =>
  `${left.name}@${left.version}`.localeCompare(`${right.name}@${right.version}`),
)) {
  const identity = `${entry.name}@${entry.version}`;
  assert(!seen.has(identity), `Duplicate ordinary baseline entry: ${identity}`);
  seen.add(identity);
  for (const field of [
    "name",
    "version",
    "registry_integrity",
    "tarball_url",
    "tarball_sha256",
    "source_commit",
    "repository",
    "reason",
    "release_approver",
    "security_approver",
    "expires_at",
  ]) {
    assert(typeof entry[field] === "string" && entry[field], `${identity} is missing ${field}`);
  }
  assert(commitPattern(entry.source_commit), `${identity} has an invalid source commit`);
  const expiry = new Date(entry.expires_at);
  assert(!Number.isNaN(expiry.valueOf()), `${identity} has an invalid expiry`);

  let tarballBytes;
  if (args.get("--fixture-root")) {
    const fixture = path.resolve(
      repositoryRoot,
      String(args.get("--fixture-root")),
      `${entry.name.replaceAll("/", "-").replace(/^@/u, "")}-${entry.version}.tgz`,
    );
    tarballBytes = await readFile(fixture);
  } else {
    const response = await fetch(entry.tarball_url, { redirect: "error" });
    assert(response.ok, `${identity} tarball readback failed with ${response.status}`);
    tarballBytes = Buffer.from(await response.arrayBuffer());
  }
  assert(sha256(tarballBytes) === entry.tarball_sha256, `${identity} tarball SHA-256 mismatch`);
  entries.push({ ...entry, tarball_bytes: tarballBytes.byteLength });
}

const sourceCommit = await gitHeadCommit();
await writeJsonAtomic(output, {
  $schema:
    "https://www.saltdesignsystem.com/ai/schemas/salt-ordinary-baseline-1.json",
  schema_version: "1.0.0",
  kind: "ordinary-baseline-receipt",
  source_commit: sourceCommit,
  inventory_path: "tooling/ai/ordinary-legacy-attestations-v1.json",
  inventory_digest: sha256(await readFile(inventoryPath)),
  sealed: true,
  entry_count: entries.length,
  entries,
});
console.log(`Salt ordinary legacy baseline sealed (${entries.length} exception(s)).`);
