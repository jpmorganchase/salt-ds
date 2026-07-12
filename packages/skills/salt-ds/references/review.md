# Salt Review

Use review for existing Salt UI, changed Salt code, deprecated usage, Salt-specific accessibility and hierarchy issues, primitive choice, and safest fixes.

## Path

1. Load `core.md`.
2. Inspect the changed surface and host conventions. Call `review_salt_ui` with one changed file's complete current contents and `root_dir`. The workflow uses the freshly detected Salt version; pass `package_version` only as an exact explicit override, never an inferred range.
3. Pass source-backed `expected_targets` only to a composition-root file that owns the complete returned set. Omit them for leaf files. Follow the aggregate-coverage and source-size limits in `core.md`.
4. Report findings without editing when the user requested review only.
5. When edits were authorized and the action is `apply_fixes` with `scope: grounded_findings`, apply only the concrete returned fixes, then review the complete updated file through its post-action. Otherwise report and stop.
6. Run the relevant existing host checks and report residual risk.

## Rules

- Report findings before summaries.
- Separate Salt-specific findings from generic code style.
- Preserve eligible create targets with `source: create_report` and migrate targets with `source: workflow_context`; never infer replacements.
- Treat parse fallback, incomplete input, or another source gap as inconclusive. Resubmit the complete file and rerun.
- Report nonzero `internal_limitations.unsupported_claim_count` and its `unsupported_rule_kinds` as coverage limits even when review status is successful.
- Do not claim runtime, browser, accessibility, interaction, or visual evidence unless an existing host check produced it.
