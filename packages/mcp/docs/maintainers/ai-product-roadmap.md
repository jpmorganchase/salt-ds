# AI Product Roadmap

This file is the ordered roadmap for the remaining Salt AI work after the current V1 implementation phases.

It combines:

- the remaining V1 items from [`ai-v1-implementation-backlog.md`](./ai-v1-implementation-backlog.md)
- the strategic direction from [`consumer-ai-roadmap.md`](./consumer-ai-roadmap.md)
- the architectural boundary rules from [`maintaining-salt-ai-tooling.md`](./maintaining-salt-ai-tooling.md)
- the canonical AI entity model from [`ai-domain-model.md`](./ai-domain-model.md)
- product lessons from current external AI tooling

Use this document to answer:

- what Salt is trying to prove now
- what should be built next
- what belongs in alpha versus beta
- what should wait until later

Do not use this file as a line-by-line status tracker. The V1 backlog remains the execution tracker for the current implementation slice.

## Product Position

Salt should not try to become a general-purpose AI IDE, hosted coding agent, or broad marketplace platform.

Salt should become:

- the best Salt-specific intelligence layer inside existing agent hosts
- the safest workflow product for applying Salt in real repos
- the strongest specialist system for create, review, migrate, and upgrade work

Keep the core product shape stable:

- one public skill: `salt-ds`
- one public CLI: `salt-ds`
- one MCP package: `@salt-ds/mcp`
- one default policy file: `.salt/team.json`
- one transport-stable workflow vocabulary:
  - `init`
  - `create`
  - `review`
  - `migrate`
  - `upgrade`
  - `review --url` when runtime evidence must stay in the same pass

## Current Delivery Posture

The current posture should be:

- `alpha`
  - prove the idea quickly on the branch
  - collect signal from a small number of real tasks and teams
  - decide whether the product is worth pursuing further
- `beta`
  - harden the product only after alpha produces positive signal
  - improve distribution, eval coverage, protocol hardening, and rollout discipline

Do not hold alpha to beta standards.

## Architecture Guardrails

Keep these rules stable through every phase:

1. Put canonical Salt rules in docs and build extraction before adding MCP runtime heuristics.
2. Keep core Salt MCP canonical and Salt-only.
3. Keep repo-local conventions outside the core MCP.
4. Keep skills thin and workflow-oriented.
5. Keep deterministic outputs structured:
   - rule IDs
   - confidence
   - raise-confidence guidance
   - fix candidates
   - source attribution
6. Let the agent apply changes through the workflow instead of growing a second autofix product surface.
7. Do not expand the public product shape unless alpha or beta evidence shows a real workflow gap.

## Owner Model

Use these owner labels in planning and staffing:

- `Product`
  - roadmap, prioritization, alpha and beta programs, success metrics
- `Docs/Skills`
  - public skill contract, install path, landing page, host instructions
- `MCP/CLI`
  - transport parity, packaging, protocol surface, host setup
- `Semantic Core`
  - canonical reasoning, review, migration, upgrade, confidence policy
- `Project Conventions`
  - `.salt/team.json`, `.salt/stack.json`, extension-pack layering
- `Evaluation/QA`
  - eval harness, fixtures, regression coverage, alpha and beta analysis

## External Product Lessons

- add usage and outcome metrics
  - prefer tracked agent activity and workflow success signals over anecdotal quality claims
- support host-native setup and instruction models
  - work well with repo, user, and organization-level instruction patterns where the host supports them
- use disciplined distribution for optional extension content
  - prefer registry-style or package-style delivery for private and public extension layers
- add visual inputs only where they improve specialist workflows
  - use screenshots and mockups for constrained create and migrate flows rather than turning Salt into a broad generator

## What Salt Should Ignore

- building a general AI IDE
- competing on broad greenfield "one prompt to app" generation
- exposing a much larger raw MCP tool surface just because other products do
- treating runtime inspection as the main product
- using auto-memory as the core differentiator

## Alpha: Prove The Idea

Alpha exists to answer one question:

- is this worth pursuing into a harder productization pass?

## Alpha 1: Branch Alpha Setup And Smoke

### Goal

Make it easy to try the current branch snapshot without pretending the product is distribution-ready.

### Owners

- `Docs/Skills`
- `MCP/CLI`
- `Evaluation/QA`

### What To Do

- keep one canonical branch or ref for the alpha
- document that alpha install source in one place
- keep one short alpha setup path:
  - install or connect the branch skill source
  - use the existing CLI fallback
  - connect the MCP when available
- prepare one or two sample repos that exercise:
  - review
  - migrate
  - create or upgrade
- keep minimal smoke coverage so the alpha does not fail immediately
- define how alpha runs are captured:
  - task
  - transcript or notes
  - outcome
  - friction

