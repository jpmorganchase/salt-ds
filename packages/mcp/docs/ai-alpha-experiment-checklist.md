# Alpha Experiment Checklist

This file turns Alpha 2 of [`ai-product-roadmap.md`](./ai-product-roadmap.md) into a concrete implementation checklist.

Alpha 2 is the focused experiment slice before any broader beta hardening work. It tests two likely high-value demands:

- guidance layering for teams and line-of-business owners
- visual grounding for migration-first workflows

Use this document for issue planning and sequencing.

Do not use it as the broader roadmap. The roadmap stays in [`ai-product-roadmap.md`](./ai-product-roadmap.md).

## Alpha Goal

Validate two likely high-value demands without changing the default Salt product story:

- teams want repo-level guidance on top of canonical Salt
- line-of-business owners want shared guidance on top of canonical Salt
- teams will want migration help from screenshots, current UI captures, and mockups

## Boundaries

Keep these boundaries explicit while executing this alpha:

- `.salt/team.json` stays the default policy story
- `.salt/stack.json` stays a targeted layered path, not the default setup
- core Salt MCP stays canonical and Salt-only
- repo and line-of-business guidance stay in project conventions
- visual grounding starts with `migrate`
- `review` can use visual evidence only as a gated escalation from source-first analysis
- do not build general prompt-to-app generation here
- do not make design-tool ingestion a required product dependency here
- if design-tool context is explored later, route it through a thin adapter into Salt workflow inputs rather than adding a second visual contract
- do not treat this alpha as a commitment to broader beta rollout

## Recommended Sequence

1. lock guidance-layering contracts and provenance
2. polish conventions bootstrap and validation
3. add migration-first visual evidence contracts
4. add lightweight evaluation coverage for both experiment tracks
5. prepare alpha packet and examples
6. make the pursue, narrow, or stop decision

## Epic A: Guidance Layering Core

### Goal

Make team-level and line-of-business guidance usable, inspectable, and safe without changing the default product model.

### Primary owners

- `Project Conventions`
- `Docs/Skills`
- `MCP/CLI`

### Issue A1: Lock The Alpha Contract

- confirm the intended split between:
  - `.salt/team.json`
  - `.salt/stack.json`
  - package-backed conventions packs
- document what is allowed in the alpha layer:
  - private docs
  - internal wrappers and aliases
  - banned patterns
  - internal examples
  - internal migration rules
- document what is explicitly not allowed:
  - replacing canonical Salt guidance
  - moving repo-local rules into core MCP
  - creating a second default setup path

Likely touch points:

- `packages/mcp/docs/maintainers/maintaining-salt-ai-tooling.md`
- `site/docs/getting-started/ai.mdx`
- `packages/skills/salt-ds/references/conventions/rules.md`

Done when:

- maintainers and alpha teams can describe the contract in one consistent way

### Issue A2: Improve Output Provenance And Conflict Reporting

- ensure workflow outputs clearly separate:
  - canonical Salt answer
  - applied project or line-of-business convention
  - final recommendation
- add clearer conflict reporting when conventions diverge from canonical Salt guidance
- make the agent-facing output obvious enough that a host can explain why the final answer changed

Likely touch points:

- `packages/semantic-core/src/tools`
- `packages/cli/src/commands/workflow.ts`
- `packages/mcp/src/server/workflowOutputs.ts`

Done when:

- users can see what Salt recommended, what the convention changed, and why

### Issue A3: Harden `.salt/team.json` Authoring And Bootstrap

- improve `salt-ds init` for the simple team-file path
- make repo instruction snippets consistently point to `.salt/team.json` first
- ensure bootstrap copy stays small and workflow-first
- verify the happy path for repos adopting Salt policy for the first time

Likely touch points:

- `packages/cli/src/commands/init.ts`
- `packages/skills/salt-ds`
- `workflow-examples/consumer-repo`
- `site/docs/getting-started/ai.mdx`

