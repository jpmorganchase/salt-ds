# a11y.md File Protocol

This document defines the structure, rules, and usage patterns for the `a11y.md` file — the persistent state file that tracks accessibility findings across phases, sub-agents, and sessions.

The search-and-load flow for a11y.md is defined in SKILL.md (Getting Started) and agent.md (Startup Questions). This document covers structure and rules only.

## Purpose

1. **Cross-phase deduplication** — later phases see what earlier phases found
2. **Cross-session continuity** — persists if context window fills or new session starts
3. **Progress tracking** — compare across runs to see improvement or regression
4. **Centralized state** — single source of truth written by sub-agents during their phases and by the main agent during walkthroughs and corrections
5. **False positive documentation** — confirmed false positives (including developer-confirmed) noted to skip in future runs
6. **Validation confirmation** — Phase 1 findings inform the Phase 3 re-scan to confirm fixes, with results tracked inline on each finding's `Status` field

## Structure

The a11y.md file structure is defined across four template files in `templates/`:

| Template File | Content | Used By |
|---|---|---|
| `templates/a11y_skeleton.md` | Section headings + metadata placeholders — used to create a fresh a11y.md | Main agent (skeleton creation only) |
| `templates/finding_templates.md` | Mapped & unmapped finding templates, numbering rule, prohibited fields, same-element merge | Phase 1, Phase 2, Phase 3 |
| `templates/additional_sections.md` | Best Practice Recommendation, False Positives, Not Applicable / Skipped entry formats | Phase 2, Phase 3, main agent |
| `templates/scan_history_template.md` | Run entry template with counts and guidance — loaded ONLY after all phases complete | Main agent (post-phase only) |

Unified list of all discovered issues grouped by checkpoint. Each entry records which phase found it. Later phases add to existing entries or note "already captured" to avoid duplicates.

## Status Field Values

| Status | Meaning |
|---|---|
| `open` | Issue found, not yet addressed |
| `fixed` | Fix applied by the agent during this run |
| `false positive` | Agent determined this is a false positive (e.g., Salt DS pattern) |
| `false positive (developer-confirmed)` | Developer explicitly said this is a false positive or can be ignored. **Skip in future runs.** |
| `flagged for review` | Agent cannot determine the correct fix with high confidence |
| `remaining after validation` | Issue persists after fixes were applied (confirmed by validation re-scan) |
| `new after validation` | Issue appeared in validation re-scan but was NOT in the original Phase 1 scan (possible regression) |

## Key Design Decisions

- **One Findings section, not per-phase sections.** Each finding records which phase detected it via the `Detected by` field. If Phase 2 agent finds something Phase 1 aXe already captured, the writing agent (sub-agent or main) merges the entries rather than creating a duplicate. When merging, update the `Detected by` field to a compound format listing all contributing phases separated by ` + `, e.g., `Phase 1 (aXe) + Phase 2 (agent)`. Do NOT use bare `Multiple` — always enumerate the contributing phases.
- **Fixes are tracked inline** via the `Status` and `Fix applied` fields on each finding, not in a separate section. This keeps each issue and its resolution together.
- **Manual Review items** are findings with `Status: flagged for review`.
- **Validation findings** update the finding's `Status` to `remaining after validation` or `new after validation`. Remediation ideas are presented in the chat output only (via `templates/output_template.md` Remaining Issues block) — they are NOT written into a11y.md.
- Each sub-agent deduplicates before writing — if a finding for the same file/line/element already exists, merge the `Detected by` and `Notes` fields rather than creating a duplicate entry. When merging `Detected by`, use a compound format: e.g., `Phase 1 (aXe) + Phase 2 (agent)`. When Phase 2 applies a fix to a finding already recorded by Phase 1, update `Detected by` to reflect both phases.
- **Same-element rule merge:** See `templates/finding_templates.md` → Same-Element Rule Merge for the authoritative definition.

## Write Access

**Sub-agents write directly to a11y.md during their phase.** Since phases run sequentially, each sub-agent has exclusive write access during its execution. Each sub-agent must read a11y.md first to check for existing entries and deduplicate before writing. **Sub-agents must NOT write to the Scan History section.** Sub-agent writes are limited to the Findings, False Positives, and Not Applicable / Skipped sections.

The main agent writes to a11y.md only when: (a) creating the initial skeleton, (b) writing the current run's Scan History entry after all phases complete (using `templates/scan_history_template.md`), (c) correcting issues spotted during post-phase review, (d) updating entries during interactive walkthroughs with the developer.

## Reading an Existing a11y.md

When a11y.md already exists from a previous run (found in the skill's own `scans/` directory — the `scans/` subdirectory alongside `SKILL.md`), the agent's behavior depends on the developer's startup choice (see `agent.md` → Startup Questions → Returning User — Existing a11y.md Found).

- **Load previous results** — read the file as-is (steps 1–3 only), skip steps 4–8, proceed to output generation. File is read-only until the developer requests changes.
- **Replace or Archive** — after the file is deleted or moved (per `agent.md` instructions), create a fresh skeleton and follow the default path below.

### Default Path (New Scan)

This applies after Replace/Archive and on first-ever runs (no existing a11y.md).

1. **Read it first** before creating a new skeleton — don't overwrite
2. **Validate structure** — check that expected sections exist (Scan Metadata, Findings, Scan History). If the file is malformed, truncated, or unparseable:
   - Inform the developer: "The existing a11y.md appears to be corrupted or incomplete. Would you like me to archive and create a fresh file, or attempt to work with it as-is?"
   - If archive: rename existing file with timestame and move to scans/archive, create fresh skeleton
   - If as-is: do best-effort parsing, note any sections that couldn't be read
3. **Honor developer-confirmed false positives** — any finding with `Status: false positive (developer-confirmed)` must be excluded from reporting in this run. Do not re-flag these items.
4. **Update Scan Metadata** — update date, scan mode, and other metadata for the current run
5. **Generate a Run Summary** for the previous run's data and append it to the Scan History section (use `templates/scan_history_template.md`). This preserves the audit trail.
6. **Clear the current-run Findings** — previous findings stay in Scan History; the Findings section is for the current run. Move or archive old findings as appropriate while preserving developer-confirmed false positives.
7. **Append new findings** — follow the normal append-only process for new findings during the current run
8. **Compare results** — if a previously `open` finding is no longer detected, note the improvement in the current run's Scan History entry

## Developer False-Positive Flow

When the developer indicates a finding is a false positive (either during the run or in follow-up):

1. Update the finding's status in a11y.md to `false positive (developer-confirmed)`
2. Add a note: "Developer indicated this is a false positive or can be ignored. Exclude from future runs."
3. In future runs, when reading an existing a11y.md, skip any finding marked `false positive (developer-confirmed)` — do not report it, count it, or attempt to fix it
4. The developer can reverse this by manually editing a11y.md to change the status back
