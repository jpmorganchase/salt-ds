# Degraded Tooling

Use this file whenever Salt MCP or the Salt CLI is missing, noisy, partial, truncated, semantically off-target, or otherwise unreliable.

## Fail-Closed Rule

Do not treat ambiguous transport output as completed canonical Salt guidance.
When the transport is ambiguous, preserve the useful signal, state the blocker, and stop before guessed implementation.

## Hard Stop Budget

After **2** noisy, conflicting, or off-target follow-up attempts for the **same** required sub-surface or entity, stop immediately and report the blocker. Do not attempt a third call.

Count any of the following as one attempt against this budget:

- a call that returns a non-matching `decision.name` or a misrouted pattern
- a call that returns truncated output missing the required contract fields
- a call that produces a parse failure or malformed payload
- a call that returns `status != "success"` without actionable partial guidance

When the budget is exhausted:

- report exactly which entity or sub-surface was blocked
- state what was attempted and what the transport returned
- keep any grounded regions from earlier steps intact
- mark the blocked region as pending instead of guessing its structure
- suggest the next unblocking step (e.g., try MCP, check Salt docs, or ask the user)

## Common Cases

### MCP unavailable

- Say MCP is unavailable.
- Switch to the CLI equivalent for the same workflow.
- Do not act as if the canonical step already succeeded.

### Non-zero exit with useful output

- Treat the result as **partial**.
- Summarize what was learned.
- List the unresolved blockers or missing follow-through items.
- Continue only with inspection or clarification.
- Do not move into final implementation yet, and do not treat starter-code creation as completion while status remains partial or blocked.

### Misrouted or semantically off-target results

- A result that resolves to the wrong pattern, wrong surface, or wrong scope does not complete the canonical step.
- Re-query the exact required noun or exact returned Salt target name.
- If the same required item misroutes twice, the hard stop budget is exhausted — stop and report transport ambiguity. Do not attempt a third call.

### Truncated or malformed payloads

- If required follow-through may be hidden in the missing portion, stop.
- Do not guess the missing contract.
- Do not summarize a partial payload as complete.
- Each truncated or malformed result counts as one attempt against the hard stop budget.

## Multi-Region Safety Rule

For dashboards, pages, overviews, navigation shells, large forms, and other multi-region work:

- one valid anchor does not resolve the whole surface
- do not implement unresolved essential regions from generic React/CSS knowledge alone
- if some regions are grounded and one essential region is not, either stop or return a clearly-labeled partial scaffold with the unresolved region marked pending

## Bounded Partial Scaffold Rule

If the user explicitly wants a starting point despite unresolved Salt guidance, you may return a bounded partial scaffold only when:

- the grounded regions are clearly separated from the unresolved ones
- unresolved regions are marked pending instead of improvised
- the explanation states exactly what canonical Salt follow-through is still missing
- the result is framed as provisional, not as completed Salt guidance

## Reporting Pattern

When blocked, say:

- what transport was attempted
- what succeeded
- what remained unresolved
- what exact next step would unblock the work

Good phrasing:

- `Salt MCP was unavailable, so I switched to the CLI fallback.`
- `The CLI returned useful guidance but exited non-zero, so I treated it as partial and did not implement yet.`
- `The create follow-up for Header block misrouted twice, so I stopped instead of guessing that region.`
- `The payload was truncated before the completion contract, so I could not safely treat the canonical step as complete.`
- `I can return a bounded partial scaffold for the grounded regions, but the chart region is still pending canonical Salt follow-through.`

## Quick-Check Under Degraded Tooling

If the user asked for a quick-check and the transport is degraded:

- you may return bounded provisional observations
- keep them narrow and action-oriented
- separate grounded findings from likely-but-unverified concerns
- say explicitly when a deep review is the safer next step
