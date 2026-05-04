# Salt AI Tooling Competitor Learnings Plan

## Status

Active final-pass tracker.

Created: April 30, 2026

Updated: May 4, 2026

This document started as the implementation plan. It now serves as the
historical plan plus the final tracker for what is done and what remains.

Use this order when reading it:

1. **Current Implementation Snapshot** is the live status.
2. **Final Work Left** is the remaining implementation list.
3. The original workstreams, release plan, and backlog are retained below as
   historical context.
4. The live evidence gap register is
   `packages/mcp/docs/ai-tooling-evidence-gap-register.md`.

## Current Implementation Snapshot

The core evidence and guardrail system is now in place. The remaining work is
mostly evidence completion and unsupported product-surface closure, not new
guardrail architecture.

### Done Or Materially Implemented

- EvidenceRef model and generated-artifact guardrails in `semantic-core`.
- Shared schemas for evidence refs, generated artifacts, generated context,
  context manifests, context health, review reports, validation reports, setup
  state, workflow follow-up reports, release gates, and the final closure
  report.
- Registry fingerprinting so generated context, reports, doctor checks, MCP
  resources, and release gates can compare against the same registry snapshot.
- Registry-aware generated-artifact validation that fails when generated
  context or reports claim undocumented props, tokens, imports, examples,
  statuses, or accessibility fields.
- Component context JSON and Markdown bridge generation from semantic-core
  serializers.
- Selected pattern context and foundation-token context generation from
  semantic-core serializers, with unsupported claims recorded when evidence is
  incomplete.
- Context-pack manifests, stale checks, health checks, coverage audits, and
  release-gate checks shared through semantic-core.
- CLI `export-context` surfaces for explicit component export, default selected
  context export, manifests, checks, coverage, and release-gate validation.
- CLI `info` and `doctor` generated-context health and setup-state reporting.
- CLI `doctor --ai` setup summary and final evidence-closure report support.
- MCP context resources for manifest, health, component context, pattern
  context, foundation token context, context-pack bundles, setup state, release
  gate state, coverage audit, and evidence closure.
- MCP persistence tools now write release-gated generated context packs and
  generated report/artifact payloads to project-local durable files through
  semantic-core release gates and persistence-check schemas. Blocked or invalid
  generated artifacts are not written.
- Durable review report serialization through semantic-core.
- CLI and MCP review report validation/resume surfaces share the same
  semantic-core report validator.
- Compact and full CLI/MCP review paths now expose shared report/evidence gate
  state instead of transport-owned status logic.
- Migration and upgrade `--report` now emit shared semantic-core
  `salt_workflow_followup_report_v1` reports with workflow/package/runtime
  EvidenceRefs where available. CLI `migrate` and `upgrade` can attach a
  validated `salt_review_report_v1` through `--review-report`; current,
  supported review evidence moves the follow-up report to ready, while missing
  review evidence stays degraded and stale, invalid, or unsupported review
  evidence stays unsupported.
- Token policy and structural-role evidence now flow through serialized
  source-backed rule packs where available.
- Pattern validation rule packs now use source-backed starter-scaffold records
  where validators exist, and record unsupported gaps for unsupported behavior.
- Source-backed registry extraction now captures component accessibility prose
  outside keyboard-reference blocks and pattern guidance inside nested
  documentation subsections, so those generated context facts flow through
  semantic-core registry records instead of prompt guidance.
- Pattern registry extraction now captures missing `how_it_works` context from
  source-backed non-generic pattern documentation sections when explicit
  `How it works` sections are absent. The fresh production audit has no pattern
  `how_it_works` guidance gaps; remaining pattern gaps are accessibility
  summaries, missing `when_not_to_use` or `how_to_build` sections, and selected
  non-default records with unsupported missing-evidence claims.
- Context coverage now distinguishes component accessibility docs that contain
  no extractable non-keyboard guidance from missing component source/docs
  locators. The fresh production audit has zero stable component source/docs
  locator gaps; the remaining component coverage gaps stay unsupported docs or
  registry gaps until source-backed non-keyboard guidance exists.
- Foundation token structural-role rule packs now preserve source-backed
  separable static and feedback separator evidence as separate rules, so
  generated foundation context structural-role claims resolve to rule-pack
  EvidenceRefs.
- Foundation token policy source indexing now closes `layout` and `shadow`
  policy gaps from exact token mentions in source-backed foundation docs. The
  fresh production audit has 47 total docs/registry gap records, with 8
  remaining foundation token families lacking policy docs or source-backed
  policy evidence.
- Skill, CLI help, MCP instructions, and generated host-instruction placeholder
  surfaces avoid hardcoded provider/theme defaults, sample entity names, and
  hardcoded tool counts.
- The final closure artifact,
  `salt_ai_evidence_closure_report_v1`, summarizes the remaining slices with
  zero generated Salt claims and a blocked/degraded release gate when evidence
  is missing.
- Final release-gate sweep now blocks generated artifacts with stale real
  `sha256:` registry fingerprints, manifest-pack component Markdown that no
  longer matches the source component context serializer, and directory-pack
  JSON files that lack `salt_generated_artifact_v1` provenance. This keeps
  generated docs and report/context JSON from passing when undocumented fixture
  props, tokens, imports, examples, statuses, or accessibility claims are
  smuggled in outside semantic-core artifacts.
- Final verification pass on May 4, 2026 is green for the Salt AI guardrail
  surfaces: `yarn typecheck`, `@salt-ds/semantic-core` build,
  semantic-core guardrail tests, CLI workflow/export tests, MCP deterministic
  evals/tooling tests, MCP server contracts, MCP/skill parity tests, and the
  production context coverage audit. The fresh production audit still reports
  47 explicit unsupported docs/registry gap records instead of filling them
  with generated facts: 11 component gaps, 28 pattern gaps, and 8 foundation
  token-policy gaps.

