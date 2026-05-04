import type {
  ComponentRecord,
  PatternRecord,
  SaltRegistry,
  SaltStatus,
  TokenRecord,
} from "./types.js";

export interface SelectDefaultContextPackComponentsOptions {
  limit?: number;
  package_name?: string;
  statuses?: SaltStatus[];
  include_unsupported?: boolean;
}

export interface SelectDefaultContextPackPatternsOptions {
  limit?: number;
  statuses?: SaltStatus[];
  include_unsupported?: boolean;
}

export interface SaltContextPackFoundationTokenGroup {
  id: string;
  category: string;
  tokens: TokenRecord[];
}

export interface SelectDefaultContextPackFoundationTokenGroupsOptions {
  category_limit?: number;
  token_limit?: number;
  categories?: string[];
}

const DEFAULT_CONTEXT_PACK_COMPONENT_LIMIT = 20;
const DEFAULT_CONTEXT_PACK_PATTERN_LIMIT = 10;
const DEFAULT_CONTEXT_PACK_FOUNDATION_CATEGORY_LIMIT = 5;
const DEFAULT_CONTEXT_PACK_FOUNDATION_TOKEN_LIMIT = 20;
const STATUS_RANK: Record<SaltStatus, number> = {
  stable: 0,
  beta: 1,
  lab: 2,
  deprecated: 3,
};

function hasContextSourceLocator(component: ComponentRecord): boolean {
  return Boolean(
    component.source.repo_path ||
      component.related_docs.overview ||
      component.related_docs.usage ||
      component.related_docs.accessibility ||
      component.related_docs.examples,
  );
}

function hasReleaseReadyComponentContextInputs(
  component: ComponentRecord,
): boolean {
  return Boolean(
    hasContextSourceLocator(component) &&
      component.source.export_name &&
      component.summary.trim().length > 0 &&
      component.examples.length > 0 &&
      component.examples.every(
        (example) => (example.source_url ?? "").trim().length > 0,
      ) &&
      component.accessibility.summary.length > 0 &&
      component.accessibility.summary.every(
        (summary) => summary.trim().length > 0,
      ),
  );
}

function hasPatternContextSourceLocator(pattern: PatternRecord): boolean {
  return Boolean(
    pattern.related_docs.overview ||
      pattern.resources.some((resource) => resource.href) ||
      pattern.examples.some((example) => example.source_url),
  );
}

function hasReleaseReadyPatternContextInputs(pattern: PatternRecord): boolean {
  return Boolean(
      hasPatternContextSourceLocator(pattern) &&
      pattern.summary.trim().length > 0 &&
      pattern.when_to_use.length > 0 &&
      pattern.when_to_use.every((entry) => entry.trim().length > 0) &&
      pattern.when_not_to_use.every((entry) => entry.trim().length > 0) &&
      pattern.composed_of.length > 0 &&
      pattern.composed_of.every(
        (entry) => entry.component.trim().length > 0,
      ) &&
      pattern.how_to_build.every((entry) => entry.trim().length > 0) &&
      pattern.how_it_works.every((entry) => entry.trim().length > 0) &&
      pattern.accessibility.summary.every(
        (entry) => entry.trim().length > 0,
      ) &&
      pattern.resources.every(
        (resource) =>
          resource.label.trim().length > 0 && resource.href.trim().length > 0,
      ) &&
      pattern.examples.length > 0 &&
      pattern.examples.every(
        (example) => (example.source_url ?? "").trim().length > 0,
      ),
  );
}

function hasTokenContextSourceLocator(token: TokenRecord): boolean {
  return Boolean(
    token.policy?.docs.length ||
      token.policy?.evidence_refs?.some(
        (ref) => ref.source?.url || ref.source?.repo_path,
      ),
  );
}

export function selectDefaultContextPackComponents(
  registry: SaltRegistry,
  options: SelectDefaultContextPackComponentsOptions = {},
): ComponentRecord[] {
  const limit = options.limit ?? DEFAULT_CONTEXT_PACK_COMPONENT_LIMIT;
  const statuses = new Set(options.statuses ?? (["stable"] as SaltStatus[]));

  return registry.components
    .filter((component) => statuses.has(component.status))
    .filter((component) =>
      options.package_name
        ? component.package.name === options.package_name
        : true,
    )
    .filter((component) =>
      options.include_unsupported
        ? hasContextSourceLocator(component)
        : hasReleaseReadyComponentContextInputs(component),
    )
    .sort((left, right) => {
      const statusRank = STATUS_RANK[left.status] - STATUS_RANK[right.status];
      if (statusRank !== 0) {
        return statusRank;
      }

      return left.name.localeCompare(right.name);
    })
    .slice(0, Math.max(0, limit));
}

export function selectDefaultContextPackPatterns(
  registry: SaltRegistry,
  options: SelectDefaultContextPackPatternsOptions = {},
): PatternRecord[] {
  const limit = options.limit ?? DEFAULT_CONTEXT_PACK_PATTERN_LIMIT;
  const statuses = new Set(options.statuses ?? (["stable"] as SaltStatus[]));

  return registry.patterns
    .filter((pattern) => statuses.has(pattern.status))
    .filter((pattern) =>
      options.include_unsupported
        ? hasPatternContextSourceLocator(pattern)
        : hasReleaseReadyPatternContextInputs(pattern),
    )
    .sort((left, right) => {
      const statusRank = STATUS_RANK[left.status] - STATUS_RANK[right.status];
      if (statusRank !== 0) {
        return statusRank;
      }

      return left.name.localeCompare(right.name);
    })
    .slice(0, Math.max(0, limit));
}

export function selectDefaultContextPackFoundationTokenGroups(
  registry: SaltRegistry,
  options: SelectDefaultContextPackFoundationTokenGroupsOptions = {},
): SaltContextPackFoundationTokenGroup[] {
  const categoryLimit =
    options.category_limit ?? DEFAULT_CONTEXT_PACK_FOUNDATION_CATEGORY_LIMIT;
  const tokenLimit =
    options.token_limit ?? DEFAULT_CONTEXT_PACK_FOUNDATION_TOKEN_LIMIT;
  const categoryFilter = options.categories
    ? new Set(options.categories.map((category) => category.trim()))
    : null;
  const tokensByCategory = new Map<string, TokenRecord[]>();

  for (const token of registry.tokens) {
    if (!hasTokenContextSourceLocator(token)) {
      continue;
    }
    if (categoryFilter && !categoryFilter.has(token.category)) {
      continue;
    }

    const tokens = tokensByCategory.get(token.category) ?? [];
    tokens.push(token);
    tokensByCategory.set(token.category, tokens);
  }

  return [...tokensByCategory.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(0, Math.max(0, categoryLimit))
    .map(([category, tokens]) => ({
      id: `tokens.${category}`,
      category,
      tokens: tokens
        .sort((left, right) => left.name.localeCompare(right.name))
        .slice(0, Math.max(0, tokenLimit)),
    }))
    .filter((group) => group.tokens.length > 0);
}
