import type { SaltRegistry, SaltStatus } from "../types.js";
import {
  buildDifference,
  type CompareOptionType,
  compareComponentCandidates,
  comparePatternCandidates,
  createComponentCandidate,
  createPatternCandidate,
  getComparisonNextStep,
  getComparisonTask,
  getComparisonWhy,
  getInsufficientComparisonNextStep,
  getNoComparisonNextStep,
  resolveComponent,
  resolvePattern,
  toCompactComponentComparison,
  toCompactPatternComparison,
  toFullComponentComparison,
  toFullPatternComparison,
} from "./compareOptionsHelpers.js";
import type { ConsumerRecommendationFilters } from "./consumerFilters.js";
import {
  getComponentSuggestedFollowUps,
  getPatternSuggestedFollowUps,
  type SuggestedFollowUp,
} from "./consumerPresentation.js";
import {
  type GuideReference,
  getRelevantGuidesForRecords,
} from "./guideAwareness.js";

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
  related_guides?: GuideReference[];
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

export function compareOptions(
  registry: SaltRegistry,
  input: CompareOptionsInput,
): CompareOptionsResult {
  const optionType: CompareOptionType = input.option_type ?? "component";
  const view = input.view ?? "compact";
  const uniqueNames = [
    ...new Set(input.names.map((name) => name.trim())),
  ].filter(Boolean);
  const task = getComparisonTask(input.task);
  const filters: ConsumerRecommendationFilters = {
    production_ready: input.production_ready,
    prefer_stable: input.prefer_stable,
    a11y_required: input.a11y_required,
    form_field_support: input.form_field_support,
  };

  if (uniqueNames.length < 2) {
    return {
      option_type: optionType,
      compared: [],
      next_step: getInsufficientComparisonNextStep(optionType),
    };
  }

  if (optionType === "pattern") {
    const resolvedPatterns = [];
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

      resolvedPatterns.push(
        createPatternCandidate(registry, resolution.candidate, task),
      );
    }

    const comparedCandidates = resolvedPatterns.sort((left, right) =>
      comparePatternCandidates(registry, left, right, filters),
    );
    const [recommended, nextBest] = comparedCandidates;
    const compared =
      view === "full"
        ? comparedCandidates.map((candidate) =>
            toFullPatternComparison(registry, candidate),
          )
        : comparedCandidates.map((candidate) =>
            toCompactPatternComparison(registry, candidate),
          );
    const relatedGuides = getRelevantGuidesForRecords(registry, compared, {
      fallbackComponentNames: comparedCandidates.flatMap((candidate) =>
        candidate.pattern.composed_of.map((entry) => entry.component),
      ),
      top_k: 4,
    });

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
      related_guides: relatedGuides.length > 0 ? relatedGuides : undefined,
      next_step: getComparisonNextStep("pattern", recommended?.pattern.name),
    };
  }

  const resolvedComponents = [];
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

    resolvedComponents.push(
      createComponentCandidate(resolution.candidate, task),
    );
  }

  const comparedCandidates = resolvedComponents.sort((left, right) =>
    compareComponentCandidates(left, right, filters),
  );
  const [recommended, nextBest] = comparedCandidates;
  const compared =
    view === "full"
      ? comparedCandidates.map((candidate) =>
          toFullComponentComparison(registry, candidate),
        )
      : comparedCandidates.map((candidate) =>
          toCompactComponentComparison(registry, candidate),
        );
  const relatedGuides = getRelevantGuidesForRecords(registry, compared, {
    fallbackComponentNames: comparedCandidates.map(
      (candidate) => candidate.component.name,
    ),
    fallbackPackages: [
      ...new Set(
        comparedCandidates.map((candidate) => candidate.component.package.name),
      ),
    ],
    top_k: 4,
  });

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
    related_guides: relatedGuides.length > 0 ? relatedGuides : undefined,
    next_step: getComparisonNextStep("component", recommended?.component.name),
  };
}
