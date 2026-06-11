import type { InitWorkflowResult } from "./types.js";

export function formatInitReport(result: InitWorkflowResult): string {
  return [
    "Salt DS Init",
    `Root: ${result.rootDir}`,
    `Project: ${result.projectName}`,
    `Policy: ${result.policy.action}${result.policy.path ? ` (${result.policy.path})` : ""}`,
    `Stack: ${result.stack.action}${result.stack.path ? ` (${result.stack.path})` : ""}`,
    `Repo instructions: ${result.repoInstructions.action} (${result.repoInstructions.path})`,
    ...(result.agentHooks.action !== "not_requested"
      ? [
          `Agent hooks: ${result.agentHooks.action}${result.agentHooks.path ? ` (${result.agentHooks.path})` : ""}`,
        ]
      : []),
    ...(result.aiSetup ? [`AI setup: ${result.aiSetup.status}`] : []),
    `Next step: ${result.summary.nextStep}`,
  ]
    .join("\n")
    .concat("\n");
}
