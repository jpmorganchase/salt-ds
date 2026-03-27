import fs from "node:fs/promises";
import path from "node:path";
import {
  SALT_REPO_INSTRUCTIONS_TEMPLATE,
  upsertMarkedBlock,
  upsertSaltRepoInstructions,
  VSCODE_COPILOT_BLOCK_END,
  VSCODE_COPILOT_BLOCK_START,
  VSCODE_COPILOT_INSTRUCTIONS_TEMPLATE,
  VSCODE_SALT_UI_AGENT_MARKER,
  VSCODE_SALT_UI_AGENT_TEMPLATE,
} from "@salt-ds/semantic-core/bootstrapScaffolding";
import type { SaltRegistry } from "../types.js";
import {
  buildSaltProjectContextId,
  collectSaltProjectContextData,
  type SaltProjectContextResult,
  toSaltProjectContextResult,
} from "./projectContext.js";

export interface BootstrapSaltRepoResult {
  workflow: {
    id: "bootstrap_salt_repo";
  };
  result: {
    context_id: string;
    root_dir: string;
    project_name: string;
    policy: {
      path: string | null;
      action: "created" | "unchanged" | "skipped-layered";
      mode: "none" | "team" | "stack";
    };
    stack: {
      path: string | null;
      action: "created" | "unchanged" | "not_requested";
      conventions_pack_source: string | null;
    };
    repo_instructions: {
      path: string;
      filename: "AGENTS.md" | "CLAUDE.md" | null;
      action: "created" | "updated" | "unchanged";
    };
    summary: {
      ready_for_repo_aware_workflows: boolean;
      recommended_next_tool:
        | "create_salt_ui"
        | "review_salt_ui"
        | "migrate_to_salt"
        | "upgrade_salt_ui"
        | null;
      next_step: string;
    };
  };
  artifacts: {
    project_context: SaltProjectContextResult;
    notes: string[];
  };
  sources: SaltProjectContextResult["sources"];
}

function toPosix(inputPath: string): string {
  return inputPath.split(path.sep).join("/");
}

async function pathExists(candidatePath: string): Promise<boolean> {
  try {
    await fs.access(candidatePath);
    return true;
  } catch {
    return false;
  }
}

async function detectProjectName(
  rootDir: string,
  packageJsonPath: string | null,
  explicitName?: string,
): Promise<string> {
  if (explicitName && explicitName.trim().length > 0) {
    return explicitName.trim();
  }

  if (packageJsonPath) {
    try {
      const packageJson = JSON.parse(
        await fs.readFile(packageJsonPath, "utf8"),
      ) as { name?: unknown };
      if (
        typeof packageJson.name === "string" &&
        packageJson.name.trim().length > 0
      ) {
        return packageJson.name.trim();
      }
    } catch {
      // Ignore invalid package.json and fall back to the directory name.
    }
  }

  return path.basename(rootDir);
}

function buildPolicyTemplate(projectName: string): Record<string, unknown> {
  return {
    contract: "project_conventions_v1",
    version: "1.0.0",
    project: projectName,
    preferred_components: [],
    approved_wrappers: [],
    pattern_preferences: [],
    banned_choices: [],
    notes: [
      "Start with .salt/team.json. Add .salt/stack.json only when shared upstream layers are real.",
      "Keep canonical Salt guidance visible when a project convention changes the final answer.",
      "Record only durable repo rules backed by code or docs evidence.",
    ],
  };
}

