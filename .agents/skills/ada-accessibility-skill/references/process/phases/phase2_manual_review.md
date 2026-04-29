# Phase 2 — Agent Review Protocol (with Integrated File Discovery)

Phase 2 is the final and most important review phase. It **always runs** — even when Phase 1 is skipped. This is the minimum viable scan.

Phase 2 has two blocks: a **Discovery Block** (Steps 1–3) that identifies which files to review first, and a **Review Block** (Steps 4–10) that reads, reviews, and fixes accessibility issues.

## ⛔ Write Boundaries

**Phase 2 must NEVER write to:** Scan History, Scan Metadata.

## Prerequisites

Before starting Phase 2, load ALL checkpoint reference docs **in parallel** — issue all 6 `read_file` calls simultaneously in a single batch:
- `references/checks/missing_alt_text.md`
- `references/checks/nested_tables_in_headers.md`
- `references/checks/missing_form_labels.md`
- `references/checks/empty_non_descriptive_links.md`
- `references/checks/missing_language_attributes.md`
- `references/checks/empty_buttons.md`

Also include `references/process/protocols/review_logic.md`, `references/process/protocols/a11y_file_protocol.md`, `references/process/templates/finding_templates.md`, and `references/process/templates/additional_sections.md` in the same parallel batch (10 reads total). The checkpoint docs define what to look for, `review_logic.md` defines counting and inference rules, `a11y_file_protocol.md` defines status values and write-access rules, `finding_templates.md` defines the exact finding template and prohibited fields, and `additional_sections.md` defines the Best Practice Recommendation, False Positives, and Not Applicable / Skipped entry formats.

See `references/agent.md` → File Reading Efficiency for the general parallel-reading policy. Phase 2 applies it here with these 10 specific files.

---

## Discovery Block (Steps 1–3)

The Discovery Block identifies which files to review and in what order. It uses grep/search tools to surface high-priority files, then builds a review queue. The Discovery Block does NOT read file contents — it only identifies candidate locations. Full file reading happens in the Review Block.

### Step 1 — Determine Frontend Scope

Resolve the target frontend directory using this resolution chain (stop at the first match):

1. **Developer specified in prompt** — if the developer named a directory (e.g., "scan src/"), use it
2. **a11y.md metadata from prior run** — check the `Frontend directory` field in Scan Metadata
3. **Auto-detect from project structure:**
   - Check for conventional frontend directories at the project root: `src/`, `app/`, `client/`, `pages/`, `components/`, `views/`
   - Use framework conventions: Next.js → `app/` or `pages/`, Vite/CRA → `src/`, Angular → `src/app/`
   - Check `package.json` `main` or `source` fields for hints
   - Pick the directory containing the most frontend file types (`.jsx`, `.tsx`, `.vue`, `.html`, `.svelte`)
4. **Extract from Phase 1 axe results** — if Phase 1 ran, extract common directory prefixes from flagged file paths
5. **Dynamic fallback** — if none of the above yields a confident result, ask the developer: "I couldn't automatically determine where your frontend source files are located. Which directory should I focus on? (e.g., src/, app/, client/)"

### Step 2 — Run Grep-Based File Discovery (max 3 calls)

Use grep/search tools to identify candidate files for review. This step uses a maximum of **3 grep calls** to cover all 9 checkpoints efficiently. Do NOT read file contents — grep identifies candidate locations only.

**If grep/search tools are unavailable:** Skip to Step 3. The broader sweep in Step 10 becomes the primary discovery mechanism. Record: "Grep discovery: skipped (tools unavailable)."

#### File Type Scope

Scope all grep patterns to frontend file types:
`.js`, `.jsx`, `.tsx`, `.html`, `.vue`, `.svelte`, `.jinja2`, `.twig`, `.ejs`, `.erb`, `.jsp`, `.hbs`, `.blade.php`, `.cshtml`

#### Grep 1 — Design System Import Discovery (conditional)

If a design system was detected (auto-inferred or from a11y.md metadata), grep for its import pattern. This single grep surfaces the majority of files using design system components (buttons, forms, links, tables, icons, etc.) — the files most likely to have checkpoint-relevant patterns.

| Design System | Grep Pattern | Notes |
|---|---|---|
| **Salt DS** | `@salt-ds/` | Catches core, labs, icons, data-grid, etc. in one pass |
| *(Future)* MUI | `@mui/material` | — |
| *(Future)* Chakra | `@chakra-ui/react` | — |

Files found here become **high-priority** review targets. Since design system imports already surface files containing components like `<Button>`, `<Link>`, `<Table>`, `<FormField>`, icon components, etc., there is no need to also grep for those design system component names individually — the import grep already covers them.

#### Grep 2 — Checkpoint-Relevant Native HTML (always runs)

A single compound regex captures all native HTML elements relevant to the 9 checkpoints in one tool call. This catches files using **native HTML elements** not covered by the design system import grep.

**Pattern (use as regex with alternation):**
```
<img|<svg|<table|<th|<a |href=|<button|<input|<select|<textarea|<html|lang=
```

| Pattern | Checkpoint Coverage |
|---|---|
| `<img`, `<svg` | 1.1.1-01 — Native images, inline SVGs |
| `<table`, `<th` | 1.3.1-28 — Native HTML tables |
| `<input`, `<select`, `<textarea` | 1.3.1-37 — Native form controls |
| `<a `, `href=` | 2.4.4-01 — Native HTML links |
| `<html` | 3.1.1-01/02 — Entry HTML documents (always native) |
| `lang=` | 3.1.2-01/02 — Language attributes on any element |
| `<button` | 4.1.2-03 — Native HTML buttons |

