/**
 * Standard English function words (determiners, prepositions, conjunctions)
 * and registry meta-level terms.
 *
 * English function words are universally low-information tokens regardless
 * of the corpus.  Registry meta words describe the type system of the
 * registry ("component", "pattern", "salt") rather than any UI feature.
 *
 * These sets are used by entity-resolution and token-filtering code across
 * guideLookup, publicContract, and sourceUiSemanticSignals to replace
 * per-file hard-coded stop word lists with a single shared definition.
 */

export const ENGLISH_FUNCTION_WORDS: ReadonlySet<string> = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "be",
  "but",
  "by",
  "for",
  "from",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "no",
  "not",
  "of",
  "on",
  "or",
  "so",
  "the",
  "to",
  "vs",
  "was",
  "we",
  "with",
]);

/**
 * Meta-level terms that describe the registry type system rather than
 * any UI feature or behaviour.  Analogous to searching a web corpus for
 * "web page" — the term describes the medium, not the content.
 */
export const REGISTRY_META_WORDS: ReadonlySet<string> = new Set([
  "component",
  "components",
  "element",
  "elements",
  "pattern",
  "patterns",
  "salt",
  "ui",
  "uis",
]);


