# Phase 3 — Validation & QA Protocol

This protocol covers the Phase 3 validation re-scan and QA review. Phase 3 is **mandatory** — it always runs. Load any prerequisite reference docs in parallel where possible (see `references/agent.md` → File Reading Efficiency). It has two components:

- **Component A — Validation Re-Scan (conditional):** Confirms whether fixes applied during Phase 2 actually resolved the issues detected in Phase 1.
- **Component B — QA Review (always runs):** Reviews all findings from all phases for accuracy, completeness, and checkpoint alignment.

---

## ⛔ Write Boundaries

**Phase 3 must NEVER write to these in a11y.md:**
- **Scan History** — written exclusively by the main orchestrator agent after all phases complete
- **Scan Metadata** — written only by the main agent during skeleton creation
- **Best Practice Recommendation** — written by Phase 2 only

---

## Component A — Validation Re-Scan

### When to Run

The validation re-scan component runs only when ALL conditions are met:
1. Developer opted in to automated scanning (Q2 = Yes)
2. Phase 1 completed (at least one URL scanned, regardless of whether violations were found — zero violations is a successful completion)
3. At least one fix was applied during Phase 2

If any condition is false, skip Component A and proceed directly to Component B (QA Review).

## How to Run

**CRITICAL: Phase 3 operates ONLY on `axe-validation-results.json`. The only JSON file Phase 3 may create in the scans directory is `axe-validation-results.json`.** Do not create any other JSON files. **Phase 3 must NEVER delete, overwrite, or modify `axe-results.json` — it is the Phase 1 baseline required for comparison. If `axe-results.json` is missing when Phase 3 needs to compare results, log a warning and skip the comparison — do not attempt to recreate it.**

**Pre-scan verification:** Before running the validation scan, verify `axe-results.json` still exists in `SCANS_DIR`. If missing, warn: "Phase 1 baseline (axe-results.json) is missing — validation comparison will be skipped." Proceed with the scan (saving to `axe-validation-results.json`) but skip the Comparing Results step.

Re-run the exact same axe command used in Phase 1:
- Same URLs (use the URLs recorded in Phase 1, or stored in a11y.md Scan Metadata)
- Same `--disable` excluded rules list (see `protocols/axe_rule_mapping.md` → Excluded Rules for the full list)
- Same `npx @axe-core/cli` invocation

Follow `protocols/axe_scan_mechanics.md` for path construction, verification, and the combined command pattern. Run the scan + compare as a single command:

```bash
mkdir -p "${SCANS_DIR}"
cd "<project-dir>" && npx @axe-core/cli <URLS> --save "${SAVE_PATH_REL}/axe-validation-results.json" --disable <EXCLUDED_RULES>; \
  [ -f "${SCANS_DIR}/axe-validation-results.json" ] && node "${SCANS_DIR}/../bin/parse-axe-results.js" --compare "${SCANS_DIR}/axe-results.json" "${SCANS_DIR}/axe-validation-results.json" || echo '{"summary":{"resolved":0,"remaining":0,"new":0}}'
```

### Concrete example
```bash
# Project at: /Users/dev/My App
# SCANS_DIR:  /Users/dev/.agents/skills/ada-accessibility-skill/scans
# SAVE_PATH_REL (from project dir): ../.agents/skills/ada-accessibility-skill/scans

mkdir -p "/Users/dev/.agents/skills/ada-accessibility-skill/scans"
cd "/Users/dev/My App" && npx @axe-core/cli http://localhost:5173 http://localhost:5173/about --save "../.agents/skills/ada-accessibility-skill/scans/axe-validation-results.json" --disable <EXCLUDED_RULES>; \
  [ -f "/Users/dev/.agents/skills/ada-accessibility-skill/scans/axe-validation-results.json" ] && node "/Users/dev/.agents/skills/ada-accessibility-skill/bin/parse-axe-results.js" --compare "/Users/dev/.agents/skills/ada-accessibility-skill/scans/axe-results.json" "/Users/dev/.agents/skills/ada-accessibility-skill/scans/axe-validation-results.json" || echo '{"summary":{"resolved":0,"remaining":0,"new":0}}'
```

