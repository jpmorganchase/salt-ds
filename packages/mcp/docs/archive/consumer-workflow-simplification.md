# Consumer Workflow Simplification

This proposal defines the simplest consumer-facing AI story for Salt across both MCP-capable and MCP-blocked environments.

The goal is not to make the CLI mirror the MCP tool list. The goal is to let consumers follow one app-development workflow model regardless of transport.

## Problem

Today the stack is technically capable, but the consumer story is still too surface-first:

- MCP users learn tools and skills
- no-MCP users learn a different set of CLI commands
- low-level semantic commands are documented too early
- the CLI risks becoming a second MCP instead of a fallback transport

That increases choice overload for the workflows consumers actually care about:

- migration from non-Salt UI into Salt
- building in a new repo
- building in an existing repo
- upgrading existing Salt apps
- typical day-to-day app work such as review, fix, validation, and runtime debugging

## Proposal

Keep one reasoning core and one workflow language:

- `semantic-core`
  - canonical Salt reasoning
- MCP
  - preferred transport when available
- `salt` CLI
  - fallback transport when MCP is blocked
- skills
  - workflow orchestrators across both transports

The key simplification:

- one consumer workflow model
- two transport modes
- advanced commands only when needed

## Stable Consumer Model

Teach the stack in this order.

### 1. Bootstrap

Use when a repo is starting Salt adoption or needs repo-local conventions.

Expected outcome:

- Salt setup is present
- `.salt/team.json` exists when repo-local conventions matter
- the repo instruction file tells the agent when to read project conventions

### 2. Build

Use for new UI in either:

- a new repo
- an existing repo

Expected workflow:

1. choose or translate the canonical Salt direction
2. ground it in entity details or examples
3. implement or refine the code
4. validate source usage
5. use runtime evidence only if source validation is still not enough

### 3. Review

Use for:

- simplifying existing Salt UI
- fixing the wrong primitive or pattern choice
- debugging layout, accessibility, or composition issues

Expected workflow:

1. analyze the current code
2. resolve canonical replacements only where needed
3. keep local wrappers and conventions downstream
4. use runtime evidence only for unresolved rendered behavior

### 4. Migrate

Use for:

- converting non-Salt UI into Salt
- replacing foreign component-library usage
- translating rough legacy app structure into Salt

Expected workflow:

1. translate the source UI into Salt structure
2. call out direct swaps, pattern rewrites, and manual review zones
3. implement the first pass
4. validate against canonical Salt guidance

### 5. Upgrade

Use for:

- Salt version upgrades
- deprecation cleanup
- migration shims and CSS override review

Expected workflow:

1. establish the version boundary
2. analyze the current code
3. make required upgrade changes
4. analyze the updated code again
5. separate required migration work from optional cleanup

### 6. Verify

Use after build, review, migrate, or upgrade work.

Expected order:

1. source validation first
2. runtime evidence second

This order should stay stable in both MCP and no-MCP environments.

## Transport Rules

Consumers should not have to choose between two different product stories.

### MCP Available

Use:

- Salt skills for workflow entry
- Salt MCP for canonical reasoning
- project conventions after the canonical step
- CLI runtime commands only for local evidence when needed

### MCP Blocked, CLI Available

Use:

- the same Salt skills as the workflow entry
- the `salt` CLI as fallback transport to canonical Salt reasoning
- the same project-conventions boundary
- the same source-first then runtime-second verification order

### MCP Blocked, CLI Unavailable

The stack should degrade explicitly:

- state that canonical structured Salt verification could not run
- give the best docs-grounded answer available
- mark source validation and runtime verification as pending rather than implying completion

## Doc IA Changes

Shift the docs from surface-first to workflow-first.

### Recommended Top-Level Teaching Order

1. setup
2. supported workflows
3. environment modes
4. advanced commands
5. troubleshooting

### Proposed Doc Changes

- `consumer-repo-setup.md`
  - keep setup only
  - explain MCP-capable and MCP-blocked environments as transport modes, not separate product paths
- `getting-good-results.md`
  - start with workflow selection, not surface selection
  - make `build`, `review`, `migrate`, `upgrade`, and `verify` the primary headings
- `examples/consumer-repo/README.md`
  - replace the current “Path A / Path B” framing with one workflow model and a transport matrix
- `packages/cli/README.md`
  - document supported workflows first
  - move low-level semantic commands under an advanced section

### Doc Rule

Do not lead consumers with:

