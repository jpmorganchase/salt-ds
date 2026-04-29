# Panel

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/panel
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/panel/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/panel/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/panel/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-panel--primary

## When to use

- To organize and divide the application into clear content areas.
- To create visual hierarchy within the application layout.
- With `BorderLayout` to define main content regions with responsive behavior.
- To color-block importance using `primary`, `secondary`, and `tertiary` variants.

## When not to use

- SOURCE_GAP: Upstream `usage.mdx` does not include an explicit "When not to use" section for Panel.
- Use `Card` when content requires grouped action affordances or richer content framing.
- Use `InteractableCard` or `LinkCard` for selectable or navigable card surfaces.

## Accessibility intent

- SOURCE_GAP: Upstream `accessibility.mdx` states "This component has no accessibility guidance."
- `Panel` is a non-interactive container by default; it has no required keyboard interactions.
- If used as a meaningful page region, add semantic roles/labels (for example `role="region"` with `aria-label` or `aria-labelledby`).
- Ensure interactive children within a panel follow their own accessibility requirements.

## Decision trees

### Panel vs Card-family
- Need non-interactive layout/background surface only → use `Panel`
- Need grouped, framed content treatment with card patterns → use `Card`
- Need selectable item behavior → use `InteractableCard`
- Need whole-surface navigation → use `LinkCard`

### Variant selection
- Main content area needing strongest visual priority → `variant="primary"`
- Supporting/adjacent content area → `variant="secondary"`
- Additional color-blocked region beyond secondary contrast → `variant="tertiary"`

## Validation checklist

- [ ] Panel is used for layout/content segmentation, not interaction behavior
- [ ] Variant choice reflects intended hierarchy (`primary` / `secondary` / `tertiary`)
- [ ] Any interactive behavior is implemented in child components, not Panel root
- [ ] Region semantics are added when panel represents a named landmark area
- [ ] Usage aligns with BorderLayout/GridLayout composition patterns
- [ ] Storybook examples validated: `primary`, `secondary`, `tertiary`, `fixed-height-and-width`, `panel-in-grid-layout`
- [ ] SOURCE_GAP noted: `core-panel--default` story is not available

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/panel
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/panel/Panel.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/panel/usage.mdx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/site/docs/components/panel/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/panel/examples.mdx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/site/docs/components/panel/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/panel/accessibility.mdx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/site/docs/components/panel/accessibility.mdx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/stories/panel/panel.stories.tsx
- https://storybook.saltdesignsystem.com/?path=/story/core-panel--primary
- https://storybook.saltdesignsystem.com/?path=/story/core-panel--secondary
- https://storybook.saltdesignsystem.com/?path=/story/core-panel--tertiary
- https://storybook.saltdesignsystem.com/?path=/story/core-panel--fixed-height-and-width
- https://storybook.saltdesignsystem.com/?path=/story/core-panel--panel-in-grid-layout
- https://storybook.saltdesignsystem.com/?path=/story/core-panel--default

## AI generation rules (required)

### Select this component when

- Intent is to divide or organize content regions with background hierarchy.
- Interaction is not required on the panel container itself.
- A layout surface is needed for BorderLayout/GridLayout composition.

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use `import { Panel } from "@salt-ds/core";` |
| **Variant default** | Use `variant="primary"` unless hierarchy requires `secondary` or `tertiary` |
| **Composition** | Place panel inside layout primitives (`BorderLayout`, `GridLayout`, `StackLayout`) |
| **Interaction boundary** | Keep panel non-interactive; place buttons/links/inputs inside panel children |
| **Semantics** | Add region labeling only when panel acts as a named landmark section |

### Validation

- [ ] Generated usage aligns with `./panel.md` "When to use"
- [ ] Generated usage avoids `./panel.md` "When not to use"
- [ ] Required props and value types match `./panel.json`
- [ ] Accessibility requirements from `./panel.json` are satisfied
