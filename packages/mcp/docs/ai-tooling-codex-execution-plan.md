# Salt AI Tooling Codex Execution Plan

Date: 2026-05-23
Owner: AI tooling maintainers
Source review: [`./ai-tooling-competitive-gap-review.md`](./ai-tooling-competitive-gap-review.md)

## Purpose

This is a concrete handoff plan for Codex. It turns the competitive gap review into ordered implementation slices.

The guiding principle is:

> Make Salt a narrow authority, not a broad agent runtime.

Salt should own Salt truth, evidence, workflow gates, repo policy application, unsupported/degraded states, and generated context integrity. Agents and hosts should own prose, local orchestration, host quirks, runtime command execution, generic React work, and multimodal interpretation before it becomes structured Salt evidence.

## How Codex Should Work This Plan

Work one slice at a time. For each slice:

1. Read this plan and the named source files.
2. Inspect the current worktree before editing.
3. State the intended files, rationale, risk, and verification.
4. Edit only the slice's files unless new evidence proves a different file is required.
5. Run the listed verification.
6. Update this plan's status section or leave a short note in the final response.

Do not stage or commit unless explicitly asked.

## Subagent Guidance

Use subagents only for bounded read-only work. Do not let multiple agents edit the same branch at the same time.

Recommended:

- Use one research subagent for host-specific docs if network access is available and the task needs current Cursor, Windsurf, Claude, Copilot, Codex, Figma, Storybook, MUI, or shadcn details.
- Use one audit subagent after a slice to review the diff against the acceptance evidence.
- Use one test-analysis subagent only when a targeted test fails and the failure surface is broad.

Avoid:

- parallel editing subagents
- subagents making architectural decisions independently
- subagents closing evidence gaps by adding prompt-only guidance
- subagents generating host artifacts for unstable host formats before the setup-card path is complete

If subagents are unavailable, use the same division manually: research first, edit second, audit third.

## Work Queue

### Slice 1. Add First-Run Host Setup Cards

Goal:

Make the first 10 minutes clear for each major host without overgenerating host files.

Why first:

This is the highest product-risk gap and mostly documentation. It also clarifies what Salt owns versus what the host owns before code changes start.

Primary files:

- `site/docs/getting-started/ai.mdx`
- `packages/mcp/docs/host-validation-checklist.md`
- `packages/mcp/docs/README.md` if a maintainer link is useful

Implementation:

- Add setup cards for Codex, Claude Code, Cursor, VS Code Copilot, and Windsurf.
- Each card should include:
  - install/connect path
  - verification command or prompt
  - first recommended Salt prompt
  - expected compact fields to inspect
  - CLI fallback when MCP is unavailable
  - "host owns" notes for running local commands and adapting host setup
- Keep `packages/mcp/README.md`, `packages/cli/README.md`, and `packages/skills/README.md` as package references, not competing setup paths.

Scale-back rule:

Do not add generated Cursor or Windsurf artifacts in this slice. Use docs/snippets until the host formats are stable and validated.

Verification:

- `rg -n "Codex|Claude Code|Cursor|Copilot|Windsurf|Golden Setup Path" site/docs/getting-started/ai.mdx packages/mcp/docs/host-validation-checklist.md`
- `git diff --check -- site/docs/getting-started/ai.mdx packages/mcp/docs/host-validation-checklist.md`

Acceptance:

- one clear path per host
- no new public claim that raw screenshots, Figma frames, or design-tool payloads are first-class Salt MCP inputs
- host validation checklist points at the same host paths

### Slice 2. Document Generated Context Versus Direct Docs Fetch

Goal:

Answer when Salt should use generated source-backed context and when the agent should fetch or cite human docs.

Why second:

This addresses the direct-doc-fetch question without expanding runtime scope.

Primary files:

- `site/docs/getting-started/ai.mdx`
- `packages/mcp/README.md`

Implementation:

- Add a short section explaining:
  - generated registry/context is best for entity resolution, package status, evidence refs, machine-readable gates, and repeatability
  - direct docs fetch is useful for human-readable source checks, freshness investigation, and gap closure
  - agents should not bypass Salt workflow gates just because they fetched docs directly

Scale-back rule:

Do not build a docs-browsing subsystem. This is product language and workflow guidance.

Verification:

- `rg -n "generated context|direct docs|evidence refs|workflow gates|fetch docs" site/docs/getting-started/ai.mdx packages/mcp/README.md`
- `git diff --check -- site/docs/getting-started/ai.mdx packages/mcp/README.md`

Acceptance:

- docs clearly state why generated context is not merely stale copied docs
- docs preserve source URLs/evidence refs as verification, not as a replacement for workflow gates

### Slice 3. Add The Security Threat Model

Goal:

Create a focused Salt AI tooling threat model and map existing safeguards to it.

Why third:

Security is P1 and should shape later host artifact, persistence, visual evidence, and benchmark work.

Primary files:

- `packages/mcp/docs/ai-tooling-security-threat-model.md` new
- `packages/mcp/docs/README.md`
- `packages/mcp/docs/ai-tooling-change-review-rubric.md`
- targeted tests only if the doc exposes a missing guard that can be tested locally

Implementation:

- Cover:
  - tool metadata poisoning
  - MCP resource poisoning
  - prompt injection from docs, examples, source files, screenshots, `source_outline`, and generated artifacts
  - `.salt` policy trust boundaries
  - `context_id` reuse and trusted project context
  - generated context persistence and stale context
  - local MCP server compromise and filesystem writes
  - host adapter instruction conflicts
  - human confirmation boundaries for install, write, and persistence actions
- Add a checklist entry to the change-review rubric for public tools, persistence, generated context, and host adapters.

Scale-back rule:

Do not add broad security machinery until the threat model identifies a concrete missing guard. Prefer documenting existing boundaries first.

Verification:

- `rg -n "prompt injection|tool metadata|resource poisoning|context_id|persistence|host adapter|human confirmation" packages/mcp/docs/ai-tooling-security-threat-model.md packages/mcp/docs/ai-tooling-change-review-rubric.md`
- `git diff --check -- packages/mcp/docs/ai-tooling-security-threat-model.md packages/mcp/docs/README.md packages/mcp/docs/ai-tooling-change-review-rubric.md`

Acceptance:

- dedicated threat model exists
- review rubric requires security consideration for risky AI-tooling changes
- any new tests are targeted and tied to explicit threat-model gaps

### Slice 4. Add Context And Prompt Budget Guards

Goal:

Prevent always-on context from growing quietly.

Why fourth:

The branch already shortened `openai.yaml`; this makes that direction durable.

Primary files:

- `packages/skills/__tests__/skillContracts.spec.ts`
- `packages/skills/salt-ds/SKILL.md`
- `packages/skills/salt-ds/agents/openai.yaml`
- semantic-core host instruction template tests if they already cover generated instruction sizes

Implementation:

- Preserve the existing `openai.yaml` guard.
- Add reasonable size checks for:
  - `packages/skills/salt-ds/SKILL.md`
  - generated repo instruction template text
  - generated Copilot instruction text
  - public MCP tool descriptions if an existing test already enumerates tool definitions
- Add a short comment in the test explaining that budgets protect progressive disclosure, not arbitrary terseness.

Scale-back rule:

Do not shrink useful Salt-specific guidance just to satisfy a guessed threshold. If a threshold fails, split deeper guidance into references before deleting necessary gates.

Verification:

- `yarn vitest run packages/skills/__tests__/skillContracts.spec.ts`
- add any existing targeted MCP tool-definition test only if touched

Acceptance:

- tests fail if always-on prompt or instruction surfaces grow substantially
- thresholds are high enough to allow necessary Salt-specific gates

### Slice 5. Promote Structured Design Evidence Publicly

Goal:

Make host-normalized design evidence a supported lane without claiming raw visual parsing.

Why fifth:

This is the biggest competitive gap, but it should build on the narrow-authority boundary.

Primary files:

- `site/docs/getting-started/ai.mdx`
- `workflow-examples/migration-visual-grounding/README.md`
- `packages/semantic-core/schemas/migrate-visual-evidence-request.schema.json`
- `packages/semantic-core/schemas/migrate-visual-evidence-response.schema.json`
- `packages/mcp/src/__tests__/hostAttachmentEval.spec.ts` only if examples or expectations change

Implementation:

- Add a public design-evidence section that links the schema paths.
- Explain:
  - host inspects screenshot/Figma/story evidence
  - host normalizes to `migrate_visual_evidence_v1` or `source_outline`
  - Salt validates and uses structured evidence
  - uncertainty must remain visible
- Add short host-normalization snippets for Codex, Claude, Copilot, Cursor, and Windsurf where the host can accept attachments.

Scale-back rule:

Do not add raw screenshot, Figma, or design-tool payloads as MCP workflow inputs. Do not parse pixels in Salt MCP.

Verification:

