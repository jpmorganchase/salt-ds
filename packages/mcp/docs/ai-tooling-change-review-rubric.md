# AI Tooling Change Review Rubric

Status: active maintainer gate
Date: April 21, 2026
Owner: AI tooling maintainers

## Purpose

Use this rubric before approving future AI tooling work.

It is the check against drift.

Every meaningful AI tooling change should be reviewable through this file, whether it touches:

- docs
- registry build
- semantic core
- MCP
- CLI
- skills
- evaluation

Use [`./ai-tooling-winning-foundation.md`](./ai-tooling-winning-foundation.md) for the target state this rubric protects.

## How To Use This Rubric

For a proposed change, answer:

1. what layer should own this behavior
2. whether the change makes Salt more registry-first and workflow-thin, or less
3. whether the change improves a general class of behavior or only patches one prompt
4. what benchmark evidence proves the change is worth taking

If a proposal cannot answer those clearly, it is not ready.

## Review Questions

### 1. Does This Change Belong In The Earliest Possible Layer?

Use this preferred order:

1. canonical docs and examples
2. registry extraction or retrieval artifact
3. semantic-core workflow logic
4. transport glue
5. skill or host guidance

Reject or narrow changes that solve a docs or registry problem by adding late runtime heuristics first.

### 2. Does This Keep `Create` Thin Or Make It Smarter Again?

Good changes make `create` better at:

- owner resolution
- blocker reporting
- next-action routing

Risky changes make `create` take on more responsibility for:

- broad search
- deep decomposition
- starter-code synthesis
- rich planning under weak confidence

If a change makes `create` broader, it must be challenged.

### 3. Does This Preserve Compact As The Authoritative Contract?

Every change should preserve:

- compact routing facts
- full-mode consistency
- stable request and owner data

Reject changes that:

- rely on full mode for basic branching
- drop `request` or `resolved_entity`
- change the primary owner only in rich mode

### 4. Does This Improve A General Failure Class?

Good changes fix classes of failure like:

- host-rewritten exact prompts
- mixed-surface ownership
- pattern versus component ambiguity
- weak-confidence failure behavior

Bad changes fix only:

- one named prompt
- one host-specific wording quirk
- one consumer without improving the shared model

### 5. Does This Preserve The Stable Public Product Shape?

Be skeptical of:

- new top-level workflow tools
- renamed workflows
- broader public surface area
- separate consumer stories for similar jobs

Changes should usually preserve:

- one skill
- one CLI
- one MCP package
- one workflow-first story

### 6. Does This Help Strong Hosts Without Penalizing Weak Hosts?

Good changes:

- add richer support context optionally
- keep compact output high-signal
- let strong hosts do more after grounding is stable

Bad changes:

- assume every host can reason over large metadata dumps
- push more inference burden into the host by default
- make weaker hosts less reliable just to help advanced ones

### 7. Is There Benchmark Evidence?

Every non-trivial change should name:

- the failing scenarios
- the expected improvement
- the tests or host validations that prove it

Prefer evidence from:

- checked-in evals
- replay fixtures
- CLI and MCP parity tests
- real-host validation notes

## Decision Outcomes

### Approve

Approve when the change:

- belongs in the chosen layer
- reinforces the winning architecture
- improves a general failure class
- preserves public contract stability
- includes benchmark evidence

### Narrow

Narrow when the change is directionally right but too broad.

Examples:

- a retrieval change is good, but the proposal also adds a new public tool
- a host-guidance change is good, but it also tries to redefine canonical semantics
- a full-mode fix is good, but it also expands starter synthesis

### Reject

Reject when the change:

- makes `create` more magical
- adds raw prompt-specific patches as the main solution
- expands the public surface without strong evidence
- solves a weak-host problem by pushing more reasoning burden into the host
- changes product shape because one prompt failed

## Required Evidence By Change Type

### Docs Or Packaging Changes

Require:

- docs consistency check
- setup-path sanity check
- confirmation that CLI, MCP, and skill tell the same story

### Registry Or Retrieval Changes

Require:

- candidate or ranking regressions
- proof the change improves a class of prompts
- proof it does not pollute canonical identity data

### Workflow Contract Changes

Require:

- compact and full parity coverage
- fixture updates
- explicit transport parity check

### Host Or Skill Changes

Require:

- evidence that the canonical answer did not change
- proof the change improves orchestration quality or efficiency

## Red Flags

Stop and challenge the proposal if any of these are true:

- "the agent will probably figure it out"
- "we can just add one more alias"
- "this only affects full mode"
- "this is easier than fixing retrieval"
- "other tools are doing more magic"
- "we can expose more tools and let the model choose"

These are the statements that usually reintroduce brittleness.

## Preferred Change Template

Future design notes or PRs should be able to answer these lines directly:

- problem class:
- expected owner behavior:
- layer chosen:
- why earlier layers were insufficient:
- compact contract impact:
- full contract impact:
- retrieval or registry impact:
- host or skill impact:
- eval coverage:
- real-host validation plan:

## Release Gate Questions

Before shipping meaningful AI tooling changes, ask:

- does this make Salt more registry-first for context
- does this keep Salt workflow-first for safety
- does this keep `create` thinner rather than broader
- does this preserve the compact contract as authoritative
- does this make strong hosts better without making weak hosts unsafe

If the answer is not clearly yes, the change should not ship yet.
