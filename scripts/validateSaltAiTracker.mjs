import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  assert,
  commitPattern,
  digestPattern,
  parseArgs,
  readJson,
  repositoryRoot,
  sha256,
} from "./saltAiEvidenceUtils.mjs";

const args = parseArgs(process.argv.slice(2));
const digestReference = /^sha256:[0-9a-f]{64}$/u;

function validateEntry(entry, context) {
  const required = [
    "kind",
    "schema_id",
    "schema_version",
    "locator",
    "sha256",
    "workflow_class",
    "environment_class",
    "retention_expires_at",
    "parents",
    "state",
  ];
  for (const field of required) {
    assert(entry[field] !== undefined, `${context} entry is missing ${field}`);
  }
  assert(digestPattern(entry.sha256), `${context}/${entry.kind} has an invalid digest`);
  assert(
    /^(?:repo|https):\/\//u.test(entry.locator) &&
      /sha256-[0-9a-f]{64}/u.test(entry.locator),
    `${context}/${entry.kind} locator is not content-addressed`,
  );
  assert(Array.isArray(entry.parents), `${context}/${entry.kind} parents must be an array`);
  for (const parent of entry.parents) {
    assert(digestReference.test(parent), `${context}/${entry.kind} has an invalid parent digest`);
  }
  assert(
    ["active", "superseded", "retired"].includes(entry.state),
    `${context}/${entry.kind} has an invalid state`,
  );
  if (entry.source_sha !== null) {
    assert(commitPattern(entry.source_sha), `${context}/${entry.kind} has an invalid source SHA`);
  }
  if (entry.completion_sha !== null) {
    assert(commitPattern(entry.completion_sha), `${context}/${entry.kind} has an invalid completion SHA`);
  }
  assert(
    !Number.isNaN(new Date(entry.retention_expires_at).valueOf()),
    `${context}/${entry.kind} has an invalid retention expiry`,
  );
  if (entry.state === "superseded") {
    assert(digestPattern(entry.successor_sha256), `${context}/${entry.kind} is missing its successor`);
  }
  if (entry.state === "retired") {
    assert(entry.evidence_phase === "premerge", `${context}/${entry.kind} retired outside premerge`);
    assert(entry.retired_by?.sha256, `${context}/${entry.kind} is missing retired_by`);
  }
}

function validateIndex(index, expected = {}) {
  const context = `${index.plan_id ?? "?"}/${index.unit_id ?? "?"}`;
  assert(index.schema_version === "1.0.0", `${context} has an unsupported schema version`);
  assert(/^\d{3}$/u.test(index.plan_id), `${context} has an invalid plan ID`);
  assert(/^[0-9]{2}[a-z]?$/u.test(index.unit_id), `${context} has an invalid unit ID`);
  assert(Array.isArray(index.entries), `${context} entries must be an array`);
  if (expected.plan) assert(index.plan_id === expected.plan, `${context} plan mismatch`);
  if (expected.unit) assert(index.unit_id === expected.unit, `${context} unit mismatch`);

  const identities = new Set();
  const activeKinds = new Set();
  const digests = new Map();
  for (const entry of index.entries) {
    validateEntry(entry, context);
    const identity = `${entry.kind}\u0000${entry.sha256}`;
    assert(!identities.has(identity), `${context} repeats ${entry.kind}/${entry.sha256}`);
    identities.add(identity);
    if (entry.state === "active") {
      assert(!activeKinds.has(entry.kind), `${context} has multiple active ${entry.kind} entries`);
      activeKinds.add(entry.kind);
    }
    const prior = digests.get(entry.sha256);
    assert(!prior || prior === entry.kind, `${context} reuses a digest across evidence kinds`);
    digests.set(entry.sha256, entry.kind);
  }

  for (const entry of index.entries) {
    if (entry.state !== "superseded") continue;
    const successor = index.entries.find(
      (candidate) => candidate.sha256 === entry.successor_sha256,
    );
    assert(successor, `${context}/${entry.kind} has a dangling successor`);
    assert(successor.kind === entry.kind, `${context}/${entry.kind} successor crosses kinds`);
    const visited = new Set([entry.sha256]);
    let cursor = successor;
    while (cursor.state === "superseded") {
      assert(!visited.has(cursor.sha256), `${context}/${entry.kind} successor cycle`);
      visited.add(cursor.sha256);
      cursor = index.entries.find(
        (candidate) => candidate.sha256 === cursor.successor_sha256,
      );
      assert(cursor, `${context}/${entry.kind} has a dangling successor chain`);
    }
    assert(cursor.state === "active", `${context}/${entry.kind} successor chain is not active`);
  }

  if (index.tracker_status === "DONE") {
    assert(commitPattern(index.completion_sha), `${context} DONE index lacks a completion SHA`);
    assert(
      index.entries.every(
        (entry) => !(entry.state === "active" && entry.evidence_phase === "premerge"),
      ),
      `${context} DONE index retains active premerge evidence`,
    );
  }
  return true;
}

