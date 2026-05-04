import {
  SALT_EVIDENCE_REF_CONTRACT,
  SALT_GENERATED_ARTIFACT_CONTRACT,
  type SaltEvidenceRef,
  type SaltEvidenceValidationIssue,
  type SaltGeneratedArtifact,
  type SaltGeneratedArtifactGenerator,
  type SaltGeneratedArtifactRegistry,
  type SaltGeneratedClaim,
  type SaltUnsupportedClaim,
} from "./evidence.js";
import {
  type SaltGeneratedArtifactReleaseGate,
  validateGeneratedArtifactReleaseGate,
} from "./generatedArtifactReleaseGate.js";
import { createSaltRegistryFingerprint } from "./registry/fingerprint.js";
import type { SaltReviewReportValidationResult } from "./reviewReportValidation.js";
import type { SaltRegistry } from "./types.js";

export const SALT_WORKFLOW_FOLLOWUP_REPORT_CONTRACT =
  "salt_workflow_followup_report_v1" as const;
export const SALT_WORKFLOW_FOLLOWUP_REPORT_VALIDATION_CONTRACT =
  "salt_workflow_followup_report_validation_v1" as const;

export type SaltWorkflowFollowupReportWorkflow = "migration" | "upgrade";
export type SaltWorkflowFollowupReportStatus =
  | "ready"
  | "degraded"
  | "unsupported";
export type SaltWorkflowFollowupCheckStatus =
  | "passed"
  | "action_required"
  | "skipped"
  | "unsupported";
export type SaltWorkflowFollowupReviewEvidenceStatus =
  | SaltReviewReportValidationResult["status"]
  | "unvalidated";
export type SaltWorkflowFollowupCheckId =
  | "migration_workflow_input"
  | "migration_verification_contract"
  | "migration_runtime_evidence"
  | "migration_review_followup"
  | "upgrade_target"
  | "upgrade_version_boundary"
  | "upgrade_review_followup";

export interface SaltWorkflowFollowupReportWorkflowState {
  id: SaltWorkflowFollowupReportWorkflow;
  transport_used: "cli" | "mcp";
  source_command?: string | null;
}

export interface SaltWorkflowFollowupReportTarget {
  package_name?: string | null;
  component_name?: string | null;
  from_version?: string | null;
  to_version?: string | null;
  evidence_ref_ids: string[];
}

export interface SaltWorkflowFollowupReportSource {
  request_provided: boolean;
  source_outline_path?: string | null;
  runtime_url?: string | null;
  evidence_ref_ids: string[];
}

export interface SaltWorkflowFollowupCheck {
  id: SaltWorkflowFollowupCheckId;
  status: SaltWorkflowFollowupCheckStatus;
  summary: string;
  evidence_ref_ids: string[];
  missing: string[];
  next_action?: string | null;
}

export interface SaltWorkflowFollowupReportSummary {
  check_count: number;
  passed: number;
  action_required: number;
  skipped: number;
  unsupported: number;
}

export interface SaltWorkflowFollowupReviewEvidence {
  report_path: string;
  validation_status: SaltWorkflowFollowupReviewEvidenceStatus;
  current: boolean;
  supported: boolean;
  reusable_evidence_ref_ids: string[];
  unsupported_claim_ids: string[];
  unsupported_claim_count: number;
  validation_issues: SaltEvidenceValidationIssue[];
  mismatches: string[];
  missing: string[];
  evidence_ref_ids: string[];
}

export interface SaltWorkflowFollowupReport {
  contract: typeof SALT_WORKFLOW_FOLLOWUP_REPORT_CONTRACT;
  generated_at: string;
  generator: SaltGeneratedArtifactGenerator;
  registry: SaltGeneratedArtifactRegistry;
  workflow: SaltWorkflowFollowupReportWorkflowState;
  status: SaltWorkflowFollowupReportStatus;
  target: SaltWorkflowFollowupReportTarget | null;
  source: SaltWorkflowFollowupReportSource | null;
  review_evidence: SaltWorkflowFollowupReviewEvidence | null;
  summary: SaltWorkflowFollowupReportSummary;
  checks: SaltWorkflowFollowupCheck[];
  missing: string[];
  docs_registry_gaps: string[];
  next_actions: string[];
  evidence_refs: SaltEvidenceRef[];
  unsupported_claims: SaltUnsupportedClaim[];
  release_gate: SaltGeneratedArtifactReleaseGate;
  generated_artifact: SaltGeneratedArtifact;
}

