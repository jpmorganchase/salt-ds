import {
  buildSatisfiedWorkflowContextRequirement,
  type WorkflowConfidence as CoreWorkflowConfidence,
  type WorkflowReadiness as CoreWorkflowReadiness,
  type WorkflowCreateImplementationGate,
  type WorkflowStarterValidation,
} from "@salt-ds/semantic-core/tools/workflowContracts";
import type { WorkflowProjectConventionsSummary } from "../../../lib/projectConventionsWorkflow.js";
import type { SaltInfoResult } from "../../../types.js";
import type {
  PublicCreateRecommendation,
  WorkflowConfidence,
  WorkflowContextRequirement,
  WorkflowReadiness,
} from "./types.js";

export function buildCreateConfidence(
  recommendation: PublicCreateRecommendation,
  context: SaltInfoResult,
  projectConventions: WorkflowProjectConventionsSummary | null,
  starterValidation: WorkflowStarterValidation | null,
  implementationGate: WorkflowCreateImplementationGate,
): WorkflowConfidence {
  const reasons: string[] = [];
  const raiseConfidence: string[] = [];
  let level: WorkflowConfidence["level"] = "high";
  let askBeforeProceeding = false;

  if (recommendation.decision.name) {
    reasons.push("Canonical Salt guidance resolved a concrete starting point.");
  } else {
    level = "low";
    askBeforeProceeding = true;
    reasons.push(
      "The create workflow did not resolve a concrete Salt decision.",
    );
  }

  if (
    recommendation.ambiguity ||
    (recommendation.did_you_mean?.length ?? 0) > 0
  ) {
    level = "low";
    askBeforeProceeding = true;
    reasons.push("The request still has ambiguity that should be clarified.");
    raiseConfidence.push(
      "Clarify the target flow or entity before applying the create result.",
    );
  }

  if (recommendation.guidance_boundary.project_conventions.check_recommended) {
    if (projectConventions?.consulted) {
      reasons.push(
        projectConventions.applied
          ? "Repo policy refined the canonical Salt answer for this project."
          : "Repo policy was checked and kept the canonical Salt answer.",
      );
    } else {
      level = level === "low" ? "low" : "medium";
      reasons.push("Repo policy may still refine the canonical Salt answer.");
      raiseConfidence.push(
        "Check repo-local project conventions before implementation is locked.",
      );
    }
  }

  if (!context.policy.teamConfigPath && !context.policy.stackConfigPath) {
    level = level === "low" ? "low" : "medium";
    reasons.push("No declared Salt policy was found in the repo yet.");
    raiseConfidence.push(
      "Run salt-ds init if the repo still needs a default Salt policy file.",
    );
  }

  if ((projectConventions?.warnings.length ?? 0) > 0) {
    level = level === "low" ? "low" : "medium";
    reasons.push(
      "Project policy could not be fully resolved, so the canonical Salt answer may still need a manual policy check.",
    );
    const firstWarning = projectConventions?.warnings[0];
    if (firstWarning) {
      raiseConfidence.push(firstWarning);
    }
  }

  if ((recommendation.suggested_follow_ups?.length ?? 0) > 0) {
    raiseConfidence.push(
      "Ground the recommendation with examples or canonical entity details before editing.",
    );
  }

  if (implementationGate.status === "follow_through_required") {
    level = level === "low" ? "low" : "medium";
    reasons.push(
      "The create result still requires targeted Salt follow-through before named regions are implemented.",
    );
    if (implementationGate.next_step) {
      raiseConfidence.push(implementationGate.next_step);
    }
  }

  const openQuestions = recommendation.open_questions ?? [];
  if (openQuestions.length > 0) {
    level = level === "low" ? "low" : "medium";
    askBeforeProceeding = true;
    reasons.push(
      "The create result still has unresolved Salt implementation choices that should be confirmed before coding.",
    );
    raiseConfidence.push(...openQuestions.map((question) => question.prompt));
  }

  raiseConfidence.push(
    "If you name a specific Salt token, prop, or API, verify the exact name against canonical Salt guidance before editing.",
  );

  if (starterValidation?.status === "needs_attention") {
    level = level === "low" ? "low" : "medium";
    askBeforeProceeding = true;
    reasons.push(
      "The returned starter code still has Salt validation issues that should be corrected before editing continues.",
    );
    if (starterValidation.top_issue) {
      raiseConfidence.push(starterValidation.top_issue);
    }
    if (starterValidation.next_step) {
      raiseConfidence.push(starterValidation.next_step);
    }
  }

  return {
    level,
    reasons,
    askBeforeProceeding,
    raiseConfidence: Array.from(new Set(raiseConfidence)),
  };
}

export function toCliWorkflowReadiness(
  readiness: CoreWorkflowReadiness,
): WorkflowReadiness {
  return {
    status: readiness.status,
    implementationReady: readiness.implementation_ready,
    reason: readiness.reason,
  };
}

export function toCliStarterValidationStatus(
  readiness: WorkflowReadiness,
  starterValidation: WorkflowStarterValidation | null,
): "clean" | "needs_attention" | "not_run" {
  if (readiness.status === "guidance_only") {
    return "not_run";
  }

  if (readiness.status === "starter_needs_attention") {
    return "needs_attention";
  }

  return starterValidation?.status ?? "clean";
}

export function buildCliWorkflowSummaryNextStep(input: {
  readiness: WorkflowReadiness;
  defaultNextStep: string;
}): string {
  return input.readiness.status === "starter_needs_attention"
    ? input.readiness.reason
    : input.defaultNextStep;
}

export function toCliWorkflowConfidence(
  confidence: CoreWorkflowConfidence,
): WorkflowConfidence {
  return {
    level: confidence.level,
    reasons: confidence.reasons,
    askBeforeProceeding: confidence.ask_before_proceeding,
    raiseConfidence: confidence.raise_confidence,
  };
}

export function buildCliWorkflowContextRequirement(): WorkflowContextRequirement {
  const requirement = buildSatisfiedWorkflowContextRequirement();
  return {
    status: requirement.status,
    repoSpecificEditsReady: requirement.repo_specific_edits_ready,
    reason: requirement.reason,
    satisfiedBy:
      requirement.status === "context_checked"
        ? requirement.satisfied_by
        : null,
  };
}
