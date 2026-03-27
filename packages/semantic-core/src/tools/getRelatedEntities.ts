import {
  getRegistryIndexes,
  normalizeRegistryLookupKey,
} from "../registry/runtimeCache.js";
import type {
  GuideRecord,
  PageRecord,
  SaltRegistry,
  TokenRecord,
} from "../types.js";
import type { ComponentLookupAmbiguity } from "./componentLookup.js";
import {
  findReferencedComponent,
  resolveComponentTarget,
} from "./componentLookup.js";
import type { GuideLookupAmbiguity } from "./guideLookup.js";
import { resolveGuideLookup } from "./guideLookup.js";
import { getPageSlug, resolvePageLookup } from "./pageLookup.js";
import type { PatternLookupAmbiguity } from "./patternLookup.js";
import { resolvePatternTarget } from "./patternLookup.js";
import { isComponentAllowedByDocsPolicy } from "./utils.js";

type PageLookupAmbiguity = NonNullable<
  ReturnType<typeof resolvePageLookup>["ambiguity"]
>;

export interface GetRelatedEntitiesInput {
  target_type: "component" | "pattern" | "token" | "guide" | "page";
  name: string;
  package?: string;
  max_results?: number;
}

export interface GetRelatedEntitiesResult {
  target: Record<string, unknown> | null;
  did_you_mean?: string[];
  related: {
    components: Array<Record<string, unknown>>;
    patterns: Array<Record<string, unknown>>;
    tokens: Array<Record<string, unknown>>;
    guides: Array<Record<string, unknown>>;
    pages: Array<Record<string, unknown>>;
  };
  ambiguity?:
    | ComponentLookupAmbiguity
    | GuideLookupAmbiguity
    | PatternLookupAmbiguity
    | PageLookupAmbiguity;
}

function toComponentCompact(
  component: SaltRegistry["components"][number],
): Record<string, unknown> {
  return {
    name: component.name,
    package: component.package.name,
    status: component.status,
    summary: component.summary,
    related_docs: component.related_docs,
  };
}

function toPatternCompact(
  pattern: SaltRegistry["patterns"][number],
): Record<string, unknown> {
  return {
    name: pattern.name,
    status: pattern.status,
    summary: pattern.summary,
    related_docs: pattern.related_docs,
  };
}

function toTokenCompact(token: TokenRecord): Record<string, unknown> {
  return {
    name: token.name,
    category: token.category,
    semantic_intent: token.semantic_intent,
    applies_to: token.applies_to,
  };
}

function toGuideCompact(guide: GuideRecord): Record<string, unknown> {
  return {
    name: guide.name,
    kind: guide.kind,
    summary: guide.summary,
    related_docs: guide.related_docs,
  };
}

function toPageCompact(page: PageRecord): Record<string, unknown> {
  return {
    title: page.title,
    route: page.route,
    page_kind: page.page_kind,
    summary: page.summary,
  };
}

function emptyRelated() {
  return {
    components: [],
    patterns: [],
    tokens: [],
    guides: [],
    pages: [],
  } as GetRelatedEntitiesResult["related"];
}

function limitResults<T>(values: T[], maxResults: number): T[] {
  return values.slice(0, maxResults);
}

function uniqueBy<T>(values: T[], getKey: (value: T) => string): T[] {
  const seen = new Set<string>();
  const unique: T[] = [];

  for (const value of values) {
    const key = getKey(value);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(value);
  }

  return unique;
}

function getComponentDocRoutes(component: SaltRegistry["components"][number]) {
  return Object.values(component.related_docs).filter(
    (value): value is string => Boolean(value),
  );
}

function getPageLabels(page: PageRecord): string[] {
  return uniqueBy(
    [
      page.title,
      getPageSlug(page.route),
      ...page.keywords,
      ...page.section_headings,
    ]
      .map((label) => label.trim())
      .filter(Boolean),
    (label) => label.toLowerCase(),
  );
}

