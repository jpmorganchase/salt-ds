import {
  buildSaltReviewReport,
  type SaltReviewReportScope,
} from "@salt-ds/semantic-core";
import type { CreateSaltUiResult } from "@salt-ds/semantic-core/tools/createSaltUi";
import type { MigrateToSaltResult } from "@salt-ds/semantic-core/tools/migrateToSalt";
import {
  attachPublicContractDetails,
  buildCreatePublicContract,
  buildMigratePublicContract,
  buildReviewPublicContract,
} from "@salt-ds/semantic-core/tools/publicContract";
import type {
  ReviewExpectedTargets,
  ReviewSaltUiResult,
} from "@salt-ds/semantic-core/tools/reviewSaltUi";
import type {
  NormalizedVisualEvidenceInput,
  SourceUiOutlineInput,
} from "@salt-ds/semantic-core/tools/translation/sourceUiTypes";
import {
  buildCreateSaltUiWorkflowContract,
  buildMigrateToSaltWorkflowContract,
  buildReviewSaltUiWorkflowContract,
} from "@salt-ds/semantic-core/tools/workflowContracts";
import type { WorkflowProjectPolicyArtifact } from "@salt-ds/semantic-core/tools/workflowProjectPolicy";
import { applyProjectPolicyToStarterCodeSnippets } from "@salt-ds/semantic-core/tools/workflowProjectPolicyApplication";
import type { SaltRegistry } from "@salt-ds/semantic-core/types";

const PUBLIC_MCP_WORKFLOWS = new Set([
  "get_salt_project_context",
  "create_salt_ui",
  "review_salt_ui",
  "migrate_to_salt",
]);

function isFullView(view?: "compact" | "full"): boolean {
  return view === "full";
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
    package?: string;
    context_checked?: boolean;
    context_resolution_status?:
      | "resolved"
      | "fallback"
      | "needs_explicit_root"
      | "mismatch";
    context_retry_with_root_dir?: string | null;
    context_id?: string | null;
    project_policy?: WorkflowProjectPolicyArtifact | null;
    view?: "compact" | "full";
    salt_packages?: string[];
    package_manager?: string;
    resolved_entities?: string[];
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
  const compactContract = buildCreatePublicContract(result, contract, {
    transport_used: "mcp",
    registry,
    query: input.query,
    package: input.package,
    salt_packages: input.salt_packages,
    package_manager: input.package_manager,
    resolved_entities: input.resolved_entities,
  });

  if (!isFullView(input.view)) {
    return compactContract;
  }

  return attachPublicContractDetails(compactContract, {
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
  });
}

function buildReviewReportScope(
  result: ReviewSaltUiResult,
  input: {
    root_dir?: string | null;
    target?: string | null;
  },
): SaltReviewReportScope {
  const target = input.target?.trim() || "inline-code";

  return {
    root_dir: input.root_dir ?? null,
    targets: [target],
    file_count: 1,
    files: [
      {
        path: target,
        relative_path: target === "inline-code" ? null : target,
        status: result.decision.status,
        errors: result.summary.errors,
        warnings: result.summary.warnings,
        infos: result.summary.infos,
      },
    ],
  };
}

function buildReviewWorkflowEnvelope(
  registry: SaltRegistry,
  result: ReviewSaltUiResult,
  input: {
    code?: string;
    expected_targets?: ReviewExpectedTargets;
    project_policy?: WorkflowProjectPolicyArtifact | null;
    root_dir?: string | null;
    target?: string | null;
    view?: "compact" | "full";
  } = {},
) {
  const contract = buildReviewSaltUiWorkflowContract(result, {
    code: input.code,
    expected_targets: input.expected_targets,
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
  const compactContract = buildReviewPublicContract(result, contract, {
    transport_used: "mcp",
    registry,
  });

  if (!isFullView(input.view)) {
    return compactContract;
  }

  return attachPublicContractDetails(compactContract, {
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
      review_report: buildSaltReviewReport({
        registry,
        generated_at: new Date().toISOString(),
        generator: {
          name: "review_salt_ui",
        },
        profile: "auto",
        transport_used: "mcp",
        review: result,
        contract,
        public_contract: compactContract,
        scope: buildReviewReportScope(result, {
          root_dir: input.root_dir,
          target: input.target,
        }),
        runtime: {
          requested: false,
          checked: false,
        },
      }),
      raw,
    },
  });
}

function buildMigrateWorkflowEnvelope(
  registry: SaltRegistry,
  result: MigrateToSaltResult,
  input: {
    source_outline?: SourceUiOutlineInput;
    visual_evidence?: NormalizedVisualEvidenceInput[];
    context_checked?: boolean;
    context_resolution_status?:
      | "resolved"
      | "fallback"
      | "needs_explicit_root"
      | "mismatch";
    context_retry_with_root_dir?: string | null;
    context_id?: string | null;
    project_policy?: WorkflowProjectPolicyArtifact | null;
    view?: "compact" | "full";
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
  const compactContract = buildMigratePublicContract(result, contract, {
    transport_used: "mcp",
  });

  if (!isFullView(input.view)) {
    return compactContract;
  }

  return attachPublicContractDetails(compactContract, {
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
  });
}

export function withChooseWorkflowGuidance(
  registry: SaltRegistry,
  result: CreateSaltUiResult,
  input: {
    query?: string;
    package?: string;
    context_checked?: boolean;
    context_resolution_status?:
      | "resolved"
      | "fallback"
      | "needs_explicit_root"
      | "mismatch";
    context_retry_with_root_dir?: string | null;
    context_id?: string | null;
    project_policy?: WorkflowProjectPolicyArtifact | null;
    view?: "compact" | "full";
    salt_packages?: string[];
    package_manager?: string;
    resolved_entities?: string[];
  } = {},
) {
  return buildCreateWorkflowEnvelope(registry, result, input);
}

export function withAnalyzeWorkflowGuidance(
  registry: SaltRegistry,
  result: ReviewSaltUiResult,
  input: {
    code?: string;
    expected_targets?: ReviewExpectedTargets;
    project_policy?: WorkflowProjectPolicyArtifact | null;
    root_dir?: string | null;
    target?: string | null;
    view?: "compact" | "full";
  } = {},
) {
  return buildReviewWorkflowEnvelope(registry, result, input);
}

export function withTranslateWorkflowGuidance(
  registry: SaltRegistry,
  result: MigrateToSaltResult,
  input: {
    source_outline?: SourceUiOutlineInput;
    visual_evidence?: NormalizedVisualEvidenceInput[];
    context_checked?: boolean;
    context_resolution_status?:
      | "resolved"
      | "fallback"
      | "needs_explicit_root"
      | "mismatch";
    context_retry_with_root_dir?: string | null;
    context_id?: string | null;
    project_policy?: WorkflowProjectPolicyArtifact | null;
    view?: "compact" | "full";
  } = {},
) {
  return buildMigrateWorkflowEnvelope(registry, result, input);
}
