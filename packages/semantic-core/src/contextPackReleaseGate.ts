import type {
  SaltContextPackBundle,
  SaltContextPackBundleFile,
} from "./contextPackBundle.js";
import {
  type SaltGeneratedArtifactReleaseGateBatch,
  type SaltGeneratedArtifactReleaseGateBatchTarget,
  type SaltGeneratedArtifactReleaseGateCoverageGap,
  validateGeneratedArtifactReleaseGateBatch,
} from "./generatedArtifactReleaseGate.js";
import type { SaltRegistry } from "./types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasGeneratedArtifact(value: unknown): boolean {
  return (
    isRecord(value) &&
    isRecord(value.generated_artifact) &&
    value.generated_artifact.contract === "salt_generated_artifact_v1"
  );
}

function parseGeneratedArtifactFile(
  file: SaltContextPackBundleFile,
): unknown | null {
  if (file.mime_type !== "application/json") {
    return null;
  }

  try {
    const payload = JSON.parse(file.text) as unknown;
    return hasGeneratedArtifact(payload) ||
      (isRecord(payload) && payload.contract === "salt_generated_artifact_v1")
      ? payload
      : null;
  } catch {
    return null;
  }
}

function toCoverageGap(input: {
  kind: string;
  id: string;
  missing: string[];
  evidence_ref_ids?: string[];
}): SaltGeneratedArtifactReleaseGateCoverageGap {
  return {
    kind: input.kind,
    id: input.id,
    status: "unsupported",
    missing: input.missing,
    evidence_ref_ids: input.evidence_ref_ids ?? [],
  };
}

export function buildContextPackBundleReleaseGate(input: {
  bundle: SaltContextPackBundle;
  registry: SaltRegistry;
  artifact_path?: string | null;
}): SaltGeneratedArtifactReleaseGateBatch {
  const targets: SaltGeneratedArtifactReleaseGateBatchTarget[] = [];
  const coverageGaps: SaltGeneratedArtifactReleaseGateCoverageGap[] = [
    ...input.bundle.manifest.coverage_gaps.map((gap) =>
      toCoverageGap({
        kind: gap.kind,
        id: gap.id,
        missing: gap.missing,
        evidence_ref_ids: gap.evidence_ref_ids,
      }),
    ),
  ];

  for (const surface of input.bundle.unsupported_surfaces) {
    targets.push({
      artifact: surface.generated_artifact,
      artifact_path: `${input.artifact_path ?? input.bundle.persistence.output_dir ?? "context-pack"}#${surface.surface.id}`,
    });
  }

  for (const file of input.bundle.files) {
    const payload = parseGeneratedArtifactFile(file);
    if (payload) {
      targets.push({
        artifact: payload,
        artifact_path: file.output_path,
      });
      continue;
    }

    if (file.generated_artifact_kind === "component-markdown-bridge") {
      const entry = input.bundle.manifest.entries.find(
        (candidate) => candidate.output_path === file.output_path,
      );
      if (entry && entry.status !== "validated") {
        coverageGaps.push(
          toCoverageGap({
            kind: file.kind,
            id: file.id,
            missing:
              entry.missing.length > 0
                ? entry.missing
                : ["component markdown bridge is unsupported"],
            evidence_ref_ids: file.evidence_ref_ids,
          }),
        );
      }
      continue;
    }

    coverageGaps.push(
      toCoverageGap({
        kind: file.kind,
        id: file.id,
        missing: [
          `context pack file ${file.output_path} did not contain generated_artifact`,
        ],
        evidence_ref_ids: file.evidence_ref_ids,
      }),
    );
  }

  return validateGeneratedArtifactReleaseGateBatch({
    registry: input.registry,
    artifact_path: input.artifact_path ?? null,
    targets,
    coverage_gaps: coverageGaps,
  });
}
