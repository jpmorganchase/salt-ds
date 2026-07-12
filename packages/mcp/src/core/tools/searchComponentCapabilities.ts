import type { SaltRegistry, SaltStatus } from "../types.js";
import {
  getComponentQueryFields,
  inferComponentCapabilities,
  scoreQueryFields,
} from "./consumerSignals.js";
import { isComponentAllowedByDocsPolicy, normalizeQuery } from "./utils.js";

export interface SearchComponentCapabilitiesInput {
  query: string;
  package?: string;
  status?: SaltStatus;
  top_k?: number;
}

export interface SearchComponentCapabilitiesResult {
  matches: Array<Record<string, unknown>>;
}

export function searchComponentCapabilities(
  registry: SaltRegistry,
  input: SearchComponentCapabilitiesInput,
): SearchComponentCapabilitiesResult {
  const query = normalizeQuery(input.query);
  const topK = Math.max(1, Math.min(input.top_k ?? 10, 50));

  const matches = registry.components
    .filter((component) => isComponentAllowedByDocsPolicy(component))
    .filter((component) =>
      input.package ? component.package.name === input.package : true,
    )
    .filter((component) =>
      input.status ? component.status === input.status : true,
    )
    .map((component) => {
      const capabilities = inferComponentCapabilities(component);
      const score = scoreQueryFields(query, [
        ...getComponentQueryFields(component),
        {
          key: "compatibility",
          value: capabilities.join(" "),
          phrase_weight: 8,
          token_weight: 3,
        },
      ]);
      return {
        component,
        capabilities,
        ...score,
      };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }
      return left.component.name.localeCompare(right.component.name);
    })
    .slice(0, topK)
    .map((candidate) => ({
      component: {
        name: candidate.component.name,
        package: candidate.component.package.name,
        status: candidate.component.status,
        summary: candidate.component.summary,
        related_docs: candidate.component.related_docs,
      },
      score: candidate.score,
      capabilities: candidate.capabilities,
      matched_terms: candidate.matched_terms,
      match_reasons: candidate.match_reasons,
      evidence: {
        deprecated_props: candidate.component.props
          .filter((prop) => prop.deprecated)
          .map((prop) => prop.name),
        examples: candidate.component.examples.slice(0, 3).map((example) => ({
          title: example.title,
          intent: example.intent,
          source_url: example.source_url,
        })),
        accessibility: candidate.component.accessibility.summary,
      },
    }));

  return { matches };
}