function buildStackTemplate(input: {
  projectName: string;
  packageSpecifier: string | null;
  exportName: string | null;
}): Record<string, unknown> {
  const layers: Array<Record<string, unknown>> = [];

  if (input.packageSpecifier) {
    layers.push({
      id: "org-defaults",
      scope: "line_of_business",
      source: {
        type: "package",
        specifier: input.packageSpecifier,
        ...(input.exportName ? { export: input.exportName } : {}),
      },
    });
  }

  layers.push({
    id: "team-checkout",
    scope: "team",
    source: {
      type: "file",
      path: "./team.json",
    },
  });

  return {
    contract: "project_conventions_stack_v1",
    project: input.projectName,
    layers,
    notes: input.packageSpecifier
      ? [
          "Conventions-pack bootstrap: keep the shared package-backed layer first and the repo-local team layer last.",
          "Each referenced layer still uses project_conventions_v1.",
        ]
      : [
          "Conventions-pack bootstrap: add a shared package-backed layer above the repo-local team layer when the upstream pack is known.",
          "Each referenced layer still uses project_conventions_v1.",
        ],
  };
}

function inferInstructionFilename(
  instructionPath: string,
): "AGENTS.md" | "CLAUDE.md" | null {
  const baseName = path.basename(instructionPath);
  if (baseName === "AGENTS.md" || baseName === "CLAUDE.md") {
    return baseName;
  }

  return null;
}

function parseHostAdapters(
  rawValues: Array<"vscode"> | undefined,
): Set<"vscode"> {
  return new Set(rawValues ?? []);
}

async function ensureCopilotInstructions(
  rootDir: string,
): Promise<"created" | "updated" | "unchanged"> {
  const instructionsPath = path.join(
    rootDir,
    ".github",
    "copilot-instructions.md",
  );
  if (!(await pathExists(instructionsPath))) {
    await fs.mkdir(path.dirname(instructionsPath), { recursive: true });
    await fs.writeFile(
      instructionsPath,
      `${VSCODE_COPILOT_INSTRUCTIONS_TEMPLATE}\n`,
      "utf8",
    );
    return "created";
  }

  const existingContent = await fs.readFile(instructionsPath, "utf8");
  const nextContent = upsertMarkedBlock(
    existingContent,
    VSCODE_COPILOT_INSTRUCTIONS_TEMPLATE,
    VSCODE_COPILOT_BLOCK_START,
    VSCODE_COPILOT_BLOCK_END,
  );
  if (!nextContent.changed) {
    return "unchanged";
  }

  await fs.writeFile(instructionsPath, `${nextContent.content}\n`, "utf8");
  return "updated";
}

async function ensureSaltUiAgentFile(
  rootDir: string,
): Promise<"created" | "updated" | "unchanged" | "preserved_existing"> {
  const agentPath = path.join(rootDir, ".github", "agents", "salt-ui.agent.md");
  if (!(await pathExists(agentPath))) {
    await fs.mkdir(path.dirname(agentPath), { recursive: true });
    await fs.writeFile(agentPath, VSCODE_SALT_UI_AGENT_TEMPLATE, "utf8");
    return "created";
  }

  const existingContent = await fs.readFile(agentPath, "utf8");
  if (!existingContent.includes(VSCODE_SALT_UI_AGENT_MARKER)) {
    return "preserved_existing";
  }
  if (existingContent === VSCODE_SALT_UI_AGENT_TEMPLATE) {
    return "unchanged";
  }

  await fs.writeFile(agentPath, VSCODE_SALT_UI_AGENT_TEMPLATE, "utf8");
  return "updated";
}

