# Salt AI Tooling Competitive Gap Review

Date: 2026-05-23
Owner: AI tooling maintainers

## Scope

This review covers the current branch state for:

- `packages/semantic-core`
- `packages/mcp`
- `packages/cli`
- `packages/skills/salt-ds`
- `site/docs/getting-started/ai.mdx`
- `workflow-examples`

The goal is to compare Salt's AI tooling direction against current high-quality AI tooling patterns and identify issues, gaps, and opportunities. This file is a review artifact, not source-of-truth product guidance.

Note: `https://hereinthehive.com/` was requested as an example source, but it was not fetchable through the available search/browser tools during this pass. The review instead uses accessible primary or near-primary sources listed below.

## External Sources Checked

- Anthropic, "Building effective agents": `https://www.anthropic.com/engineering/building-effective-agents`
- Anthropic, "Equipping agents for the real world with Agent Skills": `https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills`
- Model Context Protocol, "Client Best Practices": `https://modelcontextprotocol.io/docs/develop/clients/client-best-practices`
- Model Context Protocol, "Security Best Practices": `https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices`
- Model Context Protocol, "Build with Agent Skills": `https://modelcontextprotocol.io/docs/develop/build-with-agent-skills`
- Thoughtworks Technology Radar, "Progressive context disclosure": `https://www.thoughtworks.com/en-us/radar/techniques/progressive-context-disclosure`
- Figma, "VS Code and Figma: Set up the MCP server": `https://help.figma.com/hc/en-us/articles/39890361040535-VS-Code-and-Figma-Set-up-the-MCP-server`
- Storybook, "MCP server": `https://storybook.js.org/docs/ai/mcp/overview`
- MUI, "Model Context Protocol (MCP) for MUI": `https://mui.com/material-ui/getting-started/mcp/`
- shadcn/ui, "MCP Server": `https://ui.shadcn.com/docs/registry/mcp`
- OpenAI, "Custom instructions with AGENTS.md": `https://developers.openai.com/codex/guides/agents-md`
- GitHub, "Adding repository custom instructions for GitHub Copilot": `https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions`
- Claude Code docs, "How Claude remembers your project": `https://code.claude.com/docs/en/memory`
- OpenAI, "Understanding prompt injections": `https://openai.com/safety/prompt-injections/`

## Executive Verdict

The direction is right: Salt should be design-system workflow intelligence, not a generic prompt-to-app generator. The strongest current choices are:

- source-backed `semantic-core` as the truth layer
- compact `salt_workflow_v1` as the public branching contract
- MCP and CLI as transports over the same model
- `salt-ds` as progressive workflow guidance rather than a large always-on prompt
- repo policy as an overlay, not canonical Salt guidance
- visible unsupported/degraded states instead of invented Salt facts

The main product risk is not the architecture anymore. It is adoption and proof. Competitors often win by being easier to try, easier to wire into a host, and easier to validate visually or at runtime. Salt is stronger on safety and design-system specificity, but needs a simpler per-host path and stronger closed-loop validation story.

## Competitive Position

