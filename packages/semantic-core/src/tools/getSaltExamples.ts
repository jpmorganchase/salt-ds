import type { PatternRecord, SaltRegistry } from "../types.js";
import type { SuggestedFollowUp } from "./consumerPresentation.js";
import { getExamples } from "./getExamples.js";
import {
  appendProjectConventionsNextStep,
  buildGuidanceBoundary,
  type GuidanceBoundary,
} from "./guidanceBoundary.js";
import {
  createComponentStarterCode,
  createRecipeStarterCode,
  type StarterCodeSnippet,
} from "./starterCode.js";

export interface GetSaltExamplesInput {
  target_type?: "component" | "pattern";
  target_name?: string;
  package?: string;
  query?: string;
  complexity?: "basic" | "intermediate" | "advanced";
  include_code?: boolean;
  include_starter_code?: boolean;
  max_results?: number;
  view?: "compact" | "full";
}

export interface GetSaltExamplesResult {
  guidance_boundary: GuidanceBoundary;
  decision: {
    target_name: string | null;
    target_type: "component" | "pattern" | null;
    why: string;
  };
  best_example: Record<string, unknown> | null;
  alternatives?: Array<Record<string, unknown>>;
  examples?: Array<Record<string, unknown>>;
  starter_code?: StarterCodeSnippet[];
  suggested_follow_ups?: SuggestedFollowUp[];
  next_step?: string;
  resolved_target?: {
    query: string;
    target_type: "component" | "pattern";
    name: string;
    package: string | null;
    matched_by?: Array<"name" | "alias" | "slug">;
  };
  did_you_mean?: string[];
  ambiguity?: Record<string, unknown>;
  raw?: Record<string, unknown>;
}

function createPatternStarter(
  pattern: PatternRecord,
): StarterCodeSnippet[] | undefined {
  return createRecipeStarterCode({
    recipeName: pattern.name,
    components: pattern.composed_of.map((entry) => ({
      name: entry.component,
      package: null,
      role: entry.role,
    })),
    supporting_example: pattern.examples[0]
      ? {
          title: pattern.examples[0].title,
          code: pattern.examples[0].code,
          source_url: pattern.examples[0].source_url,
        }
      : null,
  });
}

function getStarterCode(
  registry: SaltRegistry,
  result: ReturnType<typeof getExamples>,
  input: GetSaltExamplesInput,
): StarterCodeSnippet[] | undefined {
  if (!input.include_starter_code || !result.resolved_target) {
    return undefined;
  }

  if (result.resolved_target.target_type === "component") {
    const component =
      registry.components.find(
        (entry) =>
          entry.name === result.resolved_target?.name &&
          (result.resolved_target.package
            ? entry.package.name === result.resolved_target.package
            : true),
      ) ?? null;

    return component ? createComponentStarterCode(component) : undefined;
  }

  const pattern =
    registry.patterns.find(
      (entry) => entry.name === result.resolved_target?.name,
    ) ?? null;

  return pattern ? createPatternStarter(pattern) : undefined;
}

export function getSaltExamples(
  registry: SaltRegistry,
  input: GetSaltExamplesInput,
): GetSaltExamplesResult {
  const view = input.view ?? "compact";
  const result = getExamples(registry, {
    target_type: input.target_type,
    target_name: input.target_name,
    package: input.package,
    intent: input.query,
    complexity: input.complexity,
    include_code: input.include_code,
    max_results: input.max_results,
    view,
  });
  const resolvedTargetType =
    result.resolved_target?.target_type ?? input.target_type ?? undefined;
  const guidanceBoundary = buildGuidanceBoundary({
    workflow: "get_salt_examples",
    target_type: resolvedTargetType,
  });

  return {
    guidance_boundary: guidanceBoundary,
    decision: {
      target_name: result.resolved_target?.name ?? null,
      target_type: result.resolved_target?.target_type ?? null,
      why:
        result.why_this_example ??
        (result.best_example
          ? "Best example from the current Salt registry."
          : "No close Salt example match was found."),
    },
    best_example: result.best_example ?? null,
    alternatives:
      result.nearby_examples && result.nearby_examples.length > 0
        ? result.nearby_examples
        : undefined,
    examples: view === "full" ? result.examples : undefined,
    starter_code: getStarterCode(registry, result, input),
    suggested_follow_ups: result.suggested_follow_ups,
    next_step: appendProjectConventionsNextStep(
      result.next_step,
      guidanceBoundary,
    ),
    resolved_target: result.resolved_target,
    did_you_mean: result.did_you_mean,
    ambiguity: result.ambiguity as Record<string, unknown> | undefined,
    raw:
      view === "full"
        ? {
            examples: result.examples,
          }
        : undefined,
  };
}
