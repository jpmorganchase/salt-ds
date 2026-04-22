import type { SaltRegistry, SaltStatus } from "../types.js";
import { collectCreateQueryAnchors } from "./createQueryAnchors.js";
import {
  type CreateRetrievalCandidate,
  type CreateTargetReference,
  deriveCreateTargetReferenceFromQuery,
  hasExplicitComponentHint,
  hasExplicitPatternHint,
  pickRetrievedCreateOwner,
  type RetrieveCreateCandidatesResult,
  resolveCreateNamedTarget,
  retrieveCreateCandidates,
} from "./createRetrieval.js";
import { resolveSolutionType } from "./createSaltUiHelpers.js";
import { getStructuralPatternIntent } from "./patternIntent.js";

export type CreateResolutionSolutionType =
  | "auto"
  | "component"
  | "pattern"
  | "foundation"
  | "token";

export type CreateResolvedMatchStatus =
  | "exact"
  | "alias"
  | "broadened"
  | "misrouted"
  | "no_match";

export interface ResolveCreateInput {
  query?: string;
  names?: string[];
  solution_type?: CreateResolutionSolutionType;
  package?: string;
  status?: SaltStatus;
  top_k?: number;
  production_ready?: boolean;
  prefer_stable?: boolean;
  a11y_required?: boolean;
  form_field_support?: boolean;
}

export interface CreateRecommendationResolution {
  query: string | undefined;
  comparison_requested: boolean;
  solution_type_hint: Exclude<CreateResolutionSolutionType, "auto">;
  solution_type: Exclude<CreateResolutionSolutionType, "auto">;
  routed_query: string | undefined;
  retrieval: RetrieveCreateCandidatesResult | null;
  reference?: CreateTargetReference;
}

export interface CreateRequestMatch {
  requested_entity: string;
  resolved_entity: string | null;
  match_status: CreateResolvedMatchStatus;
  exact_match_required: boolean;
  reference?: CreateTargetReference;
}

export interface DeriveCreateRequestMatchInput {
  query?: string;
  package?: string;
  result_mode: "recommend" | "compare";
  result_decision_name?: string | null;
  result_solution_type: Exclude<CreateResolutionSolutionType, "auto">;
}

export function hasCreateComparisonInput(input: { names?: string[] }): boolean {
  return (
    Array.isArray(input.names) &&
    input.names.some((name) => name.trim().length > 0)
  );
}

function sortCreateCandidates(
  left: CreateRetrievalCandidate,
  right: CreateRetrievalCandidate,
): number {
  if (left.explicit_owner_hits !== right.explicit_owner_hits) {
    return right.explicit_owner_hits - left.explicit_owner_hits;
  }
  if (left.confidence !== right.confidence) {
    return right.confidence - left.confidence;
  }
  if (left.total_score !== right.total_score) {
    return right.total_score - left.total_score;
  }
  return left.entity_name.localeCompare(right.entity_name);
}

function shouldUseRetrievedCreateOwner(input: {
  solution_type_hint: Exclude<CreateResolutionSolutionType, "auto">;
  retrieval: RetrieveCreateCandidatesResult;
}): boolean {
  if (!input.retrieval.owner) {
    return false;
  }

  if (
    input.solution_type_hint === "component" ||
    input.solution_type_hint === "pattern"
  ) {
    return (
      input.retrieval.owner.entity_type === input.solution_type_hint ||
      input.retrieval.status === "exact"
    );
  }

  if (input.retrieval.status === "exact") {
    return true;
  }

  return (
    input.retrieval.owner.confidence >= 90 &&
    input.retrieval.owner.total_score >= 60
  );
}

