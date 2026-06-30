import {
  CONSUMER_REPO_AGENTS_TEMPLATE,
  SALT_REPO_INSTRUCTIONS_TEMPLATE,
  VSCODE_COPILOT_INSTRUCTIONS_TEMPLATE,
} from "./bootstrapScaffolding.js";
import {
  SALT_EVIDENCE_REF_CONTRACT,
  SALT_GENERATED_ARTIFACT_CONTRACT,
  type SaltEvidenceRef,
  type SaltGeneratedArtifact,
  type SaltGeneratedArtifactGenerator,
  type SaltGeneratedClaim,
  type SaltUnsupportedClaim,
} from "./evidence.js";
import {
  type SerializedGeneratedSaltArtifactSurfaceGate,
  serializeGeneratedSaltArtifactSurfaceGate,
  validateGeneratedSaltArtifactSurface,
} from "./generatedArtifactSurface.js";
import { createSaltRegistryFingerprint } from "./registry/fingerprint.js";
import type { SaltRegistry } from "./types.js";

export const SALT_CONTEXT_PROMPT_INSTRUCTION_SURFACE_CONTRACT =
  "salt_context_prompt_instruction_surface_v1" as const;

export type SaltPromptHostInstructionSurfaceKind = "prompt" | "instruction";

export interface SaltPromptHostInstructionSurfaceSourceFile {
  id: string;
  name: string;
  source_path: string;
  source_section?: string | null;
  generated_path?: string | null;
  text?: string | null;
  evidence_ref_ids: string[];
}

export interface SaltPromptHostInstructionSurface {
  contract: typeof SALT_CONTEXT_PROMPT_INSTRUCTION_SURFACE_CONTRACT;
  generated_at: string;
  generator: SaltGeneratedArtifactGenerator;
  registry: SaltGeneratedArtifact["registry"];
  status: "validated" | "unsupported";
  surface: {
    kind: SaltPromptHostInstructionSurfaceKind;
    id: string;
    name: string;
    status: "validated" | "unsupported";
    evidence_ref_ids: string[];
  };
  source_files: SaltPromptHostInstructionSurfaceSourceFile[];
  evidence_refs: SaltEvidenceRef[];
  unsupported_claims: SaltUnsupportedClaim[];
  surface_gate: SerializedGeneratedSaltArtifactSurfaceGate;
  generated_artifact: SaltGeneratedArtifact;
}

export interface PromptHostInstructionSurfaceDescriptor {
  kind: SaltPromptHostInstructionSurfaceKind;
  id: string;
  name: string;
  source_files: Array<
    Omit<SaltPromptHostInstructionSurfaceSourceFile, "evidence_ref_ids">
  >;
  claims: Array<{
    id: string;
    text: string;
    field_path: string;
    evidence_ref_file_ids: string[];
  }>;
}

