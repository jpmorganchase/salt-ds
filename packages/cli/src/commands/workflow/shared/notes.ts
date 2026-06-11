import type { LintCommandResult, SaltInfoResult } from "../../../types.js";

export function buildReviewNotes(
  context: SaltInfoResult,
  lint: LintCommandResult,
  runtimeRequested: boolean,
): string[] {
  const notes = [...context.notes, ...lint.notes];
  if (!context.policy.teamConfigPath && !context.policy.stackConfigPath) {
    notes.push(
      "No .salt/team.json or .salt/stack.json is declared. Review results use canonical Salt guidance only unless durable repo policy is added later.",
    );
  }
  if (runtimeRequested) {
    notes.push(
      "Runtime evidence was requested through salt-ds review --url and evaluated after the source pass.",
    );
  } else if (context.runtime.detectedTargets.length > 0) {
    notes.push(
      `Use salt-ds review --url ${context.runtime.detectedTargets[0].url} if rendered behavior still needs runtime evidence.`,
    );
  } else {
    notes.push(
      "No detected runtime target. Run salt-ds doctor if runtime evidence is still needed after source review.",
    );
  }

  return Array.from(new Set(notes));
}
