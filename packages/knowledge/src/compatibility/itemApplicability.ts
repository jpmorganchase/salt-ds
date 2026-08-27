import { satisfies, validRange } from "semver";
import { KNOWLEDGE_PACKAGE_FAMILIES } from "../schemas/knowledgeManifestV1.js";

export interface ApplicabilityPackageRange {
  name: string;
  range: string;
  evidence: string;
}

export type ApplicabilityDeclaration =
  | {
      mode: "package-ranges";
      packages: ApplicabilityPackageRange[];
    }
  | {
      mode: "version-independent";
      rationale: string;
      evidence: string;
    }
  | { mode: "unknown"; reason: string }
  | { mode: "inherits"; source_items: string[] };

export interface ItemApplicabilityDocument {
  contract: "salt-item-applicability/1";
  schema_version: "1.0.0";
  frozen_families: string[];
  profiles: Array<{ id: string } & ApplicabilityDeclaration>;
  items: Array<
    { key: string } &
      ({ profile: string } | ApplicabilityDeclaration)
  >;
}

export interface ResolvedItemApplicability {
  key: string;
  included: boolean;
  state: "applicable" | "excluded" | "unknown";
  package_ranges: ApplicabilityPackageRange[];
  reason: string | null;
}

function declarationFor(
  document: ItemApplicabilityDocument,
  item: ItemApplicabilityDocument["items"][number],
): ApplicabilityDeclaration {
  if ("profile" in item) {
    const profile = document.profiles.find((entry) => entry.id === item.profile);
    if (!profile) throw new Error(`Dangling applicability profile '${item.profile}'.`);
    const { id: _id, ...declaration } = profile;
    return declaration;
  }
  const { key: _key, ...declaration } = item;
  return declaration as ApplicabilityDeclaration;
}

export function validateItemApplicabilityDocument(
  value: ItemApplicabilityDocument,
): ItemApplicabilityDocument {
  if (
    value.contract !== "salt-item-applicability/1" ||
    value.schema_version !== "1.0.0" ||
    value.frozen_families.join("\0") !== KNOWLEDGE_PACKAGE_FAMILIES.join("\0") ||
    new Set(value.frozen_families).size !== value.frozen_families.length ||
    new Set(value.profiles.map((entry) => entry.id)).size !== value.profiles.length ||
    new Set(value.items.map((entry) => entry.key)).size !== value.items.length
  ) {
    throw new Error("Item applicability identity/cardinality is invalid.");
  }
  const itemByKey = new Map(value.items.map((entry) => [entry.key, entry]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (key: string): void => {
    if (visiting.has(key)) throw new Error(`Cyclic applicability inheritance: ${key}.`);
    if (visited.has(key)) return;
    const item = itemByKey.get(key);
    if (!item) throw new Error(`Dangling applicability item '${key}'.`);
    visiting.add(key);
    const declaration = declarationFor(value, item);
    if (declaration.mode === "inherits") {
      if (
        declaration.source_items.length === 0 ||
        new Set(declaration.source_items).size !== declaration.source_items.length
      ) {
        throw new Error(`Empty applicability inheritance: ${key}.`);
      }
      for (const source of declaration.source_items) visit(source);
    } else if (declaration.mode === "package-ranges") {
      if (
        declaration.packages.length === 0 ||
        new Set(declaration.packages.map((entry) => entry.name)).size !==
          declaration.packages.length
      ) {
        throw new Error(`Invalid applicability package ranges: ${key}.`);
      }
      for (const entry of declaration.packages) {
        if (
          !value.frozen_families.includes(entry.name) ||
          validRange(entry.range) === null ||
          entry.range.trim() !== entry.range ||
          entry.evidence.trim().length === 0
        ) {
          throw new Error(`Applicability references unknown family '${entry.name}'.`);
        }
      }
    } else if (
      (declaration.mode === "version-independent" &&
        (declaration.rationale.trim().length === 0 ||
          declaration.evidence.trim().length === 0)) ||
      (declaration.mode === "unknown" && declaration.reason.trim().length === 0)
    ) {
      throw new Error(`Incomplete applicability declaration: ${key}.`);
    }
    visiting.delete(key);
    visited.add(key);
  };
  for (const key of itemByKey.keys()) visit(key);
  return value;
}

export function resolveItemApplicability(
  document: ItemApplicabilityDocument,
  key: string,
  installedVersions: Readonly<Record<string, string | null | undefined>>,
): ResolvedItemApplicability {
  validateItemApplicabilityDocument(document);
  const itemByKey = new Map(document.items.map((entry) => [entry.key, entry]));
  if (!itemByKey.has(key)) {
    throw new Error(`Unknown applicability item '${key}'.`);
  }
  const resolve = (itemKey: string): ApplicabilityDeclaration[] => {
    const declaration = declarationFor(document, itemByKey.get(itemKey)!);
    return declaration.mode === "inherits"
      ? declaration.source_items.flatMap(resolve)
      : [declaration];
  };
  const declarations = resolve(key);
  if (declarations.some((entry) => entry.mode === "unknown")) {
    return {
      key,
      included: false,
      state: "unknown",
      package_ranges: [],
      reason: "UNKNOWN_ITEM_APPLICABILITY",
    };
  }
  const ranges = declarations.flatMap((entry) =>
    entry.mode === "package-ranges" ? entry.packages : [],
  );
  const included = ranges.every((entry) => {
    const installed = installedVersions[entry.name];
    return (
      typeof installed === "string" &&
      satisfies(installed, entry.range, { includePrerelease: true }) &&
      (!installed.includes("-") || entry.range.includes("-"))
    );
  });
  return {
    key,
    included,
    state: included ? "applicable" : "excluded",
    package_ranges: ranges,
    reason: included ? null : "PACKAGE_RANGE_MISMATCH",
  };
}
