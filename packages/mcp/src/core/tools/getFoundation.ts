import type { PageRecord, SaltRegistry } from "../types.js";
import {
  getFoundationSuggestedFollowUps,
  type SuggestedFollowUp,
} from "./consumerPresentation.js";
import { projectLookupRecord } from "./lookupResolver.js";
import { resolvePageLookup } from "./pageLookup.js";
import {
  createFoundationStarterCode,
  type StarterCodeSnippet,
} from "./starterCode.js";

export interface GetFoundationInput {
  name: string;
  include_starter_code?: boolean;
  view?: "compact" | "full";
}

export interface GetFoundationResult {
  foundation: Record<string, unknown> | null;
  starter_code?: StarterCodeSnippet[];
  suggested_follow_ups?: SuggestedFollowUp[];
  next_step?: string;
  did_you_mean?: string[];
  ambiguity?: {
    query: string;
    matched_by: "title" | "route" | "slug";
    matches: Array<{
      title: string;
      route: string;
      page_kind: PageRecord["page_kind"];
    }>;
  };
}

function getFoundationNextStep(page: PageRecord): string {
  return `Apply the ${page.title.toLowerCase()} guidance to the current layout or component.`;
}

function toCompactFoundation(page: PageRecord): Record<string, unknown> {
  return {
    title: page.title,
    summary: page.summary,
    topics: page.section_headings.slice(0, 6),
    guidance: page.content.slice(0, 3),
    docs: [page.route],
    next_step: getFoundationNextStep(page),
  };
}

function toFullFoundation(page: PageRecord): Record<string, unknown> {
  return {
    ...page,
    next_step: getFoundationNextStep(page),
  };
}

export function getFoundation(
  registry: SaltRegistry,
  input: GetFoundationInput,
): GetFoundationResult {
  const foundations = registry.pages.filter(
    (page) => page.page_kind === "foundation",
  );
  const resolution = resolvePageLookup(foundations, input.name);

  if (resolution.ambiguity) {
    return {
      foundation: null,
      next_step:
        "Choose one of the suggested foundation pages and retry with the exact title or slug.",
      did_you_mean: resolution.ambiguity.matches.map((match) => match.title),
      ambiguity: resolution.ambiguity,
    };
  }

  if (!resolution.candidate) {
    return { foundation: null };
  }

  return {
    foundation: projectLookupRecord(resolution.candidate, input.view, {
      toCompact: toCompactFoundation,
      toFull: toFullFoundation,
    }),
    starter_code: input.include_starter_code
      ? createFoundationStarterCode(resolution.candidate)
      : undefined,
    suggested_follow_ups: getFoundationSuggestedFollowUps(resolution.candidate),
    next_step: getFoundationNextStep(resolution.candidate),
  };
}