export interface SaltWorkflowFollowupReportValidationResult {
  contract: typeof SALT_WORKFLOW_FOLLOWUP_REPORT_VALIDATION_CONTRACT;
  status: "current" | "stale" | "unsupported" | "invalid";
  current: boolean;
  supported: boolean;
  report_path: string;
  registry: {
    version: string | null;
    hash: string | null;
    generated_at: string | null;
    current_version: string | null;
    current_hash: string | null;
    current_generated_at: string | null;
  };
  validation_issues: SaltEvidenceValidationIssue[];
  unsupported_claim_count: number;
  mismatches: string[];
  missing: string[];
}

export interface SaltWorkflowFollowupReportWorkflowInputEvidence {
  request?: string | null;
  source_outline_path?: string | null;
  runtime_url?: string | null;
}

export interface SaltWorkflowFollowupReportRuntimeEvidence {
  requested?: boolean;
  captured?: boolean;
  url?: string | null;
  section?: string | null;
}

export interface SaltWorkflowFollowupReportTargetInput {
  package_name?: string | null;
  package_name_source?: "workflow_input" | "package" | null;
  component_name?: string | null;
  from_version?: string | null;
  from_version_source?: "workflow_input" | "package" | null;
  to_version?: string | null;
}

export interface SaltWorkflowFollowupReportFollowupInput {
  verification_check_count?: number | null;
  review_report_path?: string | null;
  review_report_validation?: SaltReviewReportValidationResult | null;
}

export interface BuildSaltWorkflowFollowupReportInput {
  registry: SaltRegistry;
  registry_hash?: string | null;
  generated_at: string;
  generator: SaltGeneratedArtifactGenerator;
  workflow: SaltWorkflowFollowupReportWorkflow;
  transport_used: SaltWorkflowFollowupReportWorkflowState["transport_used"];
  source_command?: string | null;
  workflow_input?: SaltWorkflowFollowupReportWorkflowInputEvidence | null;
  runtime?: SaltWorkflowFollowupReportRuntimeEvidence | null;
  target?: SaltWorkflowFollowupReportTargetInput | null;
  followup?: SaltWorkflowFollowupReportFollowupInput | null;
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()))].filter(
    (value) => value.length > 0,
  );
}

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function uniqueEvidenceRefs(refs: SaltEvidenceRef[]): SaltEvidenceRef[] {
  return refs.filter(
    (ref, index) =>
      refs.findIndex((candidate) => candidate.id === ref.id) === index,
  );
}

function nextAction(workflow: SaltWorkflowFollowupReportWorkflow): string {
  return workflow === "migration"
    ? "Run salt-ds review on the migrated files and attach a source-backed migration verification contract when available."
    : "Run salt-ds review on the upgraded files and attach source-backed upgrade validation evidence when available.";
}

function buildWorkflowInputEvidenceRef(input: {
  id: string;
  claim_kind?: SaltEvidenceRef["claim_kind"];
  field_path: string;
  generated_at: string;
  note?: string | null;
}): SaltEvidenceRef {
  return {
    contract: SALT_EVIDENCE_REF_CONTRACT,
    id: input.id,
    source_kind: "workflow_input",
    claim_kind: input.claim_kind ?? "workflow",
    workflow_input: {
      field_path: input.field_path,
      captured_at: input.generated_at,
    },
    confidence: "high",
    verified_at: input.generated_at,
    note: input.note ?? null,
  };
}

function buildPackageEvidenceRef(input: {
  id: string;
  name: string;
  version?: string | null;
  generated_at: string;
  note?: string | null;
}): SaltEvidenceRef {
  return {
    contract: SALT_EVIDENCE_REF_CONTRACT,
    id: input.id,
    source_kind: "package",
    claim_kind: "package",
    package: {
      name: input.name,
      version: input.version ?? null,
    },
    confidence: "high",
    verified_at: input.generated_at,
    note: input.note ?? null,
  };
}

function buildRuntimeEvidenceRef(input: {
  id: string;
  url?: string | null;
  section?: string | null;
  generated_at: string;
}): SaltEvidenceRef {
  return {
    contract: SALT_EVIDENCE_REF_CONTRACT,
    id: input.id,
    source_kind: "runtime",
    claim_kind: "workflow",
    source: {
      url: input.url ?? null,
      section: input.section ?? "runtime migration follow-up evidence",
    },
    confidence: "medium",
    verified_at: input.generated_at,
  };
}

