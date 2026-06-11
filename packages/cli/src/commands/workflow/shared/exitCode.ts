import type {
  PublicContract,
  PublicWorkflowStatus,
} from "@salt-ds/semantic-core/tools/publicContract";
import type { RequiredCliIo } from "../../../types.js";

export type WorkflowExitCode = 0 | 10 | 20 | 30;

export function normalizeVersion(
  rawVersion: string | null | undefined,
): string | null {
  if (!rawVersion) {
    return null;
  }

  const match = rawVersion.match(/\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?/);
  return match?.[0] ?? null;
}

export function workflowStatusToExitCode(
  workflowStatus: PublicWorkflowStatus,
): WorkflowExitCode {
  switch (workflowStatus) {
    case "success":
      return 0;
    case "partial":
      return 10;
    case "blocked":
      return 20;
    case "failed":
      return 30;
  }
}

export function getWorkflowExitCode(
  contract: PublicContract,
): WorkflowExitCode {
  return workflowStatusToExitCode(contract.status);
}

export function shouldEmitCompactWorkflowJson(
  flags: Record<string, string>,
): boolean {
  return flags.json === "true" && flags.full !== "true";
}

export function rejectUnsupportedJsonVariant(
  workflow: "create" | "review" | "migrate" | "upgrade",
  flags: Record<string, string>,
  io: RequiredCliIo,
): WorkflowExitCode | null {
  if (flags["starter-only"] !== "true") {
    return null;
  }

  if (workflow !== "create") {
    io.writeStderr(
      "--starter-only is only supported for `salt-ds create --json`.\n",
    );
    return 30;
  }

  if (flags.full === "true") {
    io.writeStderr(
      "--starter-only cannot be combined with --full. Use one explicit JSON contract or the other.\n",
    );
    return 30;
  }

  if (flags.json !== "true") {
    io.writeStderr(
      "--starter-only is only supported with --json so the narrow create artifact contract stays explicit.\n",
    );
    return 30;
  }

  return null;
}
