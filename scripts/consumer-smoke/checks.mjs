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
  const registryDir = path.join(repoRoot, "packages", "mcp", "generated");
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

  const createPayload = (
    await runSaltJson(
      newProjectRoot,
      [
        "create",
        "link to another page from a toolbar action",
        "--include-starter-code",
      ],
      {
        cliBin: installedCliBin,
        registryDir,
      },
    )
  ).payload;
  assert(
    typeof createPayload.workflow?.confidence?.level === "string" &&
      Array.isArray(createPayload.workflow?.confidence?.reasons) &&
      createPayload.workflow.confidence.reasons.length > 0,
    "salt-ds create did not return confidence guidance in the smoke test.",
  );
  assert(
    typeof createPayload.result?.summary?.decisionName === "string" &&
      createPayload.result.summary.decisionName.length > 0 &&
      Array.isArray(createPayload.result?.summary?.suggestedFollowUps) &&
      createPayload.result.summary.suggestedFollowUps.length > 0,
    "salt-ds create did not return a stable create workflow payload.",
  );
  assert(
    !Array.isArray(createPayload.artifacts?.notes) ||
      !createPayload.artifacts.notes.some((entry) =>
        entry.includes("No .salt/team.json detected yet"),
      ),
    "salt-ds create still reported missing conventions after salt-ds init bootstrapped the new-project repo.",
  );

  const reviewResult = await runSaltJson(
    existingSaltRoot,
    ["review", "src/App.tsx"],
    {
      acceptableExitCodes: [0, 2],
      cliBin: installedCliBin,
      registryDir,
    },
  );
  const reviewPayload = reviewResult.payload;
  assert(
    typeof reviewPayload.workflow?.confidence?.level === "string",
    "salt-ds review did not return confidence guidance in the smoke test.",
  );
  assert(
    reviewResult.exitCode === 2 &&
      reviewPayload.result?.summary?.filesNeedingAttention === 1,
    "salt-ds review did not report the expected source issues for the existing Salt repo.",
  );
  assert(
    reviewPayload.result?.sourceValidation?.files?.some(
      (file) =>
        file.relativePath === path.join("src", "App.tsx") &&
        file.issues?.some(
          (issue) => issue.id === "component-choice.navigation",
        ),
    ),
    "salt-ds review did not report the expected navigation issue for src/App.tsx.",
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
      acceptableExitCodes: [2],
      cliBin: installedCliBin,
      registryDir,
    },
  );
  assert(
    reviewFixResult.payload.workflow?.id === "review" &&
      reviewFixResult.payload.artifacts?.fixCandidates?.deterministicCount ===
        1 &&
      reviewFixResult.payload.result?.summary?.status === "needs_attention",
    "salt-ds review did not return the expected deterministic fix candidate in the new-project repo.",
  );
  const unchangedDeprecatedSource = await fs.readFile(
    path.join(newProjectRoot, "src", "Deprecated.tsx"),
    "utf8",
  );
  assert(
    unchangedDeprecatedSource.includes('variant="cta"'),
    "salt-ds review should return fix candidates without mutating the source file directly.",
  );

  const translatePayload = (
    await runSaltJson(
      nonSaltRoot,
      [
        "migrate",
        "Build a sidebar with vertical navigation, a main content area, a toolbar, and a modal dialog for confirmation with loading and error states.",
      ],
      {
        acceptableExitCodes: [0, 2],
        cliBin: installedCliBin,
        registryDir,
      },
    )
  ).payload;
  assert(
    typeof translatePayload.workflow?.confidence?.level === "string" &&
      Array.isArray(
        translatePayload.artifacts?.postMigrationVerification?.sourceChecks,
      ) &&
      translatePayload.artifacts.postMigrationVerification.sourceChecks.length >
        0,
    "salt-ds migrate did not return migration confidence and post-migration verification guidance.",
  );
  assert(
    translatePayload.workflow?.id === "migrate" &&
      translatePayload.result?.translation?.translations?.some(
        (entry) => entry.salt_target?.name === "Vertical navigation",
      ) &&
      /^(starter_validated|starter_needs_attention)$/.test(
        translatePayload.workflow?.readiness?.status ?? "",
      ),
    "salt-ds migrate did not produce the expected Vertical navigation mapping.",
  );

  const comparePayload = (
    await runSaltJson(existingSaltRoot, ["upgrade", "--include-deprecations"], {
      cliBin: installedCliBin,
      registryDir,
    })
  ).payload;
  assert(
    typeof comparePayload.workflow?.confidence?.level === "string",
    "salt-ds upgrade did not return confidence guidance in the smoke test.",
  );
  assert(
    comparePayload.result?.summary?.target === "@salt-ds/core" &&
      comparePayload.result?.summary?.fromVersion === "0.0.0-smoke",
    "salt-ds upgrade did not return the expected upgrade boundary.",
  );
  assert(
    Array.isArray(comparePayload.artifacts?.notes) &&
      comparePayload.artifacts.notes.some((entry) =>
        entry.includes("Inferred from-version 0.0.0-smoke"),
      ),
    "salt-ds upgrade did not explain the inferred source version.",
  );

  const verifyResult = await runSaltJson(
    existingSaltRoot,
    ["review", "src", "--url", runtimeUrl, "--mode", "fetched-html"],
    {
      acceptableExitCodes: [0, 2],
      cliBin: installedCliBin,
      registryDir,
    },
  );
  assert(
    verifyResult.payload.workflow?.id === "review" &&
      verifyResult.payload.result?.summary?.runtimeMode === "fetched-html",
    "salt-ds review --url did not attach the expected runtime evidence mode.",
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
    assert(
      choosePayload?.workflow?.id === "create_salt_ui" &&
        choosePayload?.workflow?.transport_used === "mcp" &&
        typeof choosePayload?.result?.decision?.name === "string" &&
        choosePayload.result.decision.name.length > 0 &&
        typeof choosePayload?.result?.final_decision?.name === "string",
      "Installed MCP server did not return a stable recommendation workflow payload through create_salt_ui.",
    );
    assert(
      typeof choosePayload?.workflow?.confidence?.level === "string",
      "Installed MCP server did not return workflow confidence through create_salt_ui.",
    );
    assert(
      !choosePayload?.artifacts?.suggested_follow_ups?.some(
        (entry) =>
          ![
            "get_salt_project_context",
            "bootstrap_salt_repo",
            "create_salt_ui",
            "review_salt_ui",
            "migrate_to_salt",
            "upgrade_salt_ui",
          ].includes(entry.workflow),
      ),
      "Installed MCP server still leaked non-public follow-up names through create_salt_ui.",
    );

    const translateResult = await client.callTool({
      name: "migrate_to_salt",
      arguments: {
        query:
          "Build a sidebar with vertical navigation, a main content area, a toolbar, and a modal dialog for confirmation with loading and error states.",
      },
    });
    const translatePayload = translateResult.structuredContent;
    assert(
      translatePayload?.workflow?.id === "migrate_to_salt" &&
        translatePayload?.workflow?.transport_used === "mcp" &&
        translatePayload?.result?.translations?.some(
          (entry) => entry.salt_target?.name === "Vertical navigation",
        ),
      "Installed MCP server did not return the expected Vertical navigation translation.",
    );
    assert(
      typeof translatePayload?.workflow?.confidence?.level === "string" &&
        Array.isArray(
          translatePayload?.artifacts?.post_migration_verification
            ?.source_checks,
        ),
      "Installed MCP server did not return migration confidence and verification guidance through migrate_to_salt.",
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
    assert(
      analyzePayload?.workflow?.id === "review_salt_ui" &&
        analyzePayload?.workflow?.transport_used === "mcp" &&
        analyzePayload?.result?.issues?.some(
          (issue) => issue.id === "component-choice.navigation",
        ),
      "Installed MCP server did not return the expected navigation issue through review_salt_ui.",
    );
    assert(
      typeof analyzePayload?.workflow?.confidence?.level === "string" &&
        Array.isArray(analyzePayload?.artifacts?.fix_candidates?.candidates),
      "Installed MCP server did not return review confidence and fix-candidate guidance through review_salt_ui.",
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
    assert(
      comparePayload?.workflow?.id === "upgrade_salt_ui" &&
        comparePayload?.result?.decision?.target === "@salt-ds/core" &&
        comparePayload?.result?.decision?.from_version === "1.1.0" &&
        Boolean(comparePayload?.result?.decision?.to_version),
      "Installed MCP server did not return the expected upgrade boundary through upgrade_salt_ui.",
    );
    assert(
      typeof comparePayload?.workflow?.confidence?.level === "string",
      "Installed MCP server did not return workflow confidence through upgrade_salt_ui.",
    );
    assert(
      Array.isArray(comparePayload?.result?.notes) &&
        comparePayload.result.notes[0]?.includes("to_version was not provided"),
      "Installed MCP server did not explain the inferred target version through upgrade_salt_ui.",
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
