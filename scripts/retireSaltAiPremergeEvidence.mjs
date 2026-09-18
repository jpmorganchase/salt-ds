import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  assert,
  readJson,
  repositoryRoot,
  sha256,
  stableJson,
} from "./saltAiEvidenceUtils.mjs";

const SCOPE_PATTERN = /^[0-9]{3}\/[0-9]{2}[a-z]?$/u;
const KIND_PATTERN = /^[a-z0-9][a-z0-9-]*$/u;

function parseArguments(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    assert(key.startsWith("--"), `Unexpected argument: ${key}`);
    const next = argv[index + 1];
    const value = next === undefined || next.startsWith("--") ? true : next;
    assert(!values.has(key), `Argument ${key} may be supplied only once`);
    values.set(key, value);
    if (value !== true) index += 1;
  }
  return values;
}

export function validatePairRegistry(registry) {
  assert(
    registry?.schema_version === "1.0.0",
    "Unsupported pair registry version",
  );
  assert(
    Array.isArray(registry.pairs) && registry.pairs.length > 0,
    "Pair registry is empty",
  );
  const identities = new Set();
  const kinds = new Map();
  const sorted = [...registry.pairs].sort((left, right) =>
    `${left.scope}\0${left.premerge_kind}`.localeCompare(
      `${right.scope}\0${right.premerge_kind}`,
    ),
  );
  assert(
    registry.pairs.every((pair, index) => pair === sorted[index]),
    "Pair registry must be sorted by scope and premerge kind",
  );
  for (const pair of registry.pairs) {
    assert(SCOPE_PATTERN.test(pair.scope), `Invalid pair scope ${pair.scope}`);
    assert(
      KIND_PATTERN.test(pair.premerge_kind),
      `Invalid premerge kind ${pair.premerge_kind}`,
    );
    assert(
      KIND_PATTERN.test(pair.landed_kind),
      `Invalid landed kind ${pair.landed_kind}`,
    );
    assert(
      pair.premerge_kind !== pair.landed_kind,
      `${pair.scope} maps a kind to itself`,
    );
    const identity = `${pair.scope}\0${pair.premerge_kind}\0${pair.landed_kind}`;
    assert(
      !identities.has(identity),
      `Duplicate registered pair in ${pair.scope}`,
    );
    identities.add(identity);
    for (const kind of [pair.premerge_kind, pair.landed_kind]) {
      const prior = kinds.get(kind);
      assert(
        !prior || prior === pair.scope,
        `Evidence kind ${kind} is reused across scopes`,
      );
      kinds.set(kind, pair.scope);
    }
  }
  return registry;
}

export function registeredPairsForScope(registry, scope) {
  validatePairRegistry(registry);
  assert(SCOPE_PATTERN.test(scope), `Invalid requested scope ${scope}`);
  const pairs = registry.pairs.filter((pair) => pair.scope === scope);
  assert(
    pairs.length > 0,
    `No premerge evidence pairs are registered for ${scope}`,
  );
  return pairs;
}

export function assertCompleteScopeSelection(registry, scope, requestedPairs) {
  const registered = registeredPairsForScope(registry, scope);
  const identity = (pair) => `${pair.premerge_kind}->${pair.landed_kind}`;
  const expected = registered.map(identity).sort();
  const actual = requestedPairs.map(identity).sort();
  assert(
    new Set(actual).size === actual.length,
    `${scope} selection repeats a pair`,
  );
  assert(
    JSON.stringify(actual) === JSON.stringify(expected),
    `${scope} retirement must select the complete registered pair batch`,
  );
  return registered;
}

export function retireEvidencePairs(index, scope, pairs) {
  const [planId, unitId] = scope.split("/");
  assert(
    index?.plan_id === planId && index?.unit_id === unitId,
    `${scope} evidence index mismatch`,
  );
  assert(
    Array.isArray(index.entries),
    `${scope} evidence index has no entries`,
  );
  const updated = structuredClone(index);
  const activeByKind = new Map();
  for (const entry of updated.entries) {
    if (entry.state !== "active") continue;
    assert(
      !activeByKind.has(entry.kind),
      `${scope} has multiple active ${entry.kind} entries`,
    );
    activeByKind.set(entry.kind, entry);
  }
  for (const pair of pairs) {
    const premerge = activeByKind.get(pair.premerge_kind);
    const landed = activeByKind.get(pair.landed_kind);
    assert(premerge, `${scope} is missing active ${pair.premerge_kind}`);
    assert(landed, `${scope} is missing active ${pair.landed_kind}`);
    assert(
      premerge.evidence_phase === "premerge",
      `${pair.premerge_kind} is not premerge evidence`,
    );
    assert(
      Array.isArray(landed.parents) && landed.parents.includes(premerge.sha256),
      `${pair.landed_kind} does not parent ${pair.premerge_kind}`,
    );
    premerge.state = "retired";
    premerge.retired_by = { kind: landed.kind, sha256: landed.sha256 };
    delete premerge.successor_sha256;
  }
  return updated;
}

