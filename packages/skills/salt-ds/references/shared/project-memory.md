# Project Memory

Use this file when repeated repo-local decisions, accepted deviations, or host/tool constraints would otherwise create repeated friction.

## What Counts As Project Memory

Prefer existing durable sources first:

- `.salt/team.json`
- `.salt/stack.json`
- repo instruction files such as `AGENTS.md`
- ADRs, architecture notes, or repo docs
- an optional working agreement created from `assets/salt-working-agreement.template.md`

Project memory is downstream context.
It helps the agent avoid re-arguing settled repo decisions.
It is not canonical Salt guidance.

## Good Uses

Capture durable decisions such as:

- approved wrappers and when to use them
- accepted deviations from canonical Salt guidance and why they are intentional
- host/tool constraints such as `MCP unavailable in IntelliJ`, `CLI output noisy on Windows`, or `runtime URL unavailable in CI`
- preferred validation habits such as `always run review after create` or `doctor only when source validation stays ambiguous`
- known migration debt or temporary shims that the team already understands
- explicit non-goals such as `mobile not in scope yet` or `legacy provider retained until platform migration completes`

## Bad Uses

Do not use project memory for:

- temporary session chatter
- generic TODO lists
- guesses about canonical Salt behavior
- one-off implementation details that do not change future agent choices
- broad style opinions that conflict with repo policy or canonical Salt guidance

## Reading Rule

When project memory exists:

- respect acknowledged exceptions instead of nagging repeatedly
- say briefly when a finding is already known or intentionally accepted
- keep the canonical Salt answer visible when project memory changes the final recommendation

When project memory is missing:

- do not block work
- continue with canonical Salt guidance and declared repo policy
- suggest creating a small working agreement only if the same decisions keep recurring

## Writing Rule

If the user wants recurring decisions documented, keep the file short.
Prefer a small working agreement over a large narrative.
Store only decisions that materially change future Salt guidance.
