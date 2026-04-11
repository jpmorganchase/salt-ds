# output template

## translation checkpoint

- For non-Salt inputs, summarize the translated source regions first.
- Call out the grouped workstreams, direct swaps, pattern rewrites, manual review points, and any clarifying question that still blocks the structure.

## scaffold handoff

- State what to scaffold first from the translated plan.
- Name the grouped region or pattern the implementation should build around.
- If compact create output is not yet implementation-safe, list the `blocking_reasons` and the returned `next_step` before implementation.
- State what must be validated immediately after the first scaffold pass.
- If runtime validation is still needed and a runnable URL exists, note whether `salt-ds doctor` or `salt-ds review <file-or-dir> --url <url>` should be used as local evidence after the first scaffold pass.

## implementation plan

- Outline the shortest sensible path from structure choice to implementation.
- If provider or theme bootstrap matters, name the chosen path from `references/shared/theme.md` or state that the theme decision remains pending.
- If some regions are grounded and others are not, return a clearly-labeled partial scaffold only for the grounded regions.

## chosen Salt building blocks

- List the selected primitives, patterns, foundations, and tokens with a brief reason for each.
- Include the theme bootstrap only when it materially affects the scaffold or code handoff.

## assumptions

- Make the assumptions explicit when the input is incomplete or ambiguous.

## salt compliance checks

- State whether the task was treated as a Salt UI task and why.
- Summarize the required stages completed:
  - selection
  - safe-to-implement check
  - validation
- State the compact workflow fields you relied on first:
  - `workflow_status`
  - `safe_to_implement_exact_request`
  - `blocking_reasons`
  - `next_step`
  - `summary`
- List the Salt primitives, patterns, or foundations that were checked before settling on the solution.
- State whether the implementation uses a standard Salt option; if not, justify the custom composition briefly.
- Note the canonical Salt guidance source consulted when it materially affected the decision.
- If you needed `full` workflow output, note which deeper artifacts were inspected and why the compact contract was not sufficient on its own.
- If you named any Salt token, prop, or API explicitly, note that the exact name was verified against canonical Salt guidance.
- If provider or theme bootstrap was recommended, note whether repo policy and asset availability were confirmed, still pending, or explicitly overridden.
- State which source-level validation surface was used after the first scaffold pass:
  - `review_salt_ui`
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

## option exploration

Only include this section when the user explicitly asked for alternatives.

- Default to two Salt-valid directions.
- Exceed two only when the user explicitly asks for more.
- For each direction, say what stays invariant, what changes, and the main trade-off.
- End by recommending one default continuation path.
