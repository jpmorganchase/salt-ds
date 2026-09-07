import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import {
  offlineNetworkGuardUrl,
  runOfflineNetworkGuardSelfTest,
  runOfflineScannerWorkerContainmentSelfTest,
} from "./offline-network-probe.mjs";
import {
  assert,
  distKnowledgeDir,
  getInstalledCliBin,
  pathExists,
  runCommand,
} from "./shared.mjs";

export const DOCTOR_OFFLINE_ENV = Object.freeze({
  SALT_OFFLINE_ALLOW_SCANNER_WORKER: "1",
});

async function runInstalledCli(
  installedCliBinPath,
  args,
  cwd,
  acceptableExitCodes = [0],
  env = DOCTOR_OFFLINE_ENV,
) {
  return runCommand(
    process.execPath,
    ["--import", offlineNetworkGuardUrl, installedCliBinPath, ...args],
    {
      cwd,
      env,
      acceptableExitCodes,
      label: `offline packed salt-ds ${args.join(" ")}`,
    },
  );
}

export const DOCTOR_PERFORMANCE_LIMITS = Object.freeze({
  warmups: 3,
  measured_runs: 12,
  max_run_ms: 5_000,
  p90_wall_ms: 3_000,
  p90_peak_rss_bytes: 256 * 1024 * 1024,
  max_source_files: 25,
  max_source_bytes: 256 * 1024,
});
export const DOCTOR_METRIC_PREFIX = "SALT_DOCTOR_PROCESS_METRIC ";

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function parseDoctorOutput(result, validate, label, allowMetric = false) {
  assert(
    result.stdout.endsWith("\n") && !result.stdout.trim().includes("\n"),
    `${label} did not emit one compact JSON line.`,
  );
  let value;
  try {
    value = JSON.parse(result.stdout);
  } catch {
    throw new Error(`${label} emitted malformed JSON.`);
  }
  assert(
    validate(value),
    `${label} failed the installed Doctor schema: ${JSON.stringify(validate.errors)}.`,
  );
  let metric = null;
  if (allowMetric) {
    const lines = result.stderr.trim().split("\n");
    assert(
      lines.length === 1 && lines[0].startsWith(DOCTOR_METRIC_PREFIX),
      `${label} emitted invalid process metrics.`,
    );
    metric = JSON.parse(lines[0].slice(DOCTOR_METRIC_PREFIX.length));
    assert(
      Number.isSafeInteger(metric.max_rss_kib) && metric.max_rss_kib > 0,
      `${label} emitted invalid peak RSS.`,
    );
  } else {
    assert(result.stderr === "", `${label} emitted unexpected stderr.`);
  }
  return { value, metric };
}

export async function runInstalledDoctorBinaryProcess({
  installedCliBinPath,
  fixtureRoot,
  validate,
  metricProbeUrl,
  acceptableExitCodes,
  failOn = "warning",
}) {
  const startedAt = process.hrtime.bigint();
  const result = await runCommand(
    process.execPath,
    [
      "--import",
      offlineNetworkGuardUrl,
      "--import",
      metricProbeUrl,
      installedCliBinPath,
      "doctor",
      ".",
      "--format",
      "json",
      "--fail-on",
      failOn,
    ],
    {
      cwd: fixtureRoot,
      env: DOCTOR_OFFLINE_ENV,
      acceptableExitCodes,
      label: "offline packed Doctor installed binary",
      timeoutMs: 30_000,
    },
  );
  const wallMs = Number((process.hrtime.bigint() - startedAt) / 1_000_000n);
  const parsed = parseDoctorOutput(
    result,
    validate,
    "Packed Doctor installed binary",
    true,
  );
  return {
    exit_code: result.exitCode,
    result: parsed.value,
    wall_ms: wallMs,
    peak_rss_bytes: parsed.metric.max_rss_kib * 1024,
  };
}

function doctorModuleScript(entryPath, args, moduleKind, includeMetric) {
  const metricLine = includeMetric
    ? `process.stderr.write(${JSON.stringify(DOCTOR_METRIC_PREFIX)} + JSON.stringify({max_rss_kib: process.resourceUsage().maxRSS}) + "\\n");`
    : "";
  if (moduleKind === "esm") {
    return [
      "(async () => {",
      `  const { runCli } = await import(${JSON.stringify(pathToFileURL(entryPath).href)});`,
      `  const exitCode = await runCli(${JSON.stringify(args)});`,
      metricLine ? `  ${metricLine}` : "",
      "  process.exitCode = exitCode;",
      "})().catch((error) => { console.error(error?.stack ?? String(error)); process.exitCode = 4; });",
    ]
      .filter(Boolean)
      .join("\n");
  }
  return [
    "(async () => {",
    `  const { runCli } = require(${JSON.stringify(entryPath)});`,
    `  const exitCode = await runCli(${JSON.stringify(args)});`,
    metricLine ? `  ${metricLine}` : "",
    "  process.exitCode = exitCode;",
    "})().catch((error) => { console.error(error?.stack ?? String(error)); process.exitCode = 4; });",
  ]
    .filter(Boolean)
    .join("\n");
}

async function runInstalledDoctorModule({
  installRoot,
  fixtureRoot,
  validate,
  moduleKind,
  failOn,
  acceptableExitCodes,
  includeMetric = false,
}) {
  const installedCliDir = path.join(
    installRoot,
    "node_modules",
    "@salt-ds",
    "cli",
  );
  const entryPath = path.join(
    installedCliDir,
    moduleKind === "esm" ? "dist-es" : "dist-cjs",
    "index.js",
  );
  const args = ["doctor", ".", "--format", "json", "--fail-on", failOn];
  const nodeArgs = ["--import", offlineNetworkGuardUrl];
  const moduleScript = doctorModuleScript(
    entryPath,
    args,
    moduleKind,
    includeMetric,
  );
  const esmProbePath =
    moduleKind === "esm"
      ? path.join(path.dirname(installRoot), "doctor-esm-export-probe.mjs")
      : null;
  if (esmProbePath) {
    await fs.writeFile(esmProbePath, moduleScript, {
      encoding: "utf8",
      flag: "wx",
    });
    nodeArgs.push(esmProbePath);
  } else {
    nodeArgs.push("--eval", moduleScript);
  }
  const startedAt = process.hrtime.bigint();
  let result;
  try {
    result = await runCommand(process.execPath, nodeArgs, {
      cwd: fixtureRoot,
      env: DOCTOR_OFFLINE_ENV,
      acceptableExitCodes,
      label: `offline packed Doctor ${moduleKind} export`,
    });
  } finally {
    if (esmProbePath) await fs.rm(esmProbePath, { force: true });
  }
  const wallMs = Number((process.hrtime.bigint() - startedAt) / 1_000_000n);
  const parsed = parseDoctorOutput(
    result,
    validate,
    `Packed Doctor ${moduleKind} export`,
    includeMetric,
  );
  return {
    exit_code: result.exitCode,
    result: parsed.value,
    wall_ms: wallMs,
    peak_rss_bytes: parsed.metric ? parsed.metric.max_rss_kib * 1024 : null,
  };
}