Done when:

- a team can adopt the default `.salt/team.json` path without layered-policy confusion

### Issue A4: Harden `.salt/stack.json` Alpha Preview

- make `salt-ds init --conventions-pack` easier to understand and verify
- improve diagnostics for package-backed or layered policy failures
- validate merge order, provenance, and fallback behavior on real layered examples
- keep the path clearly advanced and opt-in

Likely touch points:

- `packages/semantic-core/src/policy`
- `packages/cli/src/lib/infoContext.ts`
- `packages/mcp/src/server/projectContext.ts`
- `workflow-examples/project-conventions`

Done when:

- a line-of-business layer can be tried without making the product feel like it has two onboarding models

### Issue A5: Add Guidance-Layering Coverage

- add contract tests for:
  - `.salt/team.json` default behavior
  - `.salt/stack.json` layered behavior
  - conventions-pack bootstrap
  - provenance and conflict output
- add lightweight alpha fixtures where conventions materially change:
  - review
  - migrate
  - upgrade

Likely touch points:

- `packages/skills/__tests__`
- `packages/cli/src/__tests__`
- `packages/mcp/src/__tests__`
- alpha task fixtures
  - start from `workflow-examples/project-conventions/alpha-review-migrate-fixtures.md`

Done when:

- guidance-layering behavior can drift only with an intentional contract change

## Epic B: Migration-First Visual Grounding

### Goal

Use screenshots, current UI captures, and mockups to improve migration quality without turning Salt into a general generator.

### Primary owners

- `Semantic Core`
- `MCP/CLI`
- `Evaluation/QA`

### Issue B1: Define The Visual Evidence Contract

- decide what Alpha 2 accepts:
  - screenshot file
  - image URL
  - current UI capture
  - mockup image
- define where visual evidence belongs in the product stack:
  - workflow input
  - runtime evidence
  - not canonical Salt source of truth
- define the minimum structured output needed from visual analysis:
  - landmarks
  - action hierarchy
  - layout signals
  - familiarity anchors
  - confidence impact

Likely touch points:

- `packages/mcp/docs/maintainers/maintaining-salt-ai-tooling.md`
- `packages/skills/salt-ds/references/shared/transport.md`
- `packages/cli/src/commands/workflow.ts`
- `packages/mcp/src/server/toolDefinitions.ts`

Done when:

- there is one clear contract for how visual evidence enters the workflow

### Forward Path: Design-Tool Adapters

Record the intended later path now so Alpha 2 work does not drift:

- keep external design-tool integrations out of the canonical MCP core
- prefer a thin adapter that converts design-tool context into `source_outline` or equivalent Salt workflow inputs
- add component-mapping support before direct design-to-code ambitions so visual context resolves to real Salt wrappers and conventions
- keep orchestration in the `salt-ds` skill and workflow layer:
  - fetch design context
  - normalize it into Salt workflow inputs
  - apply project or line-of-business guidance
  - run `create` or `migrate`
  - run `review`
- evaluate the adapter path with the same alpha matrix used for other visual evidence variants before expanding the product boundary

### Issue B2: Add Visual Grounding To `migrate`

- make `migrate` accept visual evidence in a controlled way
- use the evidence to improve:
  - familiarity capture
  - migration scoping
  - clarification questions
  - post-migration verification
- keep visual grounding as supporting evidence rather than as a replacement for canonical Salt reasoning

Likely touch points:

- `packages/semantic-core/src/tools`
- `packages/cli/src/commands/workflow.ts`
- `packages/mcp/src/server/workflowOutputs.ts`
- runtime evidence adapters as needed

Done when:

- migration quality measurably improves on cases where source-only reasoning was previously weak

### Issue B3: Add Guarded Visual Escalation To `review`

- allow `review` to use visual evidence only when source-first analysis is insufficient
- gate this behind confidence and raise-confidence signals
- keep the default review path source-first
- avoid turning visual review into the default product behavior

