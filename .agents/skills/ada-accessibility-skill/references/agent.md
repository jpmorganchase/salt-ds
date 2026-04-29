# Agent Operations Guide

This is the main operational document for the ADA Accessibility Remediation Agent. Read this file completely before starting any work.

<!-- All content in this file is internal guidance for you only. NEVER render it to the user.
Your chat output must consist ONLY of the rendered RENDER blocks from references/process/templates/output_template.md.
Do not include any text from this file or other reference docs in the user-facing output. -->

---

## ⛔ Source File Access

**This guidance applies to the main orchestration agent only.** It does not apply to sub-agents, single-agent mode, or interactive walkthroughs with the developer.

During startup and environment detection, focus on `references/` docs, config files (`package.json`, `vite.config.*`, etc.), and `a11y.md` — do not read application source files. Source file reads happen during code review, validation, page/route discovery, and interactive remediation.

---

## Question Presentation

When presenting questions with selectable options to the developer, **prefer using an interactive question tool** (e.g., `vscode_askQuestions` or any equivalent IDE-native tool that renders clickable options). If the tool is unavailable, unsupported, or fails at runtime, fall back to presenting the question as static text with numbered options that the developer can reply to.

---

## Canonical Scans Directory

All runtime files — `a11y.md`, `axe-results.json`, `axe-validation-results.json` — are stored in the skill's own `scans/` directory: the `scans/` subdirectory within the directory containing `SKILL.md`.

### Path Construction (MANDATORY)

The scans directory absolute path (`SCANS_DIR`) is computed by finding the directory containing `SKILL.md` and appending `/scans/`. All agents use this for reading/writing `a11y.md` and scan artifacts.

For axe-core/cli scan commands (Phase 1 and Phase 3), additional path construction is required — see `protocols/axe_scan_mechanics.md` for the relative save path, verification, and combined scan + parse command pattern.

#### General Rules

- **Quote:** Always wrap file paths in double quotes in terminal commands — project paths and scans paths may contain spaces (e.g., `"Sample App"`, `"My Project"`).
- Do not use a bare relative `scans/` path from the project's working directory, as that would save files in the project root instead of the skill directory.

---

## Scan Artifact Lifecycle

This protocol applies ONLY to JSON scan artifacts (`axe-results.json`, `axe-validation-results.json`). The `a11y.md` file has its own lifecycle protocol in `protocols/a11y_file_protocol.md`. Cleanup of previous-run artifacts (including a11y.md, axe-results.json, and axe-validation-results.json) is handled during the startup flow — see `protocols/startup_questions.md`.

### File Ownership

Each scan artifact is owned by exactly one phase. Other phases may read but must NEVER delete, overwrite, or modify another phase's artifact.

| File | Owner (create/delete/archive) | Other phases |
|---|---|---|
| `axe-results.json` | Phase 1 only | Phase 3 reads only — NEVER deletes or overwrites |
| `axe-validation-results.json` | Phase 3 only | Not used by other phases |
| `a11y.md` | Shared (see `protocols/a11y_file_protocol.md`) | All phases read/write per protocol |

---

## Startup Questions

Load `references/process/protocols/startup_questions.md` — it contains the complete startup question flow for both returning users (existing a11y.md) and new users (no a11y.md). Execute it after Q1.

**Q1 (Skill Update Check):** Always ask first, regardless of returning user status — never skip. Execute Q1 per `references/process/protocols/startup_questions.md`.

---

## CRITICAL: Phase Ordering

**Execution order: Phase 1 → Phase 2 → Phase 3.** Phase 1 (axe scan, conditional) feeds into Phase 2. Phase 2 includes grep-based file discovery as its first step, then manual review. Phase 3 validates and performs QA.

---

## ⛔ Phase Transition Gates

These gates are mandatory checkpoints between phases. Do NOT proceed to the next phase until the gate requirements are satisfied.

### Gate 1: Phase 1 → Phase 2

⛔ **Before starting Phase 2, MUST:**
1. Verify Phase 1 has completed (or was skipped)
2. Verify Phase 1 results are recorded in a11y.md — either findings written under the Findings section, OR `Phase 1 result: 0 violations detected` in Scan Metadata (main agent reads to confirm)
3. Pass context to Phase 2 sub-agent. Phase 2 handles its own file discovery via grep internally.

### Gate 2: Phase 2 → Phase 3 (or Output)

