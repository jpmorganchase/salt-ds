import type {
  ComponentRecord,
  PatternRecord,
  SaltRegistry,
  UsageSemanticsRecord,
} from "../types.js";
import {
  type GuideContext,
  type GuideReference,
  getRelevantGuidesForContext,
} from "./guideAwareness.js";

type ComponentDocsSource = Pick<
  ComponentRecord,
  "name" | "package" | "related_docs"
>;
type PatternDocsSource = Pick<
  PatternRecord,
  "composed_of" | "related_docs" | "resources" | "examples"
>;

type GuidanceSource = {
  semantics?: UsageSemanticsRecord;
};

function getGuidanceSources(source: GuidanceSource): string[] {
  return [...new Set(source.semantics?.derived_from ?? [])];
}

export function getComponentDocs(source: ComponentDocsSource): string[] {
  return [
    source.related_docs.overview,
    source.related_docs.usage,
    source.related_docs.accessibility,
    source.related_docs.examples,
  ].filter((value): value is string => Boolean(value));
}

export function getPatternDocs(source: PatternDocsSource): string[] {
  return [
    source.related_docs.overview,
    ...source.resources.map((resource) => resource.href),
  ].filter((value): value is string => Boolean(value));
}

export function getComponentGuideContext(
  component: ComponentDocsSource,
): GuideContext {
  return {
    componentNames: [component.name],
    packages: [component.package.name],
    guideRoutes: getComponentDocs(component),
  };
}

export function getPatternGuideContext(
  pattern: PatternDocsSource,
): GuideContext {
  return {
    componentNames: pattern.composed_of.map((entry) => entry.component),
    guideRoutes: getPatternDocs(pattern),
  };
}

export function getComponentRelatedGuides(
  registry: SaltRegistry,
  component: ComponentDocsSource,
  topK = 4,
): GuideReference[] {
  return getRelevantGuidesForContext(
    registry,
    getComponentGuideContext(component),
    topK,
  );
}

export function getPatternRelatedGuides(
  registry: SaltRegistry,
  pattern: PatternDocsSource,
  topK = 4,
): GuideReference[] {
  return getRelevantGuidesForContext(
    registry,
    getPatternGuideContext(pattern),
    topK,
  );
}

export function buildComponentPresentationBase(
  registry: SaltRegistry,
  component: ComponentDocsSource & GuidanceSource,
): {
  docs: string[];
  examples: string[];
  related_guides: GuideReference[];
  guidance_sources: string[];
} {
  return {
    docs: getComponentDocs(component),
    examples: component.related_docs.examples
      ? [component.related_docs.examples]
      : [],
    related_guides: getComponentRelatedGuides(registry, component),
    guidance_sources: getGuidanceSources(component),
  };
}

export function buildPatternPresentationBase(
  registry: SaltRegistry,
  pattern: PatternDocsSource & GuidanceSource,
): {
  docs: string[];
  examples: string[];
  related_guides: GuideReference[];
  guidance_sources: string[];
} {
  return {
    docs: getPatternDocs(pattern),
    examples: pattern.examples
      .slice(0, 3)
      .map((example) => example.source_url)
      .filter((value): value is string => Boolean(value)),
    related_guides: getPatternRelatedGuides(registry, pattern),
    guidance_sources: getGuidanceSources(pattern),
  };
}
