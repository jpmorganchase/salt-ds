import { satisfies } from "semver";
import type { KnowledgeManifestV1 } from "../schemas/knowledgeManifestV1.js";

export type PackageCompatibilityState =
  | "exact"
  | "compatible"
  | "missing_optional"
  | "missing_required"
  | "unsupported";

export interface PackageCompatibilityDecision {
  name: string;
  installed_version: string | null;
  tested_version: string;
  supported_range: string;
  required: boolean;
  state: PackageCompatibilityState;
  usable: boolean;
}

export interface KnowledgeCompatibilityDecision {
  packages: PackageCompatibilityDecision[];
  complete: boolean;
  usable_families: string[];
  limitations: string[];
}

export function resolveKnowledgeCompatibility(
  manifest: KnowledgeManifestV1,
  installedVersions: Readonly<Record<string, string | null | undefined>>,
): KnowledgeCompatibilityDecision {
  const packages = manifest.compatibility.packages.map((entry) => {
    const installed = installedVersions[entry.name] ?? null;
    let state: PackageCompatibilityState;
    if (installed === null) {
      state = entry.required ? "missing_required" : "missing_optional";
    } else if (installed === entry.tested_version) {
      state = "exact";
    } else if (
      satisfies(installed, entry.supported_range, { includePrerelease: true }) &&
      (!installed.includes("-") || entry.supported_range.includes("-"))
    ) {
      state = "compatible";
    } else {
      state = "unsupported";
    }
    return {
      ...entry,
      installed_version: installed,
      state,
      usable: state === "exact" || state === "compatible",
    } satisfies PackageCompatibilityDecision;
  });
  const limitations = [
    ...new Set(
      packages.flatMap((entry) => {
        if (entry.state === "missing_required") {
          return ["SALT_PACKAGE_VECTOR_INCOMPATIBLE"];
        }
        if (entry.state !== "unsupported") return [];
        return entry.installed_version?.includes("-") &&
          !entry.supported_range.includes("-")
          ? ["SALT_PRERELEASE_UNDECLARED"]
          : ["SALT_PACKAGE_VECTOR_INCOMPATIBLE"];
      }),
    ),
  ];
  return {
    packages,
    complete: limitations.length === 0,
    usable_families: packages
      .filter((entry) => entry.usable)
      .map((entry) => entry.name),
    limitations,
  };
}
