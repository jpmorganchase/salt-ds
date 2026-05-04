import type {
  SaltContextComponent,
  SaltContextComponentSurfaceGate,
} from "./contextArtifacts.js";
import type { SaltContextFoundation } from "./contextFoundations.js";
import type {
  SaltContextPackCoverageGap,
  SaltContextPackManifest,
  SaltContextPackManifestEntry,
} from "./contextManifest.js";
import type { SaltContextPattern } from "./contextPatterns.js";
import type { SaltGeneratedArtifactRegistry } from "./evidence.js";

export const SALT_CONTEXT_COMPONENT_CHECK_CONTRACT =
  "salt_context_component_check_v1" as const;
export const SALT_GENERATED_CONTEXT_HEALTH_CONTRACT =
  "salt_generated_context_health_v1" as const;

export type SaltContextComponentCheckStatus =
  | "current"
  | "stale"
  | "unsupported";

export interface SaltContextComponentCheckResult {
  contract: typeof SALT_CONTEXT_COMPONENT_CHECK_CONTRACT;
  status: SaltContextComponentCheckStatus;
  current: boolean;
  supported: boolean;
  output_path: string;
  component_id: string;
  component_name: string;
  evidence_ref_ids: string[];
  mismatches: string[];
  missing: string[];
}

export type SaltGeneratedContextHealthStatus =
  | "missing"
  | "current"
  | "stale"
  | "unsupported"
  | "invalid";

export interface SaltGeneratedContextHealthEntry {
  kind: SaltContextPackManifestEntry["kind"];
  id: string;
  name: string;
  outputPath: string;
  outputExists: boolean;
  outputStatus: "current" | "missing" | "stale" | "unsupported" | "invalid";
  outputContract: string | null;
  status: SaltContextPackManifestEntry["status"];
  evidenceRefIds: string[];
  evidenceRefCount: number;
  unsupportedClaimCount: number;
  mismatches: string[];
  missing: string[];
}

export interface SaltGeneratedContextHealth {
  contract: typeof SALT_GENERATED_CONTEXT_HEALTH_CONTRACT;
  manifestPath: string;
  present: boolean;
  status: SaltGeneratedContextHealthStatus;
  registry: {
    version: string | null;
    hash: string | null;
    generated_at: string | null;
    current_version: string | null;
    current_hash: string | null;
    current_generated_at: string | null;
  };
  entryCount: number;
  unsupportedEntries: number;
  unsupportedCoverageGaps: number;
  staleEntries: number;
  missingOutputs: string[];
  entries: SaltGeneratedContextHealthEntry[];
  coverageGaps: SaltContextPackCoverageGap[];
  recommendedAction:
    | "none"
    | "export-context"
    | "export-context-check"
    | "repair-context-manifest";
}

export interface BuildGeneratedContextManifestHealthInput {
  manifest_path: string;
  manifest: SaltContextPackManifest | null;
  registry: SaltGeneratedArtifactRegistry | null;
  invalid?: boolean;
  output_exists_by_path?: Record<string, boolean>;
  output_checks_by_path?: Record<
    string,
    {
      outputExists: boolean;
      outputStatus: "current" | "missing" | "stale" | "unsupported" | "invalid";
      outputContract?: string | null;
      mismatches?: string[];
      missing?: string[];
    }
  >;
}

type SaltContextArtifactForCheck =
  | SaltContextComponent
  | SaltContextPattern
  | SaltContextFoundation;

function readRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()))].filter(
    (value) => value.length > 0,
  );
}

function durableGeneratedArtifact(
  context: SaltContextArtifactForCheck,
): Record<string, unknown> {
  return {
    contract: context.generated_artifact.contract,
    artifact_kind: context.generated_artifact.artifact_kind,
    id: context.generated_artifact.id,
    registry: context.generated_artifact.registry,
    claims: context.generated_artifact.claims.map((claim) => ({
      id: claim.id,
      kind: claim.kind,
      text: claim.text,
      field_path: claim.field_path ?? null,
      evidence_ref_ids: claim.evidence_ref_ids,
    })),
    evidence_refs: context.generated_artifact.evidence_refs,
    unsupported_claims: context.generated_artifact.unsupported_claims ?? [],
  };
}

function contextPayloadKey(context: SaltContextArtifactForCheck): string {
  if ("component" in context) {
    return "component";
  }
  if ("pattern" in context) {
    return "pattern";
  }

  return "foundation";
}

function durableContextForCheck(
  context: SaltContextArtifactForCheck,
): Record<string, unknown> {
  const payloadKey = contextPayloadKey(context);
  const contextRecord = context as unknown as Record<string, unknown>;

  return {
    contract: context.contract,
    registry: context.registry,
    status: context.status,
    [payloadKey]: contextRecord[payloadKey],
    surface_gate: context.surface_gate,
    evidence_refs: context.evidence_refs,
    unsupported_claims: context.unsupported_claims,
    generated_artifact: durableGeneratedArtifact(context),
  };
}