export const DEFAULT_PROMPT_HOST_INSTRUCTION_SURFACE_DESCRIPTORS: PromptHostInstructionSurfaceDescriptor[] =
  [
    {
      kind: "prompt",
      id: "workflow-prompts",
      name: "Workflow prompts",
      source_files: [
        {
          id: "salt-ds-skill-first-load",
          name: "salt-ds first-load skill prompt",
          source_path: "packages/skills/salt-ds/SKILL.md",
          source_section: "First response hard gate and evidence loop",
          generated_path: "packages/skills/salt-ds/SKILL.md",
        },
        {
          id: "salt-ds-openai-agent-prompt",
          name: "salt-ds OpenAI agent prompt",
          source_path: "packages/skills/salt-ds/agents/openai.yaml",
          source_section: "interface.default_prompt",
          generated_path: "packages/skills/salt-ds/agents/openai.yaml",
        },
      ],
      claims: [
        {
          id: "workflow-prompts.fact-boundary",
          text: "Workflow prompt surfaces require Salt-specific APIs, props, imports, package names, tokens, component capabilities, composition rules, examples, documentation links, and theme bootstrap facts to come from workflow evidence, registry-backed generated context, .salt project policy, or explicit workflow input.",
          field_path: "surface.fact_boundary",
          evidence_ref_file_ids: [
            "salt-ds-skill-first-load",
            "salt-ds-openai-agent-prompt",
          ],
        },
        {
          id: "workflow-prompts.action-loop",
          text: "Workflow prompt surfaces bind implementation work to the current Salt workflow action loop and require reruns after evidence retrieval, dependency installation, context fixes, or bootstrap actions.",
          field_path: "surface.action_loop",
          evidence_ref_file_ids: [
            "salt-ds-skill-first-load",
            "salt-ds-openai-agent-prompt",
          ],
        },
      ],
    },
    {
      kind: "instruction",
      id: "host-instructions",
      name: "Host instructions",
      source_files: [
        {
          id: "salt-repo-instructions-template",
          name: "Repo instruction block",
          source_path: "packages/semantic-core/src/bootstrapScaffolding.ts",
          source_section: "SALT_REPO_INSTRUCTIONS_TEMPLATE",
          generated_path: "AGENTS.md",
          text: SALT_REPO_INSTRUCTIONS_TEMPLATE,
        },
        {
          id: "consumer-repo-agents-template",
          name: "Consumer repo instruction template",
          source_path: "packages/semantic-core/src/bootstrapScaffolding.ts",
          source_section: "CONSUMER_REPO_AGENTS_TEMPLATE",
          generated_path: "AGENTS.md",
          text: CONSUMER_REPO_AGENTS_TEMPLATE,
        },
        {
          id: "vscode-copilot-instructions-template",
          name: "VS Code Copilot instruction block",
          source_path: "packages/semantic-core/src/bootstrapScaffolding.ts",
          source_section: "VSCODE_COPILOT_INSTRUCTIONS_TEMPLATE",
          generated_path: ".github/copilot-instructions.md",
          text: VSCODE_COPILOT_INSTRUCTIONS_TEMPLATE,
        },
      ],
      claims: [
        {
          id: "host-instructions.fact-boundary",
          text: "Host instruction surfaces require Salt-specific APIs, props, imports, package names, tokens, component capabilities, composition rules, examples, documentation links, and theme bootstrap facts to come from workflow evidence, registry-backed generated context, .salt project policy, or explicit workflow input.",
          field_path: "surface.fact_boundary",
          evidence_ref_file_ids: [
            "salt-repo-instructions-template",
            "vscode-copilot-instructions-template",
          ],
        },
        {
          id: "host-instructions.hard-gate",
          text: "Host instruction surfaces gate create, migrate, and upgrade implementation on a current workflow contract with success status, implement action, exact-request safety, and complete evidence.",
          field_path: "surface.hard_gate",
          evidence_ref_file_ids: [
            "salt-repo-instructions-template",
            "vscode-copilot-instructions-template",
          ],
        },
      ],
    },
  ];

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()))].filter(
    (value) => value.length > 0,
  );
}

function toEvidenceRefId(input: {
  kind: SaltPromptHostInstructionSurfaceKind;
  surface_id: string;
  file_id: string;
}): string {
  return `${input.kind}.${input.surface_id}.${input.file_id}.ref`;
}

function toEvidenceRefs(input: {
  kind: SaltPromptHostInstructionSurfaceKind;
  surface_id: string;
  source_files: PromptHostInstructionSurfaceDescriptor["source_files"];
  verified_at: string;
}): SaltEvidenceRef[] {
  return input.source_files.map(
    (sourceFile): SaltEvidenceRef => ({
      contract: SALT_EVIDENCE_REF_CONTRACT,
      id: toEvidenceRefId({
        kind: input.kind,
        surface_id: input.surface_id,
        file_id: sourceFile.id,
      }),
      source_kind: "source",
      claim_kind: "workflow",
      source: {
        repo_path: sourceFile.source_path,
        section: sourceFile.source_section ?? null,
      },
      confidence: "high",
      verified_at: input.verified_at,
    }),
  );
}

