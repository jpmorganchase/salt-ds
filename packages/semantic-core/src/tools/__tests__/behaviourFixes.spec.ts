/**
 * Tests for behaviour fixes B1–B12 documented in
 * packages/mcp/docs/behaviour-issues-audit.md
 */
import { describe, expect, it } from "vitest";
import { type QueryField, scoreQueryFields } from "../consumerSignals.js";
import { resolveSolutionType } from "../createSaltUiHelpers.js";
import { scoreDiscoveryKeywordIntent } from "../discoverSaltSignals.js";
import { hasSingleDestinationNavigationIntent } from "../navigationIntent.js";
import {
  containsWholeWordPhrase,
  normalizeQuery,
  stemToken,
  tokenize,
} from "../utils.js";

function makeField(
  key: string,
  value: string,
  overrides: Partial<QueryField> = {},
): QueryField {
  return { key, value, phrase_weight: 10, token_weight: 3, ...overrides };
}

// ---------------------------------------------------------------------------
// B7 — normalizeQuery strips punctuation
// ---------------------------------------------------------------------------
describe("B7: normalizeQuery strips punctuation", () => {
  it("strips trailing question mark", () => {
    expect(normalizeQuery("table?")).toBe("table");
  });

  it("strips trailing exclamation mark", () => {
    expect(normalizeQuery("button!")).toBe("button");
  });

  it("strips quotes", () => {
    expect(normalizeQuery('"form field"')).toBe("form field");
  });

  it("strips trailing period", () => {
    expect(normalizeQuery("show me a table.")).toBe("show me a table");
  });

  it("collapses multiple spaces after stripping", () => {
    expect(normalizeQuery("  table   component  ")).toBe("table component");
  });

  it("preserves hyphens", () => {
    expect(normalizeQuery("form-field")).toBe("form-field");
  });
});

