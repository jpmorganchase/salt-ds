import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  assert,
  digestPattern,
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

function repositoryTextSha256(bytes) {
  return sha256(Buffer.from(bytes.toString("utf8").replaceAll("\r\n", "\n")));
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
    assert(
      Array.isArray(value.package_vector),
      `${value.id} has no package vector`,
    );
    for (const entry of value.package_vector) {
      assert(
        /^@salt-ds\/[a-z0-9][a-z0-9._-]*$/u.test(entry.name),
        `${value.id} has an invalid package name`,
      );
      assert(
        SEMVER.test(entry.version),
        `${value.id} has a non-exact package version`,
      );
    }
  }
}

export async function validateEvaluation({
  requireBaseline = false,
  allowStaleBaselines = false,
} = {}) {
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
  for (const relative of manifest.case_files) {
    const casePath = await assertFile(relative);
    const value = JSON.parse(await readFile(casePath, "utf8"));
    const expectedSuite = relative.includes("/retrieval/")
      ? "retrieval"
      : relative.includes("/scan/")
        ? "scan"
        : "task";
    validateCase(value, expectedSuite, fixtures, modeIds, seenIds);
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

  const outcomeFixtureIds = new Set(
    await Promise.all(
      manifest.case_files.map(
        async (relative) =>
          (await readJson(path.resolve(repositoryRoot, relative))).fixture_id,
      ),
    ),
  );
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
  assert(
    budgets?.tiers?.full_required_modes?.scheduled_cells === 14 * 3 * 2 * 3,
    "Required full-cohort cell budget is inconsistent",
  );
  assert(
    budgets?.tiers?.full_with_mcp?.scheduled_cells ===
      14 * 3 * 2 * 3 + mcpEligibleCases * 2 * 3,
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
    if (!allowStaleBaselines) {
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
    `Salt AI eval corpus validated (${result.outcomeCases} outcome cases, ${result.activationCases} activation cases, ${result.goldQueries} gold queries, ${result.baselines} baselines).`,
  );
}
