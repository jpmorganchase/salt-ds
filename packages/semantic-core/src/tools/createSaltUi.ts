import type { SaltRegistry, SaltStatus } from "../types.js";
import { compareOptions } from "./compareOptions.js";
import {
  buildCreateCompositionGuidance,
  type WorkflowCompositionContract,
  type WorkflowOpenQuestion,
} from "./compositionContract.js";
import type { SuggestedFollowUp } from "./consumerPresentation.js";
import {
  buildDecisionDebug,
  getCreateSaltUiRelatedGuides,
  getDecisionName,
  getGuidanceSources,
  getNamedRecords,
  reorderByPreferredCategories,
  resolveSolutionType,
  scoreFoundationComparison,
  toFoundationDifference,
  uniqueNormalized,
} from "./createSaltUiHelpers.js";
import { getCompositionRecipe } from "./getCompositionRecipe.js";
import { getFoundation } from "./getFoundation.js";
import {
  appendProjectConventionsNextStep,
  buildGuidanceBoundary,
  type GuidanceBoundary,
} from "./guidanceBoundary.js";
import type { GuideReference } from "./guideAwareness.js";
import { listFoundations } from "./listFoundations.js";
import { recommendComponent } from "./recommendComponent.js";
import { recommendTokens } from "./recommendTokens.js";
import { searchComponentCapabilities } from "./searchComponentCapabilities.js";
import {
  createFoundationStarterCode,
  type StarterCodeSnippet,
} from "./starterCode.js";

export type SaltSolutionType =
  | "auto"
  | "component"
  | "pattern"
  | "foundation"
  | "token";

