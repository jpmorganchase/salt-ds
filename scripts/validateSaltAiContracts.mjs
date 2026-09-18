import { execFileSync } from "node:child_process";
import { stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { validateEvaluation } from "../evals/salt-ai/scripts/validate.mjs";
import {
  assertCompleteScopeSelection,
  registeredPairsForScope,
  retireEvidencePairs,
  validatePairRegistry,
} from "./retireSaltAiPremergeEvidence.mjs";
import { assert, readJson, repositoryRoot } from "./saltAiEvidenceUtils.mjs";

const FAMILY_UNIVERSE = [
  "@salt-ds/ag-grid-theme",
  "@salt-ds/core",
  "@salt-ds/countries",
  "@salt-ds/date-adapters",
  "@salt-ds/date-components",
  "@salt-ds/embla-carousel",
  "@salt-ds/highcharts-theme",
  "@salt-ds/icons",
  "@salt-ds/lab",
  "@salt-ds/react-resizable-panels-theme",
  "@salt-ds/styles",
  "@salt-ds/theme",
  "@salt-ds/window",
];
const METADATA_FIELDS = [
  "description",
  "license",
  "repository",
  "bugs",
  "keywords",
];
const HISTORICAL_PREDECESSOR = "e55fa54e215503b4a0e521e2f5ee054b9f0068ce";
const HISTORICAL_AUTHORING_CHECKPOINT =
  "37b1a7dcdecd171fd05e52497d9813bfaa7bb88e";

const CURRENT_ROOT_SCRIPTS = Object.freeze({
  "validate:salt-ai:contracts": "node ./scripts/validateSaltAiContracts.mjs",
  "validate:salt-ai:contracts:historical":
    "node ./scripts/validateSaltAiContracts.mjs --historical",
  "eval:salt-ai:validate": "node ./evals/salt-ai/scripts/validate.mjs",
});

const HISTORICAL_ROOT_SCRIPTS = Object.freeze({
  "acquire:salt-ai:evidence": "node ./scripts/acquireSaltAiEvidence.mjs",
  "candidate:salt-ai:seal": "node ./scripts/sealSaltAiCandidateReceipt.mjs",
  "check:salt-docs-authoring": "node ./scripts/checkSaltDocsAuthoring.mjs",
  "retire:salt-ai:premerge-evidence":
    "node ./scripts/retireSaltAiPremergeEvidence.mjs",
  "verify:salt-pattern-migration":
    "node ./scripts/verifySaltPatternMigration.mjs",
  "eval:salt-ai:report": "node ./evals/salt-ai/scripts/buildReport.mjs",
  "eval:salt-ai:run": "node ./evals/salt-ai/scripts/runMcpCandidate.mjs",
  "eval:salt-ai:gate": "node ./evals/salt-ai/scripts/gateMcpCandidate.mjs",
});

function schemaValidator(schema) {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  return { ajv, validate: ajv.compile(schema) };
}

function frozenText(commit, relative) {
  assert(
    /^[0-9a-f]{40}$/u.test(commit) &&
      !path.isAbsolute(relative) &&
      !relative.split(/[\\/]/u).includes(".."),
    "Invalid historical contract snapshot reference",
  );
  try {
    return String(
      execFileSync("git", ["show", `${commit}:${relative}`], {
        cwd: repositoryRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }),
    );
  } catch {
    throw new Error(
      `Historical contract snapshot is unavailable: ${commit}:${relative}`,
    );
  }
}

function frozenJson(commit, relative) {
  return JSON.parse(frozenText(commit, relative));
}

function frozenFileExists(commit, relative) {
  try {
    frozenText(commit, relative);
    return true;
  } catch {
    return false;
  }
}

function frozenFiles(commit, directory) {
  try {
    return String(
      execFileSync(
        "git",
        ["ls-tree", "-r", "--name-only", commit, "--", directory],
        {
          cwd: repositoryRoot,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        },
      ),
    )
      .split(/\r?\n/u)
      .filter((file) => file.endsWith(".json"))
      .sort();
  } catch {
    throw new Error(
      `Historical contract snapshot is unavailable: ${commit}:${directory}`,
    );
  }
}

async function validateSchemaDocument(schemaPath, documentPath) {
  const [schema, document] = await Promise.all([
    readJson(schemaPath),
    readJson(documentPath),
  ]);
  const { ajv, validate } = schemaValidator(schema);
  assert(
    validate(document),
    `${path.basename(documentPath)} schema failure: ${ajv.errorsText(validate.errors, { separator: "; " })}`,
  );
  return document;
}

function withinRepository(relative) {
  const absolute = path.resolve(repositoryRoot, relative);
  const rel = path.relative(repositoryRoot, absolute);
  assert(
    rel !== ".." && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel),
    `${relative} escapes the repository`,
  );
  return absolute;
}

