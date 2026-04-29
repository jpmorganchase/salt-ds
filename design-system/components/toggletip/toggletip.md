# Toggletip

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/toggletip
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/toggletip/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/toggletip/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/toggletip/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-toggletip--default

## When to use

- To provide supplementary information for elements on a page that you can't add a Tooltip to, such as a section header.
- When supporting information should remain visible until explicitly dismissed.
- When additional context is useful but should not interrupt the user’s flow.

## When not to use

- For supplementary info on interactive elements (for example buttons); use `Tooltip`.
- For complex flows or critical actions that require immediate user response; use `Dialog`.
- When information is required to complete the task; render it directly on the page.

## Decision trees

### When to use this component vs alternatives
- Use `Toggletip` for click-activated, persistent supplemental info.
- Use `Tooltip` for brief hover/focus hints on interactive controls.
- Use `Dialog` for high-priority, interruptive interactions or complex workflows.

### When to use each variant/state
- Use closed state by default and open on explicit trigger interaction.
- Use controlled mode (`open` + `onOpenChange`) when app state must synchronize visibility.
- Choose `placement` to minimize obscuring nearby content (`top` default; `left/right/bottom` as needed).

### Content and placement decisions
- Keep panel content concise and scannable; avoid embedding long multi-step flows.
- For long unavoidable content, allow internal panel scroll and keep action targets reachable.
- Place trigger adjacent to the element/metric being explained.

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] Required props provided with correct types
- [ ] Accessibility attributes properly configured
- [ ] Keyboard navigation works as expected
- [ ] Trigger has meaningful accessible name (`aria-label` or `aria-labelledby`)
- [ ] Escape closes the panel and returns/keeps focus on trigger
- [ ] Trigger and described content are visually associated
- [ ] No auto-dismiss timer is used

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/toggletip
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/toggletip/Toggletip.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/toggletip/ToggletipTrigger.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/toggletip/ToggletipPanel.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/toggletip/ToggletipTrigger.css
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/toggletip/ToggletipPanel.css
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/toggletip/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/toggletip/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/toggletip/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-toggletip--default
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/toggletip/toggletip.stories.tsx
- https://storybook.saltdesignsystem.com/?path=/story/core-toggletip--left-placement
- https://storybook.saltdesignsystem.com/?path=/story/core-toggletip--top-placement
- https://storybook.saltdesignsystem.com/?path=/story/core-toggletip--bottom-placement
- https://storybook.saltdesignsystem.com/?path=/story/core-toggletip--right-placement
- https://storybook.saltdesignsystem.com/?path=/story/core-toggletip--long-content
- https://storybook.saltdesignsystem.com/?path=/story/core-toggletip--interactive-content
- https://storybook.saltdesignsystem.com/?path=/story/core-toggletip--with-metric
- SOURCE_GAP: Storybook ID `core-toggletip--placement` does not resolve

## Accessibility intent

- Ensure the toggletip's trigger button has a meaningful accessible name so screen reader users understand what it relates to.
- Use `aria-labelledby` patterns when visible labels exist so names stay synchronized with UI text.
- Keep Escape behavior and focus management predictable for keyboard users.

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./toggletip.md`
- Required behavior and constraints can be satisfied using props/states documented in `./toggletip.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./toggletip.json` |
| **Structure** | Compose as `Toggletip` + `ToggletipTrigger` + `ToggletipPanel` |
| **State model** | Prefer uncontrolled default; use controlled `open`/`onOpenChange` when external sync is required |
| **Placement** | Use the placement that obscures the least critical UI content |
| **Accessibility** | Apply `role`, keyboard, and ARIA guidance from `./toggletip.json` |

### Validation
- [ ] Generated usage aligns with `./toggletip.md` "When to use"
- [ ] Generated usage avoids `./toggletip.md` "When not to use"
- [ ] Required props and value types match `./toggletip.json`
- [ ] Accessibility requirements from `./toggletip.json` are satisfied