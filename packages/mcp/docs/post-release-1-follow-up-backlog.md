# Post-Release-1 Follow-Up Backlog

Date: April 21, 2026

Status: active, repo-local P0/P1 hardening landed; external IntelliJ rerun still pending

This backlog captures the small set of issues surfaced by the first real-host IntelliJ validation recorded in [`./release-1-release-evidence.md`](./release-1-release-evidence.md).

Use it to tighten host orchestration and first-pass create behavior after Release 1 sign-off.
Do not use it to reopen the public contract, rename workflows, or start Release 2 architecture work early.

## Repo-Local Progress

Completed in this follow-up batch:

- host guidance now explicitly says `status = partial` or `blocked` is not completion
- host guidance now explicitly teaches compact-first branching before `view: "full"` or starter-code escalation
- forced `solution_type: "pattern"` now falls back to component routing when weakly structural prompts clearly name component surfaces like `Tabs` or `Table`
- host-rewritten exact-name prompts like `Metric component ...` now preserve the canonical exact target and suppress unrelated inferred follow-through
- deterministic regression coverage now exists for those forced-pattern cases in `agenticEvals.spec.ts`
- IntelliJ-derived replay fixtures now distinguish first-pass misroutes and premature completion from the existing recovery/pass fixtures

Still required:

- rerun the real IntelliJ host flow to confirm the new guidance and routing reduce the observed drift in practice

## Scope Rules

Keep this backlog narrow:

- preserve `salt_workflow_v3`
- preserve the workflow-first public story
- prefer host-guidance, replay, and routing fixes over new product surface
- do not add new top-level workflow tools
- do not reopen the broader refactor debate

## Immediate Items

### P0. Host Completion Discipline

Repo-local status:

- implemented in host-facing guidance and replay coverage
- pending one real-host rerun to confirm the host obeys the tighter contract

Problem:

- IntelliJ created starter code for `Metric` and stopped even though the top-level workflow result stayed `partial`, `canonical_complete = false`, and `exact_request_safe = false`

Required change:

1. Tighten host-facing guidance so `status = partial` is never treated as final completion when `action` or `blocking_reasons` still require follow-through.
2. Add one regression path that asserts hosts should continue or explicitly report incompleteness instead of stopping after starter-file creation.

Primary repo areas:

- [`../README.md`](../README.md)
- [`./maintaining-salt-ai-tooling.md`](./maintaining-salt-ai-tooling.md)
- [`../src/server/serverMetadata.ts`](../src/server/serverMetadata.ts)
- host-facing skill guidance if needed

Acceptance:

- active guidance explicitly says partial create results are not complete
- regression evidence exists for the `Metric` host-stop case
- real-host rerun no longer stops after starter-file creation while the workflow remains partial

### P0. Compact-First Escalation Discipline

Repo-local status:

- implemented in README, maintainer guidance, server metadata, and skill instructions
- pending one real-host rerun to confirm the host stays compact-first

Problem:

- the host escalated into `view: "full"` and starter-code retrieval too early instead of exhausting the compact workflow path first

Required change:

1. Tighten host-facing guidance so `view: "full"` is requested only when compact output is insufficient or the user explicitly asks for starter code or richer details.
2. Add one regression path that records early full-mode escalation as a host-quality issue.

Primary repo areas:

- [`../README.md`](../README.md)
- [`./external-validation-guide.md`](./external-validation-guide.md)
- [`../src/server/serverMetadata.ts`](../src/server/serverMetadata.ts)

Acceptance:

- active host guidance teaches compact-first branching clearly
- validation docs treat premature full escalation as a follow-up issue, not as the normal path
- real-host rerun no longer escalates to `view: "full"` before compact output is exhausted

### P0. First-Pass Create Routing Under Broadening

Repo-local status:

- implemented for the observed forced-pattern host broadening path
- covered by built-registry deterministic evals plus IntelliJ-derived replay fixtures

Problem:

- the `tabs + avatar` and `breadcrumbs + table` scenarios recovered on follow-up, but first-pass routing drifted badly under paraphrase or broadening

Required change:

1. Tighten first-pass ranking so supporting or decorative nouns do not displace the real surface owner.
2. Preserve good exact-query recovery, but reduce the need for recovery in common host flows.
3. Lock the IntelliJ transcript cases into replay or deterministic regression coverage.

Primary repo areas:

- [`../../semantic-core/src/tools/recommendComponent.ts`](../../semantic-core/src/tools/recommendComponent.ts)
- [`../../semantic-core/src/tools/createQueryAnchors.ts`](../../semantic-core/src/tools/createQueryAnchors.ts)
- [`../src/__tests__/agenticEvals.spec.ts`](../src/__tests__/agenticEvals.spec.ts)
- [`../src/__tests__/registry.integration.spec.ts`](../src/__tests__/registry.integration.spec.ts)
- [`../src/__tests__/workflowEvalReplay.spec.ts`](../src/__tests__/workflowEvalReplay.spec.ts)

Acceptance:

- `user profile with tabs and avatar` stays anchored on `Tabs` on first pass
- `file manager with breadcrumbs and table` stays anchored on `Table` with `Breadcrumbs` follow-through on first pass
- retry-only recovery is no longer required for those cases
- a real-host rerun confirms the first pass improves without another contract change

### P1. External-Host Replay Discipline

Repo-local status:

- implemented with three IntelliJ-derived replay fixtures:
  - partial `Metric` stop-after-starter
  - first-pass `Tabs` drift to `Vertical navigation`
  - first-pass `Table` drift to `File upload`

Problem:

- repo-local replay coverage existed, but the IntelliJ run still exposed orchestration and paraphrase behavior not captured tightly enough

Required change:

1. Add a small external-host transcript packet derived from the IntelliJ validation.
2. Track first-pass result quality separately from recovery quality.
3. Use those transcripts to protect against future regressions without changing the public contract again.

Primary repo areas:

- [`../src/evals`](../src/evals)
- [`../src/__tests__/workflowEvalReplay.spec.ts`](../src/__tests__/workflowEvalReplay.spec.ts)
- [`./release-1-release-evidence.md`](./release-1-release-evidence.md)

Acceptance:

- replay coverage distinguishes first-pass drift from successful recovery
- future routing fixes can be judged against the same host-derived cases

## Non-Goals

Do not use this backlog to do any of the following:

- rename the public workflows
- replace `create_salt_ui` as the public front door
- add `lookup_salt`, `discover_salt`, or `plan_salt_composition` as the new consumer story
- reopen `v3` contract design
- start broad Release 2 work before these narrow fixes are triaged
