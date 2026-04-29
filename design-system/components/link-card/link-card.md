# Link Card

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/link-card
- Core source: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/link-card/LinkCard.tsx
- Styles source: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/link-card/LinkCard.css
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-link-card--default
- E2E tests: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/__tests__/__e2e__/link-card/LinkCard.cy.tsx
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/card/index.mdx
- SOURCE_GAP:
  - https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/link-card/usage.mdx
  - https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/link-card/examples.mdx
  - https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/link-card/accessibility.mdx

## When to use

- To present a card-shaped summary that navigates to a detail destination when activated.
- To provide a strong visual entry point for related content areas in dashboards, launchpads, or discovery views.
- When the entire card region should behave as a single navigational anchor.

## When not to use

- For non-navigational actions (for example toggling state or submitting forms); use `Button` or `InteractableCard` patterns.
- When the card should be informational only and not clickable; use `Card`.
- When multiple nested interactive controls are required inside the same container; avoid anchor-wrapping interaction conflicts.

## Accessibility intent

- `LinkCard` is an anchor-based control, so keyboard interaction follows link semantics (Tab focus, Enter activate).
- Content inside the card should clearly communicate destination purpose as part of the accessible name/description.
- Keep link-card content readable and destination-specific before activation.

## Decision trees

### LinkCard vs alternatives
- Need full-card navigation to another destination? → Use `LinkCard`.
- Need non-interactive content container? → Use `Card`.
- Need selectable/toggle-like card behavior? → Use `InteractableCard` with optional grouping.

### Destination behavior
- Same-tab navigation expected? → Use default target behavior.
- New-tab requirement justified by workflow? → Use `target="_blank"` with secure `rel` for external links.

### Styling choices
- Need default surface? → Use `variant="primary"`.
- Need stronger contrast with surrounding surfaces? → Use `secondary` or `tertiary` variant.
- Need directional visual emphasis? → Apply `accent` (`top`, `right`, `bottom`, `left`).

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] Card destination (`href`) is explicit and valid
- [ ] Full-card click behavior is intentional (no conflicting nested interactive controls)
- [ ] Card copy clearly describes destination outcome
- [ ] Variant/accent choices are intentional and match visual hierarchy
- [ ] External navigation security attributes are applied when needed

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/link-card
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/link-card/LinkCard.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/link-card/LinkCard.css
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/link-card/link-card.stories.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/__tests__/__e2e__/link-card/LinkCard.cy.tsx
- https://storybook.saltdesignsystem.com/?path=/story/core-link-card--default
- https://storybook.saltdesignsystem.com/?path=/story/core-link-card--accent-placement
- https://storybook.saltdesignsystem.com/?path=/story/core-link-card--variant

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./link-card.md`
- Required behavior and constraints can be satisfied using props/states documented in `./link-card.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./link-card.json` |
| **Navigation intent** | Use `LinkCard` only when the card itself is a navigation destination |
| **Destination** | Always provide `href`; apply `target`/`rel` only when justified |
| **Content** | Include concise heading/body copy that makes destination clear before click |
| **Interaction model** | Avoid nested interactive controls inside `LinkCard` |
| **Styling** | Use `variant` and optional `accent` for hierarchy, not for state semantics |
| **Accessibility** | Preserve anchor keyboard semantics and clear destination labeling |

### Validation
- [ ] Generated usage aligns with `./link-card.md` "When to use"
- [ ] Generated usage avoids `./link-card.md` "When not to use"
- [ ] Required props and value types match `./link-card.json`
- [ ] Accessibility requirements from `./link-card.json` are satisfied
