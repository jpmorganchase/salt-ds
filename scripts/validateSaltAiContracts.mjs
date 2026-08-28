import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import { assert, readJson, repositoryRoot } from "./saltAiEvidenceUtils.mjs";
import {
  assertCompleteScopeSelection,
  registeredPairsForScope,
  retireEvidencePairs,
  validatePairRegistry,
} from "./retireSaltAiPremergeEvidence.mjs";
import { validateEvaluation } from "../evals/salt-ai/scripts/validate.mjs";

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

function schemaValidator(schema) {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  return { ajv, validate: ajv.compile(schema) };
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
  assert(
    inventory.authoring_baseline.checkpoint_sha ===
      "37b1a7dcdecd171fd05e52497d9813bfaa7bb88e",
    "Public package docs baseline does not bind Unit 05",
  );
  const worklistByName = new Map(
    inventory.remediation_worklist.map((entry) => [entry.name, entry]),
  );
  assert(
    worklistByName.size === inventory.remediation_worklist.length,
    "Public package docs worklist repeats a package",
  );
  assert(
    JSON.stringify(inventory.remediation_worklist.map((entry) => entry.name)) ===
      JSON.stringify(
        inventory.remediation_worklist.map((entry) => entry.name).sort(),
      ),
    "Public package docs worklist is not package-sorted",
  );
  const activeFamilies = inventory.packages
    .filter((entry) => entry.lifecycle === "publishable")
    .map((entry) => entry.name);
  assert(
    JSON.stringify(activeFamilies) === JSON.stringify(FAMILY_UNIVERSE),
    "Publishable family inventory differs from the frozen universe",
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
      readmePresent || worklistByName.get(entry.name)?.deficits.includes("readme"),
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
    const frozenDeficits = [...(worklistByName.get(entry.name)?.deficits ?? [])].sort();
    assert(
      JSON.stringify(actualDeficits) === JSON.stringify(frozenDeficits),
      `${entry.name} remediation deficits drifted: expected ${frozenDeficits.join(", ") || "none"}; found ${actualDeficits.join(", ") || "none"}`,
    );
  }
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
  assert(
    inventory.authoring_baseline.checkpoint_sha ===
      "37b1a7dcdecd171fd05e52497d9813bfaa7bb88e",
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
    assert(
      /^[a-z0-9][a-z0-9-]*$/u.test(record.id) && !ids.has(record.id),
      `Invalid or duplicate migration ID ${record.id}`,
    );
    ids.add(record.id);
    assert(
      record.status === "planned",
      `${record.id} must remain planned in Unit 00b`,
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
        FAMILY_UNIVERSE.includes(family),
        `${record.id} uses unknown family ${family}`,
      );
    assert(
      record.required_source_evidence.length >= 2,
      `${record.id} has insufficient source evidence`,
    );
    for (const source of record.required_source_evidence) await exists(source);
  }
}

async function validateRetirementFixtures() {
  const registry = validatePairRegistry(
    await readJson(
      path.join(
        repositoryRoot,
        "tooling",
        "ai",
        "premerge-evidence-pairs-v1.json",
      ),
    ),
  );
  assert(
    registeredPairsForScope(registry, "001/08c").length === 8,
    "Unit 08c must have exactly eight evidence pairs",
  );
  assert(
    registeredPairsForScope(registry, "001/09c").length === 1,
    "Unit 09c must have exactly one evidence pair",
  );
  const directory = path.join(
    repositoryRoot,
    "scripts",
    "fixtures",
    "salt-ai-premerge-retirement",
  );
  const files = (await readdir(directory))
    .filter((name) => name.endsWith(".json"))
    .sort();
  for (const name of files) {
    const fixture = await readJson(path.join(directory, name));
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
  return files.length;
}

async function validateDecisionDocs() {
  const adr = await readFile(
    path.join(
      repositoryRoot,
      "docs",
      "decisions",
      "0001-salt-ai-knowledge-platform.md",
    ),
    "utf8",
  );
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

async function validateRootScripts() {
  const manifest = await readJson(path.join(repositoryRoot, "package.json"));
  const required = {
    "acquire:salt-ai:evidence":
      "node ./scripts/acquireSaltAiEvidence.mjs",
    "candidate:salt-ai:seal":
      "node ./scripts/sealSaltAiCandidateReceipt.mjs",
    "check:salt-docs-authoring":
      "node ./scripts/checkSaltDocsAuthoring.mjs",
    "validate:salt-ai:contracts": "node ./scripts/validateSaltAiContracts.mjs",
    "retire:salt-ai:premerge-evidence":
      "node ./scripts/retireSaltAiPremergeEvidence.mjs",
    "verify:salt-pattern-migration":
      "node ./scripts/verifySaltPatternMigration.mjs",
    "eval:salt-ai:validate": "node ./evals/salt-ai/scripts/validate.mjs",
    "eval:salt-ai:report": "node ./evals/salt-ai/scripts/buildReport.mjs",
  };
  for (const [name, command] of Object.entries(required))
    assert(
      manifest.scripts?.[name] === command,
      `Root script ${name} is missing or changed`,
    );
}

schemaValidator(
  await readJson(
    path.join(
      repositoryRoot,
      "scripts",
      "schemas",
      "saltAiCandidateReceiptV1.schema.json",
    ),
  ),
);
schemaValidator(
  await readJson(
    path.join(
      repositoryRoot,
      "scripts",
      "schemas",
      "saltAuthoredExampleManifestV1.schema.json",
    ),
  ),
);
schemaValidator(
  await readJson(
    path.join(
      repositoryRoot,
      "scripts",
      "schemas",
      "saltPatternMigrationReceiptV1.schema.json",
    ),
  ),
);
await validatePackageDocs();
await validateVisibility();
await validateMigrations();
const retirementFixtures = await validateRetirementFixtures();
await validateDecisionDocs();
await validateRootScripts();
const evaluation = await validateEvaluation();

console.log(
  `Salt AI contracts validated (${FAMILY_UNIVERSE.length} package families, ${retirementFixtures} retirement fixtures, ${evaluation.outcomeCases} outcome cases).`,
);
