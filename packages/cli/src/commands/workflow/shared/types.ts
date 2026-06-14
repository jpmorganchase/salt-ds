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
  WorkflowContextRequirement as CoreWorkflowContextRequirement,
  WorkflowReadiness as CoreWorkflowReadiness,
  CreateSaltUiWorkflowContract,
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
import type { MigrationVerificationSummary } from "../../../lib/migrationVerification.js";
import type {
  WorkflowProjectConventionsCheckSummary,
  WorkflowProjectConventionsSummary,
  WorkflowProjectPolicySummary,
} from "../../../lib/projectConventionsWorkflow.js";
import type { ReviewFixCandidatesResult } from "../../../lib/reviewFixCandidates.js";
import type { LintCommandResult, SaltInfoResult } from "../../../types.js";

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
    projectConventionsCheck: WorkflowProjectConventionsCheckSummary | null;
    provenance: WorkflowProvenance;
  };
  result: {
    translation: PublicTranslateResult;
    migrationScope: {
      questions: string[];
      preserveFocus: string[];
      allowSaltChanges: string[];
      confirmationTriggers: string[];
      currentExperienceCaptured: boolean;
      runtimeRecommended: boolean;
    };
    summary: {
      translationCount: number;
      manualReviews: number;
      confirmationRequired: number;
      runtimeMode: string | null;
      starterValidationStatus: "clean" | "needs_attention" | "not_run";
      nextStep: string;
    };
  };
  artifacts: {
    context: SaltInfoResult;
    starterValidation: WorkflowStarterValidation | null;
    projectPolicy: WorkflowProjectPolicySummary | null;
    ruleIds: MigrationRuleId[];
    visualEvidence: {
      contract: {
        role: "supporting-evidence";
        notCanonicalSourceOfTruth: true;
        supportedInputs: Array<
          | "structured-outline"
          | "current-ui-capture"
          | "mockup-image"
          | "screenshot-file"
          | "image-url"
        >;
        interpretationOwner: "agent-or-adapter";
        normalizationRequired: true;
        normalizationContract: "migrate_visual_evidence_v1";
        structuredOutputs: Array<
          | "landmarks"
          | "action-hierarchy"
          | "layout-signals"
          | "familiarity-anchors"
          | "confidence-impact"
        >;
      };
      interpretationOwner: "agent-or-adapter";
      inputs: {
        structuredOutline: {
          provided: boolean;
          path: string | null;
          regions: number;
          actions: number;
          states: number;
          notes: number;
        };
        currentUiCapture: {
          requested: boolean;
          url: string | null;
          mode: string | null;
          currentExperienceCaptured: boolean;
          screenshotArtifacts: number;
        };
        mockups: Array<{
          sourceType: "file" | "url";
          source: string;
          label: string | null;
          confidence: "low" | "medium" | "high";
          regions: number;
          actions: number;
          states: number;
          notes: number;
          adapterNotes: string[];
        }>;
        screenshots: Array<{
          sourceType: "file" | "url";
          source: string;
          label: string | null;
          confidence: "low" | "medium" | "high";
          regions: number;
          actions: number;
          states: number;
          notes: number;
          adapterNotes: string[];
        }>;
      };
      derivedOutline: {
        available: boolean;
        regions: number;
        actions: number;
        states: number;
        notes: number;
      };
      confidenceImpact: {
        level: "none" | "supporting" | "stronger-scoping";
        reasons: string[];
        changedScoping: boolean;
        changedConfidence: boolean;
      };
      ambiguities: string[];
    };
    postMigrationVerification: {
      sourceChecks: string[];
      runtimeChecks: string[];
      preserveChecks: string[];
      confirmationChecks: string[];
      suggestedWorkflow: "review";
      suggestedCommand: string;
    };
    workflowFollowupReport: SaltWorkflowFollowupReport;
    runtimeEvidence: {
      requested: boolean;
      url: string | null;
      result: RuntimeInspectResult | null;
      currentExperience: {
        pageTitle: string;
        landmarks: string[];
        interactionAnchors: string[];
        structure: string[];
        layoutSignals: string[];
      } | null;
    };
    notes: string[];
  };
}

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