### Unsupported Or Degraded By Design Today

These are not hidden failures. They are explicit unsupported or degraded states
until source-backed serializers, registry records, or validators exist.

- Prompt files and host instruction files.
- Broader non-selected context surfaces.
- Host-managed attachment stores beyond project-local MCP artifact writes.
- Post-migration changed-file validation remains degraded when no source-backed
  review report evidence is attached to the follow-up report.
- Post-upgrade changed-file validation remains degraded when no source-backed
  review report evidence is attached to the follow-up report.
- Pattern behavior that needs richer validators, including region order, layout
  semantics, interaction details, preserve constraints, and pattern
  accessibility behavior.
- Component accessibility docs that contain only keyboard-reference material or
  no extractable non-keyboard guidance.
- Foundation token families that lack policy docs or source-backed policy
  evidence: delay, differential, draggable, icon, measured, opacity, taggable,
  and track.

## Final Work Left

1. Keep prompt files, host instruction files, broader non-selected context
   surfaces, and host-managed attachment stores explicitly unsupported or
   backed only by source-backed serializers as those surfaces expand.
2. Close context coverage docs/registry gaps found by
   `salt_context_coverage_audit_v1`: component accessibility docs with only
   keyboard-reference material, pattern optional/unsupported context gaps, and
   foundation token policy gaps.
3. Add category-specific docs or registry records for the remaining foundation
   token families: delay, differential, draggable, icon, measured, opacity,
   taggable, and track.
4. Extend pattern validators beyond current starter import/text checks to cover
   source-backed region order, layout semantics, interaction details, preserve
   constraints, and accessibility behavior where validators can be supported.
5. Keep rule-pack/report provenance paths on shared semantic-core serializers
   as new validators are added; false-positive guidance still needs Salt docs,
   source, examples, explicit workflow input, or project policy evidence.
6. Clean up the large dirty worktree, review the full diff for unrelated
   changes, stage intentionally, and commit.
7. Run any broader release verification outside the Salt AI guardrail scope
   required by the eventual PR, such as full monorepo app or visual suites.

### Final Done Criteria

- Every emitted Salt claim either has an EvidenceRef or is represented as an
  unsupported/degraded gap.
- CLI, MCP, and skill behavior remains shared through semantic-core serializers
  and schemas.
- No prompt, skill, CLI, MCP, generated doc, or test introduces production Salt
  facts outside the allowed evidence sources.
- Missing docs or registry data is visible in the gap register or in generated
  unsupported states.
- The final release gate passes for supported artifacts and blocks unsupported
  artifacts instead of allowing undocumented facts.

## Purpose

Turn the comparison between Salt AI tooling, `ada-accessibility-skill`, and the
`design-system/` AI starter-kit approach into a concrete implementation plan for
the Salt CLI, MCP, and `salt-ds` skill.

This plan is intentionally practical. It does not propose replacing Salt's
current architecture. It keeps the existing Salt workflow contract and uses the
competitor work to improve adoption, agent execution quality, review loops, and
host-native context distribution.

## Source Inputs

These are planning and comparison inputs. They are not all canonical content
sources.

- `packages/skills/salt-ds/SKILL.md`
- `packages/mcp/README.md`
- `packages/mcp/docs/salt-workflow-v1-host-contract.md`
- `packages/mcp/docs/public-api-matrix.md`
- `packages/cli/README.md`
- `.agents/skills/ada-accessibility-skill/SKILL.md`
- `.agents/skills/ada-accessibility-skill/references/agent.md`
- `PLAN.md`
- `design-system/`
- `salt-ai-tooling-positioning-memo.md`
- `salt-ai-tooling-next-releases-plan.md`

Canonical Salt content must come from:

- the `semantic-core` registry and generated registry artifacts
- source-backed Salt docs, examples, component source, token data, and package
  metadata ingested into that registry
- explicit repo-local project policy in `.salt` files
- explicit user input captured by workflow state

`PLAN.md`, `design-system/`, and competitor skills may influence product shape,
but they must not become sources for Salt component facts, APIs, tokens,
accessibility rules, provider defaults, or implementation guidance.

## Executive Decision

Keep the Salt CLI, MCP, `semantic-core`, and `salt-ds` skill as the canonical
system.

Adopt the best ideas from the other two approaches:

1. From `ada-accessibility-skill`: clearer phase structure, mandatory
   transition gates, durable reports, validation loops, concrete fallback
   behavior, and disciplined output templates.
2. From `design-system/ + PLAN.md`: visible host-native context files, small
   bridge files, prompt files, a simple setup story, and a lightweight prototype
   or adoption front door.

The target product shape is:

- `semantic-core` remains the source of Salt truth.
- MCP remains the preferred transport for agent hosts.
- CLI remains the fallback, support, and generation transport.
- `salt-ds` remains the single public skill.
- Generated static context packs become the easy onboarding layer.
- ADA-style review reports become the trust and remediation layer.

## Strategic Principle

Salt should not try to become a generic UI generator.

Salt should become the safest way for agents to create, review, migrate, and
upgrade Salt UI in real repositories.

That means every change in this plan should improve at least one of these:

- canonical grounding
- exact-request safety
- repo-aware application
- host-native usability
- validation and follow-through
- adoption and first-run clarity

## World-Class Evidence Standard

Every Salt-facing output should be registry, documentation, evidence, or
declared-policy based.

The standard:

- No hardcoded Salt API facts in CLI, MCP, skill, prompt, or generated context
  templates.
