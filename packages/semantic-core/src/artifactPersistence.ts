import type { SaltGeneratedArtifactReleaseGate } from "./generatedArtifactReleaseGate.js";

export const SALT_GENERATED_ARTIFACT_PERSISTENCE_CONTRACT =
  "salt_generated_artifact_persistence_v1" as const;

export interface SaltGeneratedArtifactPersistenceResult {
  contract: typeof SALT_GENERATED_ARTIFACT_PERSISTENCE_CONTRACT;
  status: "written" | "blocked" | "invalid";
  written: boolean;
  artifact_path: string;
  release_gate: SaltGeneratedArtifactReleaseGate;
  missing: string[];
}

export function buildGeneratedArtifactPersistenceResult(input: {
  artifact_path: string;
  release_gate: SaltGeneratedArtifactReleaseGate;
  written: boolean;
}): SaltGeneratedArtifactPersistenceResult {
  const status = input.release_gate.releasable
    ? input.written
      ? "written"
      : "blocked"
    : input.release_gate.status === "passed"
      ? "blocked"
      : input.release_gate.status;

  return {
    contract: SALT_GENERATED_ARTIFACT_PERSISTENCE_CONTRACT,
    status,
    written: input.release_gate.releasable && input.written,
    artifact_path: input.artifact_path,
    release_gate: input.release_gate,
    missing: input.release_gate.missing,
  };
}