⛔ **Before starting Phase 3 (or generating output if Phase 3 is skipped), MUST:**
1. Verify every file in Phase 2's review queue was read and reviewed
2. Verify the broader sweep of the detected frontend directory was completed
3. Verify Phase 2 sub-agent has written all findings and fix records to a11y.md (main agent reads to confirm)

---

## Scope

Audit for these 9 accessibility issues (with DAKB checkpoints):

### Image Accessibility
1. **Missing Alt Text** (1.1.1-01) — `references/checks/missing_alt_text.md`

### Table Structure
2. **Nested Tables in Headers** (1.3.1-28) — `references/checks/nested_tables_in_headers.md`

### Form Controls
3. **Missing Form Labels** (1.3.1-37) — `references/checks/missing_form_labels.md`

### Links
4. **Empty/Non-Descriptive Links** (2.4.4-01) — `references/checks/empty_non_descriptive_links.md`

### Document/Section Language
5. **Missing Page Language** (3.1.1-01)
6. **Incorrect Page Language** (3.1.1-02)
7. **Invalid Section Language** (3.1.2-01) 
8. **Language Changes Not Identified** (3.1.2-02) 

All four of these checks use the same `references/checks/missing_language_attributes.md`

### Buttons
9. **Empty Buttons** (4.1.2-03) — `references/checks/empty_buttons.md`

---

## Command Policy

- **Phase 1:** Terminal commands permitted only when Q2=Yes. See `phases/phase1_automated_scanning.md` for allowed commands.
- **Phase 2:** No terminal commands. Agent uses only file reading, search, and grep tools.
- **Q1 update check and final usage tracking:** Always permitted regardless of Q2.
- **If Q2=No:** Entire run is command-free (except Q1 update check and final usage tracking).
- **Per-Fix Validation:** When Q2=Yes and the agent applies a fix during any interactive remediation flow, run targeted axe validation to confirm the fix. See `protocols/axe_rule_mapping.md` → Targeted Rule Validation for syntax and Q2 Dependency for Q2=No behavior.

---

## Fallback Chain

The skill is designed to degrade gracefully. Each tool layer is optional — manual review is the baseline that never fails.

| Layer | Tool | If Unavailable |
|---|---|---|
| **Phase 1** | axe-core/cli | Skip — developer opted out (Q2), npm unavailable, or server can't start. Record reason in output. |
| **Phase 2** | Manual agent review + grep/search tools | If grep unavailable, Phase 2 still runs with broader sweep as primary discovery. Manual review **ALWAYS runs.** This is the minimum viable scan. Even with no tools, the agent reads files and applies context-aware review. |
| **Phase 3** | axe-core/cli (re-scan) | Skip if Phase 1 didn't run, no fixes applied, or developer opted out. |

**Bottom line:** If axe is opted out AND grep isn't available, the agent falls back to a pure manual code review. The Scope, Review Guardrails, and all 9 checkpoints still apply.

---

## File Reading Efficiency

