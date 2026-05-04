import { buildContextCoverageAudit } from "./contextCoverageAudit.js";
import type { SaltGeneratedContextHealth } from "./contextChecks.js";
import {
  buildDefaultPromptHostInstructionSurfaces,
  type SaltPromptHostInstructionSurface,
} from "./promptHostInstructionSurfaces.js";
import {
  SALT_GENERATED_ARTIFACT_CONTRACT,
  type SaltEvidenceRef,
  type SaltGeneratedArtifact,
  type SaltGeneratedArtifactGenerator,
  type SaltGeneratedArtifactRegistry,
  type SaltUnsupportedClaim,
} from "./evidence.js";
import {
  type SaltGeneratedArtifactReleaseGate,
  validateGeneratedArtifactReleaseGate,
} from "./generatedArtifactReleaseGate.js";
import { createSaltRegistryFingerprint } from "./registry/fingerprint.js";
import type { SaltWorkflowFollowupReport } from "./workflowFollowupReports.js";
import type { SaltRegistry } from "./types.js";

export const SALT_AI_EVIDENCE_CLOSURE_REPORT_CONTRACT =
  "salt_ai_evidence_closure_report_v1" as const;

export type SaltAiEvidenceClosureSliceId =
  | "unsupported-surface-inventory"
  | "schema-contract-lock"
  | "migration-upgrade-followup"
  | "prompt-host-instruction-closure"
  | "context-coverage-closure"
  | "release-gate-everywhere"
  | "cli-mcp-skill-parity"
  | "hardcoded-fact-sweep"
  | "doctor-info-setup-state"
  | "final-verification";

export type SaltAiEvidenceClosureSliceStatus =
  | "ready"
  | "degraded"
  | "unsupported";

export interface SaltAiEvidenceClosureDocsRegistryGap {
  slice_id: SaltAiEvidenceClosureSliceId;
  kind: string;
  id: string;
  status: "unsupported";
  missing: string[];
  evidence_ref_ids: string[];
}

export interface SaltAiEvidenceClosureSlice {
  id: SaltAiEvidenceClosureSliceId;
  status: SaltAiEvidenceClosureSliceStatus;
  evidence_sources: Array<
    | "semantic_core"
    | "registry"
    | "generated_context"
    | "release_gate"
    | "workflow_report"
    | "docs_gap_register"
    | "test_guardrail"
  >;
  missing: string[];
  docs_registry_gaps: SaltAiEvidenceClosureDocsRegistryGap[];
}

export interface SaltAiEvidenceClosureReport {
  contract: typeof SALT_AI_EVIDENCE_CLOSURE_REPORT_CONTRACT;
  generated_at: string;
  generator: SaltGeneratedArtifactGenerator;
  registry: SaltGeneratedArtifactRegistry;
  status: "ready" | "degraded";
  ready_slice_count: number;
  degraded_slice_count: number;
  unsupported_slice_count: number;
  slices: SaltAiEvidenceClosureSlice[];
  evidence_refs: SaltEvidenceRef[];
  unsupported_claims: SaltUnsupportedClaim[];
  release_gate: SaltGeneratedArtifactReleaseGate;
  generated_artifact: SaltGeneratedArtifact;
}

export interface BuildSaltAiEvidenceClosureReportInput {
  registry: SaltRegistry;
  registry_hash?: string | null;
  generated_at: string;
  generator: SaltGeneratedArtifactGenerator;
  generated_context?: SaltGeneratedContextHealth | null;
  workflow_followup_reports?: SaltWorkflowFollowupReport[];
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()))].filter(
    (value) => value.length > 0,
  );
}

function statusFromMissing(
  missing: string[],
  unsupported = false,
): SaltAiEvidenceClosureSliceStatus {
  if (unsupported) {
    return "unsupported";
  }

  return missing.length > 0 ? "degraded" : "ready";
}

function toClosureGap(
  sliceId: SaltAiEvidenceClosureSliceId,
  gap: {
    kind: string;
    id: string;
    missing: string[];
    evidence_ref_ids: string[];
  },
): SaltAiEvidenceClosureDocsRegistryGap {
  return {
    slice_id: sliceId,
    kind: gap.kind,
    id: gap.id,
    status: "unsupported",
    missing: gap.missing,
    evidence_ref_ids: gap.evidence_ref_ids,
  };
}

function promptHostInstructionSurfaceMissing(
  surfaces: SaltPromptHostInstructionSurface[],
): string[] {
  return uniqueStrings(
    surfaces.flatMap((surface) => [
      ...surface.surface_gate.missing,
    ]),
  );
}

function buildSlice(input: {
  id: SaltAiEvidenceClosureSliceId;
  status?: SaltAiEvidenceClosureSliceStatus;
  evidence_sources: SaltAiEvidenceClosureSlice["evidence_sources"];
  missing?: string[];
  gaps?: SaltAiEvidenceClosureDocsRegistryGap[];
}): SaltAiEvidenceClosureSlice {
  const missing = uniqueStrings(input.missing ?? []);

  return {
    id: input.id,
    status: input.status ?? statusFromMissing(missing),
    evidence_sources: input.evidence_sources,
    missing,
    docs_registry_gaps: input.gaps ?? [],
  };
}

function buildUnsupportedClaims(
  slices: SaltAiEvidenceClosureSlice[],
): SaltUnsupportedClaim[] {
  return slices
    .filter((slice) => slice.status !== "ready")
    .map((slice): SaltUnsupportedClaim => ({
      id: `ai-evidence-closure.${slice.id}.unsupported`,
      kind: "workflow",
      text: `AI evidence closure slice '${slice.id}' is ${slice.status}.`,
      field_path: `slices.${slice.id}`,
      reason:
        slice.missing.length > 0
          ? slice.missing.join("; ")
          : `AI evidence closure slice '${slice.id}' is not ready.`,
    }));
}