function percentile90(values) {
  const sorted = [...values].sort((left, right) => left - right);
  assert(sorted.length === 12, "Doctor p90 requires exactly 12 measurements.");
  return sorted[10];
}

async function runDoctorPerformance({
  installRoot,
  fixtureRoot,
  validate,
  expectedParity,
  projectDoctorParity,
  installedCliBinPath,
}) {
  const runOnce = async () => {
    const measured = await runInstalledDoctorModule({
      installRoot,
      fixtureRoot,
      validate,
      moduleKind: "cjs",
      failOn: "never",
      acceptableExitCodes: [0],
      includeMetric: true,
    });
    assert(
      sameJson(projectDoctorParity(measured.result), expectedParity) &&
        measured.result.status === "complete" &&
        measured.result.coverage.status === "complete",
      "A measured packed Doctor process lost expected semantics or coverage.",
    );
    return measured;
  };
  for (let index = 0; index < DOCTOR_PERFORMANCE_LIMITS.warmups; index += 1) {
    await runOnce();
  }
  const measured = [];
  for (
    let index = 0;
    index < DOCTOR_PERFORMANCE_LIMITS.measured_runs;
    index += 1
  ) {
    measured.push(await runOnce());
  }
  const wallTimesMs = measured.map((entry) => entry.wall_ms);
  const peakRssBytes = measured.map((entry) => entry.peak_rss_bytes);
  const infoTimingsMs = [];
  for (let index = 0; index < 3; index += 1) {
    const startedAt = process.hrtime.bigint();
    const info = await runInstalledCli(
      installedCliBinPath,
      ["info", ".", "--json"],
      fixtureRoot,
    );
    infoTimingsMs.push(
      Number((process.hrtime.bigint() - startedAt) / 1_000_000n),
    );
    assert(
      JSON.parse(info.stdout).knowledge.semantic_digest ===
        expectedParity.knowledge.semantic_digest,
      "Packed info diagnostic used a different Knowledge candidate.",
    );
  }
  return {
    observation_class: "single_host_operational",
    node: process.versions.node,
    platform: process.platform,
    warmups: DOCTOR_PERFORMANCE_LIMITS.warmups,
    measured_runs: DOCTOR_PERFORMANCE_LIMITS.measured_runs,
    wall_times_ms: wallTimesMs,
    peak_rss_bytes: peakRssBytes,
    max_wall_ms: Math.max(...wallTimesMs),
    p90_wall_ms: percentile90(wallTimesMs),
    p90_peak_rss_bytes: percentile90(peakRssBytes),
    info_timings_ms: infoTimingsMs,
    limits: {
      max_run_ms: DOCTOR_PERFORMANCE_LIMITS.max_run_ms,
      p90_wall_ms: DOCTOR_PERFORMANCE_LIMITS.p90_wall_ms,
      p90_peak_rss_bytes: DOCTOR_PERFORMANCE_LIMITS.p90_peak_rss_bytes,
    },
  };
}

