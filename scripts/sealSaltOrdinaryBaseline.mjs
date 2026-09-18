import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  assert,
  commitPattern,
  digestPattern,
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
const now = args.get("--now") ? new Date(String(args.get("--now"))) : new Date();
assert(!Number.isNaN(now.valueOf()), "--now must be an ISO-8601 timestamp");

function validateEntry(entry, identity, clock) {
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
  assert(digestPattern(entry.tarball_sha256), `${identity} has an invalid tarball SHA-256`);
  assert(
    /^sha512-[A-Za-z0-9+/]+={0,2}$/u.test(entry.registry_integrity),
    `${identity} has an invalid registry integrity`,
  );
  assert(
    new URL(entry.tarball_url).protocol === "https:",
    `${identity} tarball URL must use HTTPS`,
  );
  const expiry = new Date(entry.expires_at);
  assert(!Number.isNaN(expiry.valueOf()), `${identity} has an invalid expiry`);
  assert(expiry.valueOf() > clock.valueOf(), `${identity} ordinary exception has expired`);
}

function verifyTarball(entry, identity, bytes) {
  assert(sha256(bytes) === entry.tarball_sha256, `${identity} tarball SHA-256 mismatch`);
  const integrity = `sha512-${createHash("sha512").update(bytes).digest("base64")}`;
  assert(integrity === entry.registry_integrity, `${identity} registry integrity mismatch`);
}

function verifyHostileFixtures() {
  const bytes = Buffer.from("salt ordinary baseline fixture\n", "utf8");
  const base = {
    name: "@salt-ds/fixture",
    version: "1.0.0",
    registry_integrity: `sha512-${createHash("sha512").update(bytes).digest("base64")}`,
    tarball_url: "https://registry.npmjs.org/@salt-ds/fixture/-/fixture-1.0.0.tgz",
    tarball_sha256: sha256(bytes),
    source_commit: "61287edaf8bf6d853f0a52630f0f0849bd651e74",
    repository: "https://github.com/jpmorganchase/salt-ds",
    reason: "test fixture",
    release_approver: "release-owner",
    security_approver: "security-owner",
    expires_at: "2099-01-01T00:00:00.000Z",
  };
  validateEntry(base, "valid-fixture", now);
  verifyTarball(base, "valid-fixture", bytes);
  const hostile = [
    { ...base, registry_integrity: `sha512-${Buffer.alloc(64).toString("base64")}` },
    { ...base, expires_at: now.toISOString() },
  ];
  for (const [index, entry] of hostile.entries()) {
    let rejected = false;
    try {
      validateEntry(entry, `hostile-fixture-${index + 1}`, now);
      verifyTarball(entry, `hostile-fixture-${index + 1}`, bytes);
    } catch {
      rejected = true;
    }
    assert(rejected, `Hostile ordinary baseline fixture ${index + 1} was accepted`);
  }
  return hostile.length + 1;
}

const fixtureCount = verifyHostileFixtures();

const seen = new Set();
const entries = [];
for (const entry of [...inventory.entries].sort((left, right) =>
  `${left.name}@${left.version}`.localeCompare(`${right.name}@${right.version}`),
)) {
  const identity = `${entry.name}@${entry.version}`;
  assert(!seen.has(identity), `Duplicate ordinary baseline entry: ${identity}`);
  seen.add(identity);
  validateEntry(entry, identity, now);

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
  verifyTarball(entry, identity, tarballBytes);
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
console.log(
  `Salt ordinary legacy baseline sealed (${entries.length} exception(s), ${fixtureCount} policy fixtures).`,
);
