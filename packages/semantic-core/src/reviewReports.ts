import type {
  SaltEvidenceRef,
  SaltEvidenceValidationIssue,
  SaltGeneratedArtifact,
  SaltGeneratedArtifactGenerator,
  SaltGeneratedArtifactRegistry,
  SaltUnsupportedClaim,
} from "./evidence.js";
import {
  type SaltGeneratedArtifactReleaseGate,
  validateGeneratedArtifactReleaseGate,
} from "./generatedArtifactReleaseGate.js";
import {
  type SerializedGeneratedSaltArtifactSurfaceGate,
  serializeGeneratedSaltArtifactSurfaceGate,
} from "./generatedArtifactSurface.js";
import { createSaltRegistryFingerprint } from "./registry/fingerprint.js";
import {
  buildReviewReportEvidenceGate,
  type ReviewReportEvidenceGate,
} from "./reviewReportArtifacts.js";
import type { PublicContract } from "./tools/publicContract.js";
import type { ReviewSaltUiResult } from "./tools/reviewSaltUi.js";
import type { ValidationIssue } from "./tools/validation/shared.js";
import type {
  ReviewSaltUiWorkflowContract,
  WorkflowFixCandidates,
} from "./tools/workflowContracts.js";
import type { SaltRegistry } from "./types.js";

export const SALT_REVIEW_REPORT_CONTRACT = "salt_review_report_v1" as const;

export type SaltReviewReportStatus =
  | "clean"
  | "needs_attention"
  | "unsupported";

export type SaltReviewReportGateStatus =
  | "passed"
  | "blocked"
  | "skipped"
  | "unsupported";

export interface SaltReviewReportScopeFile {
  path: string;
  relative_path?: string | null;
  status: ReviewSaltUiResult["decision"]["status"];
  errors: number;
  warnings: number;
  infos: number;
}

export interface SaltReviewReportScope {
  root_dir?: string | null;
  targets: string[];
  file_count: number;
  files: SaltReviewReportScopeFile[];
}

export interface SaltReviewReportPhase {
  id:
    | "context_resolution"
    | "source_discovery"
    | "salt_static_review"
    | "runtime_inspection"
    | "evidence_validation";
  status: "complete" | "skipped" | "unsupported";
  summary: string;
}

export interface SaltReviewReportGate {
  id:
    | "context_to_source_review"
    | "static_to_runtime_review"
    | "review_to_implementation_recommendation"
    | "report_evidence_validation";
  status: SaltReviewReportGateStatus;
  missing: string[];
}

export interface SaltReviewReportFinding {
  id: string;
  category?: string | null;
  rule?: string | null;
  severity?: string | null;
  title: string;
  message: string;
  claim_id?: string | null;
  unsupported_claim_id?: string | null;
  status: "source_backed" | "unsupported";
  evidence_ref_ids: string[];
  source_urls: string[];
}

export interface SaltReviewReportEvidenceValidation {
  status: ReviewReportEvidenceGate["status"];
  issues: SaltEvidenceValidationIssue[];
  missing: string[];
  unsupported_claim_count: number;
}

export type SaltReviewReportSurfaceGate =
  SerializedGeneratedSaltArtifactSurfaceGate;
export type SaltReviewReportReleaseGate = SaltGeneratedArtifactReleaseGate;

export interface SaltReviewReportWorkflow {
  id: "review";
  transport_used: "cli" | "mcp";
  public_status?: PublicContract["status"] | null;
  decision_status: ReviewSaltUiResult["decision"]["status"];
  next_required_action?: PublicContract["next_required_action"] | null;
  rule_ids: string[];
}

