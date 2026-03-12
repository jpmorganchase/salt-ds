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
  getComponentSuggestedFollowUps,
  getPatternCaveats,
  getPatternShipCheck,
  getPatternSuggestedFollowUps,
  type ShipCheck,
  type SuggestedFollowUp,
} from "./consumerPresentation.js";
import {
  getComponentQueryFields,
  getPatternQueryFields,
  scoreQueryFields,
} from "./consumerSignals.js";
import { resolveLookup } from "./lookupResolver.js";
import { isComponentAllowedByDocsPolicy, normalizeQuery } from "./utils.js";

type CompareOptionType = "component" | "pattern";

export interface CompareOptionsInput {
  names: string[];
  option_type?: CompareOptionType;
  package?: string;
  task?: string;
  production_ready?: boolean;
  prefer_stable?: boolean;
  a11y_required?: boolean;
  form_field_support?: boolean;
  view?: "compact" | "full";
}

export interface CompareOptionsResult {
  option_type: CompareOptionType;
  compared: Array<Record<string, unknown>>;
  unresolved_names?: string[];
  recommendation?: {
    name: string;
    why: string;
  };
  differences?: Array<{
    criterion: string;
    values: Array<{
      name: string;
      value: string | boolean | number;
    }>;
  }>;
  suggested_follow_ups?: SuggestedFollowUp[];
  next_step?: string;
  did_you_mean?: string[];
  ambiguity?: {
    query: string;
    option_type: CompareOptionType;
    matches: Array<{
      name: string;
      package?: string;
      status: SaltStatus;
    }>;
  };
}

interface ComponentCandidate {
  component: ComponentRecord;
  shipCheck: ShipCheck;
  caveats: string[];
  taskScore: number;
  matchedTerms: string[];
  matchReasons: string[];
}

interface PatternCandidate {
  pattern: PatternRecord;
  shipCheck: ShipCheck;
  caveats: string[];
  taskScore: number;
  matchedTerms: string[];
  matchReasons: string[];
}

function getRouteSlug(route: string | null): string | null {
  if (!route) {
    return null;
  }

  const parts = route.split("/").filter((part) => part.length > 0);
  return parts.at(-1) ?? null;
}

function getComponentDocs(component: ComponentRecord): string[] {
  return [
    component.related_docs.overview,
    component.related_docs.usage,
    component.related_docs.accessibility,
    component.related_docs.examples,
  ].filter((value): value is string => Boolean(value));
}

function getPatternDocs(pattern: PatternRecord): string[] {
  return [
    pattern.related_docs.overview,
    ...pattern.resources.map((resource) => resource.href),
  ].filter((value): value is string => Boolean(value));
}

