import { parseExactSemVer } from "../versionUtils.js";

export type KnowledgeApplicabilityState = "current" | "applicable" | "unknown";

export type KnowledgeApplicabilityBasis =
  | "catalog_current_target"
  | "exact_catalog_package_version"
  | "deprecation_timeline"
  | "evidence_unavailable";

export interface KnowledgeApplicability {
  state: KnowledgeApplicabilityState;
  basis: KnowledgeApplicabilityBasis;
  package_name: string | null;
  target_version: string | null;
  catalog_version: string | null;
  peer_compatibility: "not_evaluated";
  historical_completeness: false;
}

function exactVersion(value: string | null | undefined): string | null {
  return parseExactSemVer(value);
}

function applicability(
  input: Omit<
    KnowledgeApplicability,
    "peer_compatibility" | "historical_completeness"
  >,
): KnowledgeApplicability {
  return {
    ...input,
    peer_compatibility: "not_evaluated",
    historical_completeness: false,
  };
}

export function currentKnowledgeApplicability(
  input: { packageName?: string | null; catalogVersion?: string | null } = {},
): KnowledgeApplicability {
  return applicability({
    state: "current",
    basis: "catalog_current_target",
    package_name: input.packageName ?? null,
    target_version: null,
    catalog_version: exactVersion(input.catalogVersion),
  });
}

export function unknownKnowledgeApplicability(
  input: {
    packageName?: string | null;
    targetVersion?: string | null;
    catalogVersion?: string | null;
  } = {},
): KnowledgeApplicability {
  return applicability({
    state: "unknown",
    basis: "evidence_unavailable",
    package_name: input.packageName ?? null,
    target_version: exactVersion(input.targetVersion),
    catalog_version: exactVersion(input.catalogVersion),
  });
}

export function resolvePackageKnowledgeApplicability(input: {
  packageName: string;
  targetVersion: string | null | undefined;
  catalogVersion: string | null | undefined;
}): KnowledgeApplicability {
  const targetVersion = exactVersion(input.targetVersion);
  const catalogVersion = exactVersion(input.catalogVersion);
  if (!targetVersion || !catalogVersion || targetVersion !== catalogVersion) {
    return unknownKnowledgeApplicability({
      packageName: input.packageName,
      targetVersion: input.targetVersion,
      catalogVersion: input.catalogVersion,
    });
  }
  return applicability({
    state: "applicable",
    basis: "exact_catalog_package_version",
    package_name: input.packageName,
    target_version: targetVersion,
    catalog_version: catalogVersion,
  });
}

export function deprecationTimelineKnowledgeApplicability(input: {
  packageName: string;
  targetVersion: string;
  catalogVersion?: string | null;
}): KnowledgeApplicability {
  const targetVersion = exactVersion(input.targetVersion);
  if (!targetVersion) {
    return unknownKnowledgeApplicability({
      packageName: input.packageName,
      targetVersion: input.targetVersion,
      catalogVersion: input.catalogVersion,
    });
  }
  return applicability({
    state: "applicable",
    basis: "deprecation_timeline",
    package_name: input.packageName,
    target_version: targetVersion,
    catalog_version: exactVersion(input.catalogVersion),
  });
}
