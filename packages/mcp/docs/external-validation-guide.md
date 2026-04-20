# External Validation Guide

Use this guide after the repo-local Release 1 work is complete.

Goal:

- validate the shipped `salt_workflow_v3` surface in a real host outside the repo test harness
- validate one real consumer-like repo flow outside the fixture repos
- capture lightweight sign-off evidence before broader rollout

This is not another refactor pass.
It is a short rollout-validation runbook.

## Recommended Scope

Run two checks:

1. one real MCP host smoke test
2. one real repo pilot, which can use CLI

Recommended minimum time budget: `30-60` minutes.

## Pass Criteria

Release 1 external validation counts as complete when all of these are true:

1. A real MCP host can discover and use the default Salt MCP surface without custom maintainer-only setup.
2. The host can branch from top-level `salt_workflow_v3` fields:
   - `status`
   - `request`
   - `safety`
   - `action`
   - `summary`
3. A real consumer-like repo can use the CLI workflow outputs without needing hidden maintainer knowledge.
4. Wrong-root or weak-context cases fail closed and provide a usable retry path.
5. No active docs or host instructions appear to depend on legacy `v2` field names or nested rich-only fields for basic branching.

## What To Capture

For each scenario, save:

- host or repo name
- exact prompt or command
- raw JSON result or transcript excerpt
- pass or fail
- one short note explaining any retry, confusion, or manual correction

Keep the evidence lightweight.
Do not write a long narrative unless something fails.

## Part 1: MCP Host Smoke Test

Use one real MCP-capable host that a consumer could realistically use.

Examples:

- Codex app
- Claude Code
- another MCP-capable IDE or agent client

### Step 1. Install Salt MCP From The Current Docs

1. Follow the current published or branch-ready setup docs exactly.
2. Do not use hidden local shortcuts that a consumer would not know.
3. Start the MCP server and confirm the host can connect.

Pass:

- setup works without ad hoc fixes
- the host shows the Salt MCP server as available

Fail:

- setup requires undocumented local knowledge
- the host cannot connect or cannot see the server

### Step 2. Inspect The Public Surface

Check that the host can see:

- the six default tools:
  - `get_salt_project_context`
  - `bootstrap_salt_repo`
  - `create_salt_ui`
  - `review_salt_ui`
  - `migrate_to_salt`
  - `upgrade_salt_ui`
- the machine-readable capability manifest
- compact workflow contract version `v3`

Pass:

- the default tool surface matches the docs
- the manifest advertises compact contract version `v3`

### Step 3. Run The Four Smoke Scenarios

Use the prompts below in the MCP host.

#### Scenario A. Exact Named Create

Prompt:

```text
Create a Metric in Salt.
```

Expected outcome:

- workflow resolves to `create`
- request resolves to `Metric`
- contract is `salt_workflow_v3`
- no legacy top-level `workflow_status` or `next_step` dependence is required
- the host can explain the next step from top-level `action` and `summary`

#### Scenario B. Decorative Drift Protection

Prompt:

```text
Create a user profile with tabs and avatar.
```

Expected outcome:

- the result stays anchored on `Tabs`
- it does not drift to `Avatar` as the primary target

#### Scenario C. Exact Follow-Through

Prompt:

```text
Create a file manager with breadcrumbs and table.
```

Expected outcome:

- the initial result can target the primary surface correctly
- follow-through points to `Breadcrumbs` via deterministic top-level `action`
- the host does not need to inspect nested `details` just to know the next safe call

#### Scenario D. Wrong Root Or Weak Context

Run the same host from a non-root or clearly wrong project directory, then ask for a repo-aware flow.

Prompt:

```text
Review this Salt UI and use repo context.
```

Expected outcome:

- the flow fails closed
- the result does not pretend the weak context is trusted
- the output includes a usable retry path such as `retry_with.root_dir`

### Step 4. Check Full-Output Escalation

Ask the host for more detail only after the compact result is returned.

Example:

```text
Now give me the full output with implementation details.
```

Expected outcome:

- compact output is enough to branch safely
- full output is only requested when more detail is needed
- full output keeps the same top-level `salt_workflow_v3` contract and adds `details`

### Step 5. Record The Host Result

Record one short summary:

- host used
- setup friction: `none`, `minor`, or `major`
- scenarios passed
- any contract confusion
- overall result: `pass` or `fail`

## Part 2: CLI Repo Pilot

Use one real repo outside the fixture repos.

Prefer one of these:

- a real consumer-like Salt repo
- a repo with partial Salt adoption
- a non-Salt repo that is a realistic migration target

### Step 1. Prepare The Repo

1. Open the repo root.
2. Confirm you are not in a nested subdirectory unless that is the scenario being tested.
3. Use the built or packaged CLI exactly the way a consumer would.

### Step 2. Run Info First

Command:

```sh
salt-ds info . --json
```

Check:

- `capabilityManifest` exists
- compact workflow contract version is `v3`
- repo/framework detection is sensible

### Step 3. Run The Core CLI Workflow Set

Run at least these:

```sh
salt-ds create "Metric" --json
salt-ds review src --json
salt-ds migrate "<brief source outline>" --json
```

Replace `src` with the real review target path in the repo being validated.

If `upgrade` is relevant in the repo, run:

```sh
salt-ds upgrade --package @salt-ds/core --from-version 1.1.0 --json
```

Check for each result:

- top-level contract is `salt_workflow_v3`
- output is small enough to read and branch from quickly
- `action` is useful and deterministic
- `blocking_reasons` are specific rather than vague
- no hidden knowledge is needed to interpret the result

### Step 4. Run One Wrong-Root Check

Move into a nested directory or use the wrong root, then run:

```sh
salt-ds info . --json
```

If repo-aware create, review, or migrate is being tested, run one of those too.

Check:

- weak context is visible
- trusted context is not inferred incorrectly
- retry guidance is actionable

### Step 5. Optional Full-Output Check

Run one `--full` command:

```sh
salt-ds create "Metric" --json --full
```

Check:

- top-level contract is still `salt_workflow_v3`
- extra detail lives under `details`
- full output adds useful depth rather than changing the public meaning

### Step 6. Record The Repo Result

Record:

- repo used
- commands run
- whether the outputs were actionable
- any confusing field or doc wording
- overall result: `pass` or `fail`

## Evidence Template

Use one block per scenario:

```md
## Scenario

- Environment: `MCP host` or `CLI repo pilot`
- Host or repo:
- Prompt or command:
- Expected:
- Actual:
- Result: `pass` or `fail`
- Notes:
```

## Sign-Off Rule

Use this simple rule:

- `Pass`: all required scenarios pass, no contract confusion, no setup blockers
- `Pass with minor follow-up`: all required scenarios pass, but there is one doc or UX cleanup item
- `Fail`: any scenario depends on hidden maintainer knowledge, old field names, wrong-root false trust, or transport-specific confusion

## Recommended Next Action

If this guide passes cleanly:

- treat Release 1 as externally validated
- keep Release 2 narrow
- do not reopen the public contract again before rollout

If this guide fails:

- fix the specific setup, contract, or host issue
- rerun only the failed scenario plus one neighboring sanity scenario
- do not expand scope into new architecture work
