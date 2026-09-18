import { parseExactSemVer } from "../versionUtils.js";

export type KnowledgeApplicabilityState = "current" | "applicable" | "unknown";

export type KnowledgeApplicabilityBasis =
  | "knowledge_current_target"
  | "exact_knowledge_package_version"
  | "deprecation_timeline"
  | "evidence_unavailable";

export interface KnowledgeApplicability {
  state: KnowledgeApplicabilityState;
  basis: KnowledgeApplicabilityBasis;
  package_name: string | null;
  target_version: string | null;
  knowledge_version: string | null;
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
  input: { packageName?: string | null; knowledgeVersion?: string | null } = {},
): KnowledgeApplicability {
  return applicability({
    state: "current",
    basis: "knowledge_current_target",
    package_name: input.packageName ?? null,
    target_version: null,
    knowledge_version: exactVersion(input.knowledgeVersion),
  });
}

export function unknownKnowledgeApplicability(
  input: {
    packageName?: string | null;
    targetVersion?: string | null;
    knowledgeVersion?: string | null;
  } = {},
): KnowledgeApplicability {
  return applicability({
    state: "unknown",
    basis: "evidence_unavailable",
    package_name: input.packageName ?? null,
    target_version: exactVersion(input.targetVersion),
    knowledge_version: exactVersion(input.knowledgeVersion),
  });
}

export function resolvePackageKnowledgeApplicability(input: {
  packageName: string;
  targetVersion: string | null | undefined;
  knowledgeVersion: string | null | undefined;
}): KnowledgeApplicability {
  const targetVersion = exactVersion(input.targetVersion);
  const knowledgeVersion = exactVersion(input.knowledgeVersion);
  if (!targetVersion || !knowledgeVersion || targetVersion !== knowledgeVersion) {
    return unknownKnowledgeApplicability({
      packageName: input.packageName,
      targetVersion: input.targetVersion,
      knowledgeVersion: input.knowledgeVersion,
    });
  }
  return applicability({
    state: "applicable",
    basis: "exact_knowledge_package_version",
    package_name: input.packageName,
    target_version: targetVersion,
    knowledge_version: knowledgeVersion,
  });
}

export function deprecationTimelineKnowledgeApplicability(input: {
  packageName: string;
  targetVersion: string;
  knowledgeVersion?: string | null;
}): KnowledgeApplicability {
  const targetVersion = exactVersion(input.targetVersion);
  if (!targetVersion) {
    return unknownKnowledgeApplicability({
      packageName: input.packageName,
      targetVersion: input.targetVersion,
      knowledgeVersion: input.knowledgeVersion,
    });
  }
  return applicability({
    state: "applicable",
    basis: "deprecation_timeline",
    package_name: input.packageName,
    target_version: targetVersion,
    knowledge_version: exactVersion(input.knowledgeVersion),
  });
}