async function ensureUiVerifyScript(rootDir: string): Promise<{
  action:
    | "created"
    | "unchanged"
    | "preserved_existing"
    | "skipped_no_package_json"
    | "skipped_invalid_package_json";
  packageJsonPath: string | null;
  command: string | null;
}> {
  const packageJsonPath = path.join(rootDir, "package.json");
  if (!(await pathExists(packageJsonPath))) {
    return {
      action: "skipped_no_package_json",
      packageJsonPath: null,
      command: null,
    };
  }

  let packageJson: Record<string, unknown>;
  try {
    packageJson = JSON.parse(
      await fs.readFile(packageJsonPath, "utf8"),
    ) as Record<string, unknown>;
  } catch {
    return {
      action: "skipped_invalid_package_json",
      packageJsonPath: toPosix(packageJsonPath),
      command: null,
    };
  }

  const reviewTarget = (await pathExists(path.join(rootDir, "src")))
    ? "src"
    : ".";
  const command = `salt-ds review ${reviewTarget}`;
  const scriptsValue = packageJson.scripts;
  const scripts =
    scriptsValue &&
    typeof scriptsValue === "object" &&
    !Array.isArray(scriptsValue)
      ? (scriptsValue as Record<string, unknown>)
      : {};
  const existingScript = scripts["ui:verify"];

  if (typeof existingScript === "string") {
    return {
      action: existingScript === command ? "unchanged" : "preserved_existing",
      packageJsonPath: toPosix(packageJsonPath),
      command: existingScript,
    };
  }

  packageJson.scripts = {
    ...scripts,
    "ui:verify": command,
  };
  await fs.writeFile(
    packageJsonPath,
    `${JSON.stringify(packageJson, null, 2)}\n`,
    "utf8",
  );
  return {
    action: "created",
    packageJsonPath: toPosix(packageJsonPath),
    command,
  };
}

function parseConventionsPackSource(
  createStack: boolean | undefined,
  conventionsPackSource?: string,
): {
  requested: boolean;
  packageSource: string | null;
  packageSpecifier: string | null;
  exportName: string | null;
} {
  const rawValue = conventionsPackSource?.trim();
  if (!createStack && !rawValue) {
    return {
      requested: false,
      packageSource: null,
      packageSpecifier: null,
      exportName: null,
    };
  }

  if (!rawValue) {
    return {
      requested: true,
      packageSource: null,
      packageSpecifier: null,
      exportName: null,
    };
  }

  const [packageSpecifier, ...rest] = rawValue.split("#");
  const exportName = rest.join("#").trim();
  return {
    requested: true,
    packageSource: rawValue,
    packageSpecifier: packageSpecifier.trim() || null,
    exportName: exportName.length > 0 ? exportName : null,
  };
}

function buildNextStep(input: {
  recommendedNextTool:
    | "create_salt_ui"
    | "review_salt_ui"
    | "migrate_to_salt"
    | "upgrade_salt_ui"
    | null;
}): string {
  if (!input.recommendedNextTool) {
    return "Bootstrap is complete, but Salt install health is still blocking repo-aware workflows. Resolve dependency health with salt-ds doctor or the recommended remediation before continuing.";
  }

  switch (input.recommendedNextTool) {
    case "review_salt_ui":
      return "Bootstrap is complete. Continue with the Salt review workflow for existing Salt code, and validate with salt-ds review or the repo ui:verify script when it exists.";
    case "migrate_to_salt":
      return "Bootstrap is complete. Continue with the Salt migration workflow for non-Salt UI adoption, and validate with salt-ds review or the repo ui:verify script when it exists.";
    case "upgrade_salt_ui":
      return "Bootstrap is complete. Continue with the Salt upgrade workflow for Salt upgrade planning, and validate with salt-ds review or the repo ui:verify script when it exists.";
    default:
      return "Bootstrap is complete. Continue with the Salt create workflow for new Salt work, and validate with salt-ds review or the repo ui:verify script when it exists.";
  }
}

