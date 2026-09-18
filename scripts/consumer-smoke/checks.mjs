import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import {
  offlineNetworkGuardUrl,
  runOfflineNetworkGuardSelfTest,
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
        env: { ...process.env },
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
        "Citation: record:component:component.button",
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

  return {
    aliases: { help: 3, version: 2, broken_pipe: 1 },
    invalid_argument_cases: 26,
    terminal_safety: {
      large_output_bytes: largeOutputBytes,
      invalid_root: "generic",
      control_characters: "sanitized",
    },
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
      bundle_source: "installed_package",
      integrity: "manifest_verified",
      origin_authentication: "not_established_by_bundle",
    },
    rejected_retrieval: {
      docs: rejectedDocs.reason_code,
      context: rejectedContext.reason_code,
    },
    network: "offline",
    node: process.versions.node,
  };
}
