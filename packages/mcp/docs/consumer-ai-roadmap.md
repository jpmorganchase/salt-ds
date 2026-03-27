# Consumer AI Roadmap

This file is the short strategic roadmap for the Salt consumer AI product.

It is not the execution checklist.

Use:

- [`ai-v1-implementation-backlog.md`](./ai-v1-implementation-backlog.md)
  - the sole active execution backlog and status tracker
- [`ai-product-roadmap.md`](./ai-product-roadmap.md)
  - the ordered roadmap for alpha, beta, and post-V1 work
- [`maintaining-salt-ai-tooling.md`](./maintaining-salt-ai-tooling.md)
  - the architectural and source-of-truth rules for maintainers

## Current Product Position

The product shape is now:

- one public skill: `salt-ds`
- one public CLI: `salt-ds`
- one MCP package: `@salt-ds/mcp`
- one default policy file: `.salt/team.json`
- one detected-context contract: `salt-ds info --json`

The intended user model is:

- `salt-ds + MCP` when MCP is available
- `salt-ds + CLI` when MCP is blocked
- one workflow vocabulary across both paths:
  - `init`
  - `create`
  - `review`
  - `migrate`
  - `upgrade`
  - `review --url` when runtime evidence must stay in the same pass

The product is now explicitly agent-first:

- consumers learn workflows, not MCP tool names
- support commands stay in the background
- runtime inspection is evidence, not the product
- create, review, and migration guidance now has stable rule IDs and more reusable output structure

For IDE-first teams, the practical workflow order should be:

1. `review`
2. `upgrade`
3. `migrate`
4. `create`

## Active Priorities

### 1. Alpha Signal First

Use the current branch snapshot to get an early read on whether the workflow product is worth pursuing further.

The alpha should cover a small number of real tasks across:

- teams already using Salt
- teams with existing non-Salt repos
- teams starting new projects

The main question is not broader rollout readiness yet. It is whether:

- teams naturally ask Salt to do the job
- guidance layering is useful
- migration-first visual grounding is useful
- the workflow product is strong enough to justify beta hardening

### 2. Beta Hardening Only After Positive Alpha Signal

Branch-backed or snapshot install paths are acceptable for alpha.

Only after alpha is promising should the product move into the harder beta tasks:

- one stable `salt-ds` skill install source
- a documented wider-release distribution path
- stronger evaluation coverage
- stricter protocol and workflow-contract hardening

### 3. Hold The Product Shape Through Alpha And Beta

The product-shape cleanup is now in place:

- the AI landing page is the dominant first-time path
- MCP is context-first and workflow-first
- project context is the default first step for repo-aware work
- the public `salt-ds` skill reads as one capability contract
- shared conventions packs are out of the default learning path
- the visible MCP beta surface stays on the six public workflow tools

The next job is to keep that shape stable through alpha and beta instead of expanding it again too early.

### 4. Keep The Product Surface Small

The public workflow model should stay tight.

That means:

- keep `create`, `review`, `migrate`, and `upgrade` as the main jobs
- keep `review --url` as the public runtime-evidence extension
- keep `doctor` and `runtime inspect` as support-only commands
- keep source validation on `salt-ds review`; do not bring back a separate public `lint` command without strong evidence

For IDE-first usage, keep the strongest paths centered on:

- active file or selection review
- scoped feature upgrade
- screenshot- or screen-driven migration
- bounded region creation

### 5. Learn From Alpha And Beta Before Growing The Surface

The next additions should come from real workflow friction, not from architectural neatness.

Priority signals to watch:

- setup confusion
- MCP-blocked parity issues
- repo-policy confusion around `.salt/team.json`
- whether teams ask Salt to do jobs or ask which tool to use

### 6. Allow A Narrow Shared-Conventions-Pack Alpha Preview

Some teams may reasonably want to test private guidance and organization-specific extensions during alpha.

That is fine, but it should stay tightly scoped:

- private docs and implementation guidance
- organization-specific wrappers and aliases
- banned patterns and conventions
- internal examples
- internal migration rules

Current preview path:

- package-backed layers in `.salt/stack.json`
- surfaced by `salt-ds info --json` as shared conventions metadata
- still layered on top of the default `.salt/team.json` policy model

This should remain a preview track, not part of the default product story.

### 7. Improve Migration Fidelity

Migration should help teams land on recognizably Salt results without losing the parts of the existing experience that users rely on.

The current direction should keep focusing on:

- preserving task flow, action hierarchy, important states, and key interaction anchors
- allowing intentional Salt-native visual and compositional changes
- using runtime inspection as supporting evidence when it helps scope the current experience
- keeping the logic generic and heuristic-driven rather than introducing named-library rules into core Salt tooling

### 8. Keep Workflow Confidence Consistent Across Transports

This is now in place.

The MCP-first and CLI-first paths both return workflow confidence, escalation guidance, and migration verification signals.

The next job is to hold that parity as the product evolves instead of letting one transport drift ahead of the other.

### 9. Keep Shared Conventions Pack Bootstrap Narrow

Selected teams can now scaffold starter layered policy through `salt-ds init --conventions-pack`.

The next job is discipline, not expansion:

- keep it optional
- keep it preview-only
- keep it declarative
- keep it clearly layered on top of the default `.salt/team.json` model

### 10. Keep Post-Migration Verification Strong

Migration now returns a post-migration verification contract and `review --url` can validate it against the implemented result.

The next job is to keep that loop strong in real usage:

- task flow
- action hierarchy
- key landmarks
- critical states

Runtime evidence should keep supporting preserved intent, not visual cloning.

### 11. Keep Doctor Support Output Useful

Doctor now includes policy-layer summaries and stronger layered-policy diagnostics.

The next job is to validate whether that support depth is enough in alpha and beta rather than broadening the everyday product surface too early.

## Success Signals

The product is on track when:

- teams describe Salt in workflow terms, not plumbing terms
- MCP and non-MCP flows feel like the same product
- alpha produces enough signal to justify beta hardening
- users can complete `review`, `migrate`, and `upgrade` without learning internal architecture
- the agent handles most sequencing without the docs reading like an operations manual
- teams using shared conventions packs can test private guidance without pushing the core product into a second setup model

## Next Horizon

These are the strongest likely follow-ons after alpha and beta if real usage supports them:

- stable `salt-ds` skill install and wider-release distribution
- keep the sharper `salt-ds` skill contract and stable rule IDs aligned across:
  - the public skill
  - the create/review/migrate rule refs
  - CLI workflow outputs
  - MCP workflow outputs
- optional `llms.txt`
- Storybook as an additional evidence source, not a primary product
- codemod-backed fixes for high-confidence review, migration, and upgrade cases
- migration fidelity improvements with familiarity contracts, delta categories, and inspection-assisted scoping
- migration packs for common external UI baselines
- broader enterprise extension-pack support once the preview has real usage behind it

## Non-Goals For Now

Do not expand the public product shape just because the backend can support it.

That means:

- no second public CLI vocabulary
- no exposing MCP tool names in consumer docs
- no making runtime inspection a first-class user workflow
- no treating project conventions as the main repo-context source
- no broad plugin platform or marketplace-style extension model in V1
