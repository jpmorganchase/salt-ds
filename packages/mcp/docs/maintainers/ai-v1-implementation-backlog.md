# AI V1 Implementation Backlog

This document turns the current Salt AI direction into an execution backlog.

This is the sole active execution backlog for the consumer AI product.

Do not duplicate task tracking in [`consumer-ai-roadmap.md`](./consumer-ai-roadmap.md). That file is the short strategic roadmap only.

For the ordered roadmap that connects the remaining V1 work to the post-V1 product direction, see [`ai-product-roadmap.md`](./ai-product-roadmap.md).

It is optimized for three user groups:

- teams already using Salt
- teams with existing non-Salt repos
- teams starting new projects

## Product Goal

Ship a workflow-first product with:

- one primary skill: `salt-ds`
- one CLI binary: `salt-ds`
- one MCP package: `@salt-ds/mcp`
- one policy file: `.salt/team.json`
- one detected-context contract: `salt-ds info --json`

The product should help users:

- build in a new repo
- build in an existing repo
- review existing Salt usage
- migrate non-Salt UI into Salt
- upgrade Salt usage over time

## Current Status

### Implemented

- one public `salt-ds` skill is in place
- the public CLI is workflow-first:
  - `salt-ds init`
  - `salt-ds info`
  - `salt-ds create`
  - `salt-ds review`
  - `salt-ds migrate`
  - `salt-ds upgrade`
  - with `salt-ds review --url` as the public runtime-evidence extension of review
  - `salt-ds doctor`
  - `salt-ds runtime inspect`
- detected context and declared policy are separated:
  - `salt-ds info --json` is detected context
  - `.salt/team.json` is declared policy
- runtime inspection is positioned as optional evidence, not the main workflow surface
- `verify` has been removed from the public CLI surface; `review --url` is the runtime-evidence extension of review
- source validation now belongs on `salt-ds review`; there is no public `salt-ds lint` command
- `salt-ds review` now returns structured `fixCandidates` for agent-applied remediation instead of mutating files directly
- public workflow commands now return structured confidence and escalation guidance:
  - `create`
  - `review`
  - `migrate`
  - `upgrade`
- `salt-ds migrate` now returns structured post-migration verification guidance tied to the familiarity contract
- `salt-ds doctor` now validates layered policy sources from `.salt/stack.json`, including package-backed shared conventions packs
- the active consumer docs and site AI landing page reflect the workflow-first model
- the default MCP server now exposes only the five repo-aware workflow tools:
  - `get_salt_project_context`
  - `choose_salt_solution`
  - `analyze_salt_code`
  - `translate_ui_to_salt`
  - `compare_salt_versions`
- the published CLI fallback install story is now in place:
  - `@salt-ds/cli` can be packed and installed outside the workspace
  - consumer docs now point at the published CLI fallback commands
- workflow acceptance coverage exists for:
  - existing Salt review
  - existing Salt upgrade
  - non-Salt migration
  - new-project bootstrap and create
  - MCP and non-MCP smoke coverage
- the shared conventions pack path is now explicit:
  - selected teams can use package-backed layers in `.salt/stack.json`
  - `salt-ds info --json` detects those layers and flags shared conventions metadata
  - the default product story remains `.salt/team.json`
- the public skill and workflow outputs are sharper in the way the best specialist skills are:
  - create, review, and migration rule refs now have stable rule IDs
  - CLI and MCP workflow outputs now cite stable rule IDs and clearer review issue classes
  - create output now states user task, key interaction, composition direction, and canonical choice explicitly

### Remaining V1 Work

- Phase 8: stable `salt-ds` skill install and wider distribution
- Phase 9: beta rollout with real evaluation targets

### Optional Near-Term Cleanup

- add optional `llms.txt`
- add Storybook as an evidence source, not a primary product

## Success Criteria

- a user can get value in under 10 minutes
- MCP and non-MCP environments feel like the same product
- users describe Salt in workflow terms, not plumbing terms
- beta teams can complete `review`, `migrate`, and `upgrade` without being taught the internal architecture
- answers are source-backed, repo-aware, and conventions-aware

## Pre-Beta Productization Pass

Status: complete

This execution slice tightened the product shape against the strongest external benchmarks.

### 1. Collapse Onboarding To One Start Path

Make the AI landing page the single front door.

Changes:

