# Extension Productionization Checklist

This file turns the current extension direction into a concrete implementation checklist.

Use it when moving from:

- alpha layered policy
- package-backed conventions packs
- early business-pattern ideas

to a production-ready extension model.

This is a maintainer document. It is not a second consumer setup guide.

## Goal

Productionize extensions as versioned policy and content packs, not as arbitrary runtime plugins.

The intended shape is:

- core Salt
  - canonical and shipped by Salt
- shared extension packs
  - organization or line-of-business policy and content
- repo-local policy
  - `.salt/team.json`
  - optional `.salt/stack.json`

## Non-Goals

- do not turn extensions into executable plugin hooks
- do not make Markdown the runtime contract
- do not let extension packs redefine canonical Salt facts
- do not make extension packs part of the default onboarding path

## Core Rule

The runtime contract should stay as structured data.

Use:

- JSON schemas for runtime truth
- Markdown for explanation, rationale, and examples
- package exports only as a distribution wrapper around the same structured data

## Production Model

### Layer 1: Core Salt

Core Salt owns:

- canonical components
- patterns
- theme presets
- tokens
- assets
- packages
- changes and deprecations

Core Salt must stay authoritative and non-overridable inside the MCP core.

### Layer 2: Shared Extension Packs

Shared packs should carry:

- approved wrappers
- business patterns
- internal examples
- banned patterns or choices
- migration rules
- optional private docs references

Shared packs should refine canonical Salt, not replace it.

### Layer 3: Repo-Local Policy

Repo-local policy should remain:

- `.salt/team.json` for the default path
- `.salt/stack.json` only when layering is genuinely needed

## Phase 1: Freeze The Extension Contract

### Checklist

- define one runtime contract for shared extension packs
- keep it compatible with `project_conventions_v1` and `project_conventions_stack_v1`
- require:
  - `contract`
  - `id`
  - `version`
  - `supported_salt_range`
  - structured policy payload
- allow optional:
  - docs references
  - examples references
  - business-pattern references
- document which fields are:
  - canonical Salt references
  - extension-local policy
  - provenance-only metadata

### Done when

- one shared pack can be validated without custom code
- teams are not asked to invent their own pack shape

## Phase 2: Package And Distribution Model

### Checklist

- standardize shared packs as package exports, for example `@acme/salt-conventions`
- keep package exports declarative
- forbid arbitrary runtime hooks in the standard path
- define the minimum package layout:
  - manifest
  - one or more exported policy objects
  - optional docs/examples assets
  - version metadata
- document private package registry support
- define the supported install story for:
  - repo-local trial packs
  - internal private registries
  - monorepos

### Done when

- a line-of-business team can publish one pack and consume it from `.salt/stack.json`
- Salt does not need special runtime code per pack

## Phase 3: Compatibility And Validation

### Checklist

- validate `supported_salt_range` against the current Salt version
- fail cleanly on:
  - unsupported Salt version
  - missing export
  - unreadable package
  - invalid contract version
- add first-class diagnostics for:
  - pack id
  - pack version
  - export name
  - resolved path
  - compatibility status
- expose the same compatibility data in:
  - `salt-ds info --json`
  - `salt-ds doctor`
  - MCP project context

### Done when

- maintainers can tell exactly why a pack did or did not apply

## Phase 4: Provenance And Conflict Reporting

### Checklist

- every workflow output that uses extensions must show:
  - canonical Salt answer
  - extension change
  - final answer
- add explicit conflict reporting for:
  - banned choice vs canonical choice
  - wrapper override vs canonical primitive
  - business pattern vs canonical pattern
- keep extension provenance machine-readable
- preserve the winning layer and merge reason

### Done when

- a user or agent can explain why the final answer changed without reading the pack source manually

## Phase 5: Governance And Release Discipline

### Checklist

- define extension-pack ownership
- require changelog or release notes per pack version
- require semantic versioning rules for pack changes
- define deprecation policy for:
  - removed exports
  - renamed packs
  - retired business patterns
- define rollout stages:
  - local trial
  - canary repos
  - wider organization rollout
- define what needs approval:
  - new banned rules
  - wrapper defaults
  - business-pattern additions

### Done when

- extension packs can evolve without ad hoc repo-by-repo debugging

## Phase 6: Evaluation Coverage

### Checklist

- add fixtures where extensions materially change:
  - `create`
  - `review`
  - `migrate`
  - `upgrade`
- add eval cases for:
  - pack resolves and applies correctly
  - pack is present but no rule matches
  - pack conflicts with canonical guidance
  - unsupported Salt version range
  - missing or unreadable pack
- keep one or more business-pattern examples out of core Salt fixtures so the extension boundary stays explicit

### Done when

- extension quality drift is caught by checked-in fixtures rather than user reports

## Phase 7: User-Facing Productization

### Checklist

- keep the main product story on:
  - `salt-ds`
  - `.salt/team.json`
- keep shared packs positioned as advanced layering
- ensure `salt-ds init --conventions-pack` scaffolds the advanced path cleanly
- ensure `salt-ds info` and `salt-ds doctor` are enough to debug pack resolution
- write one short consumer doc for:
  - when a team should stay on `.salt/team.json`
  - when a team should adopt `.salt/stack.json`
  - what a shared pack is
  - how to see which pack won

### Done when

- teams can use shared packs without feeling like they adopted a second Salt product

## Recommended Execution Order

1. freeze the runtime contract
2. standardize package-backed distribution
3. add compatibility and validation
4. add provenance and conflict reporting
5. add evaluation coverage
6. add governance and rollout rules
7. tighten the consumer-facing docs

## Repo Touch Points

- `packages/semantic-core/src/policy`
  - schemas
  - runtime validation
  - stack resolution
- `packages/cli`
  - `init`
  - `info`
  - `doctor`
  - workflow output provenance
- `packages/mcp`
  - project context
  - workflow output shaping
- `packages/skills`
  - skill guidance around when extensions are checked
- `workflow-examples/project-conventions`
  - shared pack fixtures
  - compatibility examples
- `site/docs/getting-started/ai.mdx`
  - advanced extension guidance

## Release Bar

Do not call extension packs production-ready until all of these are true:

- pack contract is schema-validated
- compatibility is explicit
- provenance is visible in workflow outputs
- `info` and `doctor` can debug the pack path
- extension behavior is covered by checked-in eval fixtures
- rollout and ownership rules are written down