| Source or competitor | What it teaches | Salt status | Implication |
| --- | --- | --- | --- |
| Anthropic effective agents | Use workflows for predictable, well-defined tasks and reserve agent autonomy for open-ended work. | Aligned. Salt's compact workflow contract is the right level of determinism. | Keep `create` thin. Do not chase magic broad generation in the primary workflow. |
| Anthropic Agent Skills | Skills work through progressive disclosure: short metadata first, `SKILL.md` on match, deeper references on demand. | Mostly aligned. `salt-ds` uses progressive references, and `openai.yaml` is now compact. | Add budget checks for skill/reference growth so this does not regress. |
| MCP client best practices | Progressive tool discovery avoids dumping large tool definitions and intermediate results into model context. | Directionally aligned through compact workflow and retrieval support. | Public MCP surface should stay small, with retrieval/catalog inspection as follow-through. |
| Figma MCP | Gives agents structured design context: components, variables, layout data, selected frames, and Code Connect mappings. | Partial. Salt has `migrate_visual_evidence_v1` schemas/evals/examples, but raw Figma/design inputs are not first-class workflow inputs. | Make host-normalized design evidence a first-class public contract without parsing pixels inside Salt MCP. |
| Storybook MCP | Gives agents component docs, stories, previews, tests, accessibility checks, and rerun loops. | Partial. Salt has review/URL/runtime ideas and evals, but not a Storybook-like self-healing UI validation loop. | Strong opportunity: bridge Salt review to Storybook/app URL validation and report a repeatable repair loop. |
| MUI MCP | Gives a simple official docs/code MCP with exact host setup snippets. | Salt is deeper but harder. | Create per-host setup cards and a "first 10 minutes" path that looks as easy as MUI. |
| shadcn MCP | Registry-first setup is extremely simple and works with any compatible registry. | Salt is more governed and workflow-oriented. | Preserve Salt's safety, but reduce install and discovery friction. |
| Codex/GitHub/Cursor/Claude instruction systems | Host-native instruction files are now table stakes. | Partial. Salt generates or recognizes `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, and `.github/agents/salt-ui.agent.md`; Cursor and Windsurf-specific generated outputs are not complete. | Compile host artifacts from one source of truth instead of hand-maintaining host docs. |
| MCP security and OpenAI prompt injection guidance | Tool metadata, external content, and retrieved context cross trust boundaries. Layered defenses and human confirmations are necessary. | Partial. Salt has trusted project context and evidence gates, but no focused MCP/security threat model artifact. | Add threat modeling and tests for tool/resource poisoning, prompt injection, and persistence boundaries. |

## Current Strengths

1. Evidence-first model is a real differentiator.

   Salt returns unsupported or degraded states when evidence is missing instead of pretending generic UI advice is Salt guidance. The current `ai-tooling-context-gap-catalog.md` keeps the remaining 14 docs/registry gaps visible.

2. Compact workflow output is the right public contract.

   `packages/mcp/README.md`, `salt-workflow-v1-host-contract.md`, and `public-api-matrix.md` all point hosts toward stable top-level workflow fields before rich detail.

3. The MCP/CLI split is conceptually sound.

   MCP is the preferred agent transport because it can expose tools, resources, manifest data, and follow-through actions. CLI remains a useful fallback and deterministic local interface. The architecture should not collapse these into one surface.

4. Visual handoff is correctly bounded.

   The docs now avoid claiming raw screenshot or Figma-native support as first-class MCP input. The branch has schemas and examples for host-normalized visual evidence instead.

5. Cleanup improved reviewability.

   The branch removed copied starter-kit context, external accessibility-skill content, generated baselines, and archive docs from the core PR. That directly reduces adoption and review risk.

## Scale Back / Model-Owned Behavior

The competitive gaps should not turn every missing capability into another Salt-owned subsystem. Salt should be a narrow authority: it owns Salt truth, evidence, workflow gates, repo policy application, and unsupported states. The agent or host should own general orchestration, prose, host-specific mechanics, and generic engineering behavior.

Scale back these Salt-owned ambitions:

1. Host artifact expansion.

   Generate or strongly support stable host artifacts such as `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, `.github/agents/salt-ui.agent.md`, and `agents/openai.yaml`. For less stable host formats, start with setup cards and snippets before adding generated files.

2. Runtime validation.

   Do not build a Storybook or browser-testing replacement inside Salt. Salt should define Salt-specific validation expectations and consume runtime evidence. The agent or host can run Storybook, Playwright, axe, app scripts, or repository checks and feed the result back into Salt workflows.

3. Visual/design interpretation.

   Do not parse screenshots, Figma frames, or raw design-tool payloads inside Salt MCP. Let multimodal hosts normalize those inputs into `migrate_visual_evidence_v1` or `source_outline`; Salt should validate the structured evidence and keep uncertainty visible.

4. Blocked-state prose.

   Avoid adding more compact contract fields until existing fields prove insufficient. Agents can usually turn `status`, `action`, `safety.blocking_reasons`, `questions`, and `evidence.missing` into a clear user explanation. Prefer examples, templates, and host-trace evals before expanding the contract.