- keep [`site/docs/getting-started/ai.mdx`](../../../site/docs/getting-started/ai.mdx) as the only "start here" page
- reduce [`../consumer/beta-guide.md`](../consumer/beta-guide.md) to a short beta handoff and quickstart
- turn [`../consumer/consumer-repo-setup.md`](../consumer/consumer-repo-setup.md) into supporting reference, not a competing start page
- keep the first-time user story to:
  - install `salt-ds`
  - connect `@salt-ds/mcp` when available
  - otherwise use the same workflow through CLI fallback
  - start repo-aware work from project context first

Definition of done:

- first-time teams have one obvious page to start from
- the beta guide no longer behaves like a second onboarding path

### 2. Make MCP More Context-First And Less Tool-Shaped

Keep the underlying tools, but tighten the visible MCP product surface.

Changes:

- make `get_salt_project_context` the explicit first step for repo-aware work
- keep the visible workflow map small:
  - create
  - review
  - migrate
  - upgrade
- keep `discover_salt`, `get_salt_entity`, and `get_salt_examples` as support tools rather than the main mental model
- keep MCP metadata and docs aligned with the public workflow story rather than raw semantic plumbing

Definition of done:

- MCP clients show a clearer project-context-first front door
- support tools remain available without looking like equal top-level workflows

### 3. Make Context-First The Default Rule

The product should treat repo context as a normal first step, not an optional special case.

Changes:

- tighten the main skill so repo-aware MCP work starts from `get_salt_project_context` by default
- keep `salt-ds info --json` as the CLI equivalent
- reserve skipping project context only for clearly Salt-agnostic lookup or exploration

Definition of done:

- the agent no longer has to infer whether repo context probably matters for normal create, review, migrate, or upgrade work

### 4. Thin The Public Skill Contract

The public skill should describe capability, boundaries, and defaults, not every step of orchestration.

Changes:

- shorten [`../../../skills/skills/salt-ds/SKILL.md`](../../../skills/skills/salt-ds/SKILL.md)
- move detailed edit loops, migration loops, and escalation rules into shared maintainer/reference docs where needed
- keep the public skill focused on:
  - what jobs Salt handles
  - what transport to prefer
  - when runtime evidence is needed
  - how canonical Salt guidance relates to project conventions

Definition of done:

- the skill reads like one strong product capability, not a dispatcher or operations manual

### 5. Demote Shared Conventions Packs In The Default Story

Keep the capability, but move it away from the front door.

Changes:

- keep shared conventions packs only in:
  - selected-team beta guidance
  - project-conventions docs
  - advanced CLI/help notes
- remove them from the main happy path in the AI landing page and first-time beta guidance
- keep the default model centered on `.salt/team.json`

Definition of done:

- standard beta teams do not feel like they are evaluating a second setup model
- selected teams can still test layered policy through targeted guidance

### 6. Visible MCP Surface

Status: complete

The default beta MCP surface is now the five repo-aware workflow tools only.
Broader support helpers remain code-level semantic utilities and tests, not part of the server product shape.

## Enterprise Extension Packs

Enterprise extension packs are optional, organization-specific layers that sit on top of the core Salt product.

They should eventually allow teams to add:

- private component registries
- private docs and implementation guides
- organization-specific conventions and banned patterns
- company-specific wrappers and aliases
- internal migration rules
- internal example libraries

They are not part of V1.

For the default V1 product, support should stay on:

- core Salt knowledge
- detected repo context
- `.salt/team.json` policy

Extension packs should be added later only after the core workflow product is stable.

## Enterprise Preview Track

Some beta teams may still want to test a narrow preview of enterprise-extension behavior.

That preview should stay deliberately constrained.

Allowed preview scope:

- private docs and implementation guidance
- organization-specific wrappers and aliases
- banned patterns and local conventions
- internal example libraries
- internal migration rules

Current preview path:

- package-backed layers in `.salt/stack.json`
- detected and reported through `salt-ds info --json`
- layered on top of the default `.salt/team.json` policy flow when selected teams need shared upstream defaults

Do not turn this into a general plugin platform for V1.

Preview guardrails:

- keep the core product unchanged
- do not make extension packs part of the default setup story
- do not expose a second public product model just for enterprise teams
- treat the extension layer as optional organization-specific refinement on top of core Salt, not as a replacement for core Salt reasoning

