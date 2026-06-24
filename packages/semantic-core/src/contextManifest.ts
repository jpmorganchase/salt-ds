import type { SaltContextComponent } from "./contextArtifacts.js";
import type { SaltContextFoundation } from "./contextFoundations.js";
import type { SaltContextComponentMarkdownBridge } from "./contextMarkdown.js";
import type { SaltContextPattern } from "./contextPatterns.js";
import { DEFAULT_UNSUPPORTED_GENERATED_CONTEXT_SURFACE_DESCRIPTORS } from "./contextUnsupportedSurfaces.js";
import type {
  SaltGeneratedArtifactGenerator,
  SaltGeneratedArtifactRegistry,
} from "./evidence.js";
import type { SaltPromptHostInstructionSurface } from "./promptHostInstructionSurfaces.js";

export const SALT_CONTEXT_PACK_MANIFEST_CONTRACT =
  "salt_context_pack_manifest_v1" as const;

export type SaltContextPackManifestStatus = "validated" | "unsupported";

export type SaltContextPackCoverageGapKind =
  | "component"
  | "pattern"
  | "foundation"
  | "prompt"
  | "instruction"
  | "markdown_bridge";

export interface SaltContextPackCoverageGap {
  kind: SaltContextPackCoverageGapKind;
  id: string;
  status: "unsupported";
  reason: string;
  missing: string[];
  evidence_ref_ids: string[];
}

export interface SaltContextPackManifestEntry {
  kind:
    | "component"
    | "component_markdown"
    | "pattern"
    | "foundation"
    | "prompt"
    | "instruction";
  id: string;
  name: string;
  output_path: string;
  contract:
    | SaltContextComponent["contract"]
    | SaltContextComponentMarkdownBridge["contract"]
    | SaltContextPattern["contract"]
    | SaltContextFoundation["contract"]
    | SaltPromptHostInstructionSurface["contract"];
  status: SaltContextPackManifestStatus;
  registry: SaltGeneratedArtifactRegistry;
  generated_artifact_id: string;
  generated_artifact_kind:
    | "component-context"
    | "component-markdown-bridge"
    | "pattern-context"
    | "foundation-context"
    | "prompt"
    | "instruction";
  evidence_ref_ids: string[];
  evidence_ref_count: number;
  unsupported_claim_count: number;
  missing: string[];
}

export interface SaltContextPackManifest {
  contract: typeof SALT_CONTEXT_PACK_MANIFEST_CONTRACT;
  generated_at: string;
  generator: SaltGeneratedArtifactGenerator;
  registry: SaltGeneratedArtifactRegistry;
  status: SaltContextPackManifestStatus;
  entries: SaltContextPackManifestEntry[];
  coverage_gaps: SaltContextPackCoverageGap[];
}

export interface BuildContextPackManifestInput {
  generated_at: string;
  generator: SaltGeneratedArtifactGenerator;
  registry: SaltGeneratedArtifactRegistry;
  entries: SaltContextPackManifestEntry[];
  coverage_gaps?: SaltContextPackCoverageGap[];
}

export function buildComponentContextManifestEntry(input: {
  context: SaltContextComponent;
  output_path: string;
}): SaltContextPackManifestEntry {
  return {
    kind: "component",
    id: input.context.component.id,
    name: input.context.component.name.value,
    output_path: input.output_path,
    contract: input.context.contract,
    status: input.context.status,
    registry: input.context.registry,
    generated_artifact_id: input.context.generated_artifact.id,
    generated_artifact_kind: "component-context",
    evidence_ref_ids: input.context.component.name.evidence_ref_ids,
    evidence_ref_count: input.context.evidence_refs.length,
    unsupported_claim_count: input.context.unsupported_claims.length,
    missing: input.context.surface_gate.missing,
  };
}

export function buildComponentContextMarkdownManifestEntry(input: {
  bridge: SaltContextComponentMarkdownBridge;
  output_path: string;
}): SaltContextPackManifestEntry {
  return {
    kind: "component_markdown",
    id: input.bridge.component_id,
    name: input.bridge.component_name,
    output_path: input.output_path,
    contract: input.bridge.contract,
    status: input.bridge.status,
    registry: input.bridge.registry,
    generated_artifact_id: input.bridge.generated_artifact_id,
    generated_artifact_kind: input.bridge.generated_artifact_kind,
    evidence_ref_ids: input.bridge.evidence_ref_ids,
    evidence_ref_count: input.bridge.evidence_ref_count,
    unsupported_claim_count: input.bridge.unsupported_claim_count,
    missing: input.bridge.missing,
  };
}

export function buildPatternContextManifestEntry(input: {
  context: SaltContextPattern;
  output_path: string;
}): SaltContextPackManifestEntry {
  return {
    kind: "pattern",
    id: input.context.pattern.id,
    name: input.context.pattern.name.value,
    output_path: input.output_path,
    contract: input.context.contract,
    status: input.context.status,
    registry: input.context.registry,
    generated_artifact_id: input.context.generated_artifact.id,
    generated_artifact_kind: "pattern-context",
    evidence_ref_ids: input.context.pattern.name.evidence_ref_ids,
    evidence_ref_count: input.context.evidence_refs.length,
    unsupported_claim_count: input.context.unsupported_claims.length,
    missing: input.context.surface_gate.missing,
  };
}

