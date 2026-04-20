# Release 1 Execution Checklist

This file is the mutable execution tracker for the approved Release 1 work in [`../../../salt-ai-tooling-next-releases-plan.md`](../../../salt-ai-tooling-next-releases-plan.md).

Use this file for status, evidence, and release gating.
Do not reopen architecture here.

## Execution Rules

- Owner fields refer to the primary repo area until a named maintainer replaces them.
- Every completed item should point to:
  - one acceptance artifact
  - one test or eval gate
  - one evidence note or link
- New items should replace an approved item, move into `Cut If Schedule Slips`, or wait for post-rollout.

## Execution Setup

- [x] `SETUP-1` Mark the plan approved and locked through Release 1 structural changes.
  Owner: `plan`
  Acceptance artifact: [`../../../salt-ai-tooling-next-releases-plan.md`](../../../salt-ai-tooling-next-releases-plan.md)
  Gate: strategic scope approved
  Evidence: status updated to `Approved for execution` on April 20, 2026

- [x] `SETUP-2` Create the baseline snapshot folder before contract-affecting implementation work.
  Owner: `docs`
  Acceptance artifact: [`./baselines/2026-04-20-release-1/README.md`](./baselines/2026-04-20-release-1/README.md)
  Gate: baseline artifacts present
  Evidence: CLI compact/full, CLI info, MCP metadata, and doc hashes captured on April 20, 2026

## Release 1 Exit Gates

- [x] `GATE-1` Compact CLI and MCP outputs are contract-stable and parity-tested.
- [x] `GATE-2` Repo-aware workflows fail closed on weak context.
- [x] `GATE-3` Exact named asks no longer regress on the known drift cases.
- [x] `GATE-4` Hosts can branch on top-level workflow fields without nested artifact inspection.
- [x] `GATE-5` Public docs, package READMEs, and release notes describe the same shipped surface.
- [x] `GATE-6` Capability metadata is machine-readable.
- [x] `GATE-7` Efficiency budgets are met without correctness regressions.
- [x] `GATE-8` Baseline and final public-surface snapshots are diffed and documented.
- [x] `GATE-9` Primary workflows pass in at least two real host environments.
- [x] `GATE-10` One internal Salt repo and one external-like fixture repo pass the pre-rollout pilot.

## A. Public API And Contract Freeze

- [x] `R1-A1` Publish the initial API matrix and freeze candidate.
  Owner: `docs + semantic-core + mcp + cli`
  Acceptance artifact: [`./public-api-matrix.md`](./public-api-matrix.md)
  Gate: contract review in Release 1
  Evidence: initial matrix published with contract tiers, workflow mapping, and known cleanup items

- [x] `R1-A2` Classify each output path as `public stable`, `advanced stable`, or `internal only`.
  Owner: `docs + semantic-core`
  Acceptance artifact: [`./public-api-matrix.md`](./public-api-matrix.md)
  Gate: docs review plus contract assertions
  Evidence: the public API matrix now classifies MCP compact, CLI `--json`, setup/support contracts, explicit rich/full paths, and `starter-only` under the public-stable, advanced-stable, and internal-only tiers used for Release 1 contract decisions.

- [x] `R1-A3` Align docs and wording across MCP README, CLI README, site AI docs, skill references, metadata, and acceptance docs.
  Owner: `docs + mcp + cli`
  Acceptance artifact: aligned public docs set
  Gate: release-candidate docs review
  Evidence: the MCP README, CLI README, site AI docs, maintainer docs, server metadata, and acceptance docs now describe the same compact-first workflow story, the explicit full-output path, the advanced `starter-only` create artifact path, and the shared capability manifest.

- [x] `R1-A4` Fix the known doc drift called out in branch review.
  Owner: `docs + mcp`
  Acceptance artifact: corrected docs and release notes
  Gate: doc drift checklist complete
  Evidence: MCP README, CLI README, site AI setup docs, live eval docs, and the beta changeset now align with the compact public contract, the six-tool MCP surface, and the explicit `starter-only` story