Definition of success:

- selected enterprise teams can validate whether private guidance materially improves review, migration, or upgrade outcomes
- teams using the preview still describe the core product in the same workflow terms as standard beta users

## Phase 0: Freeze The Product Boundary

Status: complete

### Required decisions

- public skill surface is a single primary `salt-ds` skill
- public CLI binary is `salt-ds`
- MCP remains the preferred transport when allowed
- CLI remains the restricted-environment fallback
- `.salt/team.json` is policy, not full project context
- runtime inspection is optional evidence, not the main product

### Deliverables

- naming decision recorded in docs
- V1 audience and workflow scope recorded in docs
- specialist skills downgraded to implementation details in planning

### Packages and files

- `packages/skills/README.md`
- `packages/mcp/README.md`
- `packages/mcp/docs/consumer/*.md`
- `packages/mcp/docs/maintainers/consumer-ai-roadmap.md`

## Phase 1: Collapse The Public Surface

Status: complete

### Goal

Replace the current multi-surface story with one obvious product shape.

### Changes

- present one public skill: `salt-ds`
- treat builder, reviewer, migration, and conventions skills as internal workflow modules until they are merged further or deleted
- stop presenting multiple public Salt skills as equal user choices
- stop teaching low-level semantic CLI commands as part of the product
- keep low-level commands only if they are still required internally

### Implementation tasks

#### `packages/skills`

- add a public `salt-ds` skill
- move current builder/reviewer/migration/conventions guidance behind the single skill
- keep specialist skills only if they still help internal authoring or testing
- rewrite shared references to assume one top-level skill contract

#### `packages/cli`

- ensure help and README only show workflow-level commands
- keep low-level semantic commands hidden or delete them if no longer needed
- align command output shapes so the single skill can rely on them consistently

#### `packages/mcp`

- position MCP as the remote adapter for the same workflow contract
- avoid docs that imply MCP is a separate product to learn

### Definition of done

- external docs describe one skill, one CLI, one MCP package
- users do not need to choose between builder/reviewer/migration skills

## Phase 2: Add `salt-ds info --json`

Status: complete

### Goal

Create one excellent detected-context command.

### Why this matters

This is the main missing product capability relative to a strong project-context command.

### Command contract

`salt-ds info --json` should report:

- framework
- package manager
- monorepo or single repo
- installed Salt packages and versions
- runtime targets
- Storybook presence and URLs where detectable
- wrappers detected
- aliases and import conventions
- `.salt/team.json` status
- MCP available or not
- runtime evidence available or not
- likely workflow capabilities

### Implementation tasks

#### `packages/cli`

- add `info` command and JSON output
- add stable types for detected context
- add tests for:
  - existing Salt repo
  - non-Salt repo
  - new repo with minimal setup

#### `packages/skills`

- make the primary `salt-ds` skill begin from `salt-ds info --json` when CLI transport is used
- use this output to choose workflows and fallback behavior

#### `packages/mcp`

- keep MCP aligned with the same workflow contract without adding a second public product surface
- keep the output shape consistent with the CLI contract where practical

### Definition of done

- the skill can rely on a single context contract in non-MCP environments
- docs describe `salt-ds info --json` as the primary context command

## Phase 3: Rebuild The Workflow CLI

Status: complete

### Goal

Make the public CLI match the user workflows.

### Public commands

- `salt-ds init`
- `salt-ds info`
- `salt-ds create`
- `salt-ds doctor`
- `salt-ds review`
- `salt-ds migrate`
- `salt-ds upgrade`
- `salt-ds runtime inspect`

### Internal commands

- retain only if needed by the skill
- do not document them as product surface

### Implementation tasks

#### `packages/cli`

- add workflow command handlers
- map workflow commands to semantic-core reasoning, validation, and optional evidence collection
- keep JSON output stable and skill-friendly
- keep the workflow CLI free of a second manual semantic sub-surface

#### `packages/skills`

- rewrite the main skill around:
  - get context
  - choose workflow
  - run workflow command
  - request runtime evidence only if necessary

#### `packages/mcp`

- keep the same workflow shape over MCP through the skill and workflow map
- avoid duplicating workflow logic inside skill prose

### Definition of done

- the public CLI is workflow-based
- the skill no longer depends on user-visible low-level commands

## Phase 4: Separate Detected Context From Declared Policy

