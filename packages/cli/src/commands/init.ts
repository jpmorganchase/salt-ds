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
import { pathExists, writeJsonFile } from "../lib/common.js";
import { collectSaltInfo } from "../lib/infoContext.js";
import type { RequiredCliIo, SaltInfoResult } from "../types.js";

interface InitWorkflowResult {
  workflow: "init";
  rootDir: string;
  projectName: string;
  context: SaltInfoResult;
  policy: {
    path: string | null;
    action: "created" | "unchanged" | "skipped-layered";
    mode: SaltInfoResult["policy"]["mode"];
  };
  stack: {
    path: string | null;
    action: "created" | "unchanged" | "not-requested";
    conventionsPackSource: string | null;
  };
  repoInstructions: {
    path: string;
    filename: "AGENTS.md" | "CLAUDE.md" | null;
    action: "created" | "updated" | "unchanged";
  };
  summary: {
    readyForCreate: boolean;
    nextStep: string;
  };
  notes: string[];
}

function toPosix(inputPath: string): string {
  return inputPath.split(path.sep).join("/");
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
      // Ignore invalid package.json here and fall back to the directory name.
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
      "Repo-aware Salt workflows apply declared project conventions automatically after bootstrap. Do not reimplement merge logic in normal consumer repos.",
      "Keep canonical Salt guidance visible when a project convention changes the final answer.",
      "Record only durable repo rules backed by code or docs evidence.",
    ],
  };
}

function parseConventionsPackSource(
  createStack: boolean | undefined,
  rawValue: string | undefined,
): {
  requested: boolean;
  packageSource: string | null;
  packageSpecifier: string | null;
  exportName: string | null;
} {
  if (!createStack && !rawValue) {
    return {
      requested: false,
      packageSource: null,
      packageSpecifier: null,
      exportName: null,
    };
  }

  if (rawValue === "true") {
    return {
      requested: true,
      packageSource: null,
      packageSpecifier: null,
      exportName: null,
    };
  }

  if (!rawValue || rawValue.trim().length === 0) {
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
    packageSource: rawValue.trim(),
    packageSpecifier: packageSpecifier.trim() || null,
    exportName: exportName.length > 0 ? exportName : null,
  };
}

