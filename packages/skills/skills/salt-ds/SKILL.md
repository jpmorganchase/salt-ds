---
name: salt-ds
description: the primary Salt Design System workflow skill for consumer repos. use when building new Salt UI, reviewing existing Salt UI, migrating non-Salt UI into Salt, upgrading Salt usage, or bootstrapping repo-local Salt conventions.
---

# Salt DS

Use this as the primary Salt workflow skill for external consumer repos.

Do not make the user choose between builder, reviewer, migration, and project-conventions skills as separate public products. Treat those as internal authoring assets behind this one skill.

## When To Use

- building new Salt UI in a new or existing repo
- reviewing existing Salt UI
- migrating non-Salt UI into Salt
- upgrading Salt versions or deprecated usage
- bootstrapping or simplifying repo-local Salt conventions

## Default Rule

For repo-aware work, start from project context by default.

- MCP:
  - `get_salt_project_context`
- CLI:
  - `salt-ds info --json`

Skip this only for clearly Salt-agnostic exploration where repo shape does not affect the answer.

If the repo needs Salt policy before deeper workflow work, bootstrap it with:

- `salt-ds init`
- `salt-ds init --conventions-pack [<package[#export]>]`
  - only when a selected repo needs starter layered policy for a shared conventions pack

## Critical Rules

- resolve canonical Salt guidance before applying repo conventions
- treat `.salt/team.json` and `.salt/stack.json` as declared policy, not detected repo context
- keep source reasoning first and add runtime evidence only when the source pass is still insufficient
- preserve migration familiarity through task flow, interaction anchors, and critical states, not by cloning a foreign visual system
- read workflow `fixCandidates`, `confidence`, and `raiseConfidence` before editing or escalating
- do not present repo-local wrappers, migration shims, or shared conventions packs as canonical Salt guidance
- keep `salt-ds doctor` and `salt-ds runtime inspect` in the support/evidence layer unless the task is explicitly diagnostic

## Workflow Loops

### Create

- for detailed create behavior, load `../../references/create-rules.md`

- get project context first
- ground the answer in canonical Salt guidance
- check repo conventions only when the repo policy or workflow output says they matter
- ask a follow-up when multiple Salt approaches fit or confidence stays low

### Review

- for detailed review behavior, load `../../references/review-rules.md`

- get project context first
- run a source-first review
- inspect findings, `fixCandidates`, `confidence`, and `raiseConfidence`
- apply only edits that still fit the repo context and user goal
- rerun `review`
- add `review --url` only when runtime evidence is still needed after the source pass

### Migrate

- for detailed migration behavior, load `../../references/migration-rules.md`

- get project context first
- use the migration familiarity contract, scope, delta categories, and post-migration verification output before editing
- use `migrate --url` when the current experience needs runtime scoping for landmarks, action hierarchy, structure, or state visibility
- preserve the important experience anchors while allowing Salt-native visual and compositional changes
- verify the implemented result after migration edits

### Upgrade

- get project context first
- compare the Salt versions or deprecation path
- review the changed code paths
- rerun `review` when edits land

## Ask Instead Of Guess

- the task could reasonably fit more than one workflow
- migration familiarity constraints are unclear
- repo policy conflicts with canonical Salt guidance or the repo has no declared policy yet
- confidence is low and `raiseConfidence` points to missing evidence
- the runtime target itself is unclear and `salt-ds doctor` is the cheaper next step

## Transport

- prefer Salt MCP for canonical guidance
- use Salt CLI only when MCP is blocked
- keep the same public workflow vocabulary:
  - `init`
  - `create`
  - `review`
  - `migrate`
  - `upgrade`
- use `review --url` only when runtime evidence must stay in the same pass
- use `migrate --url` only when migration scoping needs current runtime evidence
- consult the shared transport and evidence contract in `../../references/canonical-salt-tool-surfaces.md`
- load the create, review, or migration rule reference only when that workflow is active
- in final answers, talk about the user job and the Salt workflow, not about internal skill-module names or raw MCP tool names

## Output

Return a workflow-first response that makes clear:

- what job Salt is handling
- what canonical Salt guidance was used
- whether repo conventions changed the outcome
- whether runtime evidence was needed