Status: complete

### Goal

Stop treating `.salt/team.json` as the full project model.

### Rules

- `salt-ds info --json` is detected repo context
- `.salt/team.json` is declared team policy

### Implementation tasks

#### `packages/project-conventions-runtime`

- keep the package focused on policy and merge/validation behavior
- avoid letting it become the main project-context source

#### `packages/mcp/docs/consumer`

- update setup and conventions docs to reflect the split

#### `packages/skills`

- update prompts and references so conventions are applied after canonical guidance, not confused with context discovery

### Definition of done

- docs and skills consistently distinguish context from policy

## Phase 5: Demote Runtime Inspection To Evidence

Status: complete

### Goal

Keep runtime inspection powerful without making it the main product.

### Rules

- source reasoning first
- policy second
- runtime evidence third
- layout debug only for explicit visual/layout issues

### Implementation tasks

#### `packages/runtime-inspector-core`

- keep Playwright backend
- do not expand feature scope until usage proves demand
- keep output contracts stable

#### `packages/cli`

- keep `doctor` and `runtime inspect`
- treat `review`, including `review --url`, as the primary user-facing review workflow

#### `packages/skills`

- ask for runtime evidence as a capability
- do not hard-code `runtime inspect` as the user workflow

### Definition of done

- docs and skills describe inspection as optional evidence
- layout debug is no longer part of the default product story

## Phase 6: Ship Polished AI Packaging

Status: complete

### Goal

Make the AI setup story clean and discoverable.

### Required docs

- one AI landing page
- one setup page
- one workflow page
- one troubleshooting page
- one maintainer page

### Implementation tasks

#### `packages/mcp/docs/consumer`

- keep:
  - setup
  - workflows
  - troubleshooting
  - install source
  - conventions docs
- keep the top-level model short and obvious

#### Site docs

- keep real cross-cutting docs:
  - developing
  - composition pitfalls
  - custom wrappers
- keep primitive choice only as a short hub
- do not add long agent-steering duplicate prose

#### Optional later polish

- markdown/LLM-friendly docs packaging
- `llms.txt`

### Definition of done

- a user can understand setup and workflow shape from one short entry path

## Phase 7: Workflow Acceptance Testing

Status: complete

### Goal

Test the product promise, not just the internals.

### Required scenarios

- existing Salt repo: `review`
- existing Salt repo: `upgrade`
- existing non-Salt repo: `migrate`
- new repo: bootstrap and first build
- parity between MCP and non-MCP paths where feasible

### Implementation tasks

#### `packages/cli/src/__tests__`

- keep `workflowScenarios.spec.ts`
- expand fixtures for:
  - existing Salt repo
  - existing non-Salt repo
  - new project

#### `packages/skills/__tests__`

- grow skill contract tests to cover:
  - one public skill entry point
  - transport selection
  - runtime-evidence escalation

#### `packages/mcp/src/__tests__`

- keep MCP tests focused on workflow parity and source-backed reasoning

### Guardrails

- no test should depend on ignored generated artifacts existing in git checkout
- no test should assume `process.cwd()` is the repo root
- longer-running build/runtime tests should use realistic CI timeouts

### Definition of done

- CI validates the workflow product shape directly

## Phase 8: Stable Skill Install And Wider Distribution

Status: remaining

### Goal

Remove branch-backed `salt-ds` skill setup friction before wider rollout.

### Implementation tasks

- replace branch-pinned `salt-ds` skill install guidance with a stable tag, package, or release ref
- keep the skill install source documented in one place
- update the AI landing page and supporting docs to match the stable `salt-ds` distribution path
- keep the published CLI fallback story as-is unless a wider release path requires different copy

### Definition of done

- consumer setup no longer depends on a branch path for `salt-ds`

## Phase 9: Beta Rollout

Status: remaining

### Goal

Validate the product against real teams.

### Beta cohort

- 1-2 teams already using Salt
- 1-2 teams with non-Salt repos
- 1 team starting a new project

Evaluation targets can be assembled after the core implementation work is complete.
They are a beta prerequisite, not an implementation prerequisite.

### Tasks

- existing Salt team:
  - review current usage
  - upgrade at least one feature area
- non-Salt team:
  - migrate at least one screen or flow
- new project team:
  - bootstrap and build one feature

### Measure