Likely touch points:

- `packages/semantic-core/src/tools`
- `packages/cli/src/commands/workflow.ts`
- `packages/skills/salt-ds/SKILL.md`

Done when:

- review can ask for visual evidence when needed without changing the default workflow model

### Issue B4: Add Visual-Grounding Coverage

- add alpha fixtures that compare:
  - source-only migrate
  - migrate with visual evidence
- score improvements in:
  - migration fidelity
  - confidence accuracy
  - clarification quality
  - final usefulness
- keep at least a few negative cases where visual evidence should not change the answer much

Likely touch points:

- alpha task fixtures
- `packages/cli/src/__tests__`
- `packages/mcp/src/__tests__`

Done when:

- the team can show whether visual evidence actually improves migration outcomes

### Issue B5: Document The Alpha Story Without Expanding The Product

- add concise docs and examples for migration-first visual grounding
- keep wording centered on:
  - screenshots
  - current UI evidence
  - mockups
- do not promise deep design-tool ingestion or general app generation in this alpha

Likely touch points:

- `site/docs/getting-started/ai.mdx`
- `workflow-examples`

Done when:

- alpha teams understand the experiment without inferring a broader prompt-to-app product

## Epic C: Alpha Readiness And Decision

### Goal

Make the experiment tracks measurable enough to decide whether Salt should pursue beta hardening.

### Primary owners

- `Evaluation/QA`
- `Product`
- `Docs/Skills`

### Issue C1: Build The Alpha Packet

- define alpha-specific tasks for:
  - team-level conventions
  - line-of-business layered conventions
  - migration from screenshots
  - migration from current UI captures
- define simple success criteria
- capture the expected evidence and reviewer notes for each task

Done when:

- the experiment tracks can be tried repeatably during alpha
- start from [`ai-alpha-visual-migration-packet.md`](./ai-alpha-visual-migration-packet.md) for the first checked-in visual migration comparison set

### Issue C2: Prepare Example Repos And Sample Inputs

- create or curate:
  - one simple `.salt/team.json` repo
  - one layered `.salt/stack.json` repo
  - one migration example with source-only inputs
  - one migration example with screenshots or mockups
- make sure the examples reflect real tasks rather than synthetic happy paths

Done when:

- maintainers have reusable examples for testing, demos, and alpha support
- the visual migration example set in [`../../../../workflow-examples/migration-visual-grounding`](../../../../workflow-examples/migration-visual-grounding) stays aligned with the checked-in alpha packet

### Issue C3: Add Alpha Review Gates

- collect alpha feedback separately for:
  - default team policy path
  - layered conventions experiment
  - migration-first visual grounding
- define the decision gates:
  - pursue
  - narrow
  - stop

Done when:

- the team has an explicit pursue, narrow, or stop decision for each experiment track

## Out Of Scope For This Alpha

- full Figma-native ingestion
- general prompt-to-app generation
- turning `.salt/stack.json` into the default setup path
- broad plugin or marketplace behavior
- stable public skill distribution
- protocol-perfect MCP hardening
- codemod-backed autofix work
- multi-repo or workspace-scale reasoning

## Suggested Issue Order

1. A1 lock the alpha contract
2. A2 provenance and conflict reporting
3. A3 `.salt/team.json` bootstrap hardening
4. A4 `.salt/stack.json` alpha preview hardening
5. B1 visual evidence contract
6. B2 migrate visual grounding
7. A5 guidance-layering coverage
8. B3 guarded visual escalation for review
9. B4 visual coverage
10. B5 visual alpha docs
11. C1 alpha packet
12. C2 example repos and sample inputs
13. C3 alpha review gates

## Alpha Exit Decision

Do not treat both experiment tracks as automatic beta commitments.

At the end of this alpha, make two separate decisions:

- guidance layering:
  - pursue
  - narrow
  - stop
- visual grounding:
  - pursue
  - narrow
  - stop
