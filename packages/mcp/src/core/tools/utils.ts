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
  const step1bMatch = re.exec(w);
  const step1bFallbackMatch = re2.exec(w);
  if (step1bMatch) {
    const fp = step1bMatch;
    re = mgr0;
    if (re.test(fp[1])) w = w.slice(0, -1);
  } else if (step1bFallbackMatch) {
    const fp = step1bFallbackMatch;
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
  const step1cMatch = re.exec(w);
  if (step1cMatch) {
    const fp = step1cMatch;
    stem = fp[1];
    re = s_v;
    if (re.test(stem)) w = `${stem}i`;
  }

  // Step 2
  re =
    /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
  const step2Match = re.exec(w);
  if (step2Match) {
    const fp = step2Match;
    stem = fp[1];
    suffix = fp[2];
    re = mgr0;
    if (re.test(stem)) w = stem + step2list[suffix];
  }

  // Step 3
  re = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
  const step3Match = re.exec(w);
  if (step3Match) {
    const fp = step3Match;
    stem = fp[1];
    suffix = fp[2];
    re = mgr0;
    if (re.test(stem)) w = stem + step3list[suffix];
  }

  // Step 4
  re =
    /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
  re2 = /^(.+?)(s|t)(ion)$/;
  const step4Match = re.exec(w);
  const step4IonMatch = re2.exec(w);
  if (step4Match) {
    const fp = step4Match;
    stem = fp[1];
    re = mgr1;
    if (re.test(stem)) w = stem;
  } else if (step4IonMatch) {
    const fp = step4IonMatch;
    stem = fp[1] + fp[2];
    re2 = mgr1;
    if (re2.test(stem)) w = stem;
  }

  // Step 5
  re = /^(.+?)e$/;
  const step5Match = re.exec(w);
  if (step5Match) {
    const fp = step5Match;
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
  getComponentExportAliases,
  getRegistryIndexes,
  normalizeRegistryLookupKey,
} from "../registry/runtimeCache.js";
import type { ComponentRecord, ExampleRecord, SaltRegistry } from "../types.js";

const SITE_COMPONENT_DOCS_PREFIX = "/salt/components/";

export function normalizeQuery(input: string): string {
  return splitIdentifierWords(input)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function splitIdentifierWords(input: string): string {
  return input
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2");
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

export function getComponentLookupNames(component: ComponentRecord): string[] {
  return unique(
    [
      component.name,
      component.source.export_name,
      ...component.aliases,
      ...getComponentExportAliases(component),
      ...(component.sub_components?.map((sub) => sub.export_name) ?? []),
    ].filter((value): value is string => Boolean(value)),
  );
}

export function componentMatchesLookupName(
  component: ComponentRecord,
  name: string,
): boolean {
  const normalized = normalizeRegistryLookupKey(name);
  return getComponentLookupNames(component).some(
    (lookupName) => normalizeRegistryLookupKey(lookupName) === normalized,
  );
}

export function findComponentByPackageAndLookupName(
  registry: Pick<SaltRegistry, "components">,
  packageName: string,
  name: string,
): ComponentRecord | null {
  return (
    registry.components.find(
      (component) =>
        component.package.name === packageName &&
        componentMatchesLookupName(component, name),
    ) ?? null
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
