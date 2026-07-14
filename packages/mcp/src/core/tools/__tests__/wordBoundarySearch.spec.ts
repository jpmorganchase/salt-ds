/**
 * End-to-end TypeScript verification that scoreQueryFields
 * no longer produces false-positive phrase matches.
 */

import { describe, expect, it } from "vitest";
import { type QueryField, scoreQueryFields } from "../consumerSignals.js";
import { containsWholeWordPhrase } from "../utils.js";

describe("containsWholeWordPhrase", () => {
  it("rejects substring-only matches", () => {
    expect(containsWholeWordPhrase("interactable card", "table")).toBe(false);
    expect(containsWholeWordPhrase("selectable option", "table")).toBe(false);
    expect(containsWholeWordPhrase("information about", "form")).toBe(false);
    expect(containsWholeWordPhrase("emphasize content", "size")).toBe(false);
    expect(containsWholeWordPhrase("actionable item", "action")).toBe(false);
    expect(containsWholeWordPhrase("workflow step", "flow")).toBe(false);
    expect(containsWholeWordPhrase("selection control", "select")).toBe(false);
    expect(containsWholeWordPhrase("overlaying component", "overlay")).toBe(
      false,
    );
    expect(containsWholeWordPhrase("tabular data", "tab")).toBe(false);
    expect(containsWholeWordPhrase("toolbar buttons", "tool")).toBe(false);
  });

  it("accepts whole-word matches", () => {
    expect(containsWholeWordPhrase("a data table component", "table")).toBe(
      true,
    );
    expect(containsWholeWordPhrase("fill out the form", "form")).toBe(true);
    expect(containsWholeWordPhrase("adjust the size", "size")).toBe(true);
    expect(containsWholeWordPhrase("primary action button", "action")).toBe(
      true,
    );
    expect(containsWholeWordPhrase("user flow diagram", "flow")).toBe(true);
    expect(containsWholeWordPhrase("select an option", "select")).toBe(true);
    expect(containsWholeWordPhrase("an overlay panel", "overlay")).toBe(true);
    expect(containsWholeWordPhrase("the tab component", "tab")).toBe(true);
  });

  it("handles word boundaries with hyphens and special chars", () => {
    expect(containsWholeWordPhrase("form-field validation", "form")).toBe(true);
    expect(containsWholeWordPhrase("read-only mode", "read")).toBe(true);
    expect(containsWholeWordPhrase("multi-level nav", "level")).toBe(true);
  });

  it("handles edge cases", () => {
    expect(containsWholeWordPhrase("", "table")).toBe(false);
    expect(containsWholeWordPhrase("table", "table")).toBe(true);
    expect(containsWholeWordPhrase("table of contents", "table")).toBe(true);
    expect(containsWholeWordPhrase("a simple table", "table")).toBe(true);
  });
});

describe("scoreQueryFields phrase matching", () => {
  function makeField(key: string, value: string): QueryField {
    return { key, value, phrase_weight: 10, token_weight: 3 };
  }

  it("does not award phrase score for substring-only match", () => {
    const fields = [
      makeField(
        "summary",
        "Card, LinkCard and InteractableCard are visually distinct containers.",
      ),
      makeField("tags", "containers and disclosure selectable card"),
    ];
    const result = scoreQueryFields("table", fields);
    expect(result.match_reasons.filter((r) => r.endsWith("_phrase"))).toEqual(
      [],
    );
  });

  it("awards phrase score for whole-word match", () => {
    const fields = [
      makeField(
        "summary",
        "Table is a basic component for displaying tabular data.",
      ),
    ];
    const result = scoreQueryFields("table", fields);
    expect(result.match_reasons).toContain("summary_phrase");
    expect(result.score).toBeGreaterThanOrEqual(10);
  });

  it("does not match 'form' inside 'information'", () => {
    const fields = [
      makeField(
        "summary",
        "Banner communicates new information, errors or warnings.",
      ),
    ];
    const result = scoreQueryFields("form", fields);
    expect(result.match_reasons.filter((r) => r.endsWith("_phrase"))).toEqual(
      [],
    );
  });

  it("matches 'form' as a whole word", () => {
    const fields = [
      makeField("summary", "Form field wraps an input and provides a label."),
    ];
    const result = scoreQueryFields("form", fields);
    expect(result.match_reasons).toContain("summary_phrase");
  });

  it("does not match 'tab' inside 'InteractableCard' or 'establishing'", () => {
    const fields = [
      makeField("summary", "Button has capability for establishing hierarchy."),
      makeField("when_to_use", "**Interactable cards:** when you need a card"),
    ];
    const result = scoreQueryFields("tab", fields);
    expect(result.match_reasons.filter((r) => r.endsWith("_phrase"))).toEqual(
      [],
    );
  });

  it("does not match 'select' inside 'selection-controls'", () => {
    const fields = [makeField("tags", "selection-controls checkbox tickbox")];
    const result = scoreQueryFields("select", fields);
    expect(result.match_reasons.filter((r) => r.endsWith("_phrase"))).toEqual(
      [],
    );
  });

  it("does not match 'flow' inside 'workflow'", () => {
    const fields = [
      makeField(
        "summary",
        "Banner communicates information relevant to a workflow.",
      ),
    ];
    const result = scoreQueryFields("flow", fields);
    expect(result.match_reasons.filter((r) => r.endsWith("_phrase"))).toEqual(
      [],
    );
  });

  it("does not match 'bar' inside 'sidebar'", () => {
    const fields = [
      makeField("when_to_use", "Use as a sidebar navigation or form."),
    ];
    const result = scoreQueryFields("bar", fields);
    expect(result.match_reasons.filter((r) => r.endsWith("_phrase"))).toEqual(
      [],
    );
  });

  it("token matching still works via field token set", () => {
    const fields = [makeField("tags", "containers disclosure card layout")];
    const result = scoreQueryFields("card", fields);
    // "card" appears as a whole word in the field, so it matches as a phrase.
    // With B1 fix, phrase and token scoring are mutually exclusive per field —
    // phrase takes priority over token scoring.
    expect(result.match_reasons).toContain("tags_phrase");
    expect(result.score).toBeGreaterThanOrEqual(10);
  });

  it("token matching fires when phrase does not match", () => {
    // A multi-token query where the full phrase doesn't appear but individual tokens do
    const fields = [makeField("tags", "containers disclosure card layout")];
    const result = scoreQueryFields("card button", fields);
    // "card button" as a phrase won't match, so token scoring fires
    expect(result.matched_terms).toContain("card");
    expect(result.match_reasons).toContain("tags_tokens");
  });
});