**Important:** The save filename is `axe-validation-results.json` (different from Phase 1's `axe-results.json`) to preserve the Phase 1 baseline for comparison.

**Fallback:** If the script fails, read both JSON files directly with `read_file` and compare the `violations` arrays manually by rule ID + URL.

**Error handling:** See `protocols/error_recovery.md` → Exit Code Awareness for interpreting scan results. Exit code 1 = violations found (success). Exit code 0 with missing file = zero violations (expected). Exit code 2+ = actual error.

## Comparing Results

The combined command above automatically runs the comparison. Read the compact compare output from the terminal.

The compare output classifies each finding:

| Category | Definition | a11y.md Status |
|---|---|---|
| **Resolved** | Was in Phase 1, no longer flagged | Update existing finding to `Status: fixed` (confirmed) |
| **Remaining** | Was in Phase 1, still flagged | `Status: remaining after validation` |
| **New** | NOT in Phase 1 scan | `Status: new after validation` |

**CRITICAL — Validation Comparison Scope:**

1. **Axe-to-axe only.** The validation comparison is strictly between Phase 1 axe output and Phase 3 axe output. Findings detected exclusively by Phase 2 (agent review) are NOT part of this comparison.
2. **All axe rules participate.** Every axe rule that fires — whether it maps to one of the 9 checkpoints or not — is classified as Resolved, Remaining, or New. The checkpoint mapping determines where a finding is *reported* (Findings vs Additional Accessibility Findings), NOT whether it participates in the validation comparison.
   **Exception — unfixed findings retain their status:** If a finding has `Status: flagged for review` (or `Status: open`) and no fix was applied during Phase 2 (i.e., `Fix applied: pending` or `Fix applied: None`), do NOT change its status to `remaining after validation`. The `remaining after validation` status means "a fix was attempted but the issue persists" — it is semantically incorrect for findings that were intentionally left unfixed (e.g., unmapped axe findings, items flagged for developer decision). These findings retain their current status unchanged. Only findings where a fix was actually applied should transition to `remaining after validation` if the issue persists.
3. **No invented categories.** Use only the three categories above: Resolved, Remaining, New. Do not create additional categories (e.g., "Additional findings persisting").
4. **Per-finding counting.** Count each distinct accessibility finding as recorded in the a11y.md Findings section. Match findings between Phase 1 and Phase 3 by axe rule ID + URL. A rule that fires on 3 different pages = 3 findings. A rule that fires with multiple element occurrences on the same page but was recorded as a single finding in a11y.md = 1 finding.
5. **Cross-reference accuracy.** After classification, verify all Phase 1 axe-detected findings have an updated status: either `fixed` (resolved), `remaining after validation`, or unchanged. Any new findings from Phase 3 that weren't in Phase 1 should be added with `Status: new after validation`.

## Investigating Remaining and New Issues

For each remaining or new finding, the agent must:

1. **Read the source file** where the issue is located
2. **Examine surrounding context** — component hierarchy, imports, related files, dependencies
3. **Cross-reference** the axe violation description with what's in the code
4. **Determine a remediation idea** — what the correct fix would be, based on code context. **This remediation idea is for chat output presentation only (via `templates/output_template.md` Remaining Issues block) — do NOT write it into a11y.md.**
5. **Record in a11y.md:** Update the finding's `Status` to `remaining after validation` (only if a fix was applied — see exception in Validation Comparison Scope point 2) or add a new entry with `Status: new after validation` and `Detected by: Validation`. Update **only** the `Status` field on existing findings. Do NOT add a `Validation` annotation line or any field not present in the finding template defined in `templates/finding_templates.md`. Use status values as defined in `protocols/a11y_file_protocol.md`. Do NOT populate a `Remediation idea` field in a11y.md — remediation ideas belong exclusively in chat output. Do NOT modify the `Fix applied` field on existing findings except to append `(confirmed)` when validation confirms a fix resolved the issue. Do NOT add new fields to the Scan Metadata section — the metadata schema is defined in `templates/a11y_skeleton.md` and is written only by the main agent during skeleton creation. Validation outcomes are reflected in per-finding `Status` updates, not in Scan Metadata.

## CRITICAL: No Auto-Fixes in Validation

The validation sub-agent does NOT apply any code changes. Remediation ideas are determined during validation but presented to the developer in the chat output only (via `templates/output_template.md` Remaining Issues block) — they are NOT written into a11y.md. The developer decides whether to have the agent attempt fixes or handle them manually.

**Important:** When the developer opted in for axe/cli (Q2=Yes) and Phase 1 succeeded and at least one fix was applied, the Phase 3 validation re-scan MUST run. Do not skip it unless there is a technical failure (dev server down, axe crashes, etc.). The validation scan is the only way to confirm whether applied fixes actually resolved the axe-detected issues.

## Per-Fix Targeted Validation (All Interactive Fixes)

During any interactive remediation flow — remaining issues walkthrough, unmapped axe walkthrough, manual review remediation, or any developer-requested fix after the initial scan — use targeted rule validation instead of a full re-scan to confirm each individual fix:

1. Apply the fix to the source file
2. Run: `npx @axe-core/cli <URL(s)> --rules <axe-rule-id>` (see `protocols/axe_rule_mapping.md` → Targeted Rule Validation for full syntax details)
3. If the rule no longer fires: fix confirmed, update a11y.md `Status: fixed`
4. If the rule still fires: revert the change, inform the developer, leave as `Status: flagged for review`

This is faster and more precise than a full re-scan, and gives the developer immediate feedback on whether each fix worked.

**Q2 dependency:** Targeted validation requires Q2=Yes. If Q2=No, inform the developer that the fix was applied but cannot be automatically validated — manual verification recommended.

## Error Handling

| Failure | Action | a11y.md Note |
|---|---|---|
| Dev server no longer running | Attempt to restart; if fails, skip validation | "Validation skipped (dev server unavailable)" |
| axe-core times out on re-scan | Use partial results | "Validation partial ({n}/{total} pages re-scanned)" |
| axe-core crashes on re-scan | Skip validation, proceed to QA | "Validation failed: [error]" |
| All conditions not met | Skip Component A, run Component B | "Validation skipped (conditions not met: [reason])" |

---

## Component B — QA Review

**Always runs**, regardless of whether Component A (validation) ran. The QA review is the final accuracy check before output is generated.

### QA Checks

1. **Accuracy:** Do the applied fixes align with the checkpoint reference docs? Spot-check fixes against the relevant `references/checks/` docs.
2. **Completeness:** Were all priority files from Phase 2's review queue actually reviewed? Were all 9 checkpoints addressed?
3. **Missed issues:** Are there any obvious accessibility issues in the reviewed files that should have been caught but weren't? Pay particular attention to:
   - Standalone icons missing `aria-hidden="true"` (Rule 6 of `missing_alt_text.md`)
   - Icons inside buttons/links missing `aria-hidden="true"` (Rule 7 of `missing_alt_text.md`)
   - Form controls not properly associated with labels
   - **Instance count verification:** For each reviewed file, cross-check the number of findings recorded in a11y.md against the actual element count in the source file (e.g., if Home.jsx contains 3 standalone icons, there must be 3 separate icon findings — not 1)
   - **Unrecorded fix detection:** Compare source file state against a11y.md entries — every code change must have a corresponding finding entry. Add any missing entries.
4. **False fixes:** Were any unnecessary or incorrect changes made?
5. **Status consistency:** Are all finding statuses correct (`fixed`, `flagged for review`, `remaining after validation`, etc.)?
6. **Validation accuracy (if Component A ran):** Do all Phase 1 axe-detected findings have an updated post-validation status? Are new findings properly added?
7. **Salt DS correctness:** If Salt Design System is in use, were Salt components used correctly per their accessibility patterns?
8. **Numbering order:** Verify that `#### Finding [#]` numbers in a11y.md are strictly ascending in document order (1, 2, 3, ..., N). If out of order (e.g., Finding 6 before Finding 1) or gaps exist, renumber each finding by its document position per `templates/finding_templates.md`.

### QA Output

Return a QA summary to the main agent with:
- **Overall assessment:** Pass | Pass with notes | Issues found
- **Issues identified:** List any problems found (incorrect fixes, missed issues, inconsistent statuses)
- **Corrections needed:** Specific changes to make to findings, statuses, or code before final output
