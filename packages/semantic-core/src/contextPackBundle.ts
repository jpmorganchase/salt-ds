import type {
  SaltContextPackManifest,
  SaltContextPackManifestEntry,
} from "./contextManifest.js";
import { SALT_CONTEXT_PACK_MANIFEST_CONTRACT } from "./contextManifest.js";
import type { SaltUnsupportedGeneratedSurface } from "./contextUnsupportedSurfaces.js";
import type {
  SaltGeneratedArtifactGenerator,
  SaltGeneratedArtifactRegistry,
} from "./evidence.js";

export const SALT_CONTEXT_PACK_BUNDLE_CONTRACT =
  "salt_context_pack_bundle_v1" as const;
export const SALT_CONTEXT_PACK_PERSISTENCE_CHECK_CONTRACT =
  "salt_context_pack_persistence_check_v1" as const;

export interface SaltContextPackBundleFile {
  kind: SaltContextPackManifestEntry["kind"];
  id: string;
  output_path: string;
  mime_type: "application/json" | "text/markdown";
  contract: SaltContextPackManifestEntry["contract"];
  generated_artifact_kind: SaltContextPackManifestEntry["generated_artifact_kind"];
  evidence_ref_ids: string[];
  text: string;
}

export interface SaltContextPackBundlePersistence {
  status: "host_action_required" | "written";
  reason: string;
  output_dir: string | null;
}

export interface SaltContextPackPersistenceCheckFile {
  kind: SaltContextPackBundleFile["kind"] | "manifest";
  id: string;
  output_path: string;
  mime_type: "application/json" | "text/markdown";
  contract:
    | SaltContextPackBundleFile["contract"]
    | typeof SALT_CONTEXT_PACK_MANIFEST_CONTRACT;
  status: "current" | "missing" | "stale";
  mismatches: string[];
}

export interface SaltContextPackPersistenceCheck {
  contract: typeof SALT_CONTEXT_PACK_PERSISTENCE_CHECK_CONTRACT;
  bundle_contract: typeof SALT_CONTEXT_PACK_BUNDLE_CONTRACT;
  status: "current" | "missing" | "stale";
  current: boolean;
  host_action_required: boolean;
  content_status: SaltContextPackManifest["status"];
  unsupported_surface_count: number;
  output_dir: string | null;
  manifest_path: string;
  files: SaltContextPackPersistenceCheckFile[];
  missing_outputs: string[];
  stale_outputs: string[];
}

export interface SaltContextPackBundle {
  contract: typeof SALT_CONTEXT_PACK_BUNDLE_CONTRACT;
  generated_at: string;
  generator: SaltGeneratedArtifactGenerator;
  registry: SaltGeneratedArtifactRegistry;
  manifest: SaltContextPackManifest;
  files: SaltContextPackBundleFile[];
  unsupported_surfaces: SaltUnsupportedGeneratedSurface[];
  persistence: SaltContextPackBundlePersistence;
}

export interface BuildContextPackBundleInput {
  generated_at: string;
  generator: SaltGeneratedArtifactGenerator;
  registry: SaltGeneratedArtifactRegistry;
  manifest: SaltContextPackManifest;
  files: SaltContextPackBundleFile[];
  unsupported_surfaces?: SaltUnsupportedGeneratedSurface[];
  persistence?: SaltContextPackBundlePersistence;
}

export interface CheckContextPackBundlePersistenceInput {
  bundle: SaltContextPackBundle;
  manifest_path: string;
  persisted_text_by_path: Record<string, string | null | undefined>;
  output_dir?: string | null;
}

export function buildContextPackBundle(
  input: BuildContextPackBundleInput,
): SaltContextPackBundle {
  return {
    contract: SALT_CONTEXT_PACK_BUNDLE_CONTRACT,
    generated_at: input.generated_at,
    generator: input.generator,
    registry: input.registry,
    manifest: input.manifest,
    files: input.files,
    unsupported_surfaces: input.unsupported_surfaces ?? [],
    persistence: input.persistence ?? {
      status: "host_action_required",
      reason:
        "This transport exposes the context pack as resource content; the host must persist files to disk if durable outputs are needed.",
      output_dir: null,
    },
  };
}

function buildPersistenceTargets(input: {
  bundle: SaltContextPackBundle;
  manifest_path: string;
}): Array<{
  kind: SaltContextPackPersistenceCheckFile["kind"];
  id: string;
  output_path: string;
  mime_type: SaltContextPackPersistenceCheckFile["mime_type"];
  contract: SaltContextPackPersistenceCheckFile["contract"];
  text: string;
}> {
  return [
    {
      kind: "manifest",
      id: "context-pack-manifest",
      output_path: input.manifest_path,
      mime_type: "application/json",
      contract: SALT_CONTEXT_PACK_MANIFEST_CONTRACT,
      text: JSON.stringify(input.bundle.manifest, null, 2),
    },
    ...input.bundle.files.map((file) => ({
      kind: file.kind,
      id: file.id,
      output_path: file.output_path,
      mime_type: file.mime_type,
      contract: file.contract,
      text: file.text,
    })),
  ];
}

export function checkContextPackBundlePersistence(
  input: CheckContextPackBundlePersistenceInput,
): SaltContextPackPersistenceCheck {
  const files = buildPersistenceTargets({
    bundle: input.bundle,
    manifest_path: input.manifest_path,
  }).map((target): SaltContextPackPersistenceCheckFile => {
    const persistedText = input.persisted_text_by_path[target.output_path];
    const status =
      persistedText == null
        ? "missing"
        : persistedText === target.text
          ? "current"
          : "stale";

    return {
      kind: target.kind,
      id: target.id,
      output_path: target.output_path,
      mime_type: target.mime_type,
      contract: target.contract,
      status,
      mismatches: status === "stale" ? ["text"] : [],
    };
  });
  const missingOutputs = files
    .filter((file) => file.status === "missing")
    .map((file) => file.output_path);
  const staleOutputs = files
    .filter((file) => file.status === "stale")
    .map((file) => file.output_path);
  const status =
    missingOutputs.length > 0
      ? "missing"
      : staleOutputs.length > 0
        ? "stale"
        : "current";

  return {
    contract: SALT_CONTEXT_PACK_PERSISTENCE_CHECK_CONTRACT,
    bundle_contract: input.bundle.contract,
    status,
    current: status === "current",
    host_action_required: input.bundle.persistence.status !== "written",
    content_status: input.bundle.manifest.status,
    unsupported_surface_count: input.bundle.unsupported_surfaces.length,
    output_dir: input.output_dir ?? input.bundle.persistence.output_dir,
    manifest_path: input.manifest_path,
    files,
    missing_outputs: missingOutputs,
    stale_outputs: staleOutputs,
  };
}
