import type {
  ComponentRecord,
  PatternRecord,
  SaltRegistry,
} from "../types.js";
import { containsExplicitCreateReferencePhrase } from "./createReferenceQueries.js";
import { isComponentAllowedByDocsPolicy } from "./utils.js";

export type CreateQueryAnchorMatchKind = "name" | "alias" | "slug";
export type CreateQueryAnchorEntityType = "component" | "pattern";

export interface CreateQueryAnchor {
  id: string;
  entity_type: CreateQueryAnchorEntityType;
  name: string;
  matched_by: CreateQueryAnchorMatchKind[];
  categories: string[];
  query_index: number;
  token_count: number;
  structural_weight: number;
  low_structure: boolean;
}

const LOW_SIGNAL_SINGLE_TOKEN_LOOKUPS = new Set([
  "body",
  "content",
  "dashboard",
  "grid",
  "header",
  "layout",
  "main",
  "panel",
  "screen",
  "shell",
]);

const CATEGORY_STRUCTURE_WEIGHTS = new Map<string, number>([
  ["actions", 5],
  ["actions-and-commands", 6],
  ["data-display-and-analysis", 8],
  ["data-display-and-visualization", 8],
  ["date-and-time", 5],
  ["dialogs-and-overlays", 8],
  ["feedback-and-status", 4],
  ["forms-and-inputs", 6],
  ["inputs", 6],
  ["layout-and-shells", 9],
  ["navigation", 8],
  ["navigation-and-wayfinding", 8],
  ["overlays", 8],
  ["providers", 2],
  ["selection-and-filtering", 7],
  ["selection-controls", 7],
  ["content-and-identity", 3],
]);

function normalizeAnchorLookupKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function countLookupTokens(value: string): number {
  return value.split("-").filter((token) => token.length > 0).length;
}

function findLookupKeyIndex(queryKey: string, lookupKey: string): number {
  if (!queryKey || !lookupKey) {
    return -1;
  }

  let currentIndex = queryKey.indexOf(lookupKey);
  while (currentIndex !== -1) {
    const beforeIndex = currentIndex - 1;
    const afterIndex = currentIndex + lookupKey.length;
    const startsAtBoundary = beforeIndex < 0 || queryKey[beforeIndex] === "-";
    const endsAtBoundary =
      afterIndex >= queryKey.length || queryKey[afterIndex] === "-";

    if (startsAtBoundary && endsAtBoundary) {
      return currentIndex;
    }

    currentIndex = queryKey.indexOf(lookupKey, currentIndex + 1);
  }

  return -1;
}

function shouldIgnoreLookupKey(lookupKey: string): boolean {
  const tokenCount = countLookupTokens(lookupKey);
  if (tokenCount !== 1) {
    return false;
  }

  return LOW_SIGNAL_SINGLE_TOKEN_LOOKUPS.has(lookupKey);
}

function getMatchPriority(kind: CreateQueryAnchorMatchKind): number {
  if (kind === "name") {
    return 3;
  }
  if (kind === "alias") {
    return 2;
  }
  return 1;
}

function getCategoryStructureWeight(categories: string[]): number {
  return categories.reduce((highest, category) => {
    const normalizedCategory = normalizeAnchorLookupKey(category);
    return Math.max(
      highest,
      CATEGORY_STRUCTURE_WEIGHTS.get(normalizedCategory) ?? 0,
    );
  }, 0);
}

function getNameStructureWeight(name: string): number {
  const normalizedName = normalizeAnchorLookupKey(name);

  if (
    /(dialog|wizard|stepper|navigation|dashboard|breadcrumb|tabs|table|chart|toolbar|header|layout|form|grid)/.test(
      normalizedName,
    )
  ) {
    return 3;
  }

  if (/(avatar|icon|badge|indicator|symbol)/.test(normalizedName)) {
    return -2;
  }

  return 0;
}

