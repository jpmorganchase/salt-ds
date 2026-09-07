import { execFileSync } from "node:child_process";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  assert,
  readJson,
  repositoryRoot,
  sha256,
  stableJson,
} from "../../../scripts/saltAiEvidenceUtils.mjs";

const scriptPath = fileURLToPath(import.meta.url);
const evalRoot = path.resolve(path.dirname(scriptPath), "..");
const MODE_IDS = [
  "mode_1_base_tools",
  "mode_2_markdown",
  "mode_3_cli_bootstrap",
  "mode_4_mcp_candidate",
];
const SEMVER =
  /^(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)(?:-[0-9A-Za-z.-]+)?$/u;
const PORTABLE_PATH = /^(?!\/)(?!.*\\\\)(?!.*(?:^|\/)\.\.(?:\/|$)).+$/u;
const SALT_PACKAGE_NAME = /^@salt-ds\/[a-z0-9][a-z0-9._-]*$/u;
const SHA40 = /^[0-9a-f]{40}$/u;
const FROZEN_BASELINE = Object.freeze({
  index: "plans/evidence/004/index.json",
  unit: "004/01",
  sourceSha: "da1d249225c7044dad1c3aa08c960eb08f84dddb",
  report: "evals/salt-ai/baselines/baseline-pre-platform.json",
  manifest: "evals/salt-ai/manifest.json",
  fixture: "evals/salt-ai/fixtures/repositories.json",
  budget: "evals/salt-ai/protocol/budgets.json",
  identities: Object.freeze({
    manifest_sha256:
      "sha256:5a5911389113f04a2f903d5a6bbdd1d237bef3dbdde410622da25dc45a7a5cd5",
    fixture_sha256:
      "sha256:0c7e590cf66013510f92e305bdf7f0cf44413d027cf70ebd2f4a9a0f8ff2dfbb",
    protocol_sha256:
      "sha256:7e9f052a9c0dcd9846e8e76204f0df8b96f7b2c959650cf26833e477ac26306c",
  }),
});

function repositoryTextBytes(bytes) {
  return Buffer.from(bytes.toString("utf8").replaceAll("\r\n", "\n"));
}

function repositoryTextSha256(bytes) {
  return sha256(repositoryTextBytes(bytes));
}