function buildReviewReportEvidenceRef(input: {
  id: string;
  report_path: string;
  generated_at: string;
  validation_status: SaltWorkflowFollowupReviewEvidenceStatus;
}): SaltEvidenceRef {
  return {
    contract: SALT_EVIDENCE_REF_CONTRACT,
    id: input.id,
    source_kind: "source",
    claim_kind: "workflow",
    source: {
      repo_path: input.report_path,
      section: `attached review report validation: ${input.validation_status}`,
    },
    confidence: input.validation_status === "current" ? "high" : "medium",
    verified_at: input.generated_at,
    note: "Attached review report used as workflow follow-up evidence.",
  };
}

function buildClaim(input: {
  id: string;
  kind?: SaltGeneratedClaim["kind"];
  text: string;
  field_path: string;
  evidence_ref_ids: string[];
}): SaltGeneratedClaim {
  return {
    id: input.id,
    kind: input.kind ?? "workflow",
    text: input.text,
    field_path: input.field_path,
    evidence_ref_ids: input.evidence_ref_ids,
  };
}

function buildUnsupportedClaim(input: {
  id: string;
  text: string;
  field_path: string;
  reason: string;
}): SaltUnsupportedClaim {
  return {
    id: input.id,
    kind: "workflow",
    text: input.text,
    field_path: input.field_path,
    reason: input.reason,
  };
}

function summarizeChecks(
  checks: SaltWorkflowFollowupCheck[],
): SaltWorkflowFollowupReportSummary {
  return {
    check_count: checks.length,
    passed: checks.filter((check) => check.status === "passed").length,
    action_required: checks.filter(
      (check) => check.status === "action_required",
    ).length,
    skipped: checks.filter((check) => check.status === "skipped").length,
    unsupported: checks.filter((check) => check.status === "unsupported")
      .length,
  };
}

function statusFromReportState(input: {
  claims: SaltGeneratedClaim[];
  checks: SaltWorkflowFollowupCheck[];
  unsupported_claims: SaltUnsupportedClaim[];
}): SaltWorkflowFollowupReportStatus {
  if (input.claims.length === 0) {
    return "unsupported";
  }

  if (input.checks.some((check) => check.status === "unsupported")) {
    return "unsupported";
  }

  if (
    input.unsupported_claims.length > 0 ||
    input.checks.some(
      (check) => check.status === "action_required",
    )
  ) {
    return "degraded";
  }

  return "ready";
}

