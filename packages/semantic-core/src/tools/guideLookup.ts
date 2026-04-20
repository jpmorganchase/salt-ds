import { ENGLISH_FUNCTION_WORDS } from "../search/englishFunctionWords.js";
import type { GuideRecord } from "../types.js";
import { resolveLookup } from "./lookupResolver.js";
import { containsWholeWordPhrase, stemToken } from "./utils.js";

export interface GuideLookupAmbiguity {
  query: string;
  matched_by: "name" | "alias" | "content";
  matches: Array<{
    name: string;
    kind: GuideRecord["kind"];
  }>;
}

export interface GuideLookupResult {
  candidate: GuideRecord | null;
  ambiguity?: GuideLookupAmbiguity;
}

export function normalizeGuideLookup(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getGuideOverviewSlug(guide: GuideRecord): string | null {
  const overview = guide.related_docs.overview;
  if (!overview) {
    return null;
  }

  const parts = overview.split("/").filter((part) => part.length > 0);
  return parts.at(-1) ?? null;
}

export function findGuideByIdentifier(
  guides: GuideRecord[],
  identifier: string,
): GuideRecord | null {
  const normalizedIdentifier = normalizeGuideLookup(identifier);

  return (
    guides.find((guide) => {
      if (normalizeGuideLookup(guide.name) === normalizedIdentifier) {
        return true;
      }

      if (
        guide.aliases.some(
          (alias) => normalizeGuideLookup(alias) === normalizedIdentifier,
        )
      ) {
        return true;
      }

      const overviewSlug = getGuideOverviewSlug(guide);
      return overviewSlug
        ? normalizeGuideLookup(overviewSlug) === normalizedIdentifier
        : false;
    }) ?? null
  );
}

function tokenizeGuideLookup(value: string): string[] {
  return normalizeGuideLookup(value)
    .split("-")
    .filter((token) => token.length > 1 && !ENGLISH_FUNCTION_WORDS.has(token));
}

function collectGuideSearchFields(guide: GuideRecord) {
  return {
    name: normalizeGuideLookup(guide.name),
    aliases: guide.aliases.map(normalizeGuideLookup),
    summary: normalizeGuideLookup(guide.summary),
    stepTitles: guide.steps.map((step) => normalizeGuideLookup(step.title)),
    stepStatements: guide.steps.flatMap((step) =>
      step.statements.map(normalizeGuideLookup),
    ),
  };
}

function scoreGuideContentMatch(
  guide: GuideRecord,
  normalizedQuery: string,
  queryTokens: string[],
): number {
  const fields = collectGuideSearchFields(guide);
  const allText = [
    fields.name,
    ...fields.aliases,
    fields.summary,
    ...fields.stepTitles,
    ...fields.stepStatements,
  ].join(" ");
  const stemmedAllText = allText
    .toLowerCase()
    .split(/[^a-z0-9-]+/)
    .map(stemToken)
    .join(" ");

  if (
    queryTokens.length > 0 &&
    queryTokens.some(
      (token) =>
        !containsWholeWordPhrase(allText, token) &&
        !containsWholeWordPhrase(stemmedAllText, token),
    )
  ) {
    return 0;
  }

  let score = 0;

  const stemField = (text: string): string =>
    text
      .toLowerCase()
      .split(/[^a-z0-9-]+/)
      .map(stemToken)
      .join(" ");

  const matchesPhrase = (text: string, phrase: string): boolean =>
    containsWholeWordPhrase(text, phrase) ||
    containsWholeWordPhrase(stemField(text), phrase);

  if (matchesPhrase(fields.name, normalizedQuery)) {
    score += 24;
  }
  if (fields.aliases.some((alias) => matchesPhrase(alias, normalizedQuery))) {
    score += 18;
  }
  if (
    fields.stepTitles.some((stepTitle) =>
      matchesPhrase(stepTitle, normalizedQuery),
    )
  ) {
    score += 16;
  }
  if (matchesPhrase(fields.summary, normalizedQuery)) {
    score += 12;
  }
  if (
    fields.stepStatements.some((statement) =>
      matchesPhrase(statement, normalizedQuery),
    )
  ) {
    score += 8;
  }

  for (const token of queryTokens) {
    if (matchesPhrase(fields.name, token)) {
      score += 5;
    }
    if (fields.aliases.some((alias) => matchesPhrase(alias, token))) {
      score += 4;
    }
    if (
      fields.stepTitles.some((stepTitle) => matchesPhrase(stepTitle, token))
    ) {
      score += 4;
    }
    if (matchesPhrase(fields.summary, token)) {
      score += 3;
    }
    if (
      fields.stepStatements.some((statement) => matchesPhrase(statement, token))
    ) {
      score += 1;
    }
  }

  return score;
}

export function resolveGuideLookup(
  guides: GuideRecord[],
  query: string,
): GuideLookupResult {
  const normalizedName = normalizeGuideLookup(query);
  const nameMatches = guides.filter(
    (guide) => normalizeGuideLookup(guide.name) === normalizedName,
  );
  const aliasMatches = guides.filter((guide) =>
    guide.aliases.some(
      (alias) => normalizeGuideLookup(alias) === normalizedName,
    ),
  );

  const resolved = resolveLookup(query, [
    {
      matchedBy: "name" as const,
      matches: nameMatches,
      toAmbiguityMatch: (guide: GuideRecord) => ({
        name: guide.name,
        kind: guide.kind,
      }),
    },
    {
      matchedBy: "alias" as const,
      matches: aliasMatches,
      ambiguityWhen: "if_unresolved",
      toAmbiguityMatch: (guide: GuideRecord) => ({
        name: guide.name,
        kind: guide.kind,
      }),
    },
  ]);

  if (resolved.candidate || resolved.ambiguity) {
    return resolved;
  }

  const queryTokens = tokenizeGuideLookup(query);
  const rankedMatches = guides
    .map((guide) => ({
      guide,
      score: scoreGuideContentMatch(guide, normalizedName, queryTokens),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }
      return left.guide.name.localeCompare(right.guide.name);
    });

  if (rankedMatches.length === 0) {
    return { candidate: null };
  }

  if (
    rankedMatches.length > 1 &&
    rankedMatches[0].score === rankedMatches[1].score
  ) {
    return {
      candidate: null,
      ambiguity: {
        query,
        matched_by: "content",
        matches: rankedMatches
          .filter((entry) => entry.score === rankedMatches[0].score)
          .map((entry) => ({
            name: entry.guide.name,
            kind: entry.guide.kind,
          })),
      },
    };
  }

  return {
    candidate: rankedMatches[0].guide,
  };
}
