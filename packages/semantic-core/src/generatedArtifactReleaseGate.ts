import type {
  SaltEvidenceValidationIssue,
  SaltGeneratedArtifact,
  SaltGeneratedArtifactKind,
} from "./evidence.js";
import {
  type SerializedGeneratedSaltArtifactSurfaceGate,
  serializeGeneratedSaltArtifactSurfaceGate,
  validateGeneratedSaltArtifactSurface,
} from "./generatedArtifactSurface.js";
import { createSaltRegistryFingerprint } from "./registry/fingerprint.js";
import type { SaltRegistry } from "./types.js";

export const SALT_GENERATED_ARTIFACT_RELEASE_GATE_CONTRACT =
  "salt_generated_artifact_release_gate_v1" as const;
export const SALT_GENERATED_ARTIFACT_RELEASE_GATE_BATCH_CONTRACT =
  "salt_generated_artifact_release_gate_batch_v1" as const;

export type SaltGeneratedArtifactReleaseGateStatus =
  | "passed"
  | "blocked"
  | "invalid";

export type SaltGeneratedArtifactReleaseGateTargetKind =
  SaltGeneratedArtifactKind;

export interface SaltGeneratedArtifactReleaseGateCoverageGap {
  kind: string;
  id: string;
  status: "unsupported";
  missing: string[];
  evidence_ref_ids: string[];
}

export interface SaltGeneratedArtifactReleaseGate {
  contract: typeof SALT_GENERATED_ARTIFACT_RELEASE_GATE_CONTRACT;
  status: SaltGeneratedArtifactReleaseGateStatus;
  releasable: boolean;
  artifact_path?: string | null;
  artifact_id: string | null;
  artifact_kind: SaltGeneratedArtifactKind | null;
  target_kind: SaltGeneratedArtifactReleaseGateTargetKind | null;
  surface_gate: SerializedGeneratedSaltArtifactSurfaceGate | null;
  validation_issues: SaltEvidenceValidationIssue[];
  unsupported_claim_count: number;
  missing: string[];
}

export interface SaltGeneratedArtifactReleaseGateBatchTarget {
  artifact: unknown;
  artifact_path?: string | null;
}

export interface SaltGeneratedArtifactReleaseGateBatch {
  contract: typeof SALT_GENERATED_ARTIFACT_RELEASE_GATE_BATCH_CONTRACT;
  status: SaltGeneratedArtifactReleaseGateStatus;
  releasable: boolean;
  artifact_path?: string | null;
  target_count: number;
  passed_count: number;
  blocked_count: number;
  invalid_count: number;
  unsupported_claim_count: number;
  validation_issue_count: number;
  coverage_gap_count: number;
  coverage_gaps: SaltGeneratedArtifactReleaseGateCoverageGap[];
  missing: string[];
  gates: SaltGeneratedArtifactReleaseGate[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isGeneratedArtifact(value: unknown): value is SaltGeneratedArtifact {
  return (
    isRecord(value) &&
    value.contract === "salt_generated_artifact_v1" &&
    typeof value.artifact_kind === "string" &&
    typeof value.id === "string" &&
    Array.isArray(value.claims) &&
    Array.isArray(value.evidence_refs)
  );
}

function readGeneratedArtifact(value: unknown): SaltGeneratedArtifact | null {
  if (isGeneratedArtifact(value)) {
    return value;
  }

  if (isRecord(value) && isGeneratedArtifact(value.generated_artifact)) {
    return value.generated_artifact;
  }

  return null;
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()))].filter(
    (value) => value.length > 0,
  );
}

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateArtifactRegistryFreshness(input: {
  artifact: SaltGeneratedArtifact;
  registry: SaltRegistry;
}): SaltEvidenceValidationIssue[] {
  const issues: SaltEvidenceValidationIssue[] = [];
  const currentHash = createSaltRegistryFingerprint(input.registry);
  const artifactHash = input.artifact.registry.hash ?? null;

  if (
    hasText(artifactHash) &&
    artifactHash.startsWith("sha256:") &&
    artifactHash !== currentHash
  ) {
    issues.push({
      code: "stale_registry",
      message: `Generated artifact '${input.artifact.id}' was built from registry hash '${artifactHash}', but the current registry hash is '${currentHash}'.`,
      path: "registry.hash",
    });
  }

  if (
    hasText(input.artifact.registry.version) &&
    input.artifact.registry.version !== input.registry.version
  ) {
    issues.push({
      code: "stale_registry",
      message: `Generated artifact '${input.artifact.id}' was built from registry version '${input.artifact.registry.version}', but the current registry version is '${input.registry.version}'.`,
      path: "registry.version",
    });
  }

  if (
    hasText(input.artifact.registry.generated_at) &&
    input.artifact.registry.generated_at !== input.registry.generated_at
  ) {
    issues.push({
      code: "stale_registry",
      message: `Generated artifact '${input.artifact.id}' was built from registry timestamp '${input.artifact.registry.generated_at}', but the current registry timestamp is '${input.registry.generated_at}'.`,
      path: "registry.generated_at",
    });
  }

  return issues;
}

