import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  access,
  cp,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const REPO_ROOT = path.resolve(import.meta.dirname, "../../..");
const KNOWLEDGE_ENTRY = path.join(
  REPO_ROOT,
  "dist/salt-ds-knowledge/dist-es/public.js",
);
const KNOWLEDGE_CJS_ENTRY = path.join(
  REPO_ROOT,
  "dist/salt-ds-knowledge/dist-cjs/public.js",
);
const KNOWLEDGE_BUNDLE = path.join(REPO_ROOT, "dist/salt-ds-knowledge");
const CLI_BIN = path.join(REPO_ROOT, "dist/salt-ds-cli/bin/salt-ds.js");
const CLI_PACKAGE = path.join(REPO_ROOT, "dist/salt-ds-cli");
const DOCTOR_SCHEMA = path.join(
  REPO_ROOT,
  "dist/salt-ds-cli/schemas/doctor-result-1.schema.json",
);
const DOCTOR_WORKER = path.join(
  REPO_ROOT,
  "dist/salt-ds-cli/dist-cjs/scannerWorker.js",
);
const DOCTOR_FIXTURES = path.join(
  REPO_ROOT,
  "evals/salt-ai/doctor/fixtures.json",
);
const EXPECTED_RULE_IDS = [
  "salt.component.action_navigation_target",
  "salt.catalog.non_stable_import",
  "salt.deprecation.used_import",
  "salt.deprecation.static_prop",
  "salt.token.deprecated_identity",
];

export class RulesHarnessError extends Error {}
export class RulesIntegrityError extends Error {}
export class DoctorHarnessError extends Error {}
export class DoctorIntegrityError extends Error {}

