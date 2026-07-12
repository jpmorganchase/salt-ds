import type { SaltInstallationHealthSummary } from "./installationTypes.js";

type RepoAwareSaltWorkflow = "create" | "review" | "migrate";

type BlockingWorkflow =
  SaltInstallationHealthSummary["blockingWorkflows"][number];

function toBlockedSet(
  blockingWorkflows: BlockingWorkflow[],
): Set<BlockingWorkflow> {
  return new Set(blockingWorkflows);
}

function isRepoAwareSaltWorkflowAvailable(
  workflow: RepoAwareSaltWorkflow,
  blockingWorkflows: BlockingWorkflow[],
): boolean {
  if (workflow === "create") {
    return true;
  }

  return !toBlockedSet(blockingWorkflows).has(workflow);
}

export function buildRepoAwareSaltWorkflowAvailability(
  blockingWorkflows: BlockingWorkflow[],
): Record<RepoAwareSaltWorkflow, boolean> {
  return {
    create: isRepoAwareSaltWorkflowAvailable("create", blockingWorkflows),
    review: isRepoAwareSaltWorkflowAvailable("review", blockingWorkflows),
    migrate: isRepoAwareSaltWorkflowAvailable("migrate", blockingWorkflows),
  };
}