export interface SaltReviewReport {
  contract: typeof SALT_REVIEW_REPORT_CONTRACT;
  generated_at: string;
  generator: SaltGeneratedArtifactGenerator;
  registry: SaltGeneratedArtifactRegistry;
  profile: "auto" | "salt" | "accessibility" | "migration" | "upgrade" | "all";
  status: SaltReviewReportStatus;
  workflow: SaltReviewReportWorkflow;
  scope: SaltReviewReportScope;
  phases: SaltReviewReportPhase[];
  gates: SaltReviewReportGate[];
  findings: SaltReviewReportFinding[];
  fix_candidates: WorkflowFixCandidates;
  evidence_refs: SaltEvidenceRef[];
  unsupported_claims: SaltUnsupportedClaim[];
  surface_gate: SaltReviewReportSurfaceGate;
  release_gate: SaltReviewReportReleaseGate;
  evidence_validation: SaltReviewReportEvidenceValidation;
  generated_artifact: SaltGeneratedArtifact;
}

export interface BuildSaltReviewReportInput {
  registry: SaltRegistry;
  registry_hash?: string | null;
  generated_at: string;
  generator: SaltGeneratedArtifactGenerator;
  profile?: SaltReviewReport["profile"];
  transport_used: SaltReviewReportWorkflow["transport_used"];
  review: ReviewSaltUiResult;
  contract: ReviewSaltUiWorkflowContract;
  public_contract?: PublicContract | null;
  scope: SaltReviewReportScope;
  runtime?: {
    requested: boolean;
    checked: boolean;
  };
}

function readRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readString(record: Record<string, unknown>, field: string): string {
  const value = record[field];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : "";
}

function readOptionalString(
  record: Record<string, unknown>,
  field: string,
): string | null {
  const value = readString(record, field);
  return value.length > 0 ? value : null;
}

function readStringArray(
  record: Record<string, unknown>,
  field: string,
): string[] {
  const value = record[field];
  return Array.isArray(value)
    ? value.filter(
        (entry): entry is string =>
          typeof entry === "string" && entry.trim().length > 0,
      )
    : [];
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()))].filter(
    (value) => value.length > 0,
  );
}

function reportStatus(
  review: ReviewSaltUiResult,
  evidenceGate: ReviewReportEvidenceGate,
): SaltReviewReportStatus {
  return evidenceGate.status === "unsupported"
    ? "unsupported"
    : review.decision.status;
}

function buildReviewReportPhases(
  input: BuildSaltReviewReportInput,
  evidenceGate: ReviewReportEvidenceGate,
): SaltReviewReportPhase[] {
  return [
    {
      id: "context_resolution",
      status: "complete",
      summary: "Review context was supplied by the workflow transport.",
    },
    {
      id: "source_discovery",
      status: "complete",
      summary: `${input.scope.file_count} source file(s) were included in the review scope.`,
    },
    {
      id: "salt_static_review",
      status: "complete",
      summary: `${input.review.summary.errors} error(s), ${input.review.summary.warnings} warning(s), and ${input.review.summary.infos} info item(s) were recorded.`,
    },
    {
      id: "runtime_inspection",
      status: input.runtime?.checked
        ? "complete"
        : input.runtime?.requested
          ? "unsupported"
          : "skipped",
      summary: input.runtime?.checked
        ? "Runtime evidence was included in the review pass."
        : input.runtime?.requested
          ? "Runtime evidence was requested but did not produce a completed check."
          : "Runtime evidence was not requested for this report.",
    },
    {
      id: "evidence_validation",
      status: evidenceGate.status === "validated" ? "complete" : "unsupported",
      summary:
        evidenceGate.status === "validated"
          ? "Review report claims resolved to source-backed evidence."
          : "One or more review report claims did not resolve to source-backed evidence.",
    },
  ];
}

function buildReviewReportGates(
  input: BuildSaltReviewReportInput,
  evidenceGate: ReviewReportEvidenceGate,
): SaltReviewReportGate[] {
  const hasRuntime = input.runtime?.checked === true;

  return [
    {
      id: "context_to_source_review",
      status: input.scope.file_count > 0 ? "passed" : "blocked",
      missing: input.scope.file_count > 0 ? [] : ["review source files"],
    },
    {
      id: "static_to_runtime_review",
      status: hasRuntime
        ? "passed"
        : input.runtime?.requested
          ? "unsupported"
          : "skipped",
      missing:
        input.runtime?.requested && !hasRuntime
          ? ["completed runtime evidence"]
          : [],
    },
    {
      id: "review_to_implementation_recommendation",
      status: evidenceGate.status === "validated" ? "passed" : "unsupported",
      missing: evidenceGate.missing,
    },
    {
      id: "report_evidence_validation",
      status: evidenceGate.status === "validated" ? "passed" : "unsupported",
      missing: evidenceGate.missing,
    },
  ];
}

