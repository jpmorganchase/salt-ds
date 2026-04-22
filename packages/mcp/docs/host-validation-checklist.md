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
- Confirm the host can read the capability manifest and report compact workflow contract `v3`.

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
- no drift to `Navigation`, `Vertical navigation`, or dashboard patterns

### 3. Owner + Wayfinding Follow-Through

Prompt:

`Create a file browser with a path trail above a table of files and folders.`

Pass:

- owner resolves to `Table`
- `Breadcrumbs` appears as the required follow-through
- next action points to `Breadcrumbs`

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
- `action.args.query` when present
- whether the host asked for `view: "full"` immediately

## What Good Looks Like

- compact `create` is enough to establish the owner
- `full` is only used after the owner is grounded
- `request` stays populated
- `partial` does not get treated as done
- exact follow-through stays exact on the next call

## Sign-Off Rule

Treat the host pass as good enough for rollout when:

- all five scenarios resolve to the expected owner
- follow-through is correct for the `Tabs/Avatar` and `Table/Breadcrumbs` cases
- no empty `request` objects appear
- no scenario ends with a clearly wrong owner while the host still acts as though the workflow is complete

If one scenario fails, fix the failure class and rerun only that class plus one neighboring scenario before widening scope.