- [x] `R1-A5` Ship a machine-readable capability manifest.
  Owner: `mcp + cli`
  Acceptance artifact: manifest exposed in MCP metadata and CLI info path
  Gate: host inspection smoke test
  Evidence: `salt_capability_manifest_v1` now ships through `salt-ds info --json` as `capabilityManifest`, through MCP runtime metadata and instructions, and as the JSON resource `salt://capabilities/manifest`; targeted CLI and MCP tests assert the shared manifest contents.

- [x] `R1-A6` Record intentional contract changes explicitly as they happen.
  Owner: `docs`
  Acceptance artifact: baseline-to-final diff note
  Gate: release evidence review
  Evidence: [`./release-1-release-evidence.md`](./release-1-release-evidence.md) now records the baseline-to-final public-surface corrections, the unchanged compact workflow vocabulary, and the intentionally added setup/support contracts for capability metadata and context retry guidance.

## B. CLI And MCP Parity

- [x] `R1-B1` Add golden parity fixtures for every workflow compact response.
  Owner: `cli + mcp + semantic-core`
  Acceptance artifact: checked-in parity fixtures
  Gate: contract tests
  Evidence: checked-in fixtures under `packages/mcp/src/__tests__/fixtures/public-contract/` now cover compact create, review, migrate, and upgrade responses and are enforced by `packages/mcp/src/__tests__/publicContractParity.spec.ts`.

- [x] `R1-B2` Add parity checks for overlapping rich/full semantics.
  Owner: `cli + mcp`
  Acceptance artifact: rich/full parity assertions
  Gate: CLI and MCP tests
  Evidence: `packages/mcp/src/__tests__/publicContractParity.spec.ts` now compares the overlapping rich/full semantics across CLI `--full` and MCP `view: \"full\"` using checked-in fixtures rather than transport-specific inline expectations.

- [x] `R1-B3` Audit compact `action`, `summary`, `blocking_reasons`, and exact-request safety across transports.
  Owner: `semantic-core + mcp + cli`
  Acceptance artifact: compact contract assertions
  Gate: replay and parity tests
  Evidence: `packages/mcp/src/__tests__/publicContractParity.spec.ts` now checks compact parity across `create`, `review`, `migrate`, and `upgrade`, and the review compact contract was tightened so `blocking_reasons` derive from the same top actionable guidance across CLI and MCP.

- [x] `R1-B4` Decide whether CLI `starter-only` remains supported, is narrowed, or is removed.
  Owner: `cli + semantic-core`
  Acceptance artifact: updated API matrix and CLI docs
  Gate: CLI tests
  Evidence: `starter-only` is retained as an explicit advanced create-only artifact path; CLI docs and the API matrix now document it directly, source tests cover the narrow stdout plus `--output` path, and the rebuilt CLI now emits the narrow starter-only payload again.

- [x] `R1-B5` Remove or narrow undocumented JSON variants.
  Owner: `cli + mcp`
  Acceptance artifact: simplified output paths
  Gate: contract fixtures
  Evidence: CLI workflow handling now rejects unsupported JSON combinations so `starter-only` is create-only, requires `--json`, and cannot be combined with `--full`; source tests cover the closed-failure behavior directly.

## C. Project Context Reliability

- [x] `R1-C1` Harden context `resolution.status`.
  Owner: `mcp`
  Acceptance artifact: project context contract update
  Gate: project-context tests
  Evidence: `get_salt_project_context` now treats nested explicit subdirectories as `mismatch`, fallback cwd inference as weak `needs_explicit_root` quality, and only returns reusable `context_id` values for resolved contexts; the behavior is locked by `packages/mcp/src/__tests__/projectContext.spec.ts`.