export async function runPackedDoctorWorkflow(
  installRoot,
  packReport,
  harness,
  options = {},
) {
  runOfflineScannerWorkerContainmentSelfTest();
  const fixtureManifest = harness.requireFixtureManifest();
  const candidateManifest = JSON.parse(
    await fs.readFile(path.join(distKnowledgeDir, "manifest.json"), "utf8"),
  );
  assert(
    candidateManifest.semantic_digest ===
      packReport.report.knowledge_bundle.semantic_digest,
    "Packed Doctor fixture versions came from a different Knowledge candidate.",
  );
  const installedCliDir = path.join(
    installRoot,
    "node_modules",
    "@salt-ds",
    "cli",
  );
  const schema = JSON.parse(
    await fs.readFile(
      path.join(installedCliDir, "schemas", "doctor-result-1.schema.json"),
      "utf8",
    ),
  );
  const validate = new Ajv2020({ strict: true }).compile(schema);
  const installedCliManifest = JSON.parse(
    await fs.readFile(path.join(installedCliDir, "package.json"), "utf8"),
  );
  assert(
    !JSON.stringify(installedCliManifest.exports).includes("scannerWorker") &&
      !Object.keys(installedCliManifest.exports ?? {}).some((key) =>
        key.includes("scannerWorker"),
      ),
    "Packed scanner worker became a public package export.",
  );
  const installedCliBinPath = getInstalledCliBin(installRoot);
  const sourceObservation = await harness.collectDoctorObservation();
  const sourceById = new Map(
    sourceObservation.fixtures.map((fixture) => [fixture.id, fixture]),
  );
  const fixtureParent = path.join(path.dirname(installRoot), "doctor-fixtures");
  await fs.mkdir(fixtureParent);
  const roots = new Map();
  for (const fixture of fixtureManifest.fixtures) {
    const root = path.join(fixtureParent, fixture.id);
    await fs.mkdir(root);
    await harness.materializeFixture(root, fixture, candidateManifest, {
      externalTooling: true,
    });
    roots.set(fixture.id, root);
  }

  const workspaceFixture = fixtureManifest.fixtures[0];
  const workspaceRoot = roots.get(workspaceFixture.id);
  const expectedWorkspaceParity = harness.projectDoctorParity(
    sourceById.get(workspaceFixture.id).result,
  );
  const exportModes = {};
  for (const moduleKind of ["cjs", "esm"]) {
    const result = await runInstalledDoctorModule({
      installRoot,
      fixtureRoot: workspaceRoot,
      validate,
      moduleKind,
      failOn: "warning",
      acceptableExitCodes: [1],
    });
    const actualWorkspaceParity = harness.projectDoctorParity(result.result);
    assert(
      sameJson(actualWorkspaceParity, expectedWorkspaceParity) &&
        result.result.coverage.evaluated_files >= 1 &&
        result.result.coverage.evaluated_rule_ids.includes(
          workspaceFixture.expected_rule_id,
        ),
      `Packed Doctor ${moduleKind} export did not execute the expected worker-backed finding: ${JSON.stringify(
        {
          actual: actualWorkspaceParity,
          expected: expectedWorkspaceParity,
        },
      )}.`,
    );
    exportModes[moduleKind] = true;
  }

  const workerMutationResults = {};
  for (const moduleKind of ["cjs", "esm"]) {
    const mutationRoot = path.join(
      path.dirname(installRoot),
      `doctor-missing-${moduleKind}-worker`,
    );
    await fs.cp(installRoot, mutationRoot, { recursive: true });
    await fs.rm(
      path.join(
        mutationRoot,
        "node_modules",
        "@salt-ds",
        "cli",
        moduleKind === "esm" ? "dist-es" : "dist-cjs",
        "scannerWorker.js",
      ),
    );
    let rejected = false;
    try {
      const result = await runInstalledDoctorModule({
        installRoot: mutationRoot,
        fixtureRoot: workspaceRoot,
        validate,
        moduleKind,
        failOn: "warning",
        acceptableExitCodes: [0, 1, 2, 3, 4],
      });
      rejected =
        result.exit_code !== 1 ||
        !sameJson(
          harness.projectDoctorParity(result.result),
          expectedWorkspaceParity,
        );
    } catch {
      rejected = true;
    }
    assert(rejected, `Missing ${moduleKind} Doctor worker was not rejected.`);
    workerMutationResults[`${moduleKind}_missing_rejected`] = true;
  }

  const includePerformance = options.includePerformance !== false;
  let performance;
  if (includePerformance) {
    performance = await runDoctorPerformance({
      installRoot,
      fixtureRoot: workspaceRoot,
      validate,
      expectedParity: expectedWorkspaceParity,
      projectDoctorParity: harness.projectDoctorParity,
      installedCliBinPath,
    });
    assert(
      expectedWorkspaceParity.coverage.selected_files <=
        DOCTOR_PERFORMANCE_LIMITS.max_source_files &&
        sourceById.get(workspaceFixture.id).result.root.discovery
          .selected_bytes <= DOCTOR_PERFORMANCE_LIMITS.max_source_bytes,
      "Frozen Doctor performance fixture exceeds its source-size budget.",
    );
  }

  const executeInstalled = async (root, schemaValidate) => {
    const child = await runInstalledCli(
      installedCliBinPath,
      ["doctor", ".", "--format", "json", "--fail-on", "warning"],
      root,
      [0, 1, 3],
      DOCTOR_OFFLINE_ENV,
    );
    const parsed = parseDoctorOutput(
      child,
      schemaValidate,
      "Packed Doctor binary",
    );
    return {
      command_executed: true,
      invocation_root: ".",
      json_valid: true,
      exit_code: child.exitCode,
      stderr: child.stderr,
      result: parsed.value,
    };
  };
  const fixtures = [];
  for (const fixture of fixtureManifest.fixtures) {
    const observation = await harness.collectFixtureObservation(
      roots.get(fixture.id),
      fixture,
      validate,
      executeInstalled,
    );
    harness.assertFixtureHarness(fixture, observation);
    const source = sourceById.get(fixture.id);
    assert(
      sameJson(
        harness.projectDoctorParity(observation.result),
        harness.projectDoctorParity(source.result),
      ) &&
        sameJson(
          observation.repair
            ? harness.projectDoctorParity(observation.repair.after_result)
            : null,
          source.repair
            ? harness.projectDoctorParity(source.repair.after_result)
            : null,
        ),
      `${fixture.id}: packed Doctor differs from source-built semantics.`,
    );
    fixtures.push(observation);
  }
  return {
    contract: includePerformance
      ? "salt-ai-packed-doctor-smoke/1"
      : "salt-ai-packed-doctor-correctness/1",
    physical_fixture_count: fixtures.length,
    source_parity: true,
    offline: true,
    read_only: fixtures.every(
      (fixture) =>
        fixture.read_only === true && fixture.repair?.read_only !== false,
    ),
    semantic_digest: candidateManifest.semantic_digest,
    export_modes: exportModes,
    worker_mutations: workerMutationResults,
    fixtures,
    ...(includePerformance ? { performance } : {}),
  };
}

