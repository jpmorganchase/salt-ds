# Host Validation Checklist

Use this checklist for one real supported-host validation pass on the current build.

Goal:

- prove the latest runtime works in a real agent host
- verify the host follows the compact-first workflow
- confirm retrieval support and follow-through behave correctly

## Setup

- Enable the Salt skill/support path in the host if available.
- Confirm Salt MCP is connected.
- Confirm the host can see the Salt tools.
- Confirm the host can read the capability manifest and report compact workflow contract `v1`.
- Confirm the host follows [`salt_workflow_v1` action semantics](./salt-workflow-v1-host-contract.md): only `action.kind = implement` permits Salt UI edits, and only with complete evidence.

## Core Scenarios

Run these in order.

### 1. Exact Owner

Prompt:

`Create a Metric in Salt.`

Pass:

- context is checked first when needed
- `resolved_entity = Metric`
- `match_status = exact`
- `status = success`
- no bogus blockers

### 2. Mixed Surface

Prompt:

`Create a user profile page with tabs for different sections and an avatar showing the user's initials or image.`

Pass:

- owner stays on `Tabs`
- `Avatar` is secondary follow-through, not the primary owner
- `action.kind` is `retrieve_entity`, `ask_user`, or another non-implement action until `Avatar` is grounded
- after `Avatar` is grounded, the rerun passes MCP `resolved_entities: ["Avatar"]` or CLI `--resolved-entity Avatar`
- `recipe.steps` or `evidence.missing` names the unresolved follow-through
- no drift to `Navigation`, `Vertical navigation`, or dashboard patterns

### 3. Owner + Wayfinding Follow-Through

Prompt:

`Create a file browser with a path trail above a table of files and folders.`

Pass:

- owner resolves to `Table`
- `Breadcrumbs` appears as the required follow-through
- next action points to `Breadcrumbs`
- the host does not implement Breadcrumbs from generic examples before the exact Salt follow-through is grounded

### 4. Binary Control In Form Context

Prompt:

`Create a compact control to turn email alerts on and off inside a settings form.`

Pass:

- owner resolves to `Switch`
- no broad fallback to `Forms` as the final owner

### 5. Multi-State Regional Status

Prompt:

`Create a loading, empty, or error state inside the current content region, not as a global page state.`

Pass:

- owner resolves to `Content status`
- no drift to `Spinner` as the final owner
- no global-shell or dialog overreach

## Workflow Checks

For each scenario, capture:

- tool call used
- `status`
- `resolved_entity`
- `match_status`
- `blocking_reasons`
- `action.kind`
- `next_required_action.kind`
- `allowed_next_actions`
- `recipe.steps`
- `questions`
- `evidence.status`
- `evidence.missing`
- `action.args.query` when present
- whether the host asked for `view: "full"` immediately

## What Good Looks Like

- compact `create` is enough to establish the owner
- `full` is only used after the owner is grounded
- `request` stays populated
- `partial` does not get treated as done
- `ask_user` stops host implementation until the user answers
- `install_dependencies` happens before Salt UI edits when Salt packages are missing
- `retrieve_entity` and `retrieve_examples` are treated as evidence gathering and rerun inputs, not permission to code
- exact follow-through stays exact on the next call

## Sign-Off Rule

Treat the host pass as good enough for rollout when:

- all five scenarios resolve to the expected owner
- follow-through is correct for the `Tabs/Avatar` and `Table/Breadcrumbs` cases
- no empty `request` objects appear
- no scenario ends with a clearly wrong owner while the host still acts as though the workflow is complete

If one scenario fails, fix the failure class and rerun only that class plus one neighboring scenario before widening scope.