- hidden workflow commands such as `discover`, `choose`, `entity`, `examples`, `translate`, or `compare-versions`
- `salt lint`
- `salt doctor`
- `salt runtime inspect`

Those are useful building blocks, but they should appear as:

- advanced commands
- fallback primitives
- or implementation detail behind workflow commands

## CLI Surface Changes

Keep the CLI workflow-first at the top and command-first underneath.

### Recommended Public Shape

Primary workflow entrypoints:

- `salt bootstrap`
- `salt build`
- `salt review`
- `salt migrate`
- `salt upgrade`
- `salt verify`

Advanced entrypoints:

- `salt lookup ...`
- `salt runtime ...`
- `salt doctor`

### Mapping To Current Capabilities

The first implementation does not need new reasoning. It can compose the existing internals.

- `salt build`
  - wraps current recommendation, entity/example grounding, and validation steps
- `salt review`
  - wraps current analysis and targeted lookup
- `salt migrate`
  - wraps translation plus validation for non-Salt adoption
- `salt upgrade`
  - wraps version comparison plus before-and-after analysis
- `salt verify`
  - wraps `salt lint` first and runtime inspection second when requested
- `salt lookup`
  - contains the current low-level semantic commands for advanced use
- `salt runtime`
  - contains runtime inspection flows

### Guardrails

- do not expose a one-to-one CLI copy of every MCP tool as the primary UX
- do not make the CLI a second policy layer
- do not let runtime commands become the default entry for build or migration tasks

## Skill Fallback Behavior

Skills should stay workflow-first and transport-agnostic.

### Required Skill Contract

Each workflow skill should:

1. decide the workflow
2. choose transport
3. run the canonical Salt stages
4. apply project conventions only after the canonical step
5. use runtime evidence only after source validation when still needed
6. return the same output shape regardless of transport

### Skill-To-Workflow Mapping

- `salt-project-conventions`
  - bootstrap
- `salt-ui-builder`
  - build
- `salt-ui-reviewer`
  - review
- `salt-migration-helper`
  - migrate or upgrade, depending on whether the request is non-Salt adoption or Salt-version movement

### Transport Selection Rule

- MCP available:
  - use MCP
- MCP blocked and CLI available:
  - use workflow-oriented CLI commands
- neither available:
  - return a clearly degraded answer with pending validation steps

### Output Consistency Rule

The user-facing structure should stay stable:

- workflow summary
- canonical Salt direction
- project-conventions adjustment if any
- validation status
- remaining runtime verification if any

The answer should not materially change shape just because the transport changed.

### Skill Adjustments Required

The current skills are close to the target model. They do not need a workflow rewrite, but they do need transport cleanup.

The main issue to fix:

- the skills currently read too much like `MCP first, then fall back to low-level CLI commands`
- the target model is `same workflow, choose transport, preserve output shape`

#### Shared Reference First

Update the shared workflow contract before editing each skill individually:

- `packages/skills/references/canonical-salt-tool-surfaces.md`

That reference should define:

- transport selection rules
- required workflow stages
- source-first then runtime-second verification
- low-level CLI commands as advanced fallback primitives, not the main non-MCP teaching surface

#### Skill-Specific Changes

- `salt-ui-builder`
  - keep the current build workflow
  - replace raw CLI fallback wording with workflow-oriented CLI fallback wording
  - keep low-level semantic commands as advanced or implementation-detail fallback only
- `salt-ui-reviewer`
  - same transport cleanup as the builder skill
  - keep the review/debug workflow intact
  - preserve source-first, runtime-second verification order
- `salt-migration-helper`
  - needs the largest semantic cleanup
  - explicitly distinguish:
    - non-Salt UI migration into Salt
    - Salt version upgrade work
  - keep the output stable across both paths while using the right transport underneath
- `salt-project-conventions`
  - only minor edits
  - align wording with workflow-first transport selection
  - keep conventions downstream from the canonical Salt step

#### What Not To Change

- do not add a second set of no-MCP-only skills
- do not duplicate canonical Salt policy inside the skills
- do not turn skills into a transport-specific ruleset
- do not force consumers to learn raw CLI command sequences as the primary non-MCP workflow

#### Acceptance For Skill Changes

The skill updates are successful when:

- the same skill is used in MCP and non-MCP environments
- the workflow stages stay the same across transports
- the output shape stays materially the same across transports
- transport differences are mostly invisible to the consumer unless validation is degraded
- low-level CLI commands remain available without becoming the main teaching surface

## Phased Rollout

### Phase 1. Docs

