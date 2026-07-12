import type { SaltRegistry } from "../types.js";
import type { CreateRecommendationResolution } from "./createResolve.js";
import type { CreateSaltUiInput, CreateSaltUiResult } from "./createSaltUi.js";
import {
  getCreateSaltUiRelatedGuides,
  getGuidanceSources,
} from "./createSaltUiHelpers.js";
import { getFoundation } from "./getFoundation.js";
import { getSaltEntity } from "./getSaltEntity.js";

function toResolutionTrace(
  resolution?: CreateRecommendationResolution,
): Record<string, unknown> | undefined {
  if (!resolution) {
    return undefined;
  }

  return {
    query: resolution.query ?? null,
    comparison_requested: resolution.comparison_requested,
    solution_type_hint: resolution.solution_type_hint,
    solution_type: resolution.solution_type,
    routed_query: resolution.routed_query ?? null,
    retrieval_status: resolution.retrieval?.status ?? null,
    reference_kind: resolution.reference?.reference_kind ?? null,
    requested_entity: resolution.reference?.requested_entity ?? null,
  };
}

export function enrichResolvedCreateResult(
  registry: SaltRegistry,
  input: CreateSaltUiInput,
  compactResult: CreateSaltUiResult,
  resolution?: CreateRecommendationResolution,
): CreateSaltUiResult {
  const rawResolution: Record<string, unknown> = {
    full_mode_source: "compact_resolution",
    resolution: {
      mode: compactResult.mode,
      solution_type: compactResult.solution_type,
      decision_name: compactResult.decision.name,
      ...(toResolutionTrace(resolution)
        ? { trace: toResolutionTrace(resolution) }
        : {}),
    },
  };

  if (compactResult.mode !== "recommend" || !compactResult.decision.name) {
    return {
      ...compactResult,
      raw: rawResolution,
    };
  }

  if (
    compactResult.solution_type === "component" ||
    compactResult.solution_type === "pattern"
  ) {
    const exact = getSaltEntity(registry, {
      entity_type: compactResult.solution_type,
      name: compactResult.decision.name,
      package: input.package,
      status: input.status,
      include_related: true,
      include_starter_code: input.include_starter_code !== false,
      view: "full",
    });
    const relatedSameType =
      compactResult.solution_type === "component"
        ? (exact.related?.components ?? [])
        : (exact.related?.patterns ?? []);

    return {
      ...compactResult,
      guidance_sources: exact.entity
        ? getGuidanceSources(exact.entity)
        : compactResult.guidance_sources,
      recommended: exact.entity ?? compactResult.recommended,
      alternatives:
        compactResult.alternatives && compactResult.alternatives.length > 0
          ? compactResult.alternatives
          : relatedSameType,
      related_guides:
        compactResult.related_guides ??
        getCreateSaltUiRelatedGuides(registry, [
          exact.entity,
          ...relatedSameType,
        ]),
      suggested_follow_ups:
        compactResult.suggested_follow_ups ?? exact.suggested_follow_ups,
      starter_code: compactResult.starter_code ?? exact.starter_code,
      next_step: compactResult.next_step ?? exact.next_step,
      raw: {
        ...rawResolution,
        exact_entity: exact,
      },
    };
  }

  if (compactResult.solution_type === "foundation") {
    const exact = getFoundation(registry, {
      name: compactResult.decision.name,
      include_starter_code: input.include_starter_code !== false,
      view: "full",
    });

    return {
      ...compactResult,
      recommended: exact.foundation ?? compactResult.recommended,
      suggested_follow_ups:
        compactResult.suggested_follow_ups ?? exact.suggested_follow_ups,
      starter_code: compactResult.starter_code ?? exact.starter_code,
      next_step: compactResult.next_step ?? exact.next_step,
      raw: {
        ...rawResolution,
        exact_foundation: exact,
      },
    };
  }

  return {
    ...compactResult,
    raw: rawResolution,
  };
}
