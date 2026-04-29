# Review Logic

This document governs how to count, categorize, and assign fixes to checkpoints. These rules are internal calculation logic and must never appear in the review output.

## Checkpoint Assignment Rules

- Count each fix under the checkpoint the issue relates to.
- Count one fix per finding entry in a11y.md whose status is `fixed`. If one code change resolves multiple findings, each resolved finding counts as one fix.
- Every checkpoint line must appear in the summary even if the count is 0.

## Cross-Check Counting

Adding `aria-hidden="true"` to an icon is always counted under **1.1.1-01**, even when the icon is inside a button or link and the fix was triggered by the button (4.1.2-03) or link (2.4.4-01) check.

## Flagged and Best Practice Counting

- **Flagged for Review** is a total count only, not broken down by checkpoint. Items flagged for review may not align to a single checkpoint or may span multiple.
- **Best Practice Recommendations** is a total count only, not broken down by checkpoint. Best practice items are improvements beyond checkpoint requirements and may not map to a specific checkpoint.
- **Additional Findings** is a total count of issues found by automated tools that fall outside the 9 checkpoints. Include in the summary with the disclaimer from `templates/output_template.md` → scope-notice block.

## Categorization Priority (AI Agent vs Axe Scan)

When counting findings for the Scan History "Total Issues Identified" breakdown, apply this priority rule:

- **AI agent:** ALL findings for which the agent has guidance in `references/checks/` — regardless of whether axe, agent, or manual review detected it first. If axe flags `html-has-lang` and the agent has `missing_language_attributes.md` covering that rule, the finding counts as AI agent. This includes all findings under the 9 checkpoints (1.1.1-01, 1.3.1-28, 1.3.1-37, 2.4.4-01, 3.1.1-01, 3.1.1-02, 3.1.2-01, 3.1.2-02, 4.1.2-03).
- **Axe scan:** ONLY unmapped axe findings — axe rules with no corresponding `references/checks/` doc. These are rules the agent does not have remediation guidance for (e.g., `document-title`, `region`).

**Sum constraint:** AI agent + Axe scan = Total Issues Identified.

**Per-finding counting:** Each distinct accessibility finding recorded in a11y.md's Findings section = 1 issue. This includes both checkpoint findings AND Additional Accessibility Findings — every `#### Finding [#]` entry counts toward the total. This unit applies to **both** "Total Issues Identified" **and** "Issues Fixed" — ensuring the two metrics use the same counting basis and always reconcile:

**Reconciliation formula:** `Issues Fixed + Flagged for Review = Total Issues Identified`

**Numbering cross-check:** After computing Total Issues Identified, verify it equals the highest `#### Finding [#]` number in a11y.md and that numbers appear in strictly ascending order (1, 2, 3, ...) when reading top-to-bottom. A mismatch or out-of-order sequence means findings need renumbering — renumber all findings to form a contiguous 1..N sequence in document order per the Finding Numbering Rule in `templates/finding_templates.md` before generating output.

"Flagged for Review" includes ALL findings with `Status: flagged for review` — both mapped checkpoint findings (e.g., nested tables requiring developer decision) AND unmapped Additional Findings (e.g., `document-title`, `region`). Do not count Additional Findings separately from Flagged for Review — they are a subset.

Count individual findings as recorded in a11y.md — one entry per finding. Do not derive counts from rule × page matrices or raw axe violation node arrays.

## Worked Examples

### Example A: Icon-Only Button Fix

**Scenario:** An icon-only `<Button>` with `<CloseIcon>` inside, no `aria-label`, icon not hidden.

**Two findings recorded, two code changes applied:**
1. Add `aria-label="Close settings"` to the `<Button>` → **1 finding fixed under 4.1.2-03**
2. Add `aria-hidden="true"` to `<CloseIcon>` → **1 finding fixed under 1.1.1-01**

**Summary impact:** Total Issues Identified: 2. Issues Fixed: 2 (1 under 4.1.2-03, 1 under 1.1.1-01)

### Example B: Language Attribute Fix

**Scenario:** `<html>` element has no `lang` attribute. Page content is in English.

