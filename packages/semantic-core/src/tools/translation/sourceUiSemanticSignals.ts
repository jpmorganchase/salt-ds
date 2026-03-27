import { unique } from "../utils.js";
import type { TranslationSemanticIndex } from "./sourceUiSemanticMatching.js";
import type {
  SaltSolutionType,
  SourceIntentProfile,
  SourceUiNode,
  UiArchetype,
} from "./sourceUiTypes.js";

export interface GuidanceSignals {
  summary: string[];
  categories: string[];
  preferredFor: string[];
  notFor: string[];
  docs: string[];
  aliases: string[];
  relatedPatterns: string[];
  buildSteps: string[];
  componentRoles: string[];
  accessibility: string[];
}

const SOURCE_TOKEN_STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "another",
  "app",
  "application",
  "area",
  "bar",
  "body",
  "component",
  "content",
  "control",
  "current",
  "for",
  "form",
  "group",
  "header",
  "in",
  "inside",
  "into",
  "item",
  "items",
  "layout",
  "main",
  "mode",
  "multiple",
  "new",
  "of",
  "on",
  "or",
  "page",
  "part",
  "parts",
  "primary",
  "related",
  "same",
  "section",
  "sections",
  "single",
  "the",
  "to",
  "use",
  "user",
  "using",
  "view",
  "views",
  "with",
  "workflow",
]);

const ROLE_HINTS: Record<SourceUiNode["role"], string[]> = {
  action: ["action", "trigger", "immediate action"],
  navigation: ["navigation", "destination", "wayfinding"],
  commanding: ["grouped actions", "command cluster", "supporting controls"],
  overlay: ["overlay", "contained flow", "supporting actions"],
  "data-entry": ["field", "data entry", "validation"],
  selection: ["selection", "choice", "toggle"],
  "data-display": [
    "data display",
    "rows and columns",
    "structured information",
  ],
};

const SCOPE_HINTS: Record<SourceUiNode["scope"], string[]> = {
  control: ["single control", "focused interaction"],
  flow: ["multi-part flow", "related parts"],
  "app-structure": ["app structure", "persistent region", "layout shell"],
};

export function tokenizeText(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter((token) => token.length > 2 && !SOURCE_TOKEN_STOPWORDS.has(token));
}

function uniquePhrases(values: Array<string | null | undefined>): string[] {
  return unique(
    values
      .map((value) => value?.trim())
      .filter((value): value is string => Boolean(value)),
  );
}

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function getStructuralTerms(source: SourceUiNode): string[] {
  if (source.scope === "app-structure" && source.role === "navigation") {
    return [
      "structured navigation",
      "persistent navigation",
      "navigation sections",
    ];
  }
  if (source.scope === "flow" && source.role === "overlay") {
    return [
      "header body footer",
      "supporting actions",
      "contained interaction flow",
    ];
  }
  if (source.scope === "flow" && source.role === "commanding") {
    return ["grouped actions", "supporting controls", "command layout"];
  }
  if (source.scope === "flow" && source.role === "data-display") {
    return ["dense information", "rows and columns", "supporting states"];
  }
  if (source.scope === "control" && source.role === "data-entry") {
    return ["labeled field", "helper text", "validation support"];
  }
  if (source.scope === "control" && source.role === "selection") {
    return ["selection control", "selection state"];
  }
  if (source.scope === "control" && source.role === "navigation") {
    return ["single destination", "route change"];
  }
  return source.complexity === "multi-part"
    ? ["multi-part structure", "supporting states"]
    : ["focused interaction"];
}

export function extractDocs(record: Record<string, unknown> | null): string[] {
  if (!record) {
    return [];
  }

  const docs = toStringArray(record.docs);
  if (docs.length > 0) {
    return docs;
  }

  if (typeof record.route === "string") {
    return [record.route];
  }

  const relatedDocs = toRecord(record.related_docs);
  if (!relatedDocs) {
    return [];
  }

  return Object.values(relatedDocs).filter(
    (value): value is string => typeof value === "string" && value.length > 0,
  );
}

