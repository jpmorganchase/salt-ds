# AI Tooling Host Benchmark Packet

Use this packet to run the same Salt AI workflow checks in a real agent host.
It is a reusable validation handoff, not a claim that any host has passed.

Run the setup smoke checks in
[`host-validation-checklist.md`](./host-validation-checklist.md) before recording
benchmark results here.

The machine-readable scenario list lives in
[`ai-tooling-host-benchmark-scenarios.json`](./ai-tooling-host-benchmark-scenarios.json).
Keep the JSON and this packet aligned when adding, removing, or renaming
scenarios.

## Purpose

This packet checks whether a host can use Salt as a narrow authority:

- call Salt MCP or the CLI fallback for source-backed workflow guidance
- report compact workflow fields before implementation detail
- gather missing evidence before editing Salt UI
- keep host, repo, runtime, and visual evidence separate from Salt facts
- expose blocked states clearly instead of treating partial output as done

Do not use this packet to compare visual polish or generic coding ability. The
goal is repeatable workflow behavior.

## Required Compact Fields

Capture these compact fields for every scenario when the workflow surface can
return them:

- `workflow`
- `status`
- `request.resolved_entity`
- `request.match_status`
- `safety.exact_request_safe`
- `safety.blocking_reasons`
- `action.kind`
- `next_required_action.kind`
- `allowed_next_actions`
- `recipe.steps`
- `questions`
- `evidence.status`
- `evidence.missing`
- `summary`
- `context_id` when the workflow is repo-aware

If the CLI fallback cannot expose one field directly, record the closest CLI
output field and mark the missing compact field in the result notes.

## Failure Classifications

Use one or more of these labels for failed or partial runs:

- `host_instruction`: the host ignored setup guidance, skill guidance, rules, or
  compact-first reporting.
- `mcp_transport`: the MCP server, tool listing, schema, timeout behavior, or
  tool invocation failed.
- `workflow_contract`: required compact fields, action semantics, or compact/full
  behavior did not match the workflow contract.
- `evidence_gap`: Salt correctly identified missing support or missing evidence.
- `agent_behavior`: the host fabricated evidence, edited too early, buried a
  blocker, or requested full output before the owner was grounded.
- `repo_policy`: repo root, `.salt` policy, generated context, or project
  instruction handling conflicted with the workflow.
- `visual_evidence`: raw screenshot or design-tool payload handling bypassed the
  structured evidence contract or dropped uncertainty.
- `runtime_validation`: the host failed to run, cite, or separate runtime
  validation evidence when asked.
- `cli_fallback`: MCP was unavailable and the CLI fallback was missing,
  incomplete, or semantically different.

`evidence_gap` can be a passing result when Salt blocks for the right reason and
the host reports the smallest safe next action.

## Scenario Matrix

### S1. Exact Component Request

Prompt:

`Use salt-ds to create a Metric in Salt. Report compact fields before code.`

Pass criteria:

- resolves to `Metric`
- captures compact fields before implementation
- edits only after `action.kind = implement` and `evidence.status = complete`

### S2. Broad Product Prompt

Prompt:

`Use salt-ds to create a dashboard summary area above this table with three key metrics, a status summary, and a primary action. Report compact fields before code.`

Pass criteria:

- identifies the safest Salt owner or asks a narrowing question
- reports unresolved secondary surfaces as `evidence.missing`
- avoids editing broad UI before Salt marks it safe

### S3. Mixed Surface Follow-Through

Prompt:

`Use salt-ds to create a user profile page with tabs for different sections and an avatar showing the user's initials or image. Report compact fields before code.`

Pass criteria:

- keeps the primary owner on `Tabs`
- names `Avatar` as follow-through evidence
- reruns with grounded `Avatar` evidence before implementation that uses it

### S4. Migration From Non-Salt UI

Prompt:

```text
Use salt-ds to migrate this non-Salt toolbar into Salt patterns. Report compact fields before code.

Source UI:
- left aligned page title
- search input
- two filter buttons
- primary "Create report" button
- overflow actions menu
```

Pass criteria:

- uses migrate workflow semantics
- maps only source-backed Salt surfaces
- reports unsupported or ambiguous pieces as missing evidence

### S5. Repo-Policy Conflict

Prompt:

`Use salt-ds to add a primary action to this view. The repo policy says all Salt buttons in this package must go through the local AppButton wrapper. Report compact fields before code and explain any conflict.`

Pass criteria:

- separates Salt guidance from repo policy
- reports whether repo policy changes implementation shape
- avoids treating repo policy as canonical Salt documentation

