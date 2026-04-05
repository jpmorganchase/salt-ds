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

  return {
    workflow: {
      id: "create_salt_ui" as const,
      transport_used: "mcp" as const,
      implementation_gate,
      ...workflow,
    },
    result: {
      ...domainResult,
      ide_summary,
      final_decision: {
        name: repo_refinement?.final_name ?? result.decision.name,
        source: repo_refinement?.source ?? "canonical_salt",
      },
    },
    artifacts: {
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

  return {
    workflow: {
      id: "review_salt_ui" as const,
      transport_used: "mcp" as const,
      ...workflow,
    },
    result: {
      ...domainResult,
      ide_summary,
      decision,
      summary: {
        ...domainResult.summary,
        fix_count: domainResult.summary.fix_count + projectPolicyFixCount,
      },
    },
    artifacts: {
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

  return {
    workflow: {
      id: "migrate_to_salt" as const,
      transport_used: "mcp" as const,
      ...workflow,
    },
    result: {
      ...domainResult,
      ide_summary,
    },
    artifacts: {
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
  } = {},
) {
  const contract = buildUpgradeSaltUiWorkflowContract(result, input);
  const { ide_summary, rule_ids, ...workflow } = contract;
  const { raw, ...domainResult } = result;

  return {
    workflow: {
      id: "upgrade_salt_ui" as const,
      transport_used: "mcp" as const,
      ...workflow,
    },
    result: {
      ...domainResult,
      ide_summary,
    },
    artifacts: {
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
  } = {},
) {
  return buildCreateWorkflowEnvelope(registry, result, input);
}

export function withAnalyzeWorkflowGuidance(
  result: ReviewSaltUiResult,
  input: {
    code?: string;
    project_policy?: WorkflowProjectPolicyArtifact | null;
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
  } = {},
) {
  return buildMigrateWorkflowEnvelope(registry, result, input);
}

export function withCompareWorkflowGuidance(
  result: UpgradeSaltUiResult,
  input: {
    project_policy?: WorkflowProjectPolicyArtifact | null;
  } = {},
) {
  return buildUpgradeWorkflowEnvelope(result, input);
}
