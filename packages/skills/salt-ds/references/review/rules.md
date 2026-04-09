# Review Rules

Use this file only for `review` work.
For deep or repo-spanning review, project context should already be known.
For quick-check, you may start from the current file, selection, or smallest affected region and add project context when feasibility or safety requires it.

## Priority Order

Review in this order:

1. correctness and canonical mismatch
2. composition misuse
3. conventions conflicts
4. migration or upgrade risk
5. evidence gaps

Do not lead with style nits when a more important issue exists.

## Issue Families

- `review-canonical-mismatch`
  - the code bypasses the nearest correct Salt component, pattern, or foundation
- `review-composition-misuse`
  - Salt parts are combined incorrectly or required structure is missing
- `review-conventions-conflict`
  - repo wrappers, bans, or local rules are ignored or treated as canonical Salt
- `review-migration-upgrade-risk`
  - deprecated, unstable, or version-sensitive Salt usage needs change
- `review-evidence-gap`
  - source review is not enough to close the question and runtime evidence is the right next step

## Review Loop

0. Obtain canonical Salt guidance via MCP (`review_salt_ui`) or CLI (`salt-ds review`) before proposing Salt-specific fixes.
1. Read the source findings first.
2. Inspect `fixCandidates`.
3. Inspect `confidence` and `raiseConfidence`.
4. Apply only edits that still fit the repo context and user goal.
5. Rerun `review`.
6. Add `review --url` only if the source pass still leaves an important gap.

If structured fields such as `fixCandidates`, `confidence`, or `raiseConfidence` are missing, keep the same order and derive the next step from the canonical findings rather than stalling or skipping the review contract.

## Critical Rules

- do not propose Salt-specific fixes, replacements, or code until canonical Salt guidance has been obtained via MCP or CLI
- keep findings decision-first and concise
- prefer deterministic `fixCandidates` before inventing broader edits
- keep canonical Salt guidance separate from repo conventions in the explanation
- use runtime evidence to answer unresolved questions, not as the first step
- when multiple findings exist, order them by user impact and regression risk

## Accessibility Audit Rule

Treat Salt-specific accessibility audits as `review` work, not generic accessibility commentary.
Ground the audit in canonical Salt guidance first, then use the rubric to assess semantics, keyboard flow, labeling, focus visibility, contrast-sensitive states, and recovery states.
Do not skip Salt source validation just because the request mentions accessibility.


## Quick-Check Mode

Use quick-check mode when the user wants a gut-check, pre-commit sanity review, or the safest next fix.

- stay close to the current file, current selection, or smallest affected region
- still obtain canonical Salt guidance when feasible, but avoid broad repo sweeps unless the issue clearly requires them
- return the top issues, the safest next fix, and the most important confidence gap
- if the review becomes structurally ambiguous, say that a deep review is the safer next step