function toClaims(input: {
  descriptor: PromptHostInstructionSurfaceDescriptor;
}): SaltGeneratedClaim[] {
  return input.descriptor.claims.map(
    (claim): SaltGeneratedClaim => ({
      id: `${input.descriptor.kind}.${input.descriptor.id}.${claim.id}`,
      kind: "workflow",
      text: claim.text,
      field_path: claim.field_path,
      evidence_ref_ids: claim.evidence_ref_file_ids.map((fileId) =>
        toEvidenceRefId({
          kind: input.descriptor.kind,
          surface_id: input.descriptor.id,
          file_id: fileId,
        }),
      ),
    }),
  );
}

export function promptHostInstructionSurfaceFileName(
  surface: Pick<SaltPromptHostInstructionSurface, "surface">,
): string {
  return `${surface.surface.id}.${surface.surface.kind}.json`;
}

export function buildPromptHostInstructionSurface(input: {
  registry: SaltRegistry;
  generated_at: string;
  generator: SaltGeneratedArtifactGenerator;
  descriptor: PromptHostInstructionSurfaceDescriptor;
  registry_hash?: string | null;
}): SaltPromptHostInstructionSurface {
  const registryHash =
    input.registry_hash ?? createSaltRegistryFingerprint(input.registry);
  const evidenceRefs = toEvidenceRefs({
    kind: input.descriptor.kind,
    surface_id: input.descriptor.id,
    source_files: input.descriptor.source_files,
    verified_at: input.registry.generated_at,
  });
  const claims = toClaims({
    descriptor: input.descriptor,
  });
  const artifact: SaltGeneratedArtifact = {
    contract: SALT_GENERATED_ARTIFACT_CONTRACT,
    artifact_kind: input.descriptor.kind,
    id: `${input.descriptor.kind}.${input.descriptor.id}`,
    generated_at: input.generated_at,
    generator: input.generator,
    registry: {
      version: input.registry.version,
      hash: registryHash,
      generated_at: input.registry.generated_at,
    },
    claims,
    evidence_refs: evidenceRefs,
    unsupported_claims: [],
  };
  const surfaceGate = serializeGeneratedSaltArtifactSurfaceGate(
    validateGeneratedSaltArtifactSurface({
      artifact,
      registry: input.registry,
      artifact_label: `${input.descriptor.kind} surface`,
    }),
  );
  const unsupportedClaims = artifact.unsupported_claims ?? [];
  const status =
    surfaceGate.status === "validated" && unsupportedClaims.length === 0
      ? "validated"
      : "unsupported";
  const evidenceRefIds = uniqueStrings(
    input.descriptor.source_files.flatMap((sourceFile) =>
      evidenceRefs
        .filter((ref) => ref.id.endsWith(`.${sourceFile.id}.ref`))
        .map((ref) => ref.id),
    ),
  );

  return {
    contract: SALT_CONTEXT_PROMPT_INSTRUCTION_SURFACE_CONTRACT,
    generated_at: input.generated_at,
    generator: input.generator,
    registry: artifact.registry,
    status,
    surface: {
      kind: input.descriptor.kind,
      id: input.descriptor.id,
      name: input.descriptor.name,
      status,
      evidence_ref_ids: evidenceRefIds,
    },
    source_files: input.descriptor.source_files.map((sourceFile) => ({
      ...sourceFile,
      source_section: sourceFile.source_section ?? null,
      generated_path: sourceFile.generated_path ?? null,
      text: sourceFile.text ?? null,
      evidence_ref_ids: [
        toEvidenceRefId({
          kind: input.descriptor.kind,
          surface_id: input.descriptor.id,
          file_id: sourceFile.id,
        }),
      ],
    })),
    evidence_refs: evidenceRefs,
    unsupported_claims: unsupportedClaims,
    surface_gate: surfaceGate,
    generated_artifact: artifact,
  };
}

export function buildDefaultPromptHostInstructionSurfaces(input: {
  registry: SaltRegistry;
  generated_at: string;
  generator: SaltGeneratedArtifactGenerator;
  registry_hash?: string | null;
}): SaltPromptHostInstructionSurface[] {
  return DEFAULT_PROMPT_HOST_INSTRUCTION_SURFACE_DESCRIPTORS.map((descriptor) =>
    buildPromptHostInstructionSurface({
      ...input,
      descriptor,
    }),
  );
}