### Exit Criteria

- alpha users have one clear branch-based setup path
- maintainers can tell which branch or ref an alpha team is on
- a small number of real workflow tasks can be tried without setup thrash

## Alpha 2: Focused Experiments

### Goal

Test the two strongest likely areas of demand without broadening the product too early:

- guidance layering for teams and line-of-business owners
- visual grounding for migration-first workflows

Detailed execution checklist: [`ai-alpha-experiment-checklist.md`](./ai-alpha-experiment-checklist.md)

### Owners

- `Evaluation/QA`
- `Product`
- `Docs/Skills`
- `MCP/CLI`
- `Semantic Core`
- `Project Conventions`

### What To Do

For guidance layering:

- harden `.salt/team.json` authoring, validation, and bootstrap UX enough for alpha use
- harden the `.salt/stack.json` preview enough for real line-of-business layering trials
- make `salt-ds init --conventions-pack` understandable and testable
- improve provenance in outputs so users can see:
  - canonical Salt answer
  - project or line-of-business override
  - final answer
- validate whether private guidance materially improves:
  - review
  - migrate
  - upgrade

For visual grounding:

- add screenshot or current-UI grounding for `migrate` first
- allow visual evidence in `review` only when it improves source-first validation
- keep create-time visual generation constrained and secondary until migration grounding proves value
- support screenshot and mockup inputs before considering deeper design-tool ingestion
- keep external design-tool integrations behind thin adapters that normalize into Salt workflow inputs such as `source_outline`
- add component-mapping support before ambitious design-to-code work so visual context resolves to real Salt components and wrappers
- keep design-tool orchestration in the `salt-ds` skill and workflow layer rather than in the canonical MCP core
- measure whether visual grounding improves:
  - migration fidelity
  - confidence accuracy
  - clarification quality
  - final usefulness

Keep both tracks explicitly bounded:

- do not turn guidance layering into a second default setup model
- do not turn visual grounding into a general prompt-to-app generator
- keep the public workflow story unchanged while these tracks are evaluated

### Exit Criteria

- selected alpha teams can use team-level and line-of-business guidance without changing the default product story
- migration can use visual evidence in a controlled, measurable way
- both experiment tracks produce signal strong enough to pursue, narrow, or stop

## Alpha 3: Alpha Review And Go/No-Go Decision

### Goal

Decide whether Salt AI should move into a harder beta hardening pass.

### Owners

- `Product`
- `Evaluation/QA`
- `Docs/Skills`
- `MCP/CLI`
- `Semantic Core`
- `Project Conventions`

### What To Do

- review alpha evidence for:
  - setup friction
  - workflow usefulness
  - guidance-layering value
  - visual migration value
  - MCP versus CLI parity
  - whether users ask Salt to do jobs or ask which tool to use
- classify the outcome for each major area:
  - pursue
  - narrow
  - stop
- record what must be true before beta starts
- record what should be deferred until later even if alpha is promising

### Exit Criteria

- there is an explicit pursue or stop decision for the product direction
- there is a narrower scope for beta if the alpha signal is only partial
- the beta plan is based on evidence rather than enthusiasm

## Beta: Harden The Product

Only start the beta hardening phases after alpha produces positive signal.

## Beta 1: Distribution And Contract Hardening

### Goal

Remove setup friction and lock the public workflow contract for a broader beta.

### Owners

- `Docs/Skills`
- `MCP/CLI`
- `Evaluation/QA`

### What To Do

- replace branch-backed `salt-ds` skill install guidance with a stable release, tag, or package source
- document the skill install source in one place only
- update the AI landing page and supporting setup docs to match that stable source
- keep the published CLI fallback story intact unless the wider release path requires different copy
- add client-visible MCP contract tests for:
  - `listTools`
  - `outputSchema`
  - tool annotations
  - public tool ordering
- add drift tests that lock:
  - public workflow labels
  - stable rule IDs
  - skill-to-CLI-to-MCP wording parity
- define the release and versioning story for:
  - skill source
  - CLI package
  - MCP package

### Exit Criteria

- consumer setup no longer depends on a branch path for `salt-ds`
- there is one documented install source for the public skill
- MCP contract tests verify the protocol-visible surface, not only private server internals
- public workflow labels and rule IDs are regression-protected across transports

## Beta 2: Evaluation System And Beta Packet

### Goal

Prove workflow quality with checked-in evaluations before the broader beta expands.

### Owners

- `Evaluation/QA`
- `Product`
- `Semantic Core`

### What To Do

- build a checked-in eval harness for the three V1 audience groups:
  - teams already using Salt
  - teams with existing non-Salt repos
  - teams starting new projects
- define representative task fixtures for:
  - create
  - review
  - migrate
  - upgrade
