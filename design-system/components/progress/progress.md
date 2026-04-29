# Progress

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/progress
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/progress/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/progress/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/progress/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-progress-circular--default
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-progress-linear--default

## When to use

- When remaining duration can be reasonably determined for an operation.
- To provide users a visual indication of operation completion status.
- When an operation takes more than one second and users need reassurance that work is progressing.

## When not to use

- When completion time is indeterminate; use `Spinner` instead.
- To indicate content loading during navigation; use `Spinner` instead.

## Accessibility intent

- Progress indicators expose `role="progressbar"` with min/max semantics.
- Provide contextual `aria-label` text that explains what is loading (for example “loading settings panel 0%”).
- Linear indeterminate mode omits `aria-valuenow`; determinate modes announce it.
- Hide the visible percentage label (`hideLabel`) only when surrounding context already communicates progress clearly.

## Decision trees

### Progress vs Spinner
- Completion can be measured or estimated (determinate or buffered) → use `CircularProgress` or `LinearProgress`
- Completion cannot be estimated yet → use `Spinner`
- Navigation-level loading affordance needed → use `Spinner`

### Circular vs Linear and state selection
- Compact areas or radial visuals fit best → `CircularProgress`
- Horizontal inline/status bars fit best → `LinearProgress`
- Known value between `min` and `max` → determinate (`value`)
- Pending amount should also be shown → add `bufferValue`
- Only linear, unknown current value → indeterminate linear (`value` and `bufferValue` undefined)

## Validation checklist

- [ ] Variant choice (circular vs linear) matches layout/context
- [ ] `value`, `min`, and `max` use a coherent numeric range
- [ ] `bufferValue` is used only when pending state should be shown
- [ ] `aria-label` describes what is loading
- [ ] `hideLabel` is intentional and does not remove critical user context
- [ ] Storybook IDs validated: `core-progress-circular--default`, `--hide-label`, `--with-buffer`, `--max-value`
- [ ] Storybook IDs validated: `core-progress-linear--default`, `--with-buffer`, `--indeterminate`, `--progressing-value`
- [ ] SOURCE_GAP noted: legacy `core-progress--default` story ID does not resolve

## Primary references

- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/progress/CircularProgress/CircularProgress.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/progress/LinearProgress/LinearProgress.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/progress/index.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/stories/progress/circular-progress.stories.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/stories/progress/linear-progress.stories.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/progress/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/progress/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/progress/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-progress-circular--default
- https://storybook.saltdesignsystem.com/?path=/story/core-progress-linear--default
- https://storybook.saltdesignsystem.com/?path=/story/core-progress--default

## AI generation rules (required)

### Select this component when
- The UI must communicate measurable completion state for an operation.
- A determinate or buffered progress pattern is preferred over generic loading animation.
- Circular/linear geometry is chosen intentionally based on available space.

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use `import { CircularProgress, LinearProgress } from "@salt-ds/core";` |
| **Variant** | Prefer `LinearProgress` for inline bars and status rows; use `CircularProgress` for compact/radial contexts |
| **Determinate** | Set `value` (and optionally `min`/`max`) when progress is known |
| **Indeterminate** | For linear indeterminate, omit both `value` and `bufferValue` |
| **Buffer** | Add `bufferValue` only when pending work should be visualized separately from completed work |
| **A11y label** | Always provide a contextual `aria-label` describing the operation |

### Validation
- [ ] Generated usage aligns with `./progress.md` "When to use"
- [ ] Generated usage avoids `./progress.md` "When not to use"
- [ ] Required props and value types match `./progress.json`
- [ ] Accessibility requirements from `./progress.json` are satisfied