# Host Validation Checklist

Use this checklist for one real supported-host validation pass on the current
build. For the fuller scenario packet and result template, use
[`ai-tooling-host-benchmark-packet.md`](./ai-tooling-host-benchmark-packet.md).

Goal:

- prove the latest runtime works in a real agent host
- verify the host follows the compact-first workflow
- confirm retrieval support and follow-through behave correctly

## Setup

- Start from the host setup cards in
  [`../../../site/docs/getting-started/ai.mdx`](../../../site/docs/getting-started/ai.mdx#host-setup-cards).
- Record which host and editor or terminal surface is under test.
- Enable the Salt skill/support path in the host if available.
- Confirm Salt MCP is connected, or record why the CLI fallback is being used.
- Confirm the host can see the Salt tools or CLI command.
- Confirm the host can read the capability manifest and report compact workflow contract `v1`.
- Confirm the host follows [`salt_workflow_v1` action semantics](./salt-workflow-v1-host-contract.md): only `action.kind = implement` permits Salt UI edits, and only with complete evidence.

## Setup Smoke Check

Before the core scenarios, run the first-prompt verification from the matching
public setup card. Record:

- host name and surface
- MCP status
- CLI fallback status
- Salt MCP or CLI version
- setup command or config path used
- compact fields the host reported before implementation detail
- whether host instructions stayed guidance and did not invent Salt facts

If MCP setup is unavailable, record the reason and use the CLI fallback from the
same setup card.

## Core Scenarios

Run these in order. For release-readiness runs, also complete the benchmark
packet and save a result artifact against
[`host-results/salt-ai-tooling-host-result.schema.json`](./host-results/salt-ai-tooling-host-result.schema.json).

Use
[`ai-tooling-host-benchmark-scenarios.json`](./ai-tooling-host-benchmark-scenarios.json)
as the machine-readable scenario list when recording host results.

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
- no drift to navigation or dashboard patterns

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

### 6. Runtime Evidence Loop

Prompt:

`Review the Salt view against the local component preview or app URL. Use host or browser validation if needed, then separate Salt-specific findings from generic runtime, accessibility, or build findings.`

Pass:

- source validation happens before runtime inspection
- the host runs a component preview, app URL check, browser inspection, accessibility check, or repo script outside Salt
- the command, URL, or runtime artifact is recorded
- runtime evidence is fed back into Salt review or migration as observations, not policy
- Salt design-system findings are separated from generic runtime, accessibility, and build findings
- after edits, the host performs rerun validation and records the result
- Salt MCP is not treated as a browser, component-preview, accessibility, or app runner

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
- runtime evidence source when present, such as component preview, app URL, browser inspection, accessibility check, or repo script
- classification of Salt-specific findings versus generic runtime, accessibility, or build findings
- rerun validation result after edits
- whether the host asked for `view: "full"` immediately

The runtime validation report should distinguish Salt design-system issues,
runtime issues, accessibility issues, build/test issues, and missing evidence.
Use
`workflow-examples/migration-visual-grounding/legacy-orders.runtime-validation.example.json`
as the report shape until this becomes a generated artifact contract.

## What Good Looks Like

- compact `create` is enough to establish the owner
- `full` is only used after the owner is grounded
- `request` stays populated
- `partial` does not get treated as done
- `ask_user` stops host implementation until the user answers; the answer becomes updated workflow input, not an evidence bridge
- `install_dependencies` happens before Salt UI edits when Salt packages are missing
- `retrieve_entity` and `retrieve_examples` are treated as evidence gathering and rerun inputs, not permission to code
- exact follow-through stays exact on the next call

## Sign-Off Rule

Treat the host pass as good enough for rollout when:

- all six scenarios resolve to the expected owner or evidence state
- follow-through is correct for the `Tabs/Avatar` and `Table/Breadcrumbs` cases
- the runtime evidence scenario records host-run validation and keeps Salt-specific interpretation separate
- no empty `request` objects appear
- no scenario ends with a clearly wrong owner while the host still acts as though the workflow is complete

If one scenario fails, fix the failure class and rerun only that class plus one neighboring scenario before widening scope.
