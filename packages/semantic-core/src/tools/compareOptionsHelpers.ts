import {
  getRegistryIndexes,
  normalizeRegistryLookupKey,
} from "../registry/runtimeCache.js";
import type {
  ComponentRecord,
  PatternRecord,
  SaltRegistry,
  SaltStatus,
} from "../types.js";
import {
  type ConsumerRecommendationFilters,
  compareComponentsByConsumerPreference,
  comparePatternsByConsumerPreference,
} from "./consumerFilters.js";
import {
  getComponentCaveats,
  getComponentShipCheck,
  getPatternCaveats,
  getPatternShipCheck,
  type ShipCheck,
} from "./consumerPresentation.js";
import {
  getComponentQueryFields,
  getPatternQueryFields,
  scoreQueryFields,
} from "./consumerSignals.js";
import { resolveLookup } from "./lookupResolver.js";
import {
  buildComponentPresentationBase,
  buildPatternPresentationBase,
} from "./solutionPresentation.js";
import { isComponentAllowedByDocsPolicy, normalizeQuery } from "./utils.js";

export type CompareOptionType = "component" | "pattern";

export interface ComparisonAmbiguity {
  query: string;
  option_type: CompareOptionType;
  matches: Array<{
    name: string;
    package?: string;
    status: SaltStatus;
  }>;
}

export interface ComponentCandidate {
  component: ComponentRecord;
  shipCheck: ShipCheck;
  caveats: string[];
  taskScore: number;
  matchedTerms: string[];
  matchReasons: string[];
}

export interface PatternCandidate {
  pattern: PatternRecord;
  shipCheck: ShipCheck;
  caveats: string[];
  taskScore: number;
  matchedTerms: string[];
  matchReasons: string[];
}

export function getComparisonWhy(
  preferred: {
    name: string;
    shipCheck: ShipCheck;
    taskScore: number;
  },
  nextBest:
    | {
        name: string;
        shipCheck: ShipCheck;
        taskScore: number;
      }
    | undefined,
  task: string,
): string {
  if (task && (!nextBest || preferred.taskScore > nextBest.taskScore)) {
    return `Best fit for "${task}" based on the current Salt docs and example language.`;
  }

  if (
    nextBest &&
    preferred.shipCheck.stable_for_production !==
      nextBest.shipCheck.stable_for_production
  ) {
    return preferred.shipCheck.stable_for_production
      ? "Stronger shipping choice because it is stable."
      : "Best match here, but it is not fully stable for production.";
  }

  if (
    nextBest &&
    preferred.shipCheck.accessibility_guidance !==
      nextBest.shipCheck.accessibility_guidance
  ) {
    return preferred.shipCheck.accessibility_guidance
      ? "Has clearer accessibility guidance."
      : "Best overall fit, but accessibility guidance is thinner than the alternative.";
  }

  if (
    nextBest &&
    preferred.shipCheck.examples_available !==
      nextBest.shipCheck.examples_available
  ) {
    return preferred.shipCheck.examples_available
      ? "Has stronger example coverage."
      : "Best overall fit, but example coverage is thinner than the alternative.";
  }

  return "Slightly better default fit based on current Salt guidance coverage.";
}

export function getComparisonNextStep(
  optionType: CompareOptionType,
  name: string | undefined,
): string | undefined {
  if (!name) {
    return undefined;
  }

  return optionType === "component"
    ? `Review examples for ${name} and confirm the caveats before implementing.`
    : `Review the ${name} pattern guidance and adapt the closest example before implementing.`;
}

export function getNoComparisonNextStep(optionType: CompareOptionType): string {
  return optionType === "component"
    ? "Retry with exact component names or start from choose_salt_solution."
    : "Retry with exact pattern names or start from choose_salt_solution.";
}

export function getInsufficientComparisonNextStep(
  optionType: CompareOptionType,
): string {
  return optionType === "component"
    ? "Provide at least two exact component names to compare, or start from choose_salt_solution."
    : "Provide at least two exact pattern names to compare, or start from choose_salt_solution.";
}

export function buildDifference(
  criterion: string,
  values: Array<{
    name: string;
    value: string | boolean | number;
  }>,
) {
  return {
    criterion,
    values,
  };
}

function getRouteSlug(route: string | null): string | null {
  if (!route) {
    return null;
  }

  const parts = route.split("/").filter((part) => part.length > 0);
  return parts.at(-1) ?? null;
}