5. Context gap closure.

   Do not try to close every docs/registry gap before shipping. Keep fail-closed behavior, prioritize high-frequency gaps, and let agents ask for missing evidence rather than stuffing fallback Salt guidance into prompts.

6. Cross-host benchmark automation.

   Do not overbuild a full automation rig for every host at once. Keep deterministic MCP/CLI evals as the core proof, then add a small real-host smoke suite with manually recorded or semi-automated results.

7. General frontend guidance.

   Do not teach the model React, CSS layout, accessibility basics, or generic app architecture unless Salt changes the answer. Modern coding agents already carry that knowledge; Salt prompts should stay focused on Salt-specific facts, constraints, evidence, and gates.

Model-owned behavior:

- choosing plain-language explanations for users
- deciding which local repo command to run when Salt asks for validation evidence
- adapting host setup snippets to the user's installed tool
- summarizing runtime, screenshot, or design-tool observations into structured evidence
- applying ordinary React and TypeScript refactors after Salt has cleared the implementation gate
- asking the user for missing product intent when the workflow returns `ask_user`
- choosing concise final-response wording after the Salt workflow and validation are complete

Do not outsource these to the model:

- Salt component, pattern, foundation, and token ownership decisions
- imports, props, package names, theme facts, and compatibility claims
- whether create, migrate, or upgrade implementation is allowed
- repo policy application when `.salt` policy or trusted project context is available
- evidence freshness, unsupported/degraded states, and generated context persistence checks
- security and trust-boundary decisions for tools, resources, persisted files, and host adapters

## Issues, Gaps, And Opportunities

### P1. First-run adoption is still too broad

Evidence:

- `site/docs/getting-started/ai.mdx` now has a golden setup path.
- `packages/mcp/README.md`, `packages/cli/README.md`, and `packages/skills/README.md` now act more like package references.
- MUI and shadcn present short host-specific setup snippets that feel easier to copy into a real agent host.

Gap:

Salt has one stronger general setup path, but not one golden path per major host. Users still have to translate the model into Codex, Claude Code, Cursor, Copilot, Windsurf, and VS Code behavior.

Opportunity:

Add host cards or generated setup fragments for:

- Codex
- Claude Code
- Cursor
- VS Code Copilot
- Windsurf

Each card should include install, verify, first prompt, expected compact fields, and the smallest fallback when MCP is unavailable.

Acceptance evidence:

- one doc section or generated artifact per host
- no conflicting package README setup paths
- host validation checklist references those exact paths

### P1. Design-to-code handoff is the biggest competitive gap

Evidence:

- Figma MCP exposes structured design context such as components, variables, layout data, selected frames, and Code Connect mappings.
- Salt currently says raw screenshots, image uploads, Figma frames, and design-tool payloads are not first-class workflow inputs yet.
- Salt has `migrate_visual_evidence_v1` schemas, host attachment evals, and `workflow-examples/migration-visual-grounding`.

Gap:

Salt is correct not to become a visual parser, but the host-normalized evidence contract is not yet positioned as a primary product feature. It reads like an advanced workaround rather than a supported handoff lane.

Opportunity:

Make structured design evidence a first-class public contract:

- publish the schema and examples from semantic-core
- define required and optional fields for layout, intent, components, tokens, states, constraints, confidence, and source refs
- document how Figma/screenshot/story hosts should normalize into `source_outline` or `migrate_visual_evidence_v1`
- add one host-preprocessing example per supported host

Acceptance evidence:

- public docs link to the schema
- MCP/CLI outputs name the normalized visual contract when used
- host attachment evals cover successful and unsafe handoffs

### P1. Runtime validation is weaker than Storybook's loop

Evidence:

- Storybook MCP can expose docs/stories and run component tests, including accessibility checks when configured.
- Salt has review, URL-aware guidance, workflow evals, and validation reports, but the user-facing loop is less concrete.

Gap:

Salt can tell an agent what should be true, but it does not yet provide a simple "run UI validation, fix, rerun" path comparable to Storybook's testing toolset.

Opportunity:

Create a Salt runtime validation lane:

- accept a Storybook or app URL when available
- run Salt review plus available a11y/runtime checks
- return a structured repair plan
- require rerun after edits before completion

Acceptance evidence:

