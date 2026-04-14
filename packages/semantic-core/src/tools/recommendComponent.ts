import type { SaltRegistry, SaltStatus } from "../types.js";
import {
  type ConsumerRecommendationFilters,
  compareComponentsByConsumerPreference,
  matchesComponentConsumerFilters,
} from "./consumerFilters.js";
import {
  getComponentCaveats,
  getComponentShipCheck,
  getComponentSuggestedFollowUps,
  type SuggestedFollowUp,
} from "./consumerPresentation.js";
import {
  getComponentQueryFields,
  getEffectiveUsageSemantics,
  inferComponentCapabilities,
  scoreQueryFields,
  scoreUsageSemantics,
} from "./consumerSignals.js";
import { hasSingleDestinationNavigationIntent } from "./navigationIntent.js";
import { buildComponentPresentationBase } from "./solutionPresentation.js";
import {
  createComponentStarterCode,
  type StarterCodeSnippet,
} from "./starterCode.js";
import {
  isComponentAllowedByDocsPolicy,
  normalizeQuery,
  tokenize,
} from "./utils.js";

/**
 * Single-token aliases that are too generic to justify a strong name-match
 * bonus.  When a query is just "layout" or "grid", the alias scoring branch
 * awards 0 instead of the full 24–30 points.
 *
 * **Scope limitation:** This suppression only applies to the alias scoring
 * branch in {@link getExplicitNameMatchAdjustment}.  It does NOT suppress:
 *  - Component **name** matching (unlikely to be an issue since no component
 *    names are this generic today).
 *  - Field-level scoring in {@link scoreQueryFields} — fields such as summary,
 *    when_to_use, or tags containing these words will still contribute scores.
 *  - Semantics scoring via {@link scoreUsageSemantics}.
 *
 * If future tuning requires broader suppression, consider introducing a
 * `WEAK_QUERY_TOKENS` constant in `consumerSignals.ts` that reduces
 * `token_weight` contributions for these terms.
 */
const WEAK_SINGLE_TOKEN_ALIASES = new Set([
  "body",
  "content",
  "dashboard",
  "grid",
  "header",
  "layout",
  "main",
  "panel",
  "screen",
  "shell",
]);

function containsTokenSequence(
  queryTokens: string[],
  candidateTokens: string[],
): boolean {
  if (
    candidateTokens.length === 0 ||
    queryTokens.length < candidateTokens.length
  ) {
    return false;
  }

  for (
    let index = 0;
    index <= queryTokens.length - candidateTokens.length;
    index += 1
  ) {
    const matchesSequence = candidateTokens.every(
      (token, offset) => queryTokens[index + offset] === token,
    );
    if (matchesSequence) {
      return true;
    }
  }

  return false;
}

