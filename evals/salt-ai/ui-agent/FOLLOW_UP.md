# Salt UI-agent follow-up milestone

This is an additive creator, reviewer and repair exercise. It does not amend
the initial four-cell comparison, its briefs, its acceptance script or the
record in `RESULTS.md`. A follow-up result is valid only when the unchanged
acceptance also passes; `follow-up-acceptance.mjs` runs that prerequisite
before its additional checks.

Run each task from a pristine copy of its original fixture and with the same
local package cohort, offline guard and normal build preparation as the initial
comparison. Before each follow-up check, run:

```sh
npm run typecheck
npm run build
node <repository-root>/evals/salt-ai/ui-agent/follow-up-acceptance.mjs --task <task-id> --root . --seed <repository-root>/evals/salt-ai/ui-agent/fixtures/<task-id> --artifacts <caller-selected-stage-dir>
```

The caller chooses a different artifact directory for the creator and repair
stages, for example `.../creator` and `.../repair`. The checker writes the
unchanged acceptance screenshots in `baseline/`, the complete fresh desktop
journey in `follow-up/`, the complete fresh 320-CSS-pixel journey in
`follow-up/narrow-journey/`, and an inspectable `follow-up-evidence.json` in
that chosen directory. Existing desktop screenshot paths remain in
`follow-up/`. Do not overwrite a creator stage with repair output.

## Stages

The native Salt creator works from the original task and its matching
`FOLLOW_UP_TASK.md`. It records the local CLI and Knowledge identity, the
bounded retrieval records used for its component choices, changed files and
seams, user-visible states exercised, and the stage-local type, build and
acceptance evidence.

An independent Salt reviewer then works read-only under
`skills/salt-ui/SKILL.md`. It receives the follow-up brief, source/diff, the
creator record and the labelled stage artifacts. It independently establishes
any Salt claim through the local CLI sequence and returns file- and
behavior-specific findings plus evidence limitations. It must verify that the
visible saved-report summaries actually use the Card coverage selected for
their stated role, rather than accepting an import as proof. The reviewer does
not edit, build, test, install, call a model or use the network.

The repairer receives the review, changes only what the task and findings
support, and records its own stage in a separate caller-selected artifact
directory. It reruns the typecheck, build and follow-up acceptance. Keep both
stage records and artifacts: a repaired result is a later result, never a
replacement for creator or initial-comparison evidence.

## What the additive checker establishes

For saved reports, it proves that two known reports are added without replacing
one another, search reaches an explicit no-match state and clears, details can
be selected, invalid editing focuses its field, cancellation retains the saved
name and description, saving retains the other report, and labelled desktop and narrow states
remain inspectable. For team invitations, it proves that an unsaved Overview
draft survives the `#team` to `#overview` round trip, two known invitations are
retained, and the corresponding desktop and narrow states remain inspectable.

Both journeys begin from fresh page state. Navigation, create, invite, submit
and access-level actions use keyboard interaction. The checker waits for fonts,
finite animations and two layout frames before axe, then checks axe and
320-CSS-pixel containment at dialog, intermediate and final narrow states. It
also blocks browser errors and external requests. Screenshots are evidence for
human review; the checker intentionally has no subjective visual score, exact
CSS measurements or universal Card rule.