function buildReviewFollowupEvidence(input: {
  workflow: SaltWorkflowFollowupReportWorkflow;
  generated_at: string;
  followup?: SaltWorkflowFollowupReportFollowupInput | null;
}): {
  reviewEvidence: SaltWorkflowFollowupReviewEvidence | null;
  check: SaltWorkflowFollowupCheck;
  claims: SaltGeneratedClaim[];
  evidenceRefs: SaltEvidenceRef[];
  unsupportedClaims: SaltUnsupportedClaim[];
} {
  const workflowLabel =
    input.workflow === "migration" ? "post-migration" : "post-upgrade";
  const reviewReportPath =
    input.followup?.review_report_validation?.report_path ??
    input.followup?.review_report_path ??
    null;
  const reviewMissing = `${workflowLabel} review report evidence`;

  if (!hasText(reviewReportPath)) {
    return {
      reviewEvidence: null,
      check: {
        id:
          input.workflow === "migration"
            ? "migration_review_followup"
            : "upgrade_review_followup",
        status: "action_required",
        summary: `${workflowLabel} review evidence is still required.`,
        evidence_ref_ids: [],
        missing: [reviewMissing],
        next_action: nextAction(input.workflow),
      },
      claims: [],
      evidenceRefs: [],
      unsupportedClaims: [
        buildUnsupportedClaim({
          id: `${input.workflow}.followup.review-report.unsupported`,
          text: `${workflowLabel} follow-up report cannot validate changed files without a review report.`,
          field_path: `checks.${input.workflow}_review_followup`,
          reason: reviewMissing,
        }),
      ],
    };
  }

  const validation = input.followup?.review_report_validation ?? null;
  const validationStatus = validation?.status ?? "unvalidated";
  const ref = buildReviewReportEvidenceRef({
    id: `${input.workflow}.review-report.validation`,
    report_path: reviewReportPath,
    generated_at: input.generated_at,
    validation_status: validationStatus,
  });
  const reviewEvidence: SaltWorkflowFollowupReviewEvidence = {
    report_path: reviewReportPath,
    validation_status: validationStatus,
    current: validation?.current ?? false,
    supported: validation?.supported ?? false,
    reusable_evidence_ref_ids:
      validation?.resume.reusable_evidence_ref_ids ?? [],
    unsupported_claim_ids: validation?.resume.unsupported_claim_ids ?? [],
    unsupported_claim_count: validation?.unsupported_claim_count ?? 0,
    validation_issues: validation?.validation_issues ?? [],
    mismatches: validation?.mismatches ?? [],
    missing:
      validation == null
        ? [`validated ${workflowLabel} review report`]
        : validation.missing,
    evidence_ref_ids: [ref.id],
  };
  const claims: SaltGeneratedClaim[] = [
    buildClaim({
      id: `${input.workflow}.followup.review-report-attached`,
      text: `${workflowLabel} follow-up report includes an attached review report path.`,
      field_path: "review_evidence.report_path",
      evidence_ref_ids: [ref.id],
    }),
  ];

  if (validation?.status === "current" && validation.current && validation.supported) {
    claims.push(
      buildClaim({
        id: `${input.workflow}.followup.review-report-current`,
        text: `${workflowLabel} review report validation is current and supported.`,
        field_path: "review_evidence.validation_status",
        evidence_ref_ids: [ref.id],
      }),
    );

    return {
      reviewEvidence,
      check: {
        id:
          input.workflow === "migration"
            ? "migration_review_followup"
            : "upgrade_review_followup",
        status: "passed",
        summary: `${workflowLabel} review evidence is current and supported.`,
        evidence_ref_ids: [ref.id],
        missing: [],
        next_action: null,
      },
      claims,
      evidenceRefs: [ref],
      unsupportedClaims: [],
    };
  }

  const reason =
    validation == null
      ? `validated ${workflowLabel} review report`
      : validation.status === "stale"
        ? `current ${workflowLabel} review report evidence`
        : validation.status === "invalid"
          ? `valid ${workflowLabel} review report evidence`
          : `supported ${workflowLabel} review report evidence`;
  const missing = uniqueStrings([...reviewEvidence.missing, reason]);

  return {
    reviewEvidence: {
      ...reviewEvidence,
      missing,
    },
    check: {
      id:
        input.workflow === "migration"
          ? "migration_review_followup"
          : "upgrade_review_followup",
      status: validation == null ? "action_required" : "unsupported",
      summary:
        validation == null
          ? `${workflowLabel} review report path is attached but has not been validated.`
          : `${workflowLabel} review report validation is ${validation.status}.`,
      evidence_ref_ids: [ref.id],
      missing,
      next_action:
        validation == null
          ? nextAction(input.workflow)
          : `Regenerate and validate the ${workflowLabel} review report before treating the workflow complete.`,
    },
    claims,
    evidenceRefs: [ref],
    unsupportedClaims: [
      buildUnsupportedClaim({
        id: `${input.workflow}.followup.review-report.validation.unsupported`,
        text: `${workflowLabel} follow-up report cannot treat changed-file validation as complete.`,
        field_path: "review_evidence.validation_status",
        reason,
      }),
    ],
  };
}