- `rg -n "migrate_visual_evidence_v1|source_outline|raw screenshot|Figma|design-tool|uncertainty" site/docs/getting-started/ai.mdx workflow-examples/migration-visual-grounding/README.md`
- `yarn vitest run packages/mcp/src/__tests__/hostAttachmentEval.spec.ts packages/mcp/src/__tests__/visualEvidenceSchema.spec.ts`

Acceptance:

- public docs name the structured contract
- docs preserve the "host-mediated only" boundary
- visual evidence tests still pass

### Slice 6. Improve Blocked-State UX Without Expanding The Contract First

Goal:

Make blocked states harder for agents to bury in prose.

Why sixth:

The review flags this as UX pain, but the scale-back section says not to add fields until examples and evals prove existing fields are insufficient.

Primary files:

- `site/docs/getting-started/ai.mdx`
- `packages/skills/salt-ds/SKILL.md`
- `packages/mcp/src/__tests__/hostTraceEval.spec.ts`
- `packages/mcp/src/evals/hostTraceEval.ts` only if a missing assertion is needed

Implementation:

- Add a compact blocked-output example showing:
  - what is blocked
  - why
  - smallest next action
  - whether coding is allowed
- Teach the skill to summarize blocked states from existing fields.
- Add or strengthen host trace evals that fail when the agent edits after blocked, partial, retrieve, ask_user, or missing-evidence states.

Scale-back rule:

Do not add `blocked_explanation` or a new compact field in this slice. If examples/evals reveal existing fields are genuinely insufficient, write a follow-up proposal first.

Verification:

- `yarn vitest run packages/mcp/src/__tests__/hostTraceEval.spec.ts packages/skills/__tests__/skillContracts.spec.ts`
- `rg -n "blocked|partial|ask_user|evidence.missing|coding is allowed|do not edit" site/docs/getting-started/ai.mdx packages/skills/salt-ds/SKILL.md packages/mcp/src/__tests__/hostTraceEval.spec.ts`

Acceptance:

- docs show one blocked example
- skill tells agents how to explain blocked states from existing fields
- host trace eval catches coding after blocked or incomplete workflow states

### Slice 7. Create The Cross-Host Benchmark Packet

Goal:

Create a small, repeatable real-host validation packet without trying to fully automate every host.

Why seventh:

The local evals prove workflow logic; this proves host behavior enough for product confidence.

Primary files:

- `packages/mcp/docs/host-validation-checklist.md`
- `packages/mcp/docs/ai-tooling-host-benchmark-packet.md` new, or a machine-readable fixture if an existing eval format is clearly reusable
- optional `workflow-examples/host-benchmark/` if examples need files

Implementation:

- Define scenarios:
  - exact component request
  - broad product prompt
  - mixed surface follow-through
  - migration from non-Salt UI
  - repo-policy conflict
  - screenshot/Figma-derived structured evidence
  - runtime validation request
  - missing evidence / blocked state
  - MCP unavailable, CLI fallback
- For each scenario record:
  - prompt
  - expected workflow
  - required compact fields
  - allowed host behavior
  - failure classifications
- Add result templates for Codex, Claude Code, Cursor, Copilot, and Windsurf.

Scale-back rule:

Do not automate every host in this slice. A small result template plus one local MCP/CLI run is enough to start.

Verification:

- `rg -n "Codex|Claude Code|Cursor|Copilot|Windsurf|failure classification|compact fields" packages/mcp/docs/host-validation-checklist.md packages/mcp/docs/ai-tooling-host-benchmark-packet.md`
- `git diff --check -- packages/mcp/docs/host-validation-checklist.md packages/mcp/docs/ai-tooling-host-benchmark-packet.md`

Acceptance:

- benchmark packet can be handed to a person or agent
- no claim that all hosts have passed until result artifacts exist
- failure taxonomy is explicit

### Slice 8. Add Runtime Validation Guidance, Not A Runtime Subsystem

Goal:

Define how Salt should consume runtime evidence from Storybook, app URLs, Playwright, axe, or repo scripts.

Why eighth:

This addresses the Storybook gap while preserving the model-owned/runtime-host boundary.

Primary files:

- `site/docs/getting-started/ai.mdx`
- `packages/mcp/docs/host-validation-checklist.md`
- existing review/runtime docs if present

Implementation:

- Add guidance for agents:
  - if a Storybook or app URL exists, run host/browser validation outside Salt
  - feed findings back into Salt review or migration workflow as evidence
  - separate Salt design-system issues from generic runtime/a11y/build issues
  - rerun validation after edits
- Add a host validation checklist scenario for runtime evidence.

Scale-back rule:

Do not build a browser runner, Storybook runner, or axe runner into Salt MCP in this slice.

Verification:

- `rg -n "Storybook|app URL|Playwright|axe|runtime evidence|rerun validation" site/docs/getting-started/ai.mdx packages/mcp/docs/host-validation-checklist.md`
- `git diff --check -- site/docs/getting-started/ai.mdx packages/mcp/docs/host-validation-checklist.md`

Acceptance:

- docs explain the loop
- host owns command execution
- Salt owns interpretation of Salt-specific evidence

### Slice 9. Clarify MCP Package Size And Publish Boundaries

Goal:

Make the MCP/CLI size difference understandable and reviewable.

Why ninth:

This lowers review friction without changing runtime behavior.

Primary files:

- `packages/mcp/README.md`
- `packages/cli/README.md`
- `ai-tooling-branch-review-brief.md`
- package manifests if publish `files` lists need clarification

Implementation:

- Explain:
  - MCP carries generated registry/runtime payload and server/tool definitions
  - CLI is thinner because it exposes command surfaces over shared workflow logic
  - eval fixtures and replay traces are verification assets, not public runtime promises
  - archive/baseline docs are intentionally outside the core implementation PR
- If package publish contents are ambiguous, inspect `package.json` `files` fields before editing.

Scale-back rule:

Do not delete eval fixtures or tests in this slice. Only clarify package-size rationale and identify future split candidates.

Verification:

- `rg -n "generated registry|runtime payload|eval fixtures|publish|package size|CLI is thinner|MCP carries" packages/mcp/README.md packages/cli/README.md ai-tooling-branch-review-brief.md`
- `git diff --check -- packages/mcp/README.md packages/cli/README.md ai-tooling-branch-review-brief.md`

Acceptance:

- reviewers can tell why MCP is larger
- no runtime files are removed
- future split candidates are documented without being actioned

### Slice 10. Close High-Frequency Context Gaps Separately

Goal:

Reduce unsupported docs/registry gaps with source-backed evidence only.

Why last:

This is real product completeness work, but it should not block the authority boundary, security model, adoption path, or proof system.

Primary files:

- `packages/mcp/docs/ai-tooling-context-gap-catalog.md`
- `packages/mcp/docs/ai-tooling-evidence-gap-register.md`
- source docs/registry extraction files identified by the gap
- semantic-core tests for context coverage

Implementation:

- Pick one gap per PR or per Codex run.
- Start with likely high-frequency gaps:
  - File upload
  - Menu button
  - List filtering
  - Comments
  - Formatted input
  - Indication
  - measured/opacity/track token policy gaps
- Add source-backed docs or registry evidence only.
- Regenerate or update gap artifacts through existing generators/tests.

Scale-back rule:

Do not close a gap with skill text, prompt guidance, or hardcoded Salt facts. Unsupported is better than invented.

Verification:

- use the existing context coverage tests/generation commands discovered in the codebase
- `rg -n "Total:|Pattern:|Foundation:|unsupported|missing_optional_evidence" packages/mcp/docs/ai-tooling-context-gap-catalog.md`
- targeted semantic-core tests for the touched extractor/gap

Acceptance:

- gap count decreases or records become more precise
- evidence refs point to source-backed docs/registry data
- no prompt-only closure

## Recommended Execution Order

Run the first seven slices before starting broad code changes:

1. First-run host setup cards
2. Generated context versus direct docs fetch
3. Security threat model
4. Context and prompt budget guards
5. Structured design evidence public contract
6. Blocked-state UX from existing fields
7. Cross-host benchmark packet

Then choose based on risk:

- If reviewers are blocked on branch size, do Slice 9.
- If product proof is blocked on runtime loops, do Slice 8.
- If product completeness is blocked on unsupported states, do Slice 10 one gap at a time.

## Codex Prompt To Use

```text
Read packages/mcp/docs/ai-tooling-codex-execution-plan.md and packages/mcp/docs/ai-tooling-competitive-gap-review.md.

Work on the next incomplete slice only.

Before editing, report:
- slice name
- files you expect to touch
- rationale
- risks
- verification commands

Then implement only that slice, run the listed verification, and summarize what remains.
Do not stage or commit.
```

## Done Criteria For The Whole Plan

The plan is complete when:

- every slice has either landed or been deliberately marked out of scope with rationale
- public docs preserve Salt as a narrow authority
- no new raw Figma/screenshot/design-tool MCP input claim exists
- security, setup, design evidence, blocked behavior, benchmarks, and context budgets each have documented verification
- any generated host artifacts come from the source graph or are explicitly deferred as setup snippets
- unsupported docs/registry gaps are still visible unless closed by source-backed evidence
