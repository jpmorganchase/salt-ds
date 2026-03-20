import type { GuideRecord, SaltRegistry } from "../types.js";

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

export interface GuideReference {
  name: string;
  kind: GuideRecord["kind"];
  summary: string;
  overview: string | null;
}

export interface GuideContext {
  componentNames?: string[];
  packages?: string[];
  guideRoutes?: string[];
}

function toGuideReference(guide: GuideRecord): GuideReference {
  return {
    name: guide.name,
    kind: guide.kind,
    summary: guide.summary,
    overview: guide.related_docs.overview,
  };
}

function isGuideReference(value: unknown): value is GuideReference {
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof (value as { name?: unknown }).name === "string" &&
      typeof (value as { kind?: unknown }).kind === "string" &&
      typeof (value as { summary?: unknown }).summary === "string",
  );
}

function isGuideContext(value: unknown): value is GuideContext {
  return Boolean(
    value &&
      typeof value === "object" &&
      (!("componentNames" in (value as object)) ||
        Array.isArray((value as { componentNames?: unknown }).componentNames)) &&
      (!("packages" in (value as object)) ||
        Array.isArray((value as { packages?: unknown }).packages)) &&
      (!("guideRoutes" in (value as object)) ||
        Array.isArray((value as { guideRoutes?: unknown }).guideRoutes)),
  );
}

function normalizeGuideContext(context: GuideContext): GuideContext {
  return {
    componentNames: unique(context.componentNames ?? []),
    packages: unique(context.packages ?? []),
    guideRoutes: unique(context.guideRoutes ?? []),
  };
}

export function mergeGuideContexts(
  ...contexts: Array<GuideContext | null | undefined>
): GuideContext {
  return normalizeGuideContext({
    componentNames: contexts.flatMap((context) => context?.componentNames ?? []),
    packages: contexts.flatMap((context) => context?.packages ?? []),
    guideRoutes: contexts.flatMap((context) => context?.guideRoutes ?? []),
  });
}

export function uniqueGuideReferences(
  guides: GuideReference[],
): GuideReference[] {
  const seen = new Set<string>();

  return guides.filter((guide) => {
    const key = `${guide.overview ?? ""}::${guide.name}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function extractGuideReferences(value: unknown): GuideReference[] {
  if (!value || typeof value !== "object") {
    return [];
  }

  const relatedGuides = (value as { related_guides?: unknown }).related_guides;
  if (!Array.isArray(relatedGuides)) {
    return [];
  }

  return relatedGuides.filter(isGuideReference);
}

export function extractGuideContext(value: unknown): GuideContext | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const guideContext = (value as { guide_context?: unknown }).guide_context;
  if (!isGuideContext(guideContext)) {
    return null;
  }

  return normalizeGuideContext({
    componentNames: toStringArray(guideContext.componentNames),
    packages: toStringArray(guideContext.packages),
    guideRoutes: toStringArray(guideContext.guideRoutes),
  });
}

export function getRelevantGuidesForRecords(
  registry: SaltRegistry,
  records: unknown[],
  options?: {
    fallbackComponentNames?: string[];
    fallbackPackages?: string[];
    fallbackGuideRoutes?: string[];
    top_k?: number;
  },
): GuideReference[] {
  const embeddedGuides = uniqueGuideReferences(
    records.flatMap((record) => extractGuideReferences(record)),
  );
  if (embeddedGuides.length > 0) {
    return embeddedGuides.slice(0, Math.max(1, Math.min(options?.top_k ?? 4, 10)));
  }

  const context = mergeGuideContexts(
    {
      componentNames: options?.fallbackComponentNames,
      packages: options?.fallbackPackages,
      guideRoutes: options?.fallbackGuideRoutes,
    },
    ...records.map((record) => extractGuideContext(record)),
  );

  return getRelevantGuidesForContext(registry, context, options?.top_k);
}

export function getRelevantGuidesForContext(
  registry: SaltRegistry,
  context: GuideContext,
  topK = 4,
): GuideReference[] {
  const normalizedContext = normalizeGuideContext(context);
  const componentNames = normalizedContext.componentNames ?? [];
  const packages = normalizedContext.packages ?? [];
  const guideRoutes = normalizedContext.guideRoutes ?? [];
  const clampedTopK = Math.max(1, Math.min(topK, 10));

  return uniqueGuideReferences(
    registry.guides
      .map((guide) => {
        let score = 0;

        if (
          guide.related_docs.overview &&
          guideRoutes.includes(guide.related_docs.overview)
        ) {
          score += 100;
        }

        score += componentNames.filter((componentName) =>
          guide.related_docs.related_components.includes(componentName),
        ).length * 20;

        score += packages.filter((pkg) =>
          guide.related_docs.related_packages.includes(pkg),
        ).length * 5;

        return { guide, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((left, right) => {
        if (left.score !== right.score) {
          return right.score - left.score;
        }
        if (
          left.guide.related_docs.related_components.length !==
          right.guide.related_docs.related_components.length
        ) {
          return (
            left.guide.related_docs.related_components.length -
            right.guide.related_docs.related_components.length
          );
        }
        return left.guide.name.localeCompare(right.guide.name);
      })
      .slice(0, clampedTopK)
      .map((entry) => toGuideReference(entry.guide)),
  );
}

export function getRelevantGuides(
  registry: SaltRegistry,
  options: GuideContext & {
    top_k?: number;
  },
): GuideReference[] {
  return getRelevantGuidesForContext(
    registry,
    {
      componentNames: options.componentNames,
      packages: options.packages,
      guideRoutes: options.guideRoutes,
    },
    options.top_k,
  );
}