function getAnchorStructuralWeight(input: {
  entity_type: CreateQueryAnchorEntityType;
  name: string;
  categories: string[];
}): number {
  const baseWeight = input.entity_type === "pattern" ? 6 : 4;
  const weight =
    baseWeight +
    getCategoryStructureWeight(input.categories) +
    getNameStructureWeight(input.name);

  return Math.max(1, weight);
}

function chooseBetterAnchorMatch(
  current:
    | {
        index: number;
        kind: CreateQueryAnchorMatchKind;
        lookupKey: string;
      }
    | null,
  candidate: {
    index: number;
    kind: CreateQueryAnchorMatchKind;
    lookupKey: string;
  },
) {
  if (!current) {
    return candidate;
  }

  if (candidate.index !== current.index) {
    return candidate.index < current.index ? candidate : current;
  }

  const currentPriority = getMatchPriority(current.kind);
  const candidatePriority = getMatchPriority(candidate.kind);
  if (candidatePriority !== currentPriority) {
    return candidatePriority > currentPriority ? candidate : current;
  }

  const currentTokenCount = countLookupTokens(current.lookupKey);
  const candidateTokenCount = countLookupTokens(candidate.lookupKey);
  if (candidateTokenCount !== currentTokenCount) {
    return candidateTokenCount > currentTokenCount ? candidate : current;
  }

  return candidate.lookupKey.length > current.lookupKey.length
    ? candidate
    : current;
}

function collectComponentAnchor(
  queryKey: string,
  query: string,
  component: ComponentRecord,
): CreateQueryAnchor | null {
  let bestMatch:
    | {
        index: number;
        kind: CreateQueryAnchorMatchKind;
        lookupKey: string;
      }
    | null = null;

  for (const entry of [{ kind: "name" as const, value: component.name }]) {
    const lookupKey = normalizeAnchorLookupKey(entry.value);
    if (!lookupKey || shouldIgnoreLookupKey(lookupKey)) {
      continue;
    }
    if (!containsExplicitCreateReferencePhrase(query, entry.value)) {
      continue;
    }

    const index = findLookupKeyIndex(queryKey, lookupKey);
    if (index === -1) {
      continue;
    }

    bestMatch = chooseBetterAnchorMatch(bestMatch, {
      index,
      kind: entry.kind,
      lookupKey,
    });
  }

  for (const alias of component.aliases) {
    const lookupKey = normalizeAnchorLookupKey(alias);
    if (!lookupKey || shouldIgnoreLookupKey(lookupKey)) {
      continue;
    }
    if (!containsExplicitCreateReferencePhrase(query, alias)) {
      continue;
    }

    const index = findLookupKeyIndex(queryKey, lookupKey);
    if (index === -1) {
      continue;
    }

    bestMatch = chooseBetterAnchorMatch(bestMatch, {
      index,
      kind: "alias",
      lookupKey,
    });
  }

  if (!bestMatch) {
    return null;
  }

  const structuralWeight = getAnchorStructuralWeight({
    entity_type: "component",
    name: component.name,
    categories: component.category,
  });

  return {
    id: component.id,
    entity_type: "component",
    name: component.name,
    matched_by: [bestMatch.kind],
    categories: [...component.category],
    query_index: bestMatch.index,
    token_count: countLookupTokens(bestMatch.lookupKey),
    structural_weight: structuralWeight,
    low_structure: structuralWeight <= 6,
  };
}

function getPatternLookupKeys(pattern: PatternRecord): Array<{
  kind: CreateQueryAnchorMatchKind;
  value: string;
}> {
  const route = pattern.related_docs.overview;
  const routeSlug = route
    ? route.split("/").filter((part) => part.length > 0).at(-1) ?? null
    : null;

  return [
    { kind: "name", value: pattern.name },
    ...pattern.aliases.map((alias) => ({
      kind: "alias" as const,
      value: alias,
    })),
    ...(routeSlug ? [{ kind: "slug" as const, value: routeSlug }] : []),
  ];
}

