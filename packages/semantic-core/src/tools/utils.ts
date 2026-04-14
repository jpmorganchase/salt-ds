import {
  createComponentPackageKey,
  getRegistryIndexes,
  normalizeRegistryLookupKey,
} from "../registry/runtimeCache.js";
import type {
  ComponentRecord,
  ExampleRecord,
  SaltRegistry,
  SearchIndexEntry,
} from "../types.js";

const SITE_COMPONENT_DOCS_PREFIX = "/salt/components/";

export function normalizeQuery(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Lightweight plural normalisation — strips trailing "s" / "es" to
 * collapse common plural forms.  Guards against very short words and
 * avoids over-stemming irregular forms.
 */
export function stemToken(token: string): string {
  if (token.length <= 3) {
    return token;
  }
  if (/(?:shes|ches|xes|zes|ses)$/.test(token)) {
    return token.slice(0, -2);
  }
  if (token.endsWith("ies") && token.length > 4) {
    return `${token.slice(0, -3)}y`;
  }
  if (token.endsWith("s") && !token.endsWith("ss")) {
    return token.slice(0, -1);
  }
  return token;
}

export function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .split(/[^a-z0-9-]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1)
    .map(stemToken);
}

export function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

/**
 * Check whether `phrase` appears as a whole-word sequence inside `text`.
 * Both arguments must already be lowercased.
 * Uses negative look-around for alphanumeric characters so that e.g.
 * "table" does NOT match inside "interactable" or "selectable".
 *
 * Compiled regexes are cached by phrase to avoid repeated compilation.
 */
const phraseRegexCache = new Map<string, RegExp>();

export function containsWholeWordPhrase(text: string, phrase: string): boolean {
  let regex = phraseRegexCache.get(phrase);
  if (!regex) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    regex = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`);
    phraseRegexCache.set(phrase, regex);
  }
  return regex.test(text);
}

export function hasSiteComponentDocumentation(
  url: string | null | undefined,
): boolean {
  return typeof url === "string" && url.startsWith(SITE_COMPONENT_DOCS_PREFIX);
}

export function isComponentAllowedByDocsPolicy(
  component: Pick<ComponentRecord, "package" | "related_docs">,
): boolean {
  if (component.package.name !== "@salt-ds/lab") {
    return true;
  }

  return Object.values(component.related_docs).some(
    hasSiteComponentDocumentation,
  );
}

function findComponentForExample(
  registry: SaltRegistry,
  example: ExampleRecord,
): ComponentRecord | null {
  if (example.target_type !== "component") {
    return null;
  }

  const normalizedTargetName = normalizeRegistryLookupKey(example.target_name);
  const { componentsByNormalizedAlias, componentsByNormalizedName } =
    getRegistryIndexes(registry);

  return (
    componentsByNormalizedName.get(normalizedTargetName)?.[0] ??
    componentsByNormalizedAlias.get(normalizedTargetName)?.[0] ??
    null
  );
}

export function isExampleAllowedByDocsPolicy(
  registry: SaltRegistry,
  example: ExampleRecord,
): boolean {
  if (example.target_type !== "component") {
    return true;
  }

  const component = findComponentForExample(registry, example);
  if (component) {
    return isComponentAllowedByDocsPolicy(component);
  }

  if (example.package !== "@salt-ds/lab") {
    return true;
  }

  return hasSiteComponentDocumentation(example.source_url);
}

export function isSearchEntryAllowedByDocsPolicy(
  registry: SaltRegistry,
  entry: SearchIndexEntry,
): boolean {
  const { changeById, componentById, componentByPackageAndName, exampleById } =
    getRegistryIndexes(registry);

  if (entry.type === "component") {
    const component = componentById.get(entry.id) ?? null;

    if (component) {
      return isComponentAllowedByDocsPolicy(component);
    }

    if (entry.package !== "@salt-ds/lab") {
      return true;
    }

    return hasSiteComponentDocumentation(entry.source_url);
  }

  if (entry.type === "example") {
    const exampleId = entry.id.replace(/^example\./, "");
    const example = exampleById.get(exampleId) ?? null;

    if (example) {
      return isExampleAllowedByDocsPolicy(registry, example);
    }

    if (entry.package !== "@salt-ds/lab") {
      return true;
    }

    return hasSiteComponentDocumentation(entry.source_url);
  }

  if (entry.type === "change") {
    const change = changeById.get(entry.id) ?? null;
    if (!change) {
      return true;
    }

    if (change.target_type !== "component") {
      return true;
    }

    const component =
      componentByPackageAndName.get(
        createComponentPackageKey(change.package, change.target_name),
      ) ?? null;

    return component ? isComponentAllowedByDocsPolicy(component) : true;
  }

  return true;
}