export function extractGuidanceSignals(
  index: TranslationSemanticIndex,
  record: Record<string, unknown> | null,
): GuidanceSignals {
  if (!record) {
    return {
      summary: [],
      categories: [],
      preferredFor: [],
      notFor: [],
      docs: [],
      aliases: [],
      relatedPatterns: [],
      buildSteps: [],
      componentRoles: [],
      accessibility: [],
    };
  }

  const cached = index.signalCache.get(record);
  if (cached) {
    return cached;
  }

  const semantics = toRecord(record.semantics);
  const composedOf = Array.isArray(record.composed_of)
    ? record.composed_of.filter(
        (
          entry,
        ): entry is {
          component?: unknown;
          role?: unknown;
        } => Boolean(entry) && typeof entry === "object",
      )
    : [];
  const signals = {
    summary: uniquePhrases([
      typeof record.summary === "string" ? record.summary : null,
    ]).map((entry) => entry.toLowerCase()),
    categories: toStringArray(semantics?.category ?? record.category).map(
      (entry) => entry.toLowerCase(),
    ),
    preferredFor: toStringArray(
      semantics?.preferred_for ?? record.when_to_use,
    ).map((entry) => entry.toLowerCase()),
    notFor: toStringArray(semantics?.not_for ?? record.when_not_to_use).map(
      (entry) => entry.toLowerCase(),
    ),
    docs: extractDocs(record).map((entry) => entry.toLowerCase()),
    aliases: toStringArray(record.aliases).map((entry) => entry.toLowerCase()),
    relatedPatterns: toStringArray(record.related_patterns).map((entry) =>
      entry.toLowerCase(),
    ),
    buildSteps: unique([
      ...toStringArray(record.how_to_build).map((entry) => entry.toLowerCase()),
      ...toStringArray(record.how_it_works).map((entry) => entry.toLowerCase()),
    ]),
    componentRoles: composedOf.flatMap((entry) =>
      [
        typeof entry.component === "string" ? entry.component : null,
        typeof entry.role === "string"
          ? `${entry.component ?? ""} ${entry.role}`.trim()
          : null,
        typeof entry.role === "string" ? entry.role : null,
      ]
        .filter((value): value is string => Boolean(value))
        .map((entry) => entry.toLowerCase()),
    ),
    accessibility: toStringArray(toRecord(record.accessibility)?.summary).map(
      (entry) => entry.toLowerCase(),
    ),
  };

  index.signalCache.set(record, signals);
  return signals;
}

export function buildTargetGuidanceText(
  index: TranslationSemanticIndex,
  record: Record<string, unknown> | null,
  canonicalRecord: Record<string, unknown> | null,
): string {
  const cacheTarget = canonicalRecord ?? record;
  if (cacheTarget) {
    const cached = index.guidanceTextCache.get(cacheTarget);
    if (cached) {
      return cached;
    }
  }

  const compactSignals = extractGuidanceSignals(index, record);
  const canonicalSignals = extractGuidanceSignals(index, canonicalRecord);

  const guidanceText = [
    typeof record?.name === "string" ? record.name : null,
    typeof record?.title === "string" ? record.title : null,
    typeof record?.summary === "string" ? record.summary : null,
    ...compactSignals.summary,
    ...canonicalSignals.summary,
    ...compactSignals.aliases,
    ...compactSignals.relatedPatterns,
    ...compactSignals.buildSteps,
    ...compactSignals.componentRoles,
    ...compactSignals.accessibility,
    ...compactSignals.preferredFor,
    ...compactSignals.notFor,
    ...canonicalSignals.preferredFor,
    ...canonicalSignals.notFor,
    ...compactSignals.docs,
    ...canonicalSignals.docs,
  ]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();

  if (cacheTarget) {
    index.guidanceTextCache.set(cacheTarget, guidanceText);
  }

  return guidanceText;
}

function getSolutionRecords(
  index: TranslationSemanticIndex,
  solutionType: Exclude<SaltSolutionType, "auto" | "token">,
): Array<Record<string, unknown>> {
  if (solutionType === "component") {
    return index.componentRecords as unknown as Array<Record<string, unknown>>;
  }

  if (solutionType === "pattern") {
    return index.patternRecords as unknown as Array<Record<string, unknown>>;
  }

  return [];
}

