# Collapsible

## Source of truth

- Core source: [Collapsible/CollapsiblePanel/CollapsibleTrigger source](https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/collapsible)
- Usage docs: [Collapsible usage guidance](https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/collapsible/usage.mdx)
- Examples docs: [Collapsible examples](https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/collapsible/examples.mdx)
- Accessibility docs: [Collapsible accessibility](https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/collapsible/accessibility.mdx)
- Storybook: [Collapsible default story](https://storybook.saltdesignsystem.com/?path=/story/core-collapsible--default)

## When to use

Use **Collapsible** when:
- You need to **hide/show a single section of content** with a toggle trigger
- Space is limited and you want to expand content **on demand**
- You want to provide a **disclosure pattern** (single expandable section) as opposed to grouped accordion sections

## When not to use

- **Instead of Accordion:** When you have multiple related sections that may need to expand together or show status across all sections, use [Accordion](../accordion) instead
- **For complex nested disclosure:** If you need hierarchical expandable groups, consider Accordion or tree-based components

## Accessibility intent

- Trigger must be an interactive control (typically a Button) wrapped by `CollapsibleTrigger`
- `CollapsibleTrigger` manages `aria-expanded` and `aria-controls` on the trigger element
- `CollapsiblePanel` applies `aria-hidden` and `hidden` when collapsed
- Keyboard must support Tab, Shift+Tab, and Enter/Space to toggle
- Collapsible is collapsed by default unless `open` or `defaultOpen` is set

## Architecture

**Collapsible** is a wrapper component with three sub-components:
- **Collapsible:** Container managing open/closed state
- **CollapsibleTrigger:** Wraps the button/trigger element; applies expanded/controls attributes
- **CollapsiblePanel:** Content container that shows/hides based on state; auto-manages aria-hidden

## States and control patterns

### State management
- **Uncontrolled (default):** Use `defaultOpen` for initial state; component manages open/closed internally
- **Controlled:** Use `open` prop + `onOpenChange` callback to manage state externally

### Initial state
- **Collapsed (default):** `defaultOpen={false}` (or omitted)
- **Expanded by default:** `defaultOpen={true}`

## Decision trees

```
Need to show/hide a single content section?
├─ Yes → Use Collapsible
└─ No → Use Accordion for multi-section disclosure

Need external state control?
├─ Yes → Use open + onOpenChange (controlled)
└─ No → Use defaultOpen for initial state only (uncontrolled)

Need semantic button behavior for disclosure?
├─ Yes → Wrap trigger element in CollapsibleTrigger
└─ No → Choose a different pattern (do not bypass trigger wrapper)
```

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] Trigger element (button/link) wrapped in CollapsibleTrigger
- [ ] Content wrapped in CollapsiblePanel
- [ ] Keyboard navigation works: Tab (focus), Enter/Space (toggle)
- [ ] ARIA attributes properly set: aria-expanded, aria-controls, aria-hidden
- [ ] Visual states meet design system standards

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/collapsible
- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/collapsible/Collapsible.tsx
- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/collapsible/CollapsiblePanel.tsx
- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/collapsible/CollapsibleTrigger.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/collapsible/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/collapsible/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/collapsible/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-collapsible--default
- https://storybook.saltdesignsystem.com/?path=/story/core-collapsible--accounts
- https://storybook.saltdesignsystem.com/?path=/story/core-collapsible--contact-details

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./collapsible.md`
- Required behavior and constraints can be satisfied using props/states documented in `./collapsible.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./collapsible.json` |
| **Structure** | Wrap trigger in CollapsibleTrigger; wrap content in CollapsiblePanel; children in root Collapsible |
| **State control** | Use `defaultOpen` for uncontrolled; use `open` + `onOpenChange` for controlled |
| **Props** | Include required props first; then apply optional props only when intent requires them |
| **Accessibility** | CollapsibleTrigger auto-applies aria-expanded/aria-controls; CollapsiblePanel auto-applies aria-hidden |

### Validation
- [ ] Generated usage aligns with `./collapsible.md` "When to use"
- [ ] Generated usage avoids `./collapsible.md` "When not to use"
- [ ] Required props and value types match `./collapsible.json`
- [ ] Keyboard interaction works: Tab (focus trigger), Enter/Space (toggle)
- [ ] Trigger element receives aria-expanded and aria-controls automatically
- [ ] Panel content is hidden when open=false (aria-hidden=true, hidden attribute)