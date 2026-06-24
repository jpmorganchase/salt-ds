import {
  SALT_GENERATED_ARTIFACT_CONTRACT,
  type SaltEvidenceClaimKind,
  type SaltEvidenceRef,
  type SaltGeneratedArtifact,
  type SaltGeneratedClaim,
  type SaltUnsupportedClaim,
} from "./evidence.js";
import {
  type GeneratedSaltArtifactSurfaceGate,
  validateGeneratedSaltArtifactSurface,
} from "./generatedArtifactSurface.js";
import { createSaltRegistryFingerprint } from "./registry/fingerprint.js";
import type { ValidationIssue } from "./tools/validation/shared.js";
import type { SaltRegistry } from "./types.js";

export interface BuildReviewReportArtifactInput {
  registry: Pick<SaltRegistry, "version" | "generated_at">;
  issues: ValidationIssue[];
  missing_data?: string[];
  generated_at: string;
  generator: {
    name: string;
    version?: string | null;
  };
  registry_hash?: string | null;
}

export type ReviewReportEvidenceGate = GeneratedSaltArtifactSurfaceGate;

function uniqueEvidenceRefs(refs: SaltEvidenceRef[]): SaltEvidenceRef[] {
  return refs.filter(
    (ref, index) =>
      refs.findIndex((candidate) => candidate.id === ref.id) === index,
  );
}

function issueClaimKind(issue: ValidationIssue): SaltEvidenceClaimKind {
  const [firstEvidenceRef] = issue.evidence_refs ?? [];
  if (firstEvidenceRef) {
    return firstEvidenceRef.claim_kind;
  }

  switch (issue.category) {
    case "accessibility":
      return "accessibility";
    case "catalog-status":
      return "status";
    case "tokens":
      return "token";
    default:
      return "workflow";
  }
}

function issueText(issue: ValidationIssue): string {
  return `${issue.title}: ${issue.message}`;
}

export function buildReviewReportArtifact(
  input: BuildReviewReportArtifactInput,
): SaltGeneratedArtifact {
  const claims: SaltGeneratedClaim[] = [];
  const evidenceRefs: SaltEvidenceRef[] = [];
  const unsupportedClaims: SaltUnsupportedClaim[] = [];

  input.issues.forEach((issue, index) => {
    const issueEvidenceRefs = uniqueEvidenceRefs(issue.evidence_refs ?? []);
    const fieldPath = `issues.${issue.id}`;

    if (issueEvidenceRefs.length === 0) {
      unsupportedClaims.push({
        id: `review-report.issue.${index}.unsupported`,
        kind: issueClaimKind(issue),
        text: issueText(issue),
        field_path: fieldPath,
        reason:
          "Validation issue did not include structured EvidenceRef provenance.",
      });
      return;
    }

    evidenceRefs.push(...issueEvidenceRefs);
    claims.push({
      id: `review-report.issue.${index}`,
      kind: issueClaimKind(issue),
      text: issueText(issue),
      field_path: fieldPath,
      evidence_ref_ids: issueEvidenceRefs.map((ref) => ref.id),
    });
  });

  input.missing_data?.forEach((message, index) => {
    unsupportedClaims.push({
      id: `review-report.missing-data.${index}.unsupported`,
      kind: "workflow",
      text: message,
      field_path: `missing_data.${index}`,
      reason:
        "The review recorded missing data instead of emitting a source-backed Salt claim.",
    });
  });

  return {
    contract: SALT_GENERATED_ARTIFACT_CONTRACT,
    artifact_kind: "review-report",
    id: "review-report.validation",
    generated_at: input.generated_at,
    generator: input.generator,
    registry: {
      version: input.registry.version,
      hash: input.registry_hash ?? null,
      generated_at: input.registry.generated_at,
    },
    claims,
    evidence_refs: uniqueEvidenceRefs(evidenceRefs),
    unsupported_claims: unsupportedClaims,
  };
}

export function buildReviewReportEvidenceGate(
  input: BuildReviewReportArtifactInput & {
    registry: SaltRegistry;
  },
): ReviewReportEvidenceGate {
  const artifact = buildReviewReportArtifact({
    ...input,
    registry_hash:
      input.registry_hash ?? createSaltRegistryFingerprint(input.registry),
  });
  return validateGeneratedSaltArtifactSurface({
    artifact,
    registry: input.registry,
    artifact_label: "review report",
  });
}