function buildMigrationEvidence(input: BuildSaltWorkflowFollowupReportInput): {
  source: SaltWorkflowFollowupReportSource;
  reviewEvidence: SaltWorkflowFollowupReviewEvidence | null;
  checks: SaltWorkflowFollowupCheck[];
  claims: SaltGeneratedClaim[];
  evidenceRefs: SaltEvidenceRef[];
  unsupportedClaims: SaltUnsupportedClaim[];
} {
  const generatedAt = input.generated_at;
  const evidenceRefs: SaltEvidenceRef[] = [];
  const claims: SaltGeneratedClaim[] = [];
  const unsupportedClaims: SaltUnsupportedClaim[] = [];
  const checks: SaltWorkflowFollowupCheck[] = [];
  const requestProvided = hasText(input.workflow_input?.request);
  const sourceEvidenceRefIds: string[] = [];

  if (requestProvided) {
    const ref = buildWorkflowInputEvidenceRef({
      id: "migration.workflow-input.request",
      field_path: "workflow_input.request",
      generated_at: generatedAt,
      note: "User-supplied or tool-supplied migration request captured by the workflow.",
    });
    evidenceRefs.push(ref);
    sourceEvidenceRefIds.push(ref.id);
    claims.push(
      buildClaim({
        id: "migration.followup.workflow-input",
        text: "Migration follow-up report is grounded in captured workflow input.",
        field_path: "source.request_provided",
        evidence_ref_ids: [ref.id],
      }),
    );
    checks.push({
      id: "migration_workflow_input",
      status: "passed",
      summary: "Migration workflow input was captured.",
      evidence_ref_ids: [ref.id],
      missing: [],
    });
  } else {
    const missing = "migration workflow input";
    checks.push({
      id: "migration_workflow_input",
      status: "action_required",
      summary: "Migration workflow input was not available to the report.",
      evidence_ref_ids: [],
      missing: [missing],
      next_action: "Rerun the migration workflow with explicit input.",
    });
    unsupportedClaims.push(
      buildUnsupportedClaim({
        id: "migration.followup.workflow-input.unsupported",
        text: "Migration follow-up report lacks workflow input evidence.",
        field_path: "source.request_provided",
        reason: missing,
      }),
    );
  }

  if (hasText(input.workflow_input?.source_outline_path)) {
    const ref = buildWorkflowInputEvidenceRef({
      id: "migration.workflow-input.source-outline",
      field_path: "workflow_input.source_outline_path",
      generated_at: generatedAt,
      note: "Structured source outline path supplied to the workflow.",
    });
    evidenceRefs.push(ref);
    sourceEvidenceRefIds.push(ref.id);
    claims.push(
      buildClaim({
        id: "migration.followup.source-outline",
        text: "Migration follow-up report includes a captured source-outline input.",
        field_path: "source.source_outline_path",
        evidence_ref_ids: [ref.id],
      }),
    );
  }

  if (input.followup?.verification_check_count) {
    const ref = buildWorkflowInputEvidenceRef({
      id: "migration.workflow-output.verification-contract",
      field_path: "followup.verification_check_count",
      generated_at: generatedAt,
      note: "Post-migration verification checks were produced by the workflow.",
    });
    evidenceRefs.push(ref);
    claims.push(
      buildClaim({
        id: "migration.followup.verification-contract",
        text: "Migration follow-up report includes workflow-produced verification checks.",
        field_path: "checks.migration_verification_contract",
        evidence_ref_ids: [ref.id],
      }),
    );
    checks.push({
      id: "migration_verification_contract",
      status: "passed",
      summary: "Workflow-produced migration verification checks are present.",
      evidence_ref_ids: [ref.id],
      missing: [],
    });
  } else {
    const missing = "migration verification checks";
    checks.push({
      id: "migration_verification_contract",
      status: "action_required",
      summary: "Migration verification checks are not available.",
      evidence_ref_ids: [],
      missing: [missing],
      next_action:
        "Rerun migration and include the workflow-produced post-migration verification checks.",
    });
    unsupportedClaims.push(
      buildUnsupportedClaim({
        id: "migration.followup.verification-contract.unsupported",
        text: "Migration follow-up report lacks verification-check evidence.",
        field_path: "checks.migration_verification_contract",
        reason: missing,
      }),
    );
  }

  if (input.runtime?.captured) {
    const ref = buildRuntimeEvidenceRef({
      id: "migration.runtime.capture",
      url: input.runtime.url ?? input.workflow_input?.runtime_url ?? null,
      section: input.runtime.section,
      generated_at: generatedAt,
    });
    evidenceRefs.push(ref);
    sourceEvidenceRefIds.push(ref.id);
    claims.push(
      buildClaim({
        id: "migration.followup.runtime-evidence",
        text: "Migration follow-up report includes captured runtime scoping evidence.",
        field_path: "source.runtime_url",
        evidence_ref_ids: [ref.id],
      }),
    );
    checks.push({
      id: "migration_runtime_evidence",
      status: "passed",
      summary: "Runtime scoping evidence was captured.",
      evidence_ref_ids: [ref.id],
      missing: [],
    });
  } else if (input.runtime?.requested || hasText(input.workflow_input?.runtime_url)) {
    const missing = "captured runtime evidence";
    checks.push({
      id: "migration_runtime_evidence",
      status: "action_required",
      summary: "Runtime evidence was requested but no capture is attached.",
      evidence_ref_ids: [],
      missing: [missing],
      next_action:
        "Rerun migration runtime scoping or attach review runtime evidence before calling runtime-sensitive migration checks complete.",
    });
    unsupportedClaims.push(
      buildUnsupportedClaim({
        id: "migration.followup.runtime-evidence.unsupported",
        text: "Migration follow-up report lacks captured runtime evidence.",
        field_path: "source.runtime_url",
        reason: missing,
      }),
    );
  } else {
    checks.push({
      id: "migration_runtime_evidence",
      status: "skipped",
      summary: "Runtime scoping evidence was not requested.",
      evidence_ref_ids: [],
      missing: [],
    });
  }

  const reviewFollowup = buildReviewFollowupEvidence({
    workflow: "migration",
    generated_at: generatedAt,
    followup: input.followup,
  });
  checks.push(reviewFollowup.check);
  claims.push(...reviewFollowup.claims);
  evidenceRefs.push(...reviewFollowup.evidenceRefs);
  unsupportedClaims.push(...reviewFollowup.unsupportedClaims);

  return {
    source: {
      request_provided: requestProvided,
      source_outline_path: input.workflow_input?.source_outline_path ?? null,
      runtime_url: input.workflow_input?.runtime_url ?? input.runtime?.url ?? null,
      evidence_ref_ids: sourceEvidenceRefIds,
    },
    reviewEvidence: reviewFollowup.reviewEvidence,
    checks,
    claims,
    evidenceRefs,
    unsupportedClaims,
  };
}

