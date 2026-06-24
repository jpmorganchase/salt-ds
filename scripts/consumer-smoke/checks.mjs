import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  assert,
  distCliBin,
  getInstalledCliBin,
  getInstalledMcpBin,
  pathExists,
  repoRoot,
  runCommand,
} from "./shared.mjs";
import { SmokeStdioClientTransport } from "./transport.mjs";

async function runSaltJson(rootDir, args, options = {}) {
  const cliBin = options.cliBin ?? distCliBin;
  assert(await pathExists(cliBin), `Expected Salt CLI bin at ${cliBin}.`);
  const result = await runCommand(
    process.execPath,
    [
      cliBin,
      ...args,
      ...(options.registryDir ? ["--registry-dir", options.registryDir] : []),
      "--json",
    ],
    {
      cwd: rootDir,
      label: `node ${path.basename(cliBin)} ${args.join(" ")}`,
      acceptableExitCodes: options.acceptableExitCodes ?? [0],
    },
  );

  return {
    ...result,
    payload: JSON.parse(result.stdout),
  };
}

function assertCompactMcpWorkflowPayload(payload, workflow, message) {
  assert(
    payload?.contract === "salt_workflow_v3" &&
      payload?.workflow === workflow &&
      payload?.transport === "mcp" &&
      typeof payload?.status === "string" &&
      ["success", "partial", "blocked", "failed"].includes(payload.status) &&
      payload?.request &&
      typeof payload.request === "object" &&
      payload?.safety &&
      typeof payload.safety === "object" &&
      typeof payload?.safety?.canonical_complete === "boolean" &&
      typeof payload?.safety?.exact_request_safe === "boolean" &&
      Array.isArray(payload?.safety?.blocking_reasons) &&
      payload?.action &&
      typeof payload.action === "object" &&
      typeof payload?.action?.kind === "string" &&
      typeof payload?.summary === "string" &&
      payload.summary.length > 0,
    message,
  );
}

const WORKFLOW_EXIT_CODES = {
  success: 0,
  partial: 10,
  blocked: 20,
  failed: 30,
};

function assertCompactCliWorkflowPayload(payload, workflow, exitCode, message) {
  assert(
    payload?.contract === "salt_workflow_v3" &&
      payload?.workflow === workflow &&
      payload?.transport === "cli" &&
      typeof payload?.status === "string" &&
      Object.hasOwn(WORKFLOW_EXIT_CODES, payload.status) &&
      payload?.request &&
      typeof payload.request === "object" &&
      payload?.safety &&
      typeof payload.safety === "object" &&
      typeof payload?.safety?.canonical_complete === "boolean" &&
      typeof payload?.safety?.exact_request_safe === "boolean" &&
      Array.isArray(payload?.safety?.blocking_reasons) &&
      payload?.action &&
      typeof payload.action === "object" &&
      typeof payload?.action?.kind === "string" &&
      typeof payload?.summary === "string" &&
      payload.summary.length > 0,
    message,
  );
  assert(
    exitCode === WORKFLOW_EXIT_CODES[payload.status],
    `${message} Exit code ${exitCode} did not match status ${payload.status}.`,
  );
}

export async function runDoctor(installRoot, repoRoot, runtimeUrl) {
  console.log("Running salt-ds doctor in the temp consumer repo...");
  const bundleDir = path.join(repoRoot, ".salt-support", "doctor-bundle");
  const installedCliBin = getInstalledCliBin(installRoot);
  assert(
    await pathExists(installedCliBin),
    `Expected installed Salt CLI bin at ${installedCliBin}.`,
  );
  const result = await runCommand(
    process.execPath,
    [
      installedCliBin,
      "doctor",
      ".",
      "--json",
      "--storybook-url",
      runtimeUrl,
      "--bundle-dir",
      bundleDir,
    ],
    {
      cwd: repoRoot,
      label: "installed salt-ds doctor",
    },
  );

  const payload = JSON.parse(result.stdout);
  assert(
    payload.repoSignals.storybookDetected === true,
    "salt-ds doctor did not detect Storybook in the consumer repo.",
  );
  assert(
    payload.repoSignals.saltTeamConfigFound === true,
    "salt-ds doctor did not detect .salt/team.json in the consumer repo.",
  );
  assert(
    payload.runtimeTargets.some((target) => target.reachable === true),
    "salt-ds doctor did not report a reachable runtime target.",
  );
  assert(
    await pathExists(path.join(bundleDir, "doctor-report.json")),
    "salt-ds doctor did not write the expected support bundle report.",
  );
  assert(
    await pathExists(path.join(bundleDir, "policy-layer-summary.json")),
    "salt-ds doctor did not write the expected policy-layer summary bundle artifact.",
  );
}