- a workflow scenario that starts from URL evidence
- a report contract that distinguishes design-system issues, runtime/a11y issues, and missing evidence
- host validation checklist includes a runtime repair case

### P1. Security review is not yet productized

Evidence:

- MCP security guidance calls out confused deputy, SSRF, local server compromise, scope minimization, and other attacks.
- OpenAI's prompt-injection guidance frames third-party content as untrusted context and recommends layered defenses.
- Salt has trusted project context, context IDs, persistence checks, evidence gates, and unsupported states.

Gap:

There is no focused Salt AI tooling threat model that maps MCP/security risks onto this architecture. Existing safeguards are scattered through code, tests, and docs.

Opportunity:

Add `ai-tooling-security-threat-model.md` covering:

- tool metadata and resource poisoning
- prompt injection from docs, examples, source files, screenshots, and `source_outline`
- repo `.salt` policy trust boundaries
- generated context persistence and stale context
- local MCP server compromise and filesystem writes
- host adapter instruction conflicts
- human confirmation boundaries for install, write, and persistence actions

Acceptance evidence:

- dedicated threat model doc
- tests for hostile tool/resource text where feasible
- release checklist item requiring security review for public tool or persistence changes

### P1. Cross-host benchmark evidence is incomplete

Evidence:

- The branch has deterministic evals, live local MCP/CLI eval harnesses, host trace evals, workflow replay fixtures, create-catalog benchmarks, and `host-validation-checklist.md`.
- The checklist names scenarios and pass criteria, but it is not the same as executed cross-host evidence across Codex, Claude Code, Cursor, Copilot, and Windsurf.

Gap:

Salt can prove the local workflow logic, but not yet that real hosts consistently follow it.

Opportunity:

Create a golden benchmark packet:

- exact component request
- broad product prompt
- mixed surface follow-through
- migration from non-Salt UI
- repo-policy conflict
- screenshot-derived or Figma-derived evidence
- runtime validation
- missing evidence / blocked state
- MCP unavailable, CLI fallback

Acceptance evidence:

- one machine-readable scenario list
- one result artifact per host
- failures grouped by cause: host instruction, MCP transport, workflow contract, evidence gap, or agent behavior

### P2. Host artifact generation is incomplete

Evidence:

- `promptHostInstructionSurfaces.ts` currently covers `packages/skills/salt-ds/SKILL.md`, `packages/skills/salt-ds/agents/openai.yaml`, `AGENTS.md`, `.github/copilot-instructions.md`, and `.github/agents/salt-ui.agent.md`.
- Bootstrap recognizes `AGENTS.md` and `CLAUDE.md`.
- Cursor and Windsurf appear in docs/examples but not as complete generated instruction artifacts.

Gap:

The current source-of-truth story is good, but the generated outputs do not cover the major host ecosystem evenly.

Opportunity:

Generate host artifacts from one source graph:

- `AGENTS.md`
- `CLAUDE.md`
- `.github/copilot-instructions.md`
- `.github/agents/salt-ui.agent.md`
- `.cursor/rules/salt-ds.mdc` or documented equivalent
- Windsurf rule/memory artifact if the host format is stable enough
- Codex-specific `agents/openai.yaml` and skill notes

Acceptance evidence:

- one semantic-core descriptor list owns all generated paths
- tests verify required clauses across every host artifact
- public docs say which host artifacts are generated versus manually created

### P2. Context gap catalog remains a product completeness risk

Evidence:

- `ai-tooling-context-gap-catalog.md` is still `unsupported`.
- Current counts are 14 total gaps: 11 pattern gaps and 3 foundation gaps.

Gap:

Fail-closed behavior is correct, but high-frequency unsupported states can make the system feel timid or broken.

Opportunity:

Prioritize closing gaps by likely user frequency:

- File upload
- Menu button
- List filtering
- Comments
- Formatted input
- Indication
- Measured/opacity/track token policy gaps

Acceptance evidence:

- gap count decreases through source-backed docs or registry evidence only
- no prompt or skill-only facts used to close catalog entries
- evals cover at least one formerly unsupported gap

### P2. "Why blocked" is visible but not yet a polished UX

