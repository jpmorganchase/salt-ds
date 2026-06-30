import fs from "node:fs/promises";
import path from "node:path";
import { buildSaltAiSetupSummary } from "@salt-ds/semantic-core";
import {
  SALT_REPO_INSTRUCTIONS_TEMPLATE,
  upsertSaltRepoInstructions,
} from "@salt-ds/semantic-core/bootstrapScaffolding";
import { pathExists, writeJsonFile } from "../lib/common.js";
import { collectSaltInfo } from "../lib/infoContext.js";
import type { RequiredCliIo } from "../types.js";
import { ensureSaltAgentHooksManifest } from "./init/agentHooks.js";
import { formatInitReport } from "./init/format.js";
import {
  ensureCopilotInstructions,
  parseHostAdapters,
} from "./init/hostAdapters.js";
import {
  buildSharedPackVerificationNotes,
  buildStackNextStep,
} from "./init/nextStep.js";
import {
  buildPolicyTemplate,
  buildStackTemplate,
  parseConventionsPackSource,
} from "./init/policy.js";
import type { InitWorkflowResult } from "./init/types.js";
import { ensureUiVerifyScript } from "./init/uiVerify.js";
import {
  detectProjectName,
  inferInstructionFilename,
  toPosix,
} from "./init/utils.js";

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
    const aiSetupRequested = flags.ai === "true";
    const conventionsPack = parseConventionsPackSource(
      createStack,
      flags["conventions-pack"],
    );
    const hostAdapters = parseHostAdapters(flags["host-adapters"]);
    if (aiSetupRequested) {
      hostAdapters.add("vscode");
    }
    const addUiVerify = flags["add-ui-verify"] === "true" || aiSetupRequested;
    const addAgentHooks = flags["add-agent-hooks"] === "true";
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

    let stackAction: InitWorkflowResult["stack"]["action"] = "not_requested";
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
    const verifyScript = addUiVerify
      ? await ensureUiVerifyScript(rootDir)
      : null;
    const agentHooksResult = addAgentHooks
      ? await ensureSaltAgentHooksManifest(rootDir)
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
      agentHooks: agentHooksResult
        ? {
            path: agentHooksResult.path,
            action: agentHooksResult.action,
          }
        : ({
            path: null,
            action: "not_requested",
          } as const),
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
          ...(agentHooksResult?.action === "created"
            ? [
                `Created Salt agent hook manifest at ${agentHooksResult.path}. Enable .github/hooks in VS Code chat.hookFilesLocations to wire PostToolUse + SessionStart + Stop.`,
              ]
            : agentHooksResult?.action === "updated"
              ? [
                  `Updated ${agentHooksResult.path} to include the Salt PostToolUse, SessionStart, and Stop hook commands.`,
                ]
              : agentHooksResult?.action === "unchanged"
                ? [
                    `${agentHooksResult.path} already wired Salt PostToolUse, SessionStart, and Stop hook commands.`,
                  ]
                : []),
        ]),
      ),
      aiSetup: aiSetupRequested
        ? buildSaltAiSetupSummary({
            root_dir: context.rootDir,
            policy_mode: context.policy.mode,
            repo_instructions_path: context.repoInstructions.path,
            host_adapters: [...hostAdapters],
            ui_verify_command: verifyScript?.command ?? null,
            generated_context: null,
            include_release_gate: true,
          })
        : null,
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
