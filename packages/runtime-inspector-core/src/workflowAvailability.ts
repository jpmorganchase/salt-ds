import type { SaltInstallationHealthSummary } from "./schemas.js";

export type RepoAwareSaltWorkflow = "create" | "review" | "migrate" | "upgrade";

type BlockingWorkflow =
  SaltInstallationHealthSummary["blockingWorkflows"][number];

function toBlockedSet(
  blockingWorkflows: BlockingWorkflow[],
): Set<BlockingWorkflow> {
  return new Set(blockingWorkflows);
}

export function isRepoAwareSaltWorkflowAvailable(
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
    upgrade: isRepoAwareSaltWorkflowAvailable("upgrade", blockingWorkflows),
  };
}

export function buildRepoAwareSaltWorkflowReadiness(input: {
  blockingWorkflows: BlockingWorkflow[];
  repoAwareBootstrapReady: boolean;
}): Record<RepoAwareSaltWorkflow, boolean> {
  const availability = buildRepoAwareSaltWorkflowAvailability(
    input.blockingWorkflows,
  );

  if (!input.repoAwareBootstrapReady) {
    return {
      create: false,
      review: false,
      migrate: false,
      upgrade: false,
    };
  }

  return availability;
}
