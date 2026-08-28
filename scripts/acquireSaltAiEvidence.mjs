import { execFileSync } from "node:child_process";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
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
  sha256,
} from "./saltAiEvidenceUtils.mjs";

const SUPPORTED_PLANS = new Set(["001"]);
const SCHEMA_FILES = new Map([
  [
    "https://www.saltdesignsystem.com/ai/schemas/salt-ai-candidate-receipt-1.json",
    "saltAiCandidateReceiptV1.schema.json",
  ],
  [
    "https://www.saltdesignsystem.com/ai/schemas/salt-pattern-migration-receipt-1.json",
    "saltPatternMigrationReceiptV1.schema.json",
  ],
]);

const args = parseArgs(process.argv.slice(2));
assert(args.get("--tracker"), "--tracker is required");
assert(args.get("--output"), "--output is required");

const selectorFrom = args.get("--selector-from");
const selectorName = args.get("--selector");
const directUnit = args.get("--unit");
const directKind = args.get("--kind");
const directPlan = args.get("--plan");
const usesSelector = selectorFrom !== undefined || selectorName !== undefined;
assert(
  usesSelector
    ? selectorFrom && selectorName && !directUnit && !directKind && !directPlan
    : directUnit && directKind,
  "Use either --unit/--kind with optional --plan, or --selector-from/--selector",
);

function resolveRepositoryPath(value, label) {
  assert(
    typeof value === "string" &&
      value.length > 0 &&
      !path.isAbsolute(value) &&
      !value.includes("\\") &&
      !value.split("/").includes(".."),
    `${label} must be a portable repository-relative path`,
  );
  const resolved = path.resolve(repositoryRoot, ...value.split("/"));
  const relative = path.relative(repositoryRoot, resolved);
  assert(
    relative.length > 0 &&
      !relative.startsWith("..") &&
      !path.isAbsolute(relative),
    `${label} escapes the repository`,
  );
  return resolved;
}

function validator(schema) {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  return { ajv, validate: ajv.compile(schema) };
}

async function assertSchema(schema, value, label) {
  const { ajv, validate } = validator(schema);
  assert(
    validate(value),
    `${label} schema failure: ${ajv.errorsText(validate.errors, {
      separator: "; ",
    })}`,
  );
}

async function selectedTuple() {
  if (!usesSelector) {
    const plan = String(directPlan ?? "001");
    assert(SUPPORTED_PLANS.has(plan), `Plan ${plan} is not registered`);
    return {
      plan,
      unit: String(directUnit),
      kind: String(directKind),
      expectedDigest: null,
    };
  }

  const selectorPath = path.resolve(repositoryRoot, String(selectorFrom));
  const selectorDocument = await readJson(selectorPath);
  await assertSchema(
    await readJson(
      path.join(
        repositoryRoot,
        "scripts",
        "schemas",
        "saltEvidenceSelectorV1.schema.json",
      ),
    ),
    selectorDocument,
    "Evidence selector",
  );
  const matches = selectorDocument.selectors.filter(
    (entry) => entry.id === selectorName,
  );
  assert(matches.length === 1, `Selector ${selectorName} must resolve exactly once`);
  const selected = matches[0];
  assert(
    !/^(?:latest|current)$/u.test(selected.id),
    "Evidence selectors cannot be named latest or current",
  );
  assert(
    SUPPORTED_PLANS.has(selected.plan_id),
    `Plan ${selected.plan_id} is not registered`,
  );
  return {
    plan: selected.plan_id,
    unit: selected.unit_id,
    kind: selected.kind,
    expectedDigest: selected.sha256,
  };
}

function trackerRow(source, plan, unit) {
  const rows = [...source.matchAll(/^\|\s+([0-9]{2}[a-z]?)\s+\|[^\n]*$/gmu)]
    .map((match) =>
      match[0]
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim()),
    )
    .filter(
      (cells) =>
        cells.length === 7 &&
        cells[0] === unit &&
        cells[6].includes(`evidence-index=plans/evidence/${plan}/${unit}.json@`),
    );
  assert(rows.length === 1, `Tracker unit ${unit} must resolve exactly once`);
  return rows[0];
}