export function inferPreferredCategoriesForSource(
  source: SourceUiNode,
  solutionType: Exclude<SaltSolutionType, "auto" | "token">,
): string[] {
  const categories = new Set<string>();

  if (solutionType === "pattern" && source.scope === "app-structure") {
    categories.add("layout-and-shells");
  }

  switch (source.role) {
    case "navigation":
      categories.add(
        solutionType === "pattern" ? "navigation-and-wayfinding" : "navigation",
      );
      break;
    case "commanding":
    case "action":
      categories.add(
        solutionType === "pattern" ? "actions-and-commands" : "actions",
      );
      break;
    case "overlay":
      categories.add(
        solutionType === "pattern" ? "dialogs-and-overlays" : "overlays",
      );
      break;
    case "data-entry":
      categories.add(
        solutionType === "pattern" ? "forms-and-data-entry" : "inputs",
      );
      break;
    case "selection":
      categories.add(
        solutionType === "pattern"
          ? "selection-and-filtering"
          : "selection-controls",
      );
      break;
    case "data-display":
      categories.add(
        solutionType === "pattern"
          ? "data-display-and-analysis"
          : "data-display-and-visualization",
      );
      break;
  }

  return [...categories];
}

export function buildSourceIntentProfile(
  source: SourceUiNode,
  archetype: UiArchetype,
): SourceIntentProfile {
  const roleTerms = ROLE_HINTS[source.role];
  const scopeTerms = SCOPE_HINTS[source.scope];
  const structuralTerms = getStructuralTerms(source);
  const query = uniquePhrases([
    archetype.label,
    source.kind.replace(/-/g, " "),
    source.role.replace(/-/g, " "),
    source.scope.replace(/-/g, " "),
    source.complexity.replace(/-/g, " "),
    ...source.evidence,
    ...source.matched_sources,
    ...source.notes,
    ...roleTerms,
    ...scopeTerms,
    ...structuralTerms,
  ]).join(" ");

  return {
    query,
    preferred_categories: inferPreferredCategoriesForSource(
      source,
      archetype.solution_type,
    ),
    role_terms: roleTerms,
    scope_terms: scopeTerms,
    structural_terms: structuralTerms,
  };
}

function getSourceSemanticTokens(
  source: SourceUiNode,
  contextualHints: string[] = [],
): string[] {
  return [
    source.kind,
    source.label,
    source.role.replace(/-/g, " "),
    source.scope.replace(/-/g, " "),
    source.complexity.replace(/-/g, " "),
    ...source.evidence,
    ...source.matched_sources,
    ...source.notes,
    ...ROLE_HINTS[source.role],
    ...SCOPE_HINTS[source.scope],
    ...getStructuralTerms(source),
    ...contextualHints,
  ].flatMap(tokenizeText);
}

export function refinePreferredCategoriesForSource(
  index: TranslationSemanticIndex,
  source: SourceUiNode,
  solutionType: Exclude<SaltSolutionType, "auto" | "token">,
  fallbackCategories: string[],
  contextualHints: string[] = [],
): string[] {
  const sourceTokens = [...new Set(getSourceSemanticTokens(source))];
  const contextualTokens = [...new Set(contextualHints.flatMap(tokenizeText))];
  if (sourceTokens.length === 0 && contextualTokens.length === 0) {
    return fallbackCategories;
  }

  const categoryScores = new Map<string, number>();
  const contextualCategoryScores = new Map<string, number>();
  for (const record of getSolutionRecords(index, solutionType)) {
    const signals = extractGuidanceSignals(index, record);
    if (signals.categories.length === 0) {
      continue;
    }

    const guidanceText = buildTargetGuidanceText(index, record, record);
    const targetTokens = new Set(tokenizeText(guidanceText));
    const baseOverlapCount = sourceTokens.reduce(
      (count, token) => count + (targetTokens.has(token) ? 1 : 0),
      0,
    );
    const contextualOverlapCount = contextualTokens.reduce(
      (count, token) => count + (targetTokens.has(token) ? 1 : 0),
      0,
    );
    const overlapCount = baseOverlapCount + contextualOverlapCount * 2;

    if (overlapCount < 2) {
      continue;
    }

    for (const category of signals.categories) {
      categoryScores.set(
        category,
        (categoryScores.get(category) ?? 0) + overlapCount,
      );
      if (contextualOverlapCount > 0) {
        contextualCategoryScores.set(
          category,
          (contextualCategoryScores.get(category) ?? 0) +
            contextualOverlapCount,
        );
      }
    }
  }

  const rankedCategories = [
    ...(contextualCategoryScores.size > 0
      ? contextualCategoryScores.entries()
      : categoryScores.entries()),
  ].sort((left, right) => {
    if (left[1] !== right[1]) {
      return right[1] - left[1];
    }

    return left[0].localeCompare(right[0]);
  });

  if (rankedCategories.length === 0) {
    return fallbackCategories;
  }

  const topScore = rankedCategories[0][1];
  return rankedCategories
    .filter(([, score]) => score === topScore)
    .map(([category]) => category);
}

