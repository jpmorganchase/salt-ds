# Getting Good Results

This guide is for consumer repos that already have Salt configured and want better day-to-day results.

Use it together with [`consumer-repo-setup.md`](./consumer-repo-setup.md). For recovery steps when a workflow goes wrong, see [`troubleshooting.md`](./troubleshooting.md).

## Start With The Workflow, Not The Command

Use the workflow layer first:

- bootstrap repo conventions
  - `salt-ds`
- build new UI
  - `salt-ds`
- review existing UI
  - `salt-ds`
- migrate non-Salt UI into Salt
  - `salt-ds`, with the migration goal stated explicitly
- upgrade Salt versions
  - `salt-ds`
- verify or re-check the result
  - canonical validation first, runtime evidence only when needed

Do not make consumers memorize raw commands as the default path.

## Keep The Boundary Stable

Use the stack in this order:

1. canonical Salt guidance
2. detected context
3. repo-local project policy
4. runtime evidence only if uncertainty remains

That means:

- `salt-ds` shapes the workflow
- Salt MCP is the preferred canonical transport
- the Salt CLI is the fallback transport when MCP is blocked
- `salt-ds info --json` is the detected-context contract when CLI transport is used
- `.salt/team.json` is declared project policy, not full repo context
- runtime inspection is evidence, not policy

## Scope The Request Before You Ask

Smaller, more explicit requests produce better results:

- pass one file, one region, or one screen at a time
- name the main states, actions, and constraints
- include the Salt version boundary when upgrade work is involved
- separate required migration work from optional cleanup

Good prompt shape:

```text
Use salt-ds to review this toolbar only.
Focus on primitive choice, token usage, and layout complexity.
```

```text
Use salt-ds to migrate this external UI toolbar into Salt.
Preserve action order, empty state, and keyboard behavior.
```

For migration work, aim for:

- Salt-native results
- familiar task flow
- preserved action hierarchy, states, and landmarks where they matter

Do not ask Salt to clone the previous visual system exactly.

```text
Use salt-ds to upgrade this code path from Salt 1.x to 2.x.
Separate required changes from optional cleanup.
```

## Treat New UI Work As Salt UI Work

For requests like these:

- "build a dashboard with metrics"
- "fix the navigation centering"
- "add a form, table, dialog, or toolbar"
- "clean up this layout"

Assume the job is a Salt UI workflow by default.

Do not stop at generic React or CSS output if a canonical Salt option exists.

## Use The Same Workflow In No-MCP Environments

If MCP is unavailable:

- keep the same `salt-ds` workflow prompts
- let the environment fall back to the Salt CLI
- start the CLI path from `salt-ds info --json`
- use `salt-ds init` when the repo still needs bootstrap Salt policy and repo instructions
- use `salt-ds init --conventions-pack [<package[#export]>]` only for repos that need starter stack scaffolding for a shared conventions pack
- use `salt-ds create`, `salt-ds review`, `salt-ds migrate`, and `salt-ds upgrade` as the public workflow commands

Use `salt-ds review --url <url>` when source validation and runtime evidence should stay in the same workflow pass. Keep `salt-ds doctor` and `salt-ds runtime inspect` for runtime evidence and support work.
Use `salt-ds review --url <url> --migration-report <path>` when the migrated result should be checked against a saved migration contract.
Use `salt-ds migrate [query] --source-outline <path>` when the migration starts from a mockup, screenshot notes, or a rough design outline that should be converted into structured regions, actions, states, and notes before translation.
Use `salt-ds migrate --url <url>` when migration scoping needs current landmarks, action hierarchy, or state visibility from the running experience.
Use both `--source-outline` and `--url` together when the migration should reconcile a mockup-style plan with the current live UI before implementation starts.
Use workflow `confidence` and `raiseConfidence` output to decide whether to edit immediately, ask follow-up questions, or add runtime evidence first.

Do not teach a second command vocabulary for restricted environments. Keep the same workflow prompts and the same workflow CLI commands.

## Keep The MCP Tooling Invisible

When Salt MCP is the transport, keep the user-facing workflow names stable and let the `salt-ds` skill handle the MCP details underneath.

Users should not need to learn underlying MCP tool names unless they are debugging the toolchain itself.

The primary MCP workflow tools should now return the same style of confidence and remediation guidance as the public CLI workflow outputs. Runtime evidence still stays local.

## Apply Project Conventions Only When They Matter

Do not inject repo-local wrappers or shells into the canonical Salt step by default.

Check `.salt/team.json` only when:

- the guidance boundary recommends a project conventions check
- the repo clearly has wrappers, shells, or banned choices that change the final project answer

If project conventions change the final answer, keep the canonical Salt answer visible as provenance.

## Validate After The First Pass

The first recommendation is not the stopping point:

- after build work, validate the implementation
- after review work, confirm the highest-risk findings in code
- after upgrade work, re-run validation on the migrated result
- call out leftover CSS overrides or shims as explicit cleanup decisions

For migration specifically:

- use the returned familiarity contract to decide what must remain familiar
- use `migrationScope.questions` to clarify what still needs an explicit answer before implementation
- use delta categories to see where Salt should directly swap, recompose, or stop for confirmation
- use migration checkpoints to capture the current experience before migration and validate the Salt result afterward
- use `postMigrationVerification` as the default review loop after the first migration pass

Treat the migration scope in this order:

1. answer the returned migration-scope questions
2. decide what must remain familiar
3. decide what can become more Salt-native
4. only then start the first Salt scaffold

When review output includes structured `fixCandidates`, treat them as agent-applied remediation guidance:

- let the agent choose the safest candidates
- apply those changes in the repo workflow
- rerun `salt-ds review` after edits

Do not expect the CLI to mutate files directly as the default fix path.

When the workflow output feels unclear, start with:

1. `salt-ds info --json`
2. `salt-ds doctor` only if runtime targets or policy layering still look unclear, or if a stack-backed layer may be missing or unreadable
3. `salt-ds review`
4. `salt-ds review --url <url>` only if the source pass leaves open questions

## Escalate Runtime Evidence Only When Needed

Do not start with runtime inspection.

Use runtime evidence only when source reasoning and validation are still not enough:

- cheap URL fetch or fetched HTML
  - title, status, coarse structure, obvious landmarks
- `salt-ds doctor`
  - when the reachable runtime target is unclear
- `salt-ds review <path> --url <url>`
  - when source validation and runtime evidence should stay in the same workflow pass
- `salt-ds runtime inspect <url>`
  - when the task is explicitly evidence-only debugging or support work and the URL is already known

Keep the evidence levels clear:

- `browser-session`
  - stronger evidence for runtime errors, screenshots, hydrated output, and rendered structure
- `fetched-html`
  - narrower evidence for title, status, landmarks, and coarse structure

Treat layout-debug details as advanced evidence, not as part of the default workflow contract.

## Keep Outputs Compact Until You Need More

Prefer the default compact outputs first.

Use `view: "full"` only when:

- you need recommendation or routing provenance
- you need to understand why a candidate won
- you are debugging unexpected behavior in the toolchain
