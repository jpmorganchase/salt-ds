# Additional a11y.md Section Templates

**Use when:** Writing Best Practice Recommendations, False Positives, or Not Applicable / Skipped entries in a11y.md. These sections are used by Phase 2, Phase 3, and the main agent — not Phase 1.

---

## Best Practice Recommendation

Items captured during Phase 2 agent review when a check doc identifies an approved best practice improvement. Keep entries concise with plain-text descriptions (no code blocks or source snippets).

```markdown
#### Recommendation [#]
- **Checkpoint:** [checkpoint ID, e.g., 2.4.4-01]
- **File:** [path] (Line [#])
- **Element:** [element or component]
- **Context:** [plain-text description of the element's surroundings and current state]
- **Suggestion:** [what could be improved and why]
```

## False Positives

Items initially flagged but confirmed as false positives.

```markdown
- **[Checkpoint or rule]:** [element/file] — [explanation of why it's a false positive]
- **Source:** [agent-determined | developer-confirmed]
```

**When to use False Positives:** Only record a false positive when a tool or scan **flagged something as a violation** that upon review is actually correct code. If a checkpoint was reviewed and found to have no issues (e.g., `<html lang="en">` is already present and appears correct), that is a **clean checkpoint** — do not record it as a finding or a false positive. Clean checkpoints are noted in the Scan History by omission — if a checkpoint has no findings with `flagged for review` status, it appears clean.

## Not Applicable / Skipped

Record what was skipped and why — checkpoints, phases, or tools.
