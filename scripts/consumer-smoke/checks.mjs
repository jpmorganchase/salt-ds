import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";
import process from "node:process";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import {
  offlineNetworkGuardUrl,
  runOfflineNetworkGuardSelfTest,
  runOfflineScannerWorkerContainmentSelfTest,
} from "./offline-network-probe.mjs";
import {
  assert,
  createMcpSurfaceFingerprint,
  createMcpToolSemanticFingerprint,
  getInstalledCliBin,
  getInstalledMcpBin,
  pathExists,
  runCommand,
} from "./shared.mjs";

const REGISTERED_TOOL_NAMES = [
  "search_salt",
  "inspect_salt_project",
  "review_salt_code",
];
const SUPPORTED_PROTOCOL_REVISIONS = ["2026-07-28", "2025-11-25", "2025-06-18"];
const REMOVED_TOOL_NAMES = [
  "create_salt_ui",
  "migrate_to_salt",
  "get_salt_project_context",
  "get_salt_reference",
  "review_salt_ui",
];
const MANIFEST_URI_PATTERN =
  /^salt:\/\/catalog\/v2\/sha256-[0-9a-f]{64}\/manifest$/u;
const RECORD_TEMPLATE_PATTERN =
  /^salt:\/\/catalog\/v2\/sha256-[0-9a-f]{64}\/\{family\}\/\{id\}$/u;
const PROJECT_POLICY_TEMPLATE =
  "salt://project-policy/v2/{root}/{digest}/{kind}/{id}";
const COMPLETION_CLAIM_PATTERN =
  /implementation_ready|canonical_complete|exact_request_safe|repo_specific_workflows_ready|finish_without_changes|post_action/iu;
const MAX_SEARCH_RESULT_UTF8_BYTES = 16 * 1024;
const PUBLIC_CITATION_PATTERN =
  /^(?:salt:\/\/(?:catalog\/v2\/sha256-[0-9a-f]{64}|project-policy\/v2\/[A-Za-z0-9_-]+\/sha256-[0-9a-f]{64})\/|https:\/\/)/u;
const MAX_RESOURCE_PAGE_UTF8_BYTES = 256 * 1024;
const MAX_RESOURCES_PER_PAGE = 512;

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

async function collectDirectResourcePages(client) {
  const page = await client.request({
    method: "resources/list",
    params: {},
  });
  assert(
    Array.isArray(page.resources) &&
      page.resources.length === 1 &&
      page.resources.length <= MAX_RESOURCES_PER_PAGE &&
      page.nextCursor === undefined &&
      Buffer.byteLength(JSON.stringify(page), "utf8") <=
        MAX_RESOURCE_PAGE_UTF8_BYTES,
    "Installed MCP did not return one bounded curated manifest page.",
  );
  return {
    resources: page.resources,
    pageCount: 1,
    nextCursor: page.nextCursor,
  };
}

function parseResourceText(result, label) {
  const text = result?.contents?.[0]?.text;
  assert(typeof text === "string" && text.length > 0, `${label} was empty.`);
  return JSON.parse(text);
}

function getToolPayload(result, label) {
  assert(result?.isError !== true, `${label} returned an MCP tool error.`);
  if (result?.structuredContent) return result.structuredContent;
  const text = result?.content?.find((part) => part.type === "text")?.text;
  assert(typeof text === "string" && text.length > 0, `${label} was empty.`);
  return JSON.parse(text);
}

async function assertProtocolIsAdvertised(
  installedMcpBinPath,
  cwd,
  registryDir,
  protocolVersion,
  expectedEra,
) {
  const registryArgs = registryDir ? ["--registry-dir", registryDir] : [];
  const client = new Client(
    { name: `salt-consumer-${expectedEra}-probe`, version: "0.0.0" },
    {
      supportedProtocolVersions: [protocolVersion],
      versionNegotiation: {
        mode: expectedEra === "modern" ? { pin: protocolVersion } : "legacy",
      },
    },
  );
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [
      "--import",
      offlineNetworkGuardUrl,
      installedMcpBinPath,
      "serve",
      ...registryArgs,
    ],
    cwd,
    stderr: "pipe",
  });
  try {
    await client.connect(transport);
    assert(
      client.getProtocolEra() === expectedEra &&
        client.getNegotiatedProtocolVersion() === protocolVersion,
      `Installed MCP stdio did not negotiate ${expectedEra} ${protocolVersion}.`,
    );
  } finally {
    await client.close();
  }
}

