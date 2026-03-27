import type { ComponentProp, SaltRegistry, SaltStatus } from "../types.js";
import {
  isComponentAllowedByDocsPolicy,
  normalizeQuery,
  tokenize,
} from "./utils.js";

export interface SearchApiSurfaceInput {
  query: string;
  component_name?: string;
  package?: string;
  status?: SaltStatus;
  deprecated?: boolean;
  required?: boolean;
  top_k?: number;
}

export interface SearchApiSurfaceResult {
  total_matches: number;
  truncated: boolean;
  matches: Array<{
    component: {
      name: string;
      package: string;
      status: SaltStatus;
      summary: string;
      source_url: string | null;
    };
    prop: {
      name: string;
      type: string;
      required: boolean;
      deprecated: boolean;
      description: string;
      default: string | null;
      allowed_values?: Array<string | number | boolean>;
      deprecation_note?: string | null;
    };
    score: number;
    match_reasons: Array<
      | "prop_name_exact"
      | "prop_name_phrase"
      | "component_name_phrase"
      | "type_phrase"
      | "description_phrase"
      | "allowed_value_phrase"
      | "prop_name_tokens"
      | "component_name_tokens"
      | "type_tokens"
      | "description_tokens"
      | "allowed_value_tokens"
    >;
  }>;
}

function normalizeComponentSearchValue(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function matchesComponentFilter(
  component: Pick<
    SaltRegistry["components"][number],
    "aliases" | "name" | "related_docs"
  >,
  componentName: string,
) {
  if (!componentName) {
    return true;
  }

  const normalizedComponentName = normalizeComponentSearchValue(componentName);
  const route = component.related_docs.overview ?? "";
  const candidates = [
    component.name,
    ...component.aliases,
    ...route.split("/").filter(Boolean),
  ];

  return candidates.some((candidate) => {
    const lowercaseCandidate = candidate.toLowerCase();
    if (lowercaseCandidate.includes(componentName)) {
      return true;
    }

    return normalizeComponentSearchValue(candidate).includes(
      normalizedComponentName,
    );
  });
}

function scoreProp(
  componentName: string,
  prop: ComponentProp,
  query: string,
): {
  score: number;
  match_reasons: SearchApiSurfaceResult["matches"][number]["match_reasons"];
} {
  if (!query) {
    return {
      score: 0,
      match_reasons: [],
    };
  }

  const propName = prop.name.toLowerCase();
  const normalizedComponentName = componentName.toLowerCase();
  const type = prop.type.toLowerCase();
  const description = prop.description.toLowerCase();
  const allowedValues = (prop.allowed_values ?? []).map((value) =>
    String(value).toLowerCase(),
  );
  const queryTokens = tokenize(query);
  const matchReasons =
    [] as SearchApiSurfaceResult["matches"][number]["match_reasons"];
  let score = 0;

  if (propName === query) {
    score += 20;
    matchReasons.push("prop_name_exact");
  } else if (propName.includes(query)) {
    score += 10;
    matchReasons.push("prop_name_phrase");
  }

  if (normalizedComponentName.includes(query)) {
    score += 6;
    matchReasons.push("component_name_phrase");
  }
  if (type.includes(query)) {
    score += 5;
    matchReasons.push("type_phrase");
  }
  if (description.includes(query)) {
    score += 4;
    matchReasons.push("description_phrase");
  }
  if (allowedValues.some((value) => value.includes(query))) {
    score += 4;
    matchReasons.push("allowed_value_phrase");
  }

  for (const token of queryTokens) {
    if (propName.includes(token)) {
      score += 4;
      if (!matchReasons.includes("prop_name_tokens")) {
        matchReasons.push("prop_name_tokens");
      }
    }
    if (normalizedComponentName.includes(token)) {
      score += 2;
      if (!matchReasons.includes("component_name_tokens")) {
        matchReasons.push("component_name_tokens");
      }
    }
    if (type.includes(token)) {
      score += 2;
      if (!matchReasons.includes("type_tokens")) {
        matchReasons.push("type_tokens");
      }
    }
    if (description.includes(token)) {
      score += 1;
      if (!matchReasons.includes("description_tokens")) {
        matchReasons.push("description_tokens");
      }
    }
    if (allowedValues.some((value) => value.includes(token))) {
      score += 1;
      if (!matchReasons.includes("allowed_value_tokens")) {
        matchReasons.push("allowed_value_tokens");
      }
    }
  }

  return { score, match_reasons: matchReasons };
}

export function searchApiSurface(
  registry: SaltRegistry,
  input: SearchApiSurfaceInput,
): SearchApiSurfaceResult {
  const query = normalizeQuery(input.query);
  const componentName = normalizeQuery(input.component_name ?? "");
  const topK = Math.max(1, Math.min(input.top_k ?? 10, 100));

  const matches = registry.components
    .filter((component) => isComponentAllowedByDocsPolicy(component))
    .filter((component) =>
      input.package ? component.package.name === input.package : true,
    )
    .filter((component) =>
      input.status ? component.status === input.status : true,
    )
    .filter((component) => matchesComponentFilter(component, componentName))
    .flatMap((component) =>
      component.props
        .filter((prop) =>
          input.deprecated === undefined
            ? true
            : prop.deprecated === input.deprecated,
        )
        .filter((prop) =>
          input.required === undefined
            ? true
            : prop.required === input.required,
        )
        .map((prop) => ({
          component,
          prop,
          ...scoreProp(component.name, prop, query),
        })),
    )
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }
      if (left.component.name !== right.component.name) {
        return left.component.name.localeCompare(right.component.name);
      }
      return left.prop.name.localeCompare(right.prop.name);
    });

  return {
    total_matches: matches.length,
    truncated: matches.length > topK,
    matches: matches.slice(0, topK).map((candidate) => ({
      component: {
        name: candidate.component.name,
        package: candidate.component.package.name,
        status: candidate.component.status,
        summary: candidate.component.summary,
        source_url:
          candidate.component.related_docs.usage ??
          candidate.component.related_docs.overview,
      },
      prop: {
        name: candidate.prop.name,
        type: candidate.prop.type,
        required: candidate.prop.required,
        deprecated: candidate.prop.deprecated,
        description: candidate.prop.description,
        default: candidate.prop.default ?? null,
        allowed_values: candidate.prop.allowed_values,
        deprecation_note: candidate.prop.deprecation_note ?? null,
      },
      score: candidate.score,
      match_reasons: candidate.match_reasons,
    })),
  };
}