function readDurableGeneratedArtifact(
  value: Record<string, unknown>,
): Record<string, unknown> {
  const artifact = readRecord(value.generated_artifact);
  if (!artifact) {
    return {};
  }

  return {
    contract: artifact.contract,
    artifact_kind: artifact.artifact_kind,
    id: artifact.id,
    registry: artifact.registry,
    claims: Array.isArray(artifact.claims)
      ? artifact.claims.map((claim) => {
          const claimRecord = readRecord(claim) ?? {};
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

function readDurableContextForCheck(
  value: unknown,
  payloadKey: string,
): Record<string, unknown> {
  const context = readRecord(value);
  if (!context) {
    return {};
  }

  return {
    contract: context.contract,
    registry: context.registry,
    status: context.status,
    [payloadKey]: context[payloadKey],
    surface_gate: context.surface_gate,
    evidence_refs: Array.isArray(context.evidence_refs)
      ? context.evidence_refs
      : [],
    unsupported_claims: Array.isArray(context.unsupported_claims)
      ? context.unsupported_claims
      : [],
    generated_artifact: readDurableGeneratedArtifact(context),
  };
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableJson(entry)).join(",")}]`;
  }

  const record = readRecord(value);
  if (record) {
    const entries = Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`);

    return `{${entries.join(",")}}`;
  }

  return JSON.stringify(value);
}

export function diffSaltContextComponentForCheck(
  currentContext: SaltContextComponent,
  existingContext: unknown,
): string[] {
  const current = durableContextForCheck(currentContext);
  const existing = readDurableContextForCheck(existingContext, "component");
  const fields = [
    "contract",
    "registry",
    "status",
    "component",
    "surface_gate",
    "evidence_refs",
    "unsupported_claims",
    "generated_artifact",
  ];

  return fields.filter(
    (field) => stableJson(current[field]) !== stableJson(existing[field]),
  );
}

export function diffSaltContextPatternForCheck(
  currentContext: SaltContextPattern,
  existingContext: unknown,
): string[] {
  const current = durableContextForCheck(currentContext);
  const existing = readDurableContextForCheck(existingContext, "pattern");
  const fields = [
    "contract",
    "registry",
    "status",
    "pattern",
    "surface_gate",
    "evidence_refs",
    "unsupported_claims",
    "generated_artifact",
  ];

  return fields.filter(
    (field) => stableJson(current[field]) !== stableJson(existing[field]),
  );
}

export function diffSaltContextFoundationForCheck(
  currentContext: SaltContextFoundation,
  existingContext: unknown,
): string[] {
  const current = durableContextForCheck(currentContext);
  const existing = readDurableContextForCheck(existingContext, "foundation");
  const fields = [
    "contract",
    "registry",
    "status",
    "foundation",
    "surface_gate",
    "evidence_refs",
    "unsupported_claims",
    "generated_artifact",
  ];

  return fields.filter(
    (field) => stableJson(current[field]) !== stableJson(existing[field]),
  );
}

export function buildSaltContextComponentCheck(input: {
  context: SaltContextComponent;
  existing_context: unknown;
  output_path: string;
}): SaltContextComponentCheckResult {
  const mismatches = diffSaltContextComponentForCheck(
    input.context,
    input.existing_context,
  );
  const supported = input.context.status === "validated";
  const current = supported && mismatches.length === 0;

  return {
    contract: SALT_CONTEXT_COMPONENT_CHECK_CONTRACT,
    status: !supported ? "unsupported" : current ? "current" : "stale",
    current,
    supported,
    output_path: input.output_path,
    component_id: input.context.component.id,
    component_name: input.context.component.name.value,
    evidence_ref_ids: input.context.component.name.evidence_ref_ids,
    mismatches,
    missing: input.context.surface_gate.missing,
  };
}

function registryMatches(
  manifestRegistry: SaltGeneratedArtifactRegistry,
  currentRegistry: SaltGeneratedArtifactRegistry,
): boolean {
  return (
    manifestRegistry.version === currentRegistry.version &&
    manifestRegistry.generated_at === currentRegistry.generated_at &&
    (manifestRegistry.hash ?? null) === (currentRegistry.hash ?? null)
  );
}

function toHealthEntry(
  entry: SaltContextPackManifestEntry,
  outputCheck: {
    outputExists: boolean;
    outputStatus: "current" | "missing" | "stale" | "unsupported" | "invalid";
    outputContract?: string | null;
    mismatches?: string[];
    missing?: string[];
  },
): SaltGeneratedContextHealthEntry {
  return {
    kind: entry.kind,
    id: entry.id,
    name: entry.name,
    outputPath: entry.output_path,
    outputExists: outputCheck.outputExists,
    outputStatus: outputCheck.outputStatus,
    outputContract: outputCheck.outputContract ?? null,
    status: entry.status,
    evidenceRefIds: entry.evidence_ref_ids,
    evidenceRefCount: entry.evidence_ref_count,
    unsupportedClaimCount: entry.unsupported_claim_count,
    mismatches: outputCheck.mismatches ?? [],
    missing: uniqueStrings([
      ...(entry.missing ?? []),
      ...(outputCheck.missing ?? []),
    ]),
  };
}