- make workflow-first docs the default
- demote low-level commands to advanced references
- align consumer examples with the same workflow model

### Phase 2. CLI Wrappers

- add workflow-oriented CLI entrypoints over current internals
- keep current low-level commands available behind advanced namespaces or compatibility aliases

### Phase 3. Skill Fallback Unification

- teach skills to prefer MCP
- teach skills to fall back to workflow CLI commands, not low-level command sequences, when possible
- keep output shape consistent across transports

### Phase 4. Cleanup

- remove doc language that frames MCP and CLI as separate paths through the product
- reduce the need for consumers to learn raw semantic commands unless they are debugging or scripting

## Acceptance Criteria

This proposal is successful when:

- a consumer can understand the stack from five to six workflows instead of from two transport types
- MCP and no-MCP environments share the same workflow model
- the CLI is a credible no-MCP answer without becoming a second MCP
- skills remain the main user-facing workflow layer
- runtime evidence stays secondary to canonical source validation

## Additional Opportunities

These are adjacent simplifications that are worth addressing after the main workflow-first shift.

### 1. Collapse The Consumer Workflow Docs

The consumer workflow story is currently spread across too many docs:

- package READMEs
- consumer setup docs
- the consumer repo example
- troubleshooting

Recommended change:

- pick one canonical consumer workflow guide
- keep package READMEs short and role-focused
- link to the canonical workflow guide instead of repeating the same flow in multiple places

Success condition:

- workflow changes are updated in one place first, not in four to six parallel docs

### 2. Remove Duplicate Skill Authoring Surfaces

The repo should have one clear source of truth for skill authoring.

Recommended change:

- keep one skill authoring source
- generate or sync any mirror locations from that source
- avoid manually maintaining multiple copies of the same skill content

This applies both to:

- duplicate skill folder surfaces
- duplicate top-level helper docs such as agent-specific wrappers that currently say the same thing

Success condition:

- a skill author changes one source, and the rest is derived

### 3. Add A Real No-MCP Workflow Smoke Test

The current smoke coverage proves individual commands and one MCP call, but not the promised workflow parity between MCP and non-MCP environments.

Recommended change:

- add a no-MCP smoke path that exercises a real workflow such as:
  - build
  - review
  - upgrade
- verify stable output sections and validation status, not only low-level command success

Success condition:

- the repo can catch regressions where the no-MCP path still works technically but no longer matches the workflow contract

### 4. Keep The Enforcement Plan Behind The Workflow Work

There is a more ambitious runtime enforcement direction for Salt-only workflow compliance.

Recommended change:

- treat that as a later guardrail layer
- do not let it outrun the simpler workflow-first product model
- first stabilize:
  - workflow docs
  - CLI wrappers
  - skill transport behavior
  - no-MCP smoke coverage

Success condition:

- enforcement builds on a clear workflow model instead of compensating for one that is still confusing

### 5. Split `Migrate` From `Upgrade` Everywhere

The stack still uses migration language for two different jobs:

- translating non-Salt UI into Salt
- moving between Salt versions

Recommended change:

- standardize terminology:
  - `migrate` or `adopt`
    - non-Salt to Salt
  - `upgrade`
    - Salt version and deprecation work

Success condition:

- consumers can tell which workflow they need without reading deep tool documentation

### 6. Shorten The Install Story

The current skills install flow is accurate but heavy and repeated in multiple places.

Recommended change:

- reduce the number of distinct install instructions
- move toward one named distribution reference or one thin install helper
- keep the docs stable even while package publication is still settling

Success condition:

- setup instructions are short, repeatable, and easy to keep aligned across docs

### 7. Keep Site Docs Cross-Cutting, Not Duplicative

Some site-doc additions are valuable because they provide cross-cutting guidance that does not clearly belong to one component page.

Examples of good cross-cutting additions:

- composition guidance
- wrapper guidance
- review checklists that apply across multiple components and patterns

But primitive-choice guidance can easily duplicate what already belongs in:

- component usage pages
- `When to use`
- `When not to use`

Recommended change:

- keep cross-cutting docs that genuinely add shared guidance
- avoid creating long duplicated primitive-choice prose when the same rule already lives in component usage pages
- if a primitive chooser page exists, keep it as a short hub:
  - short decision bullets
  - a lightweight comparison table
  - links to authoritative component usage pages
- prefer strengthening existing component usage docs and extracting their semantics over adding more agent-steering prose

This is especially important when the motivation is AI steering:

- if the rule is durable and human-facing, document it canonically
- if the rule already exists canonically, extract and consume it
- do not add a second prose source just to steer agents

Success condition:

- site docs stay useful to humans first
- cross-cutting docs add genuinely new guidance
- primitive-choice rules have one clear canonical home
- AI quality improves more from better extraction and validation than from duplicated prose

### 8. Decouple AI Guide Extraction From Docs IA

The current guide extraction model treats top-level getting-started pages as AI-visible guides by directory convention.

That is convenient, but it also means:

- adding a new getting-started page can change AI behavior unintentionally
- docs information architecture decisions become coupled to recommendation and validation behavior
- maintainers may add or edit prose for site navigation reasons and accidentally affect the AI layer

Recommended change:

- make AI guide extraction explicit instead of purely folder-based
- use frontmatter or a small manifest to mark which docs should become:
  - AI guide records
  - validation-backed canonical references
  - optional discoverability-only pages
- keep docs navigation structure and AI extraction policy related, but not identical

This would let the team:

- keep useful human docs in getting-started
- avoid making every new page part of the reasoning substrate automatically
- promote a page into AI guidance only when it is durable enough to own canonical decisions

Success condition:

- docs IA can evolve without silently changing AI behavior
- AI-visible guide additions are intentional and reviewable
- maintainers can distinguish between human-navigation docs and canonical reasoning docs in a lightweight, explicit way

### 9. Rely More On Agents, Less On Product Surface

For external Salt consumers, the stack currently risks over-explaining the mechanics and under-trusting the agent to handle transport and synthesis.

Areas where the current design does too much:

- too many product concepts are exposed at once:
  - MCP
  - skills
  - CLI semantic commands
  - CLI runtime commands
  - project conventions
  - layered conventions
  - repo instruction files
- skills and shared references prescribe too much exact tool choreography
- the no-MCP path is taught as raw command literacy instead of as the same workflow through a different transport
- project conventions are described with more advanced machinery than most consumer repos need
- heavier enforcement ideas risk compensating for workflow confusion instead of simplifying the workflow first
- some docs additions risk duplicating guidance mainly to steer agents

Recommended change:

- keep the product story small:
  - one workflow layer
  - one canonical reasoning layer
  - one fallback transport
- let the agent choose the exact canonical tool inside a workflow more often
- let the agent hide transport differences unless validation is degraded
- keep the default project-conventions story on `.salt/team.json`
- prefer stronger canonical docs plus extracted semantics over more workflow prose and more transport-specific explanation

Where the stack should still stay deterministic:

- canonical extraction from docs and metadata
- validation and deprecation checks
- project-convention merge precedence
- source attribution where outputs must stay testable

Where the stack should rely on agents more:

- selecting the exact canonical tool for the current workflow
- synthesizing across existing canonical component and pattern guidance
- applying simple repo-local conventions after the canonical step
- adapting the final explanation to the user's repo and task without exposing internal transport choices

Success condition:

- consumers learn the workflow, not the plumbing
- maintainers encode durable truth in canonical docs and extraction
- agents do more of the orchestration and synthesis work that does not need to be identical across every client
- the stack gains simplicity without losing correctness on the stable parts of the job

### 10. Test The Consumer Workflow Contract

The current test suite is stronger on deterministic internals than on the external-consumer workflow contract.

What is already working well:

- registry extraction and integration coverage
- semantic regression guards
- guide lookup and source attribution coverage
- CLI command-level tests
- MCP tool-surface and tool-output tests
- one consumer smoke test that proves installability and basic command execution

Where the current test shape is still too thin:

- the consumer smoke validates low-level commands more than real user workflows
- skills are only checked for discovery and installation, not behavior
- there is no explicit parity test for:
  - MCP-backed workflow execution
  - CLI-backed no-MCP workflow execution
- the smoke fixture is too simple to represent the main external-consumer jobs:
  - building in a new repo
  - building in an existing repo
  - migrating non-Salt UI into Salt
  - upgrading an app across Salt versions

Recommended change:

- keep the current deterministic unit and integration tests
- add workflow-acceptance tests as the next layer up, centered on the workflows consumers actually care about
- add three to four stable fixture repos:
  - new repo bootstrap and build
  - existing repo build and review with repo-local wrappers or conventions
  - non-Salt UI migration into Salt
  - Salt version upgrade and deprecation cleanup
- run the same workflow contract through both transports where possible:
  - agent plus MCP
  - agent plus CLI fallback
