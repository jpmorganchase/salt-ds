# Finding Templates

**Use when:** Recording findings in a11y.md during any phase (Phase 1, 2, or 3).
For status field values, write access rules, and dedup behavior, see `protocols/a11y_file_protocol.md`.

---

## Mapped Finding Template

Findings that map to one of the 9 checkpoints. Group under the checkpoint heading.

```markdown
### [Checkpoint ID] — [Description]

[Optional] **Why these are defects:** [Shared explanation when all findings in this section share the same root cause. Must appear directly under its own checkpoint heading — never above an unrelated section. When present, omit `- **Issue:**` from individual findings in this section since the issue is already conveyed.]

#### Finding [#]
- **File:** [path] (Line [#])
- **Element:** [code snippet or selector]
- **Rule:** [aXe rule ID(s), if detected by Phase 1 (aXe) or Validation — omit for agent/manual-only findings. Comma-separated when multiple rules flag the same element, e.g., `label, label-title-only`]
- **WCAG SC:** [WCAG success criterion, e.g., 1.3.1 — derive from the aXe Rule → Checkpoint Mapping table in axe_rule_mapping.md]
- **DAKB:** [DAKB checkpoint ID, e.g., 1.3.1-37 — same as the checkpoint heading this finding is grouped under]
- **Issue:** [what's wrong — omit when the section has a `**Why these are defects:**` block that already conveys the issue]
- **Detected by:** [Phase 1 (aXe) | Phase 2 (agent) | compound, e.g. "Phase 1 (aXe) + Phase 2 (agent)"]
- **Status:** [see Status Field Values in protocols/a11y_file_protocol.md]
- **Fix applied:** [description of fix, or "pending" if not yet fixed]
- **Notes:** [any additional context]
```

## Unmapped Finding Template

Findings from automated tools that fall outside the 9 checkpoints. Place under the `### Additional Accessibility Findings` heading.

```markdown
### Additional Accessibility Findings

Issues found by automated tools that fall outside the 9 checkpoints.
These findings do NOT have corresponding guidance in `references/checks/` and will NOT be auto-fixed. To attempt to resolve these, select "Walk through remaining issues one at a time (Beta)" from the follow-up options after the scan completes.

#### Finding [#]
- **Rule:** [aXe rule ID]
- **Element:** [selector or description]
- **WCAG SC:** [WCAG success criterion if confidently known from aXe rule tags, e.g., 2.4.2 — otherwise "Mapping Guidance TBD"]
- **Issue:** [what's wrong]
- **Impact:** [critical / serious / moderate / minor]
- **Status:** flagged for review
- **Detected by:** [Phase 1 (aXe) | Phase 2 (agent)]
- **Why it's a defect:** [Explain what the aXe rule checks for and why the current code fails it]
- **Notes:** [any additional context, e.g., which URLs were affected]
```

## Finding Numbering Rule

Finding numbers must be globally sequential within the entire Findings section (including Additional Accessibility Findings), assigned in the order they appear in a11y.md. Numbers must form a contiguous sequence with no gaps (1, 2, 3, ... N) and appear in ascending order when reading the file top-to-bottom.

**Renumbering is MANDATORY after each phase's writes.** Procedure:
1. Collect all `#### Finding [#]` headers in top-to-bottom document order
2. If numbers are not already 1, 2, 3, ..., N in order: rewrite each header to `#### Finding [position]` where position is its 1-based index
3. Verify final count N matches Total Issues Identified

## Same-Element Rule Merge

When multiple aXe rules flag the **same element** under the **same checkpoint** and are resolved by the **same code change**, record as a **single finding** with all rule IDs comma-separated in the `Rule` field (e.g., `label, label-title-only`). Do not create separate findings per aXe rule for the same element.

## Prohibited Fields

**Do NOT include Proposed solutions, Recommendation, or Remediation idea fields in a11y.md — for ANY finding type (mapped checkpoint or unmapped aXe).** These are generated on-demand only when the developer selects "Walk through remaining issues one at a time" from the follow-up options, or presented in the chat output via `templates/output_template.md` RENDER blocks.

This prohibition applies to:
- `Recommendation` fields (must not exist in a11y.md at all)
- `Remediation idea` fields (must not exist in a11y.md at all — present in chat output only via output_template.md Remaining Issues block)
- `Proposed solutions` fields (must not exist in a11y.md at all)

The `Why it's a defect` field IS permitted — it explains the accessibility concern, not how to fix it.