function findComponentsForPageLabels(
  registry: SaltRegistry,
  labels: string[],
): SaltRegistry["components"] {
  const { componentsByNormalizedAlias, componentsByNormalizedName } =
    getRegistryIndexes(registry);

  return uniqueBy(
    labels.flatMap((label) => {
      const normalizedLabel = normalizeRegistryLookupKey(label);
      return [
        ...(componentsByNormalizedName.get(normalizedLabel) ?? []),
        ...(componentsByNormalizedAlias.get(normalizedLabel) ?? []),
      ];
    }),
    (component) => component.id,
  ).filter((component) => isComponentAllowedByDocsPolicy(component));
}

function findGuidesForPageLabels(
  registry: SaltRegistry,
  labels: string[],
): GuideRecord[] {
  const normalizedLabels = new Set(
    labels.map((label) => normalizeRegistryLookupKey(label)),
  );

  return registry.guides.filter(
    (guide) =>
      normalizedLabels.has(normalizeRegistryLookupKey(guide.name)) ||
      guide.aliases.some((alias) =>
        normalizedLabels.has(normalizeRegistryLookupKey(alias)),
      ),
  );
}

function findPatternsForPageLabels(
  registry: SaltRegistry,
  labels: string[],
): SaltRegistry["patterns"] {
  return uniqueBy(
    labels.flatMap((label) => {
      const resolution = resolvePatternTarget(registry, label);
      return resolution.candidate ? [resolution.candidate.pattern] : [];
    }),
    (pattern) => pattern.id,
  );
}

function findPagesByRoutes(
  registry: SaltRegistry,
  routes: string[],
  currentRoute: string,
): PageRecord[] {
  return uniqueBy(
    routes
      .filter((route) => route !== currentRoute)
      .map(
        (route) =>
          registry.pages.find((candidate) => candidate.route === route) ?? null,
      )
      .filter((page): page is PageRecord => Boolean(page)),
    (page) => page.id,
  );
}