- assert stable output sections and decision shape rather than exact prose:
  - workflow identified
  - canonical recommendation
  - verification stage
  - project-conventions impact
  - follow-up actions
- add skill contract tests for:
  - `salt-ui-builder`
  - `salt-ui-reviewer`
  - `salt-migration-helper`
  - `salt-project-conventions`

Testing principle:

- deterministic substrate tests should protect correctness of extraction, ranking, validation, and attribution
- workflow-acceptance tests should protect the consumer experience and no-MCP parity
- do not try to snapshot every sentence; snapshot the contract and the important evidence

Success condition:

- a consumer workflow can be tested end-to-end without depending on maintainers mentally simulating the agent
- MCP and no-MCP paths remain aligned for the same workflow
- skill changes can be made without silently regressing the consumer experience
- the highest-risk workflows are covered by fixtures that look like real external repos

### 11. Keep Runtime Inspection, But Demote It

The runtime-inspection side of the CLI provides real value, but it should stay in the evidence layer rather than becoming a primary consumer-facing product surface.

What is worth keeping:

- `salt doctor` as a practical environment and runtime-target check
- `salt runtime inspect` as optional second-pass evidence when source reasoning is not enough
- Playwright-backed browser-session inspection for deterministic screenshots, runtime errors, hydrated accessibility output, and rendered structure

What should change:

- do not teach inspection commands as part of the main workflow story
- hide inspection under workflow and verification steps such as:
  - `review`
  - `migrate`
  - `upgrade`
  - `verify`
- keep the default guidance:
  - canonical Salt reasoning first
  - project conventions second
  - runtime evidence only when uncertainty remains

Recommended change:

- keep Playwright as the default CLI inspection backend because it is deterministic, automatable, and CI-friendly
- treat agent-side URL fetching as a cheaper first-pass evidence source for:
  - title
  - status
  - coarse structure
  - obvious landmarks or roles in static HTML
- only escalate to Playwright-backed inspection when the claim depends on:
  - hydration or client-side rendering
  - runtime or console errors
  - screenshots
  - hydrated accessible names
  - rendered structure
  - layout-sensitive behavior

Success condition:

- consumers do not need to think about runtime inspection unless the workflow actually needs extra evidence
- the CLI keeps a useful runtime-evidence layer without becoming a second product to learn
- Playwright remains justified by deterministic evidence collection rather than by feature creep

### 12. Treat Layout Debug As Advanced Evidence

Layout-debug evidence is useful in some cases, but it should not be part of the default consumer contract.

Recommended change:

- keep layout evidence in the backend
- stop expanding it as a headline feature for now
- remove most layout-debug emphasis from the main consumer-facing docs
- define two evidence levels:
  - stable evidence contract:
    - screenshot
    - runtime or page errors
    - roles and landmarks
    - coarse structure
  - advanced evidence contract:
    - computed layout details
    - bounding boxes
    - flex or grid ancestry
    - centering, overflow, and clipping hints

Skill behavior should follow that split:

- default to source reasoning
- use agent fetch or fetched-html evidence for cheap first-pass checks
- request Playwright-backed runtime inspection only when the issue is explicitly runtime-sensitive or layout-sensitive
- only surface advanced layout evidence when it materially affects the conclusion

Success condition:

- most workflows do not depend on layout-debug details
- advanced layout evidence still exists for hard visual debugging cases
- the runtime-evidence layer stays useful without growing into a browser-devtools clone

### 13. Let Skills Ask For Evidence, Not Specific Commands

Skills should not teach consumers a command sequence such as `salt doctor` followed by `salt runtime inspect`.

Recommended change:

- rewrite the skill contract around evidence needs instead of transport details
- let skills request:
  - canonical Salt guidance
  - project-conventions guidance
  - runtime evidence
- let the environment choose how runtime evidence is obtained:
  - agent-side fetch
  - Playwright-backed CLI inspection
  - manual validation when necessary

This keeps the skill model aligned with the broader workflow-first direction:

- same workflow
- same output contract
- environment-specific evidence transport hidden underneath

Success condition:

- skills remain stable even if the runtime-evidence transport evolves
- no-MCP and MCP environments can share the same workflow contract more easily
- consumers learn what evidence was used, not which subcommand produced it

### 14. Use Third-Party Skills At The Edges, Not For Salt Truth

Third-party skills can add value, but they should support the host app around Salt rather than replace Salt-owned reasoning.

Good uses for third-party skills:

- framework-specific implementation help
- React composition and performance guidance
- deployment workflows
- broad UX and accessibility review outside Salt-specific policy