export function buildFoundationContextManifestEntry(input: {
  context: SaltContextFoundation;
  output_path: string;
}): SaltContextPackManifestEntry {
  return {
    kind: "foundation",
    id: input.context.foundation.id,
    name: input.context.foundation.category.value,
    output_path: input.output_path,
    contract: input.context.contract,
    status: input.context.status,
    registry: input.context.registry,
    generated_artifact_id: input.context.generated_artifact.id,
    generated_artifact_kind: "foundation-context",
    evidence_ref_ids: input.context.foundation.category.evidence_ref_ids,
    evidence_ref_count: input.context.evidence_refs.length,
    unsupported_claim_count: input.context.unsupported_claims.length,
    missing: input.context.surface_gate.missing,
  };
}

export function buildPromptHostInstructionSurfaceManifestEntry(input: {
  surface: SaltPromptHostInstructionSurface;
  output_path: string;
}): SaltContextPackManifestEntry {
  return {
    kind: input.surface.surface.kind,
    id: input.surface.surface.id,
    name: input.surface.surface.name,
    output_path: input.output_path,
    contract: input.surface.contract,
    status: input.surface.status,
    registry: input.surface.registry,
    generated_artifact_id: input.surface.generated_artifact.id,
    generated_artifact_kind: input.surface.surface.kind,
    evidence_ref_ids: input.surface.surface.evidence_ref_ids,
    evidence_ref_count: input.surface.evidence_refs.length,
    unsupported_claim_count: input.surface.unsupported_claims.length,
    missing: input.surface.surface_gate.missing,
  };
}

export function buildContextPackManifest(
  input: BuildContextPackManifestInput,
): SaltContextPackManifest {
  const coverageGaps = input.coverage_gaps ?? [];

  return {
    contract: SALT_CONTEXT_PACK_MANIFEST_CONTRACT,
    generated_at: input.generated_at,
    generator: input.generator,
    registry: input.registry,
    status:
      input.entries.every((entry) => entry.status === "validated") &&
      coverageGaps.length === 0
        ? "validated"
        : "unsupported",
    entries: input.entries,
    coverage_gaps: coverageGaps,
  };
}

export function buildDefaultContextPackCoverageGaps(
  options: {
    component_contexts?: boolean;
    component_markdown_bridges?: boolean;
    pattern_contexts?: boolean;
    foundation_contexts?: boolean;
    prompt_surfaces?: boolean;
    instruction_surfaces?: boolean;
  } = {},
): SaltContextPackCoverageGap[] {
  return [
    ...(options.component_contexts
      ? []
      : [
          {
            kind: "component" as const,
            id: "component-context",
            status: "unsupported" as const,
            reason:
              "Component context generation requires selected source-backed component registry records before it can emit Salt claims.",
            missing: ["selected source-backed component registry records"],
            evidence_ref_ids: [],
          },
        ]),
    ...(options.pattern_contexts
      ? []
      : [
          {
            kind: "pattern" as const,
            id: "pattern-context",
            status: "unsupported" as const,
            reason:
              "Pattern context generation requires selected source-backed pattern registry records before it can emit Salt claims.",
            missing: ["selected source-backed pattern registry records"],
            evidence_ref_ids: [],
          },
        ]),
    ...(options.foundation_contexts
      ? []
      : [
          {
            kind: "foundation" as const,
            id: "foundation-context",
            status: "unsupported" as const,
            reason:
              "Foundation context generation requires selected source-backed token policy registry records before it can emit Salt claims.",
            missing: ["selected source-backed token policy registry records"],
            evidence_ref_ids: [],
          },
        ]),
    ...DEFAULT_UNSUPPORTED_GENERATED_CONTEXT_SURFACE_DESCRIPTORS.filter(
      (descriptor) =>
        descriptor.kind === "prompt"
          ? !options.prompt_surfaces
          : !options.instruction_surfaces,
    ).map((descriptor) => ({
      kind: descriptor.kind,
      id: descriptor.id,
      status: "unsupported" as const,
      reason: descriptor.reason,
      missing: descriptor.missing,
      evidence_ref_ids: [],
    })),
    ...(options.component_markdown_bridges
      ? []
      : [
          {
            kind: "markdown_bridge" as const,
            id: "component-markdown-bridges",
            status: "unsupported" as const,
            reason:
              "Markdown bridge files are not generated until source-backed compression preserves EvidenceRefs for every Salt claim.",
            missing: ["EvidenceRef-preserving markdown bridge serializer"],
            evidence_ref_ids: [],
          },
        ]),
  ];
}

export function upsertContextPackManifestEntry(
  manifest: SaltContextPackManifest | null,
  input: {
    generated_at: string;
    generator: SaltGeneratedArtifactGenerator;
    registry: SaltGeneratedArtifactRegistry;
    entry: SaltContextPackManifestEntry;
  },
): SaltContextPackManifest {
  const entries = [
    ...(manifest?.entries ?? []).filter(
      (entry) =>
        !(
          entry.kind === input.entry.kind &&
          entry.id === input.entry.id &&
          entry.output_path === input.entry.output_path
        ),
    ),
    input.entry,
  ].sort((left, right) =>
    `${left.kind}:${left.output_path}:${left.id}`.localeCompare(
      `${right.kind}:${right.output_path}:${right.id}`,
    ),
  );

  return buildContextPackManifest({
    generated_at: input.generated_at,
    generator: input.generator,
    registry: input.registry,
    entries,
    coverage_gaps: manifest?.coverage_gaps ?? [],
  });
}
