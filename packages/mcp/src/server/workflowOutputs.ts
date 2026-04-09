import type { CreateSaltUiResult } from "@salt-ds/semantic-core/tools/createSaltUi";
import type { MigrateToSaltResult } from "@salt-ds/semantic-core/tools/migrateToSalt";
import type { ReviewSaltUiResult } from "@salt-ds/semantic-core/tools/reviewSaltUi";
import type {
  NormalizedVisualEvidenceInput,
  SourceUiOutlineInput,
} from "@salt-ds/semantic-core/tools/translation/sourceUiTypes";
import type { UpgradeSaltUiResult } from "@salt-ds/semantic-core/tools/upgradeSaltUi";
import type {
  WorkflowConfidence,
  WorkflowContextRequirement,
  WorkflowCreateIdeSummary,
  WorkflowCreateImplementationGate,
  WorkflowFixCandidate,
  WorkflowFixCandidates,
  WorkflowIntent,
  WorkflowIssueClass,
  WorkflowMigrateIdeSummary,
  WorkflowPostMigrationVerification,
  WorkflowProjectConventionsCheck,
  WorkflowProvenance,
  WorkflowReadiness,
  WorkflowReviewIdeSummary,
  WorkflowStarterValidation,
  WorkflowUpgradeIdeSummary,
  WorkflowVisualEvidenceContract,
} from "@salt-ds/semantic-core/tools/workflowContracts";
import {
  buildCreateSaltUiWorkflowContract,
  buildMigrateToSaltWorkflowContract,
  buildReviewSaltUiWorkflowContract,
  buildUpgradeSaltUiWorkflowContract,
} from "@salt-ds/semantic-core/tools/workflowContracts";
import type { WorkflowProjectPolicyArtifact } from "@salt-ds/semantic-core/tools/workflowProjectPolicy";
import { applyProjectPolicyToStarterCodeSnippets } from "@salt-ds/semantic-core/tools/workflowProjectPolicyApplication";
import type { SaltRegistry } from "@salt-ds/semantic-core/types";

export type ToolWorkflowConfidence = WorkflowConfidence;
export type ToolWorkflowReadiness = WorkflowReadiness;
export type ToolWorkflowContextRequirement = WorkflowContextRequirement;
export type ToolFixCandidate = WorkflowFixCandidate;
export type ToolFixCandidates = WorkflowFixCandidates;
export type ToolPostMigrationVerification = WorkflowPostMigrationVerification;
export type ToolVisualEvidenceContract = WorkflowVisualEvidenceContract;
export type ToolWorkflowIntent = WorkflowIntent;
export type ToolStarterValidation = WorkflowStarterValidation;
export type ToolIssueClass = WorkflowIssueClass;
export type ToolProjectConventionsCheck = WorkflowProjectConventionsCheck;
export type ToolWorkflowProvenance = WorkflowProvenance;
export type ToolCreateIdeSummary = WorkflowCreateIdeSummary;
export type ToolCreateImplementationGate = WorkflowCreateImplementationGate;
export type ToolMigrateIdeSummary = WorkflowMigrateIdeSummary;
export type ToolReviewIdeSummary = WorkflowReviewIdeSummary;
export type ToolUpgradeIdeSummary = WorkflowUpgradeIdeSummary;

const PUBLIC_MCP_WORKFLOWS = new Set([
  "get_salt_project_context",
  "bootstrap_salt_repo",
  "create_salt_ui",
  "review_salt_ui",
  "migrate_to_salt",
  "upgrade_salt_ui",
]);

function isAgentView(view?: "compact" | "full" | "agent"): boolean {
  return view === "agent";
}

function limitArray<T>(values: T[] | undefined, max: number): T[] | undefined {
  return values ? values.slice(0, max) : values;
}

function toPublicMcpSuggestedFollowUps(
  followUps:
    | CreateSaltUiResult["suggested_follow_ups"]
    | MigrateToSaltResult["suggested_follow_ups"],
): typeof followUps {
  if (!followUps) {
    return followUps;
  }

  const normalized = followUps.filter((followUp, index, all) => {
    if (!PUBLIC_MCP_WORKFLOWS.has(followUp.workflow)) {
      return false;
    }

    return (
      all.findIndex(
        (entry) =>
          entry.workflow === followUp.workflow &&
          JSON.stringify(entry.args ?? {}) ===
            JSON.stringify(followUp.args ?? {}),
      ) === index
    );
  });

  return normalized.length > 0 ? normalized : undefined;
}

