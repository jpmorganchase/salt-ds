# output template

## translation checkpoint

- For non-Salt inputs, summarize the translated source regions first.
- Call out the grouped workstreams, direct swaps, pattern rewrites, manual review points, and any clarifying question that still blocks the structure.

## scaffold handoff

- State what to scaffold first from the translated plan.
- Name the grouped region or pattern the implementation should build around.
- State what must be validated immediately after the first scaffold pass.
- If runtime validation is still needed and a runnable URL exists, note whether `salt-ds doctor` or `salt-ds review <file-or-dir> --url <url>` should be used as local evidence after the first scaffold pass.

## implementation plan

- Outline the shortest sensible path from structure choice to implementation.

## chosen Salt building blocks

- List the selected primitives, patterns, foundations, and tokens with a brief reason for each.

## assumptions

- Make the assumptions explicit when the input is incomplete or ambiguous.

## salt compliance checks

- State whether the task was treated as a Salt UI task and why.
- Summarize the required stages completed:
  - selection
  - entity grounding
  - validation
- List the Salt primitives, patterns, or foundations that were checked before settling on the solution.
- State whether the implementation uses a standard Salt option; if not, justify the custom composition briefly.
- Note the canonical Salt guidance source consulted when it materially affected the decision.
- State which source-level validation surface was used after the first scaffold pass:
  - `analyze_salt_code`
  - `salt-ds review`
  - or still pending
- Note whether project conventions or explicit repo guidance were checked for local wrappers, patterns, or conventions when the task depends on them.
- Note which token family checks were applied for custom styling, borders, or surfaces.
- If runtime evidence was used or recommended, note whether it came from browser-session inspection or a fetched-HTML fallback.

## starter code

```tsx
// Include starter code only when it materially helps the task move forward
// and follows the chosen Salt structure.
```