- No hardcoded prop names, token names, component status, package names, import
  paths, provider defaults, examples, or accessibility claims outside generated
  registry fixtures and schema tests.
- Templates may define structure, headings, tone, and host behavior. Templates
  must not define Salt facts.
- Every non-boilerplate Salt claim in generated context, reports, and workflow
  output should resolve to an evidence reference.
- Evidence references should include enough detail for debugging: registry entity
  id, source URL or source file path, source section when available, package
  version or registry hash, and whether the claim came from canonical Salt docs,
  source extraction, examples, or repo-local policy.
- Missing evidence should fail closed for implementation guidance and should be
  visible in output as `missing`, `unsupported`, or `degraded`.
- Repo-local policy may refine canonical guidance, but it must be labeled as
  project policy and must not overwrite the canonical registry record.
- Context-pack generation, MCP context resources, and CLI JSON must share the
  same serializers and evidence graph.
- Release gates should block if generated context contains undocumented props,
  tokens, imports, component capabilities, or accessibility rules.

This is the line between "nice AI docs" and a trusted design-system intelligence
layer.

## External Market Bar

This plan should clear the current external bar, not merely improve the current
Salt implementation.

As of April 30, 2026, the relevant market signals are:

- MUI MCP emphasizes official docs, direct sources, actual documentation links,
  and officially published component registries.
- Shopify AI Toolkit bundles plugin, skills, MCP, documentation, API schemas,
  and code validation, with plugin installation positioned as the easiest and
  auto-updating path.
- Storybook AI combines manifests, MCP documentation retrieval, story creation,
  interaction tests, and accessibility checks into a validation loop.
- Figma Code Connect improves MCP code generation by linking design-system
  components in Figma to actual source code and implementation snippets.
- shadcn succeeds with registry-backed browse, search, and install flows,
  including private and namespaced registries.
- Claude Design is raising expectations for fast exploration, visual polish,
  prototypes, and handoff, but it does not replace Salt's shipping-safety layer.

Salt should not copy any one of these. Salt should combine the strongest parts
into a design-system workflow product:

- MUI's source-backed retrieval discipline
- Shopify's coherent toolkit and validation posture
- Storybook's self-checking loop
- Figma's design-to-code evidence bridge
- shadcn's registry-first distribution model
- Claude Design's handoff expectation
- Salt's own exact-request workflow safety, repo policy, and fail-closed gates

If the plan ships correctly, the answer to competing internal efforts should be:

"Bring your work into the Salt registry, rule packs, report schemas, or context
serializers. Do not maintain a parallel Salt agent."

## Rallying Demo Bar

The plan must produce demos strong enough that adjacent efforts want to join
instead of fork.

The first public internal demo should show all of this in one short flow:

1. Run one setup command that verifies CLI, MCP, skill, registry, repo policy,
   and generated context health.
2. Ask for a Salt UI change in a real repo.
3. Show the workflow stopping on missing evidence instead of guessing.
4. Follow the returned retrieval or context action.
5. Implement only after the hard gate passes.
6. Run review and produce a durable report with evidence refs.
7. Show `doctor` proving the generated context and registry hash are current.
8. Open the generated host context and show that the same rule is source-backed,
   not hand-authored.

There should also be two consolidation demos:

- ADA replacement demo: run a Salt accessibility review profile, produce a
  report, classify false positives with provenance, and validate follow-through.
- Starter-kit replacement demo: generate host-native context from the registry,
  show stale detection, and show that no generated file contains unsupported
  Salt facts.

The wow moment is not "the agent wrote UI." The wow moment is "the agent knew
what it was allowed to know, proved where it knew it from, and stopped where it
did not."

## Comparison Summary

### Salt CLI, MCP, And Skill

Strengths:

- Strong canonical source-of-truth strategy through `semantic-core`.
- Compact public contract through `salt_workflow_v1`.
- Shared workflow model across CLI and MCP.
- Strong implementation gate for create, migrate, and upgrade.
- Repo-aware policy layering through `.salt` files.
- Full lifecycle coverage: create, review, migrate, upgrade, and init.

Weaknesses:

- The skill reads more like a transport/product contract than an operational
  playbook.
- The first-run story is less obvious than a starter-kit repo.
- Review output is less disciplined than the ADA output template.
- The system is correct but can feel heavy before the user sees value.
- Static host context is not yet a first-class generated artifact.

### ADA Accessibility Skill

Strengths:

- Excellent operational writing.
- Clear phase structure: automated scan, manual review, validation and QA.
- Explicit transition gates.
- Concrete fallback chain.
- Narrow, countable scope.
- Durable report artifact through `a11y.md`.
- Strong output template and follow-up choices.
- Clear distinction between fixed, flagged, skipped, false positive, and best
  practice items.

Weaknesses:

- Narrow domain.
- Skill-local runtime artifacts are not ideal for shared repo workflows.
- Heavy process would be too much if copied directly into every Salt workflow.
- Does not solve canonical design-system grounding or broader create/migrate
  work.

### Design-System Starter-Kit Approach

Strengths:

- Very approachable.
- Works with GitHub Copilot's native mechanisms.
- Separates facts, guidance, bridge summaries, and task prompts.
- Makes context visible and easy for teams to edit.
- Simple prototype setup story.
- Bridge files are a strong usability pattern.

Weaknesses:

- Static and drift-prone unless generated from canonical sources.
- No safety gate.
- No validation loop.
- No transport-stable contract.
- No way to distinguish canonical Salt guidance from repo-local conventions
  unless the files are generated and annotated carefully.

## Product Shape After This Plan

The final system should have four layers.

### Layer 1: Canonical Engine

