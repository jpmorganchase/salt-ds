# Scan History Entry Template

**Use when:** Writing the Scan History entry in a11y.md after all phases have completed.
**Load ONLY after all phases complete.** Do not load during skeleton creation or during any phase.
For counting rules, see `protocols/review_logic.md` → Categorization Priority.

---

## Run Entry Template

```markdown
### Run [#] — [Date]
- **Scan mode:** [Full (aXe + AI agent review) / AI agent review only]
- **Agent version:** [skill version from VERSION file]

**Total Issues Identified:** [n]

**Issues Fixed by Agent:** [n]

**Other:**
- **Flagged for manual review:** [n]
- **False positives:** [n]
- **Best practice recommendations:** [n]
```

## Guidance

- **Before writing:** Count findings in a11y.md by status, then verify `Fixed + Flagged + False Positives = Total Issues`. If unbalanced, recount from the actual `#### Finding [#]` entries.
- **Categorization priority:** see `protocols/review_logic.md` → Categorization Priority. Do not include parenthetical breakdowns after counts (e.g., do not write `14 (9 Phase 1: ...)`). Just the number.
- **Issues Fixed:** counted per finding in a11y.md with `fixed` status. See `protocols/review_logic.md` → Checkpoint Assignment Rules.
- Do not add a Phase 3 Validation Results subsection or a "Checkpoints with outstanding issues" line. Validation outcomes are reflected in the per-finding `Status` field and the fixed/flagged counts above. Outstanding issues are already captured by the "Flagged for manual review" count.