function pickForcedPatternComponentOverride(input: {
  registry: SaltRegistry;
  query: string | undefined;
  solution_type_hint: Exclude<CreateResolutionSolutionType, "auto">;
  retrieval: RetrieveCreateCandidatesResult | null;
  explicit_pattern_hint?: boolean;
  structural_pattern_intent_score?: number;
}) {
  if (
    !input.query ||
    !input.retrieval?.owner ||
    input.retrieval.owner.entity_type !== "pattern"
  ) {
    return null;
  }

  const forcedPatternMode = input.solution_type_hint === "pattern";
  if (
    !forcedPatternMode &&
    (input.explicit_pattern_hint ||
      (input.structural_pattern_intent_score ?? 0) >= 4)
  ) {
    return null;
  }
  if (!forcedPatternMode && input.retrieval.owner.explicit_owner_hits > 0) {
    return null;
  }

  const anchoredComponentNames = new Set(
    collectCreateQueryAnchors(input.registry, input.query)
      .filter((anchor) => anchor.entity_type === "component")
      .map((anchor) => anchor.name),
  );

  const [candidate] = input.retrieval.candidates
    .filter((entry) => entry.entity_type === "component")
    .filter(
      (entry) =>
        anchoredComponentNames.has(entry.entity_name) ||
        entry.match_reasons.some((reason) =>
          [
            "canonical_name:full_phrase",
            "canonical_name:prefix_phrase",
            "alias:full_phrase",
            "alias:prefix_phrase",
          ].includes(reason),
        ),
    )
    .sort(sortCreateCandidates);

  if (!candidate) {
    return null;
  }

  const strongPatternIntent =
    input.explicit_pattern_hint ||
    (input.structural_pattern_intent_score ?? 0) >= 4;

  if (forcedPatternMode) {
    const allowLooseForcedOverride =
      !strongPatternIntent &&
      input.retrieval.owner.explicit_owner_hits === 0 &&
      candidate.explicit_owner_hits > 0;
    if (
      allowLooseForcedOverride
        ? candidate.total_score <
          Math.max(18, input.retrieval.owner.total_score - 110)
        : candidate.total_score < input.retrieval.owner.total_score - 16 ||
          candidate.confidence < input.retrieval.owner.confidence - 24
    ) {
      return null;
    }
  } else if (
    candidate.total_score <
    Math.max(18, input.retrieval.owner.total_score - 110)
  ) {
    return null;
  }

  return candidate;
}

function pickAnchoredCreateOverride(input: {
  registry: SaltRegistry;
  query: string | undefined;
  retrieval: RetrieveCreateCandidatesResult | null;
  explicit_pattern_hint?: boolean;
  structural_pattern_intent_score?: number;
}): CreateRetrievalCandidate | null {
  if (!input.query || !input.retrieval?.candidates.length) {
    return null;
  }

  const topOwner =
    input.retrieval.owner ?? input.retrieval.candidates[0] ?? null;
  if (!topOwner) {
    return null;
  }

  const anchoredNames = new Set(
    collectCreateQueryAnchors(input.registry, input.query).map(
      (anchor) => anchor.name,
    ),
  );

  const [candidate] = input.retrieval.candidates
    .filter((entry) => anchoredNames.has(entry.entity_name))
    .sort(sortCreateCandidates);

  if (!candidate || candidate.entity_id === topOwner.entity_id) {
    return null;
  }

  const strongPatternIntent =
    input.explicit_pattern_hint ||
    (input.structural_pattern_intent_score ?? 0) >= 4;

  if (
    strongPatternIntent &&
    topOwner.entity_type === "pattern" &&
    topOwner.structural_weight > candidate.structural_weight
  ) {
    const preserveStructuralOwner =
      topOwner.confidence >= candidate.confidence - 24 ||
      topOwner.total_score >= candidate.total_score - 24;

    if (preserveStructuralOwner) {
      return null;
    }
  }

  if (topOwner.explicit_owner_hits > 0 && candidate.explicit_owner_hits === 0) {
    return null;
  }

  const closeEnough =
    candidate.explicit_owner_hits > 0 ||
    candidate.match_reasons.some((reason) =>
      [
        "canonical_name:full_phrase",
        "canonical_name:prefix_phrase",
        "alias:full_phrase",
        "alias:prefix_phrase",
      ].includes(reason),
    ) ||
    candidate.confidence >= topOwner.confidence - 16 ||
    candidate.total_score >= topOwner.total_score - 16;

  return closeEnough ? candidate : null;
}

function pickHintAlignedCreateOverride(input: {
  retrieval: RetrieveCreateCandidatesResult | null;
  solution_type_hint: Exclude<CreateResolutionSolutionType, "auto">;
}): CreateRetrievalCandidate | null {
  if (
    !input.retrieval?.candidates.length ||
    (input.solution_type_hint !== "component" &&
      input.solution_type_hint !== "pattern")
  ) {
    return null;
  }

  const topOwner =
    input.retrieval.owner ?? input.retrieval.candidates[0] ?? null;
  if (!topOwner || topOwner.entity_type === input.solution_type_hint) {
    return null;
  }

  const [candidate] = input.retrieval.candidates
    .filter((entry) => entry.entity_type === input.solution_type_hint)
    .sort(sortCreateCandidates);

  if (!candidate) {
    return null;
  }

  const closeEnough =
    candidate.confidence >= topOwner.confidence - 8 ||
    candidate.total_score >= topOwner.total_score - 8;

  return closeEnough ? candidate : null;
}