function buildCreateWorkflowEnvelope(
  registry: SaltRegistry,
  result: CreateSaltUiResult,
  input: {
    query?: string;
    context_checked?: boolean;
    project_policy?: WorkflowProjectPolicyArtifact | null;
    view?: "compact" | "full" | "agent";
  } = {},
) {
  const starter_code = applyProjectPolicyToStarterCodeSnippets(
    result.starter_code,
    input.project_policy,
  );
  const contract = buildCreateSaltUiWorkflowContract(registry, result, {
    ...input,
    starter_code,
  });
  const {
    ide_summary,
    implementation_gate,
    starter_validation,
    repo_refinement,
    ...workflow
  } = contract;
  const {
    starter_code: _starterCode,
    suggested_follow_ups,
    related_guides,
    raw,
    ...domainResult
  } = result;

  const agentView = isAgentView(input.view);

  return {
    workflow: {
      id: "create_salt_ui" as const,
      transport_used: "mcp" as const,
      implementation_gate,
      ...workflow,
    },
    result: agentView
      ? {
          mode: domainResult.mode,
          solution_type: domainResult.solution_type,
          guidance_boundary: domainResult.guidance_boundary,
          ide_summary,
          decision: domainResult.decision,
          final_decision: {
            name: repo_refinement?.final_name ?? result.decision.name,
            source: repo_refinement?.source ?? "canonical_salt",
          },
          composition_contract: domainResult.composition_contract,
          open_questions: domainResult.open_questions,
          next_step: domainResult.next_step,
        }
      : {
          ...domainResult,
          ide_summary,
          final_decision: {
            name: repo_refinement?.final_name ?? result.decision.name,
            source: repo_refinement?.source ?? "canonical_salt",
          },
        },
    artifacts: agentView
      ? {
          suggested_follow_ups:
            toPublicMcpSuggestedFollowUps(suggested_follow_ups)?.slice(0, 2),
        }
      : {
          starter_code,
          starter_validation,
          project_policy: input.project_policy ?? null,
          repo_refinement,
          suggested_follow_ups: toPublicMcpSuggestedFollowUps(suggested_follow_ups),
          related_guides,
          raw,
        },
  };
}

function buildReviewWorkflowEnvelope(
  result: ReviewSaltUiResult,
  input: {
    code?: string;
    project_policy?: WorkflowProjectPolicyArtifact | null;
    view?: "compact" | "full" | "agent";
  } = {},
) {
  const contract = buildReviewSaltUiWorkflowContract(result, {
    code: input.code,
    project_policy: input.project_policy,
  });
  const {
    ide_summary,
    decision,
    fix_candidates,
    issue_classes,
    rule_ids,
    ...workflow
  } = contract;
  const { raw, ...domainResult } = result;
  const projectPolicyFixCount = fix_candidates.candidates.filter(
    (candidate) => candidate.category === "project-policy",
  ).length;

  const agentView = isAgentView(input.view);

  return {
    workflow: {
      id: "review_salt_ui" as const,
      transport_used: "mcp" as const,
      ...workflow,
    },
    result: agentView
      ? {
          guidance_boundary: domainResult.guidance_boundary,
          ide_summary,
          decision,
          summary: {
            ...domainResult.summary,
            fix_count: domainResult.summary.fix_count + projectPolicyFixCount,
          },
          missing_data: domainResult.missing_data,
          next_step: domainResult.next_step,
          source_urls: domainResult.source_urls,
        }
      : {
          ...domainResult,
          ide_summary,
          decision,
          summary: {
            ...domainResult.summary,
            fix_count: domainResult.summary.fix_count + projectPolicyFixCount,
          },
        },
    artifacts: agentView
      ? {
          fix_candidates: {
            ...fix_candidates,
            candidates: fix_candidates.candidates.slice(0, 2),
            notes: fix_candidates.notes.slice(0, 2),
          },
          issue_classes: issue_classes.slice(0, 2),
          rule_ids,
        }
      : {
          project_policy: input.project_policy ?? null,
          fix_candidates,
          issue_classes,
          rule_ids,
          raw,
        },
  };
}