- store:
  - prompts
  - expected outcomes
  - scoring rubric
  - captured transcripts or structured run artifacts
- score outputs on:
  - correct workflow choice
  - source-backedness
  - repo-awareness
  - conventions handling
  - escalation quality
  - migration fidelity
  - final usefulness
- wire the eval suite into CI for curated scenarios
- create the broader beta packet:
  - task scripts
  - feedback form
  - setup checklist
  - issue capture template

### Exit Criteria

- Salt has a checked-in eval harness rather than rubric prose only
- curated evals run before beta changes are treated as safe
- the team can compare create, review, migrate, and upgrade quality over time
- beta teams can be given repeatable test tasks instead of ad hoc demos

## Beta 3: Structured Beta Rollout

### Goal

Validate that real teams can use the workflow product without the architecture being explained live.

### Owners

- `Product`
- `Evaluation/QA`
- `Docs/Skills`
- `MCP/CLI`

### What To Do

- run the beta cohort already defined in the V1 backlog:
  - 1-2 existing Salt teams
  - 1-2 non-Salt teams
  - 1 new-project team
- include the validated alpha experiments where they fit:
  - guidance layering for teams that need local or line-of-business policy
  - visual migration grounding for migration-heavy teams
- measure:
  - setup time
  - confusion about product surfaces
  - MCP-blocked parity
  - usefulness of `.salt/team.json`
  - usefulness of layered conventions where included
  - usefulness of visual migration grounding where included
  - whether teams ask Salt to do jobs or ask which tool to use
- collect outcome data per workflow:
  - create success
  - review usefulness
  - migration fidelity
  - upgrade clarity
- review friction weekly and classify it as:
  - docs gap
  - skill-orchestration gap
  - MCP/CLI parity gap
  - semantic-core quality gap
  - project-conventions gap

### Exit Criteria

- beta teams can succeed without live architecture tutoring
- the main workflow gaps are ranked by evidence, not intuition
- the team has a decision record for what to fix before wider rollout

## Beta 4: Agent-First Simplification Pass

### Goal

Make the product feel smaller and more agent-driven without removing the deterministic substrate.

### Owners

- `Docs/Skills`
- `Product`
- `MCP/CLI`

### What To Do

- keep source validation on `salt-ds review`; do not reintroduce a separate public `salt-ds lint` command unless a real workflow gap appears
- keep `salt-ds doctor` and `salt-ds runtime inspect` as support and evidence commands, not primary user workflows
- keep `salt-ds review --url` as the public evidence-enabled extension of review
- move more sequencing decisions into the `salt-ds` skill:
  - when to deepen canonical grounding
  - when to check repo conventions
  - when to request runtime evidence
  - when to stop and ask for clarification
- trim docs and skill prose that reads like an operations manual
- preserve the underlying deterministic capabilities:
  - `salt-ds info --json`
  - canonical reasoning
  - validation
  - version comparison
  - policy loading
  - runtime evidence when needed

### Exit Criteria

- users think in jobs, not subcommands
- the visible workflow story is smaller than the implementation beneath it
- the skill carries more orchestration without duplicating canonical Salt rules

## Beta 5: Host-Native Distribution And Integration

### Goal

Win where users already are instead of trying to make Salt the host platform.

### Owners

- `Docs/Skills`
- `MCP/CLI`
- `Product`

### What To Do

- publish and test setup guides for the major supported agent hosts
- provide host-native rule or instruction templates where the host supports them
- keep the Salt workflow vocabulary stable across all host integrations
- make MCP setup examples copy-pasteable and verified
- keep the CLI fallback documented for MCP-blocked environments
- add install verification steps that prove the host is using the Salt MCP and skill path correctly

### Exit Criteria

- at least the major agent hosts have tested and documented Salt setup paths
- host integration docs reinforce one Salt workflow story instead of creating host-specific product variants
- setup friction drops for teams already committed to a host tool

## Beta 6: Broaden Visual Grounding For Constrained Workflows

### Goal

Expand visual grounding beyond migration-first alpha work, but keep it constrained and workflow-driven.

### Owners

- `Semantic Core`
- `MCP/CLI`
- `Evaluation/QA`

### What To Do

- extend visual grounding from migration-first work into `create` where visual hierarchy materially affects the recommendation
- add mockup-oriented create guidance only when it still resolves to Salt workflow recommendations rather than generic generation
- keep visual inputs in constrained workflows only:
  - create
  - migrate
  - review when visual evidence is explicitly needed
- treat design-tool ingestion as optional later infrastructure, not as the initial product boundary
- if deeper design-tool integration is pursued, start with:
  - adapter to Salt workflow inputs
  - component mapping to real Salt wrappers and conventions
  - `create` or `migrate`
  - `review`
