# Review Rules

Use this file only for `review` work after project context is known.

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

1. Read the source findings first.
2. Inspect `fixCandidates`.
3. Inspect `confidence` and `raiseConfidence`.
4. Apply only edits that still fit the repo context and user goal.
5. Rerun `review`.
6. Add `review --url` only if the source pass still leaves an important gap.

## Critical Rules

- keep findings decision-first and concise
- prefer deterministic `fixCandidates` before inventing broader edits
- keep canonical Salt guidance separate from repo conventions in the explanation
- use runtime evidence to answer unresolved questions, not as the first step
- when multiple findings exist, order them by user impact and regression risk
