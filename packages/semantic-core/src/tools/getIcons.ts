import type { IconRecord, SaltRegistry, SaltStatus } from "../types.js";
import { normalizeQuery, tokenize } from "./utils.js";

export interface GetIconsInput {
  query?: string;
  category?: string;
  variant?: IconRecord["variant"];
  status?: SaltStatus;
  max_results?: number;
}

export interface GetIconsResult {
  icons: Array<Record<string, unknown>>;
}

function toCompactIcon(icon: IconRecord): Record<string, unknown> {
  return {
    id: icon.id,
    name: icon.name,
    base_name: icon.base_name,
    figma_name: icon.figma_name,
    package: icon.package.name,
    status: icon.status,
    category: icon.category,
    variant: icon.variant,
    summary: icon.summary,
    synonyms: icon.synonyms,
    related_docs: icon.related_docs,
  };
}

function scoreIcon(icon: IconRecord, query: string): number {
  if (!query) {
    return 0;
  }

  const names = [icon.name, icon.base_name, icon.figma_name].map((value) =>
    value.toLowerCase(),
  );
  const queryTokens = tokenize(query);
  let score = 0;

  if (names.some((value) => value === query)) {
    score += 12;
  } else if (names.some((value) => value.includes(query))) {
    score += 8;
  }

  if (icon.summary.toLowerCase().includes(query)) {
    score += 5;
  }

  for (const token of queryTokens) {
    if (names.some((value) => value.includes(token))) {
      score += 4;
    }
    if (icon.summary.toLowerCase().includes(token)) {
      score += 2;
    }
    if (
      [...icon.aliases, ...icon.synonyms, icon.category].some((value) =>
        value.toLowerCase().includes(token),
      )
    ) {
      score += 1;
    }
  }

  return score;
}

export function getIcons(
  registry: SaltRegistry,
  input: GetIconsInput,
): GetIconsResult {
  const query = normalizeQuery(input.query ?? "");
  const maxResults = Math.max(1, Math.min(input.max_results ?? 50, 1000));
  const category = normalizeQuery(input.category ?? "");

  const icons = registry.icons
    .filter((icon) =>
      category ? icon.category.toLowerCase().includes(category) : true,
    )
    .filter((icon) => (input.variant ? icon.variant === input.variant : true))
    .filter((icon) => (input.status ? icon.status === input.status : true))
    .map((icon) => ({
      icon,
      score: scoreIcon(icon, query),
    }))
    .filter((candidate) => candidate.score > 0 || query.length === 0)
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }
      return left.icon.name.localeCompare(right.icon.name);
    })
    .slice(0, maxResults)
    .map(({ icon }) => toCompactIcon(icon));

  return { icons };
}
