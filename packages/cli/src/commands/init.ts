import fs from "node:fs/promises";
import path from "node:path";
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

const REPO_INSTRUCTIONS_TEMPLATE = [
  "Use the Salt MCP for canonical Salt guidance.",
  "",
  "Treat requests to build, refine, restyle, or structurally fix UI in this repo as Salt UI tasks by default when they touch dashboards, metrics, navigation, forms, dialogs, tables, layouts, or alignment/composition fixes on existing Salt UI.",
  "",
  "Do not complete Salt UI tasks with generic React/CSS output if a canonical Salt option exists.",
  "",
  "For Salt UI tasks, complete:",
  "",
  "- a selection step through Salt MCP or the Salt CLI fallback",
  "- a validation step through `analyze_salt_code` or `salt-ds review`",
  "- if the workflow output says stronger grounding is needed, follow the returned canonical Salt follow-up before editing",
  "",
  "If Salt MCP is unavailable and the Salt CLI is available, keep the same workflow and let the environment use the CLI fallback for canonical Salt guidance.",
  "",
  "If a Salt MCP response sets `guidance_boundary.project_conventions.check_recommended` to `true`:",
  "",
  "- read `.salt/team.json` if it exists",
  "- if `.salt/stack.json` also exists, resolve layers in that order instead",
  "- let project conventions override the final project answer",
  "- keep the canonical Salt choice visible as provenance",
  "",
  "Default to `.salt/team.json` for simple repos. Add `.salt/stack.json` only when shared upstream layers or explicit merge ordering are real.",
  "",
].join("\n");

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
      "Keep canonical Salt guidance visible when a project convention changes the final answer.",
      "Record only durable repo rules backed by code or docs evidence.",
    ],
  };
}

function parseConventionsPackSource(rawValue: string | undefined): {
  requested: boolean;
  packageSource: string | null;
  packageSpecifier: string | null;
  exportName: string | null;
} {
  if (!rawValue) {
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

  const [packageSpecifier, ...rest] = rawValue.split("#");
  const exportName = rest.join("#").trim();
  return {
    requested: true,
    packageSource: rawValue.trim(),
    packageSpecifier: packageSpecifier.trim() || null,
    exportName: exportName.length > 0 ? exportName : null,
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

function hasBootstrapInstructions(content: string): boolean {
  return (
    content.includes(
      "guidance_boundary.project_conventions.check_recommended",
    ) || content.includes("read `.salt/team.json` if it exists")
  );
}

function mergeRepoInstructions(existingContent: string): string {
  const trimmed = existingContent.trimEnd();
  if (trimmed.length === 0) {
    return REPO_INSTRUCTIONS_TEMPLATE;
  }

  return `${trimmed}\n\n${REPO_INSTRUCTIONS_TEMPLATE}`;
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
    );
    const projectName = await detectProjectName(
      rootDir,
      initialContext.packageJsonPath,
      flags.project,
    );
    const conventionsPack = parseConventionsPackSource(
      flags["conventions-pack"],
    );
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
      if (!hasBootstrapInstructions(existingContent)) {
        await fs.writeFile(
          instructionPath,
          `${mergeRepoInstructions(existingContent)}\n`,
          "utf8",
        );
        repoInstructionAction = "updated";
      }
    } else {
      await fs.mkdir(path.dirname(instructionPath), { recursive: true });
      await fs.writeFile(instructionPath, REPO_INSTRUCTIONS_TEMPLATE, "utf8");
      repoInstructionAction = "created";
    }

    const context = await collectSaltInfo(rootDir, flags["registry-dir"]);
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
        nextStep:
          context.policy.mode === "stack"
            ? conventionsPack.requested
              ? "Bootstrap is complete. Review the layered conventions stack, confirm the shared conventions pack if needed, then continue with salt-ds create or salt-ds review."
              : "Layered Salt policy already exists. Review the existing stack, then continue with salt-ds create or salt-ds review."
            : "Bootstrap is complete. Continue with salt-ds create for new UI or salt-ds review for existing Salt code.",
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
          ...(repoInstructionAction === "created"
            ? [`Created repo instructions at ${toPosix(instructionPath)}.`]
            : repoInstructionAction === "updated"
              ? [
                  `Updated repo instructions at ${toPosix(instructionPath)} with the Salt bootstrap snippet.`,
                ]
              : [
                  "Repo instructions already contained the Salt bootstrap guidance.",
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
