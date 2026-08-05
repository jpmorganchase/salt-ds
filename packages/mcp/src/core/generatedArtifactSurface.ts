import type {
  SaltEvidenceValidationIssue,
  SaltGeneratedArtifact,
  SaltGeneratedArtifactKind,
} from "./evidence.js";
import { validateGeneratedArtifactRegistryEvidence } from "./generatedArtifactValidation.js";
import type { SaltRegistry } from "./types.js";

export type GeneratedSaltArtifactSurfaceStatus =
  | "evidence_linked"
  | "unsupported";
export type GeneratedSaltArtifactValidationScope = "structural_provenance";

export interface ValidateGeneratedSaltArtifactSurfaceInput {
  artifact: SaltGeneratedArtifact;
  registry: SaltRegistry;
  artifact_label?: string;
}

export interface GeneratedSaltArtifactSurfaceGate {
  status: GeneratedSaltArtifactSurfaceStatus;
  validation_scope: GeneratedSaltArtifactValidationScope;
  artifact: SaltGeneratedArtifact;
  validation_issues: SaltEvidenceValidationIssue[];
  unsupported_claim_count: number;
  missing: string[];
}

export interface SerializedGeneratedSaltArtifactSurfaceGate {
  status: GeneratedSaltArtifactSurfaceStatus;
  validation_scope: GeneratedSaltArtifactValidationScope;
  validation_issues: SaltEvidenceValidationIssue[];
  missing: string[];
  unsupported_claim_count: number;
  artifact_id: string;
  artifact_kind: SaltGeneratedArtifactKind;
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()))].filter(
    (value) => value.length > 0,
  );
}

export function serializeGeneratedSaltArtifactSurfaceGate(
  gate: GeneratedSaltArtifactSurfaceGate,
): SerializedGeneratedSaltArtifactSurfaceGate {
  return {
    status: gate.status,
    validation_scope: gate.validation_scope,
    validation_issues: gate.validation_issues,
    missing: gate.missing,
    unsupported_claim_count: gate.unsupported_claim_count,
    artifact_id: gate.artifact.id,
    artifact_kind: gate.artifact.artifact_kind,
  };
}

export function validateGeneratedSaltArtifactSurface(
  input: ValidateGeneratedSaltArtifactSurfaceInput,
): GeneratedSaltArtifactSurfaceGate {
  const artifactLabel = input.artifact_label ?? input.artifact.artifact_kind;
  const validationIssues = validateGeneratedArtifactRegistryEvidence(
    input.artifact,
    input.registry,
  );
  const unsupportedClaimCount = input.artifact.unsupported_claims?.length ?? 0;
  const missing = uniqueStrings([
    ...(unsupportedClaimCount > 0
      ? [`${artifactLabel} has ${unsupportedClaimCount} unsupported claim(s)`]
      : []),
    ...validationIssues.map(
      (issue) =>
        `${artifactLabel} structural provenance validation failed: ${issue.code} at ${issue.path}`,
    ),
  ]);

  return {
    status:
      unsupportedClaimCount === 0 && validationIssues.length === 0
        ? "evidence_linked"
        : "unsupported",
    validation_scope: "structural_provenance",
    artifact: input.artifact,
    validation_issues: validationIssues,
    unsupported_claim_count: unsupportedClaimCount,
    missing,
  };
}