export async function runCliWorkflowCoverage(
  installRoot,
  exactSaltRoot,
  nonSaltRoot,
  packReport,
  options = {},
) {
  (options.log ?? console.log)(
    "Checking the installed Salt CLI surface offline...",
  );
  runOfflineNetworkGuardSelfTest();
  const installedCliBinPath = getInstalledCliBin(installRoot);
  assert(
    await pathExists(installedCliBinPath),
    `Expected installed CLI bin at ${installedCliBinPath}.`,
  );
  for (const [mode, args] of [
    [
      "ESM",
      [
        "--import",
        offlineNetworkGuardUrl,
        "--input-type=module",
        "--eval",
        'const mod = await import("@salt-ds/cli"); if (JSON.stringify(Object.keys(mod).sort()) !== JSON.stringify(["runCli"])) throw new Error("unexpected CLI ESM exports");',
      ],
    ],
    [
      "CommonJS",
      [
        "--import",
        offlineNetworkGuardUrl,
        "--eval",
        'const mod = require("@salt-ds/cli"); if (JSON.stringify(Object.keys(mod).sort()) !== JSON.stringify(["runCli"])) throw new Error("unexpected CLI CommonJS exports");',
      ],
    ],
  ]) {
    await runCommand(process.execPath, args, {
      cwd: installRoot,
      env: DOCTOR_OFFLINE_ENV,
      label: `offline packed CLI ${mode} export check`,
    });
  }

  const helpResults = [];
  for (const args of [["help"], ["-h"], ["--help"]]) {
    helpResults.push(
      await runInstalledCli(installedCliBinPath, args, exactSaltRoot),
    );
  }
  assert(
    helpResults.every(
      (result) =>
        result.stderr === "" && result.stdout === helpResults[0].stdout,
    ) && helpResults[0].stdout.includes("salt-ds info [root] --json"),
    "Packed help aliases did not preserve exact stdout/stderr semantics.",
  );

  const brokenPipe = await new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ["--import", offlineNetworkGuardUrl, installedCliBinPath, "help"],
      {
        cwd: exactSaltRoot,
        env: { ...process.env, ...DOCTOR_OFFLINE_ENV },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    let stderr = "";
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.stdout.destroy();
    child.on("error", reject);
    child.on("close", (code, signal) => resolve({ code, signal, stderr }));
  });
  assert(
    brokenPipe.code === 0 &&
      brokenPipe.signal === null &&
      brokenPipe.stderr === "",
    `Packed CLI did not treat a broken stdout pipe as success: ${JSON.stringify(brokenPipe)}.`,
  );

  const versionResults = [];
  for (const args of [["version"], ["--version"]]) {
    versionResults.push(
      await runInstalledCli(installedCliBinPath, args, exactSaltRoot),
    );
  }
  assert(
    versionResults.every(
      (result) =>
        result.stderr === "" &&
        result.stdout === `${packReport.cli.version}\n` &&
        result.stdout === versionResults[0].stdout,
    ),
    "Packed version aliases did not report the exact CLI package version.",
  );

  for (const args of [
    [],
    ["help", "extra"],
    ["-h", "extra"],
    ["--help", "extra"],
    ["version", "extra"],
    ["--version", "extra"],
    ["info"],
    ["info", "--json", "--json"],
    ["info", "one", "two", "--json"],
    ["info", "missing-root", "--json"],
    ["docs"],
    ["docs", "component.button"],
    ["docs", "component.button", "--format", "yaml"],
    ["context"],
    ["context", "Button", "--format", "json"],
    ["context", "Button", "--format", "json", "--limit", "0"],
    ["skill"],
    ["skill", "info"],
    ["skill", "print", "--kind", "fake"],
    ["skill", "print", "--kind", "skill", "extra"],
    ["scan"],
    ["scan", "--format", "json"],
    ["scan", "--fail-on", "never"],
    ["scan", "--format", "xml", "--fail-on", "never"],
    ["scan", "--format", "json", "--fail-on", "fatal"],
    ["unknown"],
  ]) {
    const result = await runInstalledCli(
      installedCliBinPath,
      args,
      exactSaltRoot,
      [2],
    );
    assert(
      result.stdout === "" && result.stderr.startsWith("salt-ds error:"),
      `Packed CLI invalid arguments did not use exit 2 and stderr only: ${args.join(" ")}.`,
    );
  }

  const explicitInfo = await runInstalledCli(
    installedCliBinPath,
    ["info", exactSaltRoot, "--json"],
    nonSaltRoot,
  );
  const defaultInfo = await runInstalledCli(
    installedCliBinPath,
    ["info", "--json"],
    exactSaltRoot,
  );
  assert(
    explicitInfo.stderr === "" &&
      defaultInfo.stderr === "" &&
      explicitInfo.stdout === defaultInfo.stdout &&
      !explicitInfo.stdout.includes(exactSaltRoot) &&
      !explicitInfo.stdout.includes(path.dirname(exactSaltRoot)),
    "Packed info root selection was not deterministic.",
  );
  const info = JSON.parse(explicitInfo.stdout);
  const observed = new Map(
    info.project?.packages?.map((entry) => [
      entry.name,
      entry.observed_version,
    ]),
  );
  const expectedUiVersions = options.expectedUiVersions ?? {
    "@salt-ds/core": "1.70.0",
    "@salt-ds/theme": "1.45.0",
  };
  assert(
    info.contract === "salt-cli-info/1" &&
      info.schema_version === "1.0.0" &&
      info.tool?.package === "@salt-ds/cli" &&
      info.tool.version === packReport.cli.version &&
      info.knowledge?.package === "@salt-ds/knowledge" &&
      info.knowledge.package_version === packReport.knowledge.version &&
      info.knowledge.selected_bundle_version === packReport.knowledge.version &&
      info.knowledge.bundle_digest ===
        packReport.report.knowledge_bundle.bundle_digest &&
      info.knowledge.semantic_digest ===
        packReport.report.knowledge_bundle.semantic_digest &&
      observed.get("@salt-ds/core") === expectedUiVersions["@salt-ds/core"] &&
      observed.get("@salt-ds/theme") === expectedUiVersions["@salt-ds/theme"] &&
      info.coverage?.status === "complete" &&
      info.coverage.exact_project_package_vector === true &&
      info.compatibility?.compatible === true &&
      Array.isArray(info.compatibility.disabled_families) &&
      Array.isArray(info.limitations),
    "Packed info did not report the exact project vector and Knowledge identity.",
  );

  const skillInfoResult = await runInstalledCli(
    installedCliBinPath,
    ["skill", "info", "--json"],
    exactSaltRoot,
  );
  const skillInfo = JSON.parse(skillInfoResult.stdout);
  const printedSkill = await runInstalledCli(
    installedCliBinPath,
    ["skill", "print", "--kind", "skill"],
    exactSaltRoot,
  );
  const printedAgents = await runInstalledCli(
    installedCliBinPath,
    ["skill", "print", "--kind", "agents"],
    exactSaltRoot,
  );
  const digest = (value) =>
    `sha256:${createHash("sha256").update(value).digest("hex")}`;
  const expectedAgentSupport = packReport.report.knowledge_bundle.agent_support;
  assert(
    skillInfoResult.stderr === "" &&
      skillInfo.contract === "salt-cli-skill-info/1" &&
      skillInfo.artifacts.length === 2 &&
      skillInfo.artifacts.every(
        (entry) =>
          entry.bundle_source === "installed_package" &&
          entry.integrity === "manifest_verified" &&
          entry.origin_authentication === "not_established_by_bundle" &&
          !Object.hasOwn(entry, "provenance") &&
          !Object.hasOwn(entry, "immutable_url") &&
          !entry.package_relative_path.includes("\\") &&
          !path.isAbsolute(entry.package_relative_path) &&
          entry.bundle_digest ===
            packReport.report.knowledge_bundle.bundle_digest,
      ) &&
      digest(printedSkill.stdout) === expectedAgentSupport.skill.sha256 &&
      Buffer.byteLength(printedSkill.stdout, "utf8") ===
        expectedAgentSupport.skill.bytes &&
      digest(printedAgents.stdout) ===
        expectedAgentSupport.agents_pointer.sha256 &&
      Buffer.byteLength(printedAgents.stdout, "utf8") ===
        expectedAgentSupport.agents_pointer.bytes,
    "Packed skill info/print did not preserve manifest-selected bytes and their trust boundary.",
  );
  let identityTamperRejected;
  if (options.verifyIdentityTamper === true) {
    const skillArtifact = skillInfo.artifacts.find(
      (entry) => entry.kind === "skill",
    );
    const installedKnowledgeRoot = path.join(
      installRoot,
      "node_modules",
      "@salt-ds",
      "knowledge",
    );
    const artifactPath = path.resolve(
      installedKnowledgeRoot,
      ...skillArtifact.package_relative_path.split("/"),
    );
    const relativeArtifactPath = path.relative(
      installedKnowledgeRoot,
      artifactPath,
    );
    assert(
      relativeArtifactPath.length > 0 &&
        !relativeArtifactPath.startsWith("..") &&
        !path.isAbsolute(relativeArtifactPath),
      "Packed skill identity selected an escaping artifact path.",
    );
    const originalArtifact = await fs.readFile(artifactPath);
    let tampered;
    try {
      await fs.writeFile(
        artifactPath,
        Buffer.concat([originalArtifact, Buffer.from("\nTAMPERED\n", "utf8")]),
      );
      tampered = await runInstalledCli(
        installedCliBinPath,
        ["skill", "print", "--kind", "skill"],
        exactSaltRoot,
        [1],
      );
    } finally {
      await fs.writeFile(artifactPath, originalArtifact);
    }
    identityTamperRejected =
      tampered.stdout === "" &&
      tampered.stderr ===
        "salt-ds error: [SALT_CLI_INTERNAL] The command failed unexpectedly.\n" &&
      tampered.exitCode === 1;
    assert(
      identityTamperRejected,
      "Packed skill command did not reject a tampered installed artifact.",
    );
  }

  const largeOutputRoot = await fs.mkdtemp(
    path.join(path.dirname(exactSaltRoot), "salt-large-info-"),
  );
  let largeOutputBytes = 0;
  try {
    const dependencies = Object.fromEntries(
      Array.from({ length: 128 }, (_, index) => [
        `@salt-ds/p${String(index).padStart(3, "0")}-${"x".repeat(180)}`,
        `workspace:${"y".repeat(1_000)}`,
      ]),
    );
    await fs.writeFile(
      path.join(largeOutputRoot, "package.json"),
      `${JSON.stringify({
        name: "salt-large-info-output",
        private: true,
        packageManager: "npm@11.0.0",
        dependencies,
      })}\n`,
      "utf8",
    );
    const largeOutput = await runInstalledCli(
      installedCliBinPath,
      ["info", "--json"],
      largeOutputRoot,
    );
    const parsedLargeOutput = JSON.parse(largeOutput.stdout);
    const canonicalLargeOutput = `${JSON.stringify(parsedLargeOutput)}\n`;
    largeOutputBytes = Buffer.byteLength(canonicalLargeOutput, "utf8");
    assert(
      largeOutput.stderr === "" &&
        largeOutput.stdout === canonicalLargeOutput &&
        largeOutput.stdout.endsWith("\n") &&
        Buffer.byteLength(largeOutput.stdout, "utf8") === largeOutputBytes &&
        largeOutputBytes > 64 * 1024,
      "Packed CLI large piped JSON output was incomplete or non-canonical.",
    );
  } finally {
    await fs.rm(largeOutputRoot, { recursive: true, force: true });
  }

  const hostileCommand = [
    "unknown",
    "x".repeat(1_500),
    String.fromCodePoint(0x1b, 0x85, 0x202e, 0x2066),
    String.fromCodePoint(0x1f642).repeat(128),
  ].join("-");
  const hostileResult = await runInstalledCli(
    installedCliBinPath,
    [hostileCommand],
    exactSaltRoot,
    [2],
  );
  const errorLine = hostileResult.stderr.slice(0, -1);
  const containsForbiddenTerminalCharacter = [...errorLine].some(
    (character) => {
      const codePoint = character.codePointAt(0);
      return (
        codePoint <= 0x1f ||
        (codePoint >= 0x7f && codePoint <= 0x9f) ||
        codePoint === 0x061c ||
        (codePoint >= 0x200e && codePoint <= 0x200f) ||
        (codePoint >= 0x202a && codePoint <= 0x202e) ||
        (codePoint >= 0x2066 && codePoint <= 0x2069)
      );
    },
  );
  assert(
    hostileResult.stdout === "" &&
      hostileResult.stderr.endsWith("\n") &&
      !hostileResult.stderr.slice(0, -1).includes("\n") &&
      errorLine.startsWith("salt-ds error: [SALT_CLI_USAGE] ") &&
      errorLine.endsWith("...[truncated]") &&
      Buffer.byteLength(errorLine, "utf8") <= 1_024 &&
      !containsForbiddenTerminalCharacter,
    "Packed CLI concise errors were not single-line, bounded, or terminal-safe.",
  );
  const hostileRoot = [
    "C:\\Users\\private-user\\missing-",
    String.fromCodePoint(0x1b, 0x202e, 0x2066),
  ].join("");
  const invalidRoot = await runInstalledCli(
    installedCliBinPath,
    ["info", hostileRoot, "--json"],
    exactSaltRoot,
    [2],
  );
  assert(
    invalidRoot.stdout === "" &&
      invalidRoot.stderr ===
        "salt-ds error: [SALT_CLI_USAGE] The project root is invalid or unavailable.\n" &&
      !invalidRoot.stderr.includes("private-user") &&
      !invalidRoot.stderr.includes("missing-"),
    "Packed CLI invalid-root errors leaked the selected root or terminal controls.",
  );

  const exactDocsArgs = ["docs", "component.button", "--format", "json"];
  const firstExactDocs = await runInstalledCli(
    installedCliBinPath,
    exactDocsArgs,
    exactSaltRoot,
  );
  const secondExactDocs = await runInstalledCli(
    installedCliBinPath,
    exactDocsArgs,
    exactSaltRoot,
  );
  const exactDocs = JSON.parse(firstExactDocs.stdout);
  assert(
    firstExactDocs.stderr === "" &&
      firstExactDocs.stdout === secondExactDocs.stdout &&
      exactDocs.contract === "salt-knowledge-document/1" &&
      exactDocs.status === "resolved" &&
      exactDocs.bundle?.digest ===
        packReport.report.knowledge_bundle.bundle_digest &&
      exactDocs.document?.reference?.family === "component" &&
      exactDocs.document?.reference?.id === "component.button" &&
      exactDocs.document?.content?.value &&
      exactDocs.document.citation?.record_key ===
        "record:component:component.button" &&
      Array.isArray(exactDocs.document.citation.source_records) &&
      !firstExactDocs.stdout.includes(exactSaltRoot),
    "Packed docs did not return deterministic manifest-bound Button content.",
  );
  const exactDocsMarkdown = await runInstalledCli(
    installedCliBinPath,
    ["docs", "component.button", "--format", "markdown"],
    exactSaltRoot,
  );
  assert(
    exactDocsMarkdown.stderr === "" &&
      exactDocsMarkdown.stdout.includes("# `Button`") &&
      exactDocsMarkdown.stdout.includes(
        "Record: `record:component:component.button`",
      ) &&
      exactDocsMarkdown.stdout.includes(
        packReport.report.knowledge_bundle.bundle_digest,
      ) &&
      !/storybook/iu.test(exactDocsMarkdown.stdout),
    "Packed Markdown docs were not exact, cited, or Storybook-independent.",
  );

  const ambiguousDocs = JSON.parse(
    (
      await runInstalledCli(
        installedCliBinPath,
        ["docs", "Vertical navigation", "--format", "json"],
        exactSaltRoot,
        [1],
      )
    ).stdout,
  );
  const missingDocs = JSON.parse(
    (
      await runInstalledCli(
        installedCliBinPath,
        ["docs", "definitely-missing-record", "--format", "json"],
        exactSaltRoot,
        [1],
      )
    ).stdout,
  );
  const incompatibleDocs = JSON.parse(
    (
      await runInstalledCli(
        installedCliBinPath,
        ["docs", "component.localization-provider", "--format", "json"],
        exactSaltRoot,
        [1],
      )
    ).stdout,
  );
  assert(
    ambiguousDocs.status === "ambiguous" &&
      ambiguousDocs.choices.some(
        (choice) => choice.reference?.id === "component.vertical-navigation",
      ) &&
      ambiguousDocs.choices.some(
        (choice) => choice.reference?.id === "pattern.vertical-navigation",
      ) &&
      missingDocs.status === "not_found" &&
      missingDocs.choices.length === 0 &&
      incompatibleDocs.status === "incompatible" &&
      incompatibleDocs.excluded_package_families.some(
        (entry) =>
          entry.name === "@salt-ds/date-components" &&
          entry.state === "missing_optional",
      ),
    "Packed docs guessed an ambiguity or omitted missing/version-filtered disclosure.",
  );

  const contextArgs = [
    "context",
    "Button appearance",
    "--format",
    "json",
    "--limit",
    "5",
  ];
  const firstContext = await runInstalledCli(
    installedCliBinPath,
    contextArgs,
    exactSaltRoot,
  );
  const secondContext = await runInstalledCli(
    installedCliBinPath,
    contextArgs,
    exactSaltRoot,
  );
  const context = JSON.parse(firstContext.stdout);
  const emptyContext = JSON.parse(
    (
      await runInstalledCli(
        installedCliBinPath,
        ["context", "", "--format", "json", "--limit", "5"],
        exactSaltRoot,
      )
    ).stdout,
  );
  const filteredContext = JSON.parse(
    (
      await runInstalledCli(
        installedCliBinPath,
        [
          "context",
          "Localization provider",
          "--format",
          "json",
          "--limit",
          "5",
        ],
        exactSaltRoot,
      )
    ).stdout,
  );
  const contextMarkdown = await runInstalledCli(
    installedCliBinPath,
    ["context", "Button appearance", "--format", "markdown", "--limit", "5"],
    exactSaltRoot,
  );
  assert(
    firstContext.stderr === "" &&
      firstContext.stdout === secondContext.stdout &&
      Buffer.byteLength(firstContext.stdout, "utf8") <= 16 * 1024 &&
      context.contract === "salt-knowledge-context/1" &&
      context.scoring_version === "salt-lexical-ranking/1" &&
      /^sha256:[0-9a-f]{64}$/u.test(context.context_digest) &&
      context.bundle_digest ===
        packReport.report.knowledge_bundle.bundle_digest &&
      context.matches.some(
        (match) =>
          match.reference?.family === "component" &&
          match.reference?.id === "component.button" &&
          match.citation?.record_key === "record:component:component.button",
      ) &&
      emptyContext.matches.length === 0 &&
      filteredContext.matches.every(
        (match) => match.reference?.id !== "component.localization-provider",
      ) &&
      filteredContext.excluded_package_families.some(
        (entry) => entry.name === "@salt-ds/date-components",
      ) &&
      Buffer.byteLength(contextMarkdown.stdout, "utf8") <= 16 * 1024 &&
      contextMarkdown.stdout.includes(
        "Citation: `record:component:component.button`",
      ),
    "Packed context was not deterministic, bounded, cited, empty-safe, or version-filtered.",
  );
  const partialResult = await runInstalledCli(
    installedCliBinPath,
    ["info", nonSaltRoot, "--json"],
    exactSaltRoot,
  );
  const partial = JSON.parse(partialResult.stdout);
  assert(
    partial.coverage?.status === "partial" &&
      partial.coverage.exact_project_package_vector === false &&
      partial.selection?.status === "not_salt" &&
      partial.selection.reason_code === "SALT_PROJECT_NO_SALT_PACKAGES" &&
      partial.compatibility?.compatible === false &&
      partial.compatibility.disabled_families.some(
        (entry) =>
          entry.name === "@salt-ds/core" && entry.reason === "missing_required",
      ) &&
      partial.limitations.includes("SALT_PACKAGE_VECTOR_INCOMPATIBLE"),
    "Packed info did not disclose incomplete non-Salt coverage.",
  );
  const rejectedDocs = JSON.parse(
    (
      await runInstalledCli(
        installedCliBinPath,
        ["docs", "component.button", "--format", "json"],
        nonSaltRoot,
        [3],
      )
    ).stdout,
  );
  const rejectedContext = JSON.parse(
    (
      await runInstalledCli(
        installedCliBinPath,
        ["context", "Button", "--format", "json", "--limit", "5"],
        nonSaltRoot,
        [3],
      )
    ).stdout,
  );
  assert(
    rejectedDocs.status === "not_salt" &&
      rejectedDocs.reason_code === "SALT_PROJECT_NO_SALT_PACKAGES" &&
      rejectedContext.status === "not_salt" &&
      rejectedContext.reason_code === "SALT_PROJECT_NO_SALT_PACKAGES",
    "Packed retrieval did not stop at the closed non-Salt project decision.",
  );
  const removedScan = await runInstalledCli(
    installedCliBinPath,
    ["scan"],
    exactSaltRoot,
    [2],
  );
  assert(
    removedScan.stdout === "" &&
      removedScan.stderr.includes("[SALT_CLI_USAGE]") &&
      removedScan.stderr.includes("Unknown command: scan"),
    "Packed CLI still exposed scan as a product command.",
  );
  let doctorHarness = options.doctorHarness;
  if (!doctorHarness) {
    doctorHarness = await import("../../evals/salt-ai/doctor/run.mjs");
  }
  const doctor = await runPackedDoctorWorkflow(
    installRoot,
    packReport,
    doctorHarness,
    { includePerformance: options.includeDoctorPerformance !== false },
  );
  if (options.includeDoctorPerformance !== false) {
    const performancePassed =
      doctor.performance.max_wall_ms <= doctor.performance.limits.max_run_ms &&
      doctor.performance.p90_wall_ms <= doctor.performance.limits.p90_wall_ms &&
      doctor.performance.p90_peak_rss_bytes <=
        doctor.performance.limits.p90_peak_rss_bytes;
    if (options.captureThresholdMisses !== true) {
      assert(
        performancePassed,
        `Packed Doctor exceeded its frozen performance budget: ${JSON.stringify(doctor.performance)}.`,
      );
    }
    doctor.performance.threshold_passed = performancePassed;
  }

  return {
    aliases: { help: 3, version: 2, broken_pipe: 1 },
    invalid_argument_cases: 26,
    terminal_safety: {
      large_output_bytes: largeOutputBytes,
      invalid_root: "generic",
      control_characters: "sanitized",
    },
    exact_info: {
      cli_version: info.tool.version,
      knowledge_version: info.knowledge.package_version,
      bundle_digest: info.knowledge.bundle_digest,
      semantic_digest: info.knowledge.semantic_digest,
      package_count: info.project.packages.length,
      coverage: info.coverage.status,
    },
    partial_info: { coverage: partial.coverage.status },
    retrieval: {
      docs: ["exact", "ambiguous", "missing", "version-filtered"],
      context_matches: context.matches.length,
      context_digest: context.context_digest,
      scoring_version: context.scoring_version,
      max_utf8_bytes: 16 * 1024,
    },
    agent_support: {
      skill_sha256: expectedAgentSupport.skill.sha256,
      agents_pointer_sha256: expectedAgentSupport.agents_pointer.sha256,
      bundle_source: "installed_package",
      integrity: "manifest_verified",
      origin_authentication: "not_established_by_bundle",
      ...(options.verifyIdentityTamper === true
        ? { tamper_rejected: identityTamperRejected }
        : {}),
    },
    rejected_retrieval: {
      docs: rejectedDocs.reason_code,
      context: rejectedContext.reason_code,
    },
    doctor,
    network: "offline",
    node: process.versions.node,
  };
}

