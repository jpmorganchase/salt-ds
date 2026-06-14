import type { PublicSuggestedFollowUp } from "./types.js";

const PUBLIC_CLI_FOLLOW_UP_WORKFLOWS = new Set([
  "info",
  "create",
  "review",
  "migrate",
  "upgrade",
]);

function toPublicCliWorkflowId(workflow: string): string | null {
  switch (workflow) {
    case "get_salt_project_context":
      return "info";
    case "create_salt_ui":
      return "create";
    case "review_salt_ui":
      return "review";
    case "migrate_to_salt":
      return "migrate";
    case "upgrade_salt_ui":
      return "upgrade";
    default:
      return PUBLIC_CLI_FOLLOW_UP_WORKFLOWS.has(workflow) ? workflow : null;
  }
}

export function toPublicCliSuggestedFollowUps(
  followUps: PublicSuggestedFollowUp[] | undefined,
): PublicSuggestedFollowUp[] | undefined {
  if (!followUps) {
    return undefined;
  }

  const normalized: PublicSuggestedFollowUp[] = [];

  for (const followUp of followUps) {
    const workflow = toPublicCliWorkflowId(followUp.workflow);
    if (!workflow) {
      continue;
    }

    const key = `${workflow}:${JSON.stringify(followUp.args ?? {})}`;
    if (
      normalized.some(
        (entry) =>
          `${entry.workflow}:${JSON.stringify(entry.args ?? {})}` === key,
      )
    ) {
      continue;
    }

    normalized.push({
      ...followUp,
      workflow,
    });
  }

  return normalized.length > 0 ? normalized : undefined;
}
