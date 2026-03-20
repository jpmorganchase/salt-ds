import type { SaltRegistry, SaltStatus } from "../types.js";
import { compareOptions } from "./compareOptions.js";
import type { SuggestedFollowUp } from "./consumerPresentation.js";
import {
  getRelevantGuidesForRecords,
  type GuideReference,
} from "./guideAwareness.js";
import {
  buildGuidanceBoundary,
  type GuidanceBoundary,
} from "./guidanceBoundary.js";
import { getCompositionRecipe } from "./getCompositionRecipe.js";
import { getFoundation } from "./getFoundation.js";
import { listFoundations } from "./listFoundations.js";
import { recommendComponent } from "./recommendComponent.js";
import { recommendTokens } from "./recommendTokens.js";
import { searchComponentCapabilities } from "./searchComponentCapabilities.js";
import {
  createFoundationStarterCode,
  type StarterCodeSnippet,
} from "./starterCode.js";
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

export type SaltSolutionType =
  | "auto"
  | "component"
  | "pattern"
  | "foundation"
  | "token";

export interface ChooseSaltSolutionInput {
  query?: string;
  names?: string[];
  solution_type?: SaltSolutionType;
  package?: string;
  status?: SaltStatus;
  top_k?: number;
  production_ready?: boolean;
  prefer_stable?: boolean;
  a11y_required?: boolean;
  form_field_support?: boolean;
  include_starter_code?: boolean;
  view?: "compact" | "full";
}

export interface ChooseSaltSolutionResult {
  mode: "recommend" | "compare";
  solution_type: Exclude<SaltSolutionType, "auto">;
  guidance_boundary: GuidanceBoundary;
  decision: {
    name: string | null;
    why: string;
  };
  recommended?: Record<string, unknown> | null;
  alternatives?: Array<Record<string, unknown>>;
  compared?: Array<Record<string, unknown>>;
  differences?: Array<{
    criterion: string;
    values: Array<{
      name: string;
      value: string | boolean | number | null;
    }>;
  }>;
  suggested_follow_ups?: SuggestedFollowUp[];
  related_guides?: GuideReference[];
  starter_code?: StarterCodeSnippet[];
  next_step?: string;
  did_you_mean?: string[];
  ambiguity?: Record<string, unknown>;
  raw?: Record<string, unknown>;
}