Evidence:

- Workflow fields expose `status`, `safety`, `action`, `questions`, `evidence`, `recipe.steps`, and `evidence.missing`.
- `salt-ds/SKILL.md` tells agents to say what is blocked and what remains unresolved.

Gap:

Agents can still bury the blocker in prose. A user needs a small, consistent blocked-state explanation.

Opportunity:

Add a stable `blocked_explanation` or equivalent summary shape to compact outputs:

- what is blocked
- why it is blocked
- smallest next action
- who can provide it: user, host, MCP, CLI, docs/registry maintainer
- whether coding is allowed

Acceptance evidence:

- compact contract fixture with blocked state
- host trace eval checks that agents do not implement after blocked state
- public docs show one blocked example

### P2. Context and prompt weight needs regression protection

Evidence:

- `openai.yaml` was shortened and now has a length guard.
- `salt-ds/SKILL.md` and references still carry substantial behavior.
- MCP client best practices and Thoughtworks both warn against bloating model context and favor progressive disclosure.

Gap:

There is a guard for OpenAI host prompt length, but not a broader context budget policy for skill entrypoint size, host instruction output size, tool descriptions, or package docs copied into model context.

Opportunity:

Add budget checks:

- max `SKILL.md` entry size
- max `agents/openai.yaml` prompt size
- max generated host instruction block size
- max public MCP tool description size
- warnings when references should split rather than grow always-on text

Acceptance evidence:

- test failures when size budgets are exceeded
- documented exception path for deliberate expansions

### P2. Source-backed generated context beats "agent fetch docs directly," but the split needs clearer product language

Evidence:

- MUI's MCP is primarily official docs and code examples.
- Salt has deeper source-backed generated registry artifacts and workflow contracts.

Gap:

The public story should explain why generated source-backed context is better than asking the agent to browse docs every time, while still allowing direct docs links for provenance.

Opportunity:

Add a short explanation:

- direct docs fetch is good for human-readable source and freshness checks
- generated registry/context is better for stable entity resolution, package status, evidence refs, and machine-readable workflow gates
- Salt uses generated context first, and direct docs as cited provenance or gap closure input

Acceptance evidence:

- docs include the tradeoff in the first-run AI page or MCP README
- workflow outputs preserve source URLs/evidence refs for verification

### P3. MCP package size needs an explicit packaging story

Evidence:

- MCP includes generated registry snapshots, server code, docs, eval harnesses, and many contract tests.
- CLI is thinner because it wraps workflow execution and command surfaces rather than carrying every server/runtime validation artifact.

Gap:

The branch can still look too large during review unless package-size rationale and split candidates are explicit.

Opportunity:

Add a packaging/readme note or release checklist:

- generated registry files are runtime payload
- eval fixtures and replay traces are test/support payload
- archive/baseline docs are not part of the core implementation PR
- future package publishing should exclude internal eval fixtures unless needed at runtime

Acceptance evidence:

- package file lists or `files` entries confirm publish contents
- branch review brief distinguishes runtime payload from review/test payload

## Recommended Next Work

1. Create per-host setup cards for Codex, Claude Code, Cursor, VS Code Copilot, and Windsurf.
2. Add the Salt AI tooling security threat model and map current tests to it.
3. Promote structured design evidence into a public contract page with host-normalization examples.
4. Build the cross-host benchmark packet and record first real host runs.
5. Add compact blocked-state examples and host trace checks for "do not code while blocked."
6. Close the highest-frequency context gap catalog entries using source-backed docs or registry evidence only.
7. Add context budget tests beyond `openai.yaml`.

## Bottom Line

Salt is taking the right approach if the goal is trustworthy design-system implementation in real repos. It should not copy MUI or shadcn by becoming a docs-only MCP, and it should not copy Figma by pretending it owns raw visual parsing. The winning lane is narrower and stronger:

source-backed Salt evidence, compact workflow decisions, structured follow-through, repo-aware policy, host-normalized design evidence, and validation loops that make blocked states and fixes obvious.

The branch is closer to that lane now, but the review findings are not fully closed until adoption, host artifacts, design evidence, runtime validation, benchmarks, and security are productized.