- setup time
- confusion about product surfaces
- MCP-blocked parity
- usefulness of `.salt/team.json`
- whether users ask for docs or ask Salt to do jobs

### Definition of done

- beta teams can succeed without needing the architecture explained live

## Further Work After V1

### Agent-First Simplification Pass

Goal:

- rely more on the `salt-ds` skill for workflow judgment
- reduce visible command overlap
- keep deterministic tooling underneath without turning every step into a user-facing product feature

Why it matters:

- the current stack is much simpler than before, but it still carries more visible workflow machinery than a great agent-first product needs
- the agent should own more of the job interpretation, escalation, and presentation work
- the tooling should stay strongest at context detection, canonical reasoning, validation, policy loading, and runtime evidence

Planned changes:

- keep source validation on `salt-ds review`; do not reintroduce a separate public `salt-ds lint` command unless a real workflow gap appears
- keep `salt-ds doctor` and `salt-ds runtime inspect` as support and evidence commands only, not part of the primary workflow pitch
- keep `salt-ds review --url` as the evidence-enabled extension of `review` instead of carrying `verify` as a separate public concept
- move more sequencing decisions into the `salt-ds` skill:
  - when to ground deeper in canonical details or examples
  - when to check repo conventions
  - when to request runtime evidence
  - when to stop and ask for clarification instead of continuing
- trim skill and docs language that over-specifies workflow choreography when the agent can make the decision safely

Guardrail:

- do not remove deterministic capabilities that materially improve trust:
  - `salt-ds info --json`
  - canonical Salt recommendation and migration reasoning
  - source validation
  - version comparison
  - `.salt/team.json` policy loading
  - runtime inspection when evidence is genuinely needed

Success signal:

- users think in `salt-ds` jobs, not subcommands
- the agent can carry more of the workflow without the docs reading like an operations manual
- the visible CLI surface feels smaller even if the underlying capabilities remain strong

### Near-term

- keep stable skill precision and rule IDs aligned
  - keep the public `salt-ds` skill concise while the create/review/migrate rule refs stay sharp
  - keep stable rule IDs aligned across:
    - skill references
    - CLI workflow outputs
    - MCP workflow outputs
  - keep create intent, review issue classes, and migration rule IDs stable so agents can act on them consistently across transports
- migration fidelity pass
  - improve `salt-ds migrate` so it preserves the important parts of the existing user experience without trying to clone the old visual system
  - add a familiarity contract to migration output:
    - preserve task flow, action order, information hierarchy, key states, and important interaction anchors
    - allow Salt-native changes in spacing, typography, composition, and visual language
    - flag larger workflow changes as confirmation-required instead of silently treating them as normal migration output
  - add migration delta categories that better describe the kind of change being proposed:
    - direct swap
    - Salt recomposition
    - intent preserved, visual change
    - workflow change requires confirmation
  - add migration-specific clarifying questions around what must remain familiar, what may be redesigned to fit Salt, and which states or constraints are critical
  - add pre/post migration checkpoints so the agent can capture what matters before migration and validate that the Salt result still preserves the intended experience afterward
  - use inspection as migration evidence when it helps scope the current experience, especially for layout, landmarks, action hierarchy, and state visibility
  - keep this generic and heuristic-driven; do not add named-library migration rules to core Salt tooling
- add optional `llms.txt`
- add Storybook as an evidence source, not a primary product

### Longer-term

- codemod-backed review/migrate/upgrade fixes
  - automatically apply high-confidence Salt fixes for common review findings, migration replacements, and upgrade changes, including structured remediation plans that can move directly into implementation work
- multi-repo/workspace awareness
  - let Salt understand larger workspaces, shared packages, and cross-package UI ownership instead of treating every repo as a single isolated app
- private enterprise docs, conventions, and extension packs
  - let organizations layer private design-system guidance, internal docs, internal component catalogs, and repo policy packs on top of core Salt without changing the public product model
- migration packs for common external UI baselines
  - add structured migration knowledge for common starting points such as third-party component libraries or heavily custom in-house UI systems
- confidence scoring for when Salt should ask for evidence instead of guessing
  - make the system explicitly decide when source reasoning is strong enough and when it should stop, ask questions, or request runtime evidence

## Remaining Implementation Order

1. ship a stable `salt-ds` skill install/distribution story
2. collect evaluation targets for the three V1 audience groups
3. run beta with real teams
