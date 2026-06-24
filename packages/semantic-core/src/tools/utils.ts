/**
 * Inlined Porter stemmer algorithm.
 * Based on the Porter (1980) stemming algorithm for English.
 * Avoids external dependency to ensure CJS/ESM build compatibility.
 */
const step2list: Record<string, string> = {
  ational: "ate",
  tional: "tion",
  enci: "ence",
  anci: "ance",
  izer: "ize",
  bli: "ble",
  alli: "al",
  entli: "ent",
  eli: "e",
  ousli: "ous",
  ization: "ize",
  ation: "ate",
  ator: "ate",
  alism: "al",
  iveness: "ive",
  fulness: "ful",
  ousness: "ous",
  aliti: "al",
  iviti: "ive",
  biliti: "ble",
  logi: "log",
};
const step3list: Record<string, string> = {
  icate: "ic",
  ative: "",
  alize: "al",
  iciti: "ic",
  ical: "ic",
  ful: "",
  ness: "",
};
const c = "[^aeiou]";
const v = "[aeiouy]";
const C = `${c}[^aeiouy]*`;
const V = `${v}[aeiou]*`;
const mgr0 = new RegExp(`^(${C})?${V}${C}`);
const meq1 = new RegExp(`^(${C})?${V}${C}(${V})?$`);
const mgr1 = new RegExp(`^(${C})?${V}${C}${V}${C}`);
const s_v = new RegExp(`^(${C})?${v}`);

function porterStemmer(w: string): string {
  if (w.length < 3) return w;
  let stem: string;
  let suffix: string;
  let re: RegExp;
  let re2: RegExp;
  let re3: RegExp;
  let re4: RegExp;

  if (w.charAt(0) === "y") w = w.charAt(0).toUpperCase() + w.slice(1);

  // Step 1a
  re = /^(.+?)(ss|i)es$/;
  re2 = /^(.+?)([^s])s$/;
  if (re.test(w)) w = w.replace(re, "$1$2");
  else if (re2.test(w)) w = w.replace(re2, "$1$2");

  // Step 1b
  re = /^(.+?)eed$/;
  re2 = /^(.+?)(ed|ing)$/;
  if (re.test(w)) {
    const fp = re.exec(w)!;
    re = mgr0;
    if (re.test(fp[1])) w = w.slice(0, -1);
  } else if (re2.test(w)) {
    const fp = re2.exec(w)!;
    stem = fp[1];
    re2 = s_v;
    if (re2.test(stem)) {
      w = stem;
      re2 = /(at|bl|iz)$/;
      re3 = /([^aeiouylsz])\1$/;
      re4 = new RegExp(`^${C}${v}[^aeiouwxy]$`);
      if (re2.test(w)) w += "e";
      else if (re3.test(w)) w = w.slice(0, -1);
      else if (re4.test(w)) w += "e";
    }
  }

  // Step 1c
  re = /^(.+?)y$/;
  if (re.test(w)) {
    const fp = re.exec(w)!;
    stem = fp[1];
    re = s_v;
    if (re.test(stem)) w = `${stem}i`;
  }

  // Step 2
  re =
    /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
  if (re.test(w)) {
    const fp = re.exec(w)!;
    stem = fp[1];
    suffix = fp[2];
    re = mgr0;
    if (re.test(stem)) w = stem + step2list[suffix];
  }

  // Step 3
  re = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
  if (re.test(w)) {
    const fp = re.exec(w)!;
    stem = fp[1];
    suffix = fp[2];
    re = mgr0;
    if (re.test(stem)) w = stem + step3list[suffix];
  }

  // Step 4
  re =
    /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
  re2 = /^(.+?)(s|t)(ion)$/;
  if (re.test(w)) {
    const fp = re.exec(w)!;
    stem = fp[1];
    re = mgr1;
    if (re.test(stem)) w = stem;
  } else if (re2.test(w)) {
    const fp = re2.exec(w)!;
    stem = fp[1] + fp[2];
    re2 = mgr1;
    if (re2.test(stem)) w = stem;
  }

  // Step 5
  re = /^(.+?)e$/;
  if (re.test(w)) {
    const fp = re.exec(w)!;
    stem = fp[1];
    re = mgr1;
    re2 = meq1;
    re3 = new RegExp(`^${C}${v}[^aeiouwxy]$`);
    if (re.test(stem) || (re2.test(stem) && !re3.test(stem))) w = stem;
  }

  re = /ll$/;
  re2 = mgr1;
  if (re.test(w) && re2.test(w)) w = w.slice(0, -1);

  if (w.charAt(0) === "Y") w = w.charAt(0).toLowerCase() + w.slice(1);
  return w;
}

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
 * Stem a token using the Porter stemmer algorithm.
 * Tokens of 2 characters or fewer are returned as-is to avoid noise.
 * Hyphenated tokens are split, each part stemmed, then rejoined.
 */
export function stemToken(token: string): string {
  if (token.length <= 2) {
    return token;
  }
  if (token.includes("-")) {
    return token
      .split("-")
      .map((part) => (part.length <= 2 ? part : porterStemmer(part)))
      .join("-");
  }
  return porterStemmer(token);
}

export function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .split(/[^a-z0-9-]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);
}

/**
 * Tokenize and stem — used for token-set intersection where morphological
 * variants (navigate/navigation/navigating) should match.
 */
export function stemTokenize(input: string): string[] {
  return tokenize(input).map(stemToken);
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
