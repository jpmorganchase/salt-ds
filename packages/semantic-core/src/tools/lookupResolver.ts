interface LookupAmbiguity<MatchedBy extends string, Match> {
  query: string;
  matched_by: MatchedBy;
  matches: Match[];
}

interface LookupMatchGroup<Item, MatchedBy extends string, Match> {
  matchedBy: MatchedBy;
  matches: Item[];
  toAmbiguityMatch: (item: Item) => Match;
  ambiguityWhen?: "always" | "if_unresolved";
}

interface LookupResolution<Item, MatchedBy extends string, Match> {
  candidate: Item | null;
  ambiguity?: LookupAmbiguity<MatchedBy, Match>;
}

export function resolveLookup<Item, MatchedBy extends string, Match>(
  query: string,
  groups: ReadonlyArray<LookupMatchGroup<Item, MatchedBy, Match>>,
): LookupResolution<Item, MatchedBy, Match> {
  let candidate: Item | null = null;

  for (const group of groups) {
    if (
      group.matches.length > 1 &&
      (group.ambiguityWhen !== "if_unresolved" || candidate === null)
    ) {
      return {
        candidate: null,
        ambiguity: {
          query,
          matched_by: group.matchedBy,
          matches: group.matches.map(group.toAmbiguityMatch),
        },
      };
    }

    if (candidate === null && group.matches.length === 1) {
      candidate = group.matches[0];
    }
  }

  return { candidate };
}

export function projectLookupRecord<Item>(
  candidate: Item,
  view: "compact" | "full" | undefined,
  options: {
    toCompact: (item: Item) => Record<string, unknown>;
    toFull?: (item: Item) => Record<string, unknown>;
  },
): Record<string, unknown> {
  if (view === "full") {
    return options.toFull
      ? options.toFull(candidate)
      : (candidate as unknown as Record<string, unknown>);
  }

  return options.toCompact(candidate);
}
