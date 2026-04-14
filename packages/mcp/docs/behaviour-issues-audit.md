# Behaviour Issues Audit — semantic-core Scoring & Workflow Logic

Audit date: 2026-04-13

This document catalogues concrete behaviour issues found in `packages/semantic-core/src/tools` that go beyond the substring false-positive problem already fixed in `containsWholeWordPhrase`.

---

## Contents

- [B1: Phrase + Token Double-Count in scoreQueryFields](#b1-phrase--token-double-count-in-scorequeryfields)
- [B2: when_to_use / semantics_preferred_for Triple-Scoring](#b2-when_to_use--semantics_preferred_for-triple-scoring)
- [B3: scoreDiscoveryKeywordIntent Double-Count for Single-Word Keywords](#b3-scorediscoverykeywordintent-double-count-for-single-word-keywords)
- [B4: No Stemming Causes Pluralisation Mismatches](#b4-no-stemming-causes-pluralisation-mismatches)
- [B5: All-Stopword Queries Silently Degrade to Phrase-Only Matching](#b5-all-stopword-queries-silently-degrade-to-phrase-only-matching)
- [B6: compareOptions Discards Resolved Items When Any Name Is Unresolved](#b6-compareoptions-discards-resolved-items-when-any-name-is-unresolved)
- [B7: normalizeQuery Does Not Strip Punctuation](#b7-normalizequery-does-not-strip-punctuation)
- [B8: Navigation Intent Heuristic Fires on Ambiguous Single Words](#b8-navigation-intent-heuristic-fires-on-ambiguous-single-words)
- [B9: Foundation vs Token Score Tie-Breaking Favours Foundation](#b9-foundation-vs-token-score-tie-breaking-favours-foundation)
- [B10: Regex Compilation per containsWholeWordPhrase Call](#b10-regex-compilation-per-containswholewordphrase-call)
- [B11: scoreIntent Double-Count in createSaltUiHelpers](#b11-scoreintent-double-count-in-createsaltuihelpers)
- [B12: WEAK_SINGLE_TOKEN_ALIASES Bypass Only Covers Alias Path](#b12-weak_single_token_aliases-bypass-only-covers-alias-path)

---

## B1: Phrase + Token Double-Count in scoreQueryFields

**File:** `consumerSignals.ts` — `scoreQueryFields` (lines 94–144)

**Issue:** For any single-token query that matches a field, both the phrase branch and the token loop fire, awarding `phrase_weight + token_weight`. The phrase check (`containsWholeWordPhrase`) and the token check (`fieldTokens.has(token)`) are independent — there is no `else` between them.

**Example:**
- Query `"table"`, field value `"data table component"`.
- `containsWholeWordPhrase` → true → `+phrase_weight`
- Token loop: `fieldTokens.has("table")` → true → `+token_weight`
- Effective score: `phrase_weight + token_weight` instead of `max(phrase_weight, token_weight)`.

**Impact:** Scores are inflated. Because the inflation is consistent across all fields and all components, relative ranking is mostly preserved — but it makes absolute score thresholds unreliable and complicates tuning. If a future field is added where phrase_weight and token_weight have different ratios, relative ranking could also be affected.

**Suggested fix:** Gate the token loop with an `else` against the phrase/exact branch for the same field, or treat phrase weight as inclusive of token weight.

---

## B2: when_to_use / semantics_preferred_for Triple-Scoring

**File:** `consumerSignals.ts` — `getComponentQueryFields` (lines 368–449) + `scoreUsageSemantics` (lines 146–192)

**Issue:** `when_to_use` text is scored three times:

1. **`getComponentQueryFields` → `when_to_use` field** (phrase_weight: 9, token_weight: 4)
2. **`getComponentQueryFields` → `semantics_preferred_for` field** (phrase_weight: 10, token_weight: 4) — this is `component.semantics.preferred_for` which is the *same text* as `when_to_use` for all 72 current components
3. **`scoreUsageSemantics`** called separately in `recommendComponent` (phrase_weight: 10, token_weight: 4) — again reads `semantics.preferred_for`

Verified empirically: all 72 components have `semantics.preferred_for === when_to_use`.

**Impact:** Same relative inflation for all components (no ranking distortion today). However, if a component is added where `semantics.preferred_for` differs from `when_to_use`, it would get a *lower* multiplier than components where they're identical — the opposite of the intended design.

**Suggested fix:** Either:
- Remove `semantics_preferred_for` and `semantics_category` from `getComponentQueryFields` (since they're already scored via `scoreUsageSemantics`), or
- Remove the `scoreUsageSemantics` call from `recommendComponent` and keep only the field-level scoring.

---

## B3: scoreDiscoveryKeywordIntent Double-Count for Single-Word Keywords

**File:** `discoverSaltSignals.ts` — `scoreDiscoveryKeywordIntent` (lines 63–79)

**Issue:** For every keyword, it adds **both** `tokenScore` (does `queryTokens.has(keyword)`) **and** `phraseScore` (does `containsWholeWordPhrase(query, keyword)`). For any single-word keyword present in the query, both checks pass, so the score is 2 instead of 1.

Since all discovery keywords are single words, every matched keyword scores 2. This is consistent, but it means the returned score is always even (for pure token matches), which makes the threshold comparisons in `discoverSalt.ts` less intuitive.

**Impact:** Low — all keywords are single-word so the doubling is uniform. But it obscures the intent of the scoring.

**Suggested fix:** Use `Math.max(tokenScore, phraseScore)` per keyword, or simply keep only the `containsWholeWordPhrase` check (which already handles the single-word case).

---

## B4: No Stemming Causes Pluralisation Mismatches

**File:** `utils.ts` — `tokenize` (line 19)

**Issue:** No stemming or lemmatisation is applied. `"button"` does not match `"buttons"`, `"table"` does not match `"tables"`, `"filter"` does not match `"filtering"`, etc.

Both the token set matching (`Set.has()`) and the phrase matching (`containsWholeWordPhrase` with word boundaries) are exact. A user asking for "buttons" won't match a field that only says "button".

**Impact:** Medium. Common plurals like `"tabs"`, `"buttons"`, `"tables"`, `"charts"` in user queries won't match singular field values (or vice versa). This can cause genuine misses.

**Suggested fix:** Add lightweight plural normalisation (strip trailing `s`/`es` from both query and field tokens) or use a minimal stemmer. Alternatively, keep the keyword lists curated with both forms as is partially done in `FOUNDATION_DISCOVERY_KEYWORDS` (`"breakpoint"` + `"breakpoints"`).

---

## B5: All-Stopword Queries Silently Degrade to Phrase-Only Matching

**File:** `consumerSignals.ts` — `scoreQueryFields` (lines 102–104)

**Issue:** When all query tokens are stopwords (e.g. `"component for ui"`), the filtered `queryTokens` array is empty. The token loop does nothing. Only the phrase check can produce a score.

This means:
- `"component for ui"` → tokens after stopword filtering: `[]` → no token matches, only phrase match possible
- `"component"` alone → also stopword-filtered to `[]`

The phrase check (`containsWholeWordPhrase(normalizedValue, query)`) uses the *full normalised query* (not the filtered tokens), so it still works — but only if the *entire* query string appears as a phrase in a field value. For `"component for ui"` this is unlikely to match.

**Impact:** Low (most real queries contain at least one non-stopword), but edge-case queries like `"ui component"`, `"component for the ui"` produce surprisingly weak scores.

**Suggested fix:** Consider not stripping `"component"` and `"ui"` from stopwords, or only strip them when other non-stopword tokens exist.

---

## B6: compareOptions Discards Resolved Items When Any Name Is Unresolved

**File:** `compareOptions.ts` — lines 142–149 (patterns) and 284–291 (components)

**Issue:** When comparing e.g. `["Button", "FooBar"]` where `"FooBar"` doesn't resolve:

```typescript
// Lines 284–291:
if (unresolvedNames.length > 0) {
  return {
    option_type: "component",
    compared: [],                     // <-- throws away resolved components
    unresolved_names: unresolvedNames,
    next_step: getNoComparisonNextStep("component"),
  };
}
```

The successfully resolved `"Button"` data is computed (including its presentation and ship check) but then discarded. The caller gets `compared: []` with no information about what *did* resolve.

**Impact:** Medium. A comparison with one typo discards all useful work. The host gets no partial results and no indication of which names were valid.

**Suggested fix:** Return the resolved items in `compared` alongside `unresolved_names`, or return the resolved items in a separate `resolved` field.

---

## B7: normalizeQuery Does Not Strip Punctuation

**File:** `utils.ts` — `normalizeQuery` (line 15)

**Issue:** `normalizeQuery` only does `trim().toLowerCase()`. Punctuation like `?`, `!`, `"` and trailing periods remain. This means:
- `"table?"` → `"table?"` (not `"table"`)
- The exact match check `normalizeQuery(component.name) === query` will fail for `"table?"` vs `"table"`
- `containsWholeWordPhrase("table", "table?")` will treat `?` as a literal regex-escaped character

The `tokenize` function *does* strip non-alphanumeric characters (except hyphens), so token matching is unaffected. But the phrase/exact pathways use `normalizeQuery` output directly.

**Impact:** Low-medium. Queries with trailing punctuation (common from natural-language prompts) won't get exact-match or phrase-match bonuses they should get.

**Suggested fix:** Add punctuation stripping to `normalizeQuery`, e.g. `.replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, " ").trim()`.

---

## B8: Navigation Intent Heuristic Fires on Ambiguous Single Words

**File:** `navigationIntent.ts` — `hasSingleDestinationNavigationIntent` (lines 18–39)

**Issue:** The final fallback check (line 38) is:
```typescript
return DIRECT_NAVIGATION_HINT.test(query) && SINGLE_TARGET_HINT.test(query);
```

`DIRECT_NAVIGATION_HINT` matches `"link"` and `SINGLE_TARGET_HINT` matches `"page"`. So a query like `"link on a page"` triggers single-destination navigation intent, even though it could be a general layout question. Similarly, `"route to a screen"` triggers it.

The `STRUCTURED_NAVIGATION_HINT` blocklist catches `"tabs"` and `"sidebar"` but doesn't cover all multi-destination cases (e.g. `"navigation menu with links to multiple pages"`).

**Impact:** Medium. The navigation adjustment adds up to +60 points (`+28 + +8 + +24`) to link-like components and subtracts up to −78 from structured-nav components. A false positive here can dramatically distort rankings.

**Suggested fix:** Add a multi-destination counter-hint (e.g. `"multiple"`, `"several"`, `"links"` (plural)) and require stronger phrasing for the fallback path.

---

## B9: Foundation vs Token Score Tie-Breaking Favours Foundation

**File:** `createSaltUiHelpers.ts` — `resolveSolutionType` (lines 106–125)

**Issue:** The tie-breaking logic is:
```typescript
if (foundationScore > 0 && foundationScore >= tokenScore && foundationScore > patternScore) {
  return "foundation";
}
if (tokenScore > 0 && tokenScore >= foundationScore && tokenScore > patternScore) {
  return "token";
}
```

When `foundationScore === tokenScore` and both are > 0 and > patternScore, the `>=` in the first condition means **foundation always wins**. This is because:
- First check: `foundationScore >= tokenScore` → true (they're equal)
- Returns `"foundation"` without reaching the token check

The keyword lists overlap — `"density"` appears in both `FOUNDATION_KEYWORDS` and `TOKEN_KEYWORDS`. A query containing just `"density"` will score equally on both, but always routes to `"foundation"`.

**Impact:** Low — the overlap is small (only `"density"` currently), but the asymmetric tie-breaking is likely unintentional.

**Suggested fix:** Either make the tie-breaking explicit and documented, or use `>` instead of `>=` in the first check and add a true tie-break fallback (e.g. prefer token when the query also contains token-specific terms).

---

## B10: Regex Compilation per containsWholeWordPhrase Call

**File:** `utils.ts` — `containsWholeWordPhrase` (lines 37–40)

**Issue:** A new `RegExp` is compiled on every call. This function is called thousands of times during a single recommendation pass (once per field per component per query token for phrase checks, plus usage semantics).

**Impact:** Performance only — no correctness issue. For a registry of 72 components × ~10 fields × multiple tokens, this is hundreds of regex compilations per query.

**Suggested fix:** Cache compiled regexes by phrase (e.g. via a `Map<string, RegExp>`) or use a string-based search with boundary checking instead of regex.

---

## B11: scoreIntent Double-Count in createSaltUiHelpers

**File:** `createSaltUiHelpers.ts` — `scoreIntent` (lines 70–79)

**Issue:** Same pattern as B3: `queryTokens.has(keyword)` and `containsWholeWordPhrase(query, keyword)` are summed independently. For single-word keywords (all of them), both always match when the keyword is present, giving `2 + 1 = 3` instead of a clean `2` or `3`.

**Impact:** Low — consistent doubling. But the magic number 3 per keyword makes threshold reasoning harder.

**Suggested fix:** Same as B3 — use `Math.max` or a single check.

---

## B12: WEAK_SINGLE_TOKEN_ALIASES Bypass Only Covers Alias Path

**File:** `recommendComponent.ts` — `getExplicitNameMatchAdjustment` (lines 257–299)

**Issue:** `WEAK_SINGLE_TOKEN_ALIASES` (e.g. `"layout"`, `"grid"`, `"panel"`, `"content"`) is checked only in the alias scoring branch. If a component's **name** is one of these weak tokens (unlikely but possible for future components), the name-matching branch would still give it a full +28 score. More importantly, these weak tokens are not suppressed in the `getComponentQueryFields` scoring — a component whose summary, when_to_use, or tags contain `"layout"` will still score via the generic field-level matching even when the query is `"layout"`.

**Impact:** Low — currently all weak tokens are aliases not names. But the protection is incomplete: the intent is to suppress broad terms, but they're only suppressed in one of three scoring pathways (alias scoring, but not field-level scoring or semantics scoring).

**Suggested fix:** Either extend the weak-alias concept to the field-scoring layer (e.g. suppress generic terms from contributing high phrase weights), or document that WEAK_SINGLE_TOKEN_ALIASES is intentionally narrow.

---

## Summary Table

| ID  | Severity | Category         | Ranking Impact |
|-----|----------|------------------|----------------|
| B1  | Medium   | Score inflation   | Relative: No (today). Absolute: Yes |
| B2  | Medium   | Score inflation   | Relative: No (today). Fragile for future |
| B3  | Low      | Score inflation   | No              |
| B4  | Medium   | Missing matches   | Yes — plural/singular misses |
| B5  | Low      | Silent degradation| Edge case only  |
| B6  | Medium   | Data loss         | Yes — partial results discarded |
| B7  | Low-Med  | Matching failure  | Yes — punctuated queries miss bonuses |
| B8  | Medium   | False positive    | Yes — wrong routing for ambiguous queries |
| B9  | Low      | Asymmetric logic  | Edge case only  |
| B10 | Low      | Performance       | No              |
| B11 | Low      | Score inflation   | No              |
| B12 | Low      | Incomplete guard  | No (today)      |

## Recommended Fix Priority

1. **B6** (compareOptions data loss) — simplest high-value fix
2. **B1** (phrase+token double-count) — clean up scoring semantics
3. **B4** (plural normalisation) — improves real query matching
4. **B7** (normalizeQuery punctuation) — quick fix, broad benefit
5. **B8** (navigation intent false positives) — prevents ranking distortion
6. **B2** (triple-scoring cleanup) — future-proofs scoring
7. **B9 → B12** — lower priority polish