export async function runRuntimeInspect(installRoot, repoRoot, runtimeUrl) {
  console.log("Running salt-ds runtime inspect in the temp consumer repo...");
  const installedCliBin = getInstalledCliBin(installRoot);
  assert(
    await pathExists(installedCliBin),
    `Expected installed Salt CLI bin at ${installedCliBin}.`,
  );
  const result = await runCommand(
    process.execPath,
    [
      installedCliBin,
      "runtime",
      "inspect",
      runtimeUrl,
      "--json",
      "--mode",
      "fetched-html",
    ],
    {
      cwd: repoRoot,
      label: "installed salt-ds runtime inspect",
    },
  );
  const payload = JSON.parse(result.stdout);
  assert(
    payload.inspectionMode === "fetched-html",
    "salt-ds runtime inspect did not return fetched-html mode in the smoke test.",
  );
  assert(
    payload.page.title === "Salt Smoke Runtime",
    "salt-ds runtime inspect did not read the expected page title.",
  );
  assert(
    payload.accessibility.landmarks.some((entry) => entry.role === "main"),
    "salt-ds runtime inspect did not report a main landmark.",
  );
  assert(
    payload.layout?.available === false,
    "salt-ds runtime inspect did not report layout evidence as unavailable in fetched-html mode.",
  );
}

export async function runInfo(rootDir, options = {}) {
  console.log("Running salt-ds info in the temp consumer repo...");
  const { exitCode, payload } = await runSaltJson(rootDir, ["info", "."], {
    cliBin: options.cliBin,
    registryDir: options.registryDir,
  });
  assert(exitCode === 0, "salt-ds info did not succeed.");
  return payload;
}

