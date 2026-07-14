# Salt MCP Evidence Sprint Tester Handoff

## Purpose

This directory is a deterministic fixture-level harness for developing and
validating the evidence-sprint scorer. It checks whether known-good and
known-bad seeded artifacts are classified for the intended reasons. It does not
by itself prove that Salt MCP improves agent-built UI compared with simpler
context delivery.

Use this handoff to verify that the committed harness is useful, fair, and
repeatable enough to prepare a short live-agent comparison. Product/value claims
must come from independently generated outputs, not these seeded fixtures.

## Scope

The scorer-regression harness contains seeded fixtures representing three conditions:

- `closed_book`: output produced from model memory with no Salt docs or MCP contract.
- `docs_context_dump`: output produced with static Salt context, but no MCP implement gate or review contract.
- `mcp_assisted`: synthetic output shaped to exercise source-backed lookup, implement-gate evidence, unresolved-name rejection, and review-handoff scoring.

The committed `contract-history.json` files are deterministic scorer fixtures,
not captured transcripts of live MCP invocations. A passing report proves the
scorer behaves as expected; it is explicitly not valid as a product comparison.
Use independently generated artifacts and real MCP `callTool` captures for any
product-quality claim.

The retained `eval:evidence-sprint` report always carries
`valid_as_product_comparison: false`. It is not competitor evidence and must not
be presented as proof that Salt MCP is better than another design-system MCP,
static documentation, or model memory.

The sprint covers three representative UI tasks:

- `app-shell-vertical-navigation`: app shell with `VerticalNavigation`.
- `dashboard-layout`: dashboard layout with metrics, actions, and table content.
- `settings-list-workflow`: settings form and list workflow.

Do not expand this into Langfuse, SaltBench, pass^k infrastructure, telemetry,
private golden datasets, Playwright-required package behavior, or human/judge
programs during this test pass.

## Files To Review

- `packages/mcp/eval-fixtures/evidence-sprint/tasks.json`
- `packages/mcp/eval-fixtures/evidence-sprint/artifacts/**`
- `packages/mcp/src/evals/evidenceSprint.ts`
- `packages/mcp/src/evals/runEvidenceSprint.ts`
- `packages/mcp/src/__tests__/evidenceSprint.spec.ts`
- `packages/mcp/scripts/runEvidenceSprint.mjs`
- `package.json`

The artifact files intentionally use `.tsx.fixture`. The evidence runner compiles
them in memory as TSX against the repo `tsconfig.json`, while keeping intentionally
bad baselines out of the repo-wide TypeScript source set. Do not rename them to
`.tsx`.

## What To Test

Check whether the harness gives testers a clear, scoreable comparison across the
three conditions.

For each task, verify that the scorecard can detect:

- TypeScript or current Salt API errors as a hard artifact-quality gate,
- prompt-aligned Salt bindings that are missing from rendered output, including
  unused imports and accepted alternatives,
- known bad Salt compositions,
- named `@salt-ds/*` imports absent from the registry/canonical-example census,
- unresolved or unverified entity names that were not rejected in the
  MCP-assisted workflow,
- MCP implement gates that overstate available evidence,
- review findings that lack actionable suggested fixes, and
- whether follow-up practical-gate labels are declared for the generated output.

Only compile-gated artifact quality contributes to the cross-condition score.
MCP workflow integrity is reported separately, and import-census,
finding-actionability, and practical-gate checks are diagnostics rather than
score inputs.

Practical-gate entries are labels only. The scorer does not execute them and a
passing `practical_gate_labels_declared` diagnostic is not command-execution
evidence. Run the commands separately and record their results when release or
artifact verification is required.

MCP-assisted histories must contain structured `salt_workflow_v1` contract
objects. Narrative action, safety, evidence, or post-action summaries are not
accepted. An implement gate must require
`action.post_action.required_input: ["complete_updated_file"]`.

The seeded artifacts answer an evaluator question: can the harness distinguish
compiling, prompt-aligned, composition-valid output from the known failure
modes? A separate live-agent run must answer the product question: whether the
MCP-assisted workflow actually produces better UI than the two simpler
conditions.

## Commands

Run the focused sprint test first:

```powershell
yarn vitest run packages/mcp/src/__tests__/evidenceSprint.spec.ts
```

Run the evidence sprint report:

```powershell
yarn eval:evidence-sprint --json-out .salt-eval-cache/evidence-sprint-report.json
```

Then run the practical gates if you are doing release-readiness verification:

```powershell
yarn eval:deterministic
yarn typecheck
yarn workspace @salt-ds/mcp build
yarn check:ai-tooling:pack
yarn smoke:consumer --skip-build
```

On Windows, sandboxed runs may fail first with `EPERM` when spawning tools such
as esbuild, cmd.exe, or package smoke helpers. If that happens, rerun the same
command in a normal approved shell and report the exact original error.

## Expected Results

The sprint report should pass overall.

Expected fixture-self-check scorecard (not measured product outcomes):

- `task_count`: `3`
- `condition_count`: `9`
- `score_basis`: `artifact_quality`
- `closed_book`: `passed: 0`, `failed: 3`
- `docs_context_dump`: `passed: 0`, `failed: 3`
- `mcp_assisted`: `passed: 3`, `failed: 0`
- `closed_book.average_score`: `0.11`
- `docs_context_dump.average_score`: `0.44`
- `mcp_assisted.average_score`: `1`
- baseline workflow-integrity checks: `not_applicable: 3` per condition
- MCP-assisted workflow integrity: `applicable: 3`, `passed: 3`

An artifact that does not compile receives comparison score `0`, even if another
artifact criterion passes. Baselines are not failed for MCP-only contract checks.
The seeded baseline failures remain intentional and prove the harness can detect
the artifact failure modes this sprint cares about.

## Manual Review Checklist

Use this checklist when reviewing the fixture artifacts and report output:

- Do the three tasks exercise the intended scorer failure modes without being
  mistaken for a product sample?
- Are the baselines plausible, or are they too weak to be useful comparisons?
- Are the MCP-assisted artifacts better for the right reasons?
- Does every artifact compile in memory against current repo and Salt APIs?
- Are prompt-aligned imported bindings actually used in rendered output and
  distinct from the diagnostic import census?
- Does the settings task accept either `Switch` or `Checkbox`?
- Does `VerticalNavigationItemTrigger` require `VerticalNavigationItemContent`?
- Do required ancestor rules fail when the required child is absent?
- Do `Input` and `Switch` require `FormField` in the settings workflow?
- Are native table usage, nested cards, fake `href="#"`, and deprecated `Text variant` flagged where expected?
- Are unresolved probes rejected before implementation?
- Does the implement gate use structured `salt_workflow_v1` fields and require
  successful, complete evidence plus complete updated source for review?
- Does every finding include a concrete `suggested_fix`?
- Are the practical-gate labels real repo commands, with no implication that
  this scorer executed them?
- Did this change preserve the public MCP contract and read-only/offline package boundary?

## Known Good Finding Examples

Useful findings include:

- `imports.unknown-salt-export`
- `imports.required-salt-surface-missing`
- `compile.typescript-error`
- `composition.vertical-navigation-item-content`
- `composition.form-control-requires-form-field`
- `navigation.fake-href`
- `primitive-choice.native-table`
- `systemic.nested-card`
- `deprecation.text-variant`
- `contract.unresolved-probe-missing`
- `contract.invalid-workflow-contract`
- `contract.no-implement-gate`
- `contract.review-input-not-required`

Each finding should explain what failed and include a concrete remediation.

## What Not To Treat As A Failure

Do not fail the sprint because:

- seeded baseline artifacts are intentionally bad,
- `.tsx.fixture` files stay outside the repo-wide typecheck source set (the
  evidence runner compiles them in memory),
- the harness is deterministic rather than live-model driven,
- the report is small and task-specific,
- the runner writes generated output under `.salt-eval-cache`.

Those constraints are deliberate. This is the smallest local scorer check, not
a product proof or a general evaluation platform.

## Tester Output Template

Use this format when handing results back:

```text
Tester:
Date:
Branch or commit:

Commands run:
- ...

Result:
- pass/fail

Scorecard:
- closed_book:
- docs_context_dump:
- mcp_assisted:

Findings:
- [severity] [file/path] finding summary

Verdict:
- Does the synthetic scorer distinguish the seeded failure modes for the stated
  reasons?
- Is the result still clearly labeled as non-product, non-competitor evidence?
- What must change before sharing more broadly?
- What can wait?
```