function buildBaseGeneratedContextHealth(input: {
  manifest_path: string;
  registry: SaltGeneratedArtifactRegistry | null;
}): Pick<
  SaltGeneratedContextHealth,
  | "contract"
  | "manifestPath"
  | "registry"
  | "entryCount"
  | "unsupportedEntries"
  | "unsupportedCoverageGaps"
  | "staleEntries"
  | "missingOutputs"
  | "entries"
  | "coverageGaps"
> {
  return {
    contract: SALT_GENERATED_CONTEXT_HEALTH_CONTRACT,
    manifestPath: input.manifest_path,
    registry: {
      version: null,
      hash: null,
      generated_at: null,
      current_version: input.registry?.version ?? null,
      current_hash: input.registry?.hash ?? null,
      current_generated_at: input.registry?.generated_at ?? null,
    },
    entryCount: 0,
    unsupportedEntries: 0,
    unsupportedCoverageGaps: 0,
    staleEntries: 0,
    missingOutputs: [],
    entries: [],
    coverageGaps: [],
  };
}

export function buildGeneratedContextManifestHealth(
  input: BuildGeneratedContextManifestHealthInput,
): SaltGeneratedContextHealth {
  const base = buildBaseGeneratedContextHealth({
    manifest_path: input.manifest_path,
    registry: input.registry,
  });

  if (input.invalid) {
    return {
      ...base,
      present: true,
      status: "invalid",
      recommendedAction: "repair-context-manifest",
    };
  }

  if (!input.manifest) {
    return {
      ...base,
      present: false,
      status: "missing",
      recommendedAction: "export-context",
    };
  }

  const entries = input.manifest.entries.map((entry) =>
    toHealthEntry(entry, {
      outputExists:
        input.output_checks_by_path?.[entry.output_path]?.outputExists ??
        input.output_exists_by_path?.[entry.output_path] ??
        true,
      outputStatus:
        input.output_checks_by_path?.[entry.output_path]?.outputStatus ??
        (input.output_exists_by_path?.[entry.output_path] === false
          ? "missing"
          : "current"),
      outputContract:
        input.output_checks_by_path?.[entry.output_path]?.outputContract ??
        null,
      mismatches:
        input.output_checks_by_path?.[entry.output_path]?.mismatches ?? [],
      missing: input.output_checks_by_path?.[entry.output_path]?.missing ?? [],
    }),
  );
  const coverageGaps = input.manifest.coverage_gaps ?? [];
  const missingOutputs = entries
    .filter((entry) => entry.outputStatus === "missing")
    .map((entry) => entry.outputPath);
  const invalidEntries = entries.filter(
    (entry) => entry.outputStatus === "invalid",
  ).length;
  const unsupportedEntries = entries.filter(
    (entry) =>
      entry.status === "unsupported" || entry.outputStatus === "unsupported",
  ).length;
  const unsupportedCoverageGaps = coverageGaps.length;
  const registryCurrent = input.registry
    ? registryMatches(input.manifest.registry, input.registry)
    : true;
  const staleEntries =
    (registryCurrent ? 0 : entries.length) +
    entries.filter((entry) =>
      ["missing", "stale", "invalid"].includes(entry.outputStatus),
    ).length;
  const status: SaltGeneratedContextHealth["status"] =
    invalidEntries > 0
      ? "invalid"
      : unsupportedEntries > 0 ||
          unsupportedCoverageGaps > 0 ||
          input.manifest.status === "unsupported"
        ? "unsupported"
        : staleEntries > 0
          ? "stale"
          : "current";

  return {
    ...base,
    present: true,
    status,
    registry: {
      version: input.manifest.registry.version ?? null,
      hash: input.manifest.registry.hash ?? null,
      generated_at: input.manifest.registry.generated_at ?? null,
      current_version: input.registry?.version ?? null,
      current_hash: input.registry?.hash ?? null,
      current_generated_at: input.registry?.generated_at ?? null,
    },
    entryCount: entries.length,
    unsupportedEntries,
    unsupportedCoverageGaps,
    staleEntries,
    missingOutputs,
    entries,
    coverageGaps,
    recommendedAction: status === "current" ? "none" : "export-context-check",
  };
}

export function generatedContextHealthToSurfaceGate(
  health: SaltGeneratedContextHealth,
): SaltContextComponentSurfaceGate["status"] {
  return health.status === "current" ? "validated" : "unsupported";
}