- only consider richer design-native generation after evaluation shows the adapter path materially improves specialist workflows
- score whether visual grounding improves:
  - recommendation quality
  - migration familiarity
  - confidence accuracy
- avoid expanding into a freeform hosted UI generator product

### Exit Criteria

- create and migrate can consume visual evidence in a controlled way
- evaluation shows visual grounding improves specialist task quality
- Salt still presents itself as a workflow product for real repos, not as a general design generator

## Beta 7: Workflow Quality Deepening

### Goal

Strengthen the areas where Salt should be better than general-purpose agent tooling.

### Owners

- `Semantic Core`
- `Evaluation/QA`
- `Project Conventions`

### What To Do

- keep stable rule IDs aligned across:
  - skill references
  - CLI workflow outputs
  - MCP workflow outputs
- continue the migration fidelity pass:
  - preserve task flow
  - preserve action hierarchy
  - preserve key landmarks and states
  - allow Salt-native visual and compositional changes
  - flag workflow changes that require confirmation
- improve migration outputs with:
  - familiarity contracts
  - delta categories
  - clarifying questions
  - pre-migration checkpoints
  - post-migration verification checkpoints
- improve confidence scoring for when Salt should:
  - proceed
  - ask a question
  - request runtime evidence
  - stop instead of guessing
- improve deterministic `fixCandidates` for agent-applied remediation
- add Storybook as an optional evidence source, not a primary product surface
- add optional `llms.txt`

### Exit Criteria

- migration quality improves in evals and beta follow-ups
- confidence and escalation become more trustworthy
- Storybook and `llms.txt` add value without broadening the public product shape

## Later: Broaden Carefully

These are worth doing only after the alpha and beta loops justify them.

## Later 1: Broader Extension Discipline

### Goal

Take the validated patterns for private guidance and organization-specific refinement and keep them disciplined as they broaden.

### Owners

- `Project Conventions`
- `Docs/Skills`
- `MCP/CLI`

### What To Do

- keep `.salt/team.json` as the default story
- keep `.salt/stack.json` targeted to teams that genuinely need layering
- define the broader extension contract around:
  - private docs
  - internal wrappers and aliases
  - banned patterns
  - internal examples
  - internal migration rules
- add clearer provenance and conflict reporting across:
  - canonical Salt answer
  - applied project convention
  - final answer
- design extension-pack packaging with disciplined distribution rather than a broad plugin marketplace
- validate whether private guidance materially improves review, migration, and upgrade outcomes

### Exit Criteria

- teams can layer private guidance without changing the default onboarding story
- extension users still describe the product in the same workflow terms as standard teams
- extension behavior stays outside the core canonical MCP layer

## Later 2: Safe Automation And Workspace Scale

### Goal

Turn strong guidance into safe execution at larger scale.

### Owners

- `Semantic Core`
- `MCP/CLI`
- `Evaluation/QA`

### What To Do

- add codemod-backed remediation for high-confidence review, migrate, and upgrade cases
- keep the agent in control of whether to apply a fix
- add multi-repo and workspace awareness:
  - shared packages
  - cross-package UI ownership
  - larger monorepo structure
- add migration packs for common external UI baselines after the generic migration engine is strong enough
- gate broader autofix rollout on eval and product evidence rather than convenience

### Exit Criteria

- Salt can safely automate a meaningful subset of deterministic changes
- workspace-aware reasoning improves real multi-package repos
- migration packs remain optional overlays, not canonical core rules

## Ordered Implementation Path

1. alpha branch setup and smoke
2. alpha experiments for guidance layering and migration-first visual grounding
3. alpha review and go or no-go decision
4. stable distribution and contract hardening
5. checked-in eval harness and broader beta packet
6. structured beta rollout
7. agent-first simplification pass
8. host-native setup and distribution
9. broader constrained visual grounding
10. workflow quality deepening
11. broader extension discipline
12. codemod-backed fixes and workspace scale

## What Not To Do

- do not build a second public CLI vocabulary
- do not expose internal MCP tool names as the main user story
- do not move repo-local conventions into the core Salt MCP
- do not use skills as the source of truth for canonical Salt rules
- do not let runtime inspection become the front door product
- do not broaden the public surface before alpha or beta evidence proves the need

## Success Definition

Salt is on track when all of these become true:

- alpha produces real signal that the product is worth pursuing
- beta teams describe Salt in workflow terms, not plumbing terms
- MCP and CLI feel like the same product
- real teams can complete create, review, migrate, and upgrade without architecture tutoring
- maintainers can prove quality through evals and product evidence, not just examples
- Salt is clearly better than general-purpose agents at applying Salt correctly in existing repos
- Salt remains small, specialist, and portable across host platforms