export function hasPreferredCategoryMatch(
  index: TranslationSemanticIndex,
  preferredCategories: string[],
  record: Record<string, unknown> | null,
  canonicalRecord: Record<string, unknown> | null,
): boolean {
  if (preferredCategories.length === 0) {
    return true;
  }

  const categories = unique([
    ...extractGuidanceSignals(index, record).categories,
    ...extractGuidanceSignals(index, canonicalRecord).categories,
  ]);

  if (categories.length === 0) {
    return true;
  }

  return categories.some((category) => preferredCategories.includes(category));
}

function getMatchedTokenSet(
  sourceTokens: string[],
  values: string[],
): Set<string> {
  const sourceTokenSet = new Set(sourceTokens);
  const matchedTokens = new Set<string>();

  for (const value of values) {
    for (const token of tokenizeText(value)) {
      if (sourceTokenSet.has(token)) {
        matchedTokens.add(token);
      }
    }
  }

  return matchedTokens;
}

function getGuidanceOverlapProfile(
  index: TranslationSemanticIndex,
  sourceTokens: string[],
  record: Record<string, unknown> | null,
  canonicalRecord: Record<string, unknown> | null,
): {
  summaryOverlap: number;
  leadSignalOverlap: number;
  strongSignalOverlap: number;
  notForOverlap: number;
  totalOverlap: number;
  hasRichSemantics: boolean;
} {
  const compactSignals = extractGuidanceSignals(index, record);
  const canonicalSignals = extractGuidanceSignals(index, canonicalRecord);
  const summaryTokens = getMatchedTokenSet(sourceTokens, [
    ...compactSignals.summary,
    ...canonicalSignals.summary,
  ]);
  const aliasTokens = getMatchedTokenSet(sourceTokens, [
    ...compactSignals.aliases,
    ...canonicalSignals.aliases,
  ]);
  const preferredTokens = getMatchedTokenSet(sourceTokens, [
    ...compactSignals.preferredFor,
    ...canonicalSignals.preferredFor,
  ]);
  const relatedPatternTokens = getMatchedTokenSet(sourceTokens, [
    ...compactSignals.relatedPatterns,
    ...canonicalSignals.relatedPatterns,
  ]);
  const buildStepTokens = getMatchedTokenSet(sourceTokens, [
    ...compactSignals.buildSteps,
    ...canonicalSignals.buildSteps,
  ]);
  const componentRoleTokens = getMatchedTokenSet(sourceTokens, [
    ...compactSignals.componentRoles,
    ...canonicalSignals.componentRoles,
  ]);
  const accessibilityTokens = getMatchedTokenSet(sourceTokens, [
    ...compactSignals.accessibility,
    ...canonicalSignals.accessibility,
  ]);
  const categoryTokens = getMatchedTokenSet(sourceTokens, [
    ...compactSignals.categories,
    ...canonicalSignals.categories,
  ]);
  const docTokens = getMatchedTokenSet(sourceTokens, [
    ...compactSignals.docs,
    ...canonicalSignals.docs,
  ]);
  const notForTokens = getMatchedTokenSet(sourceTokens, [
    ...compactSignals.notFor,
    ...canonicalSignals.notFor,
  ]);

  const leadSignalTokens = new Set<string>([
    ...summaryTokens,
    ...aliasTokens,
    ...preferredTokens,
  ]);
  const strongSignalTokens = new Set<string>([
    ...leadSignalTokens,
    ...relatedPatternTokens,
    ...buildStepTokens,
    ...componentRoleTokens,
    ...accessibilityTokens,
  ]);
  const totalTokens = new Set<string>([
    ...strongSignalTokens,
    ...categoryTokens,
    ...docTokens,
  ]);
  const hasRichSemantics =
    compactSignals.preferredFor.length > 0 ||
    canonicalSignals.preferredFor.length > 0 ||
    compactSignals.relatedPatterns.length > 0 ||
    canonicalSignals.relatedPatterns.length > 0 ||
    compactSignals.buildSteps.length > 0 ||
    canonicalSignals.buildSteps.length > 0 ||
    compactSignals.componentRoles.length > 0 ||
    canonicalSignals.componentRoles.length > 0 ||
    compactSignals.accessibility.length > 0 ||
    canonicalSignals.accessibility.length > 0;

  return {
    summaryOverlap: summaryTokens.size,
    leadSignalOverlap: leadSignalTokens.size,
    strongSignalOverlap: strongSignalTokens.size,
    notForOverlap: notForTokens.size,
    totalOverlap: totalTokens.size,
    hasRichSemantics,
  };
}

