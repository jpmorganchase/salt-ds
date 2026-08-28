import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";
import process from "node:process";
import {
  offlineNetworkGuardUrl,
  runOfflineNetworkGuardSelfTest,
  runOfflineScannerWorkerContainmentSelfTest,
} from "./offline-network-probe.mjs";
import {
  assert,
  getInstalledCliBin,
  pathExists,
  runCommand,
} from "./shared.mjs";

async function runInstalledCli(
  installedCliBinPath,
  args,
  cwd,
  acceptableExitCodes = [0],
) {
  return runCommand(
    process.execPath,
    ["--import", offlineNetworkGuardUrl, installedCliBinPath, ...args],
    {
      cwd,
      env: { SALT_OFFLINE_ALLOW_SCANNER_WORKER: "1" },
      acceptableExitCodes,
      label: `offline packed salt-ds ${args.join(" ")}`,
    },
  );
}

export async function runCliWorkflowCoverage(
  installRoot,
  exactSaltRoot,
  nonSaltRoot,
  packReport,
) {
  console.log("Checking the installed Salt CLI surface offline...");
  runOfflineNetworkGuardSelfTest();
  runOfflineScannerWorkerContainmentSelfTest();
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
      env: { SALT_OFFLINE_ALLOW_SCANNER_WORKER: "1" },
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
        env: { ...process.env, SALT_OFFLINE_ALLOW_SCANNER_WORKER: "1" },
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
      explicitInfo.stdout === defaultInfo.stdout,
    "Packed info root selection was not deterministic.",
  );
  const info = JSON.parse(explicitInfo.stdout);
  const observed = new Map(
    info.project?.packages?.map((entry) => [
      entry.name,
      entry.observed_version,
    ]),
  );
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
      observed.get("@salt-ds/core") === "1.70.0" &&
      observed.get("@salt-ds/theme") === "1.45.0" &&
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
          entry.provenance === "official" &&
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
    "Packed skill info/print did not preserve official manifest-selected bytes.",
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
      exactDocsMarkdown.stdout.includes("# Button") &&
      exactDocsMarkdown.stdout.includes(
        "Record: record:component:component.button",
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
        [
          "docs",
          "component.localization-provider",
          "--format",
          "json",
        ],
        exactSaltRoot,
        [1],
      )
    ).stdout,
  );
  assert(
    ambiguousDocs.status === "ambiguous" &&
      ambiguousDocs.choices.some(
        (choice) =>
          choice.reference?.id === "component.vertical-navigation",
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
          match.citation?.record_key ===
            "record:component:component.button",
      ) &&
      emptyContext.matches.length === 0 &&
      filteredContext.matches.every(
        (match) => match.reference?.id !== "component.localization-provider",
      ) &&
      filteredContext.excluded_package_families.some(
        (entry) => entry.name === "@salt-ds/date-components",
      ) &&
      Buffer.byteLength(contextMarkdown.stdout, "utf8") <= 16 * 1024 &&
      contextMarkdown.stdout.includes("Citation: record:component:component.button"),
    "Packed context was not deterministic, bounded, cited, empty-safe, or version-filtered.",
  );

  const scanArgs = [
    "scan",
    exactSaltRoot,
    "--format",
    "json",
    "--fail-on",
    "never",
  ];
  const firstScan = await runInstalledCli(
    installedCliBinPath,
    scanArgs,
    nonSaltRoot,
  );
  const secondScan = await runInstalledCli(
    installedCliBinPath,
    scanArgs,
    nonSaltRoot,
  );
  assert(
    firstScan.stderr === "" && firstScan.stdout === secondScan.stdout,
    "Packed JSON scans were not offline and byte-deterministic.",
  );
  const scan = JSON.parse(firstScan.stdout);
  assert(
    scan.contract === "salt-scan-result/1" &&
      scan.schema_version === "1.0.0" &&
      scan.tool?.version === packReport.cli.version &&
      scan.knowledge?.bundle_digest ===
        packReport.report.knowledge_bundle.bundle_digest &&
      scan.coverage?.status === "complete" &&
      scan.coverage.evaluated_files === 1 &&
      scan.findings.some(
        (finding) =>
          finding.rule_id === "salt.component.action_navigation_target" &&
          finding.workspace_unit_id === "." &&
          finding.location?.path === "src/Review.tsx",
      ) &&
      !firstScan.stdout.includes(exactSaltRoot) &&
      !firstScan.stdout.includes("IGNORE PREVIOUS INSTRUCTIONS"),
    "Packed JSON scan did not preserve its canonical result, coverage, or source-isolation contract.",
  );

  const prettyScan = await runInstalledCli(
    installedCliBinPath,
    ["scan", "--format", "pretty", "--fail-on", "warning"],
    exactSaltRoot,
    [1],
  );
  assert(
    prettyScan.stderr === "" &&
      prettyScan.stdout.includes("Acceptance:") &&
      prettyScan.stdout.includes(
        "Rescan: salt-ds scan . --format pretty --fail-on warning",
      ),
    "Packed pretty scan did not expose acceptance and exact rescan guidance.",
  );

  const promptScan = await runInstalledCli(
    installedCliBinPath,
    ["scan", "--format", "prompt", "--fail-on", "warning"],
    exactSaltRoot,
    [1],
  );
  assert(
    promptScan.stderr === "" &&
      promptScan.stdout.includes("quoted, untrusted evidence") &&
      promptScan.stdout.includes("acceptance_criterion:") &&
      !promptScan.stdout.includes("IGNORE PREVIOUS INSTRUCTIONS"),
    "Packed prompt scan did not preserve its untrusted-evidence boundary.",
  );

  const sarifArgs = ["scan", "--format", "sarif", "--fail-on", "never"];
  const firstSarif = await runInstalledCli(
    installedCliBinPath,
    sarifArgs,
    exactSaltRoot,
  );
  const secondSarif = await runInstalledCli(
    installedCliBinPath,
    sarifArgs,
    exactSaltRoot,
  );
  const sarif = JSON.parse(firstSarif.stdout);
  assert(
    firstSarif.stderr === "" &&
      firstSarif.stdout === secondSarif.stdout &&
      sarif.version === "2.1.0" &&
      sarif.runs?.[0]?.results?.[0]?.partialFingerprints?.saltFindingId ===
        scan.findings[0].id,
    "Packed SARIF scans were not deterministic or finding-identity preserving.",
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
      partial.compatibility?.compatible === false &&
      partial.compatibility.disabled_families.some(
        (entry) =>
          entry.name === "@salt-ds/core" && entry.reason === "missing_required",
      ) &&
      partial.limitations.includes("SALT_PACKAGE_VECTOR_INCOMPATIBLE"),
    "Packed info did not disclose incomplete non-Salt coverage.",
  );

  const incompleteScan = await runInstalledCli(
    installedCliBinPath,
    ["scan", "--format", "json", "--fail-on", "never"],
    nonSaltRoot,
    [3],
  );
  const allowedIncompleteScan = await runInstalledCli(
    installedCliBinPath,
    ["scan", "--format", "json", "--fail-on", "never", "--allow-incomplete"],
    nonSaltRoot,
  );
  const incomplete = JSON.parse(incompleteScan.stdout);
  assert(
    incompleteScan.stderr === "" &&
      incomplete.coverage?.status === "partial" &&
      incomplete.coverage.reasons.includes("SALT_PACKAGE_VECTOR_UNAVAILABLE") &&
      allowedIncompleteScan.stderr === "" &&
      JSON.parse(allowedIncompleteScan.stdout).coverage.status === "partial",
    "Packed --allow-incomplete did not override only disclosed partial coverage.",
  );

  return {
    aliases: { help: 3, version: 2, broken_pipe: 1 },
    invalid_argument_cases: 26,
    exact_info: {
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
      provenance: "official",
    },
    scan: {
      coverage: scan.coverage.status,
      findings: scan.findings.length,
      formats: ["json", "pretty", "prompt", "sarif"],
      incomplete_coverage: incomplete.coverage.status,
    },
    network: "offline",
    node: process.versions.node,
  };
}