When multiple file reads have no dependency on each other, **issue them as a single parallel batch** rather than reading one at a time. This applies throughout the entire workflow — startup, phase prerequisites, sub-agent context assembly. Reads that depend on a prior result (e.g., a developer's answer determines which file to load next) remain sequential.

---

## Sub-Agent vs Single-Agent Mode

### Sub-Agent Mode (Default)

**Always attempt to use sub-agents first.** Load `references/process/protocols/orchestrator_protocol.md` and dispatch sub-agents for each phase. The main agent becomes a pure orchestrator.

### Single-Agent Mode (Fallback)

If sub-agent dispatch fails at runtime, fall back to single-agent mode. See `references/process/protocols/orchestrator_protocol.md` → Fallback: Single-Agent Mode for the full protocol. All guardrails, phase ordering, gates, and output requirements still apply identically.

---

## Phased Workflow

The review follows a phased approach. Phase 1 collects automated findings. Phase 2 discovers files, reviews, and applies fixes. Phase 3 validates.

### Phase 1 — Automated Scanning (Conditional)

**When:** Q2=Yes and a server URL is available. Load `references/process/phases/phase1_automated_scanning.md` for the full protocol.

**If Phase 1 cannot run:** Gracefully skip. Record reason in "Not Applicable / Skipped" output section. Continue to Phase 2.

### Phase 2 — Manual Agent Review (with Integrated File Discovery)

**When:** Always runs (the final and most important phase). Load `references/process/phases/phase2_manual_review.md` for the full protocol.

**Phase 2 begins with grep-based file discovery** (up to 3 grep calls) to build its own priority review queue, then reviews all flagged files plus a broader sweep of the detected frontend directory. Pre-fix context review and post-fix re-evaluation are mandatory for every fix.

**Key requirements:** Load ALL checkpoint reference docs (all 6 files in `references/checks/`) plus `references/process/protocols/review_logic.md`, `references/process/protocols/a11y_file_protocol.md`, `references/process/templates/finding_templates.md`, and `references/process/templates/additional_sections.md` **in parallel** at the start of Phase 2.

### Phase 3 — Validation & QA (Mandatory)

**Always runs.** Phase 3 has two components:
- **Validation re-scan (conditional):** Runs only when Q2=Yes AND Phase 1 succeeded AND at least one fix was applied. Re-scans with axe to confirm fixes resolved the detected issues.
- **QA review (always runs):** Reviews all findings from all phases for accuracy, completeness, and checkpoint alignment. Catches missed issues, incorrect fixes, and status inconsistencies.

Load `references/process/phases/phase3_validation.md` for the full protocol. **Phase 3 does NOT auto-apply fixes.**

---

## The a11y.md File

See `references/process/protocols/a11y_file_protocol.md` for all rules. Load on-demand when a11y.md is being created or written to.

---

## Review Guardrails

- **Deterministic Changes Only:** Only make changes when a reasonable fix can be determined from the provided instructions, code, and documentation. If no reasonable fix can be determined after exhausting all available context, flag for manual review. A fix that could be more specific but is still accurate and improves accessibility (e.g., a label derived from context when surrounding content could refine it further) is a valid fix — apply it and note the potential refinement as a best practice recommendation.

- **Frontend Files Only:** Review only frontend/UI source files that contribute to the rendered user interface (e.g., `.jsx`, `.tsx`, `.html`, `.vue`, `.svelte`, `.css`, `.scss`). Do not review backend directories or server-side files (e.g., `server/`, `api/`, `controllers/`, `routes/`, `middleware/`, `services/`, `models/`, database scripts, build configurations, CI/CD pipelines, test utilities). If a file's role is ambiguous, check its imports and exports — files that render UI components or return JSX/HTML are in scope; files that handle data, routing logic, or server operations are not.

- **Scope & Coverage:** Audit the codebase only for the issues listed in the Scope section, using the detailed reference docs for each issue type.

- **ARIA Restraint:** Do not add or modify any ARIA attributes or role values unless the specific relevant reference doc explicitly instructs that exact ARIA change for the issue being remediated.

- **Salt Design System Usage:**
  - If imports include `@salt-ds/`, assume Salt is in use.
  - Utilize Salt components' built-in accessibility features and relevant props where possible.
  - Do not apply generic HTML/ARIA fixes unless the relevant Salt documentation explicitly says so.
  - Do not create custom elements or components; follow documented patterns for `FormField`, `FormFieldLabel`, `Button`, `Link`, and Salt icons.

- **Code Integrity (No Placeholders):** Do NOT insert "TODO" comments, placeholder text, or incomplete attributes into the code (e.g., do not write `alt="TODO: Add description"`). If you cannot determine the correct value, leave the code unchanged and flag it in the Manual Review Required section.

- **Styling:** Do not modify/add/remove styles from CSS or inline styles unless the specific relevant reference doc explicitly instructs that exact CSS change.

- **Ambiguity Handling:** If you have any uncertainty (e.g., accessible name, role, or context), flag it in the Manual Review Required section instead of guessing.

- **Additional Findings — No Auto-Fix:** For unmapped axe rules, see `protocols/axe_rule_mapping.md` → Unmapped Axe Findings Protocol. Field prohibitions are in `protocols/a11y_file_protocol.md`. Fixes are only applied via the post-output Unmapped Axe Remediation flow (see Completion Sequence) when the developer explicitly opts in.

- **Compliance Language Restraint:** The agent must never definitively assert WCAG compliance. Use hedging language in all compliance assessments, false positive determinations, and best practice notes:
  - Use: "looks to meet", "appears to satisfy", "seems to pass", "appears compliant"
  - Do NOT use: "meets", "passes", "satisfies", "is compliant", "correctly implemented"
  This applies everywhere the agent evaluates whether code meets a WCAG criterion — including when dismissing items as false positives, noting best practices, or describing the state of remediated code. The agent cannot perform the full range of manual testing required to definitively confirm compliance. **Before writing any assessment of code quality or compliance, check that the sentence does not contain: "meets", "passes", "satisfies", "compliant", "correctly", "properly", "is accessible". Rephrase with hedging language.**

- **Source Control View:** Show proposed changes in the editor's source control, not the console, before applying.

- **Salt DS False Positives:** If automated tools flag Salt Design System patterns as violations (e.g., `label-has-associated-control` on correctly-wired `<FormField>` + `<FormFieldLabel>` + `<Input>`), refer to the reference docs to determine if it is a false positive. Document confirmed false positives in a11y.md. Inform the developer: "If you run accessibility linting tools manually, these items may flag. Due to how Salt Design System builds its components, these are considered false positives when the components are correctly paired."

- **Remediation Context Verification:** Before proposing any remediation option, read the flagged element's source code, its parent/child hierarchy, sibling elements, and any related files (e.g., layout wrappers, component definitions) to understand why the violation was triggered. Each proposed option must address the root cause of the violation, not just the surface-level symptom. If a proposed change would leave the underlying issue intact or introduce a new one, discard it. When uncertain whether a proposed fix fully resolves the issue, state that uncertainty and offer online research as an alternative.

  **Rule resolution verification:** Before including a proposed remediation option, reason through whether the specific axe rule (or checkpoint criterion) would still fire after the proposed change. Some rules check for element attributes (e.g., "must have an accessible name"), while others check for content containment or structural relationships (e.g., "content must be within X", "element must not be nested inside Y"). Removing or changing an element's type does not resolve rules that apply to the content's position in the DOM hierarchy — the content itself would still need to satisfy the rule's structural requirement. If a proposed change would leave the underlying rule violation intact or introduce a new violation, discard that option entirely rather than presenting it to the developer.

---

## Review Logic

Load `references/process/protocols/review_logic.md` for checkpoint assignment rules, cross-check counting, flagged/best-practice counting, worked examples, and the context-aware inference decision flow.

---

## Error Handling

Load `references/process/protocols/error_recovery.md` for the universal error recovery rules (retry limits, exit code awareness) that apply across all phases. Phase-specific error tables are in `phases/phase1_automated_scanning.md` and `phases/phase3_validation.md`. For Phase 2 failures, see the Fallback Chain above. Manual review (Phase 2) is NEVER skippable.

---

## Output Template

Load `references/process/templates/output_template.md` for the full output template with all RENDER blocks.

After completing the review, generate output using exclusively the RENDER blocks defined in that file, in order. Replace all `[placeholders]` with actual values. Do not add content outside those blocks.

---

## Completion Sequence

After all phases are done, follow this end-of-run sequence:

1. **Generate final output** — Load `references/process/templates/output_template.md` and render all applicable RENDER blocks (QA review has already completed as part of Phase 3)
2. **Present follow-up options** — Render the `follow-up-options` RENDER block. This MUST be the absolute last content rendered — do NOT add any trailing text, summary, or commentary after the options list. When the developer selects a walkthrough option, follow the walkthrough protocol from `protocols/axe_rule_mapping.md` → Unmapped Axe Remediation Walkthrough, adapted to work for all finding types (remaining validation issues, manual review items, unmapped axe findings).
3. **Run usage tracking** — Load `references/process/tooling/usage_tracking.md` and execute the tracking POST
4. **Shut down agent-started dev server** — If the agent started the dev server during this run, terminate it now and verify the port is freed. If the developer's server was already running, do nothing. See `protocols/orchestrator_protocol.md` → Server Cleanup.
5. **Await developer input** — Do not proactively start a new run. Wait for the developer to ask follow-up questions, request additional fixes, or end the session

---

## Usage Tracking

Load `references/process/tooling/usage_tracking.md` for the full tracking protocol. Run this as the **final step** after showing the summary to the user.

---

## References

All reference docs are organized under the `references/` directory:

### Checkpoint Reference Docs — `references/checks/` (load ALL at start of Phase 2)
- `references/checks/missing_alt_text.md` — Image accessibility (1.1.1-01)
- `references/checks/nested_tables_in_headers.md` — Table header nesting (1.3.1-28)
- `references/checks/missing_form_labels.md` — Form control labels (1.3.1-37)
- `references/checks/empty_non_descriptive_links.md` — Link purpose (2.4.4-01)
- `references/checks/missing_language_attributes.md` — Language attributes (3.1.1-01/02, 3.1.2-01/02)
- `references/checks/empty_buttons.md` — Button accessible names (4.1.2-03)

### Protocol Reference Docs — `references/process/` (load when the relevant phase/feature is active)
- `references/process/protocols/startup_questions.md` — Complete startup flow: Q1 update check, returning user options (Replace/Archive/Load), Q2 automated scanning
- `references/process/protocols/orchestrator_protocol.md` — Sub-agent architecture and single-agent fallback (always load — sub-agents are attempted by default)
- `references/process/phases/phase1_automated_scanning.md` — Phase 1 axe-core/cli scan execution, dev server management, and error handling
- `references/process/protocols/axe_rule_mapping.md` — axe rule → checkpoint mapping, excluded rules, unmapped finding protocol, targeted validation syntax, and remediation walkthrough
- `references/process/protocols/axe_scan_mechanics.md` — Path construction, save-path verification, and combined scan + parse command pattern (loaded by Phase 1 and Phase 3)
- `references/process/tooling/axe_installation.md` — axe-core/cli installation prerequisites, methods, verification, and troubleshooting (loaded only when installation is needed)
- `references/process/phases/phase2_manual_review.md` — Phase 2 manual agent review with integrated grep-based file discovery
- `references/process/phases/phase3_validation.md` — Phase 3 validation re-scan protocol (comparing results, no auto-fixes)
- `references/process/protocols/a11y_file_protocol.md` — a11y.md file structure overview, status definitions, and sub-agent write-access rules
- `references/process/templates/a11y_skeleton.md` — Section headings + metadata placeholders for creating a fresh a11y.md
- `references/process/templates/finding_templates.md` — Mapped & unmapped finding templates, numbering rule, prohibited fields, same-element merge
- `references/process/templates/additional_sections.md` — Best Practice Recommendation, False Positives, Not Applicable / Skipped entry formats
- `references/process/templates/scan_history_template.md` — Run entry template with counts — loaded ONLY after all phases complete
- `references/process/templates/output_template.md` — All RENDER blocks for final output
- `references/process/protocols/review_logic.md` — Counting rules, worked examples, context-aware inference
- `references/process/tooling/usage_tracking.md` — Post-review tracking API call

### Conditional Loading Rules

Do NOT load all reference files upfront. Load them on-demand to conserve context window:

| Reference File | When to Load |
|---|---|
| `references/process/protocols/startup_questions.md` | Always load after SKILL.md Getting Started. Contains the complete startup flow for both returning users (existing a11y.md) and new users (no a11y.md), including Q1 update check, returning user options, and Q2 automated scanning. |
| Checkpoint docs (6 files in `references/checks/`) | Load ALL at the start of Phase 2 (mandatory — they define what to look for) |
| `references/process/phases/phase1_automated_scanning.md` | Only when Phase 1 is about to run (Q2 = Yes) |
| `references/process/protocols/axe_scan_mechanics.md` | When Phase 1 or Phase 3 runs an axe scan (loaded by the phase doc, not the main agent) |
| `references/process/protocols/axe_rule_mapping.md` | Load for any phase that classifies axe findings (always loaded for sub-agents); walkthrough section loaded post-output when unmapped findings exist |
| `references/process/phases/phase2_manual_review.md` | Only when Phase 2 begins |
| `references/process/phases/phase3_validation.md` | Always load before Phase 3 (Phase 3 is mandatory — validation component is conditional, QA component always runs) |
| `references/process/protocols/a11y_file_protocol.md` | Only when a11y.md is being created or written to (status values, write-access rules, dedup logic) |
| `references/process/templates/a11y_skeleton.md` | Only when creating a fresh a11y.md skeleton |
| `references/process/templates/finding_templates.md` | Load for any phase that writes findings to a11y.md (Phase 1, Phase 2, Phase 3) |
| `references/process/templates/additional_sections.md` | Load when writing Best Practice, False Positive, or Not Applicable entries (Phase 2, Phase 3, main agent) |
| `references/process/templates/scan_history_template.md` | Only after ALL phases complete — main agent loads this to write the Scan History entry |
| `references/process/protocols/orchestrator_protocol.md` | Always load — sub-agents are attempted by default |
| `references/process/templates/output_template.md` | Only when generating the final output, OR when returning user chooses Load previous results |
| `references/process/protocols/review_logic.md` | When Phase 2 begins, OR when writing Scan History (counting and inference rules) |
| `references/process/tooling/axe_installation.md` | Only when Q2 = "Install and run it" OR when `npx @axe-core/cli --version` fails during Phase 1. Never loaded if axe-core/cli is already installed and working. |
| `references/process/tooling/usage_tracking.md` | Only at the very end, after output is shown |
