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
  inferComponentCapabilities,
  scoreQueryFields,
} from "./consumerSignals.js";
import {
  createComponentStarterCode,
  type StarterCodeSnippet,
} from "./starterCode.js";
import { isComponentAllowedByDocsPolicy, normalizeQuery } from "./utils.js";

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

function getComponentDocs(relatedDocs: {
  overview: string | null;
  usage: string | null;
  accessibility: string | null;
  examples: string | null;
}): string[] {
  return [
    relatedDocs.overview,
    relatedDocs.usage,
    relatedDocs.accessibility,
    relatedDocs.examples,
  ].filter((value): value is string => Boolean(value));
}

function toCompactRecommendation(candidate: {
  component: SaltRegistry["components"][number];
}): Record<string, unknown> {
  const caveats = getComponentCaveats(candidate.component);

  return {
    name: candidate.component.name,
    summary: candidate.component.summary,
    why: candidate.component.when_to_use[0] ?? candidate.component.summary,
    tradeoffs: candidate.component.when_not_to_use.slice(0, 2),
    docs: getComponentDocs(candidate.component.related_docs),
    examples: candidate.component.related_docs.examples
      ? [candidate.component.related_docs.examples]
      : [],
    caveats,
    ship_check: getComponentShipCheck(candidate.component),
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
      const score = scoreQueryFields(task, getComponentQueryFields(component));
      return {
        component,
        capabilities: inferComponentCapabilities(component),
        ...score,
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

  const recommendations = rankedCandidates.map((candidate) => ({
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
    caveats: getComponentCaveats(candidate.component),
    ship_check: getComponentShipCheck(candidate.component),
  }));

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
    recommended: recommended ? toCompactRecommendation(recommended) : null,
    alternatives: alternatives.map((alternative) =>
      toCompactRecommendation(alternative),
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