export async function runPublicCliWorkflowCoverage(
  installRoot,
  existingSaltRoot,
  nonSaltRoot,
  newProjectRoot,
  runtimeUrl,
) {
  console.log("Checking the public CLI workflow contract...");
  const installedCliBin = getInstalledCliBin(installRoot);
  const registryDir = path.join(
    repoRoot,
    "packages",
    "semantic-core",
    "generated",
  );
  assert(
    await pathExists(installedCliBin),
    `Expected installed Salt CLI bin at ${installedCliBin}.`,
  );
  assert(
    await pathExists(registryDir),
    `Expected built Salt registry at ${registryDir}.`,
  );

  const newProjectInit = (
    await runSaltJson(newProjectRoot, ["init", "."], {
      cliBin: installedCliBin,
      registryDir,
    })
  ).payload;
  assert(
    newProjectInit.workflow === "init" &&
      newProjectInit.policy?.action === "created" &&
      newProjectInit.policy?.mode === "team",
    "salt-ds init did not create the expected default Salt policy for the new-project repo.",
  );
  assert(
    newProjectInit.repoInstructions?.filename === "AGENTS.md" &&
      newProjectInit.repoInstructions?.action === "created",
    "salt-ds init did not create the expected AGENTS.md bootstrap instructions for the new-project repo.",
  );
  assert(
    await pathExists(path.join(newProjectRoot, ".salt", "team.json")),
    "salt-ds init did not write .salt/team.json in the new-project repo.",
  );
  assert(
    await pathExists(path.join(newProjectRoot, "AGENTS.md")),
    "salt-ds init did not write AGENTS.md in the new-project repo.",
  );
  assert(
    !(await pathExists(
      path.join(newProjectRoot, ".github", "copilot-instructions.md"),
    )),
    "salt-ds init should not write .github/copilot-instructions.md in the new-project repo unless host adapters are explicitly requested.",
  );
  assert(
    !(await pathExists(
      path.join(newProjectRoot, ".github", "agents", "salt-ui.agent.md"),
    )),
    "salt-ds init should not write .github/agents/salt-ui.agent.md in the new-project repo unless host adapters are explicitly requested.",
  );

  const newProjectPackageManifest = JSON.parse(
    await fs.readFile(path.join(newProjectRoot, "package.json"), "utf8"),
  );
  assert(
    newProjectPackageManifest.scripts?.["ui:verify"] == null,
    "salt-ds init should not scaffold ui:verify in package.json unless explicitly requested.",
  );

  const newProjectInfo = await runInfo(newProjectRoot, {
    cliBin: installedCliBin,
    registryDir,
  });
  assert(
    typeof newProjectInfo.policy?.teamConfigPath === "string" &&
      newProjectInfo.policy.teamConfigPath.endsWith("/.salt/team.json"),
    "salt-ds info did not report the bootstrapped .salt/team.json for the new-project repo.",
  );
  assert(
    newProjectInfo.policy?.mode === "team",
    "salt-ds info did not report the expected team policy mode for the new-project repo after init.",
  );
  assert(
    newProjectInfo.repoInstructions?.filename === "AGENTS.md",
    "salt-ds info did not report the bootstrapped AGENTS.md for the new-project repo.",
  );
  assert(
    newProjectInfo.workflows?.create === true,
    "salt-ds info did not report create capability for the new-project repo.",
  );

  const createPayload = await runSaltJson(
    newProjectRoot,
    [
      "create",
      "link to another page from a toolbar action",
      "--include-starter-code",
    ],
    {
      acceptableExitCodes: [0, 10, 20, 30],
      cliBin: installedCliBin,
      registryDir,
    },
  );
  assertCompactCliWorkflowPayload(
    createPayload.payload,
    "create",
    createPayload.exitCode,
    "salt-ds create did not return the shipped compact workflow contract.",
  );

  const reviewResult = await runSaltJson(
    existingSaltRoot,
    ["review", "src/App.tsx"],
    {
      acceptableExitCodes: [0, 10, 20, 30],
      cliBin: installedCliBin,
      registryDir,
    },
  );
  const reviewPayload = reviewResult.payload;
  assertCompactCliWorkflowPayload(
    reviewPayload,
    "review",
    reviewResult.exitCode,
    "salt-ds review did not return the shipped compact workflow contract.",
  );

  const newProjectPackageJsonPath = path.join(newProjectRoot, "package.json");
  const newProjectPackageJson = JSON.parse(
    await fs.readFile(newProjectPackageJsonPath, "utf8"),
  );
  await fs.writeFile(
    newProjectPackageJsonPath,
    `${JSON.stringify(
      {
        ...newProjectPackageJson,
        dependencies: {
          ...newProjectPackageJson.dependencies,
          "@salt-ds/core": "^2.0.0",
        },
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  await fs.writeFile(
    path.join(newProjectRoot, "src", "Deprecated.tsx"),
    [
      'import { Button } from "@salt-ds/core";',
      "",
      "export function Deprecated() {",
      '  return <Button variant="cta">Go</Button>;',
      "}",
      "",
    ].join("\n"),
    "utf8",
  );

  const reviewFixResult = await runSaltJson(
    newProjectRoot,
    ["review", "src/Deprecated.tsx"],
    {
      acceptableExitCodes: [0, 10, 20, 30],
      cliBin: installedCliBin,
      registryDir,
    },
  );
  assertCompactCliWorkflowPayload(
    reviewFixResult.payload,
    "review",
    reviewFixResult.exitCode,
    "salt-ds review did not return the shipped compact workflow contract for a deterministic-fix case.",
  );
  const unchangedDeprecatedSource = await fs.readFile(
    path.join(newProjectRoot, "src", "Deprecated.tsx"),
    "utf8",
  );
  assert(
    unchangedDeprecatedSource.includes('variant="cta"'),
    "salt-ds review should return fix candidates without mutating the source file directly.",
  );

  const translatePayload = await runSaltJson(
    nonSaltRoot,
    [
      "migrate",
      "Build a sidebar with vertical navigation, a main content area, a toolbar, and a modal dialog for confirmation with loading and error states.",
    ],
    {
      acceptableExitCodes: [0, 10, 20, 30],
      cliBin: installedCliBin,
      registryDir,
    },
  );
  assertCompactCliWorkflowPayload(
    translatePayload.payload,
    "migrate",
    translatePayload.exitCode,
    "salt-ds migrate did not return the shipped compact workflow contract.",
  );

  const comparePayload = await runSaltJson(
    existingSaltRoot,
    ["upgrade", "--include-deprecations"],
    {
      acceptableExitCodes: [0, 10, 20, 30],
      cliBin: installedCliBin,
      registryDir,
    },
  );
  assertCompactCliWorkflowPayload(
    comparePayload.payload,
    "upgrade",
    comparePayload.exitCode,
    "salt-ds upgrade did not return the shipped compact workflow contract.",
  );

  const verifyResult = await runSaltJson(
    existingSaltRoot,
    ["review", "src", "--url", runtimeUrl, "--mode", "fetched-html"],
    {
      acceptableExitCodes: [0, 10, 20, 30],
      cliBin: installedCliBin,
      registryDir,
    },
  );
  assertCompactCliWorkflowPayload(
    verifyResult.payload,
    "review",
    verifyResult.exitCode,
    "salt-ds review --url did not return the shipped compact workflow contract.",
  );
}

export async function runMcpWorkflowCoverage(installRoot, rootDir) {
  console.log("Checking workflow coverage through the installed MCP server...");
  const installedMcpBinPath = getInstalledMcpBin(installRoot);
  assert(
    await pathExists(installedMcpBinPath),
    `Expected installed MCP bin at ${installedMcpBinPath}.`,
  );

  const client = new Client(
    { name: "salt-consumer-smoke", version: "0.0.0" },
    { capabilities: {} },
  );
  const transport = new SmokeStdioClientTransport({
    command: process.execPath,
    args: [installedMcpBinPath, "serve"],
    cwd: rootDir,
  });

  try {
    await client.connect(transport);
    const tools = await client.listTools();

    const toolNames = tools.tools.map((tool) => tool.name).sort();
    for (const name of [
      "get_salt_project_context",
      "bootstrap_salt_repo",
      "create_salt_ui",
      "review_salt_ui",
      "migrate_to_salt",
      "upgrade_salt_ui",
    ]) {
      assert(
        toolNames.includes(name),
        `Installed MCP server did not advertise ${name}.`,
      );
    }

    const contextResult = await client.callTool({
      name: "get_salt_project_context",
      arguments: {
        root_dir: ".",
      },
    });
    const contextPayload = contextResult.structuredContent;
    assert(
      contextPayload?.workflow?.id === "get_salt_project_context" &&
        contextPayload?.result?.transport?.canonical_transport === "mcp" &&
        contextPayload?.result?.repo_signals?.salt_team_config_found === true,
      "Installed MCP server did not return the expected project-context payload through get_salt_project_context.",
    );
    assert(
      typeof contextPayload?.result?.context_id === "string" &&
        typeof contextPayload?.artifacts?.summary?.bootstrap_requirement
          ?.status === "string",
      "Installed MCP server did not return the expected context_id and bootstrap summary through get_salt_project_context.",
    );

    const chooseResult = await client.callTool({
      name: "create_salt_ui",
      arguments: {
        query: "link to another page",
        include_starter_code: true,
      },
    });
    const choosePayload = chooseResult.structuredContent;
    assertCompactMcpWorkflowPayload(
      choosePayload,
      "create",
      "Installed MCP server did not return a stable compact workflow payload through create_salt_ui.",
    );

    const translateResult = await client.callTool({
      name: "migrate_to_salt",
      arguments: {
        query:
          "Build a sidebar with vertical navigation, a main content area, a toolbar, and a modal dialog for confirmation with loading and error states.",
      },
    });
    const translatePayload = translateResult.structuredContent;
    assertCompactMcpWorkflowPayload(
      translatePayload,
      "migrate",
      "Installed MCP server did not return a stable compact workflow payload through migrate_to_salt.",
    );

    const analyzeResult = await client.callTool({
      name: "review_salt_ui",
      arguments: {
        code: [
          'import { Button } from "@salt-ds/core";',
          "",
          "export function Demo() {",
          '  return <Button href="/next">Go</Button>;',
          "}",
        ].join("\n"),
        framework: "react",
        package_version: "2.0.0",
      },
    });
    const analyzePayload = analyzeResult.structuredContent;
    assertCompactMcpWorkflowPayload(
      analyzePayload,
      "review",
      "Installed MCP server did not return a stable compact workflow payload through review_salt_ui.",
    );

    const compareResult = await client.callTool({
      name: "upgrade_salt_ui",
      arguments: {
        package: "@salt-ds/core",
        from_version: "1.1.0",
        include_deprecations: true,
      },
    });
    const comparePayload = compareResult.structuredContent;
    assertCompactMcpWorkflowPayload(
      comparePayload,
      "upgrade",
      "Installed MCP server did not return a stable compact workflow payload through upgrade_salt_ui.",
    );
  } catch (error) {
    const stderrOutput = transport.stderr.trim();
    if (stderrOutput.length > 0) {
      throw new Error(
        `Installed MCP server failed during smoke test.\nstderr:\n${stderrOutput}\n\n${error instanceof Error ? (error.stack ?? error.message) : error}`,
      );
    }
    throw error;
  } finally {
    await client.close();
  }
}