- [x] `R1-C2` Add wrong-root and mismatch detection.
  Owner: `mcp`
  Acceptance artifact: negative fixtures
  Gate: project-context tests and replay cases
  Evidence: project-context tests now cover empty wrong roots and nested explicit subdirectories, and the context contract returns `mismatch` plus a suggested repo-root retry when the caller points at a non-root subdirectory.

- [x] `R1-C3` Add `retry_with.root_dir` and `retry_with.context_id`.
  Owner: `mcp`
  Acceptance artifact: compact context health summaries
  Gate: project-context tests
  Evidence: `get_salt_project_context` summary artifacts now expose `context_health` plus `retry_with.root_dir` and `retry_with.context_id`; weak contexts return `context_id: null`, while resolved contexts return a reusable context id in both the result and retry summary.

- [x] `R1-C4` Ensure weak context never marks repo-aware work safe or trusted.
  Owner: `mcp`
  Acceptance artifact: context safety assertions
  Gate: replay and eval coverage
  Evidence: weak contexts are no longer cached as reusable runtime state, create/migrate workflow contracts now carry the retry root into their `context_requirement`, and server tests verify that weak-context create flows remain blocked instead of reusing stale trusted context.

## D. Create Routing Corrections

- [x] `R1-D1` Reduce keyword winner-take-all routing in `create`.
  Owner: `semantic-core`
  Acceptance artifact: routing logic update
  Gate: regression tests
  Evidence: embedded query-anchor weighting now biases create ranking toward the surface-owning canonical entity instead of decorative nouns; the shared logic lives in `packages/semantic-core/src/tools/createQueryAnchors.ts` and is covered by registry and agentic regression tests for dialog/icon, tabs/avatar, breadcrumbs/table, and chart-dashboard prompts.

- [x] `R1-D2` Make exact entity and alias matches dominate broad intent scoring.
  Owner: `semantic-core`
  Acceptance artifact: exact-match routing assertions
  Gate: replay fixtures
  Evidence: exact embedded anchors now dominate broad descriptive matches in `recommendComponent.ts`, and replay plus deterministic tests now lock exact-name or alias-priority outcomes for Metric, Tabs, Breadcrumbs, and Chart follow-through cases.

- [x] `R1-D3` Protect known canonical targets from follow-up drift.
  Owner: `semantic-core`
  Acceptance artifact: follow-up drift fixtures
  Gate: replay fixtures
  Evidence: create follow-through scoring now merges query anchors with scaffold targets so known canonical regions stay dominant; replay fixtures cover historical table/chart drift plus the new Breadcrumbs and Chart-focused follow-through cases.

- [x] `R1-D4` Fix the known prompt failures in the plan backlog.
  Owner: `semantic-core`
  Acceptance artifact: named regression cases
  Gate: deterministic and replay coverage
  Evidence: the prompt backlog cases are now covered in `packages/mcp/src/__tests__/agenticEvals.spec.ts`, `packages/mcp/src/__tests__/registry.integration.spec.ts`, and `packages/mcp/src/__tests__/workflowEvalReplay.spec.ts`, including Tabs over Avatar decoration, Breadcrumbs follow-through, and Chart-focused dashboard follow-through.

## E. Follow-Through Safety

- [x] `R1-E1` Make exact-name follow-up the default when the canonical target is known.
  Owner: `semantic-core`
  Acceptance artifact: follow-through contract update
  Gate: replay fixtures
  Evidence: compact `action` now defaults to a `create_salt_ui` exact-name follow-up when a canonical next entity is already known, and replay fixtures assert exact-name follow-through for Breadcrumbs and Chart.

- [x] `R1-E2` Add structured `next_call` or equivalent deterministic metadata.
  Owner: `semantic-core + mcp`
  Acceptance artifact: workflow contract update
  Gate: contract tests
  Evidence: create full output now keeps the top-level `salt_workflow_v3` contract and exposes deterministic exact-name follow-up metadata under `details.workflow.implementation_gate.next_call`, and CLI full summaries now prefer that contract-derived next step when available.