function buildUpgradeEvidence(input: BuildSaltWorkflowFollowupReportInput): {
  target: SaltWorkflowFollowupReportTarget;
  reviewEvidence: SaltWorkflowFollowupReviewEvidence | null;
  checks: SaltWorkflowFollowupCheck[];
  claims: SaltGeneratedClaim[];
  evidenceRefs: SaltEvidenceRef[];
  unsupportedClaims: SaltUnsupportedClaim[];
} {
  const generatedAt = input.generated_at;
  const target = input.target ?? {};
  const evidenceRefs: SaltEvidenceRef[] = [];
  const claims: SaltGeneratedClaim[] = [];
  const unsupportedClaims: SaltUnsupportedClaim[] = [];
  const checks: SaltWorkflowFollowupCheck[] = [];
  const targetEvidenceRefIds: string[] = [];

  if (hasText(target.package_name)) {
    const ref =
      target.package_name_source === "workflow_input"
        ? buildWorkflowInputEvidenceRef({
            id: "upgrade.workflow-input.package-name",
            claim_kind: "package",
            field_path: "target.package_name",
            generated_at: generatedAt,
          })
        : buildPackageEvidenceRef({
            id: "upgrade.package.target",
            name: target.package_name,
            version: target.from_version ?? null,
            generated_at: generatedAt,
            note: "Package target captured from project package metadata or workflow input.",
          });
    evidenceRefs.push(ref);
    targetEvidenceRefIds.push(ref.id);
    claims.push(
      buildClaim({
        id: "upgrade.followup.package-target",
        kind: "package",
        text: "Upgrade follow-up report includes an evidenced package target.",
        field_path: "target.package_name",
        evidence_ref_ids: [ref.id],
      }),
    );
  }

  if (hasText(target.component_name)) {
    const ref = buildWorkflowInputEvidenceRef({
      id: "upgrade.workflow-input.component-name",
      claim_kind: "component",
      field_path: "target.component_name",
      generated_at: generatedAt,
      note: "Component target supplied as workflow input.",
    });
    evidenceRefs.push(ref);
    targetEvidenceRefIds.push(ref.id);
    claims.push(
      buildClaim({
        id: "upgrade.followup.component-target",
        kind: "component",
        text: "Upgrade follow-up report includes an explicit component target.",
        field_path: "target.component_name",
        evidence_ref_ids: [ref.id],
      }),
    );
  }

  const targetMissing = "upgrade package or component target evidence";
  checks.push({
    id: "upgrade_target",
    status: targetEvidenceRefIds.length > 0 ? "passed" : "action_required",
    summary:
      targetEvidenceRefIds.length > 0
        ? "Upgrade target evidence is present."
        : "Upgrade target evidence is missing.",
    evidence_ref_ids: targetEvidenceRefIds,
    missing: targetEvidenceRefIds.length > 0 ? [] : [targetMissing],
    next_action:
      targetEvidenceRefIds.length > 0
        ? null
        : "Rerun upgrade with an explicit package or component target.",
  });
  if (targetEvidenceRefIds.length === 0) {
    unsupportedClaims.push(
      buildUnsupportedClaim({
        id: "upgrade.followup.target.unsupported",
        text: "Upgrade follow-up report lacks package or component target evidence.",
        field_path: "target",
        reason: targetMissing,
      }),
    );
  }

  if (hasText(target.from_version)) {
    const ref =
      target.from_version_source === "workflow_input"
        ? buildWorkflowInputEvidenceRef({
            id: "upgrade.workflow-input.from-version",
            claim_kind: "package",
            field_path: "target.from_version",
            generated_at: generatedAt,
          })
        : buildPackageEvidenceRef({
            id: "upgrade.package.from-version",
            name: target.package_name ?? "workflow target package",
            version: target.from_version,
            generated_at: generatedAt,
            note: "Upgrade boundary captured from package metadata.",
          });
    evidenceRefs.push(ref);
    targetEvidenceRefIds.push(ref.id);
    claims.push(
      buildClaim({
        id: "upgrade.followup.version-boundary",
        kind: "package",
        text: "Upgrade follow-up report includes an evidenced source version boundary.",
        field_path: "target.from_version",
        evidence_ref_ids: [ref.id],
      }),
    );
    checks.push({
      id: "upgrade_version_boundary",
      status: "passed",
      summary: "Upgrade source version boundary is present.",
      evidence_ref_ids: [ref.id],
      missing: [],
    });
  } else {
    const missing = "upgrade source version evidence";
    checks.push({
      id: "upgrade_version_boundary",
      status: "action_required",
      summary: "Upgrade source version boundary is missing.",
      evidence_ref_ids: [],
      missing: [missing],
      next_action: "Rerun upgrade with --from-version or detectable package metadata.",
    });
    unsupportedClaims.push(
      buildUnsupportedClaim({
        id: "upgrade.followup.version-boundary.unsupported",
        text: "Upgrade follow-up report lacks source version evidence.",
        field_path: "target.from_version",
        reason: missing,
      }),
    );
  }

  if (hasText(target.to_version)) {
    const ref = buildWorkflowInputEvidenceRef({
      id: "upgrade.workflow-input.to-version",
      claim_kind: "package",
      field_path: "target.to_version",
      generated_at: generatedAt,
      note: "Upgrade destination version supplied as workflow input.",
    });
    evidenceRefs.push(ref);
    targetEvidenceRefIds.push(ref.id);
    claims.push(
      buildClaim({
        id: "upgrade.followup.to-version",
        kind: "package",
        text: "Upgrade follow-up report includes an explicit destination version.",
        field_path: "target.to_version",
        evidence_ref_ids: [ref.id],
      }),
    );
  }

  const reviewFollowup = buildReviewFollowupEvidence({
    workflow: "upgrade",
    generated_at: generatedAt,
    followup: input.followup,
  });
  checks.push(reviewFollowup.check);
  claims.push(...reviewFollowup.claims);
  evidenceRefs.push(...reviewFollowup.evidenceRefs);
  unsupportedClaims.push(...reviewFollowup.unsupportedClaims);

  return {
    target: {
      package_name: target.package_name ?? null,
      component_name: target.component_name ?? null,
      from_version: target.from_version ?? null,
      to_version: target.to_version ?? null,
      evidence_ref_ids: targetEvidenceRefIds,
    },
    reviewEvidence: reviewFollowup.reviewEvidence,
    checks,
    claims,
    evidenceRefs,
    unsupportedClaims,
  };
}

