# Troubleshooting

This guide covers common consumer-side failures when using the Salt MCP, the `salt-ds` skill, and project conventions together.

For day-to-day usage guidance, see [`getting-good-results.md`](./getting-good-results.md).

## The Agent Picked The Wrong Workflow

Symptoms:

- the agent returns a broad answer when you wanted code analysis
- the agent gives starter code when you wanted migration impact
- the agent answers from memory instead of using the MCP

What to do:

- say exactly what job you want: review, migration, recommendation, lookup, or translation
- name the Salt tool or workflow explicitly when the distinction matters
- provide the code or file path if you want `analyze_salt_code`
- remember that the user-facing workflow names stay `create`, `review`, `migrate`, and `upgrade`, with `review --url` covering the runtime-evidence extension of review, even when MCP uses more specific underlying tools

Example:

```text
Use analyze_salt_code on this file and focus on deprecated APIs, token usage, and layout wrappers.
```

## The Result Is Too Broad Or Noisy

Symptoms:

- the answer drifts into unrelated patterns
- the review covers too much of the repo
- translation output feels generic

What to do:

- reduce the scope to one file, one region, or one task
- add package, version, or interaction constraints
- split review and migration into separate requests when both are large

Prefer:

```text
Review this toolbar only.
```

over:

```text
Review the whole page and suggest every improvement.
```

## The Answer Ignored Repo Wrappers Or Local Rules

Symptoms:

- the canonical Salt answer is correct, but not the repo-approved final answer
- wrappers, shells, or migration shims were ignored

What to do:

- check whether the MCP response recommended a project conventions check
- treat repo facts and repo policy separately:
  - use detected context for framework, runtime targets, imports, and repo instructions
  - use `.salt/team.json` or `.salt/stack.json` for declared policy
- load `.salt/team.json` first
- use `.salt/stack.json` only when the repo truly has layered conventions

Do not push repo-local rules into the canonical Salt step.

## Migration Guidance Still Leaves Issues In The Code

Symptoms:

- deprecated usage remains after the migration pass
- CSS overrides or selector hacks are still present
- compatibility shims hide whether the migration is actually complete

What to do:

- run `analyze_salt_code` on the migrated result, not just the original code
- separate required migration fixes from optional cleanup
- call out leftover CSS overrides explicitly and decide whether to remove or retain them

If the migration still depends on a shim, explain why the canonical Salt replacement is not enough yet.

## The Consumer Install Story Is Unclear

Symptoms:

- consumers try to install `salt-ds` from a guessed GitHub subtree
- docs drift between local-path and published-path instructions

What to do:

- use the documented source in [`skills-install-source.md`](./skills-install-source.md)
- validate any future replacement source with `npx skills add <source> --list` before documenting it

Do not replace the documented path with a guessed install path.

## MCP Is Unavailable Or Not The Best Fit

Symptoms:

- the environment cannot use MCP tools directly
- the workflow is shell-first or CI-first
- you still need canonical Salt lookup without using the MCP transport

What to do:

- keep the same workflow model and the same `salt-ds` skill when possible
- let the environment fall back to the Salt CLI underneath
- start the CLI path from `salt-ds info --json`
- use `salt-ds init` first if the repo is missing `.salt/team.json` and repo instructions
- keep the public CLI workflow-first through `salt-ds create`, `salt-ds review`, `salt-ds migrate`, and `salt-ds upgrade`
- use `salt-ds review --url <url>` when source validation and runtime evidence should stay in one workflow pass
- do not add a second manual command vocabulary when MCP is blocked; stay on the same `salt-ds` workflow commands
- keep `salt-ds doctor` and `salt-ds runtime inspect <url>` for runtime evidence only, not for canonical component or pattern choice
- if you later regain MCP access, prefer the MCP again for structured canonical reasoning

## Source-Level Guidance Is Not Enough

Symptoms:

- the code looks correct, but runtime behavior is still uncertain
- layout, focus flow, or rendered semantics need runtime confirmation

What to do now:

- start with source-level reasoning first
- use cheap URL fetch or fetched HTML when title, status, coarse structure, or obvious landmarks are enough
- if the Salt CLI is available, run `salt-ds doctor` first when the runtime target is unclear
- if a runnable URL exists and you want to keep source validation and runtime evidence together, run `salt-ds review <path> --url <url>`
- if the task is explicitly evidence-only debugging or support work, run `salt-ds runtime inspect <url>` for local runtime evidence about title, landmarks, roles, structure, screenshots, and runtime errors
- use Storybook, app-level inspection, browser devtools, or manual testing alongside the Salt guidance when the issue depends on client-side execution, focus behavior, or screenshots
- keep runtime findings separate from canonical Salt guidance

Recommended decision flow:

1. Run `salt-ds doctor` when you do not yet know whether Storybook or the app runtime is reachable.
2. If `salt-ds doctor` shows a usable target and you want the full workflow pass, run `salt-ds review <path> --url <url>`.
3. If the job is explicitly runtime debugging or support-only, run `salt-ds runtime inspect <url>` on that target instead.
4. If runtime evidence returns `browser-session`, use the screenshots, console/page errors, hydrated title, and rendered accessibility output as stronger local evidence.
5. If runtime evidence returns `fetched-html`, keep conclusions narrower:
   - structure looks plausible
   - landmarks or accessible names may still be useful
   - client-side behavior, hydration, and runtime error claims still need browser-session evidence or manual testing
6. Feed runtime findings back into the Salt workflow as evidence, not as a replacement for canonical Salt guidance.

Support-oriented examples:

```sh
salt-ds doctor . --check-detected-targets --bundle
salt-ds doctor . --storybook-url http://127.0.0.1:6006/ --json
salt-ds runtime inspect http://127.0.0.1:6006/?path=/story/example --json --output .salt-support/runtime-report.json
```

Current limitation:

- `salt-ds runtime inspect <url>` now prefers browser-session inspection and falls back to fetched-HTML mode when browser-session inspection is unavailable
- if the result falls back to `fetched-html`, treat it as initial rendered-structure evidence rather than a full replacement for browser-session testing