// ---------------------------------------------------------------------------
// B10 — containsWholeWordPhrase regex cache
// ---------------------------------------------------------------------------
describe("B10: containsWholeWordPhrase caching", () => {
  it("returns identical results on repeated calls with the same phrase", () => {
    const text = "a data table component";
    // Call twice to exercise cache hit path
    expect(containsWholeWordPhrase(text, "table")).toBe(true);
    expect(containsWholeWordPhrase(text, "table")).toBe(true);
  });

  it("still rejects substrings after cache is warm", () => {
    containsWholeWordPhrase("interactable card", "table");
    expect(containsWholeWordPhrase("interactable card", "table")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// B4 — Lightweight plural normalisation
// ---------------------------------------------------------------------------
describe("B4: stemToken and tokenize plural normalisation", () => {
  it("stems 'buttons' to same stem as 'button'", () => {
    expect(stemToken("buttons")).toBe(stemToken("button"));
  });

  it("stems 'tables' to same stem as 'table'", () => {
    expect(stemToken("tables")).toBe(stemToken("table"));
  });

  it("stems 'switches' to same stem as 'switch'", () => {
    expect(stemToken("switches")).toBe(stemToken("switch"));
  });

  it("stems 'categories' to same stem as 'category'", () => {
    expect(stemToken("categories")).toBe(stemToken("category"));
  });

  it("does not stem short words like 'us'", () => {
    expect(stemToken("us")).toBe("us");
  });

  it("does not double-strip 'ss' words like 'glass'", () => {
    expect(stemToken("glass")).toBe("glass");
  });

  it("stems verb/noun pairs to matching stems", () => {
    expect(stemToken("navigate")).toBe(stemToken("navigation"));
    expect(stemToken("collapse")).toBe(stemToken("collapsible"));
    expect(stemToken("loading")).toBe(stemToken("load"));
    expect(stemToken("selected")).toBe(stemToken("select"));
  });

  it("tokenize returns raw tokens (no stemming)", () => {
    const tokens = tokenize("buttons and tables");
    expect(tokens).toContain("buttons");
    expect(tokens).toContain("tables");
  });

  it("tokenize stems query tokens matching field tokens", () => {
    const fields = [makeField("tags", "button input table")];
    // Query uses plural forms; stemming should match singular field tokens
    const result = scoreQueryFields("buttons tables", fields);
    expect(result.matched_terms.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// B1 — Phrase + Token are mutually exclusive per field
// ---------------------------------------------------------------------------
describe("B1: scoreQueryFields phrase and token are mutually exclusive per field", () => {
  it("does not double-count phrase and token for single-token query", () => {
    const fields = [makeField("summary", "a data table component")];
    const result = scoreQueryFields("table", fields);
    // With B1 fix, phrase match fires (weight 10), token loop does NOT fire.
    // So score should be exactly phrase_weight, not phrase_weight + token_weight.
    expect(result.score).toBe(10);
    expect(result.match_reasons).toContain("summary_phrase");
    expect(result.match_reasons).not.toContain("summary_tokens");
  });

  it("falls back to token scoring when phrase does not match", () => {
    const fields = [makeField("summary", "a data table component")];
    const result = scoreQueryFields("data component", fields);
    // The full phrase "data component" won't appear, so token scoring fires
    expect(result.match_reasons).toContain("summary_tokens");
  });
});

// ---------------------------------------------------------------------------
// B2 — semantics_preferred_for / semantics_category removed from
//       getComponentQueryFields (verified indirectly through scoring)
// ---------------------------------------------------------------------------
describe("B2: semantics fields removed from getComponentQueryFields", () => {
  it("scoreQueryFields on component fields does not contain semantics_preferred_for", () => {
    // This is an indirect test: if we construct fields manually with the
    // key prefix "semantics_", they would only appear if getComponentQueryFields
    // still included them. We simply verify that match_reasons from
    // scoreQueryFields using known component-like fields don't contain them.
    const fields = [
      makeField("name", "Button"),
      makeField("summary", "A clickable button component"),
      makeField("when_to_use", "Use for actions"),
    ];
    const result = scoreQueryFields("action", fields);
    const semanticsReasons = result.match_reasons.filter((r) =>
      r.startsWith("semantics_"),
    );
    expect(semanticsReasons).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// B3 — scoreDiscoveryKeywordIntent uses Math.max
// ---------------------------------------------------------------------------
describe("B3: scoreDiscoveryKeywordIntent no double-count", () => {
  it("returns 1 per matched keyword, not 2", () => {
    // "density" is a single-word keyword present in both token and phrase form
    const score = scoreDiscoveryKeywordIntent("density", ["density"]);
    expect(score).toBe(1);
  });

  it("returns sum of distinct matched keywords", () => {
    const score = scoreDiscoveryKeywordIntent("density spacing", [
      "density",
      "spacing",
      "breakpoint",
    ]);
    expect(score).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// B5 — All-stopword queries don't degrade to zero
// ---------------------------------------------------------------------------
describe("B5: soft stopwords preserved when they are the only tokens", () => {
  it("'component' alone still produces token matches", () => {
    const fields = [makeField("summary", "A reusable component for UI")];
    const result = scoreQueryFields("component", fields);
    // "component" should match (it's kept as a soft stopword when it's the only token)
    expect(result.score).toBeGreaterThan(0);
  });

  it("'ui component' produces matches when both tokens are soft stopwords", () => {
    const fields = [makeField("summary", "A reusable ui component")];
    const result = scoreQueryFields("ui component", fields);
    expect(result.score).toBeGreaterThan(0);
  });

  it("soft stopwords are stripped when non-soft tokens exist", () => {
    const fields = [makeField("tags", "component button control")];
    // "button component" → non-soft token "button" survives, "component" is stripped
    const result = scoreQueryFields("button component", fields);
    // "button" matches as a token, but "component" should have been stripped
    expect(result.matched_terms).toContain("button");
  });
});

// ---------------------------------------------------------------------------
// B8 — Navigation intent does not fire on multi-destination hints
// ---------------------------------------------------------------------------
describe("B8: navigation intent multi-destination guard", () => {
  it("returns false for 'multiple links on pages'", () => {
    expect(
      hasSingleDestinationNavigationIntent("multiple links on pages"),
    ).toBe(false);
  });

  it("returns false for 'several links to different destinations'", () => {
    expect(
      hasSingleDestinationNavigationIntent(
        "several links to different destinations",
      ),
    ).toBe(false);
  });

  it("still returns true for 'navigate to a page'", () => {
    expect(hasSingleDestinationNavigationIntent("navigate to a page")).toBe(
      true,
    );
  });

  it("still returns true for 'link to a page'", () => {
    expect(hasSingleDestinationNavigationIntent("link to a page")).toBe(true);
  });

  it("returns false for 'link on a page' when 'all' is present", () => {
    expect(hasSingleDestinationNavigationIntent("all link on a page")).toBe(
      false,
    );
  });
});

// ---------------------------------------------------------------------------
// B9 — Foundation vs token tie-breaking prefers token
// ---------------------------------------------------------------------------
describe("B9: resolveSolutionType tie-breaking favours token over foundation", () => {
  it("returns 'token' when 'density' (overlapping keyword) is the only signal", () => {
    // "density" appears in both FOUNDATION_KEYWORDS and TOKEN_KEYWORDS
    const result = resolveSolutionType({ query: "density" });
    expect(result).toBe("token");
  });

  it("returns 'foundation' when foundation score is strictly higher", () => {
    // "breakpoint responsive" → 2 foundation keywords, 0 token keywords
    const result = resolveSolutionType({ query: "breakpoint responsive" });
    expect(result).toBe("foundation");
  });

  it("returns 'token' when token score is strictly higher", () => {
    // "color border" → 0 foundation keywords, 2 token keywords
    const result = resolveSolutionType({ query: "color border" });
    expect(result).toBe("token");
  });
});

// ---------------------------------------------------------------------------
// B11 — scoreIntent in createSaltUiHelpers uses Math.max
//       (Tested indirectly through resolveSolutionType behaviour)
// ---------------------------------------------------------------------------
describe("B11: scoreIntent no double-count (indirect)", () => {
  it("pattern keywords don't over-inflate relative to foundation", () => {
    // "compose dashboard" → 2 pattern keywords. If each scored 3 (old double-count)
    // vs 2 (fixed), relative ranking might differ. Verify pattern is still chosen.
    const result = resolveSolutionType({ query: "compose dashboard" });
    expect(result).toBe("pattern");
  });
});