export function hasSemanticallyAlignedTarget(
  index: TranslationSemanticIndex,
  source: SourceUiNode,
  record: Record<string, unknown> | null,
  canonicalRecord: Record<string, unknown> | null,
  contextualHints: string[] = [],
): boolean {
  if (source.scope === "control") {
    return true;
  }

  const sourceTokens = [
    ...new Set(getSourceSemanticTokens(source, contextualHints)),
  ];
  if (sourceTokens.length === 0) {
    return true;
  }

  const guidanceText = buildTargetGuidanceText(index, record, canonicalRecord);
  const targetTokens = new Set(tokenizeText(guidanceText));
  const overlapCount = sourceTokens.reduce(
    (count, token) => count + (targetTokens.has(token) ? 1 : 0),
    0,
  );

  if (
    source.matched_sources.some((matchedSource) =>
      guidanceText.includes(matchedSource.toLowerCase()),
    )
  ) {
    return true;
  }

  const overlap = getGuidanceOverlapProfile(
    index,
    sourceTokens,
    record,
    canonicalRecord,
  );

  if (
    overlap.notForOverlap > overlap.strongSignalOverlap &&
    overlap.leadSignalOverlap === 0
  ) {
    return false;
  }

  if (source.scope === "app-structure") {
    if (!overlap.hasRichSemantics && overlap.summaryOverlap < 2) {
      return false;
    }

    return (
      overlap.strongSignalOverlap >= 2 ||
      (overlap.leadSignalOverlap >= 1 && overlap.totalOverlap >= 3)
    );
  }

  if (source.scope === "flow" || source.complexity === "multi-part") {
    if (!overlap.hasRichSemantics && overlap.summaryOverlap < 2) {
      return false;
    }

    return (
      overlap.strongSignalOverlap >= 2 ||
      (overlap.leadSignalOverlap >= 1 && overlap.totalOverlap >= 2)
    );
  }

  return overlapCount >= 1;
}

export function getRejectedTargetWhy(
  source: SourceUiNode,
  fallbackWhy: string,
): string {
  if (source.role === "navigation" && source.scope !== "control") {
    return "Structured navigation should resolve to a structured navigation component or pattern, not a single-destination primitive.";
  }

  if (source.scope === "app-structure") {
    return "This app-level structure needs a Salt pattern or component with shell-level guidance before a target can be accepted.";
  }

  if (source.scope === "flow" || source.complexity === "multi-part") {
    return "This multi-part flow needs a Salt pattern or clearer structural guidance before a target can be accepted.";
  }

  return fallbackWhy;
}