export function validateGeneratedArtifactReleaseGate(input: {
  artifact: unknown;
  registry: SaltRegistry;
  artifact_path?: string | null;
}): SaltGeneratedArtifactReleaseGate {
  const artifact = readGeneratedArtifact(input.artifact);

  if (!artifact) {
    return {
      contract: SALT_GENERATED_ARTIFACT_RELEASE_GATE_CONTRACT,
      status: "invalid",
      releasable: false,
      artifact_path: input.artifact_path ?? null,
      artifact_id: null,
      artifact_kind: null,
      target_kind: null,
      surface_gate: null,
      validation_issues: [],
      unsupported_claim_count: 0,
      missing: [
        "Input must be a salt_generated_artifact_v1 payload or contain generated_artifact.",
      ],
    };
  }

  const surfaceGate = serializeGeneratedSaltArtifactSurfaceGate(
    validateGeneratedSaltArtifactSurface({
      artifact,
      registry: input.registry,
      artifact_label: `${artifact.artifact_kind} artifact`,
    }),
  );
  const freshnessIssues = validateArtifactRegistryFreshness({
    artifact,
    registry: input.registry,
  });
  const validationIssues = [
    ...surfaceGate.validation_issues,
    ...freshnessIssues,
  ];
  const missing = uniqueStrings([
    ...surfaceGate.missing,
    ...freshnessIssues.map(
      (issue) =>
        `${artifact.artifact_kind} artifact evidence validation failed: ${issue.code} at ${issue.path}`,
    ),
  ]);
  const releasable =
    surfaceGate.status === "validated" && freshnessIssues.length === 0;

  return {
    contract: SALT_GENERATED_ARTIFACT_RELEASE_GATE_CONTRACT,
    status: releasable ? "passed" : "blocked",
    releasable,
    artifact_path: input.artifact_path ?? null,
    artifact_id: artifact.id,
    artifact_kind: artifact.artifact_kind,
    target_kind: artifact.artifact_kind,
    surface_gate: surfaceGate,
    validation_issues: validationIssues,
    unsupported_claim_count: surfaceGate.unsupported_claim_count,
    missing,
  };
}

export function validateGeneratedArtifactReleaseGateBatch(input: {
  targets: SaltGeneratedArtifactReleaseGateBatchTarget[];
  registry: SaltRegistry;
  artifact_path?: string | null;
  coverage_gaps?: SaltGeneratedArtifactReleaseGateCoverageGap[];
}): SaltGeneratedArtifactReleaseGateBatch {
  const gates = input.targets.map((target) =>
    validateGeneratedArtifactReleaseGate({
      artifact: target.artifact,
      registry: input.registry,
      artifact_path: target.artifact_path,
    }),
  );
  const coverageGaps = input.coverage_gaps ?? [];
  const passedCount = gates.filter((gate) => gate.status === "passed").length;
  const blockedCount = gates.filter((gate) => gate.status === "blocked").length;
  const invalidCount = gates.filter((gate) => gate.status === "invalid").length;
  const unsupportedClaimCount = gates.reduce(
    (total, gate) => total + gate.unsupported_claim_count,
    0,
  );
  const validationIssueCount = gates.reduce(
    (total, gate) => total + gate.validation_issues.length,
    0,
  );
  const missing = uniqueStrings([
    ...coverageGaps.flatMap((gap) =>
      gap.missing.length > 0
        ? gap.missing.map((missing) => `${gap.id}: ${missing}`)
        : [`${gap.id}: unsupported coverage gap`],
    ),
    ...gates.flatMap((gate) => gate.missing),
    ...(gates.length === 0 ? ["No generated Salt artifacts were found."] : []),
  ]);
  const releasable =
    gates.length > 0 &&
    invalidCount === 0 &&
    blockedCount === 0 &&
    coverageGaps.length === 0;

  return {
    contract: SALT_GENERATED_ARTIFACT_RELEASE_GATE_BATCH_CONTRACT,
    status: releasable
      ? "passed"
      : invalidCount === gates.length && gates.length > 0
        ? "invalid"
        : "blocked",
    releasable,
    artifact_path: input.artifact_path ?? null,
    target_count: gates.length,
    passed_count: passedCount,
    blocked_count: blockedCount,
    invalid_count: invalidCount,
    unsupported_claim_count: unsupportedClaimCount,
    validation_issue_count: validationIssueCount,
    coverage_gap_count: coverageGaps.length,
    coverage_gaps: coverageGaps,
    missing,
    gates,
  };
}
