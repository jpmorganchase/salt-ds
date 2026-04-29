# Toast

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/toast
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/toast/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/toast/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/toast/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-toast--default

## When to use

- To notify users of an event that’s occurred in a peripheral application or workflow. The user should notice the toasts without disrupting their experience or requiring immediate action.
- To communicate low-priority information caused by events, typically without requiring user feedback.
- To communicate workflow updates that are external to the user’s current task/view.
- To present persistent system-generated alerts that still allow dismissal or optional action.

## When not to use

- To show notifications that apply directly to the current task area; use `Banner` instead.
- When an immediate, task-blocking decision is required; use `Dialog` instead.

## Decision trees

### When to use this component vs alternatives
- Use `Toast` for peripheral, non-blocking, app-level notification.
- Use `Banner` for notifications tied to current page/section content.
- Use `Dialog` when the user must respond immediately before continuing.

### When to use each variant/state
- Use default toast for neutral informational updates.
- Use `status="info"` for informational emphasis.
- Use `status="error"` for critical issues/failures.
- Use `status="warning"` for potential issues requiring attention.
- Use `status="success"` for successful completion feedback.

### Positioning and stacking decisions
- Position toasts away from primary navigation/content (for example lower-right viewport region).
- If stacking from top, place newest toast first.
- If stacking from bottom, place newest toast last (bottom-most).
- Keep messages concise due to limited surface area.

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] Status choice (`info/error/warning/success`) matches message intent
- [ ] Interactive controls (dismiss/action buttons) have accessible labels
- [ ] Focus order is valid for all focusable elements within the toast
- [ ] Positioning and stacking do not obscure critical interface controls

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/toast
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/toast/Toast.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/toast/Toast.css
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/toast/ToastContent.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/toast/ToastContent.css
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/toast/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/toast/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/toast/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-toast--default
- https://storybook.saltdesignsystem.com/?path=/story/core-toast--info
- https://storybook.saltdesignsystem.com/?path=/story/core-toast--error
- https://storybook.saltdesignsystem.com/?path=/story/core-toast--warning
- https://storybook.saltdesignsystem.com/?path=/story/core-toast--success
- https://storybook.saltdesignsystem.com/?path=/story/core-toast--single-line
- https://storybook.saltdesignsystem.com/?path=/story/core-toast--custom-icon

## Accessibility intent

- You must check and test any focusable elements inside the toast content accordingly.

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./toast.md`
- Required behavior and constraints can be satisfied using props/states documented in `./toast.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./toast.json` |
| **Structure** | Compose with `Toast` + `ToastContent`; add action/dismiss controls only when needed |
| **Status** | Default to neutral toast unless status semantics are explicitly required |
| **Positioning** | Place in a non-disruptive viewport area and stack chronologically |
| **Accessibility** | Apply `role`, keyboard, and ARIA guidance from `./toast.json` |

### Validation
- [ ] Generated usage aligns with `./toast.md` "When to use"
- [ ] Generated usage avoids `./toast.md` "When not to use"
- [ ] Required props and value types match `./toast.json`
- [ ] Accessibility requirements from `./toast.json` are satisfied