export function assertJourneyDoctorSelection(
  result,
  { selectedWorkspace, uiCohort, packReport, toolingRoot = false },
) {
  const selected = result?.workspace_units?.find(
    (unit) => unit.workspace_unit_id === selectedWorkspace,
  );
  const observed = new Map(
    selected?.package_vector?.map((entry) => [
      entry.name,
      entry.observed_version,
    ]) ?? [],
  );
  assert(
    result?.contract === "salt-doctor-result/1" &&
      result.status === "complete" &&
      result.reason_code === "SALT_PROJECT_SELECTED" &&
      result.tool?.package === "@salt-ds/cli" &&
      result.tool.version === packReport.cli.version &&
      result.knowledge?.package === "@salt-ds/knowledge" &&
      result.knowledge.version === packReport.knowledge.version &&
      result.knowledge.bundle_digest ===
        packReport.report.knowledge_bundle.bundle_digest &&
      result.knowledge.semantic_digest ===
        packReport.report.knowledge_bundle.semantic_digest &&
      selected?.project_decision?.status === "selected" &&
      selected.project_decision.reason_code === "SALT_PROJECT_SELECTED" &&
      Object.entries(uiCohort).every(
        ([name, version]) => observed.get(name) === version,
      ) &&
      !observed.has("@salt-ds/cli") &&
      !observed.has("@salt-ds/knowledge") &&
      result.coverage?.status === "complete" &&
      result.coverage.timeout === false,
    `Packed Doctor did not select the real ${selectedWorkspace} UI cohort independently of tooling packages.`,
  );
  if (toolingRoot) {
    const rootUnit = result.workspace_units.find(
      (unit) => unit.workspace_unit_id === ".",
    );
    assert(
      rootUnit?.package_vector?.length === 0 &&
        rootUnit.project_decision?.status === "not_salt" &&
        rootUnit.project_decision.reason_code ===
          "SALT_PROJECT_NO_SALT_PACKAGES",
      "Packed Doctor treated the tooling-only workspace root as Salt UI evidence.",
    );
  }
}