Owner:

- `packages/semantic-core`

Responsibilities:

- Build and load the Salt registry.
- Derive canonical workflow results.
- Own `salt_workflow_v1`.
- Generate static host context from the same registry.
- Provide review profiles and report schemas.

### Layer 2: Transports

Owners:

- `packages/mcp`
- `packages/cli`

Responsibilities:

- Expose the same workflow vocabulary.
- Preserve compact workflow parity.
- Expose generated context pack access.
- Support reports, validation, and host setup checks.

### Layer 3: Agent Skill

Owner:

- `packages/skills/salt-ds`

Responsibilities:

- Route user intent into the right workflow.
- Follow the MCP or CLI action contract.
- Use smaller phase recipes per workflow.
- Present output in consistent, decision-first templates.
- Degrade gracefully when transport is unavailable.

### Layer 4: Host-Native Context Pack

Owner:

- generated by CLI and backed by `semantic-core`

Responsibilities:

- Give Copilot and other static-context hosts an easy first-run story.
- Provide bridge files, prompt files, and repo instructions.
- Stay generated, versioned, and provenance-marked.
- Never become a competing source of Salt truth.

## Workstream A: Generate A Host-Native AI Context Pack

### Goal

Turn the good parts of `design-system/ + PLAN.md` into a generated product
surface that is easy to adopt but does not drift from canonical Salt guidance.

### Changes

Add a CLI command:

```sh
salt-ds export-context [rootDir]
```

Aliases or options:

```sh
salt-ds init [rootDir] --ai-context
salt-ds export-context [rootDir] --target copilot
salt-ds export-context [rootDir] --target generic
salt-ds export-context [rootDir] --dry-run
salt-ds export-context [rootDir] --check
```

Generated files:

```text
.github/copilot-instructions.md
.github/instructions/salt-design-system.instructions.md
.github/instructions/salt-setup.instructions.md
.github/instructions/salt-layout.instructions.md
.github/instructions/salt-theming.instructions.md
.github/prompts/salt-create.prompt.md
.github/prompts/salt-review.prompt.md
.github/prompts/salt-migrate.prompt.md
.github/prompts/salt-upgrade.prompt.md
design-system/components/<name>/<name>.context.md
design-system/components/<name>/<name>.json
design-system/components/<name>/<name>.md
design-system/patterns/<name>/<name>.context.md
design-system/patterns/<name>/<name>.json
design-system/patterns/<name>/<name>.md
design-system/foundations/**
salt.config.json
.salt/ai-context-manifest.json
```

The command should support a smaller default set, but that set must be selected
from registry metadata rather than a hardcoded list in the CLI.

Default selection policy:

- include entities marked stable and suitable for production use
- prefer entities with complete source-backed docs, examples, and accessibility
  metadata
- include foundations required by the selected entities
- include patterns only when registry coverage is complete enough to generate
  source-backed guidance
- when `rootDir` is supplied, prioritize entities already used in the repo and
  entities required by declared `.salt` policy
- write the final selected entity ids and selection reasons to
  `.salt/ai-context-manifest.json`

A small named fixture set may exist in tests, but production export logic should
derive its default selection from the registry and project context.

Add options for broader export:

```sh
salt-ds export-context . --all
salt-ds export-context . --component <registry-entity>
salt-ds export-context . --pattern <registry-pattern>
```

### Generated File Rules

Every generated file must include:

- generated-by marker
- Salt package version or registry snapshot version
- source registry hash
- source evidence manifest path or embedded evidence refs
- generation date
- warning that canonical truth lives in Salt tooling
- command to refresh the file

Example header:

```md
<!-- Generated by salt-ds export-context. Do not edit directly unless you accept local divergence. -->
<!-- Registry: salt_registry_v1, hash: <hash>, generated: 2026-04-30 -->
```

### Semantic-Core Work

Add context-pack builders to `semantic-core`:

- evidence graph builder
- component fact serializer
- component guidance serializer
- bridge-file serializer
- pattern serializer
- foundation serializer
- prompt serializer
- Copilot instruction serializer
- manifest serializer

Do not make CLI assemble these from ad hoc strings.

Serializer rules:

- read Salt facts only from normalized registry records and evidence refs
- keep prompt and instruction templates fact-free except for placeholders filled
  by registry-backed values
- fail generation for an entity when required evidence is missing
- record unsupported or partial evidence explicitly instead of substituting
  generic React, CSS, HTML, or model-memory guidance
- preserve source provenance when compressing long docs into bridge files

### CLI Work

Add:

- `packages/cli/src/commands/exportContext.ts`
- command wiring in `packages/cli/src/cli.ts`
- tests in `packages/cli/src/__tests__/cli.spec.ts`
- golden fixtures for generated output

### MCP Work

Expose equivalent read-only resources:

```text
salt://context/manifest
salt://context/components/{name}.context.md
salt://context/components/{name}.json
salt://context/components/{name}.md
salt://context/patterns/{name}.context.md
salt://context/prompts/{name}
```

These resources should be secondary to workflow tools. They support host setup,
not workflow branching.

### Skill Work

Update `salt-ds` skill:

- mention context-pack generation in `init`
- use generated context only as degraded support
- never let static context override MCP or CLI workflow output

### Acceptance Criteria

- `salt-ds export-context . --check` can detect stale generated files.
- Generated component facts match registry-backed entity data.
- Generated component guidance and bridge files contain evidence refs for every
  Salt-specific rule.
- No generated file introduces props, tokens, imports, statuses, examples, or
  accessibility claims that are absent from the registry evidence graph.
