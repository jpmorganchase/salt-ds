import type { SaltEvidenceValidationIssue } from "./evidence.js";
import { validateGeneratedArtifactReleaseGate } from "./generatedArtifactReleaseGate.js";
import { validateGeneratedSaltArtifactSurface } from "./generatedArtifactSurface.js";
import { createSaltRegistryFingerprint } from "./registry/fingerprint.js";
import {
  SALT_REVIEW_REPORT_CONTRACT,
  type SaltReviewReport,
} from "./reviewReports.js";
import type { SaltRegistry } from "./types.js";

export const SALT_REVIEW_REPORT_VALIDATION_CONTRACT =
  "salt_review_report_validation_v1" as const;
export const SALT_REVIEW_RESUME_CONTRACT = "salt_review_resume_v1" as const;

export interface SaltReviewResume {
  contract: typeof SALT_REVIEW_RESUME_CONTRACT;
  status: "ready" | "stale" | "unsupported" | "invalid";
  report_path: string;
  reusable_evidence_ref_ids: string[];
  unsupported_claim_ids: string[];
  next_command: string;
  missing: string[];
}

export interface SaltReviewReportValidationResult {
  contract: typeof SALT_REVIEW_REPORT_VALIDATION_CONTRACT;
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
  resume: SaltReviewResume;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableJson(entry)).join(",")}]`;
  }

  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function registryMatches(report: SaltReviewReport, registry: SaltRegistry) {
  const currentHash = createSaltRegistryFingerprint(registry);

  return (
    report.registry.version === registry.version &&
    report.registry.generated_at === registry.generated_at &&
    (report.registry.hash ?? null) === currentHash
  );
}

function validationStatusToResumeStatus(
  status: SaltReviewReportValidationResult["status"],
): SaltReviewResume["status"] {
  switch (status) {
    case "current":
      return "ready";
    case "stale":
      return "stale";
    case "unsupported":
      return "unsupported";
    case "invalid":
      return "invalid";
  }
}

function buildReviewResume(input: {
  report: SaltReviewReport | null;
  report_path: string;
  status: SaltReviewReportValidationResult["status"];
  missing: string[];
}): SaltReviewResume {
  return {
    contract: SALT_REVIEW_RESUME_CONTRACT,
    status: validationStatusToResumeStatus(input.status),
    report_path: input.report_path,
    reusable_evidence_ref_ids:
      input.status === "current"
        ? (input.report?.evidence_refs.map((ref) => ref.id) ?? [])
        : [],
    unsupported_claim_ids:
      input.report?.unsupported_claims.map((claim) => claim.id) ?? [],
    next_command:
      input.status === "current"
        ? `review_salt_ui via the @salt-ds/mcp server (args: { report_path: "${input.report_path}" })`
        : `read the salt://review/validation/${encodeURIComponent(input.report_path)} MCP resource to inspect the validation result`,
    missing: input.missing,
  };
}

export function validateSaltReviewReport(input: {
  report: unknown;
  registry: SaltRegistry;
  report_path: string;
}): SaltReviewReportValidationResult {
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
    input.report.contract !== SALT_REVIEW_REPORT_CONTRACT ||
    !isRecord(input.report.generated_artifact)
  ) {
    return {
      contract: SALT_REVIEW_REPORT_VALIDATION_CONTRACT,
      status: "invalid",
      current: false,
      supported: false,
      report_path: input.report_path,
      registry: baseRegistry,
      validation_issues: [],
      unsupported_claim_count: 0,
      mismatches: ["contract"],
      missing: ["report is not a salt_review_report_v1 payload"],
      resume: buildReviewResume({
        report: null,
        report_path: input.report_path,
        status: "invalid",
        missing: ["report is not a salt_review_report_v1 payload"],
      }),
    };
  }

  const report = input.report as unknown as SaltReviewReport;
  const surfaceGate = validateGeneratedSaltArtifactSurface({
    artifact: report.generated_artifact,
    registry: input.registry,
    artifact_label: "review report",
  });
  const mismatches: string[] = [];
  const expectedSurfaceGate = {
    status: surfaceGate.status,
    validation_issues: surfaceGate.validation_issues,
    missing: surfaceGate.missing,
    unsupported_claim_count: surfaceGate.unsupported_claim_count,
    artifact_id: surfaceGate.artifact.id,
    artifact_kind: surfaceGate.artifact.artifact_kind,
  };
  const expectedEvidenceValidation = {
    status: expectedSurfaceGate.status,
    issues: expectedSurfaceGate.validation_issues,
    missing: expectedSurfaceGate.missing,
    unsupported_claim_count: expectedSurfaceGate.unsupported_claim_count,
  };
  const expectedReleaseGate = validateGeneratedArtifactReleaseGate({
    artifact: report.generated_artifact,
    registry: input.registry,
  });

  if (!registryMatches(report, input.registry)) {
    mismatches.push("registry");
  }

  if (stableJson(report.surface_gate) !== stableJson(expectedSurfaceGate)) {
    mismatches.push("surface_gate");
  }

  if (
    stableJson(report.evidence_validation) !==
    stableJson(expectedEvidenceValidation)
  ) {
    mismatches.push("evidence_validation");
  }

  if (stableJson(report.release_gate) !== stableJson(expectedReleaseGate)) {
    mismatches.push("release_gate");
  }

  const supported = surfaceGate.status === "validated";
  const current = supported && mismatches.length === 0;
  const status = !supported ? "unsupported" : current ? "current" : "stale";
  const missing = surfaceGate.missing;

  return {
    contract: SALT_REVIEW_REPORT_VALIDATION_CONTRACT,
    status,
    current,
    supported,
    report_path: input.report_path,
    registry: {
      version: report.registry.version ?? null,
      hash: report.registry.hash ?? null,
      generated_at: report.registry.generated_at ?? null,
      current_version: input.registry.version,
      current_hash: currentHash,
      current_generated_at: input.registry.generated_at,
    },
    validation_issues: surfaceGate.validation_issues,
    unsupported_claim_count: surfaceGate.unsupported_claim_count,
    mismatches,
    missing,
    resume: buildReviewResume({
      report,
      report_path: input.report_path,
      status,
      missing,
    }),
  };
}
