# AI Tooling Branch Review Brief

## Objective

Reduce this AI tooling branch to a reviewable core PR while preserving the architecture direction.

The cleanup is part of addressing the review findings, especially adoption complexity. A huge branch makes the product story harder to review, adopt, and trust.

## Architecture Direction

Keep the core model:

- `semantic-core` is the source-backed Salt truth layer.
- MCP and CLI are transports over the same workflow model.
- `salt-ds` is the public agent skill/orchestrator.
- Compact workflow output is authoritative.
- Rich/full output is additive only.
- Repo policy is an overlay, not canonical Salt guidance.
- Missing evidence should fail closed or return unsupported/degraded states.

## Findings To Address

1. Adoption complexity is the main product risk.
2. `create` must stay thin; retrieval/support should not become broad guessing inside `create`.
3. Visual/design handoff should stay structured and host-mediated for now; do not claim raw screenshot, Figma, or design-tool input as first-class MCP support.
4. Evidence gaps should remain visible through source-backed gap tracking and fail-closed behavior.
5. Always-on prompt/context weight should be kept small, with progressive references used where possible.

## Non-Negotiables

- Do not remove `site/component-ia-proposal.md`.
- Do not remove `site/docs-ia-template-proposal.md`.
- Do not remove `packages/theme/css/deprecated/token-replacements.json` unless it is proven unused; it appears to be source evidence for token policy.
- Do not remove source-backed schema, contract, or evidence validation without identifying the replacement.
- Do not stage or commit unless explicitly asked.
- Treat existing dirty worktree changes as intentional user work.

## Cleanup Decisions Already Made

- Removed copied `.agents/skills/ada-accessibility-skill` content.
- Removed static `design-system/components` starter-kit context artifacts.
- Removed leftover static `design-system/patterns` and `design-system/foundations` starter-kit context artifacts.
- Removed generated MCP baseline snapshots and archived release-history docs from the core implementation PR.
- Kept evals and workflow examples in the core branch for now because active tests and workflow validation depend on them.
- Reviewed MCP and CLI test weight and kept contract/safety coverage instead of deleting broad test files.
- Refined `packages/skills/salt-ds/agents/openai.yaml` into a compact evidence-first OpenAI host prompt.
- Reworked the first-run docs so `site/docs/getting-started/ai.mdx` is the single golden setup path and package READMEs are reference docs.
- Removed root AI tooling planning docs:
  - `PLAN.md`
  - `salt-ai-tooling-competitor-learnings-plan.md`
  - `salt-ai-tooling-next-releases-plan.md`
  - `salt-ai-tooling-positioning-memo.md`
  - `salt-ai-tooling-public-contract-acceptance.md`
  - `salt-ai-tooling-public-contract-plan.md`
  - `salt-ai-tooling-refactor-plan.md`
- Kept IA proposal files under `site/`.

## Work Queue

### 1. Leftover Design-System Starter-Kit Files

Status: addressed

Inspect:

- `design-system/patterns`
- `design-system/foundations`

Decision: removed. These were static starter-kit artifacts rather than source-backed generated context used by the current architecture.

### 2. MCP Baselines And Archive Docs

Status: addressed

Inspect:

- `packages/mcp/docs/baselines`
- `packages/mcp/docs/archive`

Decision: removed from the core implementation PR. If the historical evidence trail is needed, restore it in a separate generated-baselines/docs-history PR.

### 3. Evals And Workflow Examples

Status: kept for now

Inspect:

- `packages/mcp/eval-fixtures`
- `packages/mcp/src/evals`
- `workflow-examples`
- tests that depend on those paths

Decision: keep in this branch for now. These assets support active eval and schema/policy tests; split later only with the dependent tests/scripts.

### 4. MCP And CLI Test Weight

Status: reviewed

Inspect large test files and determine which are essential for the first core PR versus better suited to a follow-up verification PR.

Decision: no broad test deletion for now. Preserve contract/safety coverage; consider splitting eval/scenario verification only if item 3 is split.

### 5. `openai.yaml` Prompt Weight

Status: addressed

Inspect:

- `packages/skills/salt-ds/agents/openai.yaml`
- `packages/skills/salt-ds/SKILL.md`
- skill reference files

Decision: refined `openai.yaml` to a compact evidence-first prompt while preserving the hard gate, no-invention policy, action loop, degraded-output behavior, and progressive references.

### 6. First-Run Adoption Path

Status: addressed

Inspect:

- `site/docs/getting-started/ai.mdx`
- `packages/mcp/README.md`
- `packages/cli/README.md`
- `packages/skills/README.md`

Decision: `site/docs/getting-started/ai.mdx` now owns the golden setup path. `packages/mcp/README.md`, `packages/cli/README.md`, and `packages/skills/README.md` act as package/reference docs.

## Codex Working Rules

When continuing this cleanup:

1. Work on one queue item at a time.
2. Before deleting anything, list exact paths, rationale, dependency risk, and estimated line savings.
3. Do not edit until the deletion/split plan for that queue item is approved.
4. Prefer `rg` and `git diff --numstat origin/main` for investigation.
5. Use `apply_patch` for manual edits.
6. Run targeted tests after risky removals or contract changes.
7. Keep final answers focused on what changed, what remains, and what was not verified.

## Suggested Prompt

```text
Read ai-tooling-branch-review-brief.md. Work on the next pending work queue item only.

First show the exact paths, rationale, dependency risk, and estimated line savings.
Do not edit yet.
```
