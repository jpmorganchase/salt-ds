import type { SaltRegistry } from "../types.js";
import type {
  ChooseSaltSolutionInput,
  ChooseSaltSolutionResult,
  SaltSolutionType,
} from "./chooseSaltSolution.js";
import {
  type GuideReference,
  getRelevantGuidesForRecords,
} from "./guideAwareness.js";
import { normalizeQuery, tokenize } from "./utils.js";

const FOUNDATION_KEYWORDS = [
  "breakpoint",
  "density",
  "foundation",
  "grid",
  "layout",
  "responsive",
  "size",
  "spacing",
  "typography",
] as const;
const TOKEN_KEYWORDS = [
  "background",
  "border",
  "color",
  "density",
  "foreground",
  "padding",
  "theme",
  "token",
] as const;
const PATTERN_KEYWORDS = [
  "compose",
  "composition",
  "dashboard",
  "filter",
  "flow",
  "form",
  "header",
  "login",
  "page",
  "pattern",
  "screen",
  "toolbar",
] as const;

export function getChooseSaltSolutionRelatedGuides(
  registry: SaltRegistry,
  records: unknown[],
  options?: {
    fallbackComponentNames?: string[];
    fallbackPackages?: string[];
  },
): GuideReference[] | undefined {
  const guides = getRelevantGuidesForRecords(registry, records, {
    fallbackComponentNames: options?.fallbackComponentNames,
    fallbackPackages: options?.fallbackPackages,
    top_k: 4,
  });

  return guides.length > 0 ? guides : undefined;
}

function scoreIntent(query: string, keywords: readonly string[]): number {
  const queryTokens = new Set(tokenize(query));
  return keywords.reduce((score, keyword) => {
    return (
      score +
      (queryTokens.has(keyword) ? 2 : 0) +
      (query.includes(keyword) ? 1 : 0)
    );
  }, 0);
}

export function resolveSolutionType(
  input: ChooseSaltSolutionInput,
): Exclude<SaltSolutionType, "auto"> {
  if (
    input.solution_type &&
    input.solution_type !== "auto" &&
    input.solution_type.length > 0
  ) {
    return input.solution_type;
  }

  const query = normalizeQuery(input.query ?? "");
  const foundationScore = scoreIntent(query, FOUNDATION_KEYWORDS);
  const tokenScore = scoreIntent(query, TOKEN_KEYWORDS);
  const patternScore = scoreIntent(query, PATTERN_KEYWORDS);

  if (foundationScore > 0 && foundationScore >= tokenScore) {
    return "foundation";
  }
  if (tokenScore > 0 && tokenScore > patternScore) {
    return "token";
  }
  if (patternScore > 0) {
    return "pattern";
  }

  return "component";
}

export function getNamedRecords(
  value: unknown,
): Array<Record<string, unknown> & { name?: unknown; title?: unknown }> {
  return Array.isArray(value)
    ? value.filter(
        (
          entry,
        ): entry is Record<string, unknown> & {
          name?: unknown;
          title?: unknown;
        } => Boolean(entry) && typeof entry === "object",
      )
    : [];
}

export function getDecisionName(
  record: Record<string, unknown> | null | undefined,
) {
  if (!record) {
    return null;
  }

  if (typeof record.name === "string") {
    return record.name;
  }
  if (typeof record.title === "string") {
    return record.title;
  }
  if (typeof record.recipe_name === "string") {
    return record.recipe_name;
  }

  return null;
}

export function getGuidanceSources(
  record: Record<string, unknown> | null | undefined,
): string[] | undefined {
  const guidanceSources = Array.isArray(record?.guidance_sources)
    ? record.guidance_sources.filter(
        (entry): entry is string => typeof entry === "string",
      )
    : [];

  return guidanceSources.length > 0 ? [...new Set(guidanceSources)] : undefined;
}

export function uniqueNormalized(values: string[]): string[] {
  return [
    ...new Set(values.map((value) => normalizeQuery(value)).filter(Boolean)),
  ];
}

function getRecordCategories(
  registry: SaltRegistry,
  solutionType: Exclude<SaltSolutionType, "auto">,
  record: Record<string, unknown>,
): string[] {
  const directCategories = Array.isArray(record.category)
    ? record.category.filter(
        (entry): entry is string => typeof entry === "string",
      )
    : [];
  if (directCategories.length > 0) {
    return uniqueNormalized(directCategories);
  }

  const name = getDecisionName(record);
  if (!name) {
    return [];
  }

  if (solutionType === "component") {
    const component = registry.components.find((entry) => entry.name === name);
    return component ? uniqueNormalized(component.category) : [];
  }

  if (solutionType === "pattern") {
    const pattern = registry.patterns.find((entry) => entry.name === name);
    return pattern ? uniqueNormalized(pattern.category ?? []) : [];
  }

  return [];
}

export function buildDecisionDebug(
  registry: SaltRegistry,
  solutionType: Exclude<SaltSolutionType, "auto">,
  record: Record<string, unknown> | null | undefined,
  preferredCategories: string[],
) {
  return {
    selected_name: getDecisionName(record),
    selected_guidance_sources: getGuidanceSources(record) ?? [],
    selected_categories:
      record && (solutionType === "component" || solutionType === "pattern")
        ? getRecordCategories(registry, solutionType, record)
        : [],
    preferred_categories: preferredCategories,
  };
}

export function reorderByPreferredCategories(
  registry: SaltRegistry,
  solutionType: Exclude<SaltSolutionType, "auto">,
  records: Array<Record<string, unknown>>,
  preferredCategories: string[],
): Array<Record<string, unknown>> {
  if (preferredCategories.length === 0 || records.length < 2) {
    return records;
  }

  const normalizedPreferred = uniqueNormalized(preferredCategories);
  const scored = records.map((record, index) => {
    const categories = getRecordCategories(registry, solutionType, record);
    const categoryScore = categories.reduce(
      (score, category) =>
        score +
        (normalizedPreferred.includes(normalizeQuery(category)) ? 1 : 0),
      0,
    );

    return {
      record,
      index,
      categoryScore,
    };
  });

  if (scored.every((entry) => entry.categoryScore === 0)) {
    return records;
  }

  return scored
    .sort((left, right) => {
      if (left.categoryScore !== right.categoryScore) {
        return right.categoryScore - left.categoryScore;
      }

      return left.index - right.index;
    })
    .map((entry) => entry.record);
}

export function scoreFoundationComparison(
  foundation: Record<string, unknown>,
  query: string,
): number {
  if (!query) {
    return 0;
  }

  const haystack = [
    foundation.title,
    foundation.summary,
    ...(Array.isArray(foundation.topics) ? foundation.topics : []),
    ...(Array.isArray(foundation.guidance) ? foundation.guidance : []),
  ]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();

  return tokenize(query).reduce(
    (score, token) => score + (haystack.includes(token) ? 1 : 0),
    0,
  );
}

export function toFoundationDifference(
  criterion: string,
  values: Array<{
    name: string;
    value: string | boolean | number | null;
  }>,
): NonNullable<ChooseSaltSolutionResult["differences"]>[number] {
  return { criterion, values };
}
