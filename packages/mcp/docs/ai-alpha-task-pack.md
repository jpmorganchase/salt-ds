# AI Alpha Task Pack

Use these tasks for alpha sessions instead of inventing new prompts in the room.

Each task maps cleanly to one workflow and one audience bucket.

## Existing Salt Team

### Task 1: Review a touched file

- Workflow: `review`
- Preferred host flow: IDE with `mcp-local`
- Preferred repo shape: existing Salt feature branch or a scoped file under active edit
- Example prompt:
  - `Use salt-ds to review this toolbar file. Focus on primitive choice, layout ownership, deprecated Salt usage, and the safest next fix.`
- Success signals:
  - the user asks for the review directly
  - Salt returns `result.ide_summary`
  - `safest_next_fix` is concrete
  - `verify` is present
  - blocking-question count is `0`
- Common friction categories:
  - `transport-parity-gap`
  - `semantic-core-gap`
  - `project-conventions-gap`

### Task 2: Upgrade a scoped feature

- Workflow: `upgrade`
- Preferred host flow: IDE with `mcp-local`, CLI fallback allowed
- Preferred repo shape: existing Salt feature using an older Salt package version or a known upgrade target
- Example prompt:
  - `Use salt-ds to upgrade this feature from Salt 1.x to 2.x. Separate required changes from optional cleanup and keep the scope to this feature.`
- Success signals:
  - `required_changes` and `optional_cleanup` are separated
  - `suggested_order` is present
  - `verify` is present
  - no architecture tutoring is needed
- Common friction categories:
  - `semantic-core-gap`
  - `transport-parity-gap`
  - `docs-gap`

## Non-Salt Team

### Task 3: Migrate a described screen

- Workflow: `migrate`
- Preferred host flow: IDE with `mcp-local`
- Preferred repo shape: non-Salt repo or a plain React screen moving toward Salt
- Example prompt:
  - `Use salt-ds to migrate this screen into Salt. Preserve action order, empty-state behavior, and keyboard flow.`
- Success signals:
  - `screen_map`, `preserve`, and `recommended_direction` are present
  - the user does not need to learn `source_outline`
  - `first_scaffold` is actionable
  - `verify` is present
- Common friction categories:
  - `docs-gap`
  - `semantic-core-gap`
  - `host-integration-gap`

### Task 4: Migrate screenshot-derived evidence

- Workflow: `migrate`
- Preferred host flow: IDE with screenshot-capable host preprocessing
- Preferred repo shape: non-Salt repo plus screenshot or mockup evidence already interpreted by the host layer
- Example prompt:
  - `Use salt-ds to migrate this screenshot-derived screen outline into Salt. Treat the screenshot evidence as supporting, keep the navigation grouping familiar, and preserve the empty state hierarchy.`
- Success signals:
  - Salt starts from the migration task, not transport explanation
  - no raw image payload reaches Salt
  - ambiguity stays visible in the answer
  - `verify` is present
- Common friction categories:
  - `host-integration-gap`
  - `transport-parity-gap`
  - `docs-gap`

## New Project Team

### Task 5: Create a bounded dashboard region

- Workflow: `create`
- Preferred host flow: IDE with `mcp-local`, CLI fallback allowed
- Preferred repo shape: new project or isolated starter repo
- Example prompt:
  - `Use salt-ds to add a finance metric dashboard with KPI cards, sparklines, and a data grid table. Keep the answer bounded and ask one blocking question only if needed.`
- Success signals:
  - `recommended_direction` is present
  - `bounded_scope` is concise
  - blocking-question count is `0` or `1`
  - `starter_plan` is actionable
  - `verify` is present
- Common friction categories:
  - `semantic-core-gap`
  - `docs-gap`
  - `skill-orchestration-gap`

## Session Rules

- Run one task at a time.
- Do not teach MCP or CLI internals unless the user is blocked.
- If live coaching is required, log that as friction.
- Save each session using [`./ai-alpha-session-template.json`](./ai-alpha-session-template.json).

## Command Baseline

Before a session, run:

- `yarn eval:deterministic`
- `yarn eval:live --runner mcp-local --scenario existing-salt-review-toolbar`
- `yarn eval:live --runner cli-local --scenario existing-salt-review-toolbar`

Use the full facilitator flow in:

- [`./ai-alpha-runbook.md`](./ai-alpha-runbook.md)
