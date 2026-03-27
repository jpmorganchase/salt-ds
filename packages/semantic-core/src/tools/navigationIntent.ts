import { normalizeQuery } from "./utils.js";

const DIRECT_SINGLE_DESTINATION_PATTERNS = [
  /\bnavigate to (?:another|a different|a|the)?\s*(?:route|page|site|destination)\b/,
  /\blink to (?:another|a different|a|the|specific)?\s*(?:route|page|site|destination|section)\b/,
  /\bgo to (?:another|a different|a|the)?\s*(?:route|page|site|destination)\b/,
  /\bsingle destination\b/,
  /\broute change\b/,
] as const;

const DIRECT_NAVIGATION_HINT = /\b(link|navigate|route|destination|href|url)\b/;
const SINGLE_TARGET_HINT = /\b(page|route|site|destination|section|screen)\b/;
const STRUCTURED_NAVIGATION_HINT =
  /\b(sidebar|vertical navigation|navigation pane|nested|submenu|sections?|app shell|wizard|stepper|pagination|breadcrumbs|tabs?|menu button)\b/;
const PAGED_COLLECTION_HINT =
  /\b(pagination|page numbers?|rows per page|page size|previous page|next page|search results?|results pages?|paged results?|grid pages?|table pages?)\b/;

export function hasSingleDestinationNavigationIntent(input: string): boolean {
  const query = normalizeQuery(input);

  if (!query) {
    return false;
  }

  if (
    PAGED_COLLECTION_HINT.test(query) ||
    STRUCTURED_NAVIGATION_HINT.test(query)
  ) {
    return false;
  }

  if (
    DIRECT_SINGLE_DESTINATION_PATTERNS.some((pattern) => pattern.test(query))
  ) {
    return true;
  }

  return DIRECT_NAVIGATION_HINT.test(query) && SINGLE_TARGET_HINT.test(query);
}