export async function runJourneyDoctorCoverage(
  installRoot,
  sameProjectRoot,
  toolingWorkspaceRoot,
  packReport,
  uiCohort,
) {
  const execute = async (installedCliBinPath, root, label) => {
    const result = await runInstalledCli(
      installedCliBinPath,
      ["doctor", ".", "--format", "json", "--fail-on", "never"],
      root,
    );
    assert(
      result.stderr === "" &&
        result.stdout.endsWith("\n") &&
        !result.stdout.trim().includes("\n"),
      `${label} did not emit one JSON line on stdout only.`,
    );
    return JSON.parse(result.stdout);
  };
  const sameProject = await execute(
    getInstalledCliBin(installRoot),
    sameProjectRoot,
    "Same-project packed Doctor",
  );
  assertJourneyDoctorSelection(sameProject, {
    selectedWorkspace: ".",
    uiCohort,
    packReport,
  });
  const toolingWorkspace = await execute(
    getInstalledCliBin(toolingWorkspaceRoot),
    toolingWorkspaceRoot,
    "Tooling-root packed Doctor",
  );
  assertJourneyDoctorSelection(toolingWorkspace, {
    selectedWorkspace: "packages/app",
    uiCohort,
    packReport,
    toolingRoot: true,
  });
  return {
    contract: "salt-ai-consumer-journey-doctor/1",
    same_project: {
      selected_workspace: ".",
      status: sameProject.status,
      reason_code: sameProject.reason_code,
    },
    tooling_root: {
      selected_workspace: "packages/app",
      status: toolingWorkspace.status,
      reason_code: toolingWorkspace.reason_code,
    },
    performance_qualification: "not_run",
    offline: true,
  };
}