export interface CreateSaltUiInput {
  query?: string;
  names?: string[];
  solution_type?: SaltSolutionType;
  preferred_categories?: string[];
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

export interface CreateSaltUiResult {
  mode: "recommend" | "compare";
  solution_type: Exclude<SaltSolutionType, "auto">;
  guidance_boundary: GuidanceBoundary;
  guidance_sources?: string[];
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
  composition_contract?: WorkflowCompositionContract | null;
  open_questions?: WorkflowOpenQuestion[];
  next_step?: string;
  did_you_mean?: string[];
  ambiguity?: Record<string, unknown>;
  raw?: Record<string, unknown>;
}

function withCompositionGuidance(
  registry: SaltRegistry,
  input: CreateSaltUiInput,
  result: CreateSaltUiResult,
): CreateSaltUiResult {
  const compositionGuidance = buildCreateCompositionGuidance(registry, {
    query: input.query,
    solution_type: result.solution_type,
    decision_name: result.decision.name,
  });

  return {
    ...result,
    composition_contract: compositionGuidance.composition_contract,
    ...(compositionGuidance.open_questions.length > 0
      ? { open_questions: compositionGuidance.open_questions }
      : {}),
  };
}

export function createSaltUi(
  registry: SaltRegistry,
  input: CreateSaltUiInput,
): CreateSaltUiResult {
  const view = input.view ?? "compact";
  const includeStarterCode = input.include_starter_code !== false;
  const topK = Math.max(1, Math.min(input.top_k ?? 5, 25));
  const query = input.query?.trim();
  const comparisonRequested =
    Array.isArray(input.names) &&
    input.names.some((name) => name.trim().length > 0);
  const names = [...new Set((input.names ?? []).map((name) => name.trim()))]
    .filter(Boolean)
    .slice(0, 10);
  const solutionType = resolveSolutionType(input);
  const preferredCategories = uniqueNormalized(
    input.preferred_categories ?? [],
  );
  const guidanceBoundary = buildGuidanceBoundary({
    workflow: "create_salt_ui",
    solution_type: solutionType,
  });

  // When names are supplied, comparison mode takes precedence over query-based recommendation.
  if (comparisonRequested) {
    if (solutionType === "foundation") {
      if (names.length < 2) {
        return withCompositionGuidance(registry, input, {
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
        });
      }

      const compared: Array<Record<string, unknown>> = [];

      for (const name of names) {
        const result = getFoundation(registry, {
          name,
          view,
        });
        if (result.ambiguity) {
          return withCompositionGuidance(registry, input, {
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
          });
        }
        if (!result.foundation) {
          return withCompositionGuidance(registry, input, {
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
          });
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

      return withCompositionGuidance(registry, input, {
        mode: "compare",
        solution_type: "foundation",
        guidance_boundary: guidanceBoundary,
        decision: {
          name: recommendedName,
          why: query
            ? `Best fit for "${query}" based on the closest matching foundation guidance.`
            : "Best default starting point from the compared foundation guidance.",
        },
        guidance_sources: getGuidanceSources(recommended),
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
        related_guides: getCreateSaltUiRelatedGuides(registry, ranked),
        next_step: appendProjectConventionsNextStep(
          typeof recommended?.next_step === "string"
            ? recommended.next_step
            : recommendedName
              ? `Apply the ${recommendedName.toLowerCase()} guidance to the current work.`
              : undefined,
          guidanceBoundary,
        ),
        raw:
          view === "full"
            ? {
                decision_debug: buildDecisionDebug(
                  registry,
                  "foundation",
                  recommended,
                  preferredCategories,
                ),
                compared,
              }
            : undefined,
      });
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

    return withCompositionGuidance(registry, input, {
      mode: "compare",
      solution_type: solutionType === "pattern" ? "pattern" : "component",
      guidance_boundary: guidanceBoundary,
      decision: {
        name: comparison.recommendation?.name ?? null,
        why:
          comparison.recommendation?.why ??
          "No clear comparison winner was found from the provided options.",
      },
      guidance_sources: getGuidanceSources(
        comparison.compared.find(
          (record) =>
            getDecisionName(record) === comparison.recommendation?.name,
        ),
      ),
      compared: comparison.compared,
      differences: comparison.differences,
      suggested_follow_ups: comparison.suggested_follow_ups,
      related_guides:
        comparison.related_guides ??
        getCreateSaltUiRelatedGuides(
          registry,
          comparison.compared,
          solutionType === "component"
            ? {
                fallbackComponentNames: names,
                fallbackPackages: input.package ? [input.package] : undefined,
              }
            : undefined,
        ),
      next_step: appendProjectConventionsNextStep(
        comparison.next_step,
        guidanceBoundary,
      ),
      did_you_mean: comparison.did_you_mean,
      ambiguity: comparison.ambiguity as Record<string, unknown> | undefined,
      raw:
        view === "full"
          ? {
              decision_debug: buildDecisionDebug(
                registry,
                solutionType === "pattern" ? "pattern" : "component",
                comparison.compared.find(
                  (record) =>
                    getDecisionName(record) === comparison.recommendation?.name,
                ) ?? null,
                preferredCategories,
              ),
              comparison,
            }
          : undefined,
    });
  }

  if (solutionType === "foundation") {
    const exact = query
      ? getFoundation(registry, {
          name: query,
          include_starter_code: includeStarterCode,
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

    return withCompositionGuidance(registry, input, {
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
      guidance_sources: getGuidanceSources(recommended),
      recommended: recommended ?? null,
      alternatives,
      suggested_follow_ups: exact.suggested_follow_ups,
      related_guides: getCreateSaltUiRelatedGuides(registry, [
        recommended,
        ...alternatives,
      ]),
      starter_code:
        exact.starter_code ??
        (() => {
          if (!includeStarterCode || !recommendedName) {
            return undefined;
          }

          const page =
            registry.pages.find((entry) => entry.title === recommendedName) ??
            null;

          return page ? createFoundationStarterCode(page) : undefined;
        })(),
      next_step: appendProjectConventionsNextStep(
        exact.next_step ??
          (recommendedName
            ? `Apply the ${recommendedName.toLowerCase()} guidance to the current work.`
            : "Try a more specific Salt foundation topic."),
        guidanceBoundary,
      ),
      did_you_mean: exact.did_you_mean,
      ambiguity: exact.ambiguity as Record<string, unknown> | undefined,
      raw:
        view === "full"
          ? {
              decision_debug: buildDecisionDebug(
                registry,
                "foundation",
                recommended,
                preferredCategories,
              ),
              exact,
              list,
            }
          : undefined,
    });
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

    return withCompositionGuidance(registry, input, {
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
      guidance_sources: getGuidanceSources(recommended),
      recommended: recommended ?? null,
      alternatives,
      related_guides: getCreateSaltUiRelatedGuides(registry, [
        recommended,
        ...alternatives,
      ]),
      next_step: appendProjectConventionsNextStep(
        tokenResult.next_step,
        guidanceBoundary,
      ),
      raw:
        view === "full"
          ? {
              decision_debug: buildDecisionDebug(
                registry,
                "token",
                recommended,
                preferredCategories,
              ),
              token_recommendations: tokenResult,
            }
          : undefined,
    });
  }

  if (solutionType === "pattern") {
    const recipeResult = getCompositionRecipe(registry, {
      query: query ?? "",
      top_k: Math.min(topK, 10),
      production_ready: input.production_ready,
      prefer_stable: input.prefer_stable,
      a11y_required: input.a11y_required,
      form_field_support: input.form_field_support,
      include_starter_code: includeStarterCode,
      view,
    });
    const recipes =
      view === "full"
        ? getNamedRecords(recipeResult.recipes)
        : [
            ...(recipeResult.recommended ? [recipeResult.recommended] : []),
            ...(recipeResult.alternatives ?? []),
          ];
    const [recommended, ...alternatives] = reorderByPreferredCategories(
      registry,
      "pattern",
      recipes,
      preferredCategories,
    );

    return withCompositionGuidance(registry, input, {
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
      guidance_sources: getGuidanceSources(recommended),
      recommended: recommended ?? null,
      alternatives,
      suggested_follow_ups: recipeResult.suggested_follow_ups,
      related_guides: getCreateSaltUiRelatedGuides(registry, [
        recommended,
        ...alternatives,
      ]),
      starter_code: recipeResult.starter_code,
      next_step: appendProjectConventionsNextStep(
        recipeResult.next_step,
        guidanceBoundary,
      ),
      raw:
        view === "full"
          ? {
              decision_debug: buildDecisionDebug(
                registry,
                "pattern",
                recommended,
                preferredCategories,
              ),
              composition_recipe: recipeResult,
            }
          : undefined,
    });
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
    include_starter_code: includeStarterCode,
    view,
  });
  const componentRecommendations =
    view === "full"
      ? getNamedRecords(recommendation.recommendations)
      : [
          ...(recommendation.recommended ? [recommendation.recommended] : []),
          ...(recommendation.alternatives ?? []),
        ];
  const [recommended, ...alternatives] = reorderByPreferredCategories(
    registry,
    "component",
    componentRecommendations,
    preferredCategories,
  );

  return withCompositionGuidance(registry, input, {
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
    guidance_sources: getGuidanceSources(recommended),
    recommended: recommended ?? null,
    alternatives,
    suggested_follow_ups: recommendation.suggested_follow_ups,
    related_guides: getCreateSaltUiRelatedGuides(
      registry,
      [recommended, ...alternatives],
      {
        fallbackComponentNames:
          typeof recommended?.name === "string" ? [recommended.name] : [],
        fallbackPackages: input.package ? [input.package] : undefined,
      },
    ),
    starter_code: recommendation.starter_code,
    next_step: appendProjectConventionsNextStep(
      recommendation.next_step,
      guidanceBoundary,
    ),
    raw:
      view === "full"
        ? {
            decision_debug: buildDecisionDebug(
              registry,
              "component",
              recommended,
              preferredCategories,
            ),
            component_recommendations: recommendation,
            capability_matches: searchComponentCapabilities(registry, {
              query: query ?? "",
              package: input.package,
              status: input.status,
              top_k: Math.min(topK, 10),
            }),
          }
        : undefined,
  });
}