export function buildSaltAiEvidenceClosureReport(
  input: BuildSaltAiEvidenceClosureReportInput,
): SaltAiEvidenceClosureReport {
  const registryHash =
    input.registry_hash ?? createSaltRegistryFingerprint(input.registry);
  const contextCoverage = buildContextCoverageAudit({
    registry: input.registry,
    generated_at: input.generated_at,
    generator: input.generator,
  });
  const promptHostInstructionSurfaces =
    buildDefaultPromptHostInstructionSurfaces({
    registry: input.registry,
    generated_at: input.generated_at,
    generator: input.generator,
    registry_hash: registryHash,
  });
  const contextCoverageGaps = contextCoverage.docs_registry_gaps.map((gap) =>
    toClosureGap("context-coverage-closure", gap),
  );
  const generatedContextMissing = input.generated_context
    ? uniqueStrings([
        ...input.generated_context.missingOutputs,
        ...input.generated_context.coverageGaps.flatMap((gap) => gap.missing),
      ])
    : ["generated context health"];
  const workflowFollowupReports = input.workflow_followup_reports ?? [];
  const followupMissing = uniqueStrings(
    workflowFollowupReports.length > 0
      ? workflowFollowupReports.flatMap((report) => report.missing)
      : [
          "migration follow-up report",
          "upgrade follow-up report",
        ],
  );
  const followupUnsupported = workflowFollowupReports.some(
    (report) => report.status === "unsupported",
  );
  const promptInstructionMissing = promptHostInstructionSurfaceMissing(
    promptHostInstructionSurfaces,
  );
  const promptInstructionGaps = promptHostInstructionSurfaces
    .filter((surface) => surface.status !== "validated")
    .map((surface) =>
      toClosureGap("prompt-host-instruction-closure", {
        kind: surface.surface.kind,
        id: surface.surface.id,
        missing:
          surface.surface_gate.missing.length > 0
            ? surface.surface_gate.missing
            : [`${surface.surface.name} surface is unsupported`],
        evidence_ref_ids: surface.surface.evidence_ref_ids,
      }),
    );
  const slices = [
    buildSlice({
      id: "unsupported-surface-inventory",
      evidence_sources: ["semantic_core", "docs_gap_register"],
      missing: [],
    }),
    buildSlice({
      id: "schema-contract-lock",
      evidence_sources: ["semantic_core", "test_guardrail"],
      missing: [],
    }),
    buildSlice({
      id: "migration-upgrade-followup",
      status: statusFromMissing(followupMissing, followupUnsupported),
      evidence_sources: ["semantic_core", "workflow_report"],
      missing: followupMissing,
    }),
    buildSlice({
      id: "prompt-host-instruction-closure",
      evidence_sources: ["semantic_core", "test_guardrail"],
      missing: promptInstructionMissing,
      gaps: promptInstructionGaps,
    }),
    buildSlice({
      id: "context-coverage-closure",
      evidence_sources: ["semantic_core", "registry", "generated_context"],
      missing: contextCoverage.docs_registry_gaps.flatMap((gap) => gap.missing),
      gaps: contextCoverageGaps,
    }),
    buildSlice({
      id: "release-gate-everywhere",
      evidence_sources: ["semantic_core", "release_gate"],
      missing: generatedContextMissing,
    }),
    buildSlice({
      id: "cli-mcp-skill-parity",
      evidence_sources: ["semantic_core", "test_guardrail"],
      missing: [],
    }),
    buildSlice({
      id: "hardcoded-fact-sweep",
      evidence_sources: ["test_guardrail", "docs_gap_register"],
      missing: [],
    }),
    buildSlice({
      id: "doctor-info-setup-state",
      evidence_sources: ["semantic_core", "generated_context"],
      missing:
        input.generated_context && input.generated_context.status !== "invalid"
          ? []
          : ["doctor/info generated context state"],
    }),
    buildSlice({
      id: "final-verification",
      evidence_sources: ["test_guardrail"],
      missing: [],
    }),
  ];
  const unsupportedClaims = buildUnsupportedClaims(slices);
  const generatedArtifact: SaltGeneratedArtifact = {
    contract: SALT_GENERATED_ARTIFACT_CONTRACT,
    artifact_kind: "validation-report",
    id: "ai-evidence-closure-report",
    generated_at: input.generated_at,
    generator: input.generator,
    registry: {
      version: input.registry.version,
      hash: registryHash,
      generated_at: input.registry.generated_at,
    },
    claims: [],
    evidence_refs: [],
    unsupported_claims: unsupportedClaims,
  };
  const readySliceCount = slices.filter(
    (slice) => slice.status === "ready",
  ).length;
  const degradedSliceCount = slices.filter(
    (slice) => slice.status === "degraded",
  ).length;
  const unsupportedSliceCount = slices.filter(
    (slice) => slice.status === "unsupported",
  ).length;

  return {
    contract: SALT_AI_EVIDENCE_CLOSURE_REPORT_CONTRACT,
    generated_at: input.generated_at,
    generator: input.generator,
    registry: generatedArtifact.registry,
    status:
      degradedSliceCount === 0 && unsupportedSliceCount === 0
        ? "ready"
        : "degraded",
    ready_slice_count: readySliceCount,
    degraded_slice_count: degradedSliceCount,
    unsupported_slice_count: unsupportedSliceCount,
    slices,
    evidence_refs: [],
    unsupported_claims: unsupportedClaims,
    release_gate: validateGeneratedArtifactReleaseGate({
      artifact: generatedArtifact,
      registry: input.registry,
    }),
    generated_artifact: generatedArtifact,
  };
}
