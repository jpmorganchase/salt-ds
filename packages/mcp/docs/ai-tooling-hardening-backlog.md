# Salt AI Tooling Hardening Backlog

This document is a detailed implementation backlog for improving Salt AI tooling quality across:

- MCP
- CLI
- semantic-core
- skills
- evaluation harnesses
- host integration guidance

Use it as a handoff document for another agent or maintainer who needs a concrete execution list.

It is intended to supplement, not replace:

- [`./ai-v1-implementation-backlog.md`](./ai-v1-implementation-backlog.md)
- [`./ai-product-roadmap.md`](./ai-product-roadmap.md)
- [`./ai-top-tier-design-system-plan.md`](./ai-top-tier-design-system-plan.md)
- [`./maintaining-salt-ai-tooling.md`](./maintaining-salt-ai-tooling.md)

## Contents

- [Goal](#goal)
- [Scope](#scope)
- [Working Principles](#working-principles)
- [Priority Model](#priority-model)
- [P0: Context Reliability And Workflow Safety](#p0-context-reliability-and-workflow-safety)
- [P0: Recommendation Quality And Exact-Name Robustness](#p0-recommendation-quality-and-exact-name-robustness)
- [P0: Follow-Through Contract And Host Safety](#p0-follow-through-contract-and-host-safety)
- [P0: Transcript-Derived Regression Coverage](#p0-transcript-derived-regression-coverage)
- [P1: Token Efficiency And Response Shaping](#p1-token-efficiency-and-response-shaping)
- [P1: CLI Agent Ergonomics](#p1-cli-agent-ergonomics)
- [P1: Skill And Host Guidance](#p1-skill-and-host-guidance)
- [P1: Evaluation And Benchmark Discipline](#p1-evaluation-and-benchmark-discipline)
- [P2: Runtime Evidence And Visual Grounding](#p2-runtime-evidence-and-visual-grounding)
- [P2: Canonical Docs And Example Quality](#p2-canonical-docs-and-example-quality)
- [P2: Productization And Operations](#p2-productization-and-operations)
- [Host-Side Work Outside This Repo](#host-side-work-outside-this-repo)
- [Suggested Delivery Order](#suggested-delivery-order)
- [Definition Of Done](#definition-of-done)

## Goal

Make Salt feel like a top-tier AI-native design system product in real agent loops, not just in isolated tool demos.

The main problems this backlog targets are:

- wrong or weak repo context being treated as usable
- fuzzy recommendation drift after a canonical answer is already known
- oversized workflow payloads that waste tokens
- host integrations that do not know the safest next call
- limited transcript-derived regression coverage for real failures

## Scope

This backlog covers:

- `packages/mcp`
- `packages/cli`
- `packages/semantic-core`
- `packages/skills`
- maintainer docs and evaluation harnesses

This backlog does not treat the host application itself as fully owned by this repo, but it does include explicit host-facing contracts and required integration behavior.

## Working Principles

1. Keep canonical Salt rules in docs and build extraction before adding runtime heuristics.
2. Keep MCP and CLI transport-stable around the same workflow vocabulary.
3. Treat repo context as a first-class correctness dependency.
4. Prefer exact-name follow-through once canonical entities are known.
5. Optimize default outputs for agent token budgets, not only for human inspection.
6. Use transcript-derived regressions to protect against real failure modes.
7. Keep skills thin, but make host behavior constraints explicit.

## Priority Model

- `P0`
  - correctness, workflow safety, or obvious product trust failures
- `P1`
  - meaningful quality, efficiency, or usability improvements
- `P2`
  - important hardening and product polish after the most harmful failures are fixed

## P0: Context Reliability And Workflow Safety

Primary repo targets:

- [`../src/server/projectContext.ts`](../src/server/projectContext.ts)
- [`../src/server/toolDefinitions.ts`](../src/server/toolDefinitions.ts)
- [`../src/server/serverMetadata.ts`](../src/server/serverMetadata.ts)
- [`../src/__tests__/projectContext.spec.ts`](../src/__tests__/projectContext.spec.ts)
- [`../src/__tests__/createServer.spec.ts`](../src/__tests__/createServer.spec.ts)

Backlog items:

1. Add a strict `resolution.status` contract for project context:
   - `resolved`
   - `fallback`
   - `needs_explicit_root`
   - `mismatch`
2. Add explicit wrong-root detection when the resolved root is outside the active repo or missing the expected repo markers.
3. Add explicit detection for missing `package.json` in repo-aware context collection.
4. Add explicit detection for known Salt repos where Salt packages disappear from collected context unexpectedly.
5. Add `retry_with.root_dir` guidance to weak context responses.
6. Add `retry_with.context_id` guidance when later workflow calls should reuse known-good context.
7. Refuse to mark `context_checked` true when the context is weak, fallback-only, or mismatched.
8. Make repo-aware workflow tools downgrade readiness when context is unresolved.
9. Add a short host-facing explanation string for why the context is untrusted.
10. Add tests for wrong-root auto-detection.
11. Add tests for multi-root workspace behavior.
12. Add tests for nested package roots.
13. Add tests for existing Salt repos with misleading cwd values.
14. Add tests for new repos where bootstrap is recommended but context is still valid.
15. Add tests that verify weak fallback context is never cached as if it were explicit context.
16. Add a stable compact version envelope so context responses report MCP runtime, registry version, and build generation date.
17. Add stronger host-facing docs in MCP metadata explaining that the first repo-aware call should pass `root_dir`.
18. Add host-facing docs explaining that later workflow calls should reuse `context_id`.
19. Add negative tests ensuring repo-aware create/review/migrate flows do not claim repo readiness when context is weak.
20. Add a compact context health summary for agent mode so hosts can branch safely without parsing the full context object.

## P0: Recommendation Quality And Exact-Name Robustness

Primary repo targets:

- [`../../semantic-core/src/tools/recommendComponent.ts`](../../semantic-core/src/tools/recommendComponent.ts)
- [`../../semantic-core/src/tools/consumerSignals.ts`](../../semantic-core/src/tools/consumerSignals.ts)
- [`../../semantic-core/src/tools/createSaltUi.ts`](../../semantic-core/src/tools/createSaltUi.ts)
- [`../../semantic-core/src/tools/componentLookup.ts`](../../semantic-core/src/tools/componentLookup.ts)
- [`../src/__tests__/registry.integration.spec.ts`](../src/__tests__/registry.integration.spec.ts)

Backlog items:

1. Make exact component nouns like `table`, `chart`, `dialog`, `tabs`, `pagination`, and `toolbar` dominate generic layout or taxonomy wording.
2. Strengthen exact alias scoring so names like `Highcharts` and `AG Grid` behave like first-class recommendation signals.
3. Penalize unrelated category drift when the prompt already names a concrete component.
4. Treat slot and region language like `dashboard body`, `main content`, and `analytical body` as supporting context rather than the primary ranking signal.
5. Add a known-component safeguard so a fuzzy follow-up after `Table` cannot drift to unrelated controls.
6. Add stronger comparison handling for `Table` versus `Data grid`.
7. Add stronger comparison handling for `Chart` versus dashboard layout primitives.
8. Add stronger comparison handling for `Dialog` versus surface containers.
9. Add stronger comparison handling for navigation surfaces where a shell, tabs, or toolbar may compete.
10. Add a `why_not` summary in full mode for the strongest rejected alternatives.
11. Prefer canonical examples and extracted usage evidence over weaker synthetic starter snippets when possible.
12. Add starter-code sanity checks so invalid snippets do not make a recommendation look implementation-ready.
13. Add exact-name and alias regressions for chart prompts.
14. Add exact-name and alias regressions for table prompts.
15. Add regressions for prompts with slot language like `in analytical dashboard body`.
16. Add regressions for prompts with implementation detail language like `custom cell rendering and column definitions`.
17. Add regressions for fuzzy follow-up prompts after a known canonical answer.
18. Add regressions for explicit component asks embedded inside longer noun phrases.
19. Add regressions for the main common surfaces:
   - dashboard
   - table plus filters
   - form page
   - dialog workflow
   - navigation shell
20. Add a rule that broad layout components should not outrank exact component asks unless the prompt is genuinely layout-first.

## P0: Follow-Through Contract And Host Safety

Primary repo targets:

- [`../src/server/workflowOutputs.ts`](../src/server/workflowOutputs.ts)
- [`../../semantic-core/src/tools/workflowContracts.ts`](../../semantic-core/src/tools/workflowContracts.ts)
- [`../src/server/toolDefinitions.ts`](../src/server/toolDefinitions.ts)
- [`../src/__tests__/tools.spec.ts`](../src/__tests__/tools.spec.ts)

Backlog items:

1. Add a `follow_up_mode` field with values such as:
   - `exact_name`
   - `compare_named`
   - `broad_query`
   - `stop_and_fix_context`
2. When the canonical target is already known, emit exact-name follow-up guidance by default.
3. Add a structured `next_call` object that gives the host the exact next tool call shape.
4. Add `safe_to_implement` as a clearer top-level signal separate from recommendation quality.
5. Add a first-class output state for `stop_and_fix_context_first`.
6. Keep `suggested_follow_ups` small and intentional by default.
7. Stop emitting fuzzy follow-ups when the workflow already knows the canonical component or pattern.
8. Make starter code advisory, not proof of recommendation quality.
9. Add tests that fail if follow-up suggestions ignore a known canonical answer.
10. Add tests for compare-mode follow-ups like `Table` versus `Data grid`.
11. Add tests for exact-name follow-ups like `Chart` after a chart prompt is resolved.
12. Add host-facing metadata that explicitly says when free-text re-querying is discouraged.
13. Add a compact summary of blocked reasons when implementation is not yet safe.
14. Add distinct next-step guidance for:
   - fix context
   - compare two known options
   - implement the known canonical target
   - bootstrap repo policy
15. Add deterministic rule IDs for follow-through states so hosts can branch on stable identifiers.

## P0: Transcript-Derived Regression Coverage

Primary repo targets:

- [`../src/evals/workflowEvalHarness.ts`](../src/evals/workflowEvalHarness.ts)
- [`../src/evals/workflowEvalScenarios.ts`](../src/evals/workflowEvalScenarios.ts)
- [`../src/__tests__/agenticEvals.spec.ts`](../src/__tests__/agenticEvals.spec.ts)
- [`../src/__tests__/registry.integration.spec.ts`](../src/__tests__/registry.integration.spec.ts)
- [`../src/__tests__/createServer.spec.ts`](../src/__tests__/createServer.spec.ts)

Backlog items:

1. Build a transcript replay harness for real failing sessions.
2. Add replay fixtures for wrong-root context collection.
3. Add replay fixtures for chart follow-up drift.
4. Add replay fixtures for table follow-up drift.
5. Add replay fixtures for explanation turns that requested `view: "full"` unnecessarily.
6. Add replay fixtures for repeated cached artifact reads.
7. Score replay outputs on:
   - correctness
   - token size
   - next-step quality
   - context safety
8. Separate scoring for Salt-side ranking errors versus host follow-through errors.
9. Add golden diffs for high-value transcript regressions.
10. Add release gates that block shipping when core transcript scenarios regress.

## P1: Token Efficiency And Response Shaping

Primary repo targets:

- [`../src/server/workflowOutputs.ts`](../src/server/workflowOutputs.ts)
- [`../src/server/toolDefinitions.ts`](../src/server/toolDefinitions.ts)
- [`../../cli/src/commands/info.ts`](../../cli/src/commands/info.ts)
- [`../../cli/src/commands/workflow.ts`](../../cli/src/commands/workflow.ts)

Backlog items:

1. Add a true slim agent-oriented response mode for MCP.
2. Add a matching slim agent-oriented JSON mode for the CLI.
3. Make slim mode return only:
   - decision
   - why
   - confidence
   - context status
   - next step
   - minimal follow-ups
4. Move starter code behind explicit request flags in slim mode.
5. Move long alternative lists behind explicit request flags in slim mode.
6. Move raw debug data behind explicit request flags in slim mode.
7. Move long guide lists behind explicit request flags in slim mode.
8. Deduplicate repeated source URLs, notes, and policy fragments.
9. Add payload-size budgets and tests for slim mode.
10. Add payload-size budgets and tests for full mode so it does not grow without limit.
11. Add `ask_for_more` markers instead of dumping all attached evidence by default.
12. Add a reusable compact `summary` block that hosts can cache safely.
13. Make `view: "full"` visibly expensive in docs and metadata.
14. Add a compact summary specifically optimized for explanation turns.
15. Add a compact summary specifically optimized for implementation turns.
16. Stop including starter code by default on ranking-only or explanation-only turns.
17. Add tests that verify slim mode is materially smaller than existing compact/full outputs.
18. Add token-cost tracking to evaluation output.

## P1: CLI Agent Ergonomics

Primary repo targets:

- [`../../cli/src/lib/args.ts`](../../cli/src/lib/args.ts)
- [`../../cli/src/cli.ts`](../../cli/src/cli.ts)
- [`../../cli/src/commands/workflow.ts`](../../cli/src/commands/workflow.ts)
- [`../../cli/README.md`](../../cli/README.md)

Backlog items:

1. Replace the generic no-arg help with a short task-oriented workflow chooser.
2. Make unknown-command handling suggest the nearest workflow verb.
3. Add slim JSON output for `info`.
4. Add slim JSON output for `create`.
5. Add slim JSON output for `review`.
6. Add slim JSON output for `migrate`.
7. Add slim JSON output for `upgrade`.
8. Keep text mode summary-first and align JSON mode with the same philosophy.
9. Add exact-name compare examples to the CLI docs.
10. Add explicit context reuse guidance to CLI docs where relevant.
11. Add examples showing when to use full debug output versus slim output.
12. Add a stable support bundle format for failed agent sessions.

## P1: Skill And Host Guidance

Primary repo targets:

- [`../../skills/salt-ds/SKILL.md`](../../skills/salt-ds/SKILL.md)
- [`../../skills/salt-ds/references/shared/transport.md`](../../skills/salt-ds/references/shared/transport.md)
- [`../../skills/salt-ds/agents/openai.yaml`](../../skills/salt-ds/agents/openai.yaml)
- [`../../skills/__tests__/skillContracts.spec.ts`](../../skills/__tests__/skillContracts.spec.ts)
- [`../../skills/__tests__/agenticPolicyEvals.spec.ts`](../../skills/__tests__/agenticPolicyEvals.spec.ts)

Backlog items:

1. Keep the first 120 to 150 lines focused on host behavior that materially changes outcomes.
2. Add stronger examples of preserving user nouns like `table`, `chart`, `dialog`, `metric`, and `filter`.
3. Add explicit bad-prompt versus good-prompt examples.
4. Add a visible rule that once Salt knows the canonical component, the host must switch to exact-name follow-through.
5. Add explicit root-dir and context-id handling guidance.
6. Add explicit guidance for slim mode versus full mode.
7. Add troubleshooting for stale skill copies.
8. Add troubleshooting for stale MCP builds.
9. Add troubleshooting for wrong-root context.
10. Add a host cookbook with copy-paste request shapes for:
    - dashboard
    - table
    - chart
    - dialog
    - navigation
11. Add transcript-hygiene guidance telling hosts not to reread cached `content.json` unless the original result is unavailable.
12. Keep design-system intelligence references rich.
13. Keep transport/process references compact and contract-oriented.

## P1: Evaluation And Benchmark Discipline

Primary repo targets:

- [`../src/evals/workflowEvalHarness.ts`](../src/evals/workflowEvalHarness.ts)
- [`../src/evals/workflowEvalScenarios.ts`](../src/evals/workflowEvalScenarios.ts)
- [`../src/evals/hostAttachmentEval.ts`](../src/evals/hostAttachmentEval.ts)
- [`../src/__tests__/agenticEvals.spec.ts`](../src/__tests__/agenticEvals.spec.ts)

Backlog items:

1. Track correctness, token cost, latency, and payload size as first-class eval metrics.
2. Add confidence calibration evals so `medium` and `high` have measurable meaning.
3. Add benchmark suites for:
   - dashboard
   - table plus filters
   - form page
   - dialog workflow
   - navigation shell
   - migrate flows
4. Add head-to-head evals against generic non-Salt agent setups.
5. Add explanation-quality scoring in addition to recommendation correctness.
6. Add next-step-quality scoring in addition to top-1 ranking accuracy.
7. Add release gates for table/chart/dialog regressions.
8. Add an issue taxonomy for:
   - ranking drift
   - context failure
   - starter-code failure
   - host misuse
   - payload bloat
9. Add golden-output diffs for workflow contract changes.
10. Add a maintainer summary report that highlights the top failure clusters.

## P2: Runtime Evidence And Visual Grounding

Primary repo targets:

- [`../../cli/src/commands/runtimeInspect.ts`](../../cli/src/commands/runtimeInspect.ts)
- [`../../cli/src/lib/migrationVisualEvidence.ts`](../../cli/src/lib/migrationVisualEvidence.ts)
- [`../../cli/src/lib/migrationVerification.ts`](../../cli/src/lib/migrationVerification.ts)
- [`../src/__tests__/visualEvidenceSchema.spec.ts`](../src/__tests__/visualEvidenceSchema.spec.ts)

Backlog items:

1. Improve runtime target discovery for app and Storybook surfaces.
2. Normalize runtime evidence into smaller reusable summaries.
3. Add better screenshot-to-component mapping for migration-first workflows.
4. Add explicit reporting for when visual evidence helped versus when it was ignored.
5. Add stronger fallbacks when browser-session inspection is unavailable.
6. Keep runtime evidence secondary to source analysis and canonical docs.
7. Add tests proving visual evidence improves outcomes rather than only increasing payload size.

## P2: Canonical Docs And Example Quality

Primary repo targets:

- [`./canonical-doc-and-example-improvements.md`](./canonical-doc-and-example-improvements.md)
- site docs and example sources
- registry build extraction in `packages/semantic-core/src/build`

Backlog items:

1. Improve `When to use` and `When not to use` coverage for weakly differentiated components.
2. Improve canonical docs for `Table` versus `Data grid`.
3. Improve canonical docs for `Chart` and its aliases.
4. Improve canonical docs for dashboard-related layout and composition guidance.
5. Add richer canonical examples where recommendations currently depend on synthetic starter code.
6. Expand extraction so more recommendation semantics come from docs rather than runtime heuristics.
7. Prefer real example harvesting over hand-maintained fallback templates where possible.
8. Add tests that confirm docs-derived semantics improve recommendation quality.

## P2: Productization And Operations

Primary repo targets:

- [`./maintaining-salt-ai-tooling.md`](./maintaining-salt-ai-tooling.md)
- [`../README.md`](../README.md)
- [`../../cli/README.md`](../../cli/README.md)

Backlog items:

1. Publish a compatibility matrix for skill version, MCP version, CLI version, and registry version.
2. Make every workflow response report those versions compactly.
3. Add release notes that call out behavior changes in ranking and context handling.
4. Add a support bundle format for failed sessions.
5. Add optional telemetry for workflow success, follow-up drift, and payload size.
6. Add a failure-cluster dashboard for maintainers.
7. Add a staged rollout plan for recommendation changes.
8. Add a public benchmark story once the evaluation harness is stable.

## Host-Side Work Outside This Repo

These items are required for strong real-world outcomes but are not fully owned by this repo.

1. Pass explicit `root_dir` on the first Salt call.
2. Reuse `context_id` on later Salt calls.
3. Stop continuing when context returns `needs_explicit_root` or `mismatch`.
4. Default to slim response modes on explanation and triage turns.
5. Use exact-name follow-up once Salt has identified `Table`, `Chart`, or another concrete canonical target.
6. Stop rereading cached `content.json` artifacts unless the original tool result is unavailable.
7. Refresh the deployed skill copy the host actually reads.
8. Refresh the deployed MCP build when ranking changes land.
9. Avoid reinjecting oversized customization blocks every turn if the host supports lighter context reuse.

## Suggested Delivery Order

1. Add transcript-derived tests for wrong-root context and the chart/table failures.
2. Harden context resolution and repo-aware stop conditions.
3. Harden exact-name and alias-based recommendation scoring.
4. Add strict follow-up metadata so hosts get an exact next call.
5. Add slim payload modes for MCP and CLI.
6. Tighten skill and host guidance around exact-name follow-through and context reuse.
7. Add token-cost and transcript-replay evals.
8. Expand runtime-evidence and docs-derived hardening after the core failures are fixed.

## Definition Of Done

The backlog is complete when all of the following are true:

- wrong-root context no longer silently passes
- explicit table/chart prompts do not drift to unrelated components
- hosts receive a concrete exact-name follow-up path after canonical resolution
- slim modes are materially smaller than current payloads
- transcript replay shows fewer wrong turns and lower token cost
- live hosts use the updated skill copy and updated MCP build