- Generated bridge files stay under a fixed size budget.
- Generated prompt files tell hosts to use Salt MCP or CLI when available.
- The output is useful in a repo without MCP, but clearly marked as degraded.
- Tests prove no generated context claims implementation safety.
- Registry-wide sampling tests cover more than a single handpicked component.

## Workstream B: Make Review ADA-Style Without Copying ADA Wholesale

### Goal

Make `salt-ds review` feel like a disciplined remediation workflow, with phases,
durable reports, validation, and concise output.

### Review Profiles

Add explicit review profiles:

```sh
salt-ds review src --profile salt
salt-ds review src --profile accessibility
salt-ds review src --profile migration
salt-ds review src --profile upgrade
salt-ds review src --profile all
```

Default:

- `auto`, resolved from workflow context and inputs.

Profile definitions should be data-driven rule packs owned by `semantic-core`,
not hardcoded arrays inside the CLI command. Each rule should carry provenance:

- rule id
- source docs or standards reference
- applicable registry entities or categories
- confidence and automation level
- validation strategy
- false-positive guidance when source-backed

### Phases

Use these phases for review:

1. Context resolution
2. Source discovery
3. Salt-specific static review
4. Optional runtime inspection
5. Validation and QA
6. Report output

Accessibility profile phases:

1. Context resolution
2. Source discovery
3. Salt accessibility checkpoints
4. Optional runtime accessibility evidence
5. Validation and false-positive classification
6. Report output

### Transition Gates

Borrow ADA's phase-gate style.

Gate 1: Context to source review

- repo root trusted
- Salt package/context state known
- profile selected
- scope known

Gate 2: Static review to runtime review

- static review completed
- targets known
- URL available, or runtime skipped with reason

Gate 3: Review to implementation recommendation

- findings classified
- fix candidates mapped to confidence
- Salt docs or repo policy provenance attached
- no critical missing evidence hidden

Gate 4: Implementation to complete

- returned post-action review run
- validation state recorded
- report written when requested

### Reports

Add report writing:

```sh
salt-ds review src --report .salt/reports/review-2026-04-30.json
salt-ds review src --report .salt/reports/review-2026-04-30.md
```

Default report directory:

```text
.salt/reports/
```

Report types:

- `review`
- `accessibility`
- `migration-validation`
- `upgrade-validation`
- `runtime-inspection`

Report schema fields:

- contract
- workflow
- profile
- status
- context
- scope
- phases
- gates
- findings
- fixCandidates
- falsePositives
- skipped
- validation
- nextRequiredAction
- provenance
- evidenceRefs
- registryRefs
- ruleRefs
- unsupportedClaims

### Resume And Validate

Add:

```sh
salt-ds review --resume .salt/reports/review-2026-04-30.json
salt-ds review --validate .salt/reports/review-2026-04-30.json
```

`--resume` continues incomplete review follow-through.

`--validate` rechecks whether fixes were applied and whether known issues remain.

### Registry-Based Usage Validator

Add a shared validator in `semantic-core` that can check generated or existing
Salt code against registry evidence.

The validator should support:

- imports and package names
- component existence and status
- prop names and prop values
- token names and token-family policy
- provider/theme usage when evidence exists
- composition constraints when source-backed
- accessibility requirements when source-backed
- deprecated or unstable usage

The validator must be data-driven:

- no hardcoded component or prop rules in CLI/MCP command handlers
- rule definitions live in registry-derived metadata or source-backed rule packs
- every violation should point to a registry/entity/rule/evidence ref
- unsupported checks should be reported as unsupported, not inferred

Use the validator in:

- `salt-ds review`
- context-pack evals
- report validation
- generated starter/code-block checks
- MCP support tools only if the existing workflow tools are insufficient

### Output Shape

Adopt ADA's concise report shape, but make it Salt-native:

- Summary
- Workflow state
- Implementation safety
- Fixed or safe-to-fix
- Flagged for review
- False positives
- Skipped or unavailable evidence
- Recommended next action

### Accessibility Scope

Do not create a separate public `salt-accessibility` skill.

Accessibility becomes a review profile inside Salt:

- Salt component accessibility checks derived from registry and docs evidence
- label/name checks only where source-backed Salt docs, component metadata, or
  standards mappings support them
- keyboard/focus structure checks where source or runtime evidence supports them
- runtime evidence when URL is supplied
- Salt false-positive classification only when backed by Salt docs, known
  component behavior, or a recorded validation rule

### Acceptance Criteria

- Review can run without runtime evidence and still produce a useful report.
- Runtime failures are recorded as skipped, not treated as total failure.
- Report output is stable enough for agents to resume.
- Accessibility profile can classify Salt false positives.
- Accessibility checks are loaded from rule-pack data with provenance, not
  embedded directly in command code.
- Registry-based usage validation catches unsupported props, imports, tokens, and
  deprecated usage without hardcoded command logic.
- Review output includes follow-through state, not just findings.
- No review result grants create/migrate/upgrade implementation permission unless
  the workflow gate grants it.

## Workstream C: Rewrite The Salt Skill As An Operational Playbook

### Goal

Keep the current `salt-ds` skill behavior and hard gates, but make the writing
more executable. The skill should read less like a spec and more like a clear
operator guide.

### Top-Level Skill Structure

Rewrite `packages/skills/salt-ds/SKILL.md` around this shape:

1. Identity and trigger boundary
2. Non-negotiable rules
3. Workflow selection
4. Universal execution loop
5. Workflow phase recipes
6. Transport fallback
7. Output templates
8. Degraded mode
9. Reference loading map

### Non-Negotiable Rules

Keep these near the top:

- no Salt invention
- canonical evidence first
- project context first for repo-aware work
- action kind is binding
- hard implementation gate
- review after implementation
- static generated context is degraded support only

