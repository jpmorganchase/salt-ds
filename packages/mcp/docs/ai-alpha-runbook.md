# AI Alpha Runbook

Use this runbook when you are collecting real task evidence from the current Salt AI alpha.

This sits on top of:

- [`./consumer-ai-roadmap.md`](./consumer-ai-roadmap.md)
- [`./ai-product-roadmap.md`](./ai-product-roadmap.md)
- [`./live-eval-harness.md`](./live-eval-harness.md)
- [`./ai-alpha-task-pack.md`](./ai-alpha-task-pack.md)
- [`./ai-alpha-session-template.json`](./ai-alpha-session-template.json)

## Goal

Capture alpha evidence in a way that answers product questions instead of producing ad hoc anecdotes.

Every alpha run should make it clear:

- what audience the run represented
- what workflow the user actually wanted
- what transport was used
- whether the user asked Salt to do a job or asked how to use Salt
- whether the compact summary-first contract held
- what friction category explains the main failure, if any

## Current Supporting Assets

The checked-in harness and deterministic evaluation surfaces now live in:

- `packages/mcp/src/evals/workflowEvalHarness.ts`
- `packages/mcp/src/evals/workflowEvalScenarios.ts`
- `packages/mcp/src/evals/hostAttachmentEval.ts`
- `packages/mcp/src/__tests__/liveEvalHarness.spec.ts`
- `packages/mcp/src/__tests__/agenticEvals.spec.ts`
- `packages/mcp/src/__tests__/hostAttachmentEval.spec.ts`

Use them as the structural baseline before running alpha tasks with real people.

## Readiness Gate

Do not schedule alpha sessions until every required item below is true.

### Required Commands

- [ ] `yarn eval:deterministic`
- [ ] `yarn eval:live`
- [ ] `yarn eval:live:test`
- [ ] `yarn workspace @salt-ds/mcp build`

### Required Eval Surfaces

- [ ] `packages/mcp/src/__tests__/hostAttachmentEval.spec.ts` is passing through `yarn eval:deterministic`
- [ ] the live harness report shows real `mcp-local` success
- [ ] the live harness report shows real `cli-local` success
- [ ] summary-first output still passes across `review`, `upgrade`, `migrate`, and `create`
- [ ] MCP blocked to CLI fallback is still covered
- [ ] all-transports-blocked stop behavior is still covered

### Required Assets

- [ ] [`./ai-alpha-runbook.md`](./ai-alpha-runbook.md)
- [ ] [`./ai-alpha-task-pack.md`](./ai-alpha-task-pack.md)
- [ ] [`./ai-alpha-session-template.json`](./ai-alpha-session-template.json)

### Required Manual Checks

- [ ] one human has run a focused MCP-local scenario
- [ ] one human has run a focused CLI-local scenario
- [ ] the task pack has been reviewed against the current workflow vocabulary
- [ ] no alpha facilitator plans to teach transport plumbing as part of the session

If any box above is unchecked, the alpha is not ready.

Use the task pack instead of inventing new prompts during the session:

- [`./ai-alpha-task-pack.md`](./ai-alpha-task-pack.md)

## Audience Buckets

Classify every session as one of:

- `existing-salt-team`
- `non-salt-team`
- `new-project-team`

If a team spans multiple categories, log the task against the category that best matches the immediate repo and job.

## Required Capture Fields

For every task, record:

- `session_id`
- `date`
- `audience`
- `repo_type`
- `host`
- `transport`
- `workflow_requested`
- `workflow_used`
- `task_prompt`
- `user_asked_for_job`
- `summary_first`
- `verification_present`
- `blocking_question_count`
- `outcome`
- `friction_category`
- `notes`

Use the checked-in template at:

- [`./ai-alpha-session-template.json`](./ai-alpha-session-template.json)

## Friction Categories

Use one primary category per failed or degraded task:

- `docs-gap`
- `skill-orchestration-gap`
- `transport-parity-gap`
- `semantic-core-gap`
- `project-conventions-gap`
- `host-integration-gap`

If two categories are genuinely tied, record the primary one in `friction_category` and explain the secondary one in `notes`.

## Session Flow

1. Choose one repo and one audience bucket.
2. Choose one task from [`./ai-alpha-task-pack.md`](./ai-alpha-task-pack.md).
3. Choose the host and expected transport.
4. Confirm the repo path and fixture state.
5. Run one realistic workflow task.
6. Record the exact prompt and the actual transport used.
7. Check whether the result started with `result.ide_summary`.
8. Count blocking questions.
9. Record whether verification guidance was present.
10. Record whether the user naturally asked Salt to do the job.
11. Classify the main friction if the task did not succeed cleanly.
12. Save the captured record with a date-and-audience filename such as `2026-04-04-existing-salt-team-review-01.json`.

Do not explain the architecture live unless the user is completely blocked. If live tutoring is required, count that as friction.

## Session Checklist

Use this before and during each alpha session.

### Preflight

- [ ] confirm the audience bucket
- [ ] choose one task from [`./ai-alpha-task-pack.md`](./ai-alpha-task-pack.md)
- [ ] choose the host and expected transport
- [ ] confirm the repo path and fixture state
- [ ] prepare a destination file name for the session record

### Command Checks

Run these before the first session of the day:

- [ ] `yarn eval:deterministic`
- [ ] `yarn eval:live --runner mcp-local --scenario existing-salt-review-toolbar`
- [ ] `yarn eval:live --runner cli-local --scenario existing-salt-review-toolbar`

Run this before a session only if the environment changed:

- [ ] `yarn workspace @salt-ds/mcp build`

### Facilitation Rules

- [ ] give the user the task, not the architecture
- [ ] let the user ask Salt for the job directly
- [ ] do not explain MCP or CLI internals unless the user is blocked
- [ ] count any required tutoring as friction
- [ ] record whether the answer started with `result.ide_summary`
- [ ] record whether `verify` was present
- [ ] record the blocking-question count

### Capture

- [ ] fill in [`./ai-alpha-session-template.json`](./ai-alpha-session-template.json)
- [ ] classify one primary friction category
- [ ] add richer notes in the session record `notes` field or a same-name `.md` note only when JSON is not enough
- [ ] store the result alongside the session artifacts for the alpha batch

### Closeout

- [ ] confirm whether the user asked Salt to do the job or asked how to use Salt
- [ ] note whether the workflow chosen matched the task
- [ ] note whether transport differences changed the outcome
- [ ] log the next product action only if it is evidence-backed

## Result Storage

Store one JSON record per session using the checked-in template.

Suggested file names:

- `2026-04-04-existing-salt-team-review-01.json`
- `2026-04-04-existing-salt-team-review-01.md`

Rules:

- keep one JSON record per session
- add a markdown note only when the JSON fields are not enough
- do not store sensitive screenshots or repo contents here
- do not commit ad hoc local eval output from `.salt-eval-cache/`

## Success Criteria

An alpha run is strong when:

- the user asks Salt to do the job directly
- the workflow choice is correct without coaching
- the answer starts with the compact summary
- verification is present
- the user can continue without learning MCP or CLI internals

## Weekly Review

At the end of each alpha week, summarize:

- tasks run by audience
- success rate by workflow
- top friction category
- top host-specific failure
- top transport-parity issue
- whether summary-first output held consistently

Keep the weekly review short and evidence-backed. The goal is prioritization, not storytelling.