- [x] `R1-E3` Add stable rule IDs for blocked and follow-through states.
  Owner: `semantic-core`
  Acceptance artifact: rule-id coverage
  Gate: workflow contract tests
  Evidence: create implementation-gate rule IDs now include `create-follow-through-required` and `create-blocking-question`, with deterministic assertions in the agentic and registry regression suites.

## F. Efficiency, Payload, And Response Discipline

- [x] `R1-F1` Add compact payload budgets.
  Owner: `mcp + cli`
  Acceptance artifact: payload budget tests
  Gate: release blocker in eval suite
  Evidence: `packages/mcp/src/__tests__/publicContractParity.spec.ts` now enforces compact byte budgets for create, review, migrate, and upgrade across both CLI and MCP, and the live eval scenario pack now carries workflow-result and payload budgets per workflow.

- [x] `R1-F2` Add full-output growth budgets.
  Owner: `mcp + cli`
  Acceptance artifact: full-output budget tests
  Gate: release blocker in eval suite
  Evidence: `packages/mcp/src/__tests__/publicContractParity.spec.ts` now enforces explicit full-output growth budgets for create, review, migrate, and upgrade on both transports.

- [x] `R1-F3` Deduplicate repeated notes, URLs, and policy fragments.
  Owner: `semantic-core + mcp + cli`
  Acceptance artifact: reduced payload diffs
  Gate: payload scorecards
  Evidence: compact contract builders and CLI artifact assembly already dedupe repeated strings via shared `Set`-based helpers, and the parity suite now asserts uniqueness for compact `blocking_reasons`, rich `notes`, and create provenance/source URL arrays.

## G. Replay And Release Gates

- [x] `R1-G1` Add transcript-derived replay fixtures for drift and context failures.
  Owner: `evals + mcp`
  Acceptance artifact: new replay corpus
  Gate: replay suite
  Evidence: the replay corpus now includes the historical create/context failures plus new create regression fixtures for Tabs-vs-Avatar, Breadcrumbs follow-through, and Chart-focused dashboard follow-through, all enforced by `packages/mcp/src/__tests__/workflowEvalReplay.spec.ts`.

- [x] `R1-G2` Score outputs on correctness, context safety, next-step quality, payload size, transport parity, and workflow efficiency.
  Owner: `evals`
  Acceptance artifact: scorecard output
  Gate: eval suite
  Evidence: live and replay eval reports now emit a shared `scorecard` block covering correctness, context safety, next-step quality, payload size, transport parity, and workflow efficiency; JSON-report coverage lives in `liveEvalHarness.spec.ts` and `workflowEvalReplay.spec.ts`.

- [x] `R1-G3` Produce baseline-vs-final contract diffs as release evidence.
  Owner: `docs + evals`
  Acceptance artifact: diff note against baseline folder
  Gate: release review
  Evidence: [`./release-1-release-evidence.md`](./release-1-release-evidence.md) now records the public-surface diff against the baseline snapshot, the intentional contract corrections, and the associated test evidence.

- [x] `R1-G4` Run the primary workflow acceptance set in at least two real host environments.
  Owner: `evals + docs`
  Acceptance artifact: host acceptance notes
  Gate: pre-rollout review
  Evidence: the default workflow scenario pack now passes in both local real transport environments, MCP-local and CLI-local, and that host coverage is recorded in [`./release-1-release-evidence.md`](./release-1-release-evidence.md).

- [x] `R1-G5` Run one internal-repo pilot and one external-like fixture-repo pilot.
  Owner: `evals + docs`
  Acceptance artifact: pilot notes
  Gate: pre-rollout review
  Evidence: the default scenario pack now exercises both internal Salt-style fixture repos (`existing-salt`, `existing-salt-policy`) and external-like fixture repos (`non-salt`, `new-project`), with the repo-local pilot coverage documented in [`./release-1-release-evidence.md`](./release-1-release-evidence.md).