export function resolveCreateRecommendation(
  registry: SaltRegistry,
  input: ResolveCreateInput,
): CreateRecommendationResolution {
  const comparisonRequested = hasCreateComparisonInput(input);
  const topK = Math.max(1, Math.min(input.top_k ?? 5, 25));
  const query = input.query?.trim();
  const explicitSolutionTypeHint =
    input.solution_type &&
    input.solution_type !== "auto" &&
    (input.solution_type === "component" ||
      input.solution_type === "pattern" ||
      input.solution_type === "foundation" ||
      input.solution_type === "token")
      ? input.solution_type
      : undefined;
  const solutionTypeHint = resolveSolutionType(input);
  let solutionType = solutionTypeHint;
  let routedQuery = query;
  let retrieval: RetrieveCreateCandidatesResult | null = null;

  if (query && !comparisonRequested) {
    const explicitComponentHint = hasExplicitComponentHint(query);
    const explicitPatternHint = hasExplicitPatternHint(query);
    const structuralPatternIntent = getStructuralPatternIntent(query);
    retrieval = retrieveCreateCandidates(registry, {
      query,
      package: input.package,
      status: input.status,
      top_k: Math.min(topK, 10),
      solution_type_hint:
        explicitSolutionTypeHint === "component" ||
        explicitSolutionTypeHint === "pattern"
          ? explicitSolutionTypeHint
          : undefined,
      filters: {
        production_ready: input.production_ready,
        prefer_stable: input.prefer_stable,
        a11y_required: input.a11y_required,
        form_field_support: input.form_field_support,
      },
    });

    const forcedPatternComponentOverride = pickForcedPatternComponentOverride({
      registry,
      query,
      solution_type_hint:
        explicitSolutionTypeHint === "pattern"
          ? explicitSolutionTypeHint
          : solutionTypeHint,
      retrieval,
      explicit_pattern_hint: explicitPatternHint,
      structural_pattern_intent_score: structuralPatternIntent.score,
    });

    if (forcedPatternComponentOverride) {
      solutionType = forcedPatternComponentOverride.entity_type;
      routedQuery = forcedPatternComponentOverride.entity_name;
    } else {
      const anchoredOverride = pickAnchoredCreateOverride({
        registry,
        query,
        retrieval,
        explicit_pattern_hint: explicitPatternHint,
        structural_pattern_intent_score: structuralPatternIntent.score,
      });
      const hintAlignedOverride = anchoredOverride
        ? null
        : pickHintAlignedCreateOverride({
            retrieval,
            solution_type_hint: solutionTypeHint,
          });

      if (anchoredOverride) {
        solutionType = anchoredOverride.entity_type;
        routedQuery = anchoredOverride.entity_name;
      } else if (hintAlignedOverride) {
        solutionType = hintAlignedOverride.entity_type;
        routedQuery = hintAlignedOverride.entity_name;
      } else if (
        shouldUseRetrievedCreateOwner({
          solution_type_hint: solutionTypeHint,
          retrieval,
        })
      ) {
        solutionType = retrieval.owner!.entity_type;
        routedQuery = retrieval.owner!.entity_name;
      } else if (
        solutionTypeHint !== "foundation" &&
        solutionTypeHint !== "token" &&
        retrieval.status === "ambiguous"
      ) {
        const fallbackOwner = pickRetrievedCreateOwner(retrieval, {
          prefer_component: explicitComponentHint && !explicitPatternHint,
          prefer_structural_patterns:
            explicitPatternHint || structuralPatternIntent.score >= 4,
        });
        if (fallbackOwner) {
          solutionType = fallbackOwner.entity_type;
          routedQuery = fallbackOwner.entity_name;
        }
      } else if (
        solutionTypeHint !== "foundation" &&
        solutionTypeHint !== "token" &&
        retrieval.owner
      ) {
        if (
          retrieval.owner.entity_type === solutionTypeHint ||
          retrieval.status === "exact"
        ) {
          solutionType = retrieval.owner.entity_type;
          routedQuery = retrieval.owner.entity_name;
        }
      }
    }
  }

  return {
    query,
    comparison_requested: comparisonRequested,
    solution_type_hint: solutionTypeHint,
    solution_type: solutionType,
    routed_query: routedQuery,
    retrieval,
    ...(query
      ? {
          reference: deriveCreateTargetReferenceFromQuery(
            registry,
            query,
            input.package,
            {
              solution_type_hint:
                solutionType === "component" || solutionType === "pattern"
                  ? solutionType
                  : undefined,
              status: undefined,
            },
          ),
        }
      : {}),
  };
}