export function findDefaultPromptHostInstructionSurfaceDescriptor(input: {
  kind: SaltPromptHostInstructionSurfaceKind;
  id: string;
}): PromptHostInstructionSurfaceDescriptor | null {
  return (
    DEFAULT_PROMPT_HOST_INSTRUCTION_SURFACE_DESCRIPTORS.find(
      (descriptor) =>
        descriptor.kind === input.kind && descriptor.id === input.id,
    ) ?? null
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function durableGeneratedArtifact(
  surface: SaltPromptHostInstructionSurface,
): Record<string, unknown> {
  return {
    contract: surface.generated_artifact.contract,
    artifact_kind: surface.generated_artifact.artifact_kind,
    id: surface.generated_artifact.id,
    registry: surface.generated_artifact.registry,
    claims: surface.generated_artifact.claims.map((claim) => ({
      id: claim.id,
      kind: claim.kind,
      text: claim.text,
      field_path: claim.field_path ?? null,
      evidence_ref_ids: claim.evidence_ref_ids,
    })),
    evidence_refs: surface.generated_artifact.evidence_refs,
    unsupported_claims: surface.generated_artifact.unsupported_claims ?? [],
  };
}

function readDurableGeneratedArtifact(
  value: Record<string, unknown>,
): Record<string, unknown> {
  const artifact = isRecord(value.generated_artifact)
    ? value.generated_artifact
    : {};

  return {
    contract: artifact.contract,
    artifact_kind: artifact.artifact_kind,
    id: artifact.id,
    registry: artifact.registry,
    claims: Array.isArray(artifact.claims)
      ? artifact.claims.map((claim) => {
          const claimRecord = isRecord(claim) ? claim : {};
          return {
            id: claimRecord.id,
            kind: claimRecord.kind,
            text: claimRecord.text,
            field_path: claimRecord.field_path ?? null,
            evidence_ref_ids: claimRecord.evidence_ref_ids,
          };
        })
      : [],
    evidence_refs: Array.isArray(artifact.evidence_refs)
      ? artifact.evidence_refs
      : [],
    unsupported_claims: Array.isArray(artifact.unsupported_claims)
      ? artifact.unsupported_claims
      : [],
  };
}

function durableSurfaceForCheck(
  surface: SaltPromptHostInstructionSurface,
): Record<string, unknown> {
  return {
    contract: surface.contract,
    registry: surface.registry,
    status: surface.status,
    surface: surface.surface,
    source_files: surface.source_files,
    surface_gate: surface.surface_gate,
    evidence_refs: surface.evidence_refs,
    unsupported_claims: surface.unsupported_claims,
    generated_artifact: durableGeneratedArtifact(surface),
  };
}

function readDurableSurfaceForCheck(value: unknown): Record<string, unknown> {
  const surface = isRecord(value) ? value : {};

  return {
    contract: surface.contract,
    registry: surface.registry,
    status: surface.status,
    surface: surface.surface,
    source_files: Array.isArray(surface.source_files)
      ? surface.source_files
      : [],
    surface_gate: surface.surface_gate,
    evidence_refs: Array.isArray(surface.evidence_refs)
      ? surface.evidence_refs
      : [],
    unsupported_claims: Array.isArray(surface.unsupported_claims)
      ? surface.unsupported_claims
      : [],
    generated_artifact: readDurableGeneratedArtifact(surface),
  };
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableJson(entry)).join(",")}]`;
  }

  if (isRecord(value)) {
    const entries = Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`);

    return `{${entries.join(",")}}`;
  }

  return JSON.stringify(value);
}

export function diffPromptHostInstructionSurfaceForCheck(
  currentSurface: SaltPromptHostInstructionSurface,
  existingSurface: unknown,
): string[] {
  const current = durableSurfaceForCheck(currentSurface);
  const existing = readDurableSurfaceForCheck(existingSurface);
  const fields = [
    "contract",
    "registry",
    "status",
    "surface",
    "source_files",
    "surface_gate",
    "evidence_refs",
    "unsupported_claims",
    "generated_artifact",
  ];

  return fields.filter(
    (field) => stableJson(current[field]) !== stableJson(existing[field]),
  );
}
