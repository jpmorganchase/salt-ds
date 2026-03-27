import type { SaltRegistry, SearchIndexEntry } from "../types.js";
import { toKebabCase, uniqueStrings } from "./buildRegistryShared.js";

export function buildSearchIndex(
  registry: Omit<SaltRegistry, "search_index">,
): SearchIndexEntry[] {
  const entries: SearchIndexEntry[] = [];

  for (const pkg of registry.packages) {
    entries.push({
      id: pkg.id,
      type: "package",
      name: pkg.name,
      package: pkg.name,
      status: pkg.status,
      summary: pkg.summary,
      source_url: pkg.docs_root,
      keywords: [pkg.name, pkg.status, pkg.version],
    });
  }

  for (const component of registry.components) {
    entries.push({
      id: component.id,
      type: "component",
      name: component.name,
      package: component.package.name,
      status: component.status,
      summary: component.summary,
      source_url: component.related_docs.overview,
      keywords: uniqueStrings([
        component.name,
        ...component.aliases,
        ...component.tags,
        ...component.when_to_use,
      ]),
    });
  }

  for (const icon of registry.icons) {
    entries.push({
      id: icon.id,
      type: "icon",
      name: icon.name,
      package: icon.package.name,
      status: icon.status,
      summary: icon.summary,
      source_url: icon.related_docs.overview,
      keywords: uniqueStrings([
        icon.name,
        icon.base_name,
        icon.figma_name,
        icon.category,
        icon.variant,
        ...icon.synonyms,
        ...icon.aliases,
      ]),
    });
  }

  for (const countrySymbol of registry.country_symbols) {
    entries.push({
      id: countrySymbol.id,
      type: "country_symbol",
      name: countrySymbol.name,
      package: countrySymbol.package.name,
      status: countrySymbol.status,
      summary: countrySymbol.summary,
      source_url:
        countrySymbol.related_docs.foundation ??
        countrySymbol.related_docs.overview,
      keywords: uniqueStrings([
        countrySymbol.code,
        countrySymbol.name,
        ...countrySymbol.aliases,
        countrySymbol.variants.circle.export_name,
        countrySymbol.variants.sharp.export_name,
      ]),
    });
  }

  for (const page of registry.pages) {
    entries.push({
      id: page.id,
      type: "page",
      name: page.title,
      package: null,
      status: "stable",
      summary: page.summary,
      source_url: page.route,
      keywords: uniqueStrings([
        page.title,
        page.page_kind,
        ...page.keywords,
        ...page.section_headings,
      ]),
    });
  }

  for (const pattern of registry.patterns) {
    entries.push({
      id: pattern.id,
      type: "pattern",
      name: pattern.name,
      package: null,
      status: pattern.status,
      summary: pattern.summary,
      source_url: pattern.related_docs.overview,
      keywords: uniqueStrings([
        pattern.name,
        ...pattern.aliases,
        ...pattern.when_to_use,
        ...pattern.related_patterns,
        ...pattern.composed_of.map((item) => item.component),
        ...pattern.how_to_build,
        ...pattern.how_it_works,
      ]),
    });
  }

  for (const guide of registry.guides) {
    entries.push({
      id: guide.id,
      type: "guide",
      name: guide.name,
      package: null,
      status: "stable",
      summary: guide.summary,
      source_url: guide.related_docs.overview,
      keywords: uniqueStrings([
        guide.name,
        ...guide.aliases,
        ...guide.packages,
        ...guide.related_docs.related_components,
        ...guide.related_docs.related_packages,
        ...guide.steps.flatMap((step) => [
          step.title,
          ...step.statements,
          ...step.snippets.map((snippet) => snippet.title),
        ]),
      ]),
    });
  }

  for (const token of registry.tokens) {
    entries.push({
      id: `token.${toKebabCase(token.name)}`,
      type: "token",
      name: token.name,
      package: "@salt-ds/theme",
      status: token.deprecated ? "deprecated" : "stable",
      summary: token.semantic_intent ?? `${token.category} token`,
      source_url: "/salt/themes/design-tokens/index",
      keywords: uniqueStrings([
        token.name,
        token.category,
        ...(token.semantic_intent ? [token.semantic_intent] : []),
      ]),
    });
  }

  for (const example of registry.examples) {
    entries.push({
      id: `example.${example.id}`,
      type: "example",
      name: example.title,
      package: example.package,
      status: null,
      summary: `Example for ${example.target_type} ${example.target_name}`,
      source_url: example.source_url,
      keywords: uniqueStrings([
        example.title,
        example.target_name,
        ...example.intent,
      ]),
    });
  }

  for (const change of registry.changes) {
    const packageStatus =
      registry.packages.find((pkg) => pkg.name === change.package)?.status ??
      null;
    entries.push({
      id: change.id,
      type: "change",
      name: `${change.target_name} ${change.version}`,
      package: change.package,
      status: packageStatus,
      summary: change.summary,
      source_url: change.source_urls[0] ?? null,
      keywords: uniqueStrings([
        change.target_name,
        change.package,
        change.version,
        change.kind,
        change.release_type,
        change.summary,
        change.details,
      ]),
    });
  }

  return entries;
}