**One code change:** Add `lang="en"` to `<html>` → counts as **1 fix under 3.1.1-01** only. Do not also count under 3.1.1-02.

**Summary impact:** Fixes Applied: 1 (1 under 3.1.1-01)

### Example C: Ambiguous Image

**Scenario:** `<img alt="image">` with generic alt text. Context analysis cannot determine if the image is decorative or meaningful.

**No code change.** Flag for manual review. Record the issue in a11y.md with `Status: flagged for review` and a brief `Why it's a defect` explanation. Do NOT include `Recommendation`, `Remediation idea`, or `Proposed solutions` fields — see `protocols/a11y_file_protocol.md`.

**Summary impact:** Flagged for Review: 1. Fixes Applied: 0.

### Example D: Multiple Axe Rules on Same Element

**Scenario:** A Salt `<Input>` using a native `<label>` triggers both the `label` and `label-title-only` axe rules on the same element.

**One finding recorded** with `Rule: label, label-title-only`. Replace `<label>` with `<FormFieldLabel>`. Both axe rules are resolved by the same code change. Per the same-element rule merge in `protocols/a11y_file_protocol.md`, multiple axe rules on the same element under the same checkpoint = one finding, not two.

**Summary impact:** Total Issues Identified: 1. Issues Fixed: 1.

**When 4 form fields each trigger both rules (8 axe violation nodes total):** 4 findings recorded (one per element, each with `Rule: label, label-title-only`). Total Issues Identified: 4. Issues Fixed: 4 (4 code changes).

## Context-Aware Inference

Unlike static analysis tools (e.g., axe), you have access to the full application context: component hierarchy, event handlers, routing, variable and file names, icon component names, surrounding text, headings, and page structure. Use all available context to determine the correct fix before flagging for manual review. For example:

- An icon-only button using `<SettingsIcon>` — the icon component name indicates the purpose is "Settings" at minimum. Also, be sure to look a surrounding elements and text like associated heading or type of settings context if possible. (e.g. Profile Settings)
- An `<img src="company-logo.png">` — the filename indicates this is a company logo
- A button with `onClick={() => submitForm()}` and visible text "Go" — the handler confirms the button submits a form
- A download icon adjacent to the text "Q1 2025 Report" — the surrounding context indicates the label should be "Download Q1 2025 Report"
- Page content written entirely in English — the language can be determined by reading the actual text content

Follow this decision flow for every issue found:

```
Issue found → Already recorded in a11y.md?
  → YES → Update `Detected by` to compound format per `protocols/a11y_file_protocol.md`, skip to fix determination
  → NO → Does the finding have corresponding guidance in references/checks/?
    → NO (unmapped axe finding)
      → Do NOT auto-fix. Follow unmapped finding protocol
        (see `protocols/axe_rule_mapping.md` → Unmapped Axe Findings Protocol)
    → YES (has guidance in references/checks/)
    → Analyze all available application context (visible text, ARIA attributes,
      event handlers, component hierarchy, surrounding elements, related files, icon names,
      filenames, headings, page structure) → Evaluate ALL applicable rules from the check doc
      against the full context → Can the correct fix be determined with high confidence?
        → YES → Apply the fix → Re-evaluate per `phases/phase2_manual_review.md` → Step 9
        → NO (context exhausted, still ambiguous) → Flag for manual review
          (record in a11y.md: issue + `Why it's a defect` only — see `protocols/a11y_file_protocol.md` for field prohibitions)
    → Element passes the checkpoint but a check doc rule identifies a best practice
      improvement? A best practice improvement is identified when a check doc rule
      explicitly uses 'recommended', 'best practice', or 'consider' for patterns that
      are not WCAG violations but improve the accessibility experience.
      (e.g., non-descriptive link text that is acceptable in context
      per Rule 3/Rule 5 of empty_non_descriptive_links.md)
        → YES → Record as Best Practice Recommendation in the output
          (do NOT count as a fix or a violation; do NOT modify code)
```

Flag for manual review only when you have genuinely exhausted context analysis and still cannot determine the correct fix with high confidence.
