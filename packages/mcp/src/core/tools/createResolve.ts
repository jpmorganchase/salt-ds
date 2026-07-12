import type { SaltRegistry, SaltStatus } from "../types.js";
import {
  chooseDominantCreateQueryAnchor,
  collectCreateQueryAnchors,
  isHighPriorityCreateQueryAnchor,
} from "./createQueryAnchors.js";
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
import { containsWholeWordPhrase, normalizeQuery } from "./utils.js";

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
  const normalizedQuery = normalizeQuery(input.query);

  const [candidate] = input.retrieval.candidates
    .filter((entry) => entry.entity_type === "component")
    .filter(
      (entry) =>
        anchoredComponentNames.has(entry.entity_name) ||
        containsWholeWordPhrase(
          normalizedQuery,
          normalizeQuery(entry.entity_name),
        ) ||
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

  const candidateStronglyGrounded =
    candidate.exact_match ||
    candidate.prefix_match ||
    hasHighSignalExplicitCreateGrounding(candidate);
  if (!candidateStronglyGrounded) {
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
    const allowStrongGroundedForcedOverride =
      !strongPatternIntent &&
      candidateStronglyGrounded &&
      !input.retrieval.owner.exact_match &&
      !input.retrieval.owner.prefix_match;
    if (allowStrongGroundedForcedOverride) {
      return candidate;
    }
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
  const normalizedQuery = normalizeQuery(input.query);

  const [candidate] = input.retrieval.candidates
    .filter(
      (entry) =>
        anchoredNames.has(entry.entity_name) ||
        (entry.entity_type === "component" &&
          containsWholeWordPhrase(
            normalizedQuery,
            normalizeQuery(entry.entity_name),
          )),
    )
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
    hasHighSignalExplicitCreateGrounding(candidate) ||
    candidate.confidence >= topOwner.confidence - 16 ||
    candidate.total_score >= topOwner.total_score - 16;

  return closeEnough ? candidate : null;
}

function pickDominantAnchoredComponentRouteOverride(input: {
  registry: SaltRegistry;
  query: string | undefined;
  retrieval: RetrieveCreateCandidatesResult | null;
  solution_type_hint: Exclude<CreateResolutionSolutionType, "auto">;
}): { entity_name: string; entity_type: "component" } | null {
  if (
    !input.query ||
    !input.retrieval?.candidates.length ||
    (input.solution_type_hint !== "component" &&
      input.solution_type_hint !== "pattern")
  ) {
    return null;
  }

  const topOwner =
    input.retrieval.owner ?? input.retrieval.candidates[0] ?? null;
  if (!topOwner) {
    return null;
  }

  const dominantComponentAnchor = chooseDominantCreateQueryAnchor(
    collectCreateQueryAnchors(input.registry, input.query).filter(
      (anchor) =>
        anchor.entity_type === "component" &&
        isHighPriorityCreateQueryAnchor(anchor),
    ),
  );
  if (!dominantComponentAnchor) {
    return null;
  }

  if (topOwner.entity_name === dominantComponentAnchor.name) {
    return null;
  }

  const anchorAlreadyRetrieved = input.retrieval.candidates.some(
    (candidate) =>
      candidate.entity_type === "component" &&
      candidate.entity_name === dominantComponentAnchor.name,
  );
  if (anchorAlreadyRetrieved) {
    return null;
  }

  const ownerStronglyGrounded =
    topOwner.exact_match ||
    topOwner.prefix_match ||
    topOwner.explicit_owner_hits > 0 ||
    hasHighSignalExplicitCreateGrounding(topOwner);
  if (ownerStronglyGrounded) {
    return null;
  }

  return {
    entity_name: dominantComponentAnchor.name,
    entity_type: "component",
  };
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

  if (
    input.solution_type_hint === "pattern" &&
    topOwner.entity_type === "component" &&
    topOwner.explicit_owner_hits > candidate.explicit_owner_hits
  ) {
    const componentAlreadyGrounded =
      topOwner.confidence >= candidate.confidence - 8 ||
      topOwner.total_score >= candidate.total_score - 8;
    if (componentAlreadyGrounded) {
      return null;
    }
  }

  const closeEnough =
    candidate.confidence >= topOwner.confidence - 8 ||
    candidate.total_score >= topOwner.total_score - 8;

  return closeEnough ? candidate : null;
}

function getTopRetrievedCandidateByType(
  retrieval: RetrieveCreateCandidatesResult | null,
  entityType: "component" | "pattern",
): CreateRetrievalCandidate | null {
  if (!retrieval?.candidates.length) {
    return null;
  }

  return (
    retrieval.candidates.find((entry) => entry.entity_type === entityType) ??
    null
  );
}

function hasHighSignalExplicitCreateGrounding(
  candidate: CreateRetrievalCandidate,
): boolean {
  const hasStrongCanonicalPhrase = candidate.match_reasons.some((reason) =>
    ["canonical_name:full_phrase", "canonical_name:prefix_phrase"].includes(
      reason,
    ),
  );
  const hasStrongAliasPhrase = candidate.evidence.some(
    (entry) =>
      entry.source_kind === "alias" &&
      entry.evidence_role === "owner" &&
      entry.score >= 18 &&
      normalizeQuery(entry.text).split(/\s+/).filter(Boolean).length > 1,
  );

  return hasStrongCanonicalPhrase || hasStrongAliasPhrase;
}

function pickStrongCrossTypeCreateOverride(input: {
  retrieval: RetrieveCreateCandidatesResult | null;
  solution_type_hint: Exclude<CreateResolutionSolutionType, "auto">;
  explicit_pattern_hint?: boolean;
  structural_pattern_intent_score?: number;
}): CreateRetrievalCandidate | null {
  if (
    !input.retrieval?.owner ||
    input.solution_type_hint !== "pattern" ||
    input.retrieval.owner.entity_type !== "component"
  ) {
    return null;
  }

  const owner = input.retrieval.owner;
  const topPattern = getTopRetrievedCandidateByType(input.retrieval, "pattern");
  const strongPatternIntent =
    input.explicit_pattern_hint ||
    (input.structural_pattern_intent_score ?? 0) >= 4;

  if (!topPattern) {
    return hasHighSignalExplicitCreateGrounding(owner) ||
      owner.owner_score >= 64
      ? owner
      : null;
  }

  const componentClearlyDominant =
    owner.confidence >= topPattern.confidence + 20 ||
    owner.total_score >= topPattern.total_score + 20 ||
    owner.owner_score >= topPattern.owner_score + 24;
  const patternStillGrounded =
    topPattern.explicit_owner_hits > 0 ||
    (strongPatternIntent &&
      topPattern.confidence >= owner.confidence - 4 &&
      topPattern.total_score >= owner.total_score - 4);

  if (!componentClearlyDominant || patternStillGrounded) {
    return null;
  }

  return owner;
}

function pickAmbiguousCrossTypeCreateOverride(input: {
  retrieval: RetrieveCreateCandidatesResult | null;
  solution_type_hint: Exclude<CreateResolutionSolutionType, "auto">;
  explicit_pattern_hint?: boolean;
  structural_pattern_intent_score?: number;
}): CreateRetrievalCandidate | null {
  if (
    !input.retrieval?.candidates.length ||
    input.retrieval.status !== "ambiguous" ||
    input.solution_type_hint !== "pattern"
  ) {
    return null;
  }

  const topPattern = getTopRetrievedCandidateByType(input.retrieval, "pattern");
  const topComponent = getTopRetrievedCandidateByType(
    input.retrieval,
    "component",
  );
  if (!topPattern || !topComponent) {
    return null;
  }

  const componentExplicitlyGrounded =
    hasHighSignalExplicitCreateGrounding(topComponent) &&
    topComponent.explicit_owner_hits > topPattern.explicit_owner_hits;
  const closeEnough =
    topComponent.confidence >= topPattern.confidence - 6 ||
    topComponent.total_score >= topPattern.total_score - 6;
  const patternWeaklyGrounded = topPattern.explicit_owner_hits === 0;
  const preservePatternOwner = topPattern.explicit_owner_hits > 0;

  if (
    !componentExplicitlyGrounded ||
    !closeEnough ||
    !patternWeaklyGrounded ||
    preservePatternOwner
  ) {
    return null;
  }

  return topComponent;
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
    const forcedPatternDominantComponentAnchor =
      explicitSolutionTypeHint === "pattern" &&
      !explicitPatternHint &&
      structuralPatternIntent.score < 4
        ? chooseDominantCreateQueryAnchor(
            collectCreateQueryAnchors(registry, query).filter(
              (anchor) =>
                anchor.entity_type === "component" &&
                isHighPriorityCreateQueryAnchor(anchor),
            ),
          )
        : null;

    if (forcedPatternComponentOverride) {
      solutionType = forcedPatternComponentOverride.entity_type;
      routedQuery = forcedPatternComponentOverride.entity_name;
    } else if (forcedPatternDominantComponentAnchor) {
      solutionType = "component";
      routedQuery = forcedPatternDominantComponentAnchor.name;
    } else {
      const strongCrossTypeOverride = pickStrongCrossTypeCreateOverride({
        retrieval,
        solution_type_hint: solutionTypeHint,
        explicit_pattern_hint: explicitPatternHint,
        structural_pattern_intent_score: structuralPatternIntent.score,
      });
      const anchoredOverride = pickAnchoredCreateOverride({
        registry,
        query,
        retrieval,
        explicit_pattern_hint: explicitPatternHint,
        structural_pattern_intent_score: structuralPatternIntent.score,
      });
      const anchoredComponentRouteOverride = anchoredOverride
        ? null
        : pickDominantAnchoredComponentRouteOverride({
            registry,
            query,
            retrieval,
            solution_type_hint: solutionTypeHint,
          });
      const hintAlignedOverride = anchoredOverride
        ? null
        : anchoredComponentRouteOverride
          ? null
          : pickHintAlignedCreateOverride({
              retrieval,
              solution_type_hint: solutionTypeHint,
            });

      if (strongCrossTypeOverride) {
        solutionType = strongCrossTypeOverride.entity_type;
        routedQuery = strongCrossTypeOverride.entity_name;
      } else if (anchoredOverride) {
        solutionType = anchoredOverride.entity_type;
        routedQuery = anchoredOverride.entity_name;
      } else if (anchoredComponentRouteOverride) {
        solutionType = anchoredComponentRouteOverride.entity_type;
        routedQuery = anchoredComponentRouteOverride.entity_name;
      } else if (hintAlignedOverride) {
        solutionType = hintAlignedOverride.entity_type;
        routedQuery = hintAlignedOverride.entity_name;
      } else if (
        retrieval.owner &&
        shouldUseRetrievedCreateOwner({
          solution_type_hint: solutionTypeHint,
          retrieval,
        })
      ) {
        solutionType = retrieval.owner.entity_type;
        routedQuery = retrieval.owner.entity_name;
      } else if (
        solutionTypeHint !== "foundation" &&
        solutionTypeHint !== "token" &&
        retrieval.status === "ambiguous"
      ) {
        const ambiguousCrossTypeOverride = pickAmbiguousCrossTypeCreateOverride(
          {
            retrieval,
            solution_type_hint: solutionTypeHint,
            explicit_pattern_hint: explicitPatternHint,
            structural_pattern_intent_score: structuralPatternIntent.score,
          },
        );
        const fallbackOwner = pickRetrievedCreateOwner(retrieval, {
          prefer_component: explicitComponentHint && !explicitPatternHint,
          prefer_structural_patterns: structuralPatternIntent.score >= 4,
        });
        if (ambiguousCrossTypeOverride) {
          solutionType = ambiguousCrossTypeOverride.entity_type;
          routedQuery = ambiguousCrossTypeOverride.entity_name;
        } else if (fallbackOwner) {
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
      resolved_entity:
        resolvedTarget && input.result_decision_name
          ? input.result_decision_name
          : null,
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