export async function bootstrapSaltRepo(
  registry: SaltRegistry,
  input: {
    root_dir?: string;
    project_name?: string;
    create_stack?: boolean;
    conventions_pack_source?: string;
    host_adapters?: Array<"vscode">;
    add_ui_verify?: boolean;
  } = {},
): Promise<{
  context_id: string;
  context_data: Awaited<ReturnType<typeof collectSaltProjectContextData>>;
  result: BootstrapSaltRepoResult;
}> {
  const rootDir = path.resolve(process.cwd(), input.root_dir ?? ".");
  const initialContext = await collectSaltProjectContextData(registry, {
    root_dir: rootDir,
  });
  const projectName = await detectProjectName(
    rootDir,
    initialContext.package_json_path,
    input.project_name,
  );
  const conventionsPack = parseConventionsPackSource(
    input.create_stack,
    input.conventions_pack_source,
  );
  const hostAdapters = parseHostAdapters(input.host_adapters);
  const teamConfigPath = path.join(rootDir, ".salt", "team.json");
  const stackConfigPath = path.join(rootDir, ".salt", "stack.json");
  const stackConfigExists = await pathExists(stackConfigPath);

  let policyAction: BootstrapSaltRepoResult["result"]["policy"]["action"] =
    "unchanged";
  if (await pathExists(teamConfigPath)) {
    policyAction = "unchanged";
  } else if (stackConfigExists && !conventionsPack.requested) {
    policyAction = "skipped-layered";
  } else {
    await fs.mkdir(path.dirname(teamConfigPath), { recursive: true });
    await fs.writeFile(
      teamConfigPath,
      `${JSON.stringify(buildPolicyTemplate(projectName), null, 2)}\n`,
      "utf8",
    );
    policyAction = "created";
  }

  let stackAction: BootstrapSaltRepoResult["result"]["stack"]["action"] =
    "not_requested";
  if (conventionsPack.requested) {
    if (stackConfigExists) {
      stackAction = "unchanged";
    } else {
      await fs.mkdir(path.dirname(stackConfigPath), { recursive: true });
      await fs.writeFile(
        stackConfigPath,
        `${JSON.stringify(
          buildStackTemplate({
            projectName,
            packageSpecifier: conventionsPack.packageSpecifier,
            exportName: conventionsPack.exportName,
          }),
          null,
          2,
        )}\n`,
        "utf8",
      );
      stackAction = "created";
    }
  }

  const instructionPath =
    initialContext.repo_instructions.path != null
      ? path.resolve(rootDir, initialContext.repo_instructions.path)
      : path.join(rootDir, "AGENTS.md");
  let repoInstructionAction: BootstrapSaltRepoResult["result"]["repo_instructions"]["action"] =
    "unchanged";

  if (await pathExists(instructionPath)) {
    const existingContent = await fs.readFile(instructionPath, "utf8");
    const nextInstructions = upsertSaltRepoInstructions(existingContent);
    if (nextInstructions.changed) {
      await fs.writeFile(
        instructionPath,
        `${nextInstructions.content}\n`,
        "utf8",
      );
      repoInstructionAction = "updated";
    }
  } else {
    await fs.mkdir(path.dirname(instructionPath), { recursive: true });
    await fs.writeFile(
      instructionPath,
      SALT_REPO_INSTRUCTIONS_TEMPLATE,
      "utf8",
    );
    repoInstructionAction = "created";
  }

  const copilotInstructionsAction = hostAdapters.has("vscode")
    ? await ensureCopilotInstructions(rootDir)
    : null;
  const saltUiAgentAction = hostAdapters.has("vscode")
    ? await ensureSaltUiAgentFile(rootDir)
    : null;
  const verifyScript = input.add_ui_verify
    ? await ensureUiVerifyScript(rootDir)
    : null;

  const finalContext = await collectSaltProjectContextData(registry, {
    root_dir: rootDir,
  });
  const contextId = buildSaltProjectContextId(finalContext.root_dir);
  const projectContext = toSaltProjectContextResult(finalContext, contextId);
  const recommendedNextTool =
    projectContext.artifacts.summary.bootstrap_requirement
      .next_tool_after_bootstrap ??
    projectContext.artifacts.summary.recommended_next_tool;

  const notes = Array.from(
    new Set([
      ...(policyAction === "created"
        ? [`Created default Salt policy at ${toPosix(teamConfigPath)}.`]
        : policyAction === "skipped-layered"
          ? [
              "Detected .salt/stack.json and left the layered policy setup unchanged.",
            ]
          : [
              "Salt policy already existed. Left the existing policy file unchanged.",
            ]),
      ...(stackAction === "created"
        ? [
            conventionsPack.packageSource
              ? `Created layered Salt policy at ${toPosix(stackConfigPath)} with shared conventions pack ${conventionsPack.packageSource}.`
              : `Created layered Salt policy at ${toPosix(stackConfigPath)}.`,
          ]
        : stackAction === "unchanged"
          ? [
              "Layered Salt policy already existed. Left the existing stack manifest unchanged.",
            ]
          : []),
      ...(repoInstructionAction === "created"
        ? [`Created repo instructions at ${toPosix(instructionPath)}.`]
        : repoInstructionAction === "updated"
          ? [
              `Updated repo instructions at ${toPosix(instructionPath)} with the Salt bootstrap snippet.`,
            ]
          : [
              "Repo instructions already contained the Salt bootstrap guidance.",
            ]),
      ...(copilotInstructionsAction === "created"
        ? [
            "Created .github/copilot-instructions.md with the Salt workflow block for VS Code Copilot.",
          ]
        : copilotInstructionsAction === "updated"
          ? [
              "Updated .github/copilot-instructions.md with the Salt workflow block for VS Code Copilot.",
            ]
          : copilotInstructionsAction == null
            ? []
            : [
                "VS Code Copilot instructions already contained the Salt workflow block.",
              ]),
      ...(saltUiAgentAction === "created"
        ? [
            "Created .github/agents/salt-ui.agent.md as the VS Code Salt UI custom agent.",
          ]
        : saltUiAgentAction === "updated"
          ? [
              "Updated .github/agents/salt-ui.agent.md with the current Salt UI custom agent instructions.",
            ]
          : saltUiAgentAction === "preserved_existing"
            ? [
                "Left the existing .github/agents/salt-ui.agent.md unchanged because it is user-managed.",
              ]
            : saltUiAgentAction == null
              ? []
              : [
                  "VS Code Salt UI custom agent already existed with the current Salt workflow guidance.",
                ]),
      ...(verifyScript?.action === "created"
        ? [
            `Added ui:verify to ${verifyScript.packageJsonPath} using \`${verifyScript.command}\`.`,
          ]
        : verifyScript?.action === "preserved_existing"
          ? [
              `Left the existing ui:verify script in ${verifyScript.packageJsonPath} unchanged.`,
            ]
          : verifyScript?.action === "unchanged"
            ? [`ui:verify already existed in ${verifyScript.packageJsonPath}.`]
            : verifyScript?.action === "skipped_no_package_json"
              ? ["No package.json was found, so ui:verify was not scaffolded."]
              : verifyScript == null
                ? []
                : [
                    `Skipped ui:verify scaffolding because ${verifyScript.packageJsonPath} could not be parsed.`,
                  ]),
    ]),
  );

  return {
    context_id: contextId,
    context_data: finalContext,
    result: {
      workflow: {
        id: "bootstrap_salt_repo",
      },
      result: {
        context_id: contextId,
        root_dir: finalContext.root_dir,
        project_name: projectName,
        policy: {
          path:
            finalContext.policy.team_config_path ??
            (policyAction === "created" ? toPosix(teamConfigPath) : null),
          action: policyAction,
          mode: finalContext.policy.mode,
        },
        stack: {
          path:
            finalContext.policy.stack_config_path ??
            (stackAction === "created" ? toPosix(stackConfigPath) : null),
          action: stackAction,
          conventions_pack_source: conventionsPack.packageSource,
        },
        repo_instructions: {
          path: finalContext.repo_instructions.path ?? toPosix(instructionPath),
          filename:
            finalContext.repo_instructions.filename ??
            inferInstructionFilename(instructionPath),
          action: repoInstructionAction,
        },
        summary: {
          ready_for_repo_aware_workflows:
            (finalContext.policy.mode === "team" ||
              finalContext.policy.mode === "stack") &&
            finalContext.salt.installation.health_summary.blocking_workflows
              .length === 0,
          recommended_next_tool: recommendedNextTool,
          next_step: buildNextStep({
            recommendedNextTool,
          }),
        },
      },
      artifacts: {
        project_context: projectContext,
        notes,
      },
      sources: projectContext.sources,
    },
  };
}
