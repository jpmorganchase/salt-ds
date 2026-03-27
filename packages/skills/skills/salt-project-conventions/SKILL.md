---
name: salt-project-conventions
description: create, update, review, or simplify salt project conventions for an application repo. use when a team needs to define approved wrappers, preferred components, pattern preferences, banned choices, repo notes, or a bootstrap `.salt/team.json` plus repo instruction snippet that refine canonical salt guidance without changing the core salt mcp.
---

# Salt Project Conventions

Assume the user is working in an application repo that consumes Salt. Use this skill to create or maintain downstream project conventions without turning them into canonical Salt rules. Keep the detailed contract, examples, and review criteria in the referenced files.

## When To Use

- creating a new `.salt/team.json` file for a consumer repo
- reviewing, simplifying, or cleaning up an existing project conventions setup
- documenting approved wrappers, preferred components, pattern preferences, banned choices, or migration shims
- deciding whether a repo really needs `.salt/stack.json` or only a simple team layer
- do not use this to redefine canonical Salt rules inside the core MCP

## Required Workflow

Follow these steps in order.

1. Determine whether the task is to create, update, review, or simplify project conventions, and whether the user is editing:
   - a shared line-of-business layer
   - a team or repo layer
2. Look for `.salt/team.json` first. Treat that as the default conventions file for a simple repo. Only look for `.salt/stack.json` when the repo clearly has layered conventions or shared upstream sources. If neither exists, search for likely legacy names such as `project-conventions.json`, `salt-project-conventions.json`, `lob-salt-conventions.json`, or files that already use `project_conventions_v1`.
3. Load `references/contract.md` for the required shape, merge order, and boundary rules.
4. Load `references/examples.md` when creating a new conventions file or adding a new rule type.
5. Load `references/review-checklist.md` when reviewing, simplifying, or cleaning up an existing conventions setup.
6. Use `assets/project-conventions.template.json` as the default starter shape when the repo has no conventions setup yet. When bootstrapping a new simple repo, also use `assets/repo-instructions.template.md` as the companion repo instruction snippet.
   - Look for an existing repo-local instruction file first, such as `AGENTS.md`, `CLAUDE.md`, or another established equivalent.
   - If one already exists, update that file instead of creating a second competing instruction file.
   - If no repo-local instruction file exists, create or update `AGENTS.md` by default.
   - Only use `assets/project-conventions-stack.template.json` when the user says they need shared LoB layers or explicit merge ordering.
7. Load `../../../project-conventions-runtime/LAYERED-CONVENTIONS.md` only when the user has shared line-of-business conventions plus team overrides, or when you need to explain where a rule belongs.
8. Inspect the consumer repo for evidence before adding rules:
   - approved wrapper components
   - page shells or layout wrappers
   - migration shims
   - banned legacy choices
   - repo docs or ADRs that justify the rule
9. If the repo already has `.salt/team.json` or `.salt/stack.json`, validate the setup from the contract and file contents before editing. Do not assume a standalone `salt-project-conventions doctor` command is available in external consumer repos today.
   - If the environment is using the public CLI directly to bootstrap a simple repo, prefer `salt-ds init` before hand-editing the starter files.
10. Keep the file small and explicit. Prefer durable repo rules over speculative preferences, and do not add conventions that merely restate canonical Salt guidance.
11. If both line-of-business and team files exist, keep broader defaults in the LoB layer and team-only overrides in the repo layer. Prefer `.salt/team.json` as the default structure for new setups, and add `.salt/stack.json` only when layering is real.
12. Keep the boundary clear in the final output:

- canonical Salt guidance comes from Salt-owned canonical sources
- if MCP is unavailable, the environment may fall back to the Salt CLI underneath, but the consumer-facing workflow should stay the same
- line-of-business and team conventions are downstream refinements layered afterward
- runtime evidence is optional verification, not canonical policy
- when bootstrapping a new repo, pair `.salt/team.json` with a small repo instruction snippet instead of jumping straight to `.salt/stack.json`
- for simple repos with no existing repo instruction file, create or update `AGENTS.md` by default
- if the repo already uses `CLAUDE.md` or another repo-local instruction file, update that existing file instead of creating both

## Examples

- "Create a `.salt/team.json` file for this repo based on its approved wrappers and banned legacy components."
- "Bootstrap a simple Salt conventions setup for this repo, including `.salt/team.json` and the repo instruction snippet."
- "Review our existing `.salt/stack.json` setup and tell me whether the layering is justified."
- "Simplify this conventions file so it keeps only durable repo rules."

## Common Edge Cases

- If the repo has no evidence for a rule, do not invent one just to fill out the file.
- If `.salt/stack.json` exists but layering is not real, recommend collapsing back to `.salt/team.json`.
- If a proposed rule only repeats canonical Salt guidance, delete it or refuse to add it.
- If migration shims are temporary, keep them explicit and do not let them masquerade as permanent component policy.
- If the repo has no instruction snippet yet, generate one alongside `.salt/team.json` instead of assuming the agent will discover the file automatically.

## Output

Return a short conventions summary with the file path, layer scope, sections added or updated, the companion repo instruction file used or created, unresolved repo questions, and whether the result is ready for the default `.salt/team.json` path or only for a future layered runtime path.
