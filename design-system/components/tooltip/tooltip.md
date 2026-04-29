# Tooltip

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/tooltip
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/tooltip/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/tooltip/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/tooltip/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-tooltip--default

## When to use

- When you need a brief, supplementary message about an interactive UI element.
- When contextual help should appear on hover/focus without taking users away from current flow.
- When the message can remain short, concise, and non-essential.

## When not to use

- When content includes interactive elements (links, inputs, buttons) — use Overlay or Dialog instead.
- When information is required to complete a task — show it persistently on the page.
- When message must always be visible — place content inline or use Banner/Overlay/Dialog.
- When message is not tied to an interactive UI element — avoid orphaned tooltip notes.

## Decision trees

### Tooltip vs alternatives
- Use `Tooltip` for short, non-essential guidance on an interactive UI element.
- Use `Overlay` or `Dialog` when content includes interaction or flows.
- Use inline/persistent content when information is required for task completion.
- Use `Banner`, `Overlay`, or `Dialog` when message is not tied to an interactive element.

### Variant and behavior decisions
- Use default tooltip for standard help text.
- Use `status` (`info`, `warning`, `error`, `success`) when semantic emphasis is required.
- Use `hideArrow` when arrow visuals are undesirable.
- Use `hideIcon` for text-only tooltip variants.
- Use `placement` to reduce content obstruction and allow flip/shift behavior when constrained.
- Use controlled mode (`open`, `onOpenChange`) only when external state must govern visibility.

### Timing decisions
- Keep default `enterDelay={300}` for balanced discoverability.
- Use `leaveDelay={0}` for immediate close behavior unless product UX requires persistence.
- Avoid timeout-driven auto-dismiss patterns for accessible comprehension.

## Validation checklist

- [ ] Trigger element is interactive/focusable
- [ ] Content is brief and supplementary
- [ ] Content is not required for task completion
- [ ] No interactive controls inside tooltip content
- [ ] `content` prop provided and meaningful
- [ ] Placement chosen to avoid clipping/obstruction
- [ ] `status` used only when semantic emphasis is needed
- [ ] `hideArrow`/`hideIcon` used intentionally
- [ ] Keyboard behavior verified (`Tab`, `Escape`)
- [ ] Screen reader announcement verified through `aria-describedby`

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/tooltip
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/tooltip/Tooltip.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/tooltip/Tooltip.css
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/tooltip/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/tooltip/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/tooltip/accessibility.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/tooltip/tooltip.stories.tsx
- https://storybook.saltdesignsystem.com/?path=/story/core-tooltip--default
- https://storybook.saltdesignsystem.com/?path=/story/core-tooltip--open
- https://storybook.saltdesignsystem.com/?path=/story/core-tooltip--status
- https://storybook.saltdesignsystem.com/?path=/story/core-tooltip--without-arrow
- https://storybook.saltdesignsystem.com/?path=/story/core-tooltip--without-icon
- https://storybook.saltdesignsystem.com/?path=/story/core-tooltip--flip-and-shift-tooltip
- https://storybook.saltdesignsystem.com/?path=/story/core-tooltip--custom-content
- https://storybook.saltdesignsystem.com/?path=/story/core-tooltip--placement
- https://storybook.saltdesignsystem.com/?path=/story/core-tooltip--delay

## Accessibility intent

- Keep tooltips non-interactive because focus remains on the trigger.
- Ensure tooltip trigger has meaningful, contextual association.
- Minimize tooltip usage and avoid orphaned tips on non-interactive anchors.
- Do not rely on standard tooltip behavior for touch-only devices outside supported form-field patterns.

## AI generation rules (required)

### Select this component when

- Intent is supplemental guidance for an interactive UI element.
- Message is short and non-critical.
- Hover/focus disclosure is acceptable.
- Not suitable for interactive or persistent content.

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use `import { Tooltip } from "@salt-ds/core";` |
| **Required** | Always include `content` and a single trigger child |
| **Defaults** | Use default `placement="right"`, `enterDelay=300`, `leaveDelay=0` unless intent requires change |
| **Status** | Apply `status` only when semantic signaling is needed |
| **Visibility** | Use controlled `open` + `onOpenChange` only when external logic must control state |
| **A11y** | Ensure trigger is keyboard-focusable and tooltip remains non-focusable |
| **Alternatives** | Switch to Overlay/Dialog/Banner for interactive, persistent, or critical content |

### Validation

- [ ] Generated usage aligns with `./tooltip.md` "When to use"
- [ ] Generated usage avoids `./tooltip.md` "When not to use"
- [ ] Required props and value types match `./tooltip.json`
- [ ] Accessibility requirements from `./tooltip.json` are satisfied