function buildReviewReportFindings(
  review: ReviewSaltUiResult,
  evidenceGate: ReviewReportEvidenceGate,
): SaltReviewReportFinding[] {
  return (review.issues ?? []).map((issue, index) => {
    const record = readRecord(issue) ?? {};
    const id = readString(record, "id") || `review.issue.${index}`;
    const claim = evidenceGate.artifact.claims.find(
      (candidate) => candidate.id === `review-report.issue.${index}`,
    );
    const unsupportedClaim = (
      evidenceGate.artifact.unsupported_claims ?? []
    ).find(
      (candidate) =>
        candidate.id === `review-report.issue.${index}.unsupported`,
    );

    return {
      id,
      category: readOptionalString(record, "category"),
      rule: readOptionalString(record, "rule"),
      severity: readOptionalString(record, "severity"),
      title: readString(record, "title") || id,
      message:
        readString(record, "message") || readString(record, "title") || id,
      claim_id: claim?.id ?? null,
      unsupported_claim_id: unsupportedClaim?.id ?? null,
      status: claim ? "source_backed" : "unsupported",
      evidence_ref_ids: claim?.evidence_ref_ids ?? [],
      source_urls: uniqueStrings(readStringArray(record, "source_urls")),
    };
  });
}

function toEvidenceValidationMirror(
  surfaceGate: SaltReviewReportSurfaceGate,
): SaltReviewReportEvidenceValidation {
  return {
    status: surfaceGate.status,
    issues: surfaceGate.validation_issues,
    missing: surfaceGate.missing,
    unsupported_claim_count: surfaceGate.unsupported_claim_count,
  };
}

export function buildSaltReviewReport(
  input: BuildSaltReviewReportInput,
): SaltReviewReport {
  const registryHash =
    input.registry_hash ?? createSaltRegistryFingerprint(input.registry);
  const evidenceGate = buildReviewReportEvidenceGate({
    registry: input.registry,
    registry_hash: registryHash,
    issues: (input.review.issues ?? []) as unknown as ValidationIssue[],
    missing_data: input.review.missing_data,
    generated_at: input.generated_at,
    generator: input.generator,
  });
  const surfaceGate = serializeGeneratedSaltArtifactSurfaceGate(evidenceGate);
  const releaseGate = validateGeneratedArtifactReleaseGate({
    artifact: evidenceGate.artifact,
    registry: input.registry,
  });

  return {
    contract: SALT_REVIEW_REPORT_CONTRACT,
    generated_at: input.generated_at,
    generator: input.generator,
    registry: {
      version: input.registry.version,
      hash: registryHash,
      generated_at: input.registry.generated_at,
    },
    profile: input.profile ?? "auto",
    status: reportStatus(input.review, evidenceGate),
    workflow: {
      id: "review",
      transport_used: input.transport_used,
      public_status: input.public_contract?.status ?? null,
      decision_status: input.contract.decision.status,
      next_required_action: input.public_contract?.next_required_action ?? null,
      rule_ids: input.contract.rule_ids,
    },
    scope: input.scope,
    phases: buildReviewReportPhases(input, evidenceGate),
    gates: buildReviewReportGates(input, evidenceGate),
    findings: buildReviewReportFindings(input.review, evidenceGate),
    fix_candidates: input.contract.fix_candidates,
    evidence_refs: evidenceGate.artifact.evidence_refs,
    unsupported_claims: evidenceGate.artifact.unsupported_claims ?? [],
    surface_gate: surfaceGate,
    release_gate: releaseGate,
    evidence_validation: toEvidenceValidationMirror(surfaceGate),
    generated_artifact: evidenceGate.artifact,
  };
}