### Workflow Phase Recipes

Add short recipes for each workflow.

Create:

1. Resolve project context.
2. Run create workflow.
3. Check action and evidence.
4. Retrieve missing entities/examples when returned.
5. Rerun with evidence bridge.
6. Implement only if hard gate passes.
7. Run returned review.
8. Summarize state and remaining gaps.

Review:

1. Resolve scope.
2. Choose profile.
3. Run review workflow.
4. Inspect findings and confidence.
5. Use report or validation follow-through when returned.
6. Summarize fixed, flagged, skipped, and next action.

Migrate:

1. Preserve user task flow and landmarks.
2. Resolve source experience or structured visual evidence.
3. Run migration workflow.
4. Retrieve missing Salt entities/examples.
5. Implement only if migration safety gate passes.
6. Validate preserved landmarks and action hierarchy.
7. Run review.

Upgrade:

1. Resolve package/component/version context.
2. Run upgrade workflow.
3. Separate required fixes from cleanup.
4. Implement only if gate passes.
5. Run review/validation.

Init:

1. Inspect repo context.
2. Bootstrap `.salt` policy.
3. Optionally export AI context pack.
4. Run `info` or project context again.
5. Explain installed policy and next workflow.

### Output Templates

Add concise output templates by workflow:

Create output:

- Chosen workflow and mode
- Grounding state
- Implementation safety
- Canonical direction
- Actions performed
- Review result
- Remaining blockers

Review output:

- Chosen profile
- Scope reviewed
- Findings summary
- Safe fixes or applied fixes
- Flagged items
- Skipped evidence
- Next action

Migrate output:

- Source experience summary
- Salt target direction
- Preserved landmarks
- Changed categories
- Implementation safety
- Validation state

Upgrade output:

- Version/package context
- Required changes
- Optional cleanup
- Applied changes
- Validation state

Init output:

- Repo context
- Files created or updated
- Policy detected
- Context pack status
- Next suggested command

### Degraded Mode

Add explicit degraded-mode behavior:

- MCP unavailable, CLI available: use CLI JSON.
- MCP and CLI unavailable, generated context available: answer with degraded
  confidence and do not implement Salt-specific changes.
- Generated context stale: ask user to refresh or run `salt-ds export-context`.
- No canonical evidence: stop with blocker.

### Acceptance Criteria

- A host can follow the skill without reading every reference file first.
- The hard gate remains intact.
- Workflow recipes fit on screen.
- Review output is more consistent.
- Static context is never treated as canonical implementation permission.
- The skill has fewer repeated concepts and clearer phase transitions.

## Workstream D: Strengthen MCP Context And Resource Support

### Goal

Keep MCP workflow-first, but make it a better source for lightweight host context
and report follow-through.

### New MCP Resources

Add:

```text
salt://context/manifest
salt://context/components/{name}.context.md
salt://context/components/{name}.json
salt://context/components/{name}.md
salt://context/patterns/{name}.context.md
salt://context/foundations/{topic}
salt://prompts/{workflow}
salt://reports/schema/review
salt://reports/schema/accessibility
```

### New MCP Tool Or Extensions

Consider adding:

```text
export_salt_context_pack
validate_salt_report
resume_salt_review
```

Do not add these if resources plus existing workflow tools are enough. Keep the
public tool surface small.

### Capability Manifest Updates

Extend the capability manifest with:

- context pack support
- context pack version
- generated file targets
- review report schema versions
- supported review profiles
- degraded-mode policy

### Acceptance Criteria

- MCP resources and CLI export share serializers.
- Manifest exposes context/report capability without prose scraping.
- Existing workflow tools remain the primary public story.
- Hosts can discover whether generated context is supported.

## Workstream E: Improve CLI/MCP Parity And Doctor Checks

### Goal

Make it obvious when the user's installed Salt AI tooling pieces are compatible
and fresh.

### CLI Changes

Extend:

```sh
salt-ds info . --json
salt-ds doctor .
```

Add checks for:

- CLI version
- MCP version when detectable
- skill version when detectable
- generated context pack version
- registry hash
- `.salt` policy version
- report schema version
- stale generated files
- incompatible generated context

### Doctor Output

Doctor should classify issues:

- ok
- warning
- action_required
- unsupported

Recommended next actions:

- refresh context pack
- rerun init
- update CLI
- reconnect MCP
- repair repo root
- inspect report

### Acceptance Criteria

- `doctor` can identify stale generated context.
- `doctor --json` exposes machine-readable remediation steps.
- `info --json` includes enough setup data for hosts to avoid guessing.
- Checks do not require network access by default.

## Workstream F: Add Report And Context Schemas

### Goal

Make static context, reports, and workflow state durable enough for host
automation and tests.

### Schemas

Add schemas under `packages/semantic-core/schemas`:

- `salt-context-pack-manifest.schema.json`
- `salt-context-component.schema.json`
- `salt-generated-artifact.schema.json`
- `salt-evidence-ref.schema.json`
- `salt-review-report.schema.json`
- `salt-accessibility-report.schema.json`
- `salt-review-finding.schema.json`
- `salt-validation-result.schema.json`

### Types

Add TypeScript types in `semantic-core`:

- `SaltContextPackManifest`
- `SaltContextComponent`
- `SaltContextPattern`
- `SaltGeneratedArtifact`
- `SaltEvidenceRef`
- `SaltReviewReport`
- `SaltReviewFinding`
- `SaltReviewPhase`
- `SaltReviewGate`
- `SaltValidationResult`

### Acceptance Criteria