export interface RecommendComponentInput {
  task: string;
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

export interface RecommendComponentResult {
  recommended?: Record<string, unknown> | null;
  alternatives?: Array<Record<string, unknown>>;
  recommendations?: Array<Record<string, unknown>>;
  starter_code?: StarterCodeSnippet[];
  suggested_follow_ups?: SuggestedFollowUp[];
  next_step?: string;
}

function toCompactRecommendation(
  candidate: {
    component: SaltRegistry["components"][number];
  },
  registry: SaltRegistry,
): Record<string, unknown> {
  const caveats = getComponentCaveats(candidate.component);
  const presentation = buildComponentPresentationBase(
    registry,
    candidate.component,
  );

  return {
    name: candidate.component.name,
    category: candidate.component.category,
    summary: candidate.component.summary,
    why: candidate.component.when_to_use[0] ?? candidate.component.summary,
    tradeoffs: candidate.component.when_not_to_use.slice(0, 2),
    ...presentation,
    caveats,
    ship_check: getComponentShipCheck(candidate.component),
    ...(candidate.component.props.length > 0
      ? {
          key_props: candidate.component.props
            .filter((prop) => !prop.deprecated)
            .slice(0, 5)
            .map((prop) => ({
              name: prop.name,
              type: prop.type,
              ...(prop.description ? { description: prop.description } : {}),
              ...(prop.required ? { required: true } : {}),
            })),
          prop_count: candidate.component.props.length,
        }
      : {}),
    ...(candidate.component.status !== "stable"
      ? {
          status: candidate.component.status,
        }
      : {}),
  };
}

function getRecommendationNextStep(
  candidate: { component: SaltRegistry["components"][number] } | undefined,
): string {
  if (candidate?.component.related_docs.examples) {
    return `Review examples for ${candidate.component.name} and confirm it fits your task.`;
  }

  if (candidate?.component.related_docs.usage) {
    return `Review usage guidance for ${candidate.component.name} before implementing.`;
  }

  return "Broaden the task description or try discover_salt for related guidance.";
}

function getNavigationHeuristicText(
  component: SaltRegistry["components"][number],
): string {
  return [
    ...component.category,
    ...component.when_to_use,
    ...component.when_not_to_use,
    component.summary,
    ...(component.semantics?.preferred_for ?? []),
    ...(component.semantics?.not_for ?? []),
  ]
    .join(" ")
    .toLowerCase();
}

function getNavigationIntentAdjustment(
  task: string,
  component: SaltRegistry["components"][number],
): number {
  if (!hasSingleDestinationNavigationIntent(task)) {
    return 0;
  }

  const propNames = new Set(
    component.props.map((prop) => prop.name.trim().toLowerCase()),
  );
  const categories = new Set(
    component.category.map((value) => value.toLowerCase()),
  );
  const docsText = getNavigationHeuristicText(component);
  const hasDirectDestinationProp = propNames.has("href") || propNames.has("to");
  const docsIndicateDirectLink =
    /(same or different site|other pages within the current site|specific section on the same page|inline within|link to documents|link to .*page|provide navigation to a page)/.test(
      docsText,
    );
  const docsSupportSingleDestination =
    /(single destination|link to|navigate to|open a destination|route to|hyperlink|text link)/.test(
      docsText,
    );
  const docsIndicateStructuredNavigation =
    /(app-level navigation|multi-destination|multiple levels of navigation|navigation tree|hierarchical navigation|navigation pane|sidebar|vertical mode|vertical navigation|app shell|new vertical navigation)/.test(
      docsText,
    );
  let adjustment = 0;

  if (
    hasDirectDestinationProp &&
    (categories.has("navigation") || docsSupportSingleDestination)
  ) {
    adjustment += 28;
  }

  if (docsSupportSingleDestination) {
    adjustment += 8;
  }

  if (docsIndicateDirectLink) {
    adjustment += 24;
  }

  if (!hasDirectDestinationProp && !docsIndicateDirectLink) {
    adjustment -= 12;
  }

  if (
    /(pagination|page through|next page of results|paged collection)/.test(
      docsText,
    )
  ) {
    adjustment -= 18;
  }

  if (docsIndicateStructuredNavigation) {
    adjustment -= 48;
  }

  return adjustment;
}

function getExplicitNameMatchAdjustment(
  task: string,
  component: SaltRegistry["components"][number],
): {
  score: number;
  matched_terms: string[];
  match_reasons: string[];
} {
  const query = normalizeQuery(task);
  const queryTokenList = tokenize(task);
  const queryTokens = new Set(queryTokenList);
  const matchedTerms = new Set<string>();
  const matchReasons = new Set<string>();
  let score = 0;

  const nameTokens = tokenize(component.name);
  const hasFullNamePhrase = containsTokenSequence(queryTokenList, nameTokens);
  const matchedNameTokens = nameTokens.filter((token) =>
    queryTokens.has(token),
  );
  if (matchedNameTokens.length > 0) {
    for (const token of matchedNameTokens) {
      matchedTerms.add(token);
    }
    matchReasons.add("name_explicit");

    if (normalizeQuery(component.name) === query) {
      score += 32;
      matchReasons.add("name_exact");
    } else if (hasFullNamePhrase) {
      score += 40;
      matchReasons.add("name_phrase");
    } else if (nameTokens.length === 1) {
      score += 28;
    } else if (matchedNameTokens.length === nameTokens.length) {
      score += 24 + (nameTokens.length - 1) * 4;
    } else {
      score += matchedNameTokens.length * 5;
    }
  }

  let bestAliasScore = 0;
  let bestAliasTokens: string[] = [];
  for (const alias of component.aliases) {
    const aliasTokens = tokenize(alias);
    const hasFullAliasPhrase = containsTokenSequence(
      queryTokenList,
      aliasTokens,
    );
    const matchedAliasTokens = aliasTokens.filter((token) =>
      queryTokens.has(token),
    );
    if (matchedAliasTokens.length === 0) {
      continue;
    }

    let aliasScore = 0;
    if (normalizeQuery(alias) === query) {
      aliasScore = 26;
    } else if (hasFullAliasPhrase) {
      aliasScore =
        aliasTokens.length === 1 &&
        WEAK_SINGLE_TOKEN_ALIASES.has(aliasTokens[0])
          ? 0
          : 30;
    } else if (aliasTokens.length === 1) {
      aliasScore = WEAK_SINGLE_TOKEN_ALIASES.has(aliasTokens[0]) ? 0 : 24;
    } else if (matchedAliasTokens.length === aliasTokens.length) {
      aliasScore = 18 + (aliasTokens.length - 1) * 3;
    }

    if (aliasScore > bestAliasScore) {
      bestAliasScore = aliasScore;
      bestAliasTokens = matchedAliasTokens;
    }
  }

  if (bestAliasScore > 0) {
    for (const token of bestAliasTokens) {
      matchedTerms.add(token);
    }
    matchReasons.add("aliases_explicit");
    score += bestAliasScore;
  }

  return {
    score,
    matched_terms: [...matchedTerms].sort((left, right) =>
      left.localeCompare(right),
    ),
    match_reasons: [...matchReasons].sort((left, right) =>
      left.localeCompare(right),
    ),
  };
}

export function recommendComponent(
  registry: SaltRegistry,
  input: RecommendComponentInput,
): RecommendComponentResult {
  const task = normalizeQuery(input.task);
  const topK = Math.max(1, Math.min(input.top_k ?? 5, 25));
  const view = input.view ?? "compact";
  const filters: ConsumerRecommendationFilters = {
    production_ready: input.production_ready,
    prefer_stable: input.prefer_stable,
    a11y_required: input.a11y_required,
    form_field_support: input.form_field_support,
  };

  const rankedCandidates = registry.components
    .filter((component) => isComponentAllowedByDocsPolicy(component))
    .filter((component) =>
      input.package ? component.package.name === input.package : true,
    )
    .filter((component) =>
      input.status ? component.status === input.status : true,
    )
    .filter((component) => matchesComponentConsumerFilters(component, filters))
    .map((component) => {
      const queryScore = scoreQueryFields(
        task,
        getComponentQueryFields(component),
      );
      const explicitNameScore = getExplicitNameMatchAdjustment(task, component);
      const semanticsScore = scoreUsageSemantics(
        task,
        getEffectiveUsageSemantics(component),
      );
      const intentAdjustment = getNavigationIntentAdjustment(task, component);

      return {
        component,
        capabilities: inferComponentCapabilities(component),
        score:
          queryScore.score +
          explicitNameScore.score +
          semanticsScore.score_adjustment +
          intentAdjustment,
        matched_terms: [
          ...new Set([
            ...queryScore.matched_terms,
            ...explicitNameScore.matched_terms,
            ...semanticsScore.matched_terms,
          ]),
        ].sort((left, right) => left.localeCompare(right)),
        match_reasons: [
          ...new Set([
            ...queryScore.match_reasons,
            ...explicitNameScore.match_reasons,
            ...semanticsScore.match_reasons,
          ]),
        ].sort((left, right) => left.localeCompare(right)),
      };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }
      const preferenceOrder = compareComponentsByConsumerPreference(
        left.component,
        right.component,
        filters,
      );
      if (preferenceOrder !== 0) {
        return preferenceOrder;
      }
      return left.component.name.localeCompare(right.component.name);
    })
    .slice(0, topK);