function getExamplesDocs(sourceUrl: string | null): string[] {
  return sourceUrl ? [sourceUrl] : [];
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

function getComparisonWhy(
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

function getComparisonNextStep(
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

function getNoComparisonNextStep(optionType: CompareOptionType): string {
  return optionType === "component"
    ? "Retry with exact component names or start from recommend_component."
    : "Retry with exact pattern names or start from get_composition_recipe.";
}

function getInsufficientComparisonNextStep(
  optionType: CompareOptionType,
): string {
  return optionType === "component"
    ? "Provide at least two exact component names to compare, or start from recommend_component."
    : "Provide at least two exact pattern names to compare, or start from get_composition_recipe.";
}

function buildDifference(
  criterion: string,
  values: Array<{
    name: string;
    value: string | boolean | number;
  }>,
): {
  criterion: string;
  values: Array<{
    name: string;
    value: string | boolean | number;
  }>;
} {
  return {
    criterion,
    values,
  };
}

function resolveComponent(
  registry: SaltRegistry,
  name: string,
  packageName?: string,
):
  | { candidate: ComponentRecord }
  | {
      ambiguity: CompareOptionsResult["ambiguity"];
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

function resolvePattern(
  registry: SaltRegistry,
  name: string,
):
  | { candidate: PatternRecord }
  | {
      ambiguity: CompareOptionsResult["ambiguity"];
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

function compareComponentCandidates(
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

function comparePatternCandidates(
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

function toCompactComponentComparison(candidate: ComponentCandidate) {
  return {
    name: candidate.component.name,
    summary: candidate.component.summary,
    best_for: candidate.component.when_to_use[0] ?? candidate.component.summary,
    avoid_when: candidate.component.when_not_to_use[0] ?? null,
    docs: getComponentDocs(candidate.component),
    examples: getExamplesDocs(candidate.component.related_docs.examples),
    caveats: candidate.caveats,
    ship_check: candidate.shipCheck,
    ...(candidate.component.status !== "stable"
      ? {
          status: candidate.component.status,
        }
      : {}),
  };
}

function toFullComponentComparison(candidate: ComponentCandidate) {
  return {
    ...toCompactComponentComparison(candidate),
    package: candidate.component.package.name,
    alternatives: candidate.component.alternatives,
    task_score: candidate.taskScore,
    matched_terms: candidate.matchedTerms,
    match_reasons: candidate.matchReasons,
  };
}

function toCompactPatternComparison(candidate: PatternCandidate) {
  return {
    name: candidate.pattern.name,
    summary: candidate.pattern.summary,
    best_for: candidate.pattern.when_to_use[0] ?? candidate.pattern.summary,
    avoid_when: candidate.pattern.when_not_to_use[0] ?? null,
    docs: getPatternDocs(candidate.pattern),
    examples: candidate.pattern.examples
      .slice(0, 3)
      .map((example) => example.source_url)
      .filter((value): value is string => Boolean(value)),
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

function toFullPatternComparison(candidate: PatternCandidate) {
  return {
    ...toCompactPatternComparison(candidate),
    related_patterns: candidate.pattern.related_patterns,
    task_score: candidate.taskScore,
    matched_terms: candidate.matchedTerms,
    match_reasons: candidate.matchReasons,
  };
}

export function compareOptions(
  registry: SaltRegistry,
  input: CompareOptionsInput,
): CompareOptionsResult {
  const optionType = input.option_type ?? "component";
  const task = normalizeQuery(input.task ?? "");
  const view = input.view ?? "compact";
  const filters: ConsumerRecommendationFilters = {
    production_ready: input.production_ready,
    prefer_stable: input.prefer_stable,
    a11y_required: input.a11y_required,
    form_field_support: input.form_field_support,
  };
  const uniqueNames = [
    ...new Set(input.names.map((name) => name.trim()).filter(Boolean)),
  ];

  if (uniqueNames.length < 2) {
    return {
      option_type: optionType,
      compared: [],
      next_step: getInsufficientComparisonNextStep(optionType),
    };
  }

  if (optionType === "pattern") {
    const resolvedPatterns: PatternCandidate[] = [];
    const unresolvedNames: string[] = [];

    for (const name of uniqueNames) {
      const resolution = resolvePattern(registry, name);
      if ("ambiguity" in resolution) {
        return {
          option_type: "pattern",
          compared: [],
          did_you_mean: resolution.did_you_mean,
          ambiguity: resolution.ambiguity,
        };
      }
      if (!resolution.candidate) {
        unresolvedNames.push(name);
        continue;
      }

      const score = task
        ? scoreQueryFields(task, getPatternQueryFields(resolution.candidate))
        : { score: 0, matched_terms: [], match_reasons: [] };

      resolvedPatterns.push({
        pattern: resolution.candidate,
        shipCheck: getPatternShipCheck(registry, resolution.candidate),
        caveats: getPatternCaveats(registry, resolution.candidate),
        taskScore: score.score,
        matchedTerms: score.matched_terms,
        matchReasons: score.match_reasons,
      });
    }

    const comparedCandidates = resolvedPatterns.sort((left, right) =>
      comparePatternCandidates(registry, left, right, filters),
    );
    const [recommended, nextBest] = comparedCandidates;
    const compared =
      view === "full"
        ? comparedCandidates.map(toFullPatternComparison)
        : comparedCandidates.map(toCompactPatternComparison);

    if (unresolvedNames.length > 0) {
      return {
        option_type: "pattern",
        compared: [],
        unresolved_names: unresolvedNames,
        next_step: getNoComparisonNextStep("pattern"),
      };
    }

    if (comparedCandidates.length === 0) {
      return {
        option_type: "pattern",
        compared,
        next_step: getNoComparisonNextStep("pattern"),
      };
    }

    return {
      option_type: "pattern",
      compared,
      recommendation: recommended
        ? {
            name: recommended.pattern.name,
            why: getComparisonWhy(
              {
                name: recommended.pattern.name,
                shipCheck: recommended.shipCheck,
                taskScore: recommended.taskScore,
              },
              nextBest
                ? {
                    name: nextBest.pattern.name,
                    shipCheck: nextBest.shipCheck,
                    taskScore: nextBest.taskScore,
                  }
                : undefined,
              input.task ?? "",
            ),
          }
        : undefined,
      differences:
        comparedCandidates.length > 0
          ? [
              buildDifference(
                "Status",
                comparedCandidates.map((candidate) => ({
                  name: candidate.pattern.name,
                  value: candidate.pattern.status,
                })),
              ),
              buildDifference(
                "Production ready",
                comparedCandidates.map((candidate) => ({
                  name: candidate.pattern.name,
                  value: candidate.shipCheck.stable_for_production,
                })),
              ),
              buildDifference(
                "Accessibility guidance",
                comparedCandidates.map((candidate) => ({
                  name: candidate.pattern.name,
                  value: candidate.shipCheck.accessibility_guidance,
                })),
              ),
              buildDifference(
                "Examples available",
                comparedCandidates.map((candidate) => ({
                  name: candidate.pattern.name,
                  value: candidate.shipCheck.examples_available,
                })),
              ),
              buildDifference(
                "FormField support",
                comparedCandidates.map((candidate) => ({
                  name: candidate.pattern.name,
                  value: candidate.shipCheck.form_field_support,
                })),
              ),
              buildDifference(
                "Component count",
                comparedCandidates.map((candidate) => ({
                  name: candidate.pattern.name,
                  value: candidate.pattern.composed_of.length,
                })),
              ),
            ]
          : undefined,
      suggested_follow_ups: recommended
        ? getPatternSuggestedFollowUps(recommended.pattern)
        : undefined,
      next_step: getComparisonNextStep("pattern", recommended?.pattern.name),
    };
  }

  const resolvedComponents: ComponentCandidate[] = [];
  const unresolvedNames: string[] = [];

  for (const name of uniqueNames) {
    const resolution = resolveComponent(registry, name, input.package);
    if ("ambiguity" in resolution) {
      return {
        option_type: "component",
        compared: [],
        did_you_mean: resolution.did_you_mean,
        ambiguity: resolution.ambiguity,
      };
    }
    if (!resolution.candidate) {
      unresolvedNames.push(name);
      continue;
    }

    const score = task
      ? scoreQueryFields(task, getComponentQueryFields(resolution.candidate))
      : { score: 0, matched_terms: [], match_reasons: [] };

    resolvedComponents.push({
      component: resolution.candidate,
      shipCheck: getComponentShipCheck(resolution.candidate),
      caveats: getComponentCaveats(resolution.candidate),
      taskScore: score.score,
      matchedTerms: score.matched_terms,
      matchReasons: score.match_reasons,
    });
  }

  const comparedCandidates = resolvedComponents.sort((left, right) =>
    compareComponentCandidates(left, right, filters),
  );
  const [recommended, nextBest] = comparedCandidates;
  const compared =
    view === "full"
      ? comparedCandidates.map(toFullComponentComparison)
      : comparedCandidates.map(toCompactComponentComparison);

  if (unresolvedNames.length > 0) {
    return {
      option_type: "component",
      compared: [],
      unresolved_names: unresolvedNames,
      next_step: getNoComparisonNextStep("component"),
    };
  }

  if (comparedCandidates.length === 0) {
    return {
      option_type: "component",
      compared,
      next_step: getNoComparisonNextStep("component"),
    };
  }

  return {
    option_type: "component",
    compared,
    recommendation: recommended
      ? {
          name: recommended.component.name,
          why: getComparisonWhy(
            {
              name: recommended.component.name,
              shipCheck: recommended.shipCheck,
              taskScore: recommended.taskScore,
            },
            nextBest
              ? {
                  name: nextBest.component.name,
                  shipCheck: nextBest.shipCheck,
                  taskScore: nextBest.taskScore,
                }
              : undefined,
            input.task ?? "",
          ),
        }
      : undefined,
    differences:
      comparedCandidates.length > 0
        ? [
            buildDifference(
              "Status",
              comparedCandidates.map((candidate) => ({
                name: candidate.component.name,
                value: candidate.component.status,
              })),
            ),
            buildDifference(
              "Production ready",
              comparedCandidates.map((candidate) => ({
                name: candidate.component.name,
                value: candidate.shipCheck.stable_for_production,
              })),
            ),
            buildDifference(
              "Accessibility guidance",
              comparedCandidates.map((candidate) => ({
                name: candidate.component.name,
                value: candidate.shipCheck.accessibility_guidance,
              })),
            ),
            buildDifference(
              "Examples available",
              comparedCandidates.map((candidate) => ({
                name: candidate.component.name,
                value: candidate.shipCheck.examples_available,
              })),
            ),
            buildDifference(
              "FormField support",
              comparedCandidates.map((candidate) => ({
                name: candidate.component.name,
                value: candidate.shipCheck.form_field_support,
              })),
            ),
          ]
        : undefined,
    suggested_follow_ups: recommended
      ? getComponentSuggestedFollowUps(
          recommended.component,
          comparedCandidates
            .slice(1)
            .map((candidate) => candidate.component.name),
        )
      : undefined,
    next_step: getComparisonNextStep("component", recommended?.component.name),
  };
}