Bad uses for third-party skills:

- canonical Salt component or pattern choice
- Salt migration policy
- Salt upgrade and deprecation reasoning
- source attribution for canonical Salt claims
- project-conventions precedence

Recommended change:

- define Salt skills as the owner of canonical Salt reasoning
- allow optional third-party skills to contribute host-app expertise around:
  - framework integration
  - implementation quality
  - deployment
  - general web review
- keep final Salt-specific decisions anchored in Salt-owned canonical sources and validation

Success condition:

- consumers get the benefit of ecosystem expertise without losing Salt correctness
- third-party skills complement Salt workflows instead of fragmenting them
- maintainers know which parts of the answer must stay under Salt control

### 15. Implementation Sequence

The changes above should be implemented in phases that produce a coherent external-consumer story at each stop point.

Guiding rule:

- do not start by adding more surface area
- start by simplifying the story consumers see
- only add new wrappers or commands after the workflow contract is stable

#### Phase 0: Freeze The V1 Boundary

Decide and document the non-negotiable default consumer stance:

- skills are the workflow layer
- MCP is the preferred canonical transport
- CLI is the fallback transport
- `.salt/team.json` is the default conventions layer
- runtime inspection is optional evidence only
- layout debug is advanced evidence only

Exit criteria:

- the proposal, top-level consumer docs, and maintainers all use the same default story
- anything outside that story is explicitly marked advanced, internal, or deferred

#### Phase 1: Simplify The Consumer Docs First

Before changing code, make the external documentation tell one story.

Scope:

- update consumer-facing docs to center:
  - bootstrap
  - build
  - review
  - migrate
  - upgrade
  - verify
- reduce emphasis on:
  - raw CLI semantic commands
  - inspection internals
  - layered conventions for the default path
- standardize terminology:
  - `migrate` for non-Salt to Salt
  - `upgrade` for Salt version and deprecation work

Primary files:

- consumer workflow docs under `packages/mcp/docs/`
- `examples/consumer-repo/README.md`
- package READMEs that currently teach overlapping paths

Exit criteria:

- a new consumer can understand the supported workflows without learning transport internals first
- docs no longer present MCP and CLI as two different mental models

#### Phase 2: Rewrite The Skill Contract Around Workflow And Evidence

Once the docs are simplified, align the skill layer to the same model.

Scope:

- update the shared skill reference to describe:
  - canonical Salt guidance
  - project conventions
  - runtime evidence
- remove direct command choreography from the default skill behavior
- make skills ask for evidence needs rather than specific CLI commands
- split migration and upgrade behavior clearly in the migration helper

Primary files:

- `packages/skills/references/canonical-salt-tool-surfaces.md`
- workflow skill `SKILL.md` files

Exit criteria:

- skills share one workflow contract across MCP and no-MCP environments
- transport details are hidden behind the skill behavior unless degradation must be disclosed

#### Phase 3: Align The No-MCP Fallback Without Over-Expanding The CLI

Only after docs and skills are aligned should the fallback transport be adjusted.

Scope:

- decide whether workflow-oriented CLI wrappers ship now or later
- if they ship now:
  - add thin workflow commands that compose existing semantic and evidence commands
- if they do not ship now:
  - keep low-level commands but demote them in docs and skill references
- keep:
  - `salt doctor`
  - `salt runtime inspect`
  - `salt lint`
- keep Playwright as the inspection backend
- do not expand layout-debug scope during this phase

Exit criteria:

- no-MCP environments have a credible answer that still feels like the same workflow
- CLI fallback does not become a second product to learn

#### Phase 4: Add Workflow-Level Acceptance Tests

After the workflow contract is stable, lock it down with tests.

Scope:

- add fixtures for:
  - new repo bootstrap and build
  - existing repo build and review
  - migration into Salt
  - upgrade across Salt versions
- add parity coverage for:
  - MCP-backed workflow execution
  - CLI-backed no-MCP execution
- add skill contract tests
- keep snapshots focused on output structure and evidence, not exact prose

Exit criteria:

- workflow regressions are caught before release
- MCP and no-MCP paths stay aligned for the same consumer task

#### Phase 5: Prune Or Refactor Optional Surfaces

Only after the main workflow is coherent and tested should the team spend time on optional cleanup.

Scope:

- trim duplicated site-doc guidance
- make AI guide extraction explicit rather than folder-driven
- remove or consolidate duplicate skill authoring surfaces
- revisit whether any low-level CLI command should remain public-facing

Exit criteria:

- optional cleanup reinforces the simplified workflow model instead of reopening it

Recommended stop points:

- after Phase 2:
  - the product story is materially improved even if the CLI shape is unchanged
- after Phase 4:
  - the workflow model is both coherent and protected by tests
- Phase 5:
  - only if the team still has appetite after the main consumer story is stable

## Remaining Execution Plan

The simplification work is materially started, but not complete.

What is already done:

- consumer docs and skill references now teach one workflow model instead of two transport-first stories
- the public manual CLI story is now intentionally small:
  - `salt doctor`
  - `salt runtime inspect`
  - `salt lint`
- restricted environments now have a hidden CLI workflow transport so `skills + CLI` still works
- the consumer smoke now covers real workflow transport checks instead of only low-level command success

What is still missing:

- replacing the documented skills source with a truly stable package, tag, or release ref
- any final maintainer-doc cleanup that is still purely narrative rather than behavior-changing

### Remaining Execution After The Cleanup Pass

The core external-consumer simplification is now in place:

- the public manual CLI is small
- `skills + MCP` is the default
- `skills + CLI` is the restricted-environment fallback
- AI guide extraction is explicit
- the most obvious duplicated consumer docs have been thinned

The remaining work is narrower and should be treated as follow-through, not as another architecture round.

#### 1. Finish Workflow Acceptance Coverage

Goal:

- move from one broad smoke harness to stable, fixture-backed workflow acceptance

Status:

- completed in this repo state through:
  - workflow-scenario CLI fixtures
  - skill-contract tests
  - the separate-repo smoke harness

Work:

- keep the current workflow-scenario and skill-contract coverage updated when the workflow contract changes
- expand bootstrap coverage further only if a first-class executable bootstrap transport is introduced later

Exit criteria:

- the smoke harness is no longer the only workflow guard
- build, review, migrate, and upgrade each have stable workflow coverage
- bootstrap expectations are protected through the project-conventions skill contract until a dedicated executable bootstrap surface exists

#### 2. Fix The Install And Distribution Story

Goal:

- stop relying on the branch-pinned GitHub subtree path as the long-term consumer instruction

Status:

- partially completed:
  - install wording is now centralized in `skills-install-source.md`
  - consumer docs now point at one maintained install-source file

Work:

- replace the current documented source with one truly stable answer:
  - a published package or release ref
  - a stable Git tag
  - or a thin installer alias if publication is still deferred

Exit criteria:

- the repo has one maintained install instruction
- that instruction no longer depends on a moving branch path

#### 3. Finish Source And Doc Consolidation

Goal:

- close the remaining gaps where duplication or stale planning language can still cause drift

Status:

- mostly completed:
  - `AGENTS.md` is the effective canonical shared skill source
  - the primitive chooser is reduced to a short hub
  - AI-guide extraction is explicit

Work:

- keep the remaining planning and maintainer docs aligned when future behavior changes land
- keep `component usage` docs as the authority for primitive-choice detail and leave the chooser guide as a short hub

Exit criteria:

- a skill author has one clearly canonical place to edit shared guidance
- future doc updates keep the simplified consumer model intact instead of re-expanding it

### Recommended Order For The Remaining Work

1. Add fixture-backed workflow acceptance tests.
2. Choose and apply the stable install/distribution answer.
3. Do one final cleanup pass on skill-source duplication and stale planning docs.

### Done Means After This Pass

The simplification plan should only be considered fully complete when:

- the workflow model is covered by stable acceptance fixtures, not just smoke
- the install story is short and stable
- remaining skill/doc duplication is intentionally resolved
- planning docs match the actual shipped simplification state

### Principle For The Rest Of The Work

Do not keep hiding old surfaces indefinitely.

From this point on:

- if a surface is not part of the intended external-consumer model, either:
  - delete it
  - or mark it clearly internal and stop polishing it
- prefer removal over demotion when the hidden surface no longer earns its keep
- do not add new polish to duplicated docs or fallback layers that should eventually disappear

### Execution Order

#### 1. Delete Unneeded Low-Level CLI Surface

Goal:

- turn the current soft simplification into actual surface reduction

Work:

- audit which hidden low-level CLI commands are still truly required for `skills + CLI`
- keep only the hidden workflow transport that the restricted-environment contract actually needs
- delete any remaining low-level command handlers, tests, and docs that are not required
- remove any lingering language that treats raw semantic commands as part of the intended consumer model

Decision rule:

