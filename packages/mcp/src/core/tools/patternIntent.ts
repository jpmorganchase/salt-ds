import { normalizeQuery } from "./utils.js";

const DIRECT_PATTERN_PHRASES = [
  /\bapp header\b/,
  /\bapp shell\b/,
  /\bdashboard\b/,
  /\bnavigation pane\b/,
  /\bsidebar navigation\b/,
  /\bvertical navigation\b/,
  /\bbutton bar\b/,
] as const;

const REGION_PHRASES = [
  { label: "header", pattern: /\b(header|masthead|top bar)\b/ },
  {
    label: "sidebar",
    pattern:
      /\b(sidebar|side nav|sidenav|left[- ]hand navigation|navigation pane|nav pane|aside)\b/,
  },
  { label: "footer", pattern: /\b(footer|bottom bar)\b/ },
  {
    label: "main-content",
    pattern:
      /\b(main content|content area|content pane|main panel|body area)\b/,
  },
  { label: "toolbar", pattern: /\b(toolbar|command bar|action bar)\b/ },
  { label: "filters", pattern: /\b(filter bar|filter pane|filters)\b/ },
] as const;

const SHELL_CONTEXT_PHRASES = [
  /\bapp shell\b/,
  /\bdashboard\b/,
  /\bpage\b/,
  /\bscreen\b/,
  /\bworkspace\b/,
  /\blayout\b/,
] as const;

const HIERARCHY_PHRASES = [
  /\bnested\b/,
  /\bmultilevel\b/,
  /\bmulti-level\b/,
  /\bgrouped\b/,
  /\bsections?\b/,
  /\bsubmenus?\b/,
  /\bhierarchy\b/,
  /\btree\b/,
] as const;

export interface StructuralPatternIntent {
  score: number;
  directPatternSignal: boolean;
  regionCount: number;
  shellContextCount: number;
  hierarchyCount: number;
  reasons: string[];
}

export function getStructuralPatternIntent(
  input: string,
): StructuralPatternIntent {
  const query = normalizeQuery(input);
  const reasons: string[] = [];

  const directPatternSignal = DIRECT_PATTERN_PHRASES.some((pattern) =>
    pattern.test(query),
  );

  if (directPatternSignal) {
    reasons.push("query uses a shell or pattern phrase directly");
  }

  const matchedRegions = REGION_PHRASES.filter(({ pattern }) =>
    pattern.test(query),
  );
  if (matchedRegions.length >= 2) {
    reasons.push("query describes multiple UI regions");
  }

  const shellContextCount = SHELL_CONTEXT_PHRASES.filter((pattern) =>
    pattern.test(query),
  ).length;
  if (shellContextCount > 0 && matchedRegions.length > 0) {
    reasons.push("query combines shell context with named regions");
  }

  const hierarchyCount = HIERARCHY_PHRASES.filter((pattern) =>
    pattern.test(query),
  ).length;
  const navigationRegionDetected = matchedRegions.some(
    (entry) => entry.label === "sidebar",
  );
  if (navigationRegionDetected && hierarchyCount > 0) {
    reasons.push("query describes structured navigation hierarchy");
  }

  let score = 0;
  if (directPatternSignal) {
    score += 4;
  }
  if (matchedRegions.length >= 2) {
    score += 3;
  }
  if (shellContextCount > 0 && matchedRegions.length > 0) {
    score += 2;
  }
  if (navigationRegionDetected && hierarchyCount > 0) {
    score += 3;
  }

  return {
    score,
    directPatternSignal,
    regionCount: matchedRegions.length,
    shellContextCount,
    hierarchyCount,
    reasons,
  };
}

export function prefersPatternForStructuralQuery(input: string): boolean {
  return getStructuralPatternIntent(input).score >= 4;
}