function getChooseSaltSolutionRelatedGuides(
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

function resolveSolutionType(
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

function getNamedRecords(
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

function getDecisionName(record: Record<string, unknown> | null | undefined) {
  if (!record) {
    return null;
  }

  if (typeof record.name === "string") {
    return record.name;
  }
  if (typeof record.title === "string") {
    return record.title;
  }

  return null;
}

function scoreFoundationComparison(
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

function toFoundationDifference(
  criterion: string,
  values: Array<{
    name: string;
    value: string | boolean | number | null;
  }>,
): NonNullable<ChooseSaltSolutionResult["differences"]>[number] {
  return { criterion, values };
}

export function chooseSaltSolution(
  registry: SaltRegistry,
  input: ChooseSaltSolutionInput,
): ChooseSaltSolutionResult {
  const view = input.view ?? "compact";
  const topK = Math.max(1, Math.min(input.top_k ?? 5, 25));
  const query = input.query?.trim();
  const comparisonRequested =
    Array.isArray(input.names) &&
    input.names.some((name) => name.trim().length > 0);
  const names = [...new Set((input.names ?? []).map((name) => name.trim()))]
    .filter(Boolean)
    .slice(0, 10);
  const solutionType = resolveSolutionType(input);
  const guidanceBoundary = buildGuidanceBoundary({
    workflow: "choose_salt_solution",
    solution_type: solutionType,
  });

  // When names are supplied, comparison mode takes precedence over query-based recommendation.
  if (comparisonRequested) {
    if (solutionType === "foundation") {
      if (names.length < 2) {
        return {
          mode: "compare",
          solution_type: "foundation",
          guidance_boundary: guidanceBoundary,
          decision: {
            name: null,
            why: "Comparison mode was requested, but at least two exact foundation titles are required.",
          },
          compared: [],
          next_step:
            "Provide at least two exact foundation titles to compare, or remove names and use query for recommendation mode.",
        };
      }

      const compared: Array<Record<string, unknown>> = [];

      for (const name of names) {
        const result = getFoundation(registry, {
          name,
          view,
        });
        if (result.ambiguity) {
          return {
            mode: "compare",
            solution_type: "foundation",
            guidance_boundary: guidanceBoundary,
            decision: {
              name: null,
              why: "Multiple foundation matches share that title or slug.",
            },
            compared: [],
            did_you_mean: result.did_you_mean,
            ambiguity: result.ambiguity as Record<string, unknown>,
            next_step:
              "Retry with the exact foundation titles you want to compare.",
          };
        }
        if (!result.foundation) {
          return {
            mode: "compare",
            solution_type: "foundation",
            guidance_boundary: guidanceBoundary,
            decision: {
              name: null,
              why: `At least one foundation could not be resolved from ${name}.`,
            },
            compared: [],
            next_step:
              "Retry with exact foundation titles or start from discover_salt.",
          };
        }

        compared.push(result.foundation);
      }

      const ranked = [...compared].sort((left, right) => {
        const rightScore = scoreFoundationComparison(right, query ?? "");
        const leftScore = scoreFoundationComparison(left, query ?? "");
        if (leftScore !== rightScore) {
          return rightScore - leftScore;
        }
        return String(left.title ?? left.name).localeCompare(
          String(right.title ?? right.name),
        );
      });
      const [recommended] = ranked;
      const recommendedName = getDecisionName(recommended);

      return {
        mode: "compare",
        solution_type: "foundation",
        guidance_boundary: guidanceBoundary,
        decision: {
          name: recommendedName,
          why: query
            ? `Best fit for "${query}" based on the closest matching foundation guidance.`
            : "Best default starting point from the compared foundation guidance.",
        },
        compared: view === "full" ? ranked : compared,
        differences: compared.length
          ? [
              toFoundationDifference(
                "Topic count",
                compared.map((foundation) => ({
                  name: String(foundation.title ?? "Foundation"),
                  value: Array.isArray(foundation.topics)
                    ? foundation.topics.length
                    : Array.isArray(foundation.section_headings)
                      ? foundation.section_headings.length
                      : 0,
                })),
              ),
              toFoundationDifference(
                "Guidance excerpts",
                compared.map((foundation) => ({
                  name: String(foundation.title ?? "Foundation"),
                  value: Array.isArray(foundation.guidance)
                    ? foundation.guidance.length
                    : Array.isArray(foundation.content)
                      ? foundation.content.length
                      : 0,
                })),
              ),
            ]
          : undefined,
        related_guides: getChooseSaltSolutionRelatedGuides(registry, ranked),
        next_step:
          typeof recommended?.next_step === "string"
            ? recommended.next_step
            : recommendedName
              ? `Apply the ${recommendedName.toLowerCase()} guidance to the current work.`
              : undefined,
        raw:
          view === "full"
            ? {
                compared,
              }
            : undefined,
      };
    }

    const comparison = compareOptions(registry, {
      names,
      option_type: solutionType === "pattern" ? "pattern" : "component",
      package: input.package,
      task: input.query,
      production_ready: input.production_ready,
      prefer_stable: input.prefer_stable,
      a11y_required: input.a11y_required,
      form_field_support: input.form_field_support,
      view,
    });

    return {
      mode: "compare",
      solution_type: solutionType === "pattern" ? "pattern" : "component",
      guidance_boundary: guidanceBoundary,
      decision: {
        name: comparison.recommendation?.name ?? null,
        why:
          comparison.recommendation?.why ??
          "No clear comparison winner was found from the provided options.",
      },
      compared: comparison.compared,
      differences: comparison.differences,
      suggested_follow_ups: comparison.suggested_follow_ups,
      related_guides:
        comparison.related_guides ??
        getChooseSaltSolutionRelatedGuides(
          registry,
          comparison.compared,
          solutionType === "component"
            ? {
                fallbackComponentNames: names,
                fallbackPackages: input.package ? [input.package] : undefined,
              }
            : undefined,
        ),
      next_step: comparison.next_step,
      did_you_mean: comparison.did_you_mean,
      ambiguity: comparison.ambiguity as Record<string, unknown> | undefined,
      raw:
        view === "full"
          ? {
              comparison,
            }
          : undefined,
    };
  }

  if (solutionType === "foundation") {
    const exact = query
      ? getFoundation(registry, {
          name: query,
          include_starter_code: input.include_starter_code,
          view,
        })
      : ({ foundation: null } as ReturnType<typeof getFoundation>);
    const list = listFoundations(registry, {
      query,
      max_results: topK,
    });
    const [recommended, ...alternatives] = exact.foundation
      ? [
          exact.foundation,
          ...list.foundations.filter(
            (item) => item.title !== exact.foundation?.title,
          ),
        ]
      : list.foundations;
    const recommendedName = getDecisionName(recommended);

    return {
      mode: "recommend",
      solution_type: "foundation",
      guidance_boundary: guidanceBoundary,
      decision: {
        name: recommendedName,
        why: recommendedName
          ? query
            ? `Best Salt foundation match for "${query}".`
            : "Best Salt foundation starting point."
          : "No close foundation match was found.",
      },
      recommended: recommended ?? null,
      alternatives,
      suggested_follow_ups: exact.suggested_follow_ups,
      related_guides: getChooseSaltSolutionRelatedGuides(registry, [
        recommended,
        ...alternatives,
      ]),
      starter_code:
        exact.starter_code ??
        (() => {
          if (!input.include_starter_code || !recommendedName) {
            return undefined;
          }

          const page =
            registry.pages.find((entry) => entry.title === recommendedName) ??
            null;

          return page ? createFoundationStarterCode(page) : undefined;
        })(),
      next_step:
        exact.next_step ??
        (recommendedName
          ? `Apply the ${recommendedName.toLowerCase()} guidance to the current work.`
          : "Try a more specific Salt foundation topic."),
      did_you_mean: exact.did_you_mean,
      ambiguity: exact.ambiguity as Record<string, unknown> | undefined,
      raw:
        view === "full"
          ? {
              exact,
              list,
            }
          : undefined,
    };
  }

  if (solutionType === "token") {
    const tokenResult = recommendTokens(registry, {
      query: query ?? "",
      top_k: topK,
      view,
    });
    const recommendations =
      view === "full"
        ? getNamedRecords(tokenResult.recommendations)
        : [
            ...(tokenResult.recommended ? [tokenResult.recommended] : []),
            ...(tokenResult.alternatives ?? []),
          ];
    const [recommended, ...alternatives] = recommendations;

    return {
      mode: "recommend",
      solution_type: "token",
      guidance_boundary: guidanceBoundary,
      decision: {
        name: getDecisionName(recommended),
        why:
          typeof recommended?.why === "string"
            ? recommended.why
            : "Best Salt token match for the styling need.",
      },
      recommended: recommended ?? null,
      alternatives,
      related_guides: getChooseSaltSolutionRelatedGuides(registry, [
        recommended,
        ...alternatives,
      ]),
      next_step: tokenResult.next_step,
      raw:
        view === "full"
          ? {
              token_recommendations: tokenResult,
            }
          : undefined,
    };
  }

  if (solutionType === "pattern") {
    const recipeResult = getCompositionRecipe(registry, {
      query: query ?? "",
      top_k: Math.min(topK, 10),
      production_ready: input.production_ready,
      prefer_stable: input.prefer_stable,
      a11y_required: input.a11y_required,
      form_field_support: input.form_field_support,
      include_starter_code: input.include_starter_code,
      view,
    });
    const recipes =
      view === "full"
        ? getNamedRecords(recipeResult.recipes)
        : [
            ...(recipeResult.recommended ? [recipeResult.recommended] : []),
            ...(recipeResult.alternatives ?? []),
          ];
    const [recommended, ...alternatives] = recipes;

    return {
      mode: "recommend",
      solution_type: "pattern",
      guidance_boundary: guidanceBoundary,
      decision: {
        name: getDecisionName(recommended),
        why:
          typeof recommended?.summary === "string"
            ? recommended.summary
            : "Best Salt pattern or composition match for the requested flow.",
      },
      recommended: recommended ?? null,
      alternatives,
      suggested_follow_ups: recipeResult.suggested_follow_ups,
      related_guides: getChooseSaltSolutionRelatedGuides(registry, [
        recommended,
        ...alternatives,
      ]),
      starter_code: recipeResult.starter_code,
      next_step: recipeResult.next_step,
      raw:
        view === "full"
          ? {
              composition_recipe: recipeResult,
            }
          : undefined,
    };
  }

  const recommendation = recommendComponent(registry, {
    task: query ?? "",
    package: input.package,
    status: input.status,
    top_k: topK,
    production_ready: input.production_ready,
    prefer_stable: input.prefer_stable,
    a11y_required: input.a11y_required,
    form_field_support: input.form_field_support,
    include_starter_code: input.include_starter_code,
    view,
  });
  const componentRecommendations =
    view === "full"
      ? getNamedRecords(recommendation.recommendations)
      : [
          ...(recommendation.recommended ? [recommendation.recommended] : []),
          ...(recommendation.alternatives ?? []),
        ];
  const [recommended, ...alternatives] = componentRecommendations;

  return {
    mode: "recommend",
    solution_type: "component",
    guidance_boundary: guidanceBoundary,
    decision: {
      name: getDecisionName(recommended),
      why:
        typeof recommended?.why === "string"
          ? recommended.why
          : "Best Salt component match for the requested need.",
    },
    recommended: recommended ?? null,
    alternatives,
    suggested_follow_ups: recommendation.suggested_follow_ups,
    related_guides: getChooseSaltSolutionRelatedGuides(
      registry,
      [recommended, ...alternatives],
      {
        fallbackComponentNames:
          typeof recommended?.name === "string" ? [recommended.name] : [],
        fallbackPackages: input.package ? [input.package] : undefined,
      },
    ),
    starter_code: recommendation.starter_code,
    next_step: recommendation.next_step,
    raw:
      view === "full"
        ? {
            component_recommendations: recommendation,
            capability_matches: searchComponentCapabilities(registry, {
              query: query ?? "",
              package: input.package,
              status: input.status,
              top_k: Math.min(topK, 10),
            }),
          }
        : undefined,
  };
}