export function buildSaltWorkflowFollowupReport(
  input: BuildSaltWorkflowFollowupReportInput,
): SaltWorkflowFollowupReport {
  const registryHash =
    input.registry_hash ?? createSaltRegistryFingerprint(input.registry);
  const workflowEvidence =
    input.workflow === "migration"
      ? buildMigrationEvidence(input)
      : buildUpgradeEvidence(input);
  const checks = workflowEvidence.checks;
  const unsupportedClaims = workflowEvidence.unsupportedClaims;
  const claims = workflowEvidence.claims;
  const evidenceRefs = uniqueEvidenceRefs(workflowEvidence.evidenceRefs);
  const generatedArtifact: SaltGeneratedArtifact = {
    contract: SALT_GENERATED_ARTIFACT_CONTRACT,
    artifact_kind: "validation-report",
    id: `${input.workflow}-followup-report`,
    generated_at: input.generated_at,
    generator: input.generator,
    registry: {
      version: input.registry.version,
      hash: registryHash,
      generated_at: input.registry.generated_at,
    },
    claims,
    evidence_refs: evidenceRefs,
    unsupported_claims: unsupportedClaims,
  };
  const missing = uniqueStrings(checks.flatMap((check) => check.missing));
  const nextActions = uniqueStrings([
    ...checks.flatMap((check) =>
      check.next_action ? [check.next_action] : [],
    ),
    ...(unsupportedClaims.length > 0 ? [nextAction(input.workflow)] : []),
  ]);

  return {
    contract: SALT_WORKFLOW_FOLLOWUP_REPORT_CONTRACT,
    generated_at: input.generated_at,
    generator: input.generator,
    registry: generatedArtifact.registry,
    workflow: {
      id: input.workflow,
      transport_used: input.transport_used,
      source_command: input.source_command ?? null,
    },
    status: statusFromReportState({
      claims,
      checks,
      unsupported_claims: unsupportedClaims,
    }),
    target:
      input.workflow === "upgrade" && "target" in workflowEvidence
        ? workflowEvidence.target
        : null,
    source:
      input.workflow === "migration" && "source" in workflowEvidence
        ? workflowEvidence.source
        : null,
    review_evidence: workflowEvidence.reviewEvidence,
    summary: summarizeChecks(checks),
    checks,
    missing,
    docs_registry_gaps: [],
    next_actions: nextActions,
    evidence_refs: evidenceRefs,
    unsupported_claims: unsupportedClaims,
    release_gate: validateGeneratedArtifactReleaseGate({
      artifact: generatedArtifact,
      registry: input.registry,
    }),
    generated_artifact: generatedArtifact,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function registryMatches(
  report: SaltWorkflowFollowupReport,
  registry: SaltRegistry,
): boolean {
  const currentHash = createSaltRegistryFingerprint(registry);

  return (
    report.registry.version === registry.version &&
    report.registry.generated_at === registry.generated_at &&
    (report.registry.hash ?? null) === currentHash
  );
}

export function validateSaltWorkflowFollowupReport(input: {
  report: unknown;
  registry: SaltRegistry;
  report_path: string;
}): SaltWorkflowFollowupReportValidationResult {
  const currentHash = createSaltRegistryFingerprint(input.registry);
  const baseRegistry = {
    version: null,
    hash: null,
    generated_at: null,
    current_version: input.registry.version,
    current_hash: currentHash,
    current_generated_at: input.registry.generated_at,
  };

  if (
    !isRecord(input.report) ||
    input.report.contract !== SALT_WORKFLOW_FOLLOWUP_REPORT_CONTRACT ||
    !isRecord(input.report.generated_artifact)
  ) {
    return {
      contract: SALT_WORKFLOW_FOLLOWUP_REPORT_VALIDATION_CONTRACT,
      status: "invalid",
      current: false,
      supported: false,
      report_path: input.report_path,
      registry: baseRegistry,
      validation_issues: [],
      unsupported_claim_count: 0,
      mismatches: ["contract"],
      missing: ["report is not a salt_workflow_followup_report_v1 payload"],
    };
  }

  const report = input.report as unknown as SaltWorkflowFollowupReport;
  const releaseGate = validateGeneratedArtifactReleaseGate({
    artifact: report.generated_artifact,
    registry: input.registry,
  });
  const registryState = {
    version: report.registry.version ?? null,
    hash: report.registry.hash ?? null,
    generated_at: report.registry.generated_at ?? null,
    current_version: input.registry.version,
    current_hash: currentHash,
    current_generated_at: input.registry.generated_at,
  };
  const mismatches: string[] = [];

  if (!registryMatches(report, input.registry)) {
    mismatches.push("registry");
  }

  if (releaseGate.status !== report.release_gate.status) {
    mismatches.push("release_gate.status");
  }

  const supported = releaseGate.releasable;
  const status: SaltWorkflowFollowupReportValidationResult["status"] =
    mismatches.includes("registry")
      ? "stale"
      : releaseGate.status === "passed"
        ? "current"
        : releaseGate.status === "invalid"
          ? "invalid"
          : "unsupported";

  return {
    contract: SALT_WORKFLOW_FOLLOWUP_REPORT_VALIDATION_CONTRACT,
    status,
    current: status === "current",
    supported,
    report_path: input.report_path,
    registry: registryState,
    validation_issues: releaseGate.validation_issues,
    unsupported_claim_count: releaseGate.unsupported_claim_count,
    mismatches,
    missing: uniqueStrings([...report.missing, ...releaseGate.missing]),
  };
}