async function locatorBytes(locator) {
  if (locator.startsWith("repo://")) {
    const relative = locator.slice("repo://".length);
    const file = resolveRepositoryPath(relative, "Evidence locator");
    const value = await stat(file);
    assert(value.isFile() && !value.isSymbolicLink(), "Evidence locator is not a regular file");
    return readFile(file);
  }
  assert(locator.startsWith("https://"), "Evidence locator scheme is unsupported");
  const response = await fetch(locator, {
    headers: { accept: "application/json" },
    redirect: "error",
  });
  assert(response.ok, `Evidence download failed with HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

const selected = await selectedTuple();
assert(/^[0-9]{2}[a-z]?$/u.test(selected.unit), "Evidence unit is invalid");
assert(/^[a-z][a-z0-9-]*$/u.test(selected.kind), "Evidence kind is invalid");

const trackerPath = path.resolve(repositoryRoot, String(args.get("--tracker")));
const trackerSource = await readFile(trackerPath, "utf8");
const [, , , trackerStatus, , trackerCompletion, evidenceCell] = trackerRow(
  trackerSource,
  selected.plan,
  selected.unit,
);
const indexTokens = [
  ...evidenceCell.matchAll(
    /evidence-index=([^\s|]+)@(sha256:[0-9a-f]{64})/gu,
  ),
];
assert(indexTokens.length === 1, `Tracker unit ${selected.unit} has no exact evidence index`);
const [, indexRelative, indexDigest] = indexTokens[0];
const indexPath = resolveRepositoryPath(indexRelative, "Evidence index");
const indexBytes = await readFile(indexPath);
assert(sha256(indexBytes) === indexDigest, "Evidence index digest does not match the tracker");
const index = JSON.parse(indexBytes.toString("utf8"));
await assertSchema(
  await readJson(
    path.join(
      repositoryRoot,
      "scripts",
      "schemas",
      "saltPlanEvidenceIndexV1.schema.json",
    ),
  ),
  index,
  "Evidence index",
);
assert(index.plan_id === selected.plan, "Evidence index plan mismatch");
assert(index.unit_id === selected.unit, "Evidence index unit mismatch");
assert(index.tracker_status === trackerStatus, "Evidence index tracker status mismatch");
assert(
  trackerStatus === "DONE" &&
    commitPattern(trackerCompletion) &&
    index.completion_sha === trackerCompletion,
  "Evidence acquisition requires a completed tracker unit",
);

const entries = index.entries.filter(
  (entry) => entry.kind === selected.kind && entry.state === "active",
);
assert(entries.length === 1, `Evidence tuple ${selected.plan}/${selected.unit}/${selected.kind} must resolve exactly once`);
const entry = entries[0];
assert(digestPattern(entry.sha256), "Evidence entry digest is invalid");
assert(
  selected.expectedDigest === null || selected.expectedDigest === entry.sha256,
  "Reviewed selector digest does not match the indexed tuple",
);
assert(entry.completion_sha === trackerCompletion, "Evidence completion SHA mismatch");
const bytes = await locatorBytes(entry.locator);
assert(sha256(bytes) === entry.sha256, "Evidence artifact digest mismatch");
const receipt = JSON.parse(bytes.toString("utf8"));
assert(receipt.$schema === entry.schema_id, "Evidence schema ID mismatch");
assert(receipt.schema_version === entry.schema_version, "Evidence schema version mismatch");
const schemaFile = SCHEMA_FILES.get(entry.schema_id);
assert(schemaFile, `Evidence schema ${entry.schema_id} is not registered`);
await assertSchema(
  await readJson(path.join(repositoryRoot, "scripts", "schemas", schemaFile)),
  receipt,
  "Evidence artifact",
);
assert(
  receipt.source_commit === entry.source_sha &&
    commitPattern(receipt.source_commit),
  "Evidence source SHA mismatch",
);

const outputPath = path.resolve(repositoryRoot, String(args.get("--output")));
const outputRelative = path.relative(repositoryRoot, outputPath).replaceAll("\\", "/");
assert(
  outputRelative.startsWith("dist/") &&
    !outputRelative.split("/").includes(".."),
  "Evidence output must stay in ignored dist/",
);
try {
  await stat(outputPath);
  throw new Error("Evidence output already exists; acquisition never overwrites");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
execFileSync("git", ["check-ignore", "--no-index", "--quiet", outputRelative], {
  cwd: repositoryRoot,
  windowsHide: true,
});
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, bytes, { flag: "wx" });

console.log(
  `Acquired ${selected.plan}/${selected.unit}/${selected.kind} (${entry.sha256}) to ${outputRelative}.`,
);