### S6. Structured Design Evidence

Prompt:

```text
Use salt-ds to migrate this design evidence. Report compact fields before code.

source_outline:
- evidence_format: migrate_visual_evidence_v1
- source_type: design_selection
- intent: settings form with notification controls
- components:
  - label: Email alerts
    role: binary_control
    state: on
    confidence: 0.88
  - label: Save changes
    role: primary_action
    confidence: 0.92
- uncertainty:
  - exact spacing and density are not trusted from the visual input
```

Pass criteria:

- accepts structured evidence, not raw screenshot or design-tool payload
- preserves confidence and uncertainty
- retrieves Salt evidence for mapped components before implementation

### S7. Runtime Validation Request

Prompt:

`Use salt-ds to review this Salt view and validate the implemented result against the local app or component preview if needed. Report compact fields and runtime evidence separately.`

Pass criteria:

- uses Salt for design-system workflow guidance
- uses host tools for app, component-preview, browser, or repo-script validation
- keeps runtime evidence separate from Salt source facts

### S8. Missing Evidence Or Blocked State

Prompt:

`Use salt-ds to create a complete drag-and-drop file upload flow with previews, validation errors, and retry states. Report compact fields before code.`

Pass criteria:

- returns `blocked`, `partial`, `ask_user`, or another non-implement action when
  Salt evidence is missing
- names missing evidence and the smallest safe next action
- avoids editing Salt UI until evidence is complete

### S9. MCP Unavailable, CLI Fallback

Prompt:

`MCP is unavailable in this host. Use the Salt CLI fallback to create a Metric in Salt, report the compact fields you can capture, and do not edit until the fallback permits implementation.`

Pass criteria:

- records MCP unavailable as the test condition
- uses the CLI fallback from the host setup card
- preserves MCP action semantics in the CLI path

## Result Artifact Intake Rules

Use one result artifact per real host run. Prefer JSON artifacts using
`schema: "salt_ai_tooling_host_result_v1"` and validate them against
[`host-results/salt-ai-tooling-host-result.schema.json`](./host-results/salt-ai-tooling-host-result.schema.json).
If a host cannot export structured JSON, link the PR note or run log from the
matching template and keep the same fields.

Each completed host artifact must include:

- host, runner, date, repo or fixture, Salt MCP package/version when used, Salt
  CLI version when used, setup smoke result, MCP status, and CLI fallback status
- one row or result object for every scenario from S1-S9
- transport, compact fields captured, outcome, failure classification, and notes
  or artifact path for every scenario
- `not_run` or explicit notes for hosts, transports, or validation surfaces not
  covered by the artifact

Partial results are useful, but they must stay partial. Use the failure
classifications in this packet, record blocked or missing-evidence outcomes as
guardrail passes only when Salt clearly names the missing evidence and smallest
safe next action, and do not mark a host as passing from a single smoke check.

For S6 design evidence results, record whether the evidence came from a real
design-host run, screenshot, component preview, or local adapter fixture. The
host must normalize raw visual or design-tool input into
`migrate_visual_evidence_v1` or `source_outline`, preserve confidence and
uncertainty, and state boundaries such as no raw screenshot parsing inside Salt
MCP.

For S7 runtime validation results, record the command, URL, component preview,
browser/app script, or other host-owned validation source. Keep Salt
design-system findings separate from runtime, accessibility, and build/test
findings. Only claim a repair loop when the artifact includes the initial
result, fix, rerun result, and any remaining proof gaps.

## Generic Result Template

- Host:
- Date:
- Runner:
- Salt MCP package/version:
- Salt CLI version:
- Repo or fixture:
- Setup smoke check result:
- MCP status:
- CLI fallback status:

| Scenario | Transport | Compact fields captured | Outcome | Failure classification | Notes or artifact path |
| --- | --- | --- | --- | --- | --- |
| S1 |  |  |  |  |  |
| S2 |  |  |  |  |  |
| S3 |  |  |  |  |  |
| S4 |  |  |  |  |  |
| S5 |  |  |  |  |  |
| S6 |  |  |  |  |  |
| S7 |  |  |  |  |  |
| S8 |  |  |  |  |  |
| S9 |  |  |  |  |  |

## Not Claimed

This packet does not claim:

- any host has passed without a completed result artifact
- raw screenshot or design-tool payloads are direct Salt MCP inputs
- Salt MCP owns browser, component-preview, accessibility, or app validation
- CLI fallback is automatically equivalent to MCP unless the result records the
  same action semantics