async function exists(relative, kind = "file") {
  const value = await stat(withinRepository(relative));
  assert(
    kind === "directory" ? value.isDirectory() : value.isFile(),
    `${relative} is not a ${kind}`,
  );
}

async function pathExists(relative) {
  try {
    const value = await stat(withinRepository(relative));
    return value.isFile() || value.isDirectory();
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function validatePackageDocs() {
  schemaValidator(
    await readJson(
      path.join(
        repositoryRoot,
        "scripts",
        "schemas",
        "saltPublicPackageDocsEffectiveV1.schema.json",
      ),
    ),
  );
  const inventory = await validateSchemaDocument(
    path.join(
      repositoryRoot,
      "scripts",
      "schemas",
      "saltPublicPackageDocsV1.schema.json",
    ),
    path.join(repositoryRoot, "tooling", "ai", "public-package-docs-v1.json"),
  );
  const names = inventory.packages.map((entry) => entry.name);
  assert(
    new Set(names).size === names.length,
    "Public package docs inventory repeats a package",
  );
  assert(
    JSON.stringify(names) === JSON.stringify([...names].sort()),
    "Public package docs inventory is not package-sorted",
  );
  assert(
    names.includes("@salt-ds/cli") &&
      names.includes("@salt-ds/knowledge") &&
      !names.includes("@salt-ds/mcp"),
    "Selected AI package lifecycle entries are incomplete",
  );
  const worklistByName = new Map(
    inventory.remediation_worklist.map((entry) => [entry.name, entry]),
  );
  assert(
    worklistByName.size === inventory.remediation_worklist.length,
    "Public package docs worklist repeats a package",
  );
  assert(
    JSON.stringify(
      inventory.remediation_worklist.map((entry) => entry.name),
    ) ===
      JSON.stringify(
        inventory.remediation_worklist.map((entry) => entry.name).sort(),
      ),
    "Public package docs worklist is not package-sorted",
  );
  for (const entry of inventory.packages) {
    assert(
      entry.owner.primary !== entry.owner.backup,
      `${entry.name} primary and backup owners must differ`,
    );
    if (entry.workspace_path === null) {
      assert(
        entry.lifecycle === "planned",
        `${entry.name} has no workspace but is not planned`,
      );
      continue;
    }
    await exists(`${entry.workspace_path}/package.json`);
    const readmePresent = await pathExists(entry.readme_path);
    assert(
      readmePresent ||
        worklistByName.get(entry.name)?.deficits.includes("readme"),
      `${entry.name} README absence is not frozen in the remediation worklist`,
    );
    const manifest = await readJson(
      path.join(repositoryRoot, entry.workspace_path, "package.json"),
    );
    assert(
      manifest.name === entry.name,
      `${entry.name} workspace manifest mismatch`,
    );
    for (const field of METADATA_FIELDS) {
      const actual = manifest[field] === undefined ? "missing" : "present";
      assert(
        entry.metadata_fields[field] === actual ||
          (entry.metadata_fields[field] === "planned" && actual === "missing"),
        `${entry.name} metadata state drifted for ${field}`,
      );
    }
    const actualDeficits = [
      ...(!readmePresent ? ["readme"] : []),
      ...(manifest.description === undefined ? ["description"] : []),
      ...(manifest.homepage === undefined ? ["homepage"] : []),
      ...(manifest.keywords === undefined ? ["keywords"] : []),
      ...(manifest.bugs === undefined ? ["bugs"] : []),
      ...(manifest.publishIncludeReadme === false ? ["packed_readme"] : []),
    ].sort();
    const frozenDeficits = [
      ...(worklistByName.get(entry.name)?.deficits ?? []),
    ].sort();
    assert(
      JSON.stringify(actualDeficits) === JSON.stringify(frozenDeficits),
      `${entry.name} remediation deficits drifted: expected ${frozenDeficits.join(", ") || "none"}; found ${actualDeficits.join(", ") || "none"}`,
    );
  }
  return inventory;
}

export function assertHistoricalPackageDocsSnapshot(inventory) {
  assert(
    inventory.authoring_baseline.checkpoint_sha ===
      HISTORICAL_AUTHORING_CHECKPOINT,
    "Public package docs baseline does not bind Unit 05",
  );
  const activeFamilies = inventory.packages
    .filter((entry) => entry.lifecycle === "publishable")
    .map((entry) => entry.name);
  assert(
    JSON.stringify(activeFamilies) === JSON.stringify(FAMILY_UNIVERSE),
    "Publishable family inventory differs from the frozen universe",
  );
}

async function validateVisibility() {
  const inventory = await validateSchemaDocument(
    path.join(
      repositoryRoot,
      "scripts",
      "schemas",
      "saltContentVisibilityV1.schema.json",
    ),
    path.join(repositoryRoot, "tooling", "ai", "content-visibility-v1.json"),
  );
  const roots = new Set();
  for (const entry of inventory.source_roots) {
    assert(!roots.has(entry.path), `Duplicate visibility root ${entry.path}`);
    roots.add(entry.path);
    const target = withinRepository(entry.path);
    const value = await stat(target);
    assert(
      value.isFile() || value.isDirectory(),
      `${entry.path} is not a source root`,
    );
  }
  const overrides = new Set();
  for (const entry of inventory.item_overrides) {
    assert(
      !overrides.has(entry.path),
      `Duplicate visibility override ${entry.path}`,
    );
    overrides.add(entry.path);
    await stat(withinRepository(entry.path));
  }
  const destinations = inventory.destination_classes.map((entry) => entry.id);
  assert(
    new Set(destinations).size === destinations.length,
    "Destination classes repeat an ID",
  );
  assert(
    destinations.includes("github_issues_support"),
    "GitHub Issues removal policy is missing",
  );
  const batches = new Map(
    inventory.closure_batches.map((entry) => [entry.id, entry]),
  );
  assert(
    JSON.stringify(inventory.unclassified.map((entry) => entry.path)) ===
      JSON.stringify(inventory.unclassified.map((entry) => entry.path).sort()),
    "Visibility unclassified inventory is not path-sorted",
  );
  for (const entry of inventory.unclassified) {
    const batch = batches.get(entry.closure_batch);
    assert(
      batch?.paths.includes(entry.path),
      `${entry.path} is not in its closure batch`,
    );
    await stat(withinRepository(entry.path));
  }
  for (const batch of inventory.closure_batches) {
    assert(
      JSON.stringify(batch.paths) === JSON.stringify([...batch.paths].sort()),
      `${batch.id} paths are not path-sorted`,
    );
  }
  return inventory;
}

export function assertHistoricalVisibilitySnapshot(inventory) {
  assert(
    inventory.authoring_baseline.checkpoint_sha ===
      HISTORICAL_AUTHORING_CHECKPOINT,
    "Visibility authoring baseline does not bind Unit 05",
  );
  assert(
    JSON.stringify(inventory.provenance_kinds) ===
      JSON.stringify([
        "authored_normative_guidance",
        "generated_api_fact",
        "inferred_implementation_signal",
        "test_receipt",
      ]),
    "Visibility provenance kinds are incomplete or reordered",
  );
}

export function assertCurrentMigrationRecord(record, ids) {
  assert(
    /^[a-z0-9][a-z0-9-]*$/u.test(record.id) && !ids.has(record.id),
    `Invalid or duplicate migration ID ${record.id}`,
  );
  ids.add(record.id);
  assert(
    typeof record.status === "string" && record.status.trim().length > 0,
    `${record.id} has no migration status`,
  );
  assert(
    record.file === `docs/ai/migrations/records/${record.id}.json`,
    `${record.id} has a noncanonical path`,
  );
  assert(
    record.owners.primary !== record.owners.backup,
    `${record.id} owners are not independent`,
  );
  for (const family of record.affected_families)
    assert(
      /^@salt-ds\/[a-z0-9][a-z0-9._-]*$/u.test(family),
      `${record.id} uses an invalid package family ${family}`,
    );
  assert(
    record.required_source_evidence.length >= 2,
    `${record.id} has insufficient source evidence`,
  );
}

export function assertHistoricalMigrationRecord(record) {
  assert(
    record.status === "planned",
    `${record.id} must remain planned in Unit 00b`,
  );
  for (const family of record.affected_families)
    assert(
      FAMILY_UNIVERSE.includes(family),
      `${record.id} uses unknown family ${family}`,
    );
}

async function validateMigrations() {
  const inventory = await readJson(
    path.join(repositoryRoot, "tooling", "ai", "migration-records-v1.json"),
  );
  assert(
    inventory.schema_version === "1.0.0" &&
      inventory.record_contract === "salt-migration-record/1",
    "Migration inventory contract mismatch",
  );
  assert(
    Array.isArray(inventory.records) && inventory.records.length > 0,
    "Migration inventory is empty",
  );
  const ids = new Set();
  for (const record of inventory.records) {
    assertCurrentMigrationRecord(record, ids);
    for (const source of record.required_source_evidence) await exists(source);
  }
  return inventory;
}

export function assertHistoricalRetirementPairCounts(registry) {
  assert(
    registeredPairsForScope(registry, "001/08c").length === 8,
    "Unit 08c must have exactly eight evidence pairs",
  );
  assert(
    registeredPairsForScope(registry, "001/09c").length === 1,
    "Unit 09c must have exactly one evidence pair",
  );
}

export function assertHistoricalRetirementFixture(registry, fixture, name) {
  let failed = false;
  try {
    if (fixture.mode === "registry") validatePairRegistry(fixture.registry);
    else if (fixture.mode === "selection")
      assertCompleteScopeSelection(registry, fixture.scope, fixture.pairs);
    else {
      assertCompleteScopeSelection(registry, fixture.scope, fixture.pairs);
      retireEvidencePairs(fixture.index, fixture.scope, fixture.pairs);
    }
  } catch {
    failed = true;
  }
  assert(
    failed === !fixture.valid,
    `${name} expected valid=${fixture.valid} but ${failed ? "failed" : "passed"}`,
  );
}

async function validateHistoricalRetirementFixtures() {
  const registry = validatePairRegistry(
    frozenJson(
      HISTORICAL_PREDECESSOR,
      "tooling/ai/premerge-evidence-pairs-v1.json",
    ),
  );
  assertHistoricalRetirementPairCounts(registry);
  const files = frozenFiles(
    HISTORICAL_PREDECESSOR,
    "scripts/fixtures/salt-ai-premerge-retirement",
  );
  for (const file of files)
    assertHistoricalRetirementFixture(
      registry,
      frozenJson(HISTORICAL_PREDECESSOR, file),
      path.basename(file),
    );
  return files.length;
}

export function assertHistoricalDecisionDocument(adr) {
  for (const token of [
    "@salt-ds/knowledge",
    "@salt-ds/cli",
    "@salt-ds/mcp",
    "salt-ds",
    "2026-07-28",
    "ORDINARY_RELEASE",
    "SALT_AI_RELEASE",
    "SALT_DOCS_RELEASE",
    "not_selected",
    "64 KiB",
    "40,000",
    "10 percentage points",
    "five percentage",
    "Plan 002",
    "unresolved",
    "https://www.saltdesignsystem.com/salt/support-and-contributions",
  ])
    assert(
      adr.includes(token),
      `ADR is missing required decision text: ${token}`,
    );
}

async function validateCurrentDecisionDocs() {
  const guides = [
    "knowledge-bundle.md",
    "scan-result.md",
    "support-matrix.md",
    "evaluation.md",
    "release-runbook.md",
    "contributing.md",
  ];
  for (const guide of guides) await exists(`docs/ai/${guide}`);
  await exists("AGENTS.md");
}

export function assertRootScripts(manifest, required, label) {
  for (const [name, command] of Object.entries(required))
    assert(
      manifest.scripts?.[name] === command,
      `${label} root script ${name} is missing or changed`,
    );
}

async function validateCurrentRootScripts() {
  const manifest = await readJson(path.join(repositoryRoot, "package.json"));
  assertRootScripts(manifest, CURRENT_ROOT_SCRIPTS, "Current");
  for (const name of ["eval:salt-ai:run", "eval:salt-ai:gate"])
    assert(
      manifest.scripts?.[name] === undefined,
      `Current root script ${name} must not expose the omitted MCP experiment`,
    );
}

async function validateCurrentSchemas() {
  for (const name of [
    "saltAiCandidateReceiptV1.schema.json",
    "saltAuthoredExampleManifestV1.schema.json",
    "saltAuthoredExampleManifestV2.schema.json",
    "saltPatternMigrationReceiptV1.schema.json",
    "saltMcpCandidateDispositionEvidenceV1.schema.json",
    "saltSelectedGraphReceiptV1.schema.json",
  ])
    schemaValidator(
      await readJson(path.join(repositoryRoot, "scripts", "schemas", name)),
    );
}

export async function validateCurrentContracts() {
  await validateCurrentSchemas();
  const packageDocs = await validatePackageDocs();
  await validateVisibility();
  await validateMigrations();
  await validateCurrentDecisionDocs();
  await validateCurrentRootScripts();
  const evaluation = await validateEvaluation();
  return {
    evaluation,
    packageFamilies: packageDocs.packages.filter(
      (entry) => entry.lifecycle === "publishable",
    ).length,
  };
}

export async function validateHistoricalContracts() {
  const packageDocs = frozenJson(
    HISTORICAL_PREDECESSOR,
    "tooling/ai/public-package-docs-v1.json",
  );
  assertHistoricalPackageDocsSnapshot(packageDocs);
  const visibility = frozenJson(
    HISTORICAL_PREDECESSOR,
    "tooling/ai/content-visibility-v1.json",
  );
  assertHistoricalVisibilitySnapshot(visibility);

  const migrations = frozenJson(
    HISTORICAL_PREDECESSOR,
    "tooling/ai/migration-records-v1.json",
  );
  assert(
    migrations.schema_version === "1.0.0" &&
      migrations.record_contract === "salt-migration-record/1",
    "Historical migration inventory contract mismatch",
  );
  for (const record of migrations.records) {
    assertHistoricalMigrationRecord(record);
    for (const source of record.required_source_evidence)
      assert(
        frozenFileExists(HISTORICAL_PREDECESSOR, source),
        `${record.id} historical source evidence is unavailable: ${source}`,
      );
  }

  const retirementFixtures = await validateHistoricalRetirementFixtures();
  assertHistoricalDecisionDocument(
    frozenText(
      HISTORICAL_PREDECESSOR,
      "docs/decisions/0001-salt-ai-knowledge-platform.md",
    ),
  );
  assertRootScripts(
    frozenJson(HISTORICAL_PREDECESSOR, "package.json"),
    HISTORICAL_ROOT_SCRIPTS,
    "Historical",
  );
  return { retirementFixtures };
}

export async function validateContracts({ historical = false } = {}) {
  const current = await validateCurrentContracts();
  const history = historical ? await validateHistoricalContracts() : null;
  return { current, history };
}

async function main() {
  const args = process.argv.slice(2);
  assert(
    args.length === 0 || (args.length === 1 && args[0] === "--historical"),
    "validateSaltAiContracts accepts only --historical",
  );
  const { current, history } = await validateContracts({
    historical: args.includes("--historical"),
  });
  const message = history
    ? `Salt AI metadata/contracts and historical audit validated (${current.packageFamilies} package families, ${history.retirementFixtures} historical retirement fixtures, ${current.evaluation.outcomeCases} current outcome cases).`
    : `Salt AI metadata/contracts validated (${current.packageFamilies} package families, ${current.evaluation.outcomeCases} current outcome cases).`;
  console.log(message);
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  main().catch((error) => {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  });