export function assertConsumerJourneyReceipt(receipt) {
  const cohort = receipt?.installation?.ui_cohort;
  const sourceArtifactOverrides =
    receipt?.installation?.source_artifact_overrides;
  const expectedSourceOverrideNames = ["@salt-ds/icons", "@salt-ds/styles"];
  const cli = receipt?.workflows?.cli;
  const projectDoctor = receipt?.workflows?.project_doctor;
  assert(
    receipt?.contract === "salt-ai-consumer-journey/1" &&
      receipt.schema_version === "1.0.0" &&
      receipt.purpose === "packed_consumer_correctness" &&
      receipt.doctor_performance_qualification === "not_run" &&
      cohort &&
      receipt.installation.cli_dependency_section === "devDependencies" &&
      receipt.installation.installed_tool_versions?.["@salt-ds/cli"] ===
        cli?.exact_info?.cli_version &&
      receipt.installation.installed_tool_versions?.["@salt-ds/knowledge"] ===
        cli?.exact_info?.knowledge_version &&
      receipt.installation.framework_dependencies?.react === "18.3.1" &&
      receipt.installation.framework_dependencies?.["react-dom"] === "18.3.1" &&
      Object.entries(cohort).every(
        ([name, version]) =>
          receipt.installation.installed_ui_versions?.[name] === version &&
          receipt.installation.tooling_workspace_ui_versions?.[name] ===
            version &&
          typeof receipt.installation.resolved_ui_declarations?.[name] ===
            "string" &&
          receipt.installation.resolved_ui_declarations[name].length > 0,
      ) &&
      JSON.stringify(Object.keys(sourceArtifactOverrides ?? {}).sort()) ===
        JSON.stringify(expectedSourceOverrideNames) &&
      expectedSourceOverrideNames.every((name) => {
        const artifact = sourceArtifactOverrides[name];
        return (
          artifact?.disposition === "local_built_source_artifact" &&
          typeof artifact.version === "string" &&
          artifact.version.length > 0 &&
          /^sha256:[0-9a-f]{64}$/u.test(artifact.tarball_sha256) &&
          receipt.installation.installed_source_override_versions?.[name] ===
            artifact.version &&
          receipt.installation
            .tooling_workspace_installed_source_override_versions?.[name] ===
            artifact.version
        );
      }) &&
      /^sha256:[0-9a-f]{64}$/u.test(
        receipt.installation.installed_cli_tree_sha256,
      ) &&
      /^sha256:[0-9a-f]{64}$/u.test(
        receipt.installation.installed_knowledge_tree_sha256,
      ) &&
      receipt.installation.tooling_workspace_installed_cli_tree_sha256 ===
        receipt.installation.installed_cli_tree_sha256 &&
      receipt.installation.tooling_workspace_installed_knowledge_tree_sha256 ===
        receipt.installation.installed_knowledge_tree_sha256 &&
      /^sha256:[0-9a-f]{64}$/u.test(receipt.installation.lockfile_sha256) &&
      /^sha256:[0-9a-f]{64}$/u.test(
        receipt.installation.tooling_workspace_lockfile_sha256,
      ) &&
      cli?.aliases?.help === 3 &&
      cli.aliases.version === 2 &&
      cli.aliases.broken_pipe === 1 &&
      cli.invalid_argument_cases === 26 &&
      cli.terminal_safety?.control_characters === "sanitized" &&
      cli.exact_info?.cli_version &&
      cli.exact_info.knowledge_version &&
      cli.agent_support?.integrity === "manifest_verified" &&
      cli.agent_support.tamper_rejected === true &&
      cli.rejected_retrieval?.docs === "SALT_PROJECT_NO_SALT_PACKAGES" &&
      cli.rejected_retrieval.context === "SALT_PROJECT_NO_SALT_PACKAGES" &&
      cli.doctor?.contract === "salt-ai-packed-doctor-correctness/1" &&
      !Object.hasOwn(cli.doctor, "performance") &&
      cli.doctor.offline === true &&
      cli.doctor.read_only === true &&
      projectDoctor?.same_project?.selected_workspace === "." &&
      projectDoctor.same_project.status === "complete" &&
      projectDoctor.tooling_root?.selected_workspace === "packages/app" &&
      projectDoctor.tooling_root.status === "complete" &&
      projectDoctor.performance_qualification === "not_run" &&
      receipt.runtime?.offline === true &&
      receipt.runtime.read_only === true &&
      receipt.result === "pass",
    "Consumer journey receipt omitted a required installation, safety, identity, or selection proof.",
  );
}
