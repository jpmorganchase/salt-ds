import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  assert,
  commitPattern,
  digestPattern,
  parseArgs,
  readJson,
  repositoryRoot,
  repositoryTextSha256,
  stableJson,
} from "./saltAiEvidenceUtils.mjs";

const rawArgs = process.argv.slice(2);
const args = parseArgs(rawArgs);
const requiredKinds = rawArgs.flatMap((argument, index) =>
  argument === "--require-kind" &&
  rawArgs[index + 1] &&
  !rawArgs[index + 1].startsWith("--")
    ? [rawArgs[index + 1]]
    : [],
);
const digestReference = /^sha256:[0-9a-f]{64}$/u;
const now = args.get("--now")
  ? new Date(String(args.get("--now")))
  : new Date();
assert(!Number.isNaN(now.valueOf()), "--now must be an ISO-8601 timestamp");
const schemaValidator = new Ajv2020({ allErrors: true, strict: true });
addFormats(schemaValidator);
const validateIndexSchema = schemaValidator.compile(
  await readJson(
    path.join(
      repositoryRoot,
      "scripts",
      "schemas",
      "saltPlanEvidenceIndexV1.schema.json",
    ),
  ),
);

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
  assert(
    digestPattern(entry.sha256),
    `${context}/${entry.kind} has an invalid digest`,
  );
  assert(
    /^(?:repo|https):\/\//u.test(entry.locator) &&
      /sha256-[0-9a-f]{64}/u.test(entry.locator),
    `${context}/${entry.kind} locator is not content-addressed`,
  );
  assert(
    Array.isArray(entry.parents),
    `${context}/${entry.kind} parents must be an array`,
  );
  for (const parent of entry.parents) {
    assert(
      digestReference.test(parent),
      `${context}/${entry.kind} has an invalid parent digest`,
    );
  }
  assert(
    ["active", "superseded", "retired"].includes(entry.state),
    `${context}/${entry.kind} has an invalid state`,
  );
  if (entry.source_sha !== null) {
    assert(
      commitPattern(entry.source_sha),
      `${context}/${entry.kind} has an invalid source SHA`,
    );
  }
  if (entry.completion_sha !== null) {
    assert(
      commitPattern(entry.completion_sha),
      `${context}/${entry.kind} has an invalid completion SHA`,
    );
  }
  assert(
    !Number.isNaN(new Date(entry.retention_expires_at).valueOf()),
    `${context}/${entry.kind} has an invalid retention expiry`,
  );
  if (entry.state === "superseded") {
    assert(
      digestPattern(entry.successor_sha256),
      `${context}/${entry.kind} is missing its successor`,
    );
  }
  if (entry.state === "retired") {
    assert(
      entry.evidence_phase === "premerge",
      `${context}/${entry.kind} retired outside premerge`,
    );
    assert(
      entry.retired_by?.sha256,
      `${context}/${entry.kind} is missing retired_by`,
    );
  }
}