- if `discover`, `choose`, `translate`, `entity`, `examples`, `compare-versions`, `lint`, `doctor`, and `runtime inspect` are enough for the restricted path, then remove `search` and `changes`
- if `entity` or `examples` can also be subsumed by the hidden workflow transport, remove them too
- keep only the minimum hidden transport set that the skills actually need

Exit criteria:

- the repo contains fewer command surfaces, not just fewer documented ones
- there is one clear reason for every remaining hidden CLI command

#### 2. Consolidate Consumer Docs For Real

Goal:

- stop maintaining the same consumer story in parallel files

Work:

- choose one canonical consumer workflow guide
- reduce the other consumer-facing docs to:
  - setup
  - troubleshooting
  - package role summaries
  - example repo pointers
- remove repeated workflow prose from package READMEs where it is no longer needed
- link outward instead of restating the same workflow contract in several places

Recommended canonical guide:

- `packages/mcp/docs/consumer-repo-setup.md`
  - setup and environment modes
- plus one dedicated workflow guide for:
  - bootstrap
  - build
  - review
  - migrate
  - upgrade
  - verify

Exit criteria:

- workflow wording is edited in one place first
- package READMEs stop acting like parallel product guides

#### 3. Finish The Testing Layer

Goal:

- cover the remaining acceptance items from this proposal instead of stopping at the smoke harness

Work:

- add fixture-oriented workflow acceptance for:
  - new repo bootstrap and build
  - existing repo build and review
  - migrate non-Salt UI into Salt
  - upgrade Salt versions
- add explicit skill contract tests where feasible
- keep assertions on:
  - workflow identified
  - canonical direction returned
  - validation stage present
  - project-conventions boundary present when applicable
  - degraded validation clearly marked when transport is limited

Exit criteria:

- the consumer smoke is no longer the only workflow-level guard
- the main supported workflows each have at least one stable fixture path

#### 4. Remove Duplicate Skill Authoring Surfaces

Goal:

- keep one source of truth for skill content

Work:

- choose the monorepo authoring source that should remain canonical
- remove or generate any mirror copies such as alternate `.agents` skill trees if they still exist
- remove duplicated top-level helper files that say the same thing unless a generated copy is required by tooling

Exit criteria:

- a skill author edits one source
- duplicate skill copies are no longer hand-maintained

#### 5. Prune Duplicated Site Docs

Goal:

- keep only site-doc additions that add durable human value

Work:

- review the new `site/docs/getting-started/*` additions
- keep cross-cutting pages such as:
  - composition guidance
  - wrapper guidance
- slim or remove duplicated primitive-choice prose where the same rule already exists in component usage docs
- move authority back to:
  - component `When to use`
  - component `When not to use`
  - extracted semantics

Exit criteria:

- humans do not have to reconcile two prose sources for the same primitive-choice rule
- AI quality depends more on extraction than on duplicated prose

#### 6. Make AI Guide Extraction Explicit

Goal:

- decouple docs IA from AI reasoning changes

Work:

- add explicit AI-guide inclusion through frontmatter or a small manifest
- distinguish:
  - human-navigation pages
  - canonical AI guide pages
  - optional discoverability-only pages
- update extraction code to honor that explicit contract

Exit criteria:

- adding a new getting-started page does not silently change AI behavior
- AI-visible guide changes become intentional and reviewable

#### 7. Shorten The Install Story

Goal:

- reduce friction and repeated install instructions

Work:

- replace the branch-pinned skills source with a stable tag, release ref, or thin install helper
- update all consumer docs to one install path
- remove repeated install wording from every package README

Exit criteria:

- one stable install instruction is documented everywhere
- consumers do not have to learn a branch-specific GitHub subtree path

### Recommended Next PR Sequence

If the remaining work is done as implementation rather than more planning, the cleanest order is:

1. low-level CLI removal pass
2. consumer-doc consolidation pass
3. workflow-fixture test pass
4. skill-source consolidation pass
5. site-doc pruning pass
6. explicit AI-guide extraction pass
7. install-story cleanup pass

### Done Means

The proposal should only be considered complete when all of these are true:

- the external-consumer model is small and stable
- hidden/internal transport is minimal rather than sprawling
- duplicated docs are removed, not just softened
- duplicated skill sources are removed or generated
- AI-visible docs are explicitly selected
- the main workflows have fixture-backed acceptance coverage
- setup/install instructions are short and uniform

## Working Rule

Teach consumers:

- what workflow they are in
- what verification stage they are in
- what local conventions changed the final answer

Do not teach them the transport internals first.