function failHarness(message) {
  throw new RulesHarnessError(message);
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function currentPackageVersions(store, names) {
  return Object.fromEntries(
    names.map((name) => {
      const record = store
        .getFamily("package")
        .find((candidate) => candidate.name === name);
      if (!record) failHarness(`missing characterized package ${name}`);
      return [name, record.version];
    }),
  );
}

function analyzeArtifact(api, context, characterization, artifact, versions) {
  const result = api.analyzeSaltCode(context, {
    artifacts: [artifact],
    package_versions: {
      ...currentPackageVersions(context.store, characterization.package_names),
      ...versions,
    },
  }).results[0];
  if (!result) failHarness(`missing analysis for ${artifact.id}`);
  return result;
}

function targetUtf8Range(artifact) {
  const characterOffset = artifact.text.indexOf(artifact.target);
  if (characterOffset < 0) {
    failHarness(`missing target in ${artifact.id}`);
  }
  const startOffset = Buffer.byteLength(
    artifact.text.slice(0, characterOffset),
    "utf8",
  );
  return {
    start_offset: startOffset,
    end_offset: startOffset + Buffer.byteLength(artifact.target, "utf8"),
  };
}

function rendererIsSafe(api) {
  const hostile =
    "# injected heading\n```markdown\nCitation: [fake](https://invalid.example)\n\u0000\u007f";
  const rendered = api.renderKnowledgeDocumentMarkdown({
    contract: "salt-knowledge-document/1",
    status: "resolved",
    identifier: hostile,
    bundle: {
      version: hostile,
      digest: hostile,
      semantic_digest: hostile,
    },
    choices: [],
    excluded_package_families: [],
    document: {
      reference: { family: "component", id: hostile },
      title: hostile,
      summary: hostile,
      record: { hostile },
      content: {
        reference: { family: "content", id: hostile, codec: hostile },
        value: { hostile },
      },
      citation: {
        record_key: hostile,
        source_records: [hostile],
        bundle_digest: hostile,
      },
    },
  });
  return (
    rendered.startsWith("# `# injected heading\\n") &&
    !rendered.includes("```markdown") &&
    !rendered.includes("\u0000") &&
    !rendered.includes("\u007f") &&
    rendered.includes("\\u0000") &&
    rendered.includes("\\u007f")
  );
}

export function deriveRulesDecision(observation) {
  if (!observation || typeof observation !== "object") {
    failHarness("observation must be an object");
  }
  if (!Array.isArray(observation.harness_failures)) {
    failHarness("harness_failures must be an array");
  }
  if (observation.harness_failures.length > 0) {
    failHarness(observation.harness_failures.join("; "));
  }
  if (observation.renderer_safe !== true) {
    failHarness("untrusted Markdown renderer safety check failed");
  }
  if (observation.rule_ids_equal !== true) {
    throw new RulesIntegrityError("review rule IDs are not a closed exact set");
  }
  if (
    !Number.isSafeInteger(observation.trustworthy_product_miss_count) ||
    observation.trustworthy_product_miss_count < 0
  ) {
    failHarness("trustworthy_product_miss_count is invalid");
  }
  if (observation.trustworthy_product_miss_count > 0) return "CUT_DOCTOR";
  if (
    observation.enabled_rule_count !== EXPECTED_RULE_IDS.length ||
    !Array.isArray(observation.actionable_repair_families)
  ) {
    return "CUT_DOCTOR";
  }
  return new Set(observation.actionable_repair_families).size >= 2
    ? "PASS_RULES"
    : "CUT_DOCTOR";
}

export async function collectRulesObservation() {
  const api = await import(pathToFileURL(KNOWLEDGE_ENTRY).href);
  let context;
  try {
    context = await api.loadKnowledgeRuntimeContext({
      bundleDir: KNOWLEDGE_BUNDLE,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new RulesIntegrityError(
      `Knowledge integrity check failed: ${message}`,
    );
  }
  const { store } = context;
  const descriptors = api.REVIEW_RULE_DESCRIPTORS.map((rule) => rule.rule_id);
  const characterizations = api.REVIEW_RULE_CHARACTERIZATION;
  const characterizationIds = characterizations.map((rule) => rule.rule_id);
  const ruleIdsEqual =
    sameJson(api.REVIEW_RULE_IDS, EXPECTED_RULE_IDS) &&
    sameJson(descriptors, EXPECTED_RULE_IDS) &&
    sameJson(characterizationIds, EXPECTED_RULE_IDS);
  const harnessFailures = [];
  const productMisses = [];
  const actionableRepairFamilies = [];

  for (const characterization of characterizations) {
    if (characterization.disposition !== "enabled") continue;
    const first = analyzeArtifact(
      api,
      context,
      characterization,
      characterization.positive,
    );
    const second = analyzeArtifact(
      api,
      context,
      characterization,
      characterization.positive,
    );
    if (api.canonicalJson(first) !== api.canonicalJson(second)) {
      harnessFailures.push(
        `${characterization.rule_id}: nondeterministic output`,
      );
    }
    if (first.coverage.parser !== characterization.expected_parser) {
      harnessFailures.push(
        `${characterization.rule_id}: unexpected parser coverage`,
      );
    }
    if (!sameJson(first.coverage.evaluated_rule_ids, EXPECTED_RULE_IDS)) {
      harnessFailures.push(
        `${characterization.rule_id}: incomplete rule coverage`,
      );
    }
    if (first.limitations.length > 0 || first.coverage.truncated) {
      harnessFailures.push(
        `${characterization.rule_id}: incomplete positive evaluation`,
      );
    }
    const findings = first.findings.filter(
      (finding) => finding.rule_id === characterization.rule_id,
    );
    if (findings.length === 0) {
      productMisses.push(characterization.rule_id);
      continue;
    }
    if (findings.length !== 1) {
      harnessFailures.push(`${characterization.rule_id}: duplicate findings`);
      continue;
    }
    const finding = findings[0];
    const expectedLocation = targetUtf8Range(characterization.positive);
    if (
      finding.severity !== characterization.expected_severity ||
      finding.location.start_offset !== expectedLocation.start_offset ||
      finding.location.end_offset !== expectedLocation.end_offset ||
      finding.evidence.validation !== "source_bound" ||
      finding.evidence.references.length === 0 ||
      finding.remediation === null ||
      finding.official_decision?.disposition !== "evaluated" ||
      finding.official_decision?.outcome !== "finding"
    ) {
      harnessFailures.push(
        `${characterization.rule_id}: invalid positive finding`,
      );
    }

    const correct = analyzeArtifact(
      api,
      context,
      characterization,
      characterization.correct,
    );
    if (
      correct.findings.some(
        (candidate) => candidate.rule_id === characterization.rule_id,
      )
    ) {
      harnessFailures.push(`${characterization.rule_id}: correct case flagged`);
    }

    const unsupported = analyzeArtifact(
      api,
      context,
      characterization,
      characterization.unsupported,
      characterization.unsupported.package_versions,
    );
    if (
      unsupported.findings.some(
        (candidate) => candidate.rule_id === characterization.rule_id,
      )
    ) {
      harnessFailures.push(
        `${characterization.rule_id}: unsupported case flagged`,
      );
    }
    if (
      characterization.unsupported.expectation === "skipped_unknown" &&
      !unsupported.version_decisions.some(
        (decision) =>
          decision.rule_id === characterization.rule_id &&
          decision.disposition === "skipped_unknown" &&
          decision.evidence.validation === "source_bound",
      )
    ) {
      harnessFailures.push(
        `${characterization.rule_id}: missing skipped-unknown decision`,
      );
    }

    if (characterization.repair_family && characterization.golden_repair) {
      const repair = analyzeArtifact(
        api,
        context,
        characterization,
        characterization.golden_repair,
      );
      if (
        repair.findings.length > 0 ||
        repair.limitations.length > 0 ||
        !sameJson(repair.coverage.evaluated_rule_ids, EXPECTED_RULE_IDS)
      ) {
        harnessFailures.push(
          `${characterization.rule_id}: golden repair is not clean`,
        );
      } else {
        actionableRepairFamilies.push(characterization.repair_family);
      }
    }
  }

  return {
    renderer_safe: rendererIsSafe(api),
    rule_ids_equal: ruleIdsEqual,
    enabled_rule_count: characterizations.filter(
      (entry) => entry.disposition === "enabled",
    ).length,
    trustworthy_product_miss_count: productMisses.length,
    actionable_repair_families: actionableRepairFamilies,
    harness_failures: harnessFailures,
  };
}

const FIXTURE_MANIFEST = JSON.parse(readFileSync(DOCTOR_FIXTURES, "utf8"));
const EXPECTED_FIXTURE_IDS = [
  "repair-family-a-workspace",
  "repair-family-b",
  "clean-exact-current-hostile-text",
  "non-salt-control",
  "exact-version-mismatch",
  "incomplete-analysis",
];

function requireFixtureManifest() {
  if (
    FIXTURE_MANIFEST.contract !== "salt-ai-doctor-fixtures/1" ||
    !Array.isArray(FIXTURE_MANIFEST.fixtures) ||
    !sameJson(
      FIXTURE_MANIFEST.fixtures.map((fixture) => fixture.id),
      EXPECTED_FIXTURE_IDS,
    )
  ) {
    throw new DoctorIntegrityError(
      "Doctor fixture manifest is not the exact six-fixture contract.",
    );
  }
  return FIXTURE_MANIFEST;
}

function portableTarget(root, relativePath) {
  if (
    typeof relativePath !== "string" ||
    relativePath.length === 0 ||
    relativePath.includes("\\") ||
    relativePath.includes("\0") ||
    path.isAbsolute(relativePath) ||
    relativePath.split("/").includes("..")
  ) {
    throw new DoctorHarnessError("Fixture path is not portable and relative.");
  }
  const target = path.resolve(root, ...relativePath.split("/"));
  const relative = path.relative(root, target);
  if (
    relative === ".." ||
    relative.startsWith(".." + path.sep) ||
    path.isAbsolute(relative)
  ) {
    throw new DoctorHarnessError("Fixture path escapes its repository.");
  }
  return target;
}

async function writeFixtureFile(root, relativePath, contents) {
  const target = portableTarget(root, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, contents, "utf8");
}

async function writeFixtureJson(root, relativePath, value) {
  await writeFixtureFile(root, relativePath, JSON.stringify(value) + "\n");
}

function packageVersion(candidateManifest, packageName, mismatch) {
  const record = candidateManifest.compatibility?.packages?.find(
    (entry) => entry.name === packageName,
  );
  if (!record || typeof record.tested_version !== "string") {
    throw new DoctorIntegrityError(
      "Candidate Knowledge has no exact version for " + packageName + ".",
    );
  }
  return mismatch && packageName === "@salt-ds/core"
    ? "0.0.0-doctor-mismatch"
    : record.tested_version;
}

async function materializeFixture(root, fixture, candidateManifest) {
  const dependencies = Object.fromEntries(
    fixture.packages.map((packageName) => [
      packageName,
      packageVersion(
        candidateManifest,
        packageName,
        fixture.version_mismatch === true,
      ),
    ]),
  );
  const packageRoot =
    fixture.topology === "workspace"
      ? path.join(root, "packages", "app")
      : root;
  if (fixture.topology === "workspace") {
    await writeFixtureJson(root, "package.json", {
      name: "doctor-workspace",
      private: true,
      packageManager: "npm@11.0.0",
      workspaces: ["packages/*"],
    });
    await writeFixtureJson(root, "package-lock.json", {
      name: "doctor-workspace",
      lockfileVersion: 3,
      packages: {},
    });
    await writeFixtureJson(root, "packages/app/package.json", {
      name: "doctor-app",
      private: true,
      dependencies,
    });
  } else {
    await writeFixtureJson(root, "package.json", {
      name: "doctor-" + fixture.id,
      private: true,
      packageManager: "npm@11.0.0",
      dependencies,
    });
  }
  for (const [packageName, version] of Object.entries(dependencies)) {
    const packagePath = path.relative(root, packageRoot).replaceAll("\\", "/");
    const prefix = packagePath === "" ? "" : packagePath + "/";
    await writeFixtureJson(
      root,
      prefix + "node_modules/" + packageName + "/package.json",
      { name: packageName, version },
    );
  }
  await writeFixtureFile(root, fixture.source_path, fixture.source);
  for (const [relativePath, contents] of Object.entries(
    fixture.extra_files ?? {},
  )) {
    await writeFixtureFile(root, relativePath, contents);
  }
  if (fixture.config) {
    await writeFixtureJson(root, "salt.config.json", fixture.config);
  }
  await writeFixtureJson(root, "node_modules/@salt-ds/knowledge/package.json", {
    name: "@salt-ds/knowledge",
    version: candidateManifest.bundle_version,
    main: "index.cjs",
  });
  await writeFixtureFile(
    root,
    "node_modules/@salt-ds/knowledge/index.cjs",
    "module.exports = require(" + JSON.stringify(KNOWLEDGE_CJS_ENTRY) + ");\n",
  );
  await cp(CLI_PACKAGE, path.join(root, "node_modules", "@salt-ds", "cli"), {
    recursive: true,
  });
}

async function snapshotFiles(root, directory = root, snapshot = new Map()) {
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      throw new DoctorHarnessError("Fixture unexpectedly contains a symlink.");
    }
    if (entry.isDirectory()) {
      await snapshotFiles(root, absolutePath, snapshot);
      continue;
    }
    if (!entry.isFile()) {
      throw new DoctorHarnessError(
        "Fixture unexpectedly contains a non-regular file.",
      );
    }
    const bytes = await readFile(absolutePath);
    const relativePath = path
      .relative(root, absolutePath)
      .replaceAll("\\", "/");
    snapshot.set(
      relativePath,
      "sha256:" + createHash("sha256").update(bytes).digest("hex"),
    );
  }
  return snapshot;
}

function snapshotsEqual(left, right) {
  return sameJson([...left.entries()], [...right.entries()]);
}

function executeDoctor(root, validate) {
  const fixtureCli = path.join(
    root,
    "node_modules",
    "@salt-ds",
    "cli",
    "bin",
    "salt-ds.js",
  );
  const child = spawnSync(
    process.execPath,
    [fixtureCli, "doctor", ".", "--format", "json", "--fail-on", "warning"],
    {
      cwd: root,
      encoding: "utf8",
      env: {
        ...process.env,
        NODE_PATH: path.join(root, "node_modules"),
      },
      maxBuffer: 10 * 1024 * 1024,
      windowsHide: true,
    },
  );
  if (child.error || child.signal || child.status === null) {
    throw new DoctorHarnessError("Doctor child process did not exit normally.");
  }
  if (!child.stdout.endsWith("\n") || child.stdout.trim().includes("\n")) {
    throw new DoctorIntegrityError(
      "Doctor child did not emit one compact JSON line.",
    );
  }
  let result;
  try {
    result = JSON.parse(child.stdout);
  } catch {
    throw new DoctorIntegrityError("Doctor child emitted malformed JSON.");
  }
  if (!validate(result)) {
    throw new DoctorIntegrityError(
      "Doctor child result failed its published schema: " +
        JSON.stringify(validate.errors),
    );
  }
  return {
    command_executed: true,
    invocation_root: ".",
    json_valid: true,
    exit_code: child.status,
    stderr: child.stderr,
    result,
  };
}

function findingIsExact(fixture, finding) {
  const expectedId =
    finding &&
    "sha256:" +
      createHash("sha256")
        .update(
          JSON.stringify({
            workspace_unit_id: finding.workspace_unit_id,
            rule_id: finding.rule_id,
            path: finding.location?.path,
            location: {
              start_offset: finding.location?.start_offset,
              end_offset: finding.location?.end_offset,
              start_line: finding.location?.start_line,
              start_column: finding.location?.start_byte_column,
              end_line: finding.location?.end_line,
              end_column: finding.location?.end_byte_column,
            },
            references: finding.evidence?.references,
          }),
        )
        .digest("hex");
  return (
    finding &&
    finding.rule_id === fixture.expected_rule_id &&
    finding.workspace_unit_id === fixture.expected_workspace_unit_id &&
    finding.location?.path === fixture.source_path &&
    finding.location?.encoding === "utf8_bytes_end_exclusive" &&
    finding.id === expectedId &&
    finding.evidence?.validation === "source_bound" &&
    Array.isArray(finding.evidence?.references) &&
    finding.evidence.references.length > 0 &&
    typeof finding.remediation === "string" &&
    finding.remediation.length > 0 &&
    typeof finding.acceptance_criterion === "string" &&
    finding.acceptance_criterion.length > 0
  );
}

function assessFixtureProduct(fixture, observation) {
  const findings = observation.result.findings;
  if (fixture.expected_rule_id !== null) {
    if (
      findings.length !== 1 ||
      !findingIsExact(fixture, findings[0]) ||
      !observation.result.coverage.evaluated_rule_ids.includes(
        fixture.expected_rule_id,
      )
    ) {
      return "finding_inaccurate";
    }
    if (
      !observation.repair ||
      observation.repair.after_exit_code !== 0 ||
      observation.repair.after_result.status !== "complete" ||
      observation.repair.after_result.findings.length !== 0 ||
      observation.repair.after_result.coverage.evaluated_files < 1
    ) {
      return "repair_failed";
    }
    return "pass";
  }
  return findings.length === 0 ? "pass" : "finding_inaccurate";
}

async function collectFixtureObservation(root, fixture, validate) {
  const before = await snapshotFiles(root);
  const first = executeDoctor(root, validate);
  const after = await snapshotFiles(root);
  const observation = {
    id: fixture.id,
    ...first,
    read_only: snapshotsEqual(before, after),
    worker_backed:
      first.result.coverage.parser_counts.reduce(
        (count, entry) => count + entry.files,
        0,
      ) > 0,
    repair: null,
    product_assessment: "pass",
  };
  if (fixture.repaired_source !== undefined) {
    const sourcePath = portableTarget(root, fixture.source_path);
    const original = await readFile(sourcePath, "utf8");
    await writeFixtureFile(root, fixture.source_path, fixture.repaired_source);
    const repaired = await readFile(sourcePath, "utf8");
    const repairBefore = await snapshotFiles(root);
    const second = executeDoctor(root, validate);
    const repairAfter = await snapshotFiles(root);
    observation.repair = {
      changed: original !== repaired,
      source_matches_manifest: repaired === fixture.repaired_source,
      read_only: snapshotsEqual(repairBefore, repairAfter),
      after_exit_code: second.exit_code,
      after_result: second.result,
    };
  }
  observation.product_assessment = assessFixtureProduct(fixture, observation);
  return observation;
}

function assertFixtureHarness(fixture, observation) {
  if (
    !observation ||
    observation.id !== fixture.id ||
    observation.command_executed !== true ||
    observation.invocation_root !== "." ||
    observation.json_valid !== true ||
    observation.stderr !== "" ||
    observation.read_only !== true
  ) {
    throw new DoctorHarnessError(fixture.id + ": invalid command evidence");
  }
  const result = observation.result;
  if (
    result.contract !== "salt-doctor-result/1" ||
    result.status !== fixture.expected_status ||
    result.reason_code !== fixture.expected_reason_code ||
    observation.exit_code !== fixture.expected_exit_code
  ) {
    throw new DoctorIntegrityError(
      fixture.id + ": public status, reason, contract, or exit mismatch",
    );
  }
  const workspace = result.workspace_units.find(
    (unit) => unit.workspace_unit_id === fixture.expected_workspace_unit_id,
  );
  if (!workspace) {
    throw new DoctorIntegrityError(
      fixture.id + ": expected workspace unit is absent",
    );
  }
  if (
    fixture.topology === "workspace" &&
    (!result.workspace_units.some(
      (unit) =>
        unit.workspace_unit_id === "." &&
        unit.project_decision.status === "not_salt",
    ) ||
      workspace.project_decision.status !== "selected")
  ) {
    throw new DoctorIntegrityError(
      fixture.id + ": non-Salt root overrode its selected child",
    );
  }
  const shouldAnalyze =
    fixture.expected_status === "complete" ||
    fixture.expected_status === "incomplete";
  if (
    shouldAnalyze &&
    (result.coverage.selected_files < 1 ||
      observation.worker_backed !== true ||
      result.coverage.parser_counts.length < 1 ||
      (fixture.expected_status === "complete" &&
        (result.coverage.evaluated_files < 1 ||
          result.coverage.evaluated_rule_ids.length < 1)))
  ) {
    throw new DoctorHarnessError(
      fixture.id + ": worker-backed coverage is absent",
    );
  }
  if (
    !shouldAnalyze &&
    (result.coverage.selected_files !== 0 ||
      result.coverage.evaluated_files !== 0 ||
      result.coverage.evaluated_rule_ids.length !== 0 ||
      result.coverage.parser_counts.length !== 0)
  ) {
    throw new DoctorIntegrityError(
      fixture.id + ": unsupported or non-Salt input reached analysis",
    );
  }
  if (
    fixture.expected_status === "incomplete" &&
    (!result.coverage.operational_reasons.includes(
      fixture.expected_reason_code,
    ) ||
      result.findings.length !== 0)
  ) {
    throw new DoctorIntegrityError(
      fixture.id + ": incomplete analysis was represented as clean",
    );
  }
  for (const finding of result.findings) {
    if (
      finding.location.path.includes("\\") ||
      path.isAbsolute(finding.location.path) ||
      /^[a-z]:/iu.test(finding.location.path)
    ) {
      throw new DoctorIntegrityError(
        fixture.id + ": finding path is not normalized and relative",
      );
    }
  }
  if (fixture.repaired_source !== undefined) {
    if (
      !observation.repair ||
      observation.repair.changed !== true ||
      observation.repair.source_matches_manifest !== true ||
      observation.repair.read_only !== true
    ) {
      throw new DoctorHarnessError(
        fixture.id + ": repair mutation or read-only proof failed",
      );
    }
  } else if (observation.repair !== null) {
    throw new DoctorHarnessError(
      fixture.id + ": unexpected repair evidence exists",
    );
  }
}

export function deriveDoctorDecision(observation) {
  const fixtureManifest = requireFixtureManifest();
  if (
    !observation ||
    observation.contract !== "salt-ai-doctor-source-observation/1" ||
    observation.physical_fixture_count !== 6 ||
    observation.worker_artifact_present !== true ||
    !Array.isArray(observation.fixtures) ||
    observation.fixtures.length !== 6
  ) {
    throw new DoctorHarnessError("Doctor source observation is incomplete.");
  }
  let cut = false;
  for (let index = 0; index < fixtureManifest.fixtures.length; index += 1) {
    const fixture = fixtureManifest.fixtures[index];
    const fixtureObservation = observation.fixtures[index];
    assertFixtureHarness(fixture, fixtureObservation);
    const derivedAssessment = assessFixtureProduct(fixture, fixtureObservation);
    if (derivedAssessment !== fixtureObservation.product_assessment) {
      throw new DoctorHarnessError(
        fixture.id + ": product evidence was mutated inconsistently",
      );
    }
    if (derivedAssessment !== "pass") cut = true;
  }
  return cut ? "CUT_DOCTOR" : "PASS_DOCTOR";
}

export async function collectDoctorObservation() {
  const fixtureManifest = requireFixtureManifest();
  const [candidateManifest, schema] = await Promise.all([
    readFile(path.join(KNOWLEDGE_BUNDLE, "manifest.json"), "utf8").then(
      JSON.parse,
    ),
    readFile(DOCTOR_SCHEMA, "utf8").then(JSON.parse),
  ]);
  let validate;
  try {
    validate = new Ajv2020({ strict: true }).compile(schema);
  } catch (error) {
    throw new DoctorIntegrityError(
      "Published Doctor schema did not compile: " +
        (error instanceof Error ? error.message : String(error)),
    );
  }
  const parent = await mkdtemp(path.join(os.tmpdir(), "salt-doctor-eval-"));
  const expectedPrefix = path.join(os.tmpdir(), "salt-doctor-eval-");
  if (!parent.startsWith(expectedPrefix)) {
    throw new DoctorHarnessError(
      "Refusing to use an unexpected fixture directory.",
    );
  }
  try {
    const roots = [];
    for (const fixture of fixtureManifest.fixtures) {
      const root = path.join(parent, fixture.id);
      await mkdir(root);
      await materializeFixture(root, fixture, candidateManifest);
      roots.push(root);
    }
    const fixtures = [];
    for (let index = 0; index < fixtureManifest.fixtures.length; index += 1) {
      fixtures.push(
        await collectFixtureObservation(
          roots[index],
          fixtureManifest.fixtures[index],
          validate,
        ),
      );
    }
    return {
      contract: "salt-ai-doctor-source-observation/1",
      physical_fixture_count: roots.length,
      worker_artifact_present: true,
      fixtures,
    };
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
}

export function runDoctorObservation(observation, io = process) {
  try {
    const result = deriveDoctorDecision(observation);
    io.stdout.write(
      JSON.stringify({
        contract: "salt-ai-plan-005-decision/1",
        unit: "005/01",
        result,
      }) + "\n",
    );
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    io.stderr.write("salt-ai doctor source harness failure: " + message + "\n");
    return error instanceof DoctorIntegrityError ? 3 : 4;
  }
}

export async function runCli(args, io = process) {
  const rulesMode = sameJson(args, ["--mode", "decide-rules"]);
  const sourceMode = sameJson(args, ["--mode", "decide-source"]);
  if (!rulesMode && !sourceMode) {
    io.stderr.write(
      "Usage: node ./evals/salt-ai/doctor/run.mjs --mode decide-rules|decide-source\n",
    );
    return 2;
  }
  if (sourceMode) {
    try {
      await Promise.all(
        [CLI_BIN, DOCTOR_SCHEMA, DOCTOR_WORKER, DOCTOR_FIXTURES].map((file) =>
          access(file),
        ),
      );
      const observation = await collectDoctorObservation();
      return runDoctorObservation(observation, io);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      io.stderr.write(
        "salt-ai doctor source harness failure: " + message + "\n",
      );
      return error instanceof DoctorIntegrityError ? 3 : 4;
    }
  }
  try {
    await access(KNOWLEDGE_ENTRY);
    await access(path.join(KNOWLEDGE_BUNDLE, "manifest.json"));
  } catch {
    io.stderr.write(
      "Missing required built Knowledge; run the Unit 005/00 Knowledge build first.\n",
    );
    return 2;
  }
  try {
    const observation = await collectRulesObservation();
    const result = deriveRulesDecision(observation);
    io.stdout.write(
      `${JSON.stringify({ contract: "salt-ai-plan-005-decision/1", unit: "005/00", result })}\n`,
    );
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    io.stderr.write(`salt-ai doctor rules harness failure: ${message}\n`);
    return error instanceof RulesIntegrityError ? 3 : 4;
  }
}

if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  process.exitCode = await runCli(process.argv.slice(2));
}