function validateIndex(
  index,
  expected = {},
  { clock = now, entriesByDigest: suppliedEntriesByDigest } = {},
) {
  const context = `${index.plan_id ?? "?"}/${index.unit_id ?? "?"}`;
  assert(
    validateIndexSchema(index),
    `${context} failed schema validation: ${schemaValidator.errorsText(
      validateIndexSchema.errors,
      { separator: "; " },
    )}`,
  );
  assert(
    index.schema_version === "1.0.0",
    `${context} has an unsupported schema version`,
  );
  assert(/^\d{3}$/u.test(index.plan_id), `${context} has an invalid plan ID`);
  assert(
    /^[0-9]{2}[a-z]?$/u.test(index.unit_id),
    `${context} has an invalid unit ID`,
  );
  assert(Array.isArray(index.entries), `${context} entries must be an array`);
  if (expected.plan)
    assert(index.plan_id === expected.plan, `${context} plan mismatch`);
  if (expected.unit)
    assert(index.unit_id === expected.unit, `${context} unit mismatch`);

  const identities = new Set();
  const activeKinds = new Set();
  const digests = new Map();
  const sortedLocators = index.entries
    .map((entry) => entry.locator)
    .toSorted((left, right) => left.localeCompare(right));
  assert(
    index.entries.every(
      (entry, position) => entry.locator === sortedLocators[position],
    ),
    `${context} entries are not path-sorted`,
  );
  for (const entry of index.entries) {
    validateEntry(entry, context);
    const identity = `${entry.kind}\u0000${entry.sha256}`;
    assert(
      !identities.has(identity),
      `${context} repeats ${entry.kind}/${entry.sha256}`,
    );
    identities.add(identity);
    if (entry.state === "active") {
      assert(
        !activeKinds.has(entry.kind),
        `${context} has multiple active ${entry.kind} entries`,
      );
      activeKinds.add(entry.kind);
      assert(
        new Date(entry.retention_expires_at).valueOf() > clock.valueOf(),
        `${context}/${entry.kind} active evidence has expired`,
      );
    }
    const prior = digests.get(entry.sha256);
    assert(
      !prior || prior === entry.kind,
      `${context} reuses a digest across evidence kinds`,
    );
    digests.set(entry.sha256, entry.kind);
    assert(
      new Set(entry.parents).size === entry.parents.length,
      `${context}/${entry.kind} repeats a parent digest`,
    );
  }

  const entriesByDigest =
    suppliedEntriesByDigest ??
    new Map(index.entries.map((entry) => [entry.sha256, entry]));

  for (const entry of index.entries) {
    if (entry.state !== "superseded") continue;
    const successor = entriesByDigest.get(entry.successor_sha256);
    assert(successor, `${context}/${entry.kind} has a dangling successor`);
    assert(
      successor.kind === entry.kind,
      `${context}/${entry.kind} successor crosses kinds`,
    );
    const visited = new Set([entry.sha256]);
    let cursor = successor;
    while (cursor.state === "superseded") {
      assert(
        !visited.has(cursor.sha256),
        `${context}/${entry.kind} successor cycle`,
      );
      visited.add(cursor.sha256);
      cursor = entriesByDigest.get(cursor.successor_sha256);
      assert(cursor, `${context}/${entry.kind} has a dangling successor chain`);
    }
    assert(
      cursor.state === "active",
      `${context}/${entry.kind} successor chain is not active`,
    );
  }

  for (const entry of index.entries) {
    if (entry.state !== "active") continue;
    for (const parentDigest of entry.parents) {
      const visited = new Set();
      let parent = entriesByDigest.get(parentDigest);
      assert(parent, `${context}/${entry.kind} has a dangling active parent`);
      while (parent.state === "superseded") {
        assert(
          !visited.has(parent.sha256),
          `${context}/${entry.kind} active parent successor cycle`,
        );
        visited.add(parent.sha256);
        parent = entriesByDigest.get(parent.successor_sha256);
        assert(
          parent,
          `${context}/${entry.kind} active parent has a dangling successor`,
        );
      }
      assert(
        parent.state === "active",
        `${context}/${entry.kind} parent does not resolve to active evidence`,
      );
      assert(
        new Date(parent.retention_expires_at).valueOf() > clock.valueOf(),
        `${context}/${entry.kind} active parent has expired`,
      );
    }
  }

  if (index.tracker_status === "DONE") {
    assert(
      commitPattern(index.completion_sha),
      `${context} DONE index lacks a completion SHA`,
    );
    assert(
      index.entries.every(
        (entry) =>
          !(entry.state === "active" && entry.evidence_phase === "premerge"),
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
  const files = (await readdir(directory))
    .filter((name) => name.endsWith(".json"))
    .sort();
  for (const name of files) {
    const fixture = await readJson(path.join(directory, name));
    let failed = false;
    try {
      const fixtureNow = fixture.now ? new Date(fixture.now) : now;
      assert(
        !Number.isNaN(fixtureNow.valueOf()),
        `${name} has an invalid fixture clock`,
      );
      validateIndex(fixture.index, {}, { clock: fixtureNow });
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
  const indexedRows = [];
  for (const match of rows) {
    const cells = match[0]
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    if (cells.length !== 7) continue;
    const [unit, , , status, checkpoint, completion, evidence] = cells;
    if (
      !/^(?:TODO|IN PROGRESS(?: — .+)?|DONE|BLOCKED — .+|STALE — .+)$/u.test(
        status,
      )
    ) {
      continue;
    }
    assert(!units.has(unit), `Duplicate Plan 001 tracker unit ${unit}`);
    units.add(unit);
    if (status === "IN PROGRESS" || status.startsWith("IN PROGRESS —")) {
      assert(
        commitPattern(checkpoint),
        `In-progress unit ${unit} lacks a concrete checkpoint`,
      );
    }
    if (status === "DONE")
      assert(
        commitPattern(completion),
        `DONE unit ${unit} lacks completion SHA`,
      );
    const tokens = [
      ...evidence.matchAll(/evidence-index=([^\s|]+)@(sha256:[0-9a-f]{64})/gu),
    ];
    assert(
      tokens.length <= 1,
      `Unit ${unit} has multiple current evidence-index tokens`,
    );
    if (tokens.length === 0) {
      assert(
        status !== "DONE",
        `DONE unit ${unit} lacks an evidence-index token`,
      );
      continue;
    }
    const [, relative, expectedDigest] = tokens[0];
    const indexPath = path.resolve(repositoryRoot, relative);
    const bytes = await readFile(indexPath);
    assert(
      repositoryTextSha256(bytes) === expectedDigest,
      `Unit ${unit} evidence-index digest mismatch`,
    );
    const index = JSON.parse(bytes.toString("utf8"));
    indexedRows.push({ completion, index, status, unit });
  }

  const entriesByDigest = new Map();
  for (const { index, unit } of indexedRows) {
    for (const entry of index.entries) {
      const existing = entriesByDigest.get(entry.sha256);
      assert(
        !existing || stableJson(existing) === stableJson(entry),
        `Unit ${unit} reuses ${entry.sha256} with different evidence metadata`,
      );
      entriesByDigest.set(entry.sha256, entry);
    }
  }
  for (const { completion, index, status, unit } of indexedRows) {
    validateIndex(
      index,
      { plan: "001", unit },
      { clock: now, entriesByDigest },
    );
    assert(
      index.tracker_status === status,
      `Unit ${unit} status/index mismatch`,
    );
    if (status === "DONE") {
      assert(
        index.completion_sha === completion,
        `Unit ${unit} completion mismatch`,
      );
    }
  }
  assert(
    units.has("00a") && units.has("09c"),
    "Plan 001 tracker is incomplete",
  );

  const requiredPlan = args.get("--require-plan");
  const requiredUnit = args.get("--require-unit");
  if (requiredPlan || requiredUnit || requiredKinds.length > 0) {
    assert(
      requiredPlan && requiredUnit,
      "Required evidence assertions need --require-plan and --require-unit",
    );
    const selected = indexedRows.find(
      ({ index, unit }) =>
        index.plan_id === requiredPlan && unit === requiredUnit,
    );
    assert(
      selected,
      `No indexed tracker row for ${requiredPlan}/${requiredUnit}`,
    );
    const activeKinds = new Set(
      selected.index.entries
        .filter((entry) => entry.state === "active")
        .map((entry) => entry.kind),
    );
    for (const kind of requiredKinds) {
      assert(
        activeKinds.has(kind),
        `${requiredPlan}/${requiredUnit} lacks active ${kind}`,
      );
    }
  }
}

console.log(
  `Salt AI tracker validated (${fixtureCount} hostile/valid fixtures).`,
);