async function validateFixtures() {
  const directory = path.join(
    repositoryRoot,
    "scripts",
    "fixtures",
    "salt-plan-evidence",
  );
  const files = (await readdir(directory)).filter((name) => name.endsWith(".json")).sort();
  for (const name of files) {
    const fixture = await readJson(path.join(directory, name));
    let failed = false;
    try {
      validateIndex(fixture.index);
    } catch {
      failed = true;
    }
    assert(
      failed === !fixture.valid,
      `${name} expected valid=${fixture.valid} but validation ${failed ? "failed" : "passed"}`,
    );
  }
  return files.length;
}

const fixtureCount = await validateFixtures();
if (!args.get("--fixtures-only")) {
  const trackerPath = path.resolve(
    repositoryRoot,
    String(args.get("--tracker") ?? "plans/README.md"),
  );
  const source = await readFile(trackerPath, "utf8");
  const rows = [...source.matchAll(/^\|\s+([0-9]{2}[a-z]?)\s+\|[^\n]*$/gmu)];
  assert(rows.length > 0, "No Plan 001 execution rows found");
  const units = new Set();
  for (const match of rows) {
    const cells = match[0]
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    if (cells.length !== 7) continue;
    const [unit, , , status, checkpoint, completion, evidence] = cells;
    if (!/^(?:TODO|IN PROGRESS(?: — .+)?|DONE|BLOCKED — .+|STALE — .+)$/u.test(status)) {
      continue;
    }
    assert(!units.has(unit), `Duplicate Plan 001 tracker unit ${unit}`);
    units.add(unit);
    if (status === "IN PROGRESS" || status.startsWith("IN PROGRESS —")) {
      assert(commitPattern(checkpoint), `In-progress unit ${unit} lacks a concrete checkpoint`);
    }
    if (status === "DONE") assert(commitPattern(completion), `DONE unit ${unit} lacks completion SHA`);
    const tokens = [...evidence.matchAll(/evidence-index=([^\s|]+)@(sha256:[0-9a-f]{64})/gu)];
    assert(tokens.length <= 1, `Unit ${unit} has multiple current evidence-index tokens`);
    if (tokens.length === 0) {
      assert(status !== "DONE", `DONE unit ${unit} lacks an evidence-index token`);
      continue;
    }
    const [, relative, expectedDigest] = tokens[0];
    const indexPath = path.resolve(repositoryRoot, relative);
    const bytes = await readFile(indexPath);
    assert(sha256(bytes) === expectedDigest, `Unit ${unit} evidence-index digest mismatch`);
    const index = JSON.parse(bytes.toString("utf8"));
    validateIndex(index, { plan: "001", unit });
    assert(index.tracker_status === status, `Unit ${unit} status/index mismatch`);
    if (status === "DONE") assert(index.completion_sha === completion, `Unit ${unit} completion mismatch`);
  }
  assert(units.has("00a") && units.has("09c"), "Plan 001 tracker is incomplete");
}

console.log(`Salt AI tracker validated (${fixtureCount} hostile/valid fixtures).`);