- CLI and MCP use the same schemas.
- Golden fixtures validate against schemas.
- Schemas require evidence references for Salt-specific generated claims.
- Skill docs reference schema concepts but do not duplicate schema details.

## Workstream G: Evals And Regression Gates

### Goal

Prove the changes improve agent behavior instead of just adding surfaces.

### New Eval Groups

Context pack evals:

- generated context is compact and source-backed across a registry sample
- generated prompts reference correct context without hardcoding Salt facts
- stale context pack detected by `--check`
- static context never claims implementation safety
- generated context fails validation when evidence refs are missing
- generated context never emits undocumented props, tokens, package names, or
  import paths

Skill execution evals:

- create exact request reaches implementation
- composite create retrieves follow-through before implementation
- blocked create stops cleanly
- review uses profile and report output
- degraded mode refuses Salt-specific implementation

Review evals:

- accessibility profile catches a source-backed accessible-name or label
  scenario from registry fixtures
- Salt false positive classified as false positive
- runtime unavailable becomes skipped evidence
- resume report continues incomplete review
- validate report detects unresolved issue

CLI/MCP parity evals:

- compact workflow parity remains intact
- context resources match CLI export serializers
- capability manifest advertises context support consistently

### Acceptance Criteria

- Existing workflow replay fixtures still pass.
- New evals cover ADA-inspired phase behavior.
- New evals cover starter-kit static context behavior.
- Release gate blocks if static context diverges from registry facts.

## Workstream H: Distribution And Internal Consolidation

### Goal

Make the Salt path easier to adopt than competing internal forks.

The best technical plan will still lose if users have to assemble it from
separate docs, CLI commands, MCP config, and skill installation steps. The
distribution story should feel like one product.

### Salt AI Toolkit Packaging

Create a single public-facing setup story:

```sh
salt-ds init [rootDir] --ai
salt-ds doctor [rootDir] --ai
```

The exact command names can change, but the product behavior should be:

- install or verify the Salt skill
- print MCP setup instructions for the current host
- verify the CLI version and registry hash
- bootstrap `.salt` policy when requested
- optionally export host-native context
- run health checks
- print the next best workflow command

This is the Shopify lesson: users should experience one coherent toolkit, even
if internally it is CLI plus MCP plus skill plus generated context.

### Internal Consolidation Paths

Give each competing effort a clean landing zone:

- ADA accessibility work becomes Salt review profiles, rule packs, report
  schemas, and validation fixtures.
- `design-system/` starter-kit work becomes generated context serializers,
  prompt templates, and context-pack evals.
- Design-system facts become registry ingestion requirements, not hand-authored
  prompt content.
- Host-specific setup notes become generated instructions or `doctor` guidance.

### Contribution Rule

New Salt AI behavior should land in the lowest durable layer that can own it:

1. source docs, examples, code, or tokens
2. registry ingestion
3. registry-derived rule packs
4. workflow contract or report schema
5. CLI/MCP transport
6. skill routing and output templates
7. generated host context

If a proposed change starts at layer 6 or 7 but contains Salt facts, it should be
pushed down into the registry or rule-pack layer first.

### Adoption Assets

Create concise internal assets:

- one-page "why stop forking" memo
- side-by-side demo script against ADA and starter-kit flows
- before/after examples showing hardcoded prompt guidance becoming registry
  evidence
- migration guide for existing ADA findings into Salt review reports
- migration guide for existing `design-system/` files into generated context
  serializers

### Acceptance Criteria

- A new consumer can reach a healthy Salt AI setup with one documented path.
- Existing ADA and starter-kit contributors can see exactly where their work
  belongs in the Salt architecture.
- The plan has a visible demo that proves evidence, validation, and generated
  context all come from the same source.
- Forked static context and forked accessibility skill behavior are no longer
  the easiest way to make progress.

## Original Release Plan (Historical)

The release plan below is retained for historical context. The live status is
the **Current Implementation Snapshot** and **Final Work Left** sections above.

### Release 0: Rallying Demo And Evidence Contract

Goal:

Create enough proof that the team can align before large implementation work
splits again.

Scope:

- Add the evidence reference model.
- Draft report and generated-artifact schemas.
- Create a tiny registry-sampled context generation prototype.
- Create a tiny registry-backed usage validator prototype.
- Rewrite the `salt-ds` skill outline into the operational playbook shape.
- Create the internal demo script and consolidation memo.

Exit criteria:

- Demo shows evidence refs flowing from registry to context, review, and output.
- Demo shows a missing-evidence stop.
- Demo shows a validator rejecting unsupported generated Salt usage.
- ADA and starter-kit contributors can point to where their work lands.

### Release 1: Skill And Review Discipline

Goal:

Improve agent execution quality without changing the public product surface too
much.

Scope:

- Rewrite `salt-ds` skill as operational playbook.
- Add workflow output templates.
- Add review phases and report schema draft.
- Add `salt-ds review --report`.
- Add `salt-ds review --profile`.
- Add initial accessibility profile.
- Add report fixtures and tests.
- Extend `doctor` with report/schema awareness if feasible.
- Add the first production slice of registry-based usage validation.

Cut line:

- Do not ship context pack generation in Release 1 if it risks delaying the
  review and skill improvements.

Exit criteria:

- Skill reads as an executable workflow.
- Review report can be written and validated in tests.
- Accessibility profile has at least a minimal Salt-aware path.
- Usage validator catches unsupported Salt claims from registry evidence.
- No regression to `salt_workflow_v1` gate behavior.

### Release 2: Generated Context Pack

Goal:

Turn the starter-kit idea into a canonical generated onboarding layer.

Scope:

- Add `salt-ds export-context`.
- Generate Copilot instructions and prompt files.
- Generate selected component, pattern, and foundation context.
- Add context pack manifest.
- Add `export-context --check`.
- Add MCP context resources.
- Extend capability manifest.
- Add stale-context doctor checks.
- Add Salt AI toolkit setup/doctor story.

Cut line:

- Start with a registry-derived production-ready subset rather than all Salt
  surfaces.
- Full `--all` export can follow later.

Exit criteria:

- A consumer repo can generate a useful Copilot context pack.
- Generated files include provenance.
- Staleness can be detected.
- MCP resources match CLI generated content.

### Release 3: Resume, Validate, And Host Polish

Goal:

Make review and migration follow-through durable across agent sessions.

Scope:

- Add `salt-ds review --resume`.
- Add `salt-ds review --validate`.
- Add MCP support for report validation or resume if needed.
- Improve migration validation reports.
- Improve upgrade validation reports.
- Add better host setup docs.
- Add context/report evals to release gates.
- Publish consolidation guides for ADA and starter-kit contributors.

Exit criteria:

- Review work can survive a context reset.
- Validation can compare current code against prior report state.
- Migration and upgrade have durable follow-through artifacts.

## Original Concrete Backlog (Historical)

The backlog below was the original sequencing guide. It is now superseded by the
**Final Work Left** section above.

### Highest Priority

1. Design the evidence reference model used by generated context, validation,
   and reports.
2. Create the rallying demo script and consolidation memo.
3. Prototype registry-sampled context generation.
4. Prototype registry-based usage validation.
5. Rewrite `packages/skills/salt-ds/SKILL.md` around operational recipes.
6. Add workflow-specific output templates to the Salt skill references.
7. Design `SaltReviewReport` and `SaltReviewFinding` types.
8. Add `salt-ds review --profile`.
9. Add `salt-ds review --report`.
10. Add minimal accessibility review profile backed by rule-pack provenance.
11. Add review report tests and fixtures.
12. Add degraded-mode wording to the skill.

### Next Priority

1. Add `export-context` serializers in `semantic-core`.
2. Add `salt-ds export-context`.
3. Generate context manifest and selected bridge files.
4. Add `export-context --check`.
5. Add context pack stale checks to `doctor`.
6. Add MCP context resources.
7. Extend capability manifest.
8. Add release gates that reject undocumented generated Salt claims.
9. Add one-command Salt AI setup/doctor story.

### Later Priority

1. Add review resume and validation.
2. Add richer runtime validation.
3. Add migration report resume.
4. Add upgrade validation reports.
5. Add broader context pack coverage.
6. Add host-specific setup variants beyond Copilot.

## Risks

### Risk: Static Context Becomes A Competing Source Of Truth

Mitigation:

- Generate from `semantic-core`.
- Include provenance and hash.
- Add stale checks.
- Mark generated context as support, not canonical workflow permission.

### Risk: Skill Becomes Too Long Again

Mitigation:

- Keep `SKILL.md` short and operational.
- Move details into workflow references.
- Use phase recipes and templates.
- Avoid duplicating public API docs in the skill.

### Risk: Review Profiles Create Another Product Surface

Mitigation:

- Keep profiles inside `salt-ds review`.
- Do not introduce separate public skills.
- Keep report contracts shared.

### Risk: CLI Surface Expands Too Much

Mitigation:

- Keep workflow commands stable.
- Treat context export and reports as support/adoption surfaces.
- Keep compact workflow JSON unchanged.

### Risk: ADA Process Is Copied Too Literally

Mitigation:

- Use the phase/gate/report pattern.
- Do not copy ADA's narrow checkpoint model into all Salt workflows.
- Keep Salt workflows grounded in `salt_workflow_v1`.

## Non-Goals

- Replace MCP with static docs.
- Split Salt into separate public skills.
- Build a generic AI design tool.
- Make the CLI mutate application code directly.
- Guarantee full WCAG compliance.
- Turn generated context into hand-authored docs.
- Require runtime/browser evidence for all review work.

## Success Metrics

Adoption:

- Time from install to first useful Salt answer goes down.
- Consumers can generate a host-native context pack in one command.
- Fewer setup questions are needed in Copilot-like hosts.
- Internal contributors stop adding separate Salt AI skills or static prompt
  trees and instead contribute through registry/rule-pack/report/context layers.

Correctness:

- Fewer hallucinated props, imports, and token names.
- Fewer partial create results treated as done.
- More workflows stop correctly on missing evidence.
- Registry-based validation catches unsupported Salt usage before final output.

Review quality:

- Review output consistently classifies fixed, flagged, false positive, and
  skipped items.
- Review reports can be resumed or validated.
- Accessibility profile catches deterministic Salt accessibility issues.

Maintenance:

- Context pack drift is detectable.
- CLI and MCP context outputs share serializers.
- Existing workflow replay tests keep passing.
- New Salt AI facts have an obvious canonical home below the skill layer.

## Original Recommended First Implementation Slice (Historical)

This was the initial suggested starting point. It is kept to preserve planning
context and is no longer the live next-action list.

Start with the part that improves current behavior fastest:

1. Define the evidence reference model.
2. Build the rallying demo that proves registry evidence flows into generated
   context, review reports, and validation.
3. Rewrite the `salt-ds` skill into an ADA-style operational playbook while
   preserving the hard gate.
4. Add review output templates and a report schema.
5. Add `salt-ds review --report` for JSON reports.
6. Add a minimal accessibility profile inside review.
7. Add the first registry-based usage validator.

Then add generated context export once the review and skill flow are cleaner.

This sequence gives Salt the best competitor learnings in the right order:

- ADA first for execution discipline.
- Starter kit second for adoption.
- Existing Salt contract throughout for trust.