export function assertBoundedMcpToolPayload(
  payload,
  expectedScopeKind,
  message,
) {
  assert(
    payload &&
      typeof payload === "object" &&
      payload.data &&
      typeof payload.data === "object" &&
      payload.scope?.kind === expectedScopeKind &&
      payload.coverage &&
      typeof payload.coverage === "object" &&
      Array.isArray(payload.limitations),
    message,
  );
  assert(
    !COMPLETION_CLAIM_PATTERN.test(JSON.stringify(payload)),
    `${message} The bounded result contained a completion or workflow-control claim.`,
  );
}

export async function runMcpWorkflowCoverage(
  installRoot,
  existingSaltRoot,
  nonSaltRoot,
  expectedModuleFingerprint,
  registryDir,
) {
  console.log("Checking the installed MCP v2 surface...");
  runOfflineNetworkGuardSelfTest();
  const installedMcpBinPath = getInstalledMcpBin(installRoot);
  const registryArgs = registryDir ? ["--registry-dir", registryDir] : [];
  assert(
    await pathExists(installedMcpBinPath),
    `Expected installed MCP bin at ${installedMcpBinPath}.`,
  );
  await assertProtocolIsAdvertised(
    installedMcpBinPath,
    existingSaltRoot,
    registryDir,
    "2026-07-28",
    "modern",
  );
  await assertProtocolIsAdvertised(
    installedMcpBinPath,
    existingSaltRoot,
    registryDir,
    "2025-11-25",
    "legacy",
  );
  await assertProtocolIsAdvertised(
    installedMcpBinPath,
    existingSaltRoot,
    registryDir,
    "2025-06-18",
    "legacy",
  );

  const client = new Client(
    {
      name: "salt-consumer-smoke",
      version: "0.0.0",
    },
    { versionNegotiation: { mode: "auto" } },
  );
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [
      "--import",
      offlineNetworkGuardUrl,
      installedMcpBinPath,
      "serve",
      ...registryArgs,
    ],
    cwd: existingSaltRoot,
    stderr: "pipe",
  });
  let stderrOutput = "";
  transport.stderr?.on("data", (chunk) => {
    stderrOutput += chunk.toString();
  });

  try {
    await client.connect(transport);
    assert(
      client.getProtocolEra() === "modern" &&
        client.getNegotiatedProtocolVersion() === "2026-07-28",
      `Installed MCP stdio negotiated ${client.getProtocolEra() ?? "<no era>"} ${client.getNegotiatedProtocolVersion() ?? "<no version>"} instead of current 2026-07-28.`,
    );
    const serverVersion = client.getServerVersion();
    const resourceCapabilities = client.getServerCapabilities()?.resources;
    assert(
      serverVersion?.name === "salt-mcp" &&
        resourceCapabilities?.subscribe === false &&
        resourceCapabilities?.listChanged === false,
      "Installed MCP server identity or immutable resource capabilities are incorrect.",
    );

    const tools = await client.listTools();
    const toolNames = tools.tools.map((tool) => tool.name);
    assert(
      JSON.stringify(toolNames) === JSON.stringify(REGISTERED_TOOL_NAMES),
      `Installed MCP server advertised ${toolNames.join(", ")} instead of the final registered tool contract.`,
    );
    for (const tool of tools.tools) {
      assert(
        tool.annotations?.readOnlyHint === true &&
          tool.annotations?.destructiveHint === false,
        `Installed MCP tool ${tool.name} was not advertised as read-only.`,
      );
    }

    const directResources = await collectDirectResourcePages(client);
    assert(
      directResources.pageCount === 1 &&
        directResources.nextCursor === undefined,
      "Installed MCP server did not return one curated resource page.",
    );
    const resources = await client.listResources();
    const resourceUris = resources.resources.map((resource) => resource.uri);
    const directResourceUris = directResources.resources.map(
      (resource) => resource.uri,
    );
    assert(
      resourceUris.length === 1 &&
        resources.nextCursor === undefined &&
        MANIFEST_URI_PATTERN.test(resourceUris[0]) &&
        new Set(resourceUris).size === resourceUris.length &&
        JSON.stringify(resourceUris) === JSON.stringify(directResourceUris),
      "Installed MCP server did not advertise a unique digest-bound resource catalog.",
    );
    const manifestUri = resourceUris[0];

    const templates = await client.listResourceTemplates();
    const templateUris = templates.resourceTemplates.map(
      (template) => template.uriTemplate,
    );
    const catalogTemplate = templateUris.find((uri) =>
      RECORD_TEMPLATE_PATTERN.test(uri),
    );
    assert(
      templateUris.length === 2 &&
        catalogTemplate &&
        templateUris.includes(PROJECT_POLICY_TEMPLATE) &&
        catalogTemplate.split("/")[4] === manifestUri.split("/")[4],
      `Installed MCP server advertised unexpected resource templates: ${templateUris.join(", ")}.`,
    );

    const manifest = parseResourceText(
      await client.readResource({ uri: manifestUri }),
      manifestUri,
    );
    assert(
      typeof manifest?.schema_version === "string" &&
        typeof manifest?.server_version === "string" &&
        manifest?.server_version === serverVersion.version &&
        typeof manifest?.catalog_version === "string" &&
        manifest?.negotiated_mcp_protocol_revision === "2026-07-28" &&
        JSON.stringify(manifest?.supported_mcp_protocol_revisions) ===
          JSON.stringify(SUPPORTED_PROTOCOL_REVISIONS) &&
        /^sha256:[0-9a-f]{64}$/u.test(manifest?.semantic_digest) &&
        Array.isArray(manifest?.families) &&
        manifest.families.every((family) =>
          /^sha256:[0-9a-f]{64}$/u.test(family.artifact_digest),
        ),
      "Catalog manifest did not return a schema-v2 digest-bound summary.",
    );
    const stdioFingerprint = createMcpSurfaceFingerprint({
      client,
      toolNames,
      manifestUri,
      manifest,
      resourceCount: resourceUris.length,
      resourceTemplate: catalogTemplate,
    });
    const expectedStdioFingerprint = {
      ...expectedModuleFingerprint.surface,
      protocol_era: "modern",
      protocol_revision: "2026-07-28",
    };
    assert(
      JSON.stringify(stdioFingerprint) ===
        JSON.stringify(expectedStdioFingerprint),
      "Installed MCP stdio protocol fingerprint differs from ESM/CommonJS.",
    );
    const stdioToolFingerprint = await createMcpToolSemanticFingerprint(
      client,
      existingSaltRoot,
    );
    assert(
      JSON.stringify(stdioToolFingerprint) ===
        JSON.stringify(expectedModuleFingerprint.tools),
      "Installed MCP stdio tool semantics differ from ESM/CommonJS.",
    );
    const searchResult = await client.callTool({
      name: "search_salt",
      arguments: { query: "Button", families: ["component"], limit: 3 },
    });
    const search = getToolPayload(searchResult, "search_salt");
    assertBoundedMcpToolPayload(
      search,
      "catalog_search",
      "Installed search did not return a bounded catalog-search result.",
    );
    const button = search.data.matches?.find(
      (match) => match.title === "Button",
    );
    assert(
      typeof button?.uri === "string" &&
        button.uri.startsWith(manifestUri.slice(0, -"manifest".length)),
      "Installed search did not return Button with a digest-bound resource URI.",
    );
    assert(
      searchResult.content?.some(
        (part) => part.type === "resource_link" && part.uri === button.uri,
      ),
      "Installed search omitted the MCP resource link for Button.",
    );
    assert(
      Buffer.byteLength(JSON.stringify(searchResult), "utf8") <=
        MAX_SEARCH_RESULT_UTF8_BYTES &&
        Array.isArray(button?.evidence?.matched_fields) &&
        button?.provenance?.resource_uri === button.uri &&
        typeof search.data?.ambiguity?.is_ambiguous === "boolean",
      "Installed search omitted compact match evidence, ambiguity, or claim-level provenance.",
    );
    const buttonResource = parseResourceText(
      await client.readResource({ uri: button.uri }),
      button.uri,
    );
    assert(
      buttonResource?.record?.name === "Button",
      "Installed Button resource did not resolve the canonical record.",
    );
    assert(
      Array.isArray(buttonResource.content_resources) &&
        buttonResource.content_resources.length > 0 &&
        buttonResource.content_resources.every((entry) =>
          PUBLIC_CITATION_PATTERN.test(entry.uri),
        ),
      "Installed Button resource embedded or omitted its digest-bound content links.",
    );
    await client.readResource({
      uri: buttonResource.content_resources[0].uri,
    });

    const buttonFamily = decodeURIComponent(button.uri.split("/").at(-2));
    const buttonId = decodeURIComponent(button.uri.split("/").at(-1));
    const completion = await client.complete({
      ref: { type: "ref/resource", uri: catalogTemplate },
      argument: { name: "id", value: buttonId },
      context: { arguments: { family: buttonFamily } },
    });
    assert(
      completion.completion.total === 1 &&
        completion.completion.hasMore === false &&
        completion.completion.values[0] === buttonId,
      "Installed MCP completion could not retrieve the searched component record.",
    );

    const inspectionResult = await client.callTool({
      name: "inspect_salt_project",
      arguments: { root_dir: ".", include_policy_ir: true },
    });
    const inspection = getToolPayload(inspectionResult, "inspect_salt_project");
    assertBoundedMcpToolPayload(
      inspection,
      "configured_project_inspection",
      "Installed project inspection did not return bounded observed facts.",
    );
    assert(
      inspection.scope.filesystem_access === "read_only" &&
        inspection.data.package_manifest &&
        inspection.data.installation?.untrusted_project_data?.classification ===
          "untrusted_project_data" &&
        Array.isArray(
          inspection.data.installation?.untrusted_project_data
            ?.resolved_packages,
        ),
      "Installed project inspection omitted its read-only package facts.",
    );

    const nonSaltInspectionResult = await client.callTool({
      name: "inspect_salt_project",
      arguments: { root_dir: nonSaltRoot },
    });
    const nonSaltInspection = getToolPayload(
      nonSaltInspectionResult,
      "inspect_salt_project non-Salt fixture",
    );
    assertBoundedMcpToolPayload(
      nonSaltInspection,
      "configured_project_inspection",
      "Installed inspection did not retain bounded non-Salt project semantics.",
    );
    assert(
      nonSaltInspection.data.package_manifest?.name ===
        "salt-consumer-smoke-non-salt" &&
        nonSaltInspection.data.installation?.assessment?.status ===
          "not_observed" &&
        nonSaltInspection.data.installation?.untrusted_project_data
          ?.resolved_packages?.length === 0,
      "Installed inspection mislabeled the non-Salt consumer as a healthy Salt installation.",
    );

    const noMatchResult = await client.callTool({
      name: "search_salt",
      arguments: { query: "qzvfpjxmqkht4ef437fa" },
    });
    const noMatch = getToolPayload(noMatchResult, "search_salt no-match");
    assertBoundedMcpToolPayload(
      noMatch,
      "catalog_search",
      "Installed search did not return a bounded no-match result.",
    );
    assert(
      noMatch.data.matches?.length === 0 &&
        noMatch.data.ambiguity?.candidate_count === 0 &&
        noMatch.data.ambiguity?.is_ambiguous === false,
      "Installed search promoted a no-match query into a successful candidate.",
    );

    const submitted = [
      'import { Button } from "@salt-ds/core";',
      "export function Demo() {",
      '  return <Button href="/next">Go</Button>;',
      "}",
    ].join("\n");
    const reviewResult = await client.callTool({
      name: "review_salt_code",
      arguments: {
        artifacts: [{ id: "demo.tsx", language: "tsx", text: submitted }],
      },
    });
    const review = getToolPayload(reviewResult, "review_salt_code");
    assertBoundedMcpToolPayload(
      review,
      "submitted_text_only",
      "Installed review did not retain its submitted-text boundary.",
    );
    assert(
      review.data.results?.[0]?.artifact?.id === "demo.tsx" &&
        ["findings", "no_findings_in_evaluated_scope"].includes(
          review.data.results?.[0]?.outcome,
        ) &&
        review.limitations.join(" ").includes("not submitted"),
      "Installed review omitted its artifact outcome or unsubmitted-file limitation.",
    );

    const nonSaltSubmitted = [
      'import { Button } from "@example/external-ui";',
      "export function LegacyPage() {",
      '  return <Button variant="contained">Save</Button>;',
      "}",
    ].join("\n");
    const nonSaltReviewResult = await client.callTool({
      name: "review_salt_code",
      arguments: {
        artifacts: [
          {
            id: "LegacyPage.tsx",
            language: "tsx",
            text: nonSaltSubmitted,
          },
        ],
      },
    });
    const nonSaltReview = getToolPayload(
      nonSaltReviewResult,
      "review_salt_code non-Salt fixture",
    );
    assertBoundedMcpToolPayload(
      nonSaltReview,
      "submitted_text_only",
      "Installed review did not retain bounded non-Salt submitted scope.",
    );
    assert(
      nonSaltReview.data.results?.[0]?.outcome ===
        "no_findings_in_evaluated_scope" &&
        nonSaltReview.data.results?.[0]?.findings?.length === 0 &&
        nonSaltReview.data.results?.[0]?.coverage?.parser === "babel" &&
        nonSaltReview.coverage?.detected_findings === 0 &&
        nonSaltReview.coverage?.returned_findings === 0,
      "Installed review falsely treated a non-Salt React component as a grounded Salt finding.",
    );

    const invalidCalls = [
      { name: "search_salt", arguments: { query: "" } },
      { name: "inspect_salt_project", arguments: { root_dir: "" } },
      { name: "review_salt_code", arguments: { artifacts: [] } },
      {
        name: "review_salt_code",
        arguments: {
          artifacts: Array.from({ length: 9 }, (_, index) => ({
            id: `too-many-${index}.tsx`,
            language: "tsx",
            text: `export const value${index} = ${index};`,
          })),
        },
      },
    ];
    for (const invalidCall of invalidCalls) {
      let rejected = false;
      try {
        const result = await client.callTool(invalidCall);
        rejected =
          result?.isError === true &&
          result.content?.some(
            (entry) =>
              entry.type === "text" &&
              typeof entry.text === "string" &&
              entry.text.length > 0,
          );
      } catch (error) {
        rejected = error?.code === -32602;
      }
      assert(
        rejected,
        `Installed MCP server accepted invalid ${invalidCall.name} arguments.`,
      );
    }

    for (const name of REMOVED_TOOL_NAMES) {
      let rejected = false;
      try {
        await client.callTool({ name, arguments: {} });
      } catch (error) {
        rejected = error?.code === -32602;
      }
      assert(rejected, `Installed MCP server unexpectedly accepted ${name}.`);
    }
  } catch (error) {
    const capturedStderr = stderrOutput.trim();
    if (capturedStderr.length > 0) {
      throw new Error(
        `Installed MCP server failed during smoke test.\nstderr:\n${capturedStderr}\n\n${error instanceof Error ? (error.stack ?? error.message) : error}`,
      );
    }
    throw error;
  } finally {
    await client.close();
  }
}
