# StatusIndicator

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/status-indicator
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/status-indicator/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/status-indicator/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/status-indicator/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-status-indicator--default

## When to use

- You need to show a compact semantic status icon (`info`, `success`, `warning`, `error`).
- You are composing custom UI that cannot use a higher-level status component directly.
- You pair the icon with nearby status text, or provide an explicit accessible name.

## When not to use

- When a higher-level Salt component already models status (for example Banner, Toast, Tooltip).
- As a standalone decorative icon unrelated to semantic status.
- As the only communication of status in critical flows (icon-only, no text or equivalent announcement).

## Accessibility intent

- `StatusIndicator` renders with `role="img"` and should have an accessible name.
- For meaningful, standalone usage, keep `aria-label` (defaults to `status`) or provide a clearer phrase when needed.
- For decorative usage next to equivalent visible text, set `aria-hidden="true"` to avoid duplicate announcements.
- Do not rely on color only; keep text labels/messages for important status communication.

## Decision trees

### When to use this component vs alternatives
- Use `StatusIndicator` for low-footprint status glyphs in custom compositions.
- Prefer `Banner`, `Toast`, or `Tooltip` when you also need structured status messaging and container behavior.

### When to use each variant/state
- `info`: neutral informational state.
- `success`: completion or valid state.
- `warning`: caution requiring user attention.
- `error`: failed or invalid state.

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] Required props provided with correct types
- [ ] Accessibility attributes properly configured
- [ ] Visual states meet design system standards

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/status-indicator
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/status-indicator/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/status-indicator/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/status-indicator/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-status-indicator--default

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./status-indicator.md`
- Required behavior and constraints can be satisfied using props/states documented in `./status-indicator.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./status-indicator.json` |
| **Props** | Include required props first; then apply optional props only when intent requires them |
| **Accessibility** | Apply `role`, keyboard, and ARIA guidance from `./status-indicator.json` |

### Validation
- [ ] Generated usage aligns with `./status-indicator.md` "When to use"
- [ ] Generated usage avoids `./status-indicator.md` "When not to use"
- [ ] Required props and value types match `./status-indicator.json`
- [ ] Accessibility requirements from `./status-indicator.json` are satisfied