function parseHostAdapters(rawValue: string | undefined): Set<"vscode"> {
  const adapters = new Set<"vscode">();
  if (!rawValue) {
    return adapters;
  }

  for (const candidate of rawValue.split(",")) {
    if (candidate.trim() === "vscode") {
      adapters.add("vscode");
    }
  }

  return adapters;
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
          "Repo-aware Salt workflows apply the declared layer order automatically after bootstrap.",
          "Each referenced layer still uses project_conventions_v1.",
        ]
      : [
          "Conventions-pack bootstrap: add a shared package-backed layer above the repo-local team layer when the upstream pack is known.",
          "Repo-aware Salt workflows apply the declared layer order automatically after bootstrap.",
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

function formatInitReport(result: InitWorkflowResult): string {
  return [
    "Salt DS Init",
    `Root: ${result.rootDir}`,
    `Project: ${result.projectName}`,
    `Policy: ${result.policy.action}${result.policy.path ? ` (${result.policy.path})` : ""}`,
    `Stack: ${result.stack.action}${result.stack.path ? ` (${result.stack.path})` : ""}`,
    `Repo instructions: ${result.repoInstructions.action} (${result.repoInstructions.path})`,
    `Next step: ${result.summary.nextStep}`,
  ]
    .join("\n")
    .concat("\n");
}

function buildStackNextStep(input: {
  policyMode: SaltInfoResult["policy"]["mode"];
  conventionsPackRequested: boolean;
  conventionsPackSource: string | null;
}): string {
  if (input.policyMode !== "stack") {
    return "Bootstrap is complete. Continue with salt-ds create for new UI. Repo-aware Salt workflows will apply declared project conventions automatically, and you should validate with salt-ds review or the repo ui:verify script when it exists.";
  }

  if (!input.conventionsPackRequested) {
    return "Layered Salt policy already exists. Run salt-ds info --json to verify the stack before continuing with salt-ds create. Repo-aware Salt workflows will apply the declared layer order automatically, and you should validate with salt-ds review or the repo ui:verify script when it exists.";
  }

  if (!input.conventionsPackSource) {
    return "Bootstrap is complete. Add the shared conventions pack, run salt-ds info --json to verify the layered stack, then continue with salt-ds create. Repo-aware Salt workflows will apply the declared layer order automatically, and you should validate with salt-ds review or the repo ui:verify script when it exists.";
  }

  return "Bootstrap is complete. Run salt-ds info --json to verify the layered conventions stack and shared pack resolution, then continue with salt-ds create. Repo-aware Salt workflows will apply the declared layer order automatically, and you should validate with salt-ds review or the repo ui:verify script when it exists.";
}

function buildSharedPackVerificationNotes(
  context: SaltInfoResult,
  conventionsPack: ReturnType<typeof parseConventionsPackSource>,
): string[] {
  if (context.policy.mode !== "stack") {
    return [];
  }

  const notes: string[] = [
    conventionsPack.packageSource
      ? "Run salt-ds info --json to verify the layered conventions stack and shared conventions pack resolution before starting create or review."
      : "Run salt-ds info --json to verify the layered stack before starting create or review.",
  ];

  const packDetails = context.policy.sharedConventions.packDetails;
  if (packDetails.length === 0) {
    return conventionsPack.requested
      ? [
          ...notes,
          ...(conventionsPack.packageSource
            ? []
            : [
                "Add the shared conventions pack before relying on the layered stack for shared upstream policy.",
              ]),
        ]
      : notes;
  }

  return [
    ...notes,
    ...packDetails.map((detail) => {
      if (
        detail.status === "resolved" &&
        (!detail.compatibility || detail.compatibility.status === "compatible")
      ) {
        return `Verified shared conventions pack ${detail.source}${detail.packId ? ` (${detail.packId})` : ""}${detail.resolvedPath ? ` at ${detail.resolvedPath}` : ""}.`;
      }

      return (
        detail.reason ??
        detail.compatibility?.reason ??
        `Shared conventions pack ${detail.source} still needs verification.`
      );
    }),
  ];
}

export async function runInitCommand(
  positionals: string[],
  flags: Record<string, string>,
  io: RequiredCliIo,
): Promise<number> {
  try {
    const rootDir = path.resolve(io.cwd, positionals[0] ?? ".");
    const initialContext = await collectSaltInfo(
      rootDir,
      flags["registry-dir"],
      {
        policyDetail: "resolved",
      },
    );
    const projectName = await detectProjectName(
      rootDir,
      initialContext.packageJsonPath,
      flags.project,
    );
    const createStack = flags["create-stack"] === "true";
    const conventionsPack = parseConventionsPackSource(
      createStack,
      flags["conventions-pack"],
    );
    const hostAdapters = parseHostAdapters(flags["host-adapters"]);
    const addUiVerify = flags["add-ui-verify"] === "true";
    const teamConfigPath = path.join(rootDir, ".salt", "team.json");
    const stackConfigPath = path.join(rootDir, ".salt", "stack.json");
    const stackConfigExists = await pathExists(stackConfigPath);

    let policyAction: InitWorkflowResult["policy"]["action"] = "unchanged";
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

    let stackAction: InitWorkflowResult["stack"]["action"] = "not-requested";
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
      initialContext.repoInstructions.path != null
        ? path.resolve(rootDir, initialContext.repoInstructions.path)
        : path.join(rootDir, "AGENTS.md");
    let repoInstructionAction: InitWorkflowResult["repoInstructions"]["action"] =
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
    const verifyScript = addUiVerify
      ? await ensureUiVerifyScript(rootDir)
      : null;

    const context = await collectSaltInfo(rootDir, flags["registry-dir"], {
      policyDetail: "resolved",
    });
    const result: InitWorkflowResult = {
      workflow: "init",
      rootDir: context.rootDir,
      projectName,
      context,
      policy: {
        path:
          context.policy.teamConfigPath ??
          (policyAction === "created" ? toPosix(teamConfigPath) : null),
        action: policyAction,
        mode: context.policy.mode,
      },
      stack: {
        path:
          context.policy.stackConfigPath ??
          (stackAction === "created" ? toPosix(stackConfigPath) : null),
        action: stackAction,
        conventionsPackSource: conventionsPack.packageSource,
      },
      repoInstructions: {
        path: context.repoInstructions.path ?? toPosix(instructionPath),
        filename:
          context.repoInstructions.filename ??
          inferInstructionFilename(instructionPath),
        action: repoInstructionAction,
      },
      summary: {
        readyForCreate:
          context.policy.mode === "team" || context.policy.mode === "stack",
        nextStep: buildStackNextStep({
          policyMode: context.policy.mode,
          conventionsPackRequested: conventionsPack.requested,
          conventionsPackSource: conventionsPack.packageSource,
        }),
      },
      notes: Array.from(
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
                  : `Created layered Salt policy at ${toPosix(stackConfigPath)}. Add the shared conventions pack when it is known.`,
              ]
            : stackAction === "unchanged"
              ? [
                  "Layered Salt policy already existed. Left the existing stack manifest unchanged.",
                ]
              : []),
          ...buildSharedPackVerificationNotes(context, conventionsPack),
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
              : copilotInstructionsAction === null
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
                : saltUiAgentAction === null
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
                ? [
                    `ui:verify already existed in ${verifyScript.packageJsonPath}.`,
                  ]
                : verifyScript?.action === "skipped_no_package_json"
                  ? [
                      "No package.json was found, so ui:verify was not scaffolded.",
                    ]
                  : verifyScript == null
                    ? []
                    : [
                        `Skipped ui:verify scaffolding because ${verifyScript.packageJsonPath} could not be parsed.`,
                      ]),
        ]),
      ),
    };

    const outputPath = flags.output
      ? path.resolve(io.cwd, flags.output)
      : undefined;
    if (outputPath) {
      await writeJsonFile(outputPath, result);
    }

    if (flags.json === "true") {
      io.writeStdout(`${JSON.stringify(result, null, 2)}\n`);
    } else {
      io.writeStdout(formatInitReport(result));
      if (outputPath) {
        io.writeStdout(`Wrote JSON report to ${outputPath}\n`);
      }
    }

    return 0;
  } catch (error) {
    io.writeStderr(
      `${error instanceof Error ? error.message : "Failed to initialize Salt DS workflow files."}\n`,
    );
    return 1;
  }
}