function buildMigrateWorkflowEnvelope(
  registry: SaltRegistry,
  result: MigrateToSaltResult,
  input: {
    source_outline?: SourceUiOutlineInput;
    visual_evidence?: NormalizedVisualEvidenceInput[];
    context_checked?: boolean;
    project_policy?: WorkflowProjectPolicyArtifact | null;
    view?: "compact" | "full" | "agent";
  } = {},
) {
  const starter_code = applyProjectPolicyToStarterCodeSnippets(
    result.starter_code,
    input.project_policy,
  );
  const combined_scaffold = applyProjectPolicyToStarterCodeSnippets(
    result.combined_scaffold,
    input.project_policy,
  );
  const contract = buildMigrateToSaltWorkflowContract(registry, result, {
    ...input,
    starter_code,
  });
  const {
    ide_summary,
    starter_validation,
    rule_ids,
    post_migration_verification,
    visual_evidence_contract,
    ...workflow
  } = contract;
  const {
    starter_code: _starterCode,
    combined_scaffold: _combinedScaffold,
    suggested_follow_ups,
    related_guides,
    raw,
    ...domainResult
  } = result;

  const agentView = isAgentView(input.view);

  return {
    workflow: {
      id: "migrate_to_salt" as const,
      transport_used: "mcp" as const,
      ...workflow,
    },
    result: agentView
      ? {
          guidance_boundary: domainResult.guidance_boundary,
          ide_summary,
          source_profile: domainResult.source_profile,
          summary: domainResult.summary,
          translations: limitArray(domainResult.translations, 3) ?? [],
          migration_plan: limitArray(domainResult.migration_plan, 3) ?? [],
          migration_checkpoints:
            limitArray(domainResult.migration_checkpoints, 3) ?? [],
          next_step: domainResult.next_step,
          source_urls: domainResult.source_urls,
        }
      : {
          ...domainResult,
          ide_summary,
        },
    artifacts: agentView
      ? {
          starter_validation,
          rule_ids,
          post_migration_verification,
          visual_evidence_contract,
          suggested_follow_ups:
            toPublicMcpSuggestedFollowUps(suggested_follow_ups)?.slice(0, 2),
        }
      : {
          starter_code,
          combined_scaffold,
          starter_validation,
          project_policy: input.project_policy ?? null,
          rule_ids,
          post_migration_verification,
          visual_evidence_contract,
          suggested_follow_ups: toPublicMcpSuggestedFollowUps(suggested_follow_ups),
          related_guides,
          raw,
        },
  };
}

function buildUpgradeWorkflowEnvelope(
  result: UpgradeSaltUiResult,
  input: {
    project_policy?: WorkflowProjectPolicyArtifact | null;
    view?: "compact" | "full" | "agent";
  } = {},
) {
  const contract = buildUpgradeSaltUiWorkflowContract(result, input);
  const { ide_summary, rule_ids, ...workflow } = contract;
  const { raw, ...domainResult } = result;
  const agentView = isAgentView(input.view);

  return {
    workflow: {
      id: "upgrade_salt_ui" as const,
      transport_used: "mcp" as const,
      ...workflow,
    },
    result: agentView
      ? {
          mode: domainResult.mode,
          guidance_boundary: domainResult.guidance_boundary,
          decision: domainResult.decision,
          ide_summary,
          breaking: limitArray(domainResult.breaking, 3),
          important: limitArray(domainResult.important, 3),
          nice_to_know: limitArray(domainResult.nice_to_know, 3),
          next_steps: limitArray(domainResult.next_steps, 3),
          next_step: domainResult.next_step,
          docs: limitArray(domainResult.docs, 3),
        }
      : {
          ...domainResult,
          ide_summary,
        },
    artifacts: agentView
      ? {
          rule_ids,
        }
      : {
          rule_ids,
          raw,
        },
  };
}

export function withChooseWorkflowGuidance(
  registry: SaltRegistry,
  result: CreateSaltUiResult,
  input: {
    query?: string;
    context_checked?: boolean;
    project_policy?: WorkflowProjectPolicyArtifact | null;
    view?: "compact" | "full" | "agent";
  } = {},
) {
  return buildCreateWorkflowEnvelope(registry, result, input);
}

export function withAnalyzeWorkflowGuidance(
  result: ReviewSaltUiResult,
  input: {
    code?: string;
    project_policy?: WorkflowProjectPolicyArtifact | null;
    view?: "compact" | "full" | "agent";
  } = {},
) {
  return buildReviewWorkflowEnvelope(result, input);
}

export function withTranslateWorkflowGuidance(
  registry: SaltRegistry,
  result: MigrateToSaltResult,
  input: {
    source_outline?: SourceUiOutlineInput;
    visual_evidence?: NormalizedVisualEvidenceInput[];
    context_checked?: boolean;
    project_policy?: WorkflowProjectPolicyArtifact | null;
    view?: "compact" | "full" | "agent";
  } = {},
) {
  return buildMigrateWorkflowEnvelope(registry, result, input);
}

export function withCompareWorkflowGuidance(
  result: UpgradeSaltUiResult,
  input: {
    project_policy?: WorkflowProjectPolicyArtifact | null;
    view?: "compact" | "full" | "agent";
  } = {},
) {
  return buildUpgradeWorkflowEnvelope(result, input);
}
