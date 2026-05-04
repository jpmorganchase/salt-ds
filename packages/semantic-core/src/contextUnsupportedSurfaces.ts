import {
  SALT_GENERATED_ARTIFACT_CONTRACT,
  type SaltEvidenceRef,
  type SaltGeneratedArtifact,
  type SaltGeneratedArtifactGenerator,
  type SaltUnsupportedClaim,
} from "./evidence.js";
import {
  type SerializedGeneratedSaltArtifactSurfaceGate,
  serializeGeneratedSaltArtifactSurfaceGate,
  validateGeneratedSaltArtifactSurface,
} from "./generatedArtifactSurface.js";
import { createSaltRegistryFingerprint } from "./registry/fingerprint.js";
import type { SaltRegistry } from "./types.js";

export const SALT_CONTEXT_UNSUPPORTED_SURFACE_CONTRACT =
  "salt_context_unsupported_surface_v1" as const;

export type SaltUnsupportedGeneratedSurfaceKind = "prompt" | "instruction";

export interface UnsupportedGeneratedContextSurfaceDescriptor {
  kind: SaltUnsupportedGeneratedSurfaceKind;
  id: string;
  name: string;
  reason: string;
  missing: string[];
}

export const DEFAULT_UNSUPPORTED_GENERATED_CONTEXT_SURFACE_DESCRIPTORS: UnsupportedGeneratedContextSurfaceDescriptor[] =
  [
    {
      kind: "prompt",
      id: "workflow-prompts",
      name: "Workflow prompts",
      reason:
        "Workflow prompt files are not generated until fact-free prompt serializers can resolve all Salt facts through EvidenceRefs.",
      missing: ["fact-free prompt serializer with EvidenceRef placeholders"],
    },
    {
      kind: "instruction",
      id: "host-instructions",
      name: "Host instructions",
      reason:
        "Host instruction files are not generated until instruction serializers can avoid embedding unsupported Salt facts.",
      missing: ["fact-free host instruction serializer"],
    },
  ];

export interface BuildUnsupportedGeneratedContextSurfaceInput {
  registry: SaltRegistry;
  generated_at: string;
  generator: SaltGeneratedArtifactGenerator;
  kind: SaltUnsupportedGeneratedSurfaceKind;
  id: string;
  name: string;
  reason: string;
  missing: string[];
  registry_hash?: string | null;
}

export interface SaltUnsupportedGeneratedSurface {
  contract: typeof SALT_CONTEXT_UNSUPPORTED_SURFACE_CONTRACT;
  generated_at: string;
  generator: SaltGeneratedArtifactGenerator;
  registry: SaltGeneratedArtifact["registry"];
  status: "unsupported";
  surface: {
    kind: SaltUnsupportedGeneratedSurfaceKind;
    id: string;
    name: string;
    status: "unsupported";
    reason: string;
    missing: string[];
    evidence_ref_ids: [];
  };
  evidence_refs: SaltEvidenceRef[];
  unsupported_claims: SaltUnsupportedClaim[];
  surface_gate: SerializedGeneratedSaltArtifactSurfaceGate;
  generated_artifact: SaltGeneratedArtifact;
}

export function unsupportedGeneratedContextSurfaceFileName(
  surface: Pick<SaltUnsupportedGeneratedSurface, "surface">,
): string {
  return `${surface.surface.id}.unsupported.json`;
}

function toArtifactKind(
  kind: SaltUnsupportedGeneratedSurfaceKind,
): SaltGeneratedArtifact["artifact_kind"] {
  return kind;
}

export function buildUnsupportedGeneratedContextSurface(
  input: BuildUnsupportedGeneratedContextSurfaceInput,
): SaltUnsupportedGeneratedSurface {
  const registryHash =
    input.registry_hash ?? createSaltRegistryFingerprint(input.registry);
  const unsupportedClaim: SaltUnsupportedClaim = {
    id: `${input.kind}.${input.id}.unsupported`,
    kind: "workflow",
    text: `${input.name} ${input.kind} surface is unsupported.`,
    reason: input.reason,
  };
  const artifact: SaltGeneratedArtifact = {
    contract: SALT_GENERATED_ARTIFACT_CONTRACT,
    artifact_kind: toArtifactKind(input.kind),
    id: `${input.kind}.${input.id}`,
    generated_at: input.generated_at,
    generator: input.generator,
    registry: {
      version: input.registry.version,
      hash: registryHash,
      generated_at: input.registry.generated_at,
    },
    claims: [],
    evidence_refs: [],
    unsupported_claims: [unsupportedClaim],
  };
  const surfaceGate = serializeGeneratedSaltArtifactSurfaceGate(
    validateGeneratedSaltArtifactSurface({
      artifact,
      registry: input.registry,
      artifact_label: `${input.kind} surface`,
    }),
  );

  return {
    contract: SALT_CONTEXT_UNSUPPORTED_SURFACE_CONTRACT,
    generated_at: input.generated_at,
    generator: input.generator,
    registry: artifact.registry,
    status: "unsupported",
    surface: {
      kind: input.kind,
      id: input.id,
      name: input.name,
      status: "unsupported",
      reason: input.reason,
      missing: [...input.missing],
      evidence_ref_ids: [],
    },
    evidence_refs: [],
    unsupported_claims: [unsupportedClaim],
    surface_gate: surfaceGate,
    generated_artifact: artifact,
  };
}

export function buildDefaultUnsupportedContextSurfaces(input: {
  registry: SaltRegistry;
  generated_at: string;
  generator: SaltGeneratedArtifactGenerator;
  registry_hash?: string | null;
}): SaltUnsupportedGeneratedSurface[] {
  return DEFAULT_UNSUPPORTED_GENERATED_CONTEXT_SURFACE_DESCRIPTORS.map(
    (descriptor) =>
      buildUnsupportedGeneratedContextSurface({
        ...input,
        ...descriptor,
      }),
  );
}
