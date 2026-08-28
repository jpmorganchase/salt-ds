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
      names.includes("@salt-ds/mcp"),
    "AI package lifecycle entries are incomplete",
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
    await exists(entry.readme_path);
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
        entry.metadata_fields[field] === actual,
        `${entry.name} metadata state drifted for ${field}`,
      );
    }
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
  for (const entry of inventory.unclassified) {
    const batch = batches.get(entry.closure_batch);
    assert(
      batch?.paths.includes(entry.path),
      `${entry.path} is not in its closure batch`,
    );
    await stat(withinRepository(entry.path));
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
    "candidate:salt-ai:seal":
      "node ./scripts/sealSaltAiCandidateReceipt.mjs",
    "validate:salt-ai:contracts": "node ./scripts/validateSaltAiContracts.mjs",
    "retire:salt-ai:premerge-evidence":
      "node ./scripts/retireSaltAiPremergeEvidence.mjs",
    "eval:salt-ai:validate": "node ./evals/salt-ai/scripts/validate.mjs",
    "eval:salt-ai:baseline": "node ./evals/salt-ai/scripts/runBaseline.mjs",
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
