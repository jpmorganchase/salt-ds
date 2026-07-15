# Plan 009: REJECTED — StaticList semantics are being handled elsewhere

> **Executor instructions**: Do not execute this plan. The maintainer is
> handling StaticList in separate work. Reconcile this record only after that
> work lands or is abandoned.
>
> **Drift check if reconsidered**: `git diff --stat 338971164..HEAD -- packages/lab/src/static-list site/docs/components/static-list`

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: MED
- **Depends on**: none
- **Category**: rejected
- **Planned at**: commit `338971164`, 2026-07-12
- **Disposition**: REJECTED as duplicate ownership, 2026-07-12

## Why this was rejected

The mismatch remains factual at the planned commit: props extend `<ul>`, while
the ref and JSX use `<ol>`. The maintainer will address the component through
another workstream, so a second executor plan would create duplicate or
conflicting ownership.

## Scope if reconsidered

After the separate work lands, verify that props, ref, rendered element, docs,
tests, and changeset all agree. Reactivate only for a residual gap.

## Git workflow

No branch or commit is required while externally owned. If reactivated, use
`codex/009-static-list-semantics` and do not push/open a PR unless instructed.

## Reconsideration steps

1. Inspect the separate StaticList change and its semantic decision.
2. Run the relevant lab tests/typecheck.
3. Retire this record as DONE if all contracts align; otherwise rewrite it for
   the exact residual issue.

## Test plan

The external work should assert element, implicit role, forwarded ref, and
element-specific native props. Do not add duplicate tests from this plan.

## Done criteria

- [x] Duplicate execution is prevented.
- [ ] Separate work aligns props/ref/JSX/docs/tests or this record is reactivated.

## STOP conditions

- Separate StaticList work is active.
- Its intended semantic decision is not yet settled.

## Maintenance notes

Keep description-list/term-value semantics outside this work unless explicitly
designed as a separate component.

