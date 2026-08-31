import type { KnowledgeManifestV1 } from "../schemas/knowledgeManifestV1.js";
import type { SaltProjectFacts } from "./projectFacts.js";

export const SALT_PROJECT_DECISION_STATUSES = [
  "selected",
  "not_salt",
  "unverifiable",
  "unsupported",
] as const;

export type SaltProjectDecisionStatus =
  (typeof SALT_PROJECT_DECISION_STATUSES)[number];

export const SALT_PROJECT_DECISION_REASONS = [
  "SALT_PROJECT_SELECTED",
  "SALT_PROJECT_NO_SALT_PACKAGES",
  "SALT_PROJECT_INSPECTION_INCOMPLETE",
  "SALT_PROJECT_PACKAGE_EVIDENCE_AMBIGUOUS",
  "SALT_PROJECT_CORE_REQUIRED",
  "SALT_PROJECT_PACKAGE_FAMILY_UNKNOWN",
  "SALT_PROJECT_EXACT_VERSION_REQUIRED",
] as const;

export type SaltProjectDecisionReason =
  (typeof SALT_PROJECT_DECISION_REASONS)[number];

export interface SaltProjectDecision {
  contract: "salt-project-decision/1";
  schema_version: "1.0.0";
  status: SaltProjectDecisionStatus;
  reason_code: SaltProjectDecisionReason;
  installed_package_vector: Array<{ name: string; version: string }>;
}

function decision(
  status: SaltProjectDecisionStatus,
  reasonCode: SaltProjectDecisionReason,
  installedPackageVector: SaltProjectDecision["installed_package_vector"],
): SaltProjectDecision {
  return {
    contract: "salt-project-decision/1",
    schema_version: "1.0.0",
    status,
    reason_code: reasonCode,
    installed_package_vector: installedPackageVector,
  };
}

/**
 * Selects the exact-current Knowledge bundle without reading Knowledge records,
 * content, analyzer data, project source, or executing project code.
 */
export function decideSaltProject(
  facts: SaltProjectFacts,
  manifest: KnowledgeManifestV1,
): SaltProjectDecision {
  const declaredPackageNames = facts.declared_salt_packages.map(
    (entry) => entry.name,
  );
  const declaredNames = new Set(declaredPackageNames);
  const installedPackageVector = facts.installation.resolvedPackages
    .filter(
      (
        entry,
      ): entry is typeof entry & {
        resolvedVersion: string;
      } => entry.resolvedVersion !== null,
    )
    .map((entry) => ({ name: entry.name, version: entry.resolvedVersion }))
    .sort((left, right) => left.name.localeCompare(right.name));
  const observedPackageNames = installedPackageVector.map(
    (entry) => entry.name,
  );
  const observedNames = new Set(observedPackageNames);
  const evidenceNames = new Set([...declaredNames, ...observedNames]);

  if (evidenceNames.size === 0) {
    return decision(
      "not_salt",
      "SALT_PROJECT_NO_SALT_PACKAGES",
      installedPackageVector,
    );
  }

  const inspection = facts.installation.inspection;
  const versionHealth = facts.installation.versionHealth;
  if (
    inspection.packageManagerDetectionStatus === "ambiguous" ||
    inspection.packageManagerDetectionStatus === "invalid" ||
    versionHealth.multipleDeclaredVersions ||
    declaredNames.size !== declaredPackageNames.length ||
    observedNames.size !== observedPackageNames.length ||
    facts.workspace.workspaceIssues.length > 0
  ) {
    return decision(
      "unverifiable",
      "SALT_PROJECT_PACKAGE_EVIDENCE_AMBIGUOUS",
      installedPackageVector,
    );
  }
  if (
    inspection.status === "limited" ||
    versionHealth.unverifiablePackages.length > 0 ||
    facts.installation.resolvedPackages.some(
      (entry) =>
        entry.declarationResolution === "unverifiable" ||
        entry.resolvedVersion === null ||
        entry.satisfiesDeclaredVersion === null,
    )
  ) {
    return decision(
      "unverifiable",
      "SALT_PROJECT_INSPECTION_INCOMPLETE",
      installedPackageVector,
    );
  }

  if (!observedNames.has("@salt-ds/core")) {
    return decision(
      "unsupported",
      "SALT_PROJECT_CORE_REQUIRED",
      installedPackageVector,
    );
  }

  const compatibilityByName = new Map<
    string,
    KnowledgeManifestV1["compatibility"]["packages"][number]
  >(manifest.compatibility.packages.map((entry) => [entry.name, entry]));
  if ([...evidenceNames].some((name) => !compatibilityByName.has(name))) {
    return decision(
      "unsupported",
      "SALT_PROJECT_PACKAGE_FAMILY_UNKNOWN",
      installedPackageVector,
    );
  }

  const hasExactMismatch =
    installedPackageVector.some(
      (entry) =>
        compatibilityByName.get(entry.name)?.tested_version !== entry.version,
    ) ||
    facts.installation.resolvedPackages.some(
      (entry) => entry.satisfiesDeclaredVersion !== true,
    );
  if (hasExactMismatch) {
    return decision(
      "unsupported",
      "SALT_PROJECT_EXACT_VERSION_REQUIRED",
      installedPackageVector,
    );
  }

  return decision("selected", "SALT_PROJECT_SELECTED", installedPackageVector);
}
