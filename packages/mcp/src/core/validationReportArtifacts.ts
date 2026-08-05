import {
  deduplicateSaltEvidenceRefs,
  SALT_GENERATED_ARTIFACT_CONTRACT,
  type SaltEvidenceClaimKind,
  type SaltEvidenceRef,
  type SaltGeneratedArtifact,
  type SaltGeneratedArtifactGenerator,
  type SaltGeneratedClaim,
  type SaltUnsupportedClaim,
} from "./evidence.js";
import {
  type GeneratedSaltArtifactSurfaceGate,
  validateGeneratedSaltArtifactSurface,
} from "./generatedArtifactSurface.js";
import { toSaltGeneratedArtifactRegistry } from "./registry/fingerprint.js";
import type { ValidationIssue } from "./tools/validation/shared.js";
import type { SaltRegistry } from "./types.js";

export interface BuildValidationReportArtifactInput {
  registry: SaltRegistry;
  issues: ValidationIssue[];
  missing_data?: string[];
  generated_at?: string | null;
  generator: SaltGeneratedArtifactGenerator;
}

export type ValidationReportEvidenceGate = GeneratedSaltArtifactSurfaceGate;

function issueClaimKind(issue: ValidationIssue): SaltEvidenceClaimKind {
  const [firstEvidenceRef] = issue.evidence_refs ?? [];
  if (firstEvidenceRef) {
    return firstEvidenceRef.claim_kind;
  }

  switch (issue.category) {
    case "primitive-choice":
      return "component";
    case "composition":
      return "composition";
    case "accessibility":
      return "accessibility";
    case "catalog-status":
      return "status";
    case "tokens":
      return "token";
    case "deprecated":
      return "prop";
  }
}

function issueText(issue: ValidationIssue): string {
  return `${issue.title}: ${issue.message}`;
}

export function buildValidationReportArtifact(
  input: BuildValidationReportArtifactInput,
): SaltGeneratedArtifact {
  const claims: SaltGeneratedClaim[] = [];
  const evidenceRefs: SaltEvidenceRef[] = [];
  const unsupportedClaims: SaltUnsupportedClaim[] = [];

  input.issues.forEach((issue, index) => {
    const issueEvidenceRefs = deduplicateSaltEvidenceRefs(
      issue.evidence_refs ?? [],
    );
    const fieldPath = `issues.${issue.id}`;

    if (issueEvidenceRefs.length === 0) {
      unsupportedClaims.push({
        id: `validation-report.issue.${index}.unsupported`,
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
      id: `validation-report.issue.${index}`,
      kind: issueClaimKind(issue),
      text: issueText(issue),
      field_path: fieldPath,
      evidence_ref_ids: issueEvidenceRefs.map((ref) => ref.id),
    });
  });

  input.missing_data?.forEach((message, index) => {
    unsupportedClaims.push({
      id: `validation-report.missing-data.${index}.unsupported`,
      kind: "status",
      text: message,
      field_path: `missing_data.${index}`,
      reason:
        "The validator recorded missing data instead of emitting a source-backed Salt claim.",
    });
  });

  return {
    contract: SALT_GENERATED_ARTIFACT_CONTRACT,
    artifact_kind: "validation-report",
    id: "validation-report.validate-salt-usage",
    generated_at: input.generated_at ?? null,
    generator: input.generator,
    registry: toSaltGeneratedArtifactRegistry(input.registry),
    claims,
    evidence_refs: deduplicateSaltEvidenceRefs(evidenceRefs),
    unsupported_claims: unsupportedClaims,
  };
}

export function buildValidationReportEvidenceGate(
  input: BuildValidationReportArtifactInput,
): ValidationReportEvidenceGate {
  const artifact = buildValidationReportArtifact(input);
  return validateGeneratedSaltArtifactSurface({
    artifact,
    registry: input.registry,
    artifact_label: "validation report",
  });
}