export function getRelatedEntities(
  registry: SaltRegistry,
  input: GetRelatedEntitiesInput,
): GetRelatedEntitiesResult {
  const maxResults = Math.max(1, Math.min(input.max_results ?? 10, 50));

  if (input.target_type === "component") {
    const resolution = resolveComponentTarget(
      registry,
      input.name,
      input.package,
    );
    if (resolution.ambiguity) {
      return {
        target: null,
        related: emptyRelated(),
        did_you_mean: resolution.ambiguity.matches.map(
          (match) => `${match.name} (${match.package})`,
        ),
        ambiguity: resolution.ambiguity,
      };
    }

    const component = resolution.candidate?.component ?? null;
    if (!component) {
      return { target: null, related: emptyRelated() };
    }

    const relatedPatterns = registry.patterns.filter(
      (pattern) =>
        component.patterns.includes(pattern.name) ||
        pattern.composed_of.some((entry) => entry.component === component.name),
    );
    const alternativeComponents = component.alternatives
      .map((alternative) => findReferencedComponent(registry, alternative.use))
      .filter((candidate): candidate is SaltRegistry["components"][number] =>
        Boolean(candidate),
      )
      .filter((candidate) => isComponentAllowedByDocsPolicy(candidate));
    const relatedTokens = registry.tokens.filter(
      (token) =>
        token.applies_to.includes(component.name) ||
        component.tokens.some((entry) => entry.name === token.name),
    );
    const relatedGuides = registry.guides.filter(
      (guide) =>
        guide.related_docs.related_components.includes(component.name) ||
        guide.packages.includes(component.package.name),
    );
    const relatedPages = Object.values(component.related_docs)
      .filter((value): value is string => Boolean(value))
      .map(
        (route) => registry.pages.find((page) => page.route === route) ?? null,
      )
      .filter((page): page is PageRecord => Boolean(page));

    return {
      target: toComponentCompact(component),
      related: {
        components: limitResults(
          alternativeComponents.map(toComponentCompact),
          maxResults,
        ),
        patterns: limitResults(
          relatedPatterns.map(toPatternCompact),
          maxResults,
        ),
        tokens: limitResults(relatedTokens.map(toTokenCompact), maxResults),
        guides: limitResults(relatedGuides.map(toGuideCompact), maxResults),
        pages: limitResults(relatedPages.map(toPageCompact), maxResults),
      },
    };
  }

  if (input.target_type === "pattern") {
    const resolution = resolvePatternTarget(registry, input.name);
    if (resolution.ambiguity) {
      return {
        target: null,
        related: emptyRelated(),
        did_you_mean: resolution.ambiguity.matches.map((match) => match.name),
        ambiguity: resolution.ambiguity,
      };
    }

    const pattern = resolution.candidate?.pattern ?? null;
    if (!pattern) {
      return { target: null, related: emptyRelated() };
    }

    const relatedComponents = pattern.composed_of
      .map((entry) => findReferencedComponent(registry, entry.component))
      .filter((component): component is SaltRegistry["components"][number] =>
        Boolean(component),
      );
    const relatedPatterns = registry.patterns.filter((candidate) =>
      pattern.related_patterns.includes(candidate.name),
    );
    const relatedTokens = registry.tokens.filter((token) =>
      relatedComponents.some((component) =>
        token.applies_to.includes(component.name),
      ),
    );
    const relatedGuides = registry.guides.filter((guide) =>
      relatedComponents.some((component) =>
        guide.related_docs.related_components.includes(component.name),
      ),
    );
    const relatedPages = pattern.related_docs.overview
      ? registry.pages.filter(
          (page) => page.route === pattern.related_docs.overview,
        )
      : [];

    return {
      target: toPatternCompact(pattern),
      related: {
        components: limitResults(
          relatedComponents.map(toComponentCompact),
          maxResults,
        ),
        patterns: limitResults(
          relatedPatterns.map(toPatternCompact),
          maxResults,
        ),
        tokens: limitResults(relatedTokens.map(toTokenCompact), maxResults),
        guides: limitResults(relatedGuides.map(toGuideCompact), maxResults),
        pages: limitResults(relatedPages.map(toPageCompact), maxResults),
      },
    };
  }

  if (input.target_type === "token") {
    const token =
      registry.tokens.find((candidate) => candidate.name === input.name) ??
      null;
    if (!token) {
      return { target: null, related: emptyRelated() };
    }

    const relatedComponents = registry.components.filter((component) =>
      token.applies_to.includes(component.name),
    );
    const relatedPatterns = registry.patterns.filter((pattern) =>
      pattern.composed_of.some((entry) =>
        token.applies_to.includes(entry.component),
      ),
    );
    const relatedGuides = registry.guides.filter((guide) =>
      relatedComponents.some((component) =>
        guide.related_docs.related_components.includes(component.name),
      ),
    );

    return {
      target: toTokenCompact(token),
      related: {
        components: limitResults(
          relatedComponents.map(toComponentCompact),
          maxResults,
        ),
        patterns: limitResults(
          relatedPatterns.map(toPatternCompact),
          maxResults,
        ),
        tokens: limitResults(
          registry.tokens
            .filter(
              (candidate) =>
                candidate.name !== token.name &&
                candidate.category === token.category,
            )
            .map(toTokenCompact),
          maxResults,
        ),
        guides: limitResults(relatedGuides.map(toGuideCompact), maxResults),
        pages: [],
      },
    };
  }

  if (input.target_type === "guide") {
    const guideResolution = resolveGuideLookup(registry.guides, input.name);
    if (guideResolution.ambiguity) {
      return {
        target: null,
        related: emptyRelated(),
        did_you_mean: guideResolution.ambiguity.matches.map(
          (match) => match.name,
        ),
        ambiguity: guideResolution.ambiguity,
      };
    }

    const guide = guideResolution.candidate ?? null;
    if (!guide) {
      return { target: null, related: emptyRelated() };
    }

    const relatedComponents = registry.components.filter((component) =>
      guide.related_docs.related_components.includes(component.name),
    );
    const relatedPatterns = registry.patterns.filter((pattern) =>
      pattern.composed_of.some((entry) =>
        guide.related_docs.related_components.includes(entry.component),
      ),
    );
    const relatedPages = guide.related_docs.overview
      ? registry.pages.filter(
          (page) => page.route === guide.related_docs.overview,
        )
      : [];

    return {
      target: toGuideCompact(guide),
      related: {
        components: limitResults(
          relatedComponents.map(toComponentCompact),
          maxResults,
        ),
        patterns: limitResults(
          relatedPatterns.map(toPatternCompact),
          maxResults,
        ),
        tokens: [],
        guides: [],
        pages: limitResults(relatedPages.map(toPageCompact), maxResults),
      },
    };
  }

  const pageResolution = resolvePageLookup(registry.pages, input.name);
  if (pageResolution.ambiguity) {
    return {
      target: null,
      related: emptyRelated(),
      did_you_mean: pageResolution.ambiguity.matches.map(
        (match) => match.title,
      ),
      ambiguity: pageResolution.ambiguity,
    };
  }

  const page = pageResolution.candidate ?? null;
  if (!page) {
    return { target: null, related: emptyRelated() };
  }

  const keywordText = [page.title, ...page.keywords, ...page.section_headings]
    .join(" ")
    .toLowerCase();
  const pageLabels = getPageLabels(page);
  const directComponents = registry.components.filter(
    (component) =>
      isComponentAllowedByDocsPolicy(component) &&
      getComponentDocRoutes(component).includes(page.route),
  );
  const labelComponents = findComponentsForPageLabels(registry, pageLabels);
  const relatedComponents = uniqueBy(
    [...directComponents, ...labelComponents],
    (component) => component.id,
  );
  const directPatterns = registry.patterns.filter(
    (pattern) => pattern.related_docs.overview === page.route,
  );
  const labelPatterns = findPatternsForPageLabels(registry, pageLabels);
  const componentPatterns = registry.patterns.filter((pattern) =>
    relatedComponents.some((component) =>
      pattern.composed_of.some((entry) => entry.component === component.name),
    ),
  );
  const relatedPatterns = uniqueBy(
    [...directPatterns, ...labelPatterns, ...componentPatterns],
    (pattern) => pattern.id,
  );
  const directGuides = registry.guides.filter(
    (guide) => guide.related_docs.overview === page.route,
  );
  const labelGuides = findGuidesForPageLabels(registry, pageLabels);
  const componentGuides = registry.guides.filter((guide) =>
    relatedComponents.some((component) =>
      guide.related_docs.related_components.includes(component.name),
    ),
  );
  const relatedGuides = uniqueBy(
    [...directGuides, ...labelGuides, ...componentGuides],
    (guide) => guide.id,
  );
  const relatedTokens = uniqueBy(
    registry.tokens.filter(
      (token) =>
        keywordText.includes(token.category.toLowerCase()) ||
        (token.semantic_intent
          ? keywordText.includes(token.semantic_intent.toLowerCase())
          : false) ||
        relatedComponents.some((component) =>
          token.applies_to.includes(component.name),
        ),
    ),
    (token) => token.name,
  );
  const relatedPages = findPagesByRoutes(
    registry,
    [
      ...relatedComponents.flatMap(getComponentDocRoutes),
      ...relatedPatterns.flatMap((pattern) =>
        pattern.related_docs.overview ? [pattern.related_docs.overview] : [],
      ),
      ...relatedGuides.flatMap((guide) =>
        guide.related_docs.overview ? [guide.related_docs.overview] : [],
      ),
    ],
    page.route,
  );

  return {
    target: toPageCompact(page),
    related: {
      components: limitResults(
        relatedComponents.map(toComponentCompact),
        maxResults,
      ),
      patterns: limitResults(relatedPatterns.map(toPatternCompact), maxResults),
      tokens: limitResults(relatedTokens.map(toTokenCompact), maxResults),
      guides: limitResults(relatedGuides.map(toGuideCompact), maxResults),
      pages: limitResults(relatedPages.map(toPageCompact), maxResults),
    },
  };
}