function trackerUnitRow(source, unit) {
  const rows = [...source.matchAll(/^\|\s+([0-9]{2}[a-z]?)\s+\|[^\n]*$/gmu)];
  const row = rows.find((candidate) => candidate[1] === unit);
  assert(row, `Tracker has no unit ${unit}`);
  return row;
}

async function writePairAtomically(
  indexPath,
  trackerPath,
  index,
  trackerSource,
  oldIndexBytes,
) {
  const indexBytes = Buffer.from(stableJson(index), "utf8");
  const nextDigest = sha256(indexBytes);
  const tokenPattern = /(evidence-index=[^\s|]+@)sha256:[0-9a-f]{64}/u;
  assert(
    tokenPattern.test(trackerSource),
    "Tracker row has no evidence-index token",
  );
  const nextTracker = trackerSource.replace(tokenPattern, `$1${nextDigest}`);
  const suffix = `${process.pid}.tmp`;
  const indexTemp = `${indexPath}.${suffix}`;
  const trackerTemp = `${trackerPath}.${suffix}`;
  await mkdir(path.dirname(indexPath), { recursive: true });
  await Promise.all([
    writeFile(indexTemp, indexBytes),
    writeFile(trackerTemp, nextTracker, "utf8"),
  ]);
  try {
    await rename(indexTemp, indexPath);
    try {
      await rename(trackerTemp, trackerPath);
    } catch (error) {
      await writeFile(indexPath, oldIndexBytes);
      throw error;
    }
  } finally {
    await Promise.all([
      rm(indexTemp, { force: true }),
      rm(trackerTemp, { force: true }),
    ]);
  }
  return nextDigest;
}

async function main() {
  const args = parseArguments(process.argv.slice(2));
  const plan = String(args.get("--plan") ?? "");
  const unit = String(args.get("--unit") ?? "");
  const scope = String(args.get("--scope") ?? `${plan}/${unit}`);
  assert(scope === `${plan}/${unit}`, "--scope must equal --plan/--unit");
  const registryPath = path.resolve(
    repositoryRoot,
    String(
      args.get("--pairs-from") ??
        args.get("--registry") ??
        "tooling/ai/premerge-evidence-pairs-v1.json",
    ),
  );
  const registry = validatePairRegistry(await readJson(registryPath));
  let pairs;
  if (args.has("--premerge-kind") || args.has("--landed-kind")) {
    assert(
      args.has("--premerge-kind") && args.has("--landed-kind"),
      "Direct retirement requires both kinds",
    );
    pairs = [
      {
        scope,
        premerge_kind: String(args.get("--premerge-kind")),
        landed_kind: String(args.get("--landed-kind")),
      },
    ];
    const registered = registeredPairsForScope(registry, scope);
    assert(
      registered.some(
        (pair) =>
          pair.premerge_kind === pairs[0].premerge_kind &&
          pair.landed_kind === pairs[0].landed_kind,
      ),
      `${scope} direct pair is not registered`,
    );
    assert(
      registered.length === 1,
      `${scope} direct retirement cannot select a partial batch`,
    );
  } else {
    pairs = registeredPairsForScope(registry, scope);
    assertCompleteScopeSelection(registry, scope, pairs);
  }

  const trackerPath = path.resolve(
    repositoryRoot,
    String(args.get("--tracker") ?? "plans/README.md"),
  );
  const trackerSource = await readFile(trackerPath, "utf8");
  const row = trackerUnitRow(trackerSource, unit);
  const token = row[0].match(/evidence-index=([^\s|]+)@(sha256:[0-9a-f]{64})/u);
  assert(token, `Tracker unit ${unit} has no evidence index`);
  const indexPath = path.resolve(repositoryRoot, token[1]);
  const oldIndexBytes = await readFile(indexPath);
  assert(
    sha256(oldIndexBytes) === token[2],
    `${scope} tracker/index digest mismatch`,
  );
  const retired = retireEvidencePairs(
    JSON.parse(oldIndexBytes.toString("utf8")),
    scope,
    pairs,
  );

  if (args.has("--dry-run")) {
    process.stdout.write(stableJson(retired));
    return;
  }
  const rowSource = row[0];
  const nextRowDigest = sha256(Buffer.from(stableJson(retired), "utf8"));
  const nextRow = rowSource.replace(
    /(evidence-index=[^\s|]+@)sha256:[0-9a-f]{64}/u,
    `$1${nextRowDigest}`,
  );
  const nextTrackerSource = trackerSource.replace(rowSource, nextRow);
  const digest = await writePairAtomically(
    indexPath,
    trackerPath,
    retired,
    nextTrackerSource,
    oldIndexBytes,
  );
  console.log(
    `Retired ${pairs.length} premerge evidence pair(s) for ${scope}; index ${digest}.`,
  );
}

const invoked = process.argv[1] ? path.resolve(process.argv[1]) : null;
if (invoked === path.resolve(fileURLToPath(import.meta.url))) {
  await main();
}