function isRelatedCreateTargetMatch(
  reference: NonNullable<CreateTargetReference>,
  resolvedTarget: NonNullable<ReturnType<typeof resolveCreateNamedTarget>>,
): boolean {
  const requestedPrimaryCategory =
    reference.requested_target.categories[0] ?? null;
  const resolvedPrimaryCategory = resolvedTarget.categories[0] ?? null;
  const samePrimaryCategory =
    requestedPrimaryCategory !== null &&
    requestedPrimaryCategory === resolvedPrimaryCategory;
  const requestedTokens = new Set(
    reference.requested_target.name
      .toLowerCase()
      .split(/\s+/)
      .filter((token) => token.length > 2),
  );
  const sharesMeaningfulToken = resolvedTarget.name
    .toLowerCase()
    .split(/\s+/)
    .some((token) => token.length > 2 && requestedTokens.has(token));
  const relatedByRegistry =
    reference.requested_target.related_names.includes(resolvedTarget.name) ||
    resolvedTarget.related_names.includes(reference.requested_target.name);

  return samePrimaryCategory && (sharesMeaningfulToken || relatedByRegistry);
}

function classifyCreateTargetMatch(input: {
  reference: CreateTargetReference;
  resolved_target: ReturnType<typeof resolveCreateNamedTarget> | null;
}): CreateResolvedMatchStatus {
  const resolvedTarget = input.resolved_target;
  if (!resolvedTarget) {
    return "no_match";
  }

  if (resolvedTarget.name === input.reference.requested_target.name) {
    if (input.reference.reference_kind === "exact") {
      return "exact";
    }

    if (input.reference.reference_kind === "alias") {
      return "alias";
    }

    return "broadened";
  }

  if (isRelatedCreateTargetMatch(input.reference, resolvedTarget)) {
    return "broadened";
  }

  return "misrouted";
}

export function deriveCreateRequestMatch(
  registry: SaltRegistry,
  input: DeriveCreateRequestMatchInput,
): CreateRequestMatch | undefined {
  const query = input.query?.trim();
  if (!query) {
    return undefined;
  }

  const reference =
    input.result_mode === "recommend"
      ? deriveCreateTargetReferenceFromQuery(registry, query, input.package, {
          solution_type_hint:
            input.result_solution_type === "component" ||
            input.result_solution_type === "pattern"
              ? input.result_solution_type
              : undefined,
          status: undefined,
        })
      : undefined;

  if (input.result_mode !== "recommend" || !reference) {
    const resolvedTarget =
      input.result_decision_name &&
      (input.result_solution_type === "component" ||
        input.result_solution_type === "pattern")
        ? resolveCreateNamedTarget(
            registry,
            input.result_decision_name,
            input.package,
            input.result_solution_type,
          )
        : null;

    return {
      requested_entity: query,
      resolved_entity: resolvedTarget ? input.result_decision_name! : null,
      match_status: resolvedTarget ? "broadened" : "no_match",
      exact_match_required: false,
    };
  }

  if (!input.result_decision_name) {
    return {
      requested_entity: reference.requested_entity,
      resolved_entity: null,
      match_status: "no_match",
      exact_match_required: reference.reference_kind !== "descriptive",
      reference,
    };
  }

  const resolvedTarget = resolveCreateNamedTarget(
    registry,
    input.result_decision_name,
    input.package,
    input.result_solution_type === "component" ||
      input.result_solution_type === "pattern"
      ? input.result_solution_type
      : undefined,
  );

  if (reference.reference_kind === "descriptive") {
    return {
      requested_entity: reference.requested_entity,
      resolved_entity: resolvedTarget ? input.result_decision_name : null,
      match_status: resolvedTarget ? "broadened" : "no_match",
      exact_match_required: false,
      reference,
    };
  }

  return {
    requested_entity: reference.requested_entity,
    resolved_entity: input.result_decision_name,
    match_status: classifyCreateTargetMatch({
      reference,
      resolved_target: resolvedTarget,
    }),
    exact_match_required: true,
    reference,
  };
}