function collectPatternAnchor(
  queryKey: string,
  query: string,
  pattern: PatternRecord,
): CreateQueryAnchor | null {
  let bestMatch:
    | {
        index: number;
        kind: CreateQueryAnchorMatchKind;
        lookupKey: string;
      }
    | null = null;

  for (const entry of getPatternLookupKeys(pattern)) {
    const lookupKey = normalizeAnchorLookupKey(entry.value);
    if (!lookupKey || shouldIgnoreLookupKey(lookupKey)) {
      continue;
    }
    if (!containsExplicitCreateReferencePhrase(query, entry.value)) {
      continue;
    }

    const index = findLookupKeyIndex(queryKey, lookupKey);
    if (index === -1) {
      continue;
    }

    bestMatch = chooseBetterAnchorMatch(bestMatch, {
      index,
      kind: entry.kind,
      lookupKey,
    });
  }

  if (!bestMatch) {
    return null;
  }

  const structuralWeight = getAnchorStructuralWeight({
    entity_type: "pattern",
    name: pattern.name,
    categories: pattern.category ?? [],
  });

  return {
    id: pattern.id,
    entity_type: "pattern",
    name: pattern.name,
    matched_by: [bestMatch.kind],
    categories: [...(pattern.category ?? [])],
    query_index: bestMatch.index,
    token_count: countLookupTokens(bestMatch.lookupKey),
    structural_weight: structuralWeight,
    low_structure: structuralWeight <= 6,
  };
}

function compareAnchors(left: CreateQueryAnchor, right: CreateQueryAnchor) {
  if (left.structural_weight !== right.structural_weight) {
    return right.structural_weight - left.structural_weight;
  }

  if (left.query_index !== right.query_index) {
    return left.query_index - right.query_index;
  }

  if (left.token_count !== right.token_count) {
    return right.token_count - left.token_count;
  }

  if (left.entity_type !== right.entity_type) {
    return left.entity_type === "pattern" ? -1 : 1;
  }

  return left.name.localeCompare(right.name);
}

export function collectCreateQueryAnchors(
  registry: SaltRegistry,
  query: string | null | undefined,
  packageName?: string,
): CreateQueryAnchor[] {
  const normalizedQuery = query ?? "";
  const queryKey = normalizeAnchorLookupKey(normalizedQuery);
  if (!queryKey) {
    return [];
  }

  const anchors = [
    ...registry.components
      .filter((component) => isComponentAllowedByDocsPolicy(component))
      .filter((component) =>
        packageName ? component.package.name === packageName : true,
      )
      .map((component) => collectComponentAnchor(queryKey, normalizedQuery, component))
      .filter((anchor): anchor is CreateQueryAnchor => anchor !== null),
    ...registry.patterns
      .map((pattern) => collectPatternAnchor(queryKey, normalizedQuery, pattern))
      .filter((anchor): anchor is CreateQueryAnchor => anchor !== null),
  ].sort(compareAnchors);

  const dedupedByName = new Map<string, CreateQueryAnchor>();
  for (const anchor of anchors) {
    const normalizedName = normalizeAnchorLookupKey(anchor.name);
    if (!dedupedByName.has(normalizedName)) {
      dedupedByName.set(normalizedName, anchor);
    }
  }

  return [...dedupedByName.values()];
}

export function chooseDominantCreateQueryAnchor(
  anchors: CreateQueryAnchor[],
): CreateQueryAnchor | null {
  if (anchors.length === 0) {
    return null;
  }

  return [...anchors].sort(compareAnchors)[0] ?? null;
}

export function isHighPriorityCreateQueryAnchor(
  anchor: CreateQueryAnchor,
): boolean {
  return anchor.entity_type === "pattern" || anchor.structural_weight >= 7;
}

export function toCreateQueryAnchorRegionId(anchor: CreateQueryAnchor): string {
  return normalizeAnchorLookupKey(anchor.name);
}