#### Grep 3 — Icon Libraries (conditional)

**When no design system is detected**, grep for `Icon` to catch icon component imports from any library (the `*Icon` naming convention is standard across React icon libraries). Files with icon components need review for Rule 6 (standalone decorative icons) and Rule 7 (icons inside interactive elements) of the `missing_alt_text.md` checkpoint.

**When a design system IS detected**, skip this grep — Grep 1 already surfaces files with design system icon imports.

### Step 3 — Build the Review Queue

Compile the review queue from all discovery sources:

1. **Priority tier:** Files flagged by Phase 1 (axe) + files found by Grep 1/2/3. Deduplicate.
2. **Broader sweep tier:** Remaining frontend files in the target directory (from Step 1) not already in the priority tier.

Review all priority-tier files first (Step 4). Then sweep the broader-sweep tier (Step 10). All in-scope frontend files must be checked eventually.

#### Discovery Checklist

Before proceeding to the Review Block, verify:
- [ ] Frontend scope determined (Step 1)
- [ ] Grep 1 executed (if design system detected) or skipped with reason
- [ ] Grep 2 executed (compound native HTML regex) or skipped with reason
- [ ] Grep 3 executed (if no design system detected) or skipped with reason
- [ ] Review queue compiled (priority tier + broader sweep tier)

---

## Review Block (Steps 4–10)

### Step 4 — Read and Review All Priority-Tier Files

Read ALL files in the priority tier — including files flagged by Phase 1 axe results and files identified by grep discovery. Every flagged file is mandatory to review; do not skip any. Apply context-aware inference (see `references/process/protocols/review_logic.md`) for each issue type.

**Instance-level enumeration:** For each checkpoint, identify and record every individual occurrence in each file — do not consolidate multiple elements into a single finding. If a file contains 3 decorative icons, that is 3 separate findings, each with its specific line number and element name.

### Step 5 — Pre-Fix Context Review (mandatory)

Before applying any fix, review the element's full context — visible text content, sibling elements, parent components, event handlers, existing ARIA attributes, and related files. Evaluate the element's current accessible state holistically, then determine the correct fix by applying ALL applicable rules from the loaded check doc. Never fix an attribute in isolation without understanding how it interacts with the element's other accessibility properties.

### Step 6 — Determine Fix, Flag, or Best Practice

Follow the decision flow in `protocols/review_logic.md`:
- If the finding has corresponding guidance in `references/checks/` AND the correct fix can be determined with high confidence → apply the fix
- If the finding has corresponding guidance but context is ambiguous → flag for manual review (record issue + `Why it's a defect` in a11y.md — do NOT write recommendation text into a11y.md; recommendations are generated during the interactive walkthrough only)
- If the element passes the checkpoint but a check doc rule identifies a best practice improvement → record as a Best Practice Recommendation in the output (do not count as a fix or violation, do not modify code)
- [IMPORTANT] If the finding is an unmapped axe rule (no guidance in `references/checks/`) → follow unmapped finding protocol (see `protocols/axe_rule_mapping.md` → Unmapped Axe Findings Protocol)

### Step 7 — Record All Findings

Record findings in a11y.md (if enabled) with appropriate status. Use `Detected by: Phase 2 (agent)` for issues in files surfaced by grep. When reviewing or fixing a finding already recorded by Phase 1, update its `Detected by` field to a compound format (e.g., `Phase 1 (axe) + Phase 2 (agent)`).

Each finding recorded must include a `Why it's a defect` explanation. When multiple findings in the same checkpoint section share the same defect explanation, record it once at the section level under the checkpoint header instead of repeating it on every finding.

**⚠️ Every code change must have a corresponding finding entry in a11y.md.** Use `review_logic.md` → Cross-Check Counting to determine the correct checkpoint for each entry. One element, one finding — see Step 4 (Instance-level enumeration).

**Best Practice items are NOT findings and must NOT trigger code changes.** If the decision flow in `review_logic.md` classifies an element as a best practice improvement, record it in the Best Practice Recommendation section only.

### Step 8 — Apply Fixes Directly

Apply fixes directly during Phase 2 (show changes in source control view for developer visibility).

### Step 9 — Post-Fix Re-Evaluation (mandatory)

After applying any fix, re-evaluate the element's final state against all applicable rules from the check doc. A fix may resolve one issue but create or reveal another (e.g., correcting an ARIA typo may produce a redundant `aria-label` alongside visible text that should then be removed per the check doc rules).

If re-evaluation reveals a new issue, apply one additional fix. If the second re-evaluation still reveals issues, flag for manual review rather than continuing the fix cycle.

### Step 10 — Complete Broader Sweep

Perform a broader sweep of the detected frontend directory: scan remaining frontend files not already in the priority tier, prioritizing files with UI-rendering patterns such as JSX returns, template sections, or HTML documents. Stop when all in-scope file types in the target directory have been checked. Ensure every frontend file has been checked before Phase 2 is considered complete.

If grep/search tools were unavailable in Step 2, the broader sweep is the primary discovery mechanism — list all frontend files in the target directory and review each one.

---

## What Phase 2 Catches That Tools Miss

Even after automated tools and agent, manual review is essential. This catches:
- Issues no tool can detect (wrong language for content, context-dependent link text quality)
- Design-system-specific patterns that tools misunderstand
- Cross-file relationships and component hierarchies
- Semantic correctness that requires understanding the application's purpose and content