  const recommendations = rankedCandidates.map((candidate) => {
    const presentation = buildComponentPresentationBase(
      registry,
      candidate.component,
    );

    return {
      name: candidate.component.name,
      category: candidate.component.category,
      component: {
        name: candidate.component.name,
        package: candidate.component.package.name,
        status: candidate.component.status,
        summary: candidate.component.summary,
        related_docs: candidate.component.related_docs,
      },
      score: candidate.score,
      matched_terms: candidate.matched_terms,
      match_reasons: candidate.match_reasons,
      capabilities: candidate.capabilities,
      why: candidate.component.when_to_use.slice(0, 3),
      tradeoffs: candidate.component.when_not_to_use.slice(0, 3),
      alternatives: candidate.component.alternatives,
      example_count: candidate.component.examples.length,
      docs: presentation.docs,
      related_guides: presentation.related_guides,
      guidance_sources: presentation.guidance_sources,
      caveats: getComponentCaveats(candidate.component),
      ship_check: getComponentShipCheck(candidate.component),
    };
  });

  if (view === "full") {
    return {
      recommendations,
      starter_code:
        input.include_starter_code && rankedCandidates[0]
          ? createComponentStarterCode(rankedCandidates[0].component)
          : undefined,
      suggested_follow_ups: rankedCandidates[0]
        ? getComponentSuggestedFollowUps(
            rankedCandidates[0].component,
            rankedCandidates
              .slice(1)
              .map((candidate) => candidate.component.name),
          )
        : undefined,
      next_step: getRecommendationNextStep(rankedCandidates[0]),
    };
  }

  const [recommended, ...alternatives] = rankedCandidates;
  return {
    recommended: recommended
      ? toCompactRecommendation(recommended, registry)
      : null,
    alternatives: alternatives.map((alternative) =>
      toCompactRecommendation(alternative, registry),
    ),
    starter_code:
      input.include_starter_code && recommended
        ? createComponentStarterCode(recommended.component)
        : undefined,
    suggested_follow_ups: recommended
      ? getComponentSuggestedFollowUps(
          recommended.component,
          alternatives.map((candidate) => candidate.component.name),
        )
      : undefined,
    next_step: getRecommendationNextStep(recommended),
  };
}
