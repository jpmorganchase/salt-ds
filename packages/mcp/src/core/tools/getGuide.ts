import type { GuideRecord, SaltRegistry } from "../types.js";
import {
  type GuideLookupResult,
  resolveGuideIdentifierLookup,
  resolveGuideLookup,
} from "./guideLookup.js";
import { projectLookupRecord } from "./lookupResolver.js";

export interface GetGuideInput {
  name: string;
  view?: "compact" | "full";
}

export interface GetGuideResult {
  guide: Record<string, unknown> | null;
  did_you_mean?: string[];
  ambiguity?: {
    query: string;
    matched_by: "name" | "alias" | "slug" | "content";
    matches: Array<{
      name: string;
      kind: GuideRecord["kind"];
    }>;
  };
}

function toCompactGuide(guide: GuideRecord): Record<string, unknown> {
  const totalSnippets = guide.steps.reduce(
    (sum, step) => sum + step.snippets.length,
    0,
  );
  const snippetLanguages = [
    ...new Set(
      guide.steps.flatMap((step) =>
        step.snippets.map((snippet) => snippet.language),
      ),
    ),
  ].sort();

  const compact: Record<string, unknown> = {
    id: guide.id,
    name: guide.name,
    kind: guide.kind,
    summary: guide.summary,
    packages: guide.packages,
    steps: guide.steps.map((step) => ({
      title: step.title,
      statements: step.statements,
      ...(step.snippets.length > 0
        ? { snippet_count: step.snippets.length }
        : {}),
    })),
    related_docs: guide.related_docs,
  };

  if (totalSnippets > 0) {
    compact.snippet_count = totalSnippets;
    compact.snippet_languages = snippetLanguages;
  }

  return compact;
}

function toGetGuideResult(
  resolution: GuideLookupResult,
  input: GetGuideInput,
): GetGuideResult {
  if (resolution.ambiguity) {
    return {
      guide: null,
      did_you_mean: resolution.ambiguity.matches.map((match) => match.name),
      ambiguity: resolution.ambiguity,
    };
  }

  if (!resolution.candidate) {
    return { guide: null };
  }

  return {
    guide: projectLookupRecord(resolution.candidate, input.view, {
      toCompact: toCompactGuide,
    }),
  };
}

export function getGuide(
  registry: SaltRegistry,
  input: GetGuideInput,
): GetGuideResult {
  return toGetGuideResult(
    resolveGuideLookup(registry.guides, input.name),
    input,
  );
}

export function getGuideByIdentifier(
  registry: SaltRegistry,
  input: GetGuideInput,
): GetGuideResult {
  return toGetGuideResult(
    resolveGuideIdentifierLookup(registry.guides, input.name),
    input,
  );
}