function getQualityScore(shipCheck: ShipCheck): number {
  return (
    (shipCheck.stable_for_production ? 3 : 0) +
    (shipCheck.accessibility_guidance ? 2 : 0) +
    (shipCheck.usage_guidance ? 1 : 0) +
    (shipCheck.examples_available ? 1 : 0) +
    (shipCheck.form_field_support ? 1 : 0)
  );
}

function normalizePatternLookup(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function resolveComponent(
  registry: SaltRegistry,
  name: string,
  packageName?: string,
):
  | { candidate: ComponentRecord }
  | {
      ambiguity: ComparisonAmbiguity;
      did_you_mean: string[];
    }
  | { candidate: null } {
  const normalizedName = normalizeRegistryLookupKey(name);
  const { componentsByNormalizedAlias, componentsByNormalizedName } =
    getRegistryIndexes(registry);
  const packageScoped = (components: ComponentRecord[]) =>
    components
      .filter((component) =>
        packageName ? component.package.name === packageName : true,
      )
      .filter((component) => isComponentAllowedByDocsPolicy(component));

  const resolution = resolveLookup(name, [
    {
      matchedBy: "name",
      matches: packageScoped(
        componentsByNormalizedName.get(normalizedName) ?? [],
      ),
      toAmbiguityMatch: (match: ComponentRecord) => ({
        name: match.name,
        package: match.package.name,
        status: match.status,
      }),
    },
    {
      matchedBy: "alias",
      matches: packageScoped(
        componentsByNormalizedAlias.get(normalizedName) ?? [],
      ),
      ambiguityWhen: "if_unresolved",
      toAmbiguityMatch: (match: ComponentRecord) => ({
        name: match.name,
        package: match.package.name,
        status: match.status,
      }),
    },
  ]);

  if (resolution.ambiguity) {
    return {
      ambiguity: {
        query: name,
        option_type: "component",
        matches: resolution.ambiguity.matches,
      },
      did_you_mean: resolution.ambiguity.matches.map(
        (match) => `${match.name} (${match.package})`,
      ),
    };
  }

  if (!resolution.candidate) {
    return { candidate: null };
  }

  return { candidate: resolution.candidate };
}

export function resolvePattern(
  registry: SaltRegistry,
  name: string,
):
  | { candidate: PatternRecord }
  | {
      ambiguity: ComparisonAmbiguity;
      did_you_mean: string[];
    }
  | { candidate: null } {
  const normalizedName = normalizePatternLookup(name);
  const resolution = resolveLookup(name, [
    {
      matchedBy: "name",
      matches: registry.patterns.filter(
        (pattern) => normalizePatternLookup(pattern.name) === normalizedName,
      ),
      toAmbiguityMatch: (match: PatternRecord) => ({
        name: match.name,
        status: match.status,
      }),
    },
    {
      matchedBy: "alias",
      matches: registry.patterns.filter((pattern) =>
        pattern.aliases.some(
          (alias) => normalizePatternLookup(alias) === normalizedName,
        ),
      ),
      toAmbiguityMatch: (match: PatternRecord) => ({
        name: match.name,
        status: match.status,
      }),
      ambiguityWhen: "if_unresolved",
    },
    {
      matchedBy: "slug",
      matches: registry.patterns.filter((pattern) => {
        const routeSlug = getRouteSlug(pattern.related_docs.overview);
        return routeSlug
          ? normalizePatternLookup(routeSlug) === normalizedName
          : false;
      }),
      toAmbiguityMatch: (match: PatternRecord) => ({
        name: match.name,
        status: match.status,
      }),
      ambiguityWhen: "if_unresolved",
    },
  ]);

  if (resolution.ambiguity) {
    return {
      ambiguity: {
        query: name,
        option_type: "pattern",
        matches: resolution.ambiguity.matches,
      },
      did_you_mean: resolution.ambiguity.matches.map((match) => match.name),
    };
  }

  if (!resolution.candidate) {
    return { candidate: null };
  }

  return { candidate: resolution.candidate };
}

export function createPatternCandidate(
  registry: SaltRegistry,
  pattern: PatternRecord,
  task: string,
): PatternCandidate {
  const score = task
    ? scoreQueryFields(task, getPatternQueryFields(pattern))
    : { score: 0, matched_terms: [], match_reasons: [] };

  return {
    pattern,
    shipCheck: getPatternShipCheck(registry, pattern),
    caveats: getPatternCaveats(registry, pattern),
    taskScore: score.score,
    matchedTerms: score.matched_terms,
    matchReasons: score.match_reasons,
  };
}

export function createComponentCandidate(
  component: ComponentRecord,
  task: string,
): ComponentCandidate {
  const score = task
    ? scoreQueryFields(task, getComponentQueryFields(component))
    : { score: 0, matched_terms: [], match_reasons: [] };

  return {
    component,
    shipCheck: getComponentShipCheck(component),
    caveats: getComponentCaveats(component),
    taskScore: score.score,
    matchedTerms: score.matched_terms,
    matchReasons: score.match_reasons,
  };
}

export function compareComponentCandidates(
  left: ComponentCandidate,
  right: ComponentCandidate,
  filters: ConsumerRecommendationFilters,
): number {
  if (left.taskScore !== right.taskScore) {
    return right.taskScore - left.taskScore;
  }

  const preferenceOrder = compareComponentsByConsumerPreference(
    left.component,
    right.component,
    filters,
  );
  if (preferenceOrder !== 0) {
    return preferenceOrder;
  }

  const qualityDifference =
    getQualityScore(right.shipCheck) - getQualityScore(left.shipCheck);
  if (qualityDifference !== 0) {
    return qualityDifference;
  }

  return left.component.name.localeCompare(right.component.name);
}

export function comparePatternCandidates(
  registry: SaltRegistry,
  left: PatternCandidate,
  right: PatternCandidate,
  filters: ConsumerRecommendationFilters,
): number {
  if (left.taskScore !== right.taskScore) {
    return right.taskScore - left.taskScore;
  }

  const preferenceOrder = comparePatternsByConsumerPreference(
    registry,
    left.pattern,
    right.pattern,
    filters,
  );
  if (preferenceOrder !== 0) {
    return preferenceOrder;
  }

  const qualityDifference =
    getQualityScore(right.shipCheck) - getQualityScore(left.shipCheck);
  if (qualityDifference !== 0) {
    return qualityDifference;
  }

  return left.pattern.name.localeCompare(right.pattern.name);
}

export function toCompactComponentComparison(
  registry: SaltRegistry,
  candidate: ComponentCandidate,
) {
  const presentation = buildComponentPresentationBase(
    registry,
    candidate.component,
  );

  return {
    name: candidate.component.name,
    summary: candidate.component.summary,
    best_for: candidate.component.when_to_use[0] ?? candidate.component.summary,
    avoid_when: candidate.component.when_not_to_use[0] ?? null,
    ...presentation,
    caveats: candidate.caveats,
    ship_check: candidate.shipCheck,
    ...(candidate.component.status !== "stable"
      ? {
          status: candidate.component.status,
        }
      : {}),
  };
}

export function toFullComponentComparison(
  registry: SaltRegistry,
  candidate: ComponentCandidate,
) {
  return {
    ...toCompactComponentComparison(registry, candidate),
    package: candidate.component.package.name,
    alternatives: candidate.component.alternatives,
    task_score: candidate.taskScore,
    matched_terms: candidate.matchedTerms,
    match_reasons: candidate.matchReasons,
  };
}

export function toCompactPatternComparison(
  registry: SaltRegistry,
  candidate: PatternCandidate,
) {
  const presentation = buildPatternPresentationBase(
    registry,
    candidate.pattern,
  );

  return {
    name: candidate.pattern.name,
    summary: candidate.pattern.summary,
    best_for: candidate.pattern.when_to_use[0] ?? candidate.pattern.summary,
    avoid_when: candidate.pattern.when_not_to_use[0] ?? null,
    ...presentation,
    caveats: candidate.caveats,
    ship_check: candidate.shipCheck,
    components: candidate.pattern.composed_of,
    ...(candidate.pattern.status !== "stable"
      ? {
          status: candidate.pattern.status,
        }
      : {}),
  };
}

export function toFullPatternComparison(
  registry: SaltRegistry,
  candidate: PatternCandidate,
) {
  return {
    ...toCompactPatternComparison(registry, candidate),
    related_patterns: candidate.pattern.related_patterns,
    task_score: candidate.taskScore,
    matched_terms: candidate.matchedTerms,
    match_reasons: candidate.matchReasons,
  };
}

export function getComparisonTask(inputTask: string | undefined): string {
  return normalizeQuery(inputTask ?? "");
}
