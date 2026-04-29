# Scrim

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/scrim
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/scrim/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/scrim/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/scrim/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-scrim--default

## When to use

- To focus user attention on overlay content within a viewport or specific content area.
- In application windows, widgets, data visualizations, or panels where background interaction should be visually de-emphasized.
- When you need a backdrop that can optionally include child content (for example loading spinner).

## When not to use

- When users need to interact with underlying content simultaneously.

## Accessibility intent

- This component has no dedicated accessibility guidance.
- Treat Scrim as non-semantic visual layering; provide accessible interaction controls in foreground content.
- If scrim click dismisses content, ensure equivalent keyboard/assistive dismissal controls are available in associated UI.

## Decision trees

### Scrim usage and scope
- Need backdrop over full viewport → use `fixed={true}`
- Need backdrop constrained to local area → keep default `fixed={false}` and ensure parent has explicit positioning
- Need overlay hidden initially/toggled later → control with `open`
- Need focus indicator or loading context over backdrop → provide `children` (for example `Spinner`)

### Interaction patterns
- Clicking backdrop should close overlay state → add `onClick` handler
- Backdrop is purely visual and non-dismissible → omit `onClick`
- Underlying content must remain interactive → avoid Scrim and use a lighter non-blocking pattern

## Validation checklist

- [ ] `open` state is intentionally controlled and matches overlay lifecycle
- [ ] `fixed` value matches intended scope (viewport vs container)
- [ ] Parent container has explicit positioning when using container-bound scrim
- [ ] If dismiss-on-click is enabled, foreground UI also provides keyboard-accessible dismissal
- [ ] Storybook IDs validated: `core-scrim--default`, `--close-on-click`, `--with-spinner`, `--fixed`, `--covered-border`
- [ ] SOURCE_GAP noted: `core-scrim--with-child` story ID does not resolve (example exists in docs/site examples)

## Primary references

- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/scrim/Scrim.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/scrim/index.ts
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/stories/scrim/scrim.stories.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/site/src/examples/scrim/FillViewport.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/site/src/examples/scrim/FillContainer.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/site/src/examples/scrim/WithChild.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/scrim/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/scrim/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/scrim/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-scrim--default
- https://storybook.saltdesignsystem.com/?path=/story/core-scrim--close-on-click
- https://storybook.saltdesignsystem.com/?path=/story/core-scrim--with-spinner
- https://storybook.saltdesignsystem.com/?path=/story/core-scrim--fixed
- https://storybook.saltdesignsystem.com/?path=/story/core-scrim--covered-border
- https://storybook.saltdesignsystem.com/?path=/story/core-scrim--with-child

## AI generation rules (required)

### Select this component when
- You need a backdrop overlay to draw attention to foreground content.
- Interaction with background content should be visually suppressed.
- Overlay scope must be either viewport-wide or container-bound.

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use `import { Scrim } from "@salt-ds/core";` |
| **Visibility** | Control with `open`; when false, do not render fallback wrappers pretending to be scrim |
| **Scope** | Use `fixed={true}` for viewport overlays, otherwise rely on positioned parent container |
| **Children** | Add child content only when foreground cue is needed (e.g. spinner, close control) |
| **Dismiss pattern** | Use `onClick` only when backdrop-click dismissal is explicitly desired |
| **A11y pairing** | Pair dismissible overlays with keyboard-accessible foreground close action |

### Validation
- [ ] Generated usage aligns with `./scrim.md` "When to use"
- [ ] Generated usage avoids `./scrim.md` "When not to use"
- [ ] Required props and value types match `./scrim.json`
- [ ] Accessibility requirements from `./scrim.json` are satisfied