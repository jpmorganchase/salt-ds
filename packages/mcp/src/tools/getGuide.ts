import type { GuideRecord, SaltRegistry } from "../types.js";
import { resolveGuideLookup } from "./guideLookup.js";
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
    matched_by: "name" | "alias";
    matches: Array<{
      name: string;
      kind: GuideRecord["kind"];
    }>;
  };
}

function toCompactGuide(guide: GuideRecord): Record<string, unknown> {
  return {
    id: guide.id,
    name: guide.name,
    kind: guide.kind,
    summary: guide.summary,
    packages: guide.packages,
    steps: guide.steps.map((step) => ({
      title: step.title,
      statements: step.statements,
    })),
    related_docs: guide.related_docs,
  };
}

export function getGuide(
  registry: SaltRegistry,
  input: GetGuideInput,
): GetGuideResult {
  const resolution = resolveGuideLookup(registry.guides, input.name);

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
