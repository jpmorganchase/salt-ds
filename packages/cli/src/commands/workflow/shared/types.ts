import type { inspectUrl } from "@salt-ds/runtime-inspector-core";
import type {
  SaltReviewReport,
  SaltWorkflowFollowupReport,
} from "@salt-ds/semantic-core";
import type { CreateSaltUiResult } from "@salt-ds/semantic-core/tools/createSaltUi";
import type { MigrateToSaltResult } from "@salt-ds/semantic-core/tools/migrateToSalt";
import type { ReviewExpectedTargets } from "@salt-ds/semantic-core/tools/reviewSaltUi";
import type { UpgradeSaltUiResult } from "@salt-ds/semantic-core/tools/upgradeSaltUi";
import type {
  CreateSaltUiWorkflowContract,
  WorkflowConfidence as CoreWorkflowConfidence,
  WorkflowContextRequirement as CoreWorkflowContextRequirement,
  WorkflowReadiness as CoreWorkflowReadiness,
  WorkflowCreateImplementationGate,
  WorkflowProvenance,
  WorkflowStarterValidation,
} from "@salt-ds/semantic-core/tools/workflowContracts";
import type { WorkflowRepoRefinementArtifact } from "@salt-ds/semantic-core/tools/workflowRepoRefinement";
import type {
  CreateRuleId,
  MigrationRuleId,
  ReviewRuleId,
  UpgradeRuleId,
  WorkflowIssueClass,
} from "@salt-ds/semantic-core/tools/workflowRuleIds";
import type { MigrationVerificationSummary } from "../../lib/migrationVerification.js";
import type {
  WorkflowProjectConventionsCheckSummary,
  WorkflowProjectConventionsSummary,
  WorkflowProjectPolicySummary,
} from "../../lib/projectConventionsWorkflow.js";
import type { ReviewFixCandidatesResult } from "../../lib/reviewFixCandidates.js";
import type { LintCommandResult, SaltInfoResult } from "../../types.js";

export type RuntimeInspectResult = Awaited<ReturnType<typeof inspectUrl>>;

export interface WorkflowConfidence {
  level: "high" | "medium" | "low";
  reasons: string[];
  askBeforeProceeding: boolean;
  raiseConfidence: string[];
}

export interface WorkflowReadiness {
  status: CoreWorkflowReadiness["status"];
  implementationReady: CoreWorkflowReadiness["implementation_ready"];
  reason: string;
}

export interface WorkflowContextRequirement {
  status: CoreWorkflowContextRequirement["status"];
  repoSpecificEditsReady: CoreWorkflowContextRequirement["repo_specific_edits_ready"];
  reason: string;
  satisfiedBy: "salt-ds info" | null;
}

export interface PublicSuggestedFollowUp {
  workflow: string;
  reason: string;
  args: Record<string, unknown>;
}

export type PublicCreateRecommendation = Omit<
  CreateSaltUiResult,
  "suggested_follow_ups"
> & {
  suggested_follow_ups?: PublicSuggestedFollowUp[];
};

export type PublicTranslateDecisionGate = Omit<
  NonNullable<MigrateToSaltResult["decision_gates"]>[number],
  "suggested_workflow"
> & {
  suggested_workflow: string;
};

export type PublicTranslateResult = Omit<
  MigrateToSaltResult,
  "decision_gates" | "suggested_follow_ups"
> & {
  decision_gates?: PublicTranslateDecisionGate[];
  suggested_follow_ups?: PublicSuggestedFollowUp[];
};

export interface ReviewWorkflowResult {
  workflow: {
    id: "review";
    transportUsed: "cli";
    confidence: WorkflowConfidence;
    projectConventionsCheck: WorkflowProjectConventionsCheckSummary | null;
    provenance: WorkflowProvenance;
  };
  result: {
    sourceValidation: LintCommandResult;
    summary: {
      status: "clean" | "needs_attention";
      filesNeedingAttention: number;
      cleanFiles: number;
      runtimeIssues: number;
      runtimeMode: string | null;
      fixCandidateCount: number;
      deterministicFixCandidateCount: number;
      manualReviewFixCandidateCount: number;
      nextStep: string;
    };
  };
  artifacts: {
    context: SaltInfoResult;
    projectPolicy: WorkflowProjectPolicySummary | null;
    issueClasses: WorkflowIssueClass[];
    ruleIds: ReviewRuleId[];
    fixCandidates: ReviewFixCandidatesResult;
    reviewReport: SaltReviewReport;
    expectedTargetReview: {
      reportPath: string;
      expectedTargets: ReviewExpectedTargets;
      issues: Array<Record<string, unknown>>;
      missingData: string[];
    } | null;
    migrationVerification: MigrationVerificationSummary | null;
    runtimeEvidence: {
      requested: boolean;
      url: string | null;
      result: RuntimeInspectResult | null;
    };
    notes: string[];
  };
}

export interface CreateWorkflowResult {
  workflow: {
    id: "create";
    transportUsed: "cli";
    implementationGate: WorkflowCreateImplementationGate;
    confidence: WorkflowConfidence;
    readiness: WorkflowReadiness;
    contextRequirement: WorkflowContextRequirement;
    projectConventionsCheck: CreateSaltUiWorkflowContract["project_conventions_check"];
    provenance: WorkflowProvenance;
  };
  result: {
    intent: {
      userTask: string;
      keyInteraction: string;
      compositionDirection: string;
      canonicalChoice: string | null;
      ruleIds: CreateRuleId[];
    };
    recommendation: PublicCreateRecommendation;
    summary: {
      mode: "recommend" | "compare";
      solutionType: string;
      decisionName: string | null;
      finalDecisionName: string | null;
      finalDecisionSource: "canonical_salt" | "project_policy";
      starterValidationStatus: "clean" | "needs_attention" | "not_run";
      nextStep: string;
      suggestedFollowUps: string[];
    };
  };
  artifacts: {
    context: SaltInfoResult;
    starterValidation: WorkflowStarterValidation | null;
    projectConventions: WorkflowProjectConventionsSummary | null;
    projectPolicy: WorkflowProjectPolicySummary | null;
    repoRefinement: WorkflowRepoRefinementArtifact | null;
    notes: string[];
  };
}

export interface MigrateWorkflowResult {
  workflow: {
    id: "migrate";
    transportUsed: "cli";
    confidence: WorkflowConfidence;
    readiness: WorkflowReadiness;
    contextRequirement: WorkflowContextRequirement;

export interface UpgradeWorkflowResult {
  workflow: {
    id: "upgrade";
    transportUsed: "cli";
    confidence: WorkflowConfidence;
    projectConventionsCheck: WorkflowProjectConventionsCheckSummary | null;
    provenance: WorkflowProvenance;
  };
  result: {
    comparison: UpgradeSaltUiResult;
    summary: {
      target: string;
      fromVersion: string;
      toVersion: string;
      changeCount: number;
      nextStep: string;
    };
  };
  artifacts: {
    context: SaltInfoResult;
    ruleIds: UpgradeRuleId[];
    workflowFollowupReport: SaltWorkflowFollowupReport;
    notes: string[];
  };
}

export type WorkflowExitCode = 0 | 10 | 20 | 30;