function gitBytes(arguments_) {
  const environment = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) => !key.toUpperCase().startsWith("GIT_"),
    ),
  );
  return execFileSync("git", arguments_, {
    cwd: repositoryRoot,
    env: environment,
    encoding: null,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function assertContainedGitPath(relative, prefix = "") {
  const segments = typeof relative === "string" ? relative.split("/") : [];
  assert(
    typeof relative === "string" &&
      relative.length > 0 &&
      !relative.startsWith("/") &&
      !relative.includes("\\") &&
      !relative.includes("\0") &&
      !/^[A-Za-z]:/u.test(relative) &&
      segments.every(
        (segment) => segment.length > 0 && segment !== "." && segment !== "..",
      ) &&
      (!prefix || relative.startsWith(prefix)),
    `Evaluation Git path ${String(relative)} is not contained`,
  );
}

function gitBlob(gitCommand, commit, relative) {
  assert(SHA40.test(commit), "Frozen evaluation source is not a commit SHA");
  assertContainedGitPath(relative);
  return gitCommand(["show", `${commit}:${relative}`]);
}

function parseJsonBytes(bytes, label) {
  try {
    return JSON.parse(bytes.toString("utf8"));
  } catch {
    throw new Error(`${label} is not valid JSON`);
  }
}

function normalizePackageVector(entries, label) {
  assert(Array.isArray(entries), `${label} is missing its package vector`);
  const seen = new Set();
  const normalized = entries.map((entry) => {
    assert(
      entry && typeof entry === "object" && !Array.isArray(entry),
      `${label} has a malformed package vector entry`,
    );
    assert(
      JSON.stringify(Object.keys(entry).sort()) ===
        JSON.stringify(["name", "version"]),
      `${label} has a malformed package vector entry`,
    );
    assert(
      typeof entry.name === "string" && SALT_PACKAGE_NAME.test(entry.name),
      `${label} has an invalid package name`,
    );
    assert(
      typeof entry.version === "string" && SEMVER.test(entry.version),
      `${label} has a non-exact package version`,
    );
    assert(!seen.has(entry.name), `${label} repeats package ${entry.name}`);
    seen.add(entry.name);
    return { name: entry.name, version: entry.version };
  });
  return normalized.sort((left, right) => left.name.localeCompare(right.name));
}

function fixturePackageVector(fixture) {
  assert(
    fixture && typeof fixture === "object" && !Array.isArray(fixture),
    "Package-vector validation has no fixture",
  );
  assert(typeof fixture.id === "string", "Package-vector fixture has no ID");
  const packageJson = fixture.files?.["package.json"];
  assert(
    typeof packageJson === "string",
    `${fixture.id} has no materialized package.json`,
  );
  const manifest = parseJsonBytes(
    Buffer.from(packageJson, "utf8"),
    `${fixture.id}/package.json`,
  );
  assert(
    manifest && typeof manifest === "object" && !Array.isArray(manifest),
    `${fixture.id}/package.json is not an object`,
  );
  const declarations = [];
  const declarationSections = new Map();
  for (const sectionName of ["dependencies", "devDependencies"]) {
    const section = manifest[sectionName];
    if (section === undefined) continue;
    assert(
      section && typeof section === "object" && !Array.isArray(section),
      `${fixture.id}/package.json has malformed ${sectionName}`,
    );
    for (const [name, version] of Object.entries(section)) {
      if (!name.startsWith("@salt-ds/")) continue;
      assert(
        SALT_PACKAGE_NAME.test(name) && typeof version === "string",
        `${fixture.id}/package.json has a malformed Salt declaration`,
      );
      const earlier = declarationSections.get(name);
      assert(
        !earlier,
        `${fixture.id}/package.json ${
          earlier && earlier.version === version ? "duplicates" : "conflicts on"
        } ${name} across ${earlier ? earlier.section : "dependency sections"} and ${sectionName}`,
      );
      declarationSections.set(name, { section: sectionName, version });
      declarations.push({ name, version });
    }
  }
  return normalizePackageVector(
    declarations,
    `${fixture.id}/package.json Salt declarations`,
  );
}

export function validateCaseFixturePackageVector(value, fixture) {
  const caseVector = normalizePackageVector(
    value.package_vector,
    `${value.id ?? "case"}`,
  );
  const materializedVector = fixturePackageVector(fixture);
  const vectorsMatch =
    JSON.stringify(caseVector) === JSON.stringify(materializedVector);
  const mismatch = value.expected_fixture_package_vector_mismatch;
  if (vectorsMatch) {
    assert(
      mismatch === undefined,
      `${value.id} declares a fixture package-vector mismatch but its vectors match`,
    );
    return;
  }
  assert(
    mismatch &&
      typeof mismatch === "object" &&
      !Array.isArray(mismatch) &&
      JSON.stringify(Object.keys(mismatch).sort()) ===
        JSON.stringify(["case_vector", "fixture_vector", "reason"]) &&
      typeof mismatch.reason === "string" &&
      mismatch.reason.trim().length > 0,
    `${value.id} package vector does not match fixture ${fixture.id}`,
  );
  const expectedCase = normalizePackageVector(
    mismatch.case_vector,
    `${value.id} expected mismatching case vector`,
  );
  const expectedFixture = normalizePackageVector(
    mismatch.fixture_vector,
    `${value.id} expected mismatching fixture vector`,
  );
  assert(
    JSON.stringify(expectedCase) === JSON.stringify(caseVector) &&
      JSON.stringify(expectedFixture) === JSON.stringify(materializedVector),
    `${value.id} mismatch declaration does not describe its exact vectors`,
  );
}

export async function validateFrozenBaseline({
  gitCommand = gitBytes,
  readFileCommand = readFile,
} = {}) {
  const indexBytes = await readFileCommand(
    path.resolve(repositoryRoot, FROZEN_BASELINE.index),
  );
  const index = parseJsonBytes(indexBytes, FROZEN_BASELINE.index);
  assert(Array.isArray(index.units), "Plan 004 evidence index has no units");
  const matchingUnits = index.units.filter(
    (candidate) => candidate.id === FROZEN_BASELINE.unit,
  );
  assert(
    matchingUnits.length === 1,
    `Plan 004 evidence index must contain exactly one ${FROZEN_BASELINE.unit} unit`,
  );
  const unit = matchingUnits[0];
  assert(
    unit.status === "DONE" && unit.scope?.materialized === true,
    `${FROZEN_BASELINE.unit} is not a materialized completion`,
  );
  assert(
    unit.completion_sha === FROZEN_BASELINE.sourceSha,
    `${FROZEN_BASELINE.unit} has the wrong completion SHA`,
  );
  assert(
    Array.isArray(unit.scope.exact_paths),
    `${FROZEN_BASELINE.unit} has no exact-path scope`,
  );
  const scopePaths = unit.scope.exact_paths;
  assert(
    new Set(scopePaths).size === scopePaths.length,
    `${FROZEN_BASELINE.unit} repeats an exact-path scope entry`,
  );
  for (const relative of scopePaths) assertContainedGitPath(relative);
  for (const required of [
    FROZEN_BASELINE.report,
    FROZEN_BASELINE.manifest,
    FROZEN_BASELINE.fixture,
    FROZEN_BASELINE.budget,
  ]) {
    assert(
      scopePaths.filter((relative) => relative === required).length === 1,
      `${FROZEN_BASELINE.unit} scope does not contain ${required} exactly once`,
    );
  }

  const resolvedSource = gitCommand([
    "rev-parse",
    "--verify",
    `${FROZEN_BASELINE.sourceSha}^{commit}`,
  ])
    .toString("utf8")
    .trim();
  assert(
    resolvedSource === FROZEN_BASELINE.sourceSha,
    `${FROZEN_BASELINE.unit} completion is not the recorded Git commit`,
  );
  gitCommand([
    "merge-base",
    "--is-ancestor",
    FROZEN_BASELINE.sourceSha,
    "HEAD",
  ]);

  const sourceReportBytes = gitBlob(
    gitCommand,
    FROZEN_BASELINE.sourceSha,
    FROZEN_BASELINE.report,
  );
  const liveReportBytes = await readFileCommand(
    path.resolve(repositoryRoot, FROZEN_BASELINE.report),
  );
  assert(
    repositoryTextBytes(liveReportBytes).equals(
      repositoryTextBytes(sourceReportBytes),
    ),
    "Frozen evaluation baseline differs from its recorded Git source",
  );

  const sourceManifestBytes = gitBlob(
    gitCommand,
    FROZEN_BASELINE.sourceSha,
    FROZEN_BASELINE.manifest,
  );
  const sourceFixtureBytes = gitBlob(
    gitCommand,
    FROZEN_BASELINE.sourceSha,
    FROZEN_BASELINE.fixture,
  );
  const report = parseJsonBytes(
    sourceReportBytes,
    `frozen ${FROZEN_BASELINE.report}`,
  );
  const manifest = parseJsonBytes(
    sourceManifestBytes,
    `frozen ${FROZEN_BASELINE.manifest}`,
  );
  assert(
    manifest.fixture_file === FROZEN_BASELINE.fixture,
    "Frozen evaluation manifest points to the wrong fixture",
  );
  assert(
    manifest.counts?.outcome_cases === 13,
    "Frozen evaluation manifest does not contain 13 outcome cases",
  );
  assert(
    manifest.fixture_sha256 === repositoryTextSha256(sourceFixtureBytes),
    "Frozen evaluation manifest fixture digest is invalid",
  );
  assert(
    Array.isArray(manifest.protocol_files),
    "Frozen evaluation manifest has no protocol files",
  );
  const protocolPaths = manifest.protocol_files;
  assert(
    new Set(protocolPaths).size === protocolPaths.length,
    "Frozen evaluation manifest repeats a protocol file",
  );
  const protocolIdentities = protocolPaths.map((relative) => {
    assertContainedGitPath(relative, "evals/salt-ai/protocol/");
    return {
      file: relative,
      sha256: repositoryTextSha256(
        gitBlob(gitCommand, FROZEN_BASELINE.sourceSha, relative),
      ),
    };
  });
  assert(
    protocolPaths.includes(FROZEN_BASELINE.budget),
    "Frozen evaluation manifest omits its recorded budget",
  );
  const computedIdentities = {
    fixture_sha256: repositoryTextSha256(sourceFixtureBytes),
    manifest_sha256: repositoryTextSha256(sourceManifestBytes),
    protocol_sha256: sha256(
      Buffer.from(stableJson(protocolIdentities), "utf8"),
    ),
  };
  assert(
    stableJson(computedIdentities) === stableJson(FROZEN_BASELINE.identities),
    "Frozen evaluation inputs do not match their recorded identities",
  );
  assert(
    stableJson(report.identities) === stableJson(computedIdentities),
    "Frozen evaluation report identities do not match its inputs",
  );
  assert(
    stableJson(report.corpus) === stableJson(manifest.counts),
    "Frozen evaluation report corpus does not match its manifest",
  );
  return { manifest, report };
}

function validatorFor(schema) {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  return { ajv, validate: ajv.compile(schema) };
}

async function assertFile(relative) {
  assert(
    PORTABLE_PATH.test(relative),
    `Non-portable evaluation path ${relative}`,
  );
  const absolute = path.resolve(repositoryRoot, relative);
  const rel = path.relative(repositoryRoot, absolute);
  assert(
    rel !== ".." && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel),
    `${relative} escapes the repository`,
  );
  assert((await stat(absolute)).isFile(), `${relative} is not a file`);
  return absolute;
}

function validateCase(value, expectedSuite, fixtures, modeIds, seenIds) {
  for (const field of [
    "schema_version",
    "id",
    "suite",
    "family",
    "fixture_id",
    "goal",
    "checks",
    "non_goals",
  ]) {
    assert(
      value[field] !== undefined,
      `${value.id ?? "case"} is missing ${field}`,
    );
  }
  assert(
    value.schema_version === "1.0.0",
    `${value.id} has an unsupported schema version`,
  );
  assert(value.suite === expectedSuite, `${value.id} is in the wrong suite`);
  assert(
    /^[a-z0-9][a-z0-9-]*$/u.test(value.id),
    `${value.id} has an invalid ID`,
  );
  assert(!seenIds.has(value.id), `Duplicate evaluation case ID ${value.id}`);
  seenIds.add(value.id);
  assert(
    fixtures.has(value.fixture_id),
    `${value.id} references unknown fixture ${value.fixture_id}`,
  );
  assert(
    Array.isArray(value.checks) && value.checks.length > 0,
    `${value.id} has no deterministic checks`,
  );
  assert(
    Array.isArray(value.non_goals) && value.non_goals.length > 0,
    `${value.id} has no non-goals`,
  );
  const checkIds = value.checks.map((check) => check.id);
  assert(
    new Set(checkIds).size === checkIds.length,
    `${value.id} repeats a check ID`,
  );
  if (expectedSuite === "activation") {
    assert(!Object.hasOwn(value, "modes"), `${value.id} reuses outcome modes`);
    assert(
      Array.isArray(value.profiles) && value.profiles.length === 3,
      `${value.id} must cover all activation profiles`,
    );
  } else {
    assert(
      Array.isArray(value.modes) && value.modes.length > 0,
      `${value.id} has no modes`,
    );
    for (const mode of value.modes)
      assert(modeIds.has(mode), `${value.id} uses unknown mode ${mode}`);
    assert(
      typeof value.mcp_eligible === "boolean",
      `${value.id} lacks MCP eligibility`,
    );
    assert(
      Array.isArray(value.allowed_variants) &&
        value.allowed_variants.length > 0,
      `${value.id} has no allowed variants`,
    );
    validateCaseFixturePackageVector(value, fixtures.get(value.fixture_id));
  }
}

export async function validateEvaluation({ requireBaseline = false } = {}) {
  const manifestPath = path.join(evalRoot, "manifest.json");
  const manifestBytes = await readFile(manifestPath);
  const manifest = JSON.parse(manifestBytes.toString("utf8"));
  const manifestSchema = await readJson(
    path.join(evalRoot, "manifest.schema.json"),
  );
  const { ajv: manifestAjv, validate: validateManifest } =
    validatorFor(manifestSchema);
  assert(
    validateManifest(manifest),
    `Evaluation manifest schema failure: ${manifestAjv.errorsText(validateManifest.errors, { separator: "; " })}`,
  );

  const fixturePath = await assertFile(manifest.fixture_file);
  const fixtureBytes = await readFile(fixturePath);
  assert(
    repositoryTextSha256(fixtureBytes) === manifest.fixture_sha256,
    "Evaluation fixture digest mismatch",
  );
  const fixtureSet = JSON.parse(fixtureBytes.toString("utf8"));
  assert(
    fixtureSet.schema_version === "1.0.0",
    "Unsupported fixture schema version",
  );
  assert(Array.isArray(fixtureSet.fixtures), "Fixture set has no fixtures");
  const fixtures = new Map();
  for (const fixture of fixtureSet.fixtures) {
    assert(
      /^[a-z0-9][a-z0-9-]*$/u.test(fixture.id),
      `Invalid fixture ID ${fixture.id}`,
    );
    assert(!fixtures.has(fixture.id), `Duplicate fixture ID ${fixture.id}`);
    assert(
      fixture.files && typeof fixture.files === "object",
      `${fixture.id} has no files`,
    );
    for (const [file, contents] of Object.entries(fixture.files)) {
      assert(
        PORTABLE_PATH.test(file),
        `${fixture.id} has an unsafe path ${file}`,
      );
      assert(typeof contents === "string", `${fixture.id}/${file} is not text`);
      assert(
        !/BEGIN (?:RSA|OPENSSH|EC) PRIVATE KEY|\b(?:api[_-]?key|token|password)\s*[:=]/iu.test(
          contents,
        ),
        `${fixture.id}/${file} resembles a secret`,
      );
    }
    fixtures.set(fixture.id, fixture);
  }

  const modes = await readJson(path.join(evalRoot, "protocol", "modes.json"));
  assert(
    JSON.stringify(modes.modes.map((mode) => mode.id)) ===
      JSON.stringify(MODE_IDS),
    "Evaluation modes are not the frozen ordered set",
  );
  const modeIds = new Set(MODE_IDS);
  const seenIds = new Set();
  let goldQueries = 0;
  let mcpEligibleCases = 0;
  const goldIds = new Set();
  const outcomeFixtureIds = new Set();
  for (const relative of manifest.case_files) {
    const casePath = await assertFile(relative);
    const value = JSON.parse(await readFile(casePath, "utf8"));
    const expectedSuite = relative.includes("/retrieval/")
      ? "retrieval"
      : relative.includes("/scan/")
        ? "scan"
        : "task";
    validateCase(value, expectedSuite, fixtures, modeIds, seenIds);
    outcomeFixtureIds.add(value.fixture_id);
    if (value.mcp_eligible) mcpEligibleCases += 1;
    for (const query of value.gold_queries ?? []) {
      assert(
        /^[a-z0-9][a-z0-9-]*$/u.test(query.id),
        `${value.id} has an invalid gold query ID`,
      );
      assert(!goldIds.has(query.id), `Duplicate gold query ID ${query.id}`);
      goldIds.add(query.id);
      assert(
        typeof query.query === "string" && query.query.trim(),
        `${query.id} has no query`,
      );
      assert(
        Array.isArray(query.gold) && query.gold.length > 0,
        `${query.id} has no gold record`,
      );
      goldQueries += 1;
    }
  }

  for (const relative of manifest.activation_case_files) {
    const value = await readJson(await assertFile(relative));
    validateCase(value, "activation", fixtures, modeIds, seenIds);
    assert(
      !outcomeFixtureIds.has(value.fixture_id),
      `${value.id} reuses an outcome fixture`,
    );
  }
  assert(
    seenIds.size ===
      manifest.counts.outcome_cases + manifest.counts.activation_cases,
    "Evaluation case count mismatch",
  );
  assert(
    manifest.counts.outcome_cases === 13,
    "Current evaluation metadata must contain 13 outcome cases",
  );
  assert(
    goldQueries === manifest.counts.retrieval_gold_queries,
    "Retrieval gold-query count mismatch",
  );

  const protocolValues = [];
  const protocolIdentities = [];
  for (const relative of manifest.protocol_files) {
    const file = await assertFile(relative);
    const bytes = await readFile(file);
    protocolIdentities.push({
      file: relative,
      sha256: repositoryTextSha256(bytes),
    });
    if (file.endsWith(".json"))
      protocolValues.push(JSON.parse(bytes.toString("utf8")));
  }
  const currentProtocolDigest = sha256(
    Buffer.from(stableJson(protocolIdentities), "utf8"),
  );
  const budgets = protocolValues.find(
    (value) => value.maximum_monthly_cost_usd,
  );
  const requiredModeCells = manifest.counts.outcome_cases * 3 * 2 * 3;
  assert(
    budgets?.tiers?.full_required_modes?.scheduled_cells === requiredModeCells,
    "Required full-cohort cell budget is inconsistent",
  );
  assert(
    budgets?.tiers?.full_with_mcp?.scheduled_cells ===
      requiredModeCells + mcpEligibleCases * 2 * 3,
    "MCP full-cohort cell budget is inconsistent",
  );
  const attempts = protocolValues.find((value) => value.cohort_seed);
  assert(
    attempts?.repetitions === 3 && attempts?.host_model_aliases?.length === 2,
    "Attempt policy must use three repetitions and two hosts",
  );
  assert(
    attempts?.maximum_retries === 1,
    "Attempt policy allows more than one retry",
  );
  const metrics = protocolValues.find((value) => Array.isArray(value.metrics));
  assert(metrics, "Metric definitions are missing");
  const metricIds = metrics.metrics.map((metric) => metric.id);
  assert(
    new Set(metricIds).size === metricIds.length,
    "Metric definitions repeat an ID",
  );
  for (const required of [
    "version_correctness",
    "unsupported_claim_rate",
    "mode_3_task_success_uplift",
    "bundle_integrity",
    "required_cells_complete",
  ]) {
    const metric = metrics.metrics.find(
      (candidate) => candidate.id === required,
    );
    assert(
      metric && metric.waivable === false,
      `${required} must be non-waivable`,
    );
  }

  const waiverSchema = await readJson(
    path.join(evalRoot, "waiver.schema.json"),
  );
  const { ajv: waiverAjv, validate: validateWaiver } =
    validatorFor(waiverSchema);
  const waiverDirectory = path.join(evalRoot, "waivers");
  for (const name of (await readdir(waiverDirectory))
    .filter((file) => file.endsWith(".json"))
    .sort()) {
    const waiver = await readJson(path.join(waiverDirectory, name));
    assert(
      validateWaiver(waiver),
      `${name} waiver schema failure: ${waiverAjv.errorsText(validateWaiver.errors)}`,
    );
    const metric = metrics.metrics.find(
      (candidate) => candidate.id === waiver.metric_id,
    );
    assert(
      metric?.waivable === true,
      `${name} waives an absent or non-waivable metric`,
    );
    assert(new Date(waiver.expires_on) > new Date(), `${name} is expired`);
  }

  const reportSchema = await readJson(
    path.join(evalRoot, "report.schema.json"),
  );
  const { ajv: reportAjv, validate: validateReport } =
    validatorFor(reportSchema);
  const baselineDirectory = path.join(evalRoot, "baselines");
  const baselines = (await readdir(baselineDirectory))
    .filter((file) => file.endsWith(".json"))
    .sort();
  if (requireBaseline)
    assert(baselines.length > 0, "No evaluation baseline exists");
  const frozenBaselineName = path.basename(FROZEN_BASELINE.report);
  assert(
    baselines.includes(frozenBaselineName),
    `Missing frozen evaluation baseline ${frozenBaselineName}`,
  );
  await validateFrozenBaseline();
  for (const name of baselines) {
    const report = await readJson(path.join(baselineDirectory, name));
    assert(
      validateReport(report),
      `${name} report schema failure: ${reportAjv.errorsText(validateReport.errors, { separator: "; " })}`,
    );
    assert(
      report.modes.length === 4 &&
        new Set(report.modes.map((mode) => mode.mode_id)).size === 4,
      `${name} does not contain four distinct modes`,
    );
    if (name !== frozenBaselineName) {
      assert(
        report.identities.manifest_sha256 ===
          repositoryTextSha256(manifestBytes),
        `${name} evaluation manifest identity is stale`,
      );
      assert(
        report.identities.protocol_sha256 === currentProtocolDigest,
        `${name} evaluation protocol identity is stale`,
      );
      assert(
        report.identities.fixture_sha256 === manifest.fixture_sha256,
        `${name} evaluation fixture identity is stale`,
      );
    }
    for (const mode of report.modes) {
      if (["not_available", "not_selected"].includes(mode.status)) {
        assert(
          mode.scored === false && mode.metrics === null,
          `${name}/${mode.mode_id} fabricates unavailable metrics`,
        );
      }
    }
  }

  return {
    activationCases: manifest.counts.activation_cases,
    baselines: baselines.length,
    fixtureDigest: manifest.fixture_sha256,
    goldQueries,
    manifest,
    outcomeCases: manifest.counts.outcome_cases,
  };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(scriptPath)
) {
  const result = await validateEvaluation({
    requireBaseline: process.argv.includes("--require-baseline"),
  });
  console.log(
    `Salt AI evaluation metadata validated (${result.outcomeCases} outcome cases, ${result.activationCases} activation cases, ${result.goldQueries} gold queries, ${result.baselines} baselines).`,
  );
